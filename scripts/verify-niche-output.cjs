// Generation gate: refuse a candidate if listing metadata is absent or wrong.
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm'),parse5=require('parse5')
const root=process.cwd(),manifest=JSON.parse(fs.readFileSync(path.join(root,'.generated/niche-thumbnails.json')))
const html=fs.readFileSync(path.join(root,'dist/art_lovers_niche.htm'),'utf8')
const all=(n,p)=>[...(p(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,p))]
const attr=(n,k)=>(n.attrs||[]).find(a=>a.name===k)?.value||''
const has=(n,c)=>attr(n,'class').split(/\s+/).includes(c)
const doc=parse5.parse(html),rows=all(doc,n=>has(n,'niche-preview')),seen=new Set()
const payloadPath=all(doc,n=>n.tagName==='link'&&attr(n,'href').endsWith('/art_lovers_niche.htm/payload.js')).map(n=>attr(n,'href'))[0]
assert(payloadPath,'Newsletter listing payload is missing')
const output=path.resolve(root,'dist')
const payloadFile=path.resolve(output,'.'+payloadPath)
assert(payloadFile.startsWith(output+path.sep),'Listing payload must be inside dist')
let articles
vm.runInNewContext(fs.readFileSync(payloadFile,'utf8'),{__NUXT_JSONP__:(route,data)=>{
 assert.strictEqual(route,'/art_lovers_niche.htm')
 articles=data.data[0].artLoversNicheArticles
}},{timeout:1000})
assert(Array.isArray(articles))
assert.deepStrictEqual(Array.from(articles,a=>a.slug).sort(),Object.keys(manifest.images).sort())
assert(articles.every((article,index)=>!index||article.date<=articles[index-1].date))
for(const article of articles){
 assert.deepStrictEqual(JSON.parse(JSON.stringify(article.listingImage || null)),manifest.images[article.slug])
 assert(!Object.prototype.hasOwnProperty.call(article,'body'))
}
assert.strictEqual(rows.length,Math.min(12,articles.length))
const archived=Array.from(articles).slice(12)
const yearKeys=Array.from(new Set(archived.map(article=>/^\d{4}(?=-)/.exec(article.date)?.[0] || 'Undated')))
 .sort((a,b)=>(Number(b)||0)-(Number(a)||0))
const buttons=all(doc,n=>has(n,'archive-year'))
assert.deepStrictEqual(buttons.map(n=>attr(n,'id')),yearKeys.map(year=>'archive-year-'+year))
for(const [index,button] of buttons.entries()){
 const year=yearKeys[index],id='archive-panel-'+year
 assert.strictEqual(attr(button,'aria-expanded'),'false')
 assert.strictEqual(attr(button,'aria-controls'),id)
 const panels=all(doc,n=>attr(n,'id')===id)
 assert.strictEqual(panels.length,1)
 assert(panels[0].attrs.some(a=>a.name==='hidden'))
 assert.strictEqual(all(panels[0],n=>has(n,'niche-preview')).length,0)
}
const tabs=all(doc,n=>attr(n,'role')==='tab')
assert.deepStrictEqual(tabs.map(n=>attr(n,'id')),['club-tab-join','club-tab-house','club-tab-members'])
assert.deepStrictEqual(tabs.map(n=>attr(n,'aria-selected')),['true','false','false'])
for(const [index,tab] of tabs.entries()){
 const panels=all(doc,n=>attr(n,'id')===attr(tab,'aria-controls'))
 assert.strictEqual(panels.length,1)
 assert.strictEqual(panels[0].attrs.some(a=>a.name==='hidden'),index!==0)
}
let recentImages=0
for(const row of rows){
 const heading=all(row,n=>n.tagName==='h2'&&has(n,'niche-preview-title'));assert.strictEqual(heading.length,1)
 const links=all(row,n=>n.tagName==='a'),title=all(heading[0],n=>n.tagName==='a');assert.strictEqual(title.length,1)
 const target=attr(title[0],'href'),slug=target.replace(/^\//,'').replace(/\.html$/,'-html')
 assert(Object.prototype.hasOwnProperty.call(manifest.images,slug));assert(!seen.has(slug));seen.add(slug)
 assert(links.every(link=>attr(link,'href')===target))
 const readMore=links.filter(link=>has(link,'niche-read-more'));assert.strictEqual(readMore.length,1)
 assert.strictEqual(readMore[0].childNodes[0].value,'Read More')
 const image=manifest.images[slug],actual=all(row,n=>n.tagName==='img')
 assert.strictEqual(actual.length,image?1:0)
 if(image){recentImages++;for(const [key,value]of Object.entries(image))assert.strictEqual(attr(actual[0],key),String(value));assert.strictEqual(attr(actual[0],'loading'),'lazy');assert.strictEqual(attr(actual[0],'decoding'),'async')}
}
assert.deepStrictEqual(Array.from(seen),Array.from(articles).slice(0,12).map(a=>a.slug))
console.log(JSON.stringify({nicheOutput:'pass',recent:rows.length,recentImages,archived:archived.length,years:yearKeys,images:Object.values(manifest.images).filter(Boolean).length,matchingTitleAndImageLinks:true}))
