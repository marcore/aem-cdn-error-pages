import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const VPS = { desktop:[1440,900], tablet:[768,1024], mobile:[390,844] };
const pages = ['index.html?code=503','index.html?code=404','index.html?code=403','index.html?code=500&lang=de','index.html?code=406&lang=es','simulate-503.html'];
const b = await chromium.launch();
await mkdir('validation', { recursive:true });
let issues = 0;
for (const pg of pages) for (const [vp,[w,hh]] of Object.entries(VPS)) {
  const ctx = await b.newContext({ viewport:{width:w,height:hh} });
  const p = await ctx.newPage(); const errs=[];
  p.on('console', m=>{ if(['error','warning'].includes(m.type())) errs.push(m.text()); });
  p.on('pageerror', e=>errs.push('pageerror '+e.message));
  p.on('requestfailed', r=>errs.push('reqfail '+r.url()));
  p.on('response', r=>{ if(r.status()>=400) errs.push(r.status()+' '+r.url()); });
  await p.goto('http://localhost:8765/'+pg); await p.waitForTimeout(400);
  const chk = await p.evaluate(()=>({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    h1: document.querySelector('h1')?.textContent, logoOk: !!document.querySelector('svg.mc-logo'),
    retry: document.querySelector('.mc-retry')?.textContent, lang: document.documentElement.lang,
    imgsNoAlt: [...document.images].filter(i=>!i.alt).length }));
  if (chk.overflow || errs.length || !chk.logoOk || chk.imgsNoAlt) issues++;
  console.log(vp.padEnd(8), pg.padEnd(28), JSON.stringify(chk), errs.join(' | '));
  const name = pg.replace(/[?&=.]/g,'_');
  if (['index_html_code_503','simulate-503_html','index_html_code_404'].includes(name) || vp==='desktop')
    await p.screenshot({ path:`validation/${name}-${vp}.png`, fullPage:true });
  // keyboard: first tab stop
  await ctx.close();
}
await b.close(); console.log('issues:', issues);
