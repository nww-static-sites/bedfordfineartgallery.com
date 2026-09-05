#!/usr/bin/env python3
"""Offline fault/scale/compiler fixtures. Never constructs a live AWS client."""
from collections import Counter
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import threading
import unittest
from botocore.exceptions import ClientError, ReadTimeoutError
from bedford_routing_store import RoutingStore, STORES, STORE_LIMIT, canonical, validate_document


def fail(code):
    return ClientError({'Error': {'Code': code, 'Message': 'fixture'}}, 'fixture')


def document(release=1, rules=None):
    rules = rules if rules is not None else [('/old', '/new'), ('/Case/', 'https://example.org/a?x=1')]
    values = sorted([dict(source=s, location=d, status=301) for s,d in rules], key=lambda r:r['source'].encode())
    digest = hashlib.sha256(canonical(dict(behaviorVersion='bedford-edge-v1',rules=values,schemaVersion=2)).encode()).hexdigest()
    return dict(schemaVersion=2,releaseSha=f'{release:040x}',digest=digest,routeSetHash=digest,
        behaviorVersion='bedford-edge-v1',records=[dict(key='r2:'+digest+':'+r['source'],value=canonical(dict(location=r['location'],status=301))) for r in values])


class FakeStore:
    def __init__(self):
        self.rows={}; self.revision=1; self.writes=[]; self.calls=Counter(); self.lock=threading.RLock()
        self.before_update=None; self.after_update=None; self.read_fault=None; self.extra_size=0
    def describe_key_value_store(self, **kwargs):
        with self.lock:
            self.calls['describe']+=1
            return dict(ETag=str(self.revision),TotalSizeInBytes=self.extra_size+sum(len(k.encode())+len(v.encode()) for k,v in self.rows.items()))
    def get_key(self, Key, **kwargs):
        with self.lock:
            self.calls['get']+=1
            if self.read_fault:self.read_fault(Key)
            if Key not in self.rows:raise fail('ResourceNotFoundException')
            return dict(Value=self.rows[Key])
    def update_keys(self, IfMatch, Puts, **kwargs):
        with self.lock:
            self.calls['update']+=1
            if self.before_update:self.before_update(self, Puts)
            if IfMatch!=str(self.revision):raise fail('ConflictException')
            assert 0<len(Puts)<=50
            self.rows.update({r['Key']:r['Value'] for r in Puts});self.revision+=1
            self.writes.append(Puts)
            if self.after_update:self.after_update(self, Puts)
            return dict(ETag=str(self.revision))
    def list_keys(self, **kwargs):
        raise AssertionError('A historical scan was attempted')


