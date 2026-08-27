import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'

const validator = fs.readFileSync(new URL('./validate-cms-relations.mjs', import.meta.url), 'utf8')

function write(root, collection, id, value) {
  const directory = path.join(root, 'cms', collection)
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(path.join(directory, `${id}.json`), `${JSON.stringify(value, null, 2)}\n`)
}

function fixture(change) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bedford-relation-validator-'))
  fs.writeFileSync(path.join(root, 'validate-cms-relations.mjs'), validator)
  for (const collection of ['artists', 'paintings', 'articles', 'artLoversNicheArticles']) {
    fs.mkdirSync(path.join(root, 'cms', collection), { recursive: true })
  }
  const artist = { name: 'Artist A', slug: 'artist-a-html', paintings: ['painting-a-html'] }
  const painting = { title: 'Painting A', slug: 'painting-a-html', artist: 'artist-a-html', highlights: [] }
  change?.(artist, painting, root)
  write(root, 'artists', 'artist-a-html', artist)
  write(root, 'paintings', 'painting-a-html', painting)
  return root
}

function run(root) {
  return spawnSync(process.execPath, ['validate-cms-relations.mjs'], { cwd: root, encoding: 'utf8' })
}

function requireState(condition, label) {
  if (!condition) throw new Error(label)
}

let root = fixture()
let result = run(root)
requireState(result.status === 0, `clean reciprocal fixture failed: ${result.stderr}`)
fs.rmSync(root, { recursive: true, force: true })

root = fixture((artist) => { artist.paintings = [] })
result = run(root)
requireState(result.status === 1 && result.stderr.includes('Artist-page memberships'), 'one-way Painting relation was not rejected')
fs.rmSync(root, { recursive: true, force: true })

root = fixture((artist) => { artist.paintings.push('painting-a-html') })
result = run(root)
requireState(result.status === 1 && result.stderr.includes('more than once'), 'duplicate Artist membership was not rejected')
fs.rmSync(root, { recursive: true, force: true })

root = fixture((_artist, painting) => { painting.artist = '' })
result = run(root)
requireState(result.status === 1 && result.stderr.includes('unattributed painting'), 'unattributed Artist membership was not rejected')
fs.rmSync(root, { recursive: true, force: true })

console.log('cms_relation_validator_tests=pass reciprocal=required duplicate=blocked unattributed_membership=blocked')
