import datetime as dt,importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('retention',Path(__file__).with_name('release-retention.py'));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
now=dt.datetime(2026,9,7,tzinfo=dt.timezone.utc)
def fixture(count,days):
 return {'releases':[{'key':f'control/{i:040x}.json','lastModified':(now-dt.timedelta(days=days+i)).isoformat(),
 'metadata':{'releaseGitSha':f'{i:040x}','buildFinishedAt':(now-dt.timedelta(days=days+i)).isoformat(),'byteCount':100,'fileCount':2,'routeSetHash':'a'*64},'files':2,'manifestSha256':'b'*64} for i in range(count)]}
values={'production':{'@active':f'{19:040x}'},'preview':{'@active':f'{18:040x}'}}
r=module.plan(fixture(20,100),values,[f'{17:040x}'],[f'{16:040x}'],now)
assert r['keepCount']==19 and r['reviewCount']==1 and r['reviewArtifactBytes']==100
assert r['unreferencedKnownRouteSetsForReview']==[] and r['protectedSharedRouteSets']==['a'*64]
assert not r['cleanupEnabled'] and r['deletionsPerformed']==0
values['production']['@asset-path:/data/ipad-paintings-123456abcdef.json']=f'{15:040x}'
assert module.plan(fixture(20,100),values,[f'{17:040x}'],[f'{16:040x}'],now)['reviewCount']==0
assert module.plan(fixture(40,0),values,[],[],now)['keepCount']==40
small={'production':{'@active':f'{1:040x}'}}
assert module.plan(fixture(4,200),small,[],[],now)['keepCount']==4
for bad in [{'production':{}},{'production':{'@active':'z'*40}},{'production':{'@active':'f'*40}}]:
 try:module.plan(fixture(20,100),bad,[],[],now);raise AssertionError('Unsafe inventory accepted')
 except ValueError:pass
print('retention tests pass: union, minimum, pins, active/previous, asset dependency, shared sets, unknown fail-closed; no deletion code')
