/* Invincible Games — CEO-approved production completion layer.
   Preserves five original world backgrounds, exactly TWO baskets and TWO object types per round.
   Loads the private production source's five actual wooden-tray SVGs. */
(()=>{"use strict";
const legacy={renderPlay,stages,home,settings,challenges,tutorial,customize,equip,shop,buy,start,draw,pause,resume,finish,sortInto};
const $p=(q)=>document.querySelector(q);
const prod={
  themes:[
    [196,246.94,293.66,329.63,293.66,246.94,196,164.81],
    [220,277.18,329.63,369.99,329.63,277.18,246.94,220],
    [261.63,329.63,392,440,392,329.63,293.66,261.63],
    [174.61,220,261.63,329.63,261.63,220,196,174.61],
    [164.81,196,246.94,293.66,246.94,220,196,164.81]
  ],
  timer:null,ctx:null,beat:0
};
const dataRoot='assets/trays/';
function safeStore(){try{persist()}catch(e){}}
function stopMusic(){if(prod.timer!==null){clearInterval(prod.timer);prod.timer=null}}
function tone(hz){
 if(!save.music||!game||game.over||game.paused)return;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  prod.ctx=prod.ctx||new AC();
  if(prod.ctx.state==='suspended'){prod.ctx.resume().catch(()=>{});return}
  const t=prod.ctx.currentTime;
  const osc=prod.ctx.createOscillator(),env=prod.ctx.createGain();
  osc.type=world===4?'sine':'triangle';
  osc.frequency.setValueAtTime(hz,t);
  env.gain.setValueAtTime(.0001,t);
  env.gain.exponentialRampToValueAtTime(.014,t+.025);
  env.gain.exponentialRampToValueAtTime(.0001,t+.29);
  osc.connect(env);env.connect(prod.ctx.destination);
  osc.start(t);osc.stop(t+.3);
 }catch(e){/* audio must never stop gameplay */}
}
function startMusic(){
 stopMusic();
 if(save.music===false||!game||game.over||game.paused)return;
 prod.beat=0;
 prod.timer=setInterval(()=>{
  if(!game||game.over||game.paused||page!=='game'){stopMusic();return}
  const steps=prod.themes[world]||prod.themes[0];
  tone(steps[(prod.beat++)%steps.length]);
 },570);
}
function periodKeys(){
 const now=new Date(),day=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 const utc=new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()));
 utc.setUTCDate(utc.getUTCDate()+4-(utc.getUTCDay()||7));
 const first=new Date(Date.UTC(utc.getUTCFullYear(),0,1));
 const wk=Math.ceil((((utc-first)/86400000)+1)/7);
 return {day,week:utc.getUTCFullYear()+'-W'+String(wk).padStart(2,'0')};
}
function currentProgress(){
 const keys=periodKeys();
 if(!save.productionChallenges||typeof save.productionChallenges!=='object')save.productionChallenges={};
 const d=save.productionChallenges;
 if(!d.daily||d.daily.id!==keys.day)d.daily={id:keys.day,sorted:0,stages:0,claimed:[]};
 if(!d.weekly||d.weekly.id!==keys.week)d.weekly={id:keys.week,sorted:0,stages:0,claimed:[]};
 return d;
}
function incrementProgress(field){
 const c=currentProgress();
 c.daily[field]=(c.daily[field]||0)+1;
 c.weekly[field]=(c.weekly[field]||0)+1;
 safeStore();
}
function claimedReward(period,id,reward){
 const p=currentProgress()[period];
 const defs=period==='daily'?{sort:12,finish:1}:{sort:50,finish:5};
 const field=id==='sort'?'sorted':'stages';
 if(!p||p.claimed.includes(id)||p[field]<defs[id])return;
 p.claimed.push(id);
 save.coins+=reward;
 safeStore();challenges();notify('تم استلام المكافأة!');try{sound(840,.18)}catch(e){}
}
function refreshCosmetics(){
 for(const cls of [...document.body.classList])if(cls.startsWith('production-cosmetic-'))document.body.classList.remove(cls);
 const chosen=save.equipped;
 if(chosen&&chosen!=='original'&&Array.isArray(save.owned)&&save.owned.includes(chosen))
  document.body.classList.add('production-cosmetic-'+chosen);
 const preview=$p('.customize-preview');
 if(preview){
  let tag=preview.querySelector('.production-cosmetic-tag');
  if(!tag){tag=document.createElement('div');tag.className='production-cosmetic-tag';preview.appendChild(tag)}
  const n=inventory.find(x=>x[0]===chosen);
  tag.textContent=n?'زينة مختارة: '+n[1]:'الزينة الأصلية';
 }
}
renderPlay=function(first=false){
 legacy.renderPlay(first);
 const scene=$p('.game-screen'),field=$p('.playfield');
 if(!scene||!field)return;
 if(!scene.querySelector('.sorting-tray-layer')){
  const img=document.createElement('img');
  img.className='sorting-tray-layer';
  img.src=dataRoot+W[world].id+'.svg';
  img.alt='';
  img.setAttribute('aria-hidden','true');
  scene.insertBefore(img,field);
 }
};
stages=function(w=world){
 legacy.stages(w);
 const grid=$p('.stage-grid');
 if(grid){
  grid.classList.add('stage-path');
  const label=document.createElement('p');label.className='stage-map-caption';
  label.textContent='طريق المراحل — خمس محطات في كل عالم';
  grid.parentElement.insertBefore(label,grid);
 }
};
home=function(){legacy.home();refreshCosmetics()};
draw=function(title,html,which){
 legacy.draw(title,html,which);
 if(which!=='home')document.querySelector('.production-splash')?.remove();
 if(which!=='game')stopMusic();
};
start=function(w=world,l=level){legacy.start(w,l);startMusic()};
pause=function(){
 legacy.pause();stopMusic();
 const card=$p('.pause-card');
 if(!card||card.querySelector('.production-pause-settings'))return;
 const holder=document.createElement('div');holder.className='production-pause-settings';
 holder.innerHTML='<div class="settings-row"><strong>الصوت</strong><button class="btn production-toggle" data-prod="sfx">المؤثرات</button></div>'+
 '<div class="settings-row"><strong>الموسيقى</strong><button class="btn production-toggle" data-prod="music">الموسيقى</button></div>'+
 '<div class="settings-row"><strong>وضوح الشاشة</strong><button class="btn production-toggle" data-prod="contrast">التباين</button></div>';
 card.appendChild(holder);
 const actions=card.querySelector('.actions');
 if(actions){const btnEl=document.createElement('button');btnEl.className='btn outline';btnEl.textContent='⚙ إعدادات الجولة';btnEl.type='button';btnEl.setAttribute('data-prod','pause-settings');actions.appendChild(btnEl)}
};
resume=function(){legacy.resume();startMusic()};
finish=function(won){
 if(won&&!game?.over)incrementProgress('stages');
 legacy.finish(won);stopMusic();
 const panel=$p('.result-box');
 if(!won&&panel){
  panel.closest('.result-page')?.classList.add('production-failure');
  const hint=document.createElement('div');hint.className='production-failure-hint';
  hint.textContent='راقب الصنفين جيداً، وأعد المحاولة. لا يوجد سوى سلتين في كل جولة.';
  const actions=panel.querySelector('.actions');panel.insertBefore(hint,actions);
 }
};
sortInto=function(itemId,bin){
 const before=game?.correct??0;
 legacy.sortInto(itemId,bin);
 if(game&&game.correct>before)incrementProgress('sorted');
};
settings=function(){
 legacy.settings();currentProgress();
 const panel=$p('.info-panel');if(!panel)return;
 const div=document.createElement('div');div.className='production-extra-settings';
 div.innerHTML='<div class="settings-row"><strong>الموسيقى الأصلية</strong><button class="btn production-toggle" data-prod="music">'+(save.music===false?'إيقاف':'تشغيل')+'</button></div>'+
 '<div class="settings-row"><strong>تباين أعلى</strong><button class="btn production-toggle" data-prod="contrast">'+(save.highContrast?'تشغيل':'إيقاف')+'</button></div>'+
 '<div class="settings-row"><strong>خط أكبر</strong><button class="btn production-toggle" data-prod="font">'+(save.largeText?'تشغيل':'إيقاف')+'</button></div>'+
 '<p style="text-align:center">اللغة: العربية • التحكم باللمس والماوس فقط</p>';
 const actions=panel.querySelector('.actions');if(actions)panel.insertBefore(div,actions);else panel.appendChild(div);
};
challenges=function(){
 currentProgress();
 legacy.challenges();const panel=$p('.info-panel');if(!panel)return;
 const challengeSets=[
  {period:'daily',title:'تحديات اليوم',list:[['sort','فرز 12 قطعة',12,'sorted',30],['finish','أكمل مرحلة',1,'stages',25]]},
  {period:'weekly',title:'تحديات الأسبوع',list:[['sort','فرز 50 قطعة',50,'sorted',80],['finish','أكمل خمس مراحل',5,'stages',100]]}
 ];
 const d=currentProgress();
 panel.innerHTML='<p>تتجدد التحديات تلقائياً وفق التاريخ المحلي للجهاز. التقدم محفوظ.</p>'+
 '<div class="production-challenge-grid">'+challengeSets.map(group=>{
  const p=d[group.period];
  return '<section class="production-challenge-card"><h3>'+group.title+'</h3>'+
  group.list.map(([id,title,goal,field,reward])=>{
   const val=Math.min(goal,p[field]||0),done=p.claimed.includes(id);
   return '<div class="challenge-row"><div><strong>'+title+'</strong><small>مكافأة '+reward+' قطعة نقدية</small></div>'+
    '<button class="btn claim-btn" type="button" data-prod="claim" data-period="'+group.period+'" data-id="'+id+'" data-reward="'+reward+'" '+(done||val<goal?'disabled':'')+'>'+
    (done?'✓ مستلمة':val>=goal?'استلام':'قيد التقدم')+'</button></div>'+
    '<progress value="'+val+'" max="'+goal+'"></progress><small>'+val+'/'+goal+'</small>';
  }).join('')+'</section>';
 }).join('')+'</div>';
 const a=document.createElement('div');a.className='actions';a.innerHTML='<button class="btn" data-act="home">↩ الرئيسية</button>';
 panel.appendChild(a);
};
tutorial=function(){
 legacy.tutorial();
 const diagram=$p('.tutorial-diagram');if(!diagram||$p('.production-trial'))return;
 const demo=document.createElement('div');demo.className='production-trial';
 demo.innerHTML='<h3>جرّب بنفسك: اسحب العيش إلى سلته</h3>'+
 '<div class="production-trial-row"><img class="production-practice-grain" draggable="false" src="'+itemImage('Rice')+'" alt="عيش"/>'+
 '<div class="production-trial-target"><img src="'+ASSETS['assets/basket_0.svg']+'" alt="سلة"/><span>عيش</span></div></div>'+
 '<div class="production-trial-status">اسحب العيش بإصبعك أو الماوس</div>';
 diagram.after(demo);
 const item=demo.querySelector('.production-practice-grain'),target=demo.querySelector('.production-trial-target');
 let dragging=null;
 item.addEventListener('pointerdown',e=>{dragging=e.pointerId;item.classList.add('dragging');try{item.setPointerCapture(e.pointerId)}catch(err){}e.preventDefault()});
 item.addEventListener('pointermove',e=>{if(dragging!==e.pointerId)return;const r=target.getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;target.classList.toggle('highlight',inside)});
 item.addEventListener('pointerup',e=>{if(dragging!==e.pointerId)return;dragging=null;item.classList.remove('dragging');const r=target.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){demo.querySelector('.production-trial-status').textContent='أحسنت! هذا هو الفرز الصحيح ✓';demo.classList.add('complete');try{sound(720,.14)}catch(err){}}else demo.querySelector('.production-trial-status').textContent='قرّب القطعة من السلة ثم أفلتها';target.classList.remove('highlight')});
 item.addEventListener('pointercancel',()=>{dragging=null;item.classList.remove('dragging');target.classList.remove('highlight')});
};
customize=function(){legacy.customize();refreshCosmetics()};
equip=function(id){legacy.equip(id);refreshCosmetics()};
shop=function(){legacy.shop();refreshCosmetics()};
buy=function(id){legacy.buy(id);refreshCosmetics()};
function updateSettingsBtn(action){
 if(action==='music'){save.music=save.music===false;stopMusic();if(save.music&&game&&!game.over&&page==='game')startMusic()}
 else if(action==='sfx'){save.sound=!save.sound}
 else if(action==='contrast'){save.highContrast=!save.highContrast}
 else if(action==='font'){save.largeText=!save.largeText}
 safeStore();applyPreferences();
 if(page==='settings')settings();
 else{
  document.querySelectorAll('[data-prod="music"]').forEach(x=>x.textContent=save.music===false?'إيقاف':'تشغيل');
  document.querySelectorAll('[data-prod="sfx"]').forEach(x=>x.textContent=save.sound?'تشغيل':'إيقاف');
  document.querySelectorAll('[data-prod="contrast"]').forEach(x=>x.textContent=save.highContrast?'تشغيل':'إيقاف');
 }
}
function applyPreferences(){
 document.documentElement.classList.toggle('production-a11y-high-contrast',!!save.highContrast);
 document.documentElement.classList.toggle('production-a11y-large-text',!!save.largeText);
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-prod]');if(!b)return;
 const action=b.dataset.prod;
 if(action==='claim'){claimedReward(b.dataset.period,b.dataset.id,Number(b.dataset.reward));return}
 if(action==='pause-settings'){const pane=$p('.production-pause-settings');pane?.classList.toggle('active');return}
 if(['music','sfx','contrast','font'].includes(action))updateSettingsBtn(action);
});
currentProgress();if(save.music===undefined)save.music=true;
applyPreferences();refreshCosmetics();safeStore();
if(!sessionStorage.getItem('yimma-splash-shown')){
 try{sessionStorage.setItem('yimma-splash-shown','1')}catch(e){}
 const splash=document.createElement('div');splash.className='production-splash';
 splash.innerHTML='<div><h2>يمّه اختلط!</h2><p>INVINCIBLE GAMES • BAHRAIN</p></div>';
 document.body.appendChild(splash);
 setTimeout(()=>splash.remove(),1300);
}
})();
