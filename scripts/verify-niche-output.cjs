// Generation gate: refuse a candidate if listing metadata is absent or wrong.
const fs=require('fs'),path=require('path'),assert=require('assert'),parse5=require('parse5')
const root=process.cwd(),manifest=JSON.parse(fs.readFileSync(path.join(root,'.generated/niche-thumbnails.json')))
const html=fs.readFileSync(path.join(root,'dist/art_lovers_niche.htm'),'utf8')
const all=(n,p)=>[...(p(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,p))]
const attr=(n,k)=>(n.attrs||[]).find(a=>a.name===k)?.value||''
const has=(n,c)=>attr(n,'class').split(/\s+/).includes(c)
const doc=parse5.parse(html),rows=all(doc,n=>has(n,'niche-preview')),seen=new Set()
assert.strictEqual(rows.length,Object.keys(manifest.images).length)
for(const row of rows){
 const heading=all(row,n=>n.tagName==='h2'&&has(n,'niche-preview-title'));assert.strictEqual(heading.length,1)
 const links=all(row,n=>n.tagName==='a'),title=all(heading[0],n=>n.tagName==='a');assert.strictEqual(title.length,1)
 const target=attr(title[0],'href'),slug=target.replace(/^\//,'').replace(/\.html$/,'-html')
 assert(Object.prototype.hasOwnProperty.call(manifest.images,slug));assert(!seen.has(slug));seen.add(slug)
 assert(links.every(link=>attr(link,'href')===target))
 const image=manifest.images[slug],actual=all(row,n=>n.tagName==='img')
 assert.strictEqual(actual.length,image?1:0)
 if(image){for(const [key,value]of Object.entries(image))assert.strictEqual(attr(actual[0],key),String(value));assert.strictEqual(attr(actual[0],'loading'),'lazy');assert.strictEqual(attr(actual[0],'decoding'),'async')}
}
console.log(JSON.stringify({nicheOutput:'pass',articles:rows.length,images:Object.values(manifest.images).filter(Boolean).length,matchingTitleAndImageLinks:true}))
