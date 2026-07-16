import { spawnSync } from 'node:child_process'

const baseRef = process.env.CACHED_COMMIT_REF
const headRef = process.env.COMMIT_REF

function buildSite(reason) {
    console.log(`Netlify build required: ${reason}`)
    process.exit(1)
}

if (!baseRef || !headRef) {
    buildSite('commit references are unavailable')
}

if (baseRef === headRef) {
    buildSite('no prior cached commit is available for a safe comparison')
}

const diff = spawnSync('git', ['diff', '--name-only', '--diff-filter=ACMRTUXB', baseRef, headRef, '--'], {
    encoding: 'utf8',
})

if (diff.status !== 0) {
    buildSite(`Git comparison failed: ${diff.stderr.trim() || `exit ${diff.status}`}`)
}

const changedFiles = diff.stdout
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean)

if (changedFiles.length === 0) {
    buildSite('the comparison returned no changed files')
}

const isDocumentationOnly = changedFiles.every((file) => {
    return (
        file.startsWith('migration/') ||
        /^(AGENTS|README)(?:\.[^/]+)?\.(?:md|mdx|markdown)$/i.test(file) ||
        /^(AGENTS|README)\.(?:md|mdx|markdown)$/i.test(file)
    )
})

if (isDocumentationOnly) {
    console.log(`Skipping Netlify build; only non-site documentation changed:\n${changedFiles.join('\n')}`)
    process.exit(0)
}

buildSite(`site-affecting files changed:\n${changedFiles.join('\n')}`)
