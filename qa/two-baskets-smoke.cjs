const {chromium}=require('playwright'), assert=require('node:assert/strict'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch();fs.mkdirSync('qa/two-baskets',{recursive:true});
 for(const [name,viewport,touch] of [['desktop',{width:1280,height:800},false],['mobile',{width:390,height:844},true]]){
  const ctx=await browser.newContext({viewport,isMobile:touch,hasTouch:touch});
  const page=await ctx.newPage(),errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto('http://127.0.0.1:8977/latest/');
  await page.locator('.logo').waitFor();
  await page.locator('[data-act=worlds]').first().click();assert.equal(await page.locator('.world-card').count(),5);
  await page.locator('[data-world="0"]').click();await page.locator('[data-stage="1"]').click();
  let initial=await page.evaluate(()=>({pair:game.activeTypes,types:game.items.map(x=>x.type),baskets:[...document.querySelectorAll('.basket')].map(x=>Number(x.dataset.bin))}));
  assert.deepEqual(initial.pair,[0,1],'original first round must be rice and lentil');
  assert.equal(initial.baskets.length,2);assert.deepEqual(initial.baskets,initial.pair);
  assert.ok(initial.types.every(t=>initial.pair.includes(t)));
  assert.ok(initial.types.length<=6);
  await page.screenshot({path:'qa/two-baskets/'+name+'_two_baskets.png'});
  let x=await page.evaluate(()=>{let o=game.items[0];return {id:o.id,type:o.type}}),a=await page.locator('[data-item="'+x.id+'"]').boundingBox(),c=await page.locator('[data-bin="'+x.type+'"]').boundingBox();
  assert.ok(a&&c,'two item and basket must be visible');
  let sx=a.x+a.width/2,sy=a.y+a.height/2,dx=c.x+c.width/2,dy=c.y+c.height/2;
  if(touch)await page.evaluate(({id,sx,sy,dx,dy})=>{let el=document.querySelector('[data-item="'+id+'"]');el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:93,pointerType:'touch',clientX:sx,clientY:sy}));document.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:93,pointerType:'touch',clientX:dx,clientY:dy}));document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:93,pointerType:'touch',clientX:dx,clientY:dy}))},{id:x.id,sx,sy,dx,dy});
  else{await page.mouse.move(sx,sy);await page.mouse.down();await page.mouse.move(dx,dy,{steps:5});await page.mouse.up()}
  assert.equal(await page.evaluate(()=>game.correct),1,'drag/touch should sort');
  await page.evaluate(()=>{while(!game.over){let item=game.items[0];sortInto(item.id,item.type)}});assert.equal(await page.locator('.result-box').count(),1);
  await page.reload();assert.ok(await page.evaluate(()=>save.unlocked>=2),'saved progress persisted');
  assert.deepEqual(errs,[]);await ctx.close();
 }
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8977/latest/');
 for(let w=0;w<5;w++)for(let l=1;l<=5;l++){
  let got=await page.evaluate(([w,l])=>{
   save.unlocked=25;start(w,l);const pairs=[...game.activeTypes];const initial=game.items.map(x=>x.type);
   const shown=[...document.querySelectorAll('.basket')].map(e=>Number(e.dataset.bin));
   let allValid=initial.every(x=>pairs.includes(x));let maxItems=initial.length;
   while(!game.over){let x=game.items[0];if(!pairs.includes(x.type))allValid=false;sortInto(x.id,x.type);if(game?.items?.length>maxItems)maxItems=game.items.length}
   return {pairs,shown,allValid,maxItems,correct:game.correct,needed:game.needed,stars:save.stars[w*5+l]};
  },[w,l]);
  assert.equal(got.pairs.length,2);assert.notEqual(got.pairs[0],got.pairs[1]);
  assert.deepEqual(got.shown,got.pairs);
  assert.ok(got.allValid);assert.ok(got.maxItems<=6);
  assert.equal(got.correct,got.needed);assert.ok(got.stars>=1);
  if(l===1)await page.screenshot({path:'qa/two-baskets/world_'+(w+1)+'_result.png'});
 }
 await page.evaluate(()=>start(4,1));assert.equal(await page.locator('.basket').count(),2);assert.equal(await page.locator('.hud-pill').count(),6);
 await page.evaluate(()=>{let x=game.items[0];sortInto(x.id,game.activeTypes.find(t=>t!==x.type))});assert.deepEqual(await page.evaluate(()=>[game.hearts,game.mistakes]),[2,1]);
 await page.evaluate(()=>pause());assert.equal(await page.locator('.pause-cover').count(),1);await page.evaluate(()=>resume());await page.evaluate(()=>{game.seconds=1;tick()});assert.equal(await page.locator('.result-box').count(),1);
 assert.equal(await page.evaluate(()=>W[4].name),'ساحل الغوص');
 console.log('PASS two baskets ONLY, two item types per round, 25 stages, mobile touch, desktop drag, progress persistence, wrong drop, pause, timeout and world name');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});