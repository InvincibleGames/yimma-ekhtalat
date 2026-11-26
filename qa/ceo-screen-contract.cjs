const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs');
(async()=>{
const browser=await chromium.launch();fs.mkdirSync('qa/ceo-screen-contract',{recursive:true});
for(const [mode,viewport,touch] of [['desktop',{width:1280,height:800},false],['mobile',{width:390,height:844},true]]){
 const context=await browser.newContext({viewport,isMobile:touch,hasTouch:touch});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8977/latest/');
 await page.locator('.logo').waitFor();
 for(const [action,selector,filename] of [
  ['tutorial','.tutorial-diagram','tutorial'],
  ['challenges','.challenge-row','challenges'],
  ['customize','.customize-preview','customize'],
  ['shop','.shop-grid','shop'],
  ['achievements','.ach-row','achievements'],
  ['collection','.list-grid','collection'],
  ['settings','.settings-row','settings']
 ]){
  await page.locator('[data-act="'+action+'"]').first().click();
  assert.ok(await page.locator(selector).count()>0,action+' screen must display');
  await page.screenshot({path:'qa/ceo-screen-contract/'+mode+'_'+filename+'.png'});
  await page.locator('[data-act="home"]').last().click();
 }
 await page.locator('[data-act="worlds"]').first().click();
 assert.equal(await page.locator('.world-card').count(),5);
 await page.screenshot({path:'qa/ceo-screen-contract/'+mode+'_worlds.png'});
 await page.locator('[data-world="0"]').click();
 assert.equal(await page.locator('.stage').count(),5);
 await page.screenshot({path:'qa/ceo-screen-contract/'+mode+'_stages.png'});
 await page.locator('[data-stage="1"]').click();
 assert.equal(await page.locator('.basket').count(),2);
 assert.equal(await page.locator('.basket-target-icon').count(),2);
 assert.deepEqual(await page.evaluate(()=>game.activeTypes),[0,1]);
 await page.screenshot({path:'qa/ceo-screen-contract/'+mode+'_game.png'});
 await page.evaluate(()=>pause());assert.equal(await page.locator('.pause-card').count(),1);
 await page.screenshot({path:'qa/ceo-screen-contract/'+mode+'_pause.png'});
 await page.evaluate(()=>resume());
 await page.evaluate(()=>{while(!game.over){let a=game.items[0];sortInto(a.id,a.type)}});
 assert.equal(await page.locator('.result-box').count(),1);
 await page.screenshot({path:'qa/ceo-screen-contract/'+mode+'_results.png'});
 await page.locator('[data-act="home"]').last().click();
 assert.deepEqual(errors,[]);
 await context.close();
}
const page=await browser.newPage();await page.goto('http://127.0.0.1:8977/latest/');
for(let w=0;w<5;w++)for(let l=1;l<=5;l++){
 const x=await page.evaluate(([w,l])=>{save.unlocked=25;start(w,l);let n=game.needed,pair=game.activeTypes.slice(),count=document.querySelectorAll('.basket').length;
 while(!game.over){let a=game.items[0];if(!pair.includes(a.type))throw Error('wrong category');sortInto(a.id,a.type)}
 return {n,correct:game.correct,pair,count,stars:save.stars[w*5+l]}},[w,l]);
 assert.equal(x.count,2);assert.equal(x.pair.length,2);assert.equal(x.n,x.correct);assert.ok(x.stars>=1);
}
console.log('PASS: all UI screens, all 25 stages, two active baskets, menu navigation, desktop/mobile layout; no JS errors');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});