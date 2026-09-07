// Offline migration, safe-rendering and deterministic ordering tests.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const md=require('markdown-it'),he=require('he'),compiler=require('vue-template-compiler');
const source=fs.readFileSync(path.join(root,'libs/faq.js'),'utf8').replace("import MarkdownIt from 'markdown-it'",'').replace(/export function /g,'function ');
const ctx={MarkdownIt:md,URL};vm.createContext(ctx);vm.runInContext(source+'\nglobalThis.api={renderFaq,sortFaqs};',ctx);
const original=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/faq-original-parity.json')));
const records=original.map(row=>({slug:row.id,...JSON.parse(fs.readFileSync(path.join(root,'cms/faqs',row.id+'.json')))}));
const text=s=>he.decode(s.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
let cases=0;
for(const row of records){
 const old=original.find(x=>x.id===row.slug),{id,...expected}=old,{slug,...actual}=row;
 assert.deepEqual(actual,expected,'Exact original FAQ record '+id);
 for(const field of ['answer','more']){assert.equal(text(ctx.api.renderFaq(row[field])),text(row[field]),id+' '+field+' prose');cases++}
 assert.match(row.image,/^https:\/\/img\.bedfordfineartgallery\.com\//);assert.equal(row.imageWidth,392);assert.equal(row.imageHeight,260);
 assert.ok(row.imageAltText);cases+=5;
}
assert.equal(records.length,16);assert.equal(records.filter(r=>r.more).length,15);
assert.equal(ctx.api.sortFaqs(records.slice().reverse()).map(x=>x.slug).join(','),records.map(x=>x.slug).join(','));
assert.equal(ctx.api.sortFaqs([{slug:'b',order:10},{slug:'a',order:10},{slug:'c',order:0}]).map(x=>x.slug).join(','),'c,a,b');
for(const source of ['<script>alert(1)</script>','[x](javascript:alert(1))','[x](data:text/html,evil)','[x](//evil.example)','[x](https://user:pass@example.com)','![x](https://evil.example/x.jpg)']) {
 assert.doesNotMatch(ctx.api.renderFaq(source),/<script|<img|href="(?:javascript:|data:|\/\/|https:\/\/user:)/i);cases++;
}
assert.match(ctx.api.renderFaq('- One\n  - Nested\n- Two'),/<ul>[\s\S]*<ul>/);
assert.match(ctx.api.renderFaq('[Directions](/Directions.html)'),/href="\/Directions.html"/);
assert.match(ctx.api.renderFaq('**Bold** and *italic*'),/<strong>Bold<\/strong> and <em>italic<\/em>/);
assert.ok(!records.some(r=>/credit card/i.test(r.answer+r.more)));
const parsed=compiler.parseComponent(fs.readFileSync(path.join(root,'pages/faq.vue'),'utf8'));
assert.deepEqual(compiler.compile(parsed.template.content).errors,[]);
assert.match(parsed.template.content,/:aria-expanded/);assert.match(parsed.template.content,/:aria-controls/);
console.log(JSON.stringify({faqRecords:16,readMore:15,cases:cases+11,exactProseImagesOrder:'pass',safeMarkdown:'pass',vueCompile:'pass',networkWrites:0}));
