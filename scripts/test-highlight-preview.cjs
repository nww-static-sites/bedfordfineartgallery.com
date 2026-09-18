// Inert actual-component rendering checks; no content or service writes.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict')
const root = path.resolve(__dirname, '..')
const deps = process.env.BEDFORD_TEST_DEPS || path.join(root, 'node_modules')
const Vue = require(path.join(deps, 'vue'))
const compiler = require(path.join(deps, 'vue-template-compiler'))
const renderer = require(path.join(deps, 'vue-server-renderer')).createRenderer()
const parse5 = require(path.join(deps, 'parse5'))
const parsed = compiler.parseComponent(fs.readFileSync(path.join(root, 'components/HighlightPreview.vue'), 'utf8'))
assert.deepEqual(compiler.compile(parsed.template.content).errors, [])
const component = new Function(parsed.script.content.replace('export default', 'return'))()
Object.assign(component, compiler.compileToFunctions(parsed.template.content), { _scopeId: 'data-v-preview-acceptance' })
Vue.component('nuxt-link', { functional:true, props:['to'], render:(h,c)=>h('a', {...c.data, attrs:{href:c.props.to}}, c.children) })
Vue.component('nuxt-img', { functional:true, render:(h,c)=>h('img',c.data) })
const styles = require(path.join(deps, '@vue/component-compiler-utils')).compileStyle({source:parsed.styles[0].content,filename:'HighlightPreview.vue',id:'data-v-preview-acceptance',scoped:true})
assert.deepEqual(styles.errors, [])
const articles = fs.readdirSync(path.join(root,'cms/articles')).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(root,'cms/articles',f))))
function render(highlight) { return renderer.renderToString(new Vue({render:h=>h(component,{props:{highlight}})})) }
function all(n,p) { return [...(p(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,p))] }
function attr(n,k) { return n.attrs?.find(a=>a.name===k)?.value || '' }
function text(n) { return n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('') }
async function test() {
  let checked=0
  for (const article of [...articles,{title:'A <title> & "quote"',slug:'title-escape-html',gridImage:'',preview:'No-image preview'}]) {
    const node=parse5.parseFragment(await render({...article,preview:article.preview||'Unchanged excerpt'}))
    const heading=all(node,n=>n.tagName==='h2')[0],link=all(heading,n=>n.tagName==='a')
    assert.equal(link.length,1)
    assert.equal(text(link[0]),article.title)
    assert.equal(attr(link[0],'href'),article.slug.replace('-html','.html'))
    const readMore=all(node,n=>n.tagName==='a'&&attr(n,'class')==='readmore')[0]
    assert.equal(attr(link[0],'href'),attr(readMore,'href'))
    if(article.gridImage) assert.equal(all(node,n=>n.tagName==='img').length,1)
    checked++
  }
  const css=parsed.styles[0].content
  assert.match(css,/\.article-preview-title \{ font-weight: 700; \}/)
  assert.match(css,/a:active \{ color: inherit; font: inherit; text-decoration: none; \}/)
  for(const state of ['visited','hover','focus','active']) assert(css.includes('.article-preview-title a:'+state))
  assert(css.includes('a:focus-visible { outline: 2px solid currentColor;'))
  console.log(JSON.stringify({previewCases:checked,articles:articles.length,titleTextAndDestination:'pass',states:'normal visited hover focus active',focusIndicator:'pass',contentWrites:0}))
}
module.exports={render,articles,css:styles.code}
if(require.main===module) test().catch(e=>{console.error(e);process.exitCode=1})