class RoutingTests(unittest.TestCase):
    def setUp(self):
        self.fake=FakeStore();self.store=RoutingStore(sorted(STORES)[0],client=self.fake,sleeper=lambda _:None)
    def test_100_publications_constant_work_despite_legacy_history(self):
        self.fake.rows.update({f'r:legacy:{n}':'legacy-preserved' for n in range(9000)})
        original=dict(self.fake.rows)
        first=self.store.seed(document())
        self.assertEqual(first['routeRowsWritten'],2)
        previous=''; calls=[]
        for n in range(1,101):
            result=self.store.seed(document(n))
            if n>1:
                self.assertTrue(result['reused']);self.assertEqual(result['routeRowsWritten'],0)
                calls.append(result['calls'])
            self.store.activate(f'{n:040x}',previous);previous=f'{n:040x}'
        self.assertTrue(all(c==calls[0] for c in calls))
        self.assertEqual(len([k for k in self.fake.rows if k.startswith('r2:')]),2)
        self.assertEqual(len([k for k in self.fake.rows if k.startswith('@config:')]),100)
        self.assertTrue(all(self.fake.rows[k]==v for k,v in original.items()))
        print('scale_fixture publications=100 unchanged_route_writes=0 history_scans=0 steady_seed_calls='+json.dumps(calls[0],sort_keys=True))
    def test_changed_added_removed_routes_have_distinct_immutable_tables(self):
        docs=[document(),document(2,[('/old','/changed')]),document(3,[('/new','/destination')]),document(4,[])]
        hashes=[];last=''
        for doc in docs:
            before=dict(self.fake.rows);result=self.store.seed(doc);hashes.append(result['routeSetHash'])
            self.store.activate(doc['releaseSha'],last);last=doc['releaseSha']
            self.assertTrue(all(self.fake.rows[k]==v for k,v in before.items() if k!='@active'))
        self.assertEqual(len(set(hashes)),4)
    def test_crash_partial_namespace_resumes_but_cannot_activate_early(self):
        doc=document(rules=[(f'/a{i}',f'/b{i}') for i in range(121)])
        def crash(client,puts):
            client.after_update=None
            raise RuntimeError('simulated process crash')
        self.fake.after_update=crash
        with self.assertRaises(RuntimeError):self.store.seed(doc)
        self.assertEqual(len(self.fake.rows),50)
        with self.assertRaises(RuntimeError):self.store.activate(doc['releaseSha'],'')
        result=self.store.seed(doc)
        self.assertEqual(result['routeRowsWritten'],71)
        self.store.activate(doc['releaseSha'],'')
        marker_index=next(i for i,ps in enumerate(self.fake.writes) if ps[0]['Key'].startswith('@routes-ready:'))
        self.assertTrue(all(not r['Key'].startswith('r2:') for ps in self.fake.writes[marker_index:] for r in ps))
    def test_corrupt_ready_marker_or_immutable_row_stops(self):
        doc=document();self.fake.rows['@routes-ready:'+doc['digest']]='{}'
        with self.assertRaises(RuntimeError):self.store.seed(doc)
        self.fake.rows.clear();self.fake.rows[doc['records'][0]['key']]='bad'
        with self.assertRaises(RuntimeError):self.store.seed(doc)
        self.assertNotIn('@config:'+doc['releaseSha'],self.fake.rows)
    def test_failed_read_does_not_mean_empty_store(self):
        self.fake.read_fault=lambda key: (_ for _ in ()).throw(fail('AccessDeniedException'))
        with self.assertRaises(ClientError):self.store.seed(document())
        self.assertEqual(self.fake.writes,[])
    def test_readback_corruption_does_not_write_ready(self):
        doc=document()
        def corrupt(client,puts):
            client.after_update=None;client.rows[puts[0]['Key']]='corrupt'
        self.fake.after_update=corrupt
        with self.assertRaises(RuntimeError):self.store.seed(doc)
        self.assertNotIn('@routes-ready:'+doc['digest'],self.fake.rows)
    def test_preview_readiness_cannot_stand_in_for_production(self):
        doc=document();self.store.seed(doc)
        other=RoutingStore(sorted(STORES)[1],client=FakeStore(),sleeper=lambda _:None)
        with self.assertRaises(RuntimeError):other.activate(doc['releaseSha'],'')
    def test_activation_rechecks_expected_pointer_after_conflict(self):
        doc=document();self.store.seed(doc);self.fake.rows['@active']='a'*40
        def rollback(client,puts):
            client.before_update=None;client.rows['@active']='b'*40;client.revision+=1
        self.fake.before_update=rollback
        with self.assertRaises(RuntimeError):self.store.activate(doc['releaseSha'],'a'*40)
        self.assertEqual(self.fake.rows['@active'],'b'*40)
    def test_uncertain_activation_reads_actual_success(self):
        doc=document();self.store.seed(doc)
        def uncertain(client,puts):
            client.after_update=None;raise ReadTimeoutError(endpoint_url='https://fixture.invalid')
        self.fake.after_update=uncertain
        result=self.store.activate(doc['releaseSha'],'')
        self.assertEqual(self.fake.rows['@active'],doc['releaseSha'])
        self.assertEqual(result['calls']['uncertain_responses'],1)
    def test_uncertain_activation_does_not_overwrite_rollback(self):
        doc=document();self.store.seed(doc)
        def uncertain(client,puts):
            client.after_update=None;client.rows['@active']='b'*40;client.revision+=1
            raise ReadTimeoutError(endpoint_url='https://fixture.invalid')
        self.fake.after_update=uncertain
        with self.assertRaises(RuntimeError):self.store.activate(doc['releaseSha'],'')
        self.assertEqual(self.fake.rows['@active'],'b'*40)
    def test_capacity_stop_does_not_delete_history(self):
        self.fake.extra_size=STORE_LIMIT-100
        with self.assertRaises(RuntimeError):self.store.seed(document())
        self.assertEqual(self.fake.writes,[])
    def test_bad_digest_duplicate_oversize_and_wrong_namespace_rejected(self):
        for change in [lambda d:d.update(digest='0'*64),lambda d:d['records'].append(d['records'][0]),
                       lambda d:d['records'][0].update(value='a'*1025),lambda d:d['records'][0].update(key='@active')]:
            doc=document();change(doc)
            with self.assertRaises(RuntimeError):self.store.seed(doc)
        self.assertEqual(self.fake.writes,[])
    def test_legacy_seed_v2_and_guarded_legacy_rollback(self):
        release='e'*40;key='r:'+release+':/old';value=json.dumps(dict(status=301,location='/new'),separators=(',',':'))
        digest=hashlib.sha256(f'{key}\0{value}\n'.encode()).hexdigest()
        old=dict(schemaVersion=1,releaseSha=release,digest=digest,records=[dict(key='@config:'+release,value=digest),dict(key=key,value=value)])
        self.store.seed(old);self.store.activate(release,'')
        new=document();self.store.seed(new);self.store.activate(new['releaseSha'],release)
        self.store.activate(release,new['releaseSha'])
        self.assertEqual(self.fake.rows['@active'],release)
    def test_compiler_release_independence_sort_shadow_forced_case_and_reject_duplicate(self):
        script=Path(__file__).with_name('generate-routing.mjs')
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);(root/'static').mkdir();(root/'dist').mkdir()
            source='/old /new 301\n/Case/ https://example.org/?x=1 301!\n/shadow /gone 301\n'
            def compile(release,fmt=2):
                subprocess.run(['node',str(script),str(root/'routing'),f'{release:040x}'],check=True,capture_output=True,
                    env={**os.environ,'BEDFORD_PROJECT_ROOT':str(root),'BEDFORD_ROUTING_FORMAT':str(fmt)})
                doc=json.loads((root/'routing/routing-kvs.json').read_text());validate_document(doc);return doc
            (root/'static/_redirects').write_text(source)
            a=compile(1);b=compile(2);self.assertEqual(a['digest'],b['digest'])
            (root/'static/_redirects').write_text('#comment\n'+'\n'.join(reversed(source.splitlines())))
            self.assertEqual(a['digest'],compile(3)['digest'])
            (root/'dist/shadow.html').write_text('existing page')
            self.assertNotEqual(a['digest'],compile(4)['digest'])
            (root/'dist/Case').mkdir();(root/'dist/Case/index.html').write_text('forced still wins')
            self.assertEqual(len(compile(5)['records']),2)
            legacy=compile(6,1);self.assertEqual(legacy['schemaVersion'],1)
            (root/'static/_redirects').write_text('/old /a 301!\n/old /b 301!\n')
            with self.assertRaises(subprocess.CalledProcessError):compile(7)


if __name__=='__main__':unittest.main()
