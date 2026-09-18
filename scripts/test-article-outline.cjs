// Inert rendering tests; no website content or services are changed.
const fs = require('fs'), path = require('path'), assert = require('assert/strict')
const root = path.resolve(__dirname, '..')
const deps = process.env.BEDFORD_TEST_DEPS || path.join(root, 'node_modules')
const md = require(path.join(deps, 'markdown-it'))({ html: false, linkify: true, breaks: true })
const outline = require('../libs/article-outline')
let cases = 0
function check(fn) { fn(); cases++ }
const source = '# Title\n\n## **First & foremost**\n\nText **bold**.\n\n### Subsection\n\n## [Second](https://example.com)\n\n## First & foremost\n\n## First foremost 2\n\n## First & foremost\n\n> ## Quoted\n\n```\n## Example\n```'
const out = outline.render(md, source, true)
check(() => assert.deepEqual(out.headings.map(h => h.title), ['First & foremost', 'Second', 'First & foremost', 'First foremost 2', 'First & foremost']))
check(() => assert.equal(new Set(out.headings.map(h => h.id)).size, out.headings.length))
check(() => assert.equal(out.headings[4].id, 'article-first-foremost-3'))
check(() => assert.match(out.html, /<h2 id="article-first-foremost" tabindex="-1"><strong>First &amp; foremost<\/strong>/))
check(() => assert.match(out.html, /Text <strong>bold<\/strong>/))
check(() => assert.deepEqual(outline.render(md, 'No headings', true).headings, []))
check(() => assert.equal(outline.render(md, source, false).html, md.render(source)))
check(() => assert.equal(outline.render(md, source, 'true').html, md.render(source)))
check(() => assert.equal(outline.render(md, '## Café & École', true).headings[0].id, 'article-cafe-ecole'))
check(() => assert.deepEqual(outline.render(md, '## !!!\n\n## !!!', true).headings.map(h => h.id), ['article-section', 'article-section-2']))
check(() => assert.doesNotMatch(outline.render(md, '## <script>alert(1)</script>\n\n[bad](javascript:alert(1))', true).html, /<script>|href="javascript:/))
check(() => assert.equal(outline.render(md, 'Underlined section\n------------------', true).headings[0].title, 'Underlined section'))
check(() => assert.equal(outline.render(md, '## ![A photo](https://example.com/a.jpg)', true).headings[0].title, 'A photo'))
let articleCount = 0
for (const file of fs.readdirSync(path.join(root, 'cms/articles')).filter(f => f.endsWith('.json'))) {
    const article = JSON.parse(fs.readFileSync(path.join(root, 'cms/articles', file)))
    const original = JSON.stringify(article)
    assert.equal(outline.render(md, article.body, false).html, md.render(String(article.body || '')), file)
    const enabled = outline.render(md, article.body, true)
    assert.equal(new Set(enabled.headings.map(h => h.id)).size, enabled.headings.length, file)
    enabled.headings.forEach(h => assert.equal(enabled.html.split('id="' + h.id + '"').length, 2, file))
    assert.equal(JSON.stringify(article), original)
    articleCount++
}
const guide = JSON.parse(fs.readFileSync(path.join(root, 'cms/articles/how-to-buy-original-paintings-the-complete-guide-to-choosing-fine-art-for-your-home-html.json')))
check(() => assert.equal(outline.render(md, guide.body, true).headings.length, 15))
const Vue = require(path.join(deps, 'vue')), compiler = require(path.join(deps, 'vue-template-compiler'))
const renderer = require(path.join(deps, 'vue-server-renderer')).createRenderer()
Vue.prototype.$md = md
Vue.component('nuxt-img', { functional:true, render:(h,c) => h('img',{attrs:c.data.attrs}) })
Vue.component('nuxt-link', { functional:true, render:(h,c) => h('a',c.data,c.children) })
Vue.component('TestimonialsScroll', { render:h => h('div') })
Vue.component('YouTubeVideo', { render:h => h('div') })
const parsed = compiler.parseComponent(fs.readFileSync(path.join(root,'pages/highlight.vue'),'utf8'))
assert.deepEqual(compiler.compile(parsed.template.content).errors, [])
// Load actual component logic, substituting only its imports for inert test stubs.
const script = parsed.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
const stub = { render:h => h('div') }
const component = new Function('ArticleOutline','TestimonialsScroll','YouTubeVideo','urlSlugToSlug','getMetaTitleAndDescriptionAndKeywords',script)(outline,stub,stub,x=>x,()=>({}))
Object.assign(component, compiler.compileToFunctions(parsed.template.content))
async function render(article) { return renderer.renderToString(new Vue({...component, data:()=>({highlight:article})})) }
;(async () => {
    for (const article of [guide, { title:'Short', body:'Only **bold** text.' }, { ...guide, showTableOfContents:true }, { ...guide, showTableOfContents:true,tableOfContentsTitle:'<img onerror=bad> Guide' }]) {
        const html = await render(article)
        assert.match(html, /class="article-section-label">Art Blog<\/p>/)
        assert.match(html, /<header class="article-heading">/)
        assert.match(html, /class="article-intro/)
        assert.match(html, /<\/header>\s*<div class="highlights_prev article-main/)
        assert.doesNotMatch(html, /class="highlights_thumbnail"/)
        if (article.image) {
            assert(html.indexOf('class="article-cover"') < html.indexOf('class="article-title"'))
        } else {
            assert.match(html, /article-intro-without-image/)
            assert.doesNotMatch(html, /class="article-cover"/)
        }
        assert.equal(html.includes('<nav'), article.showTableOfContents === true)
        assert.doesNotMatch(html, /<img onerror/)
        if (article.showTableOfContents) assert.equal((html.match(/href="#article-/g)||[]).length,15)
        cases++
    }
    console.log(JSON.stringify({tests:cases,corpus:articleCount,disabledParity:'exact',uniqueValidTargets:true,publicTemplate:'pass',contentWrites:0}))
})().catch(e=>{console.error(e);process.exitCode=1})
