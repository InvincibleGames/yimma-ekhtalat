const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('fs');
(async()=>{
const browser=await chromium.launch();fs.mkdirSync('qa/art-fidelity',{recursive:true});
const ids=['Rice','Lentil','Chickpea','MungBean','KidneyBean','Cardamom','Clove','Peppercorn','Coriander','StarAnise','PinkSweet','YellowSweet','GreenSweet','Chocolate','CandyBall','BlueButton','RedButton','PearlBead','WoodBead','Pearl','SeaGlass','Shell','Stone'];
for(const id of ids){
 const response=await fetch('http://127.0.0.1:8977/latest/assets/items-v2/'+id+'.svg');
 assert.equal(response.status,200,id+' SVG must be reachable');
 const svg=await response.text();assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'),id);
 assert.ok(!svg.includes('🎯')&&!svg.includes('font-family')&&!svg.includes('<text'),id+' should not fall back to emoji/text');
}
for(const [mode,viewport,touch] of [['desktop',{width:1280,height:800},false],['mobile',{width:390,height:844},true]]){
 const ctx=await browser.newContext({viewport,isMobile:touch,hasTouch:touch});const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8977/latest/');await page.locator('.logo').waitFor();
 await page.locator('[data-act=worlds]').first().click();assert.equal(await page.locator('.world-card').count(),5);
 await page.locator('[data-world="0"]').click();await page.locator('[data-stage="1"]').click();
 assert.equal(await page.locator('.basket').count(),2);assert.equal(await page.locator('.basket-target-icon').count(),2);
 let a=await page.evaluate(()=>({types:game.activeTypes,itemTypes:game.items.map(x=>x.type),imgs:[...document.querySelectorAll('.basket-target-icon,.play-item')].map(i=>({ok:i.complete&&i.naturalWidth>0,url:i.currentSrc}))}));
 assert.deepEqual(a.types,[0,1]);assert.ok(a.itemTypes.every(v=>a.types.includes(v)));assert.ok(a.imgs.every(i=>i.ok));
 assert.ok(a.imgs.every(i=>i.url.includes('/items-v2/')));
 await page.screenshot({path:'qa/art-fidelity/'+mode+'_first_round.png'});
 const item=await page.evaluate(()=>({id:game.items[0].id,type:game.items[0].type}));
 let p=await page.locator('[data-item="'+item.id+'"]').boundingBox(),q=await page.locator('[data-bin="'+item.type+'"]').boundingBox();
 assert.ok(p&&q);let sx=p.x+p.width/2,sy=p.y+p.height/2,dx=q.x+q.width/2,dy=q.y+q.height/2;
 if(touch)await page.evaluate(({id,sx,sy,dx,dy})=>{let el=document.querySelector('[data-item="'+id+'"]');el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:88,pointerType:'touch',clientX:sx,clientY:sy}));document.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:88,pointerType:'touch',clientX:dx,clientY:dy}));document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:88,pointerType:'touch',clientX:dx,clientY:dy}));},{id:item.id,sx,sy,dx,dy});
 else{await page.mouse.move(sx,sy);await page.mouse.down();await page.mouse.move(dx,dy,{steps:5});await page.mouse.up()}
 assert.equal(await page.evaluate(()=>game.correct),1);
 for(let w=0;w<5;w++){await page.evaluate(w=>{save.unlocked=25;start(w,1)},w);
 await page.waitForTimeout(200);
 const state=await page.evaluate(()=>({pair:game.activeTypes,pics:[...document.querySelectorAll('.basket-target-icon,.play-item')].map(i=>({ok:i.complete&&i.naturalWidth>0,url:i.currentSrc}))}));
 assert.equal(state.pair.length,2);assert.ok(state.pics.every(i=>i.ok));assert.ok(state.pics.every(i=>i.url.includes('/items-v2/')));
 await page.screenshot({path:'qa/art-fidelity/'+mode+'_world_'+(w+1)+'.png'});}
 assert.deepEqual(errors,[]);await ctx.close();
}
const page=await browser.newPage();await page.goto('http://127.0.0.1:8977/latest/');
for(let w=0;w<5;w++)for(let l=1;l<=5;l++){let x=await page.evaluate(([w,l])=>{save.unlocked=25;start(w,l);const pair=game.activeTypes.slice();let bs=[...document.querySelectorAll('.basket')].map(b=>Number(b.dataset.bin));let good=game.items.every(i=>pair.includes(i.type));while(!game.over){let it=game.items[0];if(!pair.includes(it.type))good=false;sortInto(it.id,it.type)}return {pair,bs,good,stars:save.stars[w*5+l]}},[w,l]);assert.equal(x.pair.length,2);assert.deepEqual(x.pair,x.bs);assert.ok(x.good);assert.ok(x.stars>=1)}
console.log('PASS 23 custom images, 5 worlds, 25 stages, 2 baskets, sprite decode, desktop/mobile controls, zero JS errors');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});