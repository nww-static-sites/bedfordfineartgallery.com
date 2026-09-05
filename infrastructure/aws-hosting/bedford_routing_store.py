"""Bounded, immutable Bedford route sets. No historical store scans/deletions."""
from __future__ import annotations

from collections import Counter
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import re
import threading
import time

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError, ConnectionClosedError, EndpointConnectionError, ReadTimeoutError

SHA40 = re.compile(r'^[0-9a-f]{40}$')
SHA64 = re.compile(r'^[0-9a-f]{64}$')
BEHAVIOR_VERSION = 'bedford-edge-v1'
STORE_LIMIT = 5 * 1024 * 1024
SAFETY_MARGIN = 128 * 1024
STORES = {
    'arn:aws:cloudfront::775735255405:key-value-store/58fa29d7-1dbb-406b-af6d-2796566a2d6e',
    'arn:aws:cloudfront::775735255405:key-value-store/2043d3ba-fe3f-4fa7-a51c-271e3a58c627',
}
UNCERTAIN_WRITE = (ConnectionClosedError, EndpointConnectionError, ReadTimeoutError)


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False)


def missing(error):
    return isinstance(error, ClientError) and error.response.get('Error', {}).get('Code') == 'ResourceNotFoundException'


def conflict(error):
    return isinstance(error, ClientError) and error.response.get('Error', {}).get('Code') in {'ConflictException', 'PreconditionFailed', 'PreconditionFailedException'}


def validate_document(document):
    version = document.get('schemaVersion')
    release = document.get('releaseSha', '')
    digest = document.get('digest', '')
    if type(version) is not int or version not in {1, 2} or not SHA40.fullmatch(release) or not SHA64.fullmatch(digest):
        raise RuntimeError('Invalid routing identity')
    rows = document.get('records')
    if not isinstance(rows, list) or len(rows) > 10000:
        raise RuntimeError('Invalid routing records')
    records = {}
    for row in rows:
        key, value = row.get('key'), row.get('value')
        if not isinstance(key, str) or not isinstance(value, str) or key in records:
            raise RuntimeError('Invalid or duplicate routing record')
        if len(key.encode()) > 512 or len(value.encode()) > 1024:
            raise RuntimeError('Routing record exceeds service limits')
        records[key] = value
    if version == 1:
        if records.get('@config:'+release) != digest:
            raise RuntimeError('Legacy routing configuration differs')
        prefix = 'r:'+release+':'
        route_rows = {k:v for k,v in records.items() if k != '@config:'+release}
        if any(not k.startswith(prefix) for k in route_rows):
            raise RuntimeError('Legacy route is outside the release namespace')
        # Legacy ordering was produced by JavaScript localeCompare; retain it
        # in the supplied record sequence instead of silently reordering it.
        raw = ''.join(f'{k}\0{v}\n' for k,v in route_rows.items()).encode()
        if hashlib.sha256(raw).hexdigest() != digest:
            raise RuntimeError('Legacy routing digest differs')
        return version, release, digest, route_rows
    if document.get('routeSetHash') != digest or document.get('behaviorVersion') != BEHAVIOR_VERSION:
        raise RuntimeError('Unsupported shared routing behavior')
    prefix = 'r2:'+digest+':'
    rules = []
    for key, value in records.items():
        if not key.startswith(prefix):
            raise RuntimeError('Shared route is outside its namespace')
        source = key[len(prefix):]
        if not source.startswith('/') or any(ord(ch) < 32 for ch in source):
            raise RuntimeError('Invalid shared route source')
        parsed = json.loads(value)
        if set(parsed) != {'location','status'} or parsed['status'] != 301 or not isinstance(parsed['location'], str) or not parsed['location']:
            raise RuntimeError('Invalid redirect value')
        if canonical(parsed) != value:
            raise RuntimeError('Redirect value is not canonical')
        rules.append({'location':parsed['location'],'source':source,'status':parsed['status']})
    rules.sort(key=lambda r:r['source'].encode())
    expected = hashlib.sha256(canonical({'behaviorVersion':BEHAVIOR_VERSION,'rules':rules,'schemaVersion':2}).encode()).hexdigest()
    if expected != digest:
        raise RuntimeError('Shared routing digest differs')
    return version, release, digest, records


