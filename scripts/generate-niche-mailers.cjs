const fs = require('node:fs')
const path = require('node:path')
const parse = require('parse5')
const niche = require('../libs/niche-article')

const input = path.join('cms', 'artLoversNicheArticles')
const out = path.join('dist', 'mailers')
fs.mkdirSync(out, { recursive: true })
const used = new Set(fs.readdirSync(out).map(name => name.toLowerCase()))
const listing = fs.readFileSync(path.join('dist','art_lovers_niche.htm'), 'utf8')
const sitemap = fs.readFileSync(path.join('dist','sitemap.xml'), 'utf8')
function articleTable(node) {
    if (node.tagName === 'table' && node.attrs.some(attr => attr.name === 'class' && attr.value === 'niche-v7')) return node
    for (const child of node.childNodes || []) {
        const match = articleTable(child)
        if (match) return match
    }
}
function articleContents(node) {
    const text = node.nodeName === '#text' ? node.value.trim().replace(/\s+/g,' ') : ''
    const attrs = (node.attrs || []).filter(attr => ['href','src','alt','width','height'].includes(attr.name)).map(attr => [attr.name,attr.value])
    const children = (node.childNodes || []).filter(child => child.tagName || (child.nodeName === '#text' && child.value.trim()))
    return [node.tagName || '#text', text, attrs, children.map(articleContents)]
}
let count = 0
for (const file of fs.readdirSync(input).sort()) {
    if (!file.endsWith('.json')) continue
    const record = JSON.parse(fs.readFileSync(path.join(input, file), 'utf8'))
    if (!record.nicheFormat) continue
    if (record.nicheFormat !== niche.format || record.slug !== file.slice(0,-5) || !/^[a-z0-9][a-z0-9-]*-html$/.test(record.slug)) {
        throw new Error('Invalid new Niche record identity: ' + file)
    }
    const target = path.basename(niche.mailerPath(record.slug))
    if (used.has(target.toLowerCase())) throw new Error('Mailer address is already in use: ' + target)
    const articlePath = niche.articlePath(record.slug)
    const articleFile = path.join('dist', articlePath.slice(1))
    const website = fs.readFileSync(articleFile, 'utf8')
    const built = articleTable(parse.parse(website))
    const saved = articleTable(parse.parseFragment(niche.render(record, { site: true })))
    if (!built || !saved || JSON.stringify(articleContents(built)) !== JSON.stringify(articleContents(saved)) ||
        !sitemap.includes(articlePath)) {
        throw new Error('Website output does not match the saved Niche article: ' + file)
    }
    let mailer = niche.mailer(record)
    if (record.mailerMetaTitle) {
        mailer = mailer.replace(/<title>[^<]*<\/title>/, () => '<title>' + niche.escape(record.mailerMetaTitle) + '</title>')
    }
    if (record.mailerMetaDescription) {
        mailer = mailer.replace('</head>', () => '<meta name="description" content="' + niche.escape(record.mailerMetaDescription) + '"></head>')
    }
    if (sitemap.includes(niche.mailerPath(record.slug)) || listing.includes(niche.mailerPath(record.slug))) {
        throw new Error('The mailer must stay outside the site listing and sitemap: ' + target)
    }
    fs.writeFileSync(path.join(out, target), mailer, { flag: 'wx' })
    used.add(target.toLowerCase())
    count++
}
console.log('Generated ' + count + ' new-format Art Lovers’ Niche mailer(s)')
