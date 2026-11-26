
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs');
(async()=>{
const browser=await chromium.launch(),dir='qa/full-audit-evidence';fs.mkdirSync(dir,{recursive:true});
const report={screens:[],pass:[],gaps:[],responsive:[]},check=(cond,name)=>{assert.ok(cond,name);report.pass.push(name)};
for(const [mode,viewport,touch] of [['desktop',{width:1280,height:800},false],['mobile',{width:390,height:844},true]]){
 const ctx=await browser.newContext({viewport,isMobile:touch,hasTouch:touch}),p=await ctx.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(String(e.message)));
 await p.goto('http://127.0.0.1:8977/latest/');await p.locator('.logo').waitFor();
 check(await p.locator('.menu-buttons [data-act]').count()===5,mode+' five main actions');
 check(await p.evaluate(()=>page)==='home',mode+' first screen home');
 report.gaps.push(mode+': splash is optional in More, not initial loading screen');
 await p.screenshot({path:dir+'/'+mode+'_main.png'});report.screens.push(mode+'_main');
 for(const [name,expr,selector] of [
 ['worlds','worlds()','.world-card'],['stages','stages(0)','.stage'],
 ['intro','intro()','.splash-characters'],['tutorial','tutorial()','.tutorial-diagram'],
 ['challenges','challenges()','.challenge-row'],['achievements','achievements()','.ach-row'],
 ['shop','shop()','.shop-card'],['customize','customize()','.customize-preview'],
 ['collection','collection()','.small-card'],['settings','settings()','.settings-row']
 ]){
 await p.evaluate(expr);check(await p.locator(selector).count()>0,mode+' '+name+' renders');
 let lay=await p.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
 report.responsive.push({mode,name,overflow:lay.width>lay.viewport,width:lay.width});
 await p.screenshot({path:dir+'/'+mode+'_'+name+'.png'});report.screens.push(mode+'_'+name);
 }
 await p.evaluate(()=>start(0,1));
 check(await p.locator('.basket').count()===2,mode+' exactly two baskets');
 check((await p.evaluate(()=>game.activeTypes)).join(',')==='0,1',mode+' rice and lentils first');
 check(await p.locator('.basket-target-icon').count()===2,mode+' matching basket icons');
 if(await p.locator('[class*="tray"],img[src*="tray"]').count()===0)report.gaps.push(mode+': game has no central sorting tray');
 await p.screenshot({path:dir+'/'+mode+'_game.png'});report.screens.push(mode+'_game');
 const obj=await p.evaluate(()=>({id:game.items[0].id,type:game.items[0].type}));
 const a=await p.locator('[data-item="'+obj.id+'"]').boundingBox(),b=await p.locator('[data-bin="'+obj.type+'"]').boundingBox();
 check(!!a&&!!b,mode+' item and basket bounds');
 const vals={id:obj.id,sx:a.x+a.width/2,sy:a.y+a.height/2,dx:b.x+b.width/2,dy:b.y+b.height/2};
 if(touch)await p.evaluate(v=>{const el=document.querySelector('[data-item="'+v.id+'"]');el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:45,pointerType:'touch',clientX:v.sx,clientY:v.sy}));document.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:45,pointerType:'touch',clientX:v.dx,clientY:v.dy}));document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:45,pointerType:'touch',clientX:v.dx,clientY:v.dy}));},vals);
 else{await p.mouse.move(vals.sx,vals.sy);await p.mouse.down();await p.mouse.move(vals.dx,vals.dy,{steps:4});await p.mouse.up()}
 check(await p.evaluate(()=>game.correct)===1,mode+' direct drag or touch sorts');
 await p.evaluate(()=>pause());check(await p.locator('.pause-card').count()===1,mode+' pause');
 if(await p.locator('.pause-card [data-act="settings"]').count()===0)report.gaps.push(mode+': pause lacks settings');
 await p.screenshot({path:dir+'/'+mode+'_pause.png'});report.screens.push(mode+'_pause');
 await p.evaluate(()=>resume());await p.evaluate(()=>{while(!game.over){let o=game.items[0];sortInto(o.id,o.type)}});
 check(await p.locator('.result-box').count()===1,mode+' victory screen');
 await p.screenshot({path:dir+'/'+mode+'_victory.png'});report.screens.push(mode+'_victory');
 await p.reload();check(await p.evaluate(()=>save.unlocked>=2),mode+' unlock survives reload');
 await p.evaluate(()=>start(0,1));await p.evaluate(()=>{game.seconds=1;tick()});
 check((await p.locator('.result-box').innerText()).includes('حاول مرة أخرى'),mode+' failure state');
 await p.screenshot({path:dir+'/'+mode+'_failure.png'});report.screens.push(mode+'_failure');
 let cosmetics=await p.evaluate(()=>{save.coins=1000;shop();const id=inventory[0][0];buy(id);customize();equip(id);home();return {bought:save.owned.includes(id),equipped:save.equipped===id,characterFiles:Object.keys(ASSETS).filter(x=>x.includes('characters'))}});
 check(cosmetics.bought&&cosmetics.equipped,mode+' shop purchase/equip state');
 if(cosmetics.characterFiles.length===1)report.gaps.push(mode+': purchased cosmetics do not change character artwork; only a label');
 await p.evaluate(()=>settings());let settingText=await p.locator('.info-panel').innerText();
 if(!settingText.includes('اللغة')||!settingText.includes('التباين'))report.gaps.push(mode+': settings missing language and contrast options');
 check(errors.length===0,mode+' no browser JS errors');await ctx.close();
}
const p=await browser.newPage();await p.goto('http://127.0.0.1:8977/latest/');
const names=await p.evaluate(()=>W.map(x=>({name:x.name,items:x.items.map(y=>y[0])})));
check(names.length===5&&names[4].name==='ساحل الغوص','five worlds correct titles');
check(names.map(x=>x.items.length).join(',')==='5,5,5,4,4','23 item categories placed in correct worlds');
for(let w=0;w<5;w++)for(let l=1;l<=5;l++){
 const result=await p.evaluate(([w,l])=>{save.unlocked=25;start(w,l);const pair=game.activeTypes.slice(),bins=[...document.querySelectorAll('.basket')].map(x=>Number(x.dataset.bin));let valid=game.items.every(x=>pair.includes(x.type)),max=game.items.length;while(!game.over){let it=game.items[0];if(!pair.includes(it.type))valid=false;sortInto(it.id,it.type);max=Math.max(max,game.items.length)}return {pair,bins,valid,max,stars:save.stars[w*5+l]}},[w,l]);
 check(result.pair.length===2&&new Set(result.pair).size===2&&result.pair.join(',')===result.bins.join(',')&&result.valid&&result.max<=6&&result.stars>=1,'world '+(w+1)+' stage '+l+' pair, routing, completion');
}
const decoded=await p.evaluate(async()=>Promise.all(W.flatMap(w=>w.items).map(async ([id])=>{const i=new Image();i.src=itemImage(id);try{await i.decode();return true}catch(e){return false}})));
check(decoded.length===23&&decoded.every(Boolean),'23 original categorized assets decoded');
report.gaps.push('Level-map screen is stage-grid, not illustrated route/path map');
report.gaps.push('Challenges are permanent milestones, not daily/weekly system');
report.gaps.push('Audio is synthesized feedback only, no original 5-world music');
report.gaps.push('Original painted PNG cutouts and exact character master poses are absent from live game');
report.summary={checkedScreens:report.screens.length,hardPasses:report.pass.length,designGaps:report.gaps.length,anyHorizontalOverflow:report.responsive.some(x=>x.overflow)};
fs.writeFileSync(dir+'/report.json',JSON.stringify(report,null,2));
console.log('AUDIT_PASS '+JSON.stringify(report.summary));console.log('DESIGN_GAPS '+JSON.stringify(report.gaps));
await browser.close();
})().catch(e=>{console.error('AUDIT_FATAL',e);process.exit(1)});