class RoutingStore:
    def __init__(self, arn, client=None, sleeper=time.sleep, clock=time.monotonic):
        if arn not in STORES:
            raise RuntimeError('Routing store is outside Bedford scope')
        self.arn = arn
        self.client = client or boto3.Session(profile_name='default').client(
            'cloudfront-keyvaluestore', region_name='us-east-1', config=Config(
                connect_timeout=5, read_timeout=20, max_pool_connections=4,
                retries={'mode':'standard','total_max_attempts':6}))
        self.sleep = sleeper
        self.clock = clock
        self.metrics = Counter()
        self.counter_lock = threading.Lock()
        self.request_lock = threading.Lock()
        self.next_request_at = 0.0
        # Pace actual HTTP attempts, including SDK retries, across all threads.
        # This is a conservative local ceiling, not an asserted AWS quota.
        self.sdk_pacing = hasattr(self.client, 'meta')
        if self.sdk_pacing:
            self.client.meta.events.register('before-send.cloudfront-keyvaluestore', self.pace_request)

    def pace_request(self, **kwargs):
        with self.request_lock:
            delay = max(0.0, self.next_request_at - self.clock())
            if delay:
                self.sleep(delay)
            self.next_request_at = self.clock() + 0.05

    def call(self, operation, **arguments):
        if not self.sdk_pacing:
            self.pace_request()
        with self.counter_lock:
            self.metrics[operation] += 1
        try:
            response = getattr(self.client, operation)(KvsARN=self.arn, **arguments)
        except ClientError as error:
            with self.counter_lock:
                self.metrics['errors_'+error.response.get('Error', {}).get('Code', 'unknown')] += 1
                self.metrics['sdk_retries'] += error.response.get('ResponseMetadata', {}).get('RetryAttempts', 0)
            raise
        except UNCERTAIN_WRITE:
            with self.counter_lock:
                self.metrics['uncertain_responses'] += 1
            raise
        with self.counter_lock:
            self.metrics['sdk_retries'] += response.get('ResponseMetadata', {}).get('RetryAttempts', 0)
        return response

    def get(self, key):
        try:
            return self.call('get_key', Key=key)['Value']
        except ClientError as error:
            if missing(error):
                return None
            raise

    def describe(self):
        return self.call('describe_key_value_store')

    def check_capacity(self, description, records):
        added = sum(len(k.encode())+len(v.encode()) for k,v in records.items())
        if int(description.get('TotalSizeInBytes', 0)) + added > STORE_LIMIT - SAFETY_MARGIN:
            raise RuntimeError('Routing store needs a separately reviewed capacity decision')

    def immutable_put(self, records):
        """Read the version BEFORE values; a concurrent writer cannot be erased."""
        rows = list(records.items())
        written = 0
        for offset in range(0, len(rows), 50):
            batch = rows[offset:offset+50]
            for attempt in range(4):
                description = self.describe()
                pending = {}
                with ThreadPoolExecutor(max_workers=4) as pool:
                    existing = list(pool.map(self.get, [key for key, _ in batch]))
                for (key, value), old in zip(batch, existing):
                    if old is not None and old != value:
                        raise RuntimeError('Immutable routing record differs: '+key)
                    if old is None:
                        pending[key] = value
                if not pending:
                    break
                self.check_capacity(description, pending)
                try:
                    self.call('update_keys', IfMatch=description['ETag'], Puts=[{'Key':k,'Value':v} for k,v in pending.items()])
                    written += len(pending)
                    break
                except ClientError as error:
                    if not conflict(error) or attempt == 3:
                        raise
                    self.sleep(0.2 * (attempt+1))
                except UNCERTAIN_WRITE:
                    # Resolve from exact keys on the next bounded iteration;
                    # never assume an unanswered conditional write failed.
                    if attempt == 3:
                        self.verify_rows(dict(batch))
                        break
                    self.sleep(0.2 * (attempt+1))
        return written

    def verify_rows(self, records):
        def one(row):
            key, expected = row
            if self.get(key) != expected:
                raise RuntimeError('Routing readback differs: '+key)
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(one, records.items()))

    def seed(self, document):
        version, release, digest, rows = validate_document(document)
        start = time.monotonic()
        before = self.metrics.copy()
        # Fail on missing store/permissions before treating a missing key as new.
        self.describe()
        ready_key = '@routes-ready:'+digest
        ready_value = canonical({'count':len(rows),'routeSet':digest,'v':2})
        existing = self.get(ready_key) if version == 2 else None
        if existing is not None and existing != ready_value:
            raise RuntimeError('Shared routing ready marker differs')
        reused = existing == ready_value if version == 2 else False
        written = 0
        if not reused:
            written = self.immutable_put(rows)
            # The last marker is conditional on the version BEFORE all readbacks.
            # A concurrent change anywhere invalidates the proof and retries it.
            for attempt in range(4):
                description = self.describe()
                self.verify_rows(rows)
                marker_key = ready_key if version == 2 else '@config:'+release
                marker_value = ready_value if version == 2 else digest
                previous = self.get(marker_key)
                if previous is not None and previous != marker_value:
                    raise RuntimeError('Routing completion marker conflicts')
                if previous == marker_value:
                    if self.describe()['ETag'] == description['ETag']:
                        break
                    if attempt == 3:
                        raise RuntimeError('Routing changed during verification')
                    continue
                self.check_capacity(description, {marker_key:marker_value})
                try:
                    self.call('update_keys', IfMatch=description['ETag'], Puts=[{'Key':marker_key,'Value':marker_value}])
                    break
                except ClientError as error:
                    if not conflict(error) or attempt == 3:
                        raise
                    self.sleep(0.2 * (attempt+1))
                except UNCERTAIN_WRITE:
                    if self.get(marker_key) == marker_value:
                        break
                    if attempt == 3:
                        raise
                    self.sleep(0.2 * (attempt+1))
        association = digest if version == 1 else canonical({'routeSet':digest,'v':2})
        self.immutable_put({'@config:'+release:association})
        if self.get('@config:'+release) != association:
            raise RuntimeError('Release routing association did not verify')
        if version == 2 and self.get(ready_key) != ready_value:
            raise RuntimeError('Shared routing readiness did not verify')
        return {'schemaVersion':version,'routeSetHash':digest,'routeCount':len(rows),
                'reused':reused,'routeRowsWritten':written,'seconds':round(time.monotonic()-start,3),
                'calls':dict(self.metrics-before)}

    def release_ready(self, release):
        value = self.get('@config:'+release)
        if value is None:
            raise RuntimeError('Release has no completed routing association')
        if SHA64.fullmatch(value):
            return {'schemaVersion':1,'digest':value}
        try:
            parsed = json.loads(value)
        except ValueError as error:
            raise RuntimeError('Malformed release routing association') from error
        if not isinstance(parsed, dict) or set(parsed) != {'routeSet','v'} or parsed['v'] != 2 or not SHA64.fullmatch(str(parsed['routeSet'])):
            raise RuntimeError('Invalid release routing association')
        marker = self.get('@routes-ready:'+parsed['routeSet'])
        try:
            ready = json.loads(marker or 'null')
        except ValueError as error:
            raise RuntimeError('Malformed routing ready marker') from error
        if not isinstance(ready, dict) or set(ready) != {'count','routeSet','v'} or ready['v'] != 2 or ready['routeSet'] != parsed['routeSet'] or type(ready['count']) is not int or ready['count'] < 0:
            raise RuntimeError('Routing set is not ready')
        return ready

    def activate(self, release, expected):
        if not SHA40.fullmatch(release) or (expected and not SHA40.fullmatch(expected)):
            raise RuntimeError('Invalid activation identity')
        before = self.metrics.copy()
        start = time.monotonic()
        for attempt in range(4):
            # Important: never obtain a newer ETag after checking @active.
            description = self.describe()
            self.release_ready(release)
            active = self.get('@active') or ''
            if active == release:
                break
            if active != expected:
                raise RuntimeError('Active release changed; refusing to overwrite it')
            try:
                self.call('update_keys', IfMatch=description['ETag'], Puts=[{'Key':'@active','Value':release}])
            except ClientError as error:
                if not conflict(error) or attempt == 3:
                    raise
                self.sleep(0.2 * (attempt+1))
                continue
            except UNCERTAIN_WRITE:
                actual = self.get('@active') or ''
                if actual == release:
                    break
                if actual != expected:
                    raise RuntimeError('Active release changed after an uncertain response')
                if attempt == 3:
                    raise
                self.sleep(0.2 * (attempt+1))
                continue
            if self.get('@active') != release:
                raise RuntimeError('Active release readback differs')
            break
        return {'release':release,'seconds':round(time.monotonic()-start,3),'calls':dict(self.metrics-before)}
