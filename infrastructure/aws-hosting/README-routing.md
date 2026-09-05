# Immutable shared routing

The publisher still builds once, uploads a complete immutable release, checks
preview, then activates and checks production. Only route-table preparation is
reused. The effective compiler output (including real-file shadowing) determines
the shared table's SHA-256 identity; source timestamps and release IDs do not.

## Storage and compatibility

`@active` remains the release SHA. A legacy `@config:<release>` contains its old
digest and selects `r:<release>:<path>`. A version-2 association contains
`{"routeSet":"<sha256>","v":2}` and selects `r2:<sha256>:<path>` only after
`@routes-ready:<sha256>` proves the table was fully verified. The ready marker
is written last. Neither completed tables nor existing associations are edited.

An unchanged table requires targeted readiness and association reads, one small
new release association, and guarded activation. No historical ListKeys scans
or redirect-row writes occur. Capacity is checked using store metadata; reaching
the reserve stops the operation, never deletes rollback data.

## Operator requirements

1. Install the compatible edge reader in preview and production before enabling
   publisher `routingFormat: 2`. Legacy format remains available for existing
   job contracts. Never silently change formats when retrying a job.
2. Use the publisher's isolated pinned runtime with `boto3==1.40.28` and
   `botocore[crt]==1.40.28`. KVS uses SigV4A and requires the CRT dependency.
3. All workers and preview fixtures must share `publicationLockPath` under the
   publisher state directory. Retain that lock for the complete job/fixture.
   Editor save/review locks are separate; later saves stay unpublished.
4. Activation/rollback requires the exact expected active release and an ETag
   read before that active value. Re-check on conflicts or uncertain responses;
   never overwrite an intervening operator rollback or newer publication.
5. Roll back the selected release before restoring an old edge reader. Keep
   this compatible reader whenever any active release uses version 2. Previous
   release objects, legacy routing rows and configuration remain intact.
6. Retention/pruning and hash-based file-copy optimization are separate work.
   Do not delete old namespaces as a way to make an ordinary publication fit.

## Evidence and tests

The worker writes per-attempt timing under `timings/<job>/attempt-<n>.json` and
frozen contracts under `contracts/<job>.json`. Timings distinguish checkout,
build, validation, full transfer, each endpoint's routing, activation and HTTP
delivery checks. HTTP proof requires two consecutive matching release/homepage
observations within a bounded deadline; this is not a worldwide edge guarantee.

Offline tests: `test-routing-store.py`, `test-cloudfront-function.mjs`, and the
adjacent Extranet publisher/editor contract suites. The scale fixture performs
100 publications with unrelated historical rows and rejects any ListKeys call.
Real rollout also requires CloudFront runtime testing, preview rollback proof,
two content-preserving publications, and the site's route/asset/iPad verifiers.

## September 5, 2026 preview acceptance

The first 414-rule shared table took 10.486 seconds to prepare and verify;
reusing it took 0.231 seconds with zero redirect writes or historical scans.
Initial and repeated preview HTTP checks took 72.991 and 27.294 seconds. These
are individual observations, not a guaranteed range or a percentile. The
compatible reader also passed actual CloudFront runtime tests (8–12% utilization),
the representative site/iPad/media verifier, and guarded legacy rollback.

Beta's default Node 14 runs the existing routing compiler, but the broader
site checker requires a modern Node with fetch/top-level await. Run that checker
from the established Mac runtime; do not upgrade system Node for this test.
An isolated Podman test must use the normal publisher working directory and
`/run/bedford-publisher`, as the service does. Preserve the real queue, retain
the common publication lock during preview checks, and restore/verify preview
before resuming the service. SDK call counts are logical operations plus
reported SDK retries, including retries returned with error responses.

The first real production bootstrap stopped safely before activation on a
GetKey throttle with the original 12-thread burst. The corrected SDK shares a
20-attempt/second local pacing ceiling across four threads, including actual
HTTP retries, and uses six bounded standard SDK attempts. This is conservative
application pacing, not a claimed AWS quota. Both successful and failed routing
phases retain retry metrics. Unchanged-table reuse still performs only constant
targeted reads/association writes. Offline tests exercise the actual SDK retry
pipeline with its HTTP transport replaced, plus concurrent request pacing.
