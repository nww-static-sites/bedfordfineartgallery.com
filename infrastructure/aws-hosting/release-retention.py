"""Read-only whole-release retention planner. Intentionally no deletion/API writes.

Input is a maintenance inventory, never gathered on the ordinary publish path.
Keep the union of 90 days, newest 15, active, previous, pins and asset targets.
Unknown/malformed inventory stops the plan; unrelated/unknown route data stays.
"""
import argparse,datetime as dt,json,re
from pathlib import Path
SHA=re.compile(r'^[0-9a-f]{40}$')

def timestamp(value):
    parsed=dt.datetime.fromisoformat(value.replace('Z','+00:00'))
    if parsed.tzinfo is None:raise ValueError('Inventory timestamp has no timezone')
    return parsed

def plan(inventory,stores,previous,pins=(),now=None):
    now=now or dt.datetime.now(dt.timezone.utc);rows={};reasons={}
    for row in inventory['releases']:
        meta=row['metadata'];release=meta['releaseGitSha']
        if not SHA.fullmatch(release) or row['key']!='control/'+release+'.json' or release in rows:
            raise ValueError('Invalid/duplicate release identity')
        if type(meta['byteCount']) is not int or meta['byteCount']<0 or meta['fileCount']!=row['files']:
            raise ValueError('Invalid artifact counts')
        created=max(timestamp(row['lastModified']),timestamp(meta['buildFinishedAt']))
        rows[release]={'release':release,'createdAt':created,'bytes':meta['byteCount'],
            'files':meta['fileCount'],'routeSet':meta.get('routeSetHash'),'manifestSha256':row['manifestSha256']}
        reasons[release]=set()
    if not rows:raise ValueError('No release inventory')
    protected=set(previous)|set(pins)
    for name,values in stores.items():
        active=values.get('@active')
        if not active or not SHA.fullmatch(active):raise ValueError('Unknown active release: '+name)
        protected.add(active)
        # An existing immutable address may still name an older release. Protect
        # its whole source release until a separate approved remap/copy is proven.
        for key,value in values.items():
            if key.startswith('@asset-path:'):
                if not SHA.fullmatch(value):raise ValueError('Invalid asset target')
                protected.add(value)
    for release in protected:
        if release not in rows:raise ValueError('Protected release lacks a control manifest: '+release)
        reasons[release].add('active/previous/pinned/asset dependency')
    for release in sorted(rows,key=lambda k:(rows[k]['createdAt'],k),reverse=True)[:15]:reasons[release].add('newest 15')
    for release,row in rows.items():
        if now-row['createdAt']<=dt.timedelta(days=90):reasons[release].add('within 90 days')
    keep={k for k,v in reasons.items() if v};remove=set(rows)-keep
    shared={rows[k]['routeSet'] for k in keep if rows[k]['routeSet']}
    unreferenced={rows[k]['routeSet'] for k in remove if rows[k]['routeSet']}-shared
    # Metadata is informational only. Never infer ownership of unexplained keys.
    outputs=[]
    for release,row in sorted(rows.items(),key=lambda item:(item[1]['createdAt'],item[0]),reverse=True):
        outputs.append({**row,'createdAt':row['createdAt'].isoformat(),'decision':'KEEP' if release in keep else 'REVIEW FOR REMOVAL',
            'reasons':sorted(reasons[release])})
    return {'schemaVersion':1,'asOf':now.isoformat(),'mode':'report-only','cleanupEnabled':False,
        'policy':{'days':90,'minimumReleases':15,'protectActivePreviousPinsAssets':True},
        'releases':outputs,'keepCount':len(keep),'reviewCount':len(remove),
        'keptArtifactBytes':sum(rows[k]['bytes'] for k in keep),'reviewArtifactBytes':sum(rows[k]['bytes'] for k in remove),
        'protectedSharedRouteSets':sorted(shared),'unreferencedKnownRouteSetsForReview':sorted(unreferenced),
        'unknownKeys':'Preserve; never delete by age alone','deletionsPerformed':0,
        'excluded':'Images/media, source, editor records/History/database, unrelated backups, S3 noncurrent versions'}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inventory',required=True,type=Path);parser.add_argument('--routing-values',required=True,type=Path)
    parser.add_argument('--previous',required=True,action='append');parser.add_argument('--pin',default=[],action='append')
    args=parser.parse_args()
    print(json.dumps(plan(json.loads(args.inventory.read_text()),json.loads(args.routing_values.read_text()),args.previous,args.pin),indent=2))
