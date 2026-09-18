// Real Vue render and build-only hook checks; no cloud writes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict')
const root=path.resolve(__dirname,'..'),deps=process.env.BEDFORD_TEST_DEPS||path.join(root,'node_modules')
const Vue=require(path.join(deps,'vue')),compiler=require(path.join(deps,'vue-template-compiler'))
const renderer=require(path.join(deps,'vue-server-renderer')).createRenderer(),parse5=require(path.join(deps,'parse5'))
const parsed=compiler.parseComponent(fs.readFileSync(path.join(root,'components/ArtLoversNicheArticlePreview.vue'),'utf8'))
assert.deepEqual(compiler.compile(parsed.template.content).errors,[])
const formatDateNoTime=s=>s?new Intl.DateTimeFormat('en-US',{year:'numeric',month:'short',day:'numeric'}).format(new Date(s)):null
const component=new Function('formatDateNoTime',parsed.script.content.replace(/import .*\n/,'').replace('export default','return'))(formatDateNoTime)
Object.assign(component,compiler.compileToFunctions(parsed.template.content),{_scopeId:'data-v-niche-acceptance'})
Vue.component('nuxt-link',{functional:true,props:['to'],render:(h,c)=>h('a',{...c.data,attrs:{href:c.props.to}},c.children)})
const styles=require(path.join(deps,'@vue/component-compiler-utils')).compileStyle({source:parsed.styles[0].content,filename:'ArtLoversNicheArticlePreview.vue',id:'data-v-niche-acceptance',scoped:true})
assert.deepEqual(styles.errors,[])
let hook
require('../modules/cx-niche-thumbnails').call({options:{rootDir:root,dev:false},nuxt:{hook:(event,fn)=>{assert.equal(event,'content:file:beforeInsert');hook=fn}}})
const articles=fs.readdirSync(path.join(root,'cms/artLoversNicheArticles')).filter(f=>f.endsWith('.json')).map(f=>{
  const item={...JSON.parse(fs.readFileSync(path.join(root,'cms/artLoversNicheArticles',f))),dir:'/artLoversNicheArticles'};hook(item);return item
}).sort((a,b)=>b.date.localeCompare(a.date))
const render=artLoversNicheArticle=>renderer.renderToString(new Vue({render:h=>h(component,{props:{artLoversNicheArticle}})}))
const all=(n,p)=>[...(p(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,p))]
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value||''
async function test(){
 let images=0,textOnly=0
 for(const article of articles){
  const tree=parse5.parseFragment(await render(article)),img=all(tree,n=>n.tagName==='img'),links=all(tree,n=>n.tagName==='a')
  assert(links.every(a=>attr(a,'href')===article.slug.replace('-html','.html')))
  const heading=all(tree,n=>n.tagName==='h2')[0];assert.equal(all(heading,n=>n.tagName==='a').length,1)
  if(article.listingImage){images++;assert.equal(img.length,1);const i=img[0];for(const [k,v] of Object.entries(article.listingImage))assert.equal(attr(i,k),String(v));assert.equal(attr(i,'loading'),'lazy');assert.equal(attr(i,'decoding'),'async')}
  else {textOnly++;assert.equal(img.length,0);assert(!attr(tree.childNodes[0],'class').includes('with-image'))}
 }
 assert.equal(images,105);assert.equal(textOnly,3)
 for(const state of ['visited','hover','focus','active'])assert(parsed.styles[0].content.includes('.niche-preview-title a:'+state))
 assert.match(parsed.styles[0].content,/a:active \{ color: inherit; font: inherit; text-decoration: none; \}/)
 const other={dir:'/articles',slug:'nothing'};hook(other);assert(!('listingImage' in other))
 console.log(JSON.stringify({articles:articles.length,images,textOnly,titleLinks:'pass',imageAttributes:'pass',buildHook:'pass',unrelatedCollection:'untouched'}))
}
module.exports={render,articles,css:styles.code}
if(require.main===module)test().catch(e=>{console.error(e);process.exitCode=1})
