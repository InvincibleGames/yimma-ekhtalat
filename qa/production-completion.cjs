const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("fs");
(async()=>{
const browser=await chromium.launch();
fs.mkdirSync("qa/completion-evidence",{recursive:true});
for(const [mode,viewport,touch] of [["desktop",{width:1280,height:800},false],["mobile",{width:390,height:844},true]]){
 const context=await browser.newContext({viewport,hasTouch:touch,isMobile:touch});
 const page=await context.newPage();const errors=[];
 page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:8977/latest/");
 await page.locator(".logo").waitFor();
 await page.waitForFunction(()=>typeof window.productionCompletionReady!=="undefined" || !!document.querySelector("link[href='production-completion.css']"));
 // Verify the new runtime actually loaded, not just a CSS link.
 await page.waitForFunction(()=>typeof challenges==="function"&&String(challenges).includes("production-challenge-grid"));
 assert.equal(await page.locator(".menu-buttons [data-act]").count(),5);
 await page.screenshot({path:"qa/completion-evidence/"+mode+"_main.png"});
 await page.evaluate(()=>stages(0));
 assert.equal(await page.locator(".stage-grid.stage-path .stage").count(),5);
 await page.screenshot({path:"qa/completion-evidence/"+mode+"_stage_map.png"});
 await page.evaluate(()=>tutorial());
 assert.equal(await page.locator(".production-trial").count(),1);
 const gr=await page.locator(".production-practice-grain").boundingBox();
 const tg=await page.locator(".production-trial-target").boundingBox();
 assert.ok(gr&&tg);
 const sx=gr.x+gr.width/2,sy=gr.y+gr.height/2,dx=tg.x+tg.width/2,dy=tg.y+tg.height/2;
 await page.evaluate(({sx,sy,dx,dy})=>{
  const e=document.querySelector(".production-practice-grain");
  e.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,pointerId:54,pointerType:"touch",clientX:sx,clientY:sy}));
  e.dispatchEvent(new PointerEvent("pointermove",{bubbles:true,pointerId:54,pointerType:"touch",clientX:dx,clientY:dy}));
  e.dispatchEvent(new PointerEvent("pointerup",{bubbles:true,pointerId:54,pointerType:"touch",clientX:dx,clientY:dy}));
 },{sx,sy,dx,dy});
 assert.ok((await page.locator(".production-trial-status").innerText()).includes("أحسنت"));
 await page.screenshot({path:"qa/completion-evidence/"+mode+"_tutorial.png"});
 await page.evaluate(()=>settings());assert.ok(await page.locator('.production-extra-settings').count());
 await page.locator('[data-prod="contrast"]').click();assert.ok(await page.evaluate(()=>save.highContrast));
 await page.locator('[data-prod="font"]').click();assert.ok(await page.evaluate(()=>save.largeText));
 await page.locator('[data-prod="music"]').click();assert.equal(await page.evaluate(()=>save.music),false);
 await page.screenshot({path:"qa/completion-evidence/"+mode+"_settings.png"});
 await page.evaluate(()=>{save.highContrast=false;save.largeText=false;save.music=false;persist()});
 await page.evaluate(()=>start(0,1));
 assert.equal(await page.locator(".basket").count(),2);
 assert.deepEqual(await page.evaluate(()=>game.activeTypes),[0,1]);
 await page.locator(".sorting-tray-layer").waitFor();
 const tray=await page.evaluate(async()=>{const i=document.querySelector(".sorting-tray-layer");await i.decode();return {src:i.getAttribute("src"),naturalWidth:i.naturalWidth,world:W[world].id}});
 assert.ok(tray.src.includes("W01_Kitchen.svg")&&tray.naturalWidth>0);
 const layout=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,objects:document.querySelectorAll(".play-item").length}));
 assert.ok(layout.width<=layout.viewport+2,"responsive overflow");
 assert.ok(layout.objects<=6);
 await page.screenshot({path:"qa/completion-evidence/"+mode+"_game.png"});
 const item=await page.evaluate(()=>({id:game.items[0].id,type:game.items[0].type}));
 const a=await page.locator('[data-item="'+item.id+'"]').boundingBox(),b=await page.locator('[data-bin="'+item.type+'"]').boundingBox();
 assert.ok(a&&b);
 const v={id:item.id,sx:a.x+a.width/2,sy:a.y+a.height/2,dx:b.x+b.width/2,dy:b.y+b.height/2};
 if(touch)await page.evaluate(({id,sx,sy,dx,dy})=>{
  const el=document.querySelector('[data-item="'+id+'"]');
  el.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,pointerId:77,pointerType:"touch",clientX:sx,clientY:sy}));
  document.dispatchEvent(new PointerEvent("pointermove",{bubbles:true,pointerId:77,pointerType:"touch",clientX:dx,clientY:dy}));
  document.dispatchEvent(new PointerEvent("pointerup",{bubbles:true,pointerId:77,pointerType:"touch",clientX:dx,clientY:dy}));
 },v);
 else{await page.mouse.move(v.sx,v.sy);await page.mouse.down();await page.mouse.move(v.dx,v.dy,{steps:5});await page.mouse.up()}
 assert.equal(await page.evaluate(()=>game.correct),1);
 await page.evaluate(()=>pause());assert.equal(await page.locator('[data-prod="pause-settings"]').count(),1);
 await page.locator('[data-prod="pause-settings"]').click();assert.equal(await page.locator(".production-pause-settings.active").count(),1);
 await page.screenshot({path:"qa/completion-evidence/"+mode+"_pause_settings.png"});
 await page.evaluate(()=>resume());
 await page.evaluate(()=>{while(!game.over){let a=game.items[0];sortInto(a.id,a.type)}});
 assert.ok(await page.locator('.result-box').count());
 await page.screenshot({path:"qa/completion-evidence/"+mode+"_victory.png"});
 await page.reload();assert.ok(await page.evaluate(()=>save.unlocked>=2));
 await page.evaluate(()=>{save.music=false;start(0,1);game.seconds=1;tick()});
 assert.ok(await page.locator(".production-failure").count());
 await page.screenshot({path:"qa/completion-evidence/"+mode+"_failure.png"});
 await page.evaluate(()=>{save.coins=1000;buy("flowers");equip("flowers");home()});
 assert.ok(await page.evaluate(()=>document.body.classList.contains("production-cosmetic-flowers")));
 await page.screenshot({path:"qa/completion-evidence/"+mode+"_equipped.png"});
 assert.deepEqual(errors,[]);
 await context.close();
}
const page=await browser.newPage();await page.goto("http://127.0.0.1:8977/latest/");
await page.waitForFunction(()=>String(renderPlay).includes("sorting-tray-layer"));
await page.evaluate(()=>{save.music=false;save.unlocked=25;persist()});
for(let w=0;w<5;w++){
 await page.evaluate(w=>start(w,1),w);
 const tray=await page.evaluate(async()=>{const e=document.querySelector(".sorting-tray-layer");await e.decode();return e.naturalWidth});
 assert.ok(tray>0);
 await page.screenshot({path:"qa/completion-evidence/world_"+(w+1)+"_tray.png"});
 for(let l=1;l<=5;l++){
  if(l>1)await page.evaluate(([w,l])=>start(w,l),[w,l]);
  const v=await page.evaluate(()=>{const types=game.activeTypes.slice(),bins=[...document.querySelectorAll(".basket")].map(e=>+e.dataset.bin);let ok=game.items.every(i=>types.includes(i.type));while(!game.over){let item=game.items[0];if(!types.includes(item.type))ok=false;sortInto(item.id,item.type)}return {types,bins,ok,stars:save.stars[world*5+level],max:game.items.length}});
  assert.equal(v.types.length,2);assert.deepEqual(v.bins,v.types);assert.ok(v.ok&&v.stars>=1);
 }
}
await page.evaluate(()=>challenges());assert.equal(await page.locator(".production-challenge-card").count(),2);
const info=await page.evaluate(()=>({c:save.productionChallenges.daily.sorted,levels:save.productionChallenges.weekly.stages,claim:document.querySelectorAll('[data-prod=claim]:not(:disabled)').length}));
assert.ok(info.c>0&&info.levels>=25&&info.claim>=2);
const before=await page.evaluate(()=>save.coins);
await page.locator('[data-prod=claim]:not(:disabled)').first().click();
const after=await page.evaluate(()=>save.coins);
assert.ok(after>before);
console.log("PASS: 5 original trays, 25 levels, 2 baskets, 2 item types, desktop+mobile, tutorial drag, music/settings, challenge claims, cosmetics, purchase, win/failure, saved progress");
await browser.close();
})().catch(e=>{console.error("FAIL",e);process.exit(1)});
