
/* YIMMA EKHTALAT — Invincible Games. GAME-009 complete private browser source.
   Five Bahraini worlds, 25 stages, touch sweeping/drag, layered art,
   local save, rewards, challenges, shop, achievements and original audio.
   Public promotion is a separate verified release step. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const root=$("screen"),toastBox=$("toast"),header=$("headerTitle"),coinsTop=$("coinsTop"),back=$("backBtn"),audioBtn=$("audioBtn");
const ARTBASE=/\/release\/final\//.test(location.pathname)?"../../art/05_gameplay/polished_v2/":"../game-007/assets/";
const WORLDS=[
 {id:"W01_Kitchen",name:"مطبخ الدار",desc:"رتّب حبوب الدار في السلال",icon:"🍚",tone:[0,4,7,12,7,4,2,0],items:[["Rice","عيش"],["Lentil","عدس"],["Chickpea","حمص"],["MungBean","ماش"],["KidneyBean","فاصوليا"]]},
 {id:"W02_Spice_Market",name:"سوق البهارات",desc:"الهيل والقرنفل والفلفل والتوابل",icon:"🫚",tone:[0,2,5,9,7,5,2,0],items:[["Cardamom","هيل"],["Clove","قرنفل"],["Peppercorn","فلفل"],["Coriander","كزبرة"],["StarAnise","يانسون"]]},
 {id:"W03_Sweets",name:"دكان الحلويات",desc:"ألوان الحلوى وأشكالها",icon:"🍬",tone:[0,4,9,11,9,7,4,2],items:[["PinkSweet","حلوى وردية"],["YellowSweet","صفراء"],["GreenSweet","خضراء"],["Chocolate","شوكولاتة"],["CandyBall","سكاكر"]]},
 {id:"W04_Crafts",name:"ورشة الحرف",desc:"فرز الخرز والأزرار والقطع",icon:"🧵",tone:[0,5,7,10,7,5,3,0],items:[["BlueButton","زر أزرق"],["RedButton","زر أحمر"],["PearlBead","خرز"],["WoodBead","خشب"]]},
 {id:"W05_Pearl_Coast",name:"ساحل الغوص",desc:"اللؤلؤ والأصداف وكنوز البحر",icon:"🐚",tone:[0,3,7,10,12,10,7,3],items:[["Pearl","لؤلؤ"],["Shell","أصداف"],["SeaGlass","زجاج بحري"],["Stone","حصى"]]}
];
const WORLD_COUNT=WORLDS.length, LEVEL_COUNT=5, SAVE_KEY="yimma_full_heritage_v9";
const SKINS=[
 {id:"mahogany",name:"خشب المحرق",price:0,color:"#6c412a",rim:"#e7ab45",icon:"🪵"},
 {id:"pearl",name:"لؤلؤ البحر",price:140,color:"#35606b",rim:"#f7eac6",icon:"🐚"},
 {id:"souq",name:"سوق البحرين",price:220,color:"#7f3228",rim:"#ffd37e",icon:"🏮"},
 {id:"gold",name:"الذهب الملكي",price:370,color:"#574122",rim:"#ffcf55",icon:"👑"}
];
const POWERUPS=[
 {id:"slow",name:"إبطاء الوقت",price:35,icon:"⌛",desc:"أضف 15 ثانية للجولة"},
 {id:"magnet",name:"الجذب",price:45,icon:"🧲",desc:"يساعدك في فرز أقرب 4 قطع"},
 {id:"double",name:"نقاط ×2",price:60,icon:"✨",desc:"ضاعف نقاط الفرز التالية"}
];
const ACHIEVEMENTS=[
 ["first","البداية الحلوة","أنهِ أول مرحلة","🌟",s=>s.wins>=1],
 ["sort100","يد سريعة","افرز 100 قطعة","🖐️",s=>s.sortedTotal>=100],
 ["combo8","سلسلة ذهبية","كومبو 8 مرات","🔥",s=>s.bestCombo>=8],
 ["worlds","جولة بحرينية","اربح مرحلة في كل عالم","🌍",s=>Object.keys(s.stars).filter(k=>s.stars[k]>0).map(k=>+k.split("-")[0]).filter((v,i,a)=>a.indexOf(v)===i).length>=5],
 ["rich","صانع المال","اجمع 500 عملة","🪙",s=>s.earnedTotal>=500],
 ["all","الأسطورة","احصل على نجمة بكل 25 مرحلة","👑",s=>Object.values(s.stars).filter(n=>n>0).length>=25]
];
const defaultSave=()=>({coins:60,earnedTotal:60,stars:{},best:0,wins:0,plays:0,sortedTotal:0,bestCombo:0,wrongTotal:0,owned:["mahogany"],skin:"mahogany",power:{slow:2,magnet:1,double:1},audio:true,music:true,reducedMotion:false,highContrast:false,claimed:{},daily:{date:"",sorted:0,combo:0,rounds:0},showTutorial:true});
function loadSave(){try{const p=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");return p&&p.stars?Object.assign(defaultSave(),p,{power:Object.assign(defaultSave().power,p.power||{}),daily:Object.assign(defaultSave().daily,p.daily||{})}):defaultSave()}catch{return defaultSave()}}
let save=loadSave();
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){}}
function safeDate(){return new Date().toISOString().slice(0,10)}
function daily(){const date=safeDate();if(save.daily.date!==date){save.daily={date,sorted:0,combo:0,rounds:0};save.claimed={};persist()}return save.daily}
daily();
let state={screen:"main",world:0,level:1,paused:false,last:"main",returnTo:"main",result:null,round:null,ctx:null,canvas:null,raf:0,modal:"",feedback:"",feedbackAt:0};
const textureData=WORLDS.map(w=>{
 const prefix=ARTBASE+w.id+"/";
 const load=path=>{const image=new Image();image.decoding="async";image.src=prefix+path;return image};
 return {background:load("background.svg"),tray:load("tray.svg"),basket:load("basket_1.svg"),items:w.items.map(it=>load("item_"+it[0]+".svg"))};
});
const imageReady=img=>!!(img&&img.complete&&img.naturalWidth>0);
const assetUrl=i=>ARTBASE+WORLDS[i].id+"/background.svg";
document.documentElement.style.setProperty("--kitchen-image",'url("'+assetUrl(0)+'")');
function clamp(n,a,b){return Math.min(b,Math.max(a,n))}
function rand(a,b){return a+Math.random()*(b-a)}
function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function nfmt(n){return Math.floor(n).toLocaleString("en-US")}
function levelKey(w,l){return w+"-"+l}
function getStars(w,l){return save.stars[levelKey(w,l)]||0}
function isUnlocked(w,l){return l===1||getStars(w,l-1)>0}
function worldStars(w){let n=0;for(let l=1;l<=LEVEL_COUNT;l++)n+=getStars(w,l);return n}
function starsGraphic(n){return '<span aria-label="'+n+' نجوم" class="star-result">'+"★".repeat(n)+"☆".repeat(3-n)+"</span>"}
function toast(text){toastBox.textContent=text;toastBox.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>toastBox.classList.remove("show"),2800)}
function view(title,html,screen){state.screen=screen;header.textContent=title;root.innerHTML=html;back.hidden=screen==="main"||screen==="game";coinsTop.textContent=nfmt(save.coins);audioBtn.textContent=save.audio?"♫":"♪";document.body.classList.toggle("contrast",save.highContrast);if(screen==="game")initCanvas();scrollTo({top:0,behavior:"instant"})}
function btn(action,text,klass="",extra=""){return '<button type="button" class="'+klass+'" data-action="'+action+'" '+extra+'>'+text+'</button>'}
function heading(text){return '<div class="section-heading"><div class="plaque">'+text+'</div></div>'}
function home(){if(state.round)state.round=null;state.paused=false;let sum=Object.values(save.stars).reduce((a,b)=>a+b,0);
 const html='<section class="hero"><div class="gold-frame hero-content"><div class="game-logo"><div class="weave">❖ ✧ ❖ ✧ ❖</div><h1>يمّه اختلط!</h1><span class="english">Yimmah Ekhtalat!</span></div><p class="hero-description">يمّه! اختلط العيش والعدس! فرّز كل شي بإصبعك في خمس عوالم بحرينية، واجمع النجوم وافتح المراحل.</p><div class="hero-top-meta"><span class="pill">⭐ '+sum+' نجمة</span><span class="pill">🏆 أعلى نتيجة '+nfmt(save.best)+'</span></div><div class="menu-stack">'+btn("worlds","▶ ابدأ اللعب","btn-big")+btn("challenges","🏆 التحديات","cream")+btn("shop","🪙 المتجر")+btn("achievements","⭐ الإنجازات","cream")+btn("customize","🎨 التخصيص")+btn("tutorial","؟ طريقة اللعب","cream")+'</div></div><div class="gold-frame hero-scene"><img class="characters" src="characters.svg" alt="الجدة البحرينية وحفيدها" /></div></section>';
 view("يمّه اختلط!",html,"main");
}
function worlds(){const cards=WORLDS.map((w,i)=>'<button class="world-card" data-action="world" data-world="'+i+'"><img class="world-art" src="'+assetUrl(i)+'" alt="" loading="lazy"><span class="nameplate">'+w.icon+" "+w.name+'</span><span class="progress">⭐ '+worldStars(i)+'/15 • '+w.desc+'</span></button>').join("");
 view("العوالم",heading("اختر العالم")+'<div class="cards-grid">'+cards+'</div><div class="btn-row">'+btn("home","⌂ الرئيسية","cream")+'</div>',"worlds");
}
function levels(w){state.world=w;let obj=WORLDS[w], nodes="";
 for(let l=1;l<=LEVEL_COUNT;l++){let open=isUnlocked(w,l),st=getStars(w,l);nodes+='<button class="level-node '+(open?"":"locked")+'" data-action="level" data-level="'+l+'" '+(open?"":"disabled")+' aria-label="المرحلة '+l+'">'+(open?l:"🔒")+(open?"":"")+'</button>';}
 let html='<section class="level-layout"><div class="level-map gold-frame" style="background-image:url(\''+assetUrl(w)+'\')"><div class="map-title">'+heading(obj.name)+'</div><div class="level-route"><span class="pathline"></span>'+nodes+'</div></div><div class="gold-frame level-sidebar"><div class="plaque">'+obj.icon+' مراحل '+obj.name+'</div><img src="'+assetUrl(w)+'" alt="'+obj.name+'"><p>'+obj.desc+'</p><div class="pill">مجموع النجوم ⭐ '+worldStars(w)+'/15</div><p>أكمل المرحلة لتفتح المرحلة اللي بعدها</p>'+btn("worlds","↶ العوالم","cream")+'</div></section>';
 view("مراحل "+obj.name,html,"levels");
}
function rewardCoins(n){save.coins+=n;save.earnedTotal+=n;persist()}
function stage(w,l){w=clamp(w,0,4);l=clamp(l,1,5);if(!isUnlocked(w,l)){toast("هالمرحلة للحين مقفلة");return}
 const goal=11+l*3+(w>=3?2:0),time=Math.max(49,88-w*4-l*6);
 state.world=w;state.level=l;state.paused=false;state.feedback="";
 const round={goal,time,maxTime:time,score:0,sorted:0,wrong:0,combo:0,maxCombo:0,powerMult:0,spawnAt:7,items:[],particles:[],pointers:new Map(),lastTime:performance.now(),freeze:0,effects:[],ended:false};
 state.round=round;
 for(let i=0;i<28+l*4+w*3;i++)spawnItem(round);
 save.plays++;persist();startMusic(w);
 renderGame();if(save.showTutorial && save.plays===1){state.paused=true;showTutorialOverlay()}
}
function spawnItem(r){if(r.items.length>=105)return;const type=Math.floor(Math.random()*WORLDS[state.world].items.length);
 r.items.push({id:Math.random(),type,x:rand(.12,.88),y:rand(.19,.59),vx:rand(-.025,.025),vy:rand(-.01,.01),rot:rand(-.3,.3),held:false})}
function gameHud(){const r=state.round;return '<div class="game-hud"><div class="hudbox">🌍 <b>'+WORLDS[state.world].name+'</b></div><div class="hudbox">مرحلة <b>'+state.level+'</b></div><div class="hudbox">⏳ <b id="timerVal">'+Math.ceil(r.time)+'</b></div><div class="hudbox">🏆 <b id="scoreVal">'+nfmt(r.score)+'</b></div><div class="hudbox">🔥 <b id="comboVal">'+r.combo+'</b></div>'+btn("pause","Ⅱ إيقاف")+'</div>'}
function renderGame(){const html='<div class="game-shell">'+gameHud()+'<div class="play-stage" id="playStage"><canvas id="gameCanvas" aria-label="ساحة فرز الأشياء بالأصبع والماوس"></canvas><div class="feedback-pill hidden" id="feedback"></div><div class="pause-layer hidden" id="pauseOverlay"></div></div><div class="game-help"><span>☝️ اسحب القطعة للسلة المطابقة، أو مرّر إصبعك لدفع قطع كثيرة.</span><span>الهدف: <b id="goalVal">'+state.round.sorted+'/'+state.round.goal+'</b></span>'+btn("powerpanel","⚡ المعززات","cream")+'</div></div>';
 view(WORLDS[state.world].name,html,"game");
}
function popup(html){const el=$("pauseOverlay");el.classList.remove("hidden");el.innerHTML='<div class="gold-frame" style="display:flex;flex-direction:column;align-items:center;gap:15px;text-align:center;width:min(450px,90%);padding:27px">'+html+'</div>'}
function pause(){if(!state.round)return;state.paused=true;popup('<div class="plaque">إيقاف مؤقت</div><p>المرحلة '+state.level+' • '+WORLDS[state.world].name+'</p>'+btn("resume","▶ متابعة","btn-big")+btn("retry","↻ إعادة المرحلة","cream")+btn("levels","↶ خريطة المراحل"))}
function resume(){state.paused=false;const v=$("pauseOverlay");if(v)v.classList.add("hidden");if(state.round)state.round.lastTime=performance.now()}
function showTutorialOverlay(){popup('<div class="plaque">شلون تلعب؟</div><p>☝️ اضغط على قطعة واسحبها إلى السلة اللي عليها اسمها.<br>تقدر تمرر إصبعك وتدفع قطع كثيرة مع بعض، من دون عيدان!</p>'+btn("tutorialDone","فهمت، ابدأ اللعب","btn-big"))}
function gameFeedback(text){state.feedback=text;state.feedbackAt=performance.now()+1100;const el=$("feedback");if(el){el.textContent=text;el.classList.remove("hidden")}}
function updateHud(){const r=state.round;if(!r)return;for(const [id,val] of [["timerVal",Math.ceil(r.time)],["scoreVal",nfmt(r.score)],["comboVal",r.combo],["goalVal",r.sorted+"/"+r.goal]]){const e=$(id);if(e)e.textContent=val}}
function success(type){const r=state.round;r.sorted++;r.combo++;r.maxCombo=Math.max(r.maxCombo,r.combo);save.bestCombo=Math.max(save.bestCombo,r.combo);save.sortedTotal++;daily().sorted++;daily().combo=Math.max(daily().combo,r.combo);
 const gain=(10+Math.min(r.combo-1,10)*2)*(r.powerMult>0?2:1);r.score+=gain;if(r.powerMult>0)r.powerMult--;gameFeedback("+"+gain+"  ✓ "+WORLDS[state.world].items[type][1]+(r.combo>1?" • كومبو "+r.combo:""));effect("correct");if(r.combo>=4)effect("combo");if(r.sorted>=r.goal)endRound(true);updateHud()}
function failure(){const r=state.round;r.wrong++;save.wrongTotal++;r.combo=0;r.score=Math.max(0,r.score-7);gameFeedback("يمّه! مو هذي السلة");effect("wrong");updateHud()}
function endRound(won){const r=state.round;if(!r||r.ended)return;r.ended=true;state.paused=true;save.daily.rounds++;let stars=0,reward=0;
 if(won){stars=r.wrong===0&&r.time>r.maxTime*.3?3:r.wrong<=3?2:1;let key=levelKey(state.world,state.level);save.stars[key]=Math.max(stars,save.stars[key]||0);save.wins++;reward=20+stars*15+state.level*4;rewardCoins(reward);}
 else persist();
 save.best=Math.max(save.best,r.score);persist();state.result={won,stars,score:r.score,correct:r.sorted,wrong:r.wrong,reward,time:Math.floor(r.time),world:state.world,level:state.level};if(won){effect("victory");}
 state.round=null;results();
}
function results(){const v=state.result;if(!v){home();return}
 const nextOpen=v.won&&v.level<LEVEL_COUNT;
 const html='<section class="gold-frame result-scene"><div class="plaque">'+(v.won?"المرحلة اكتملت!":"خلص الوقت!")+'</div><h1 class="result-title">'+(v.won?"مبروك! يعطيك العافية!":"يمّه! حاول مرة ثانية")+'</h1><div class="big-stars">'+("★".repeat(v.stars)+"☆".repeat(3-v.stars))+'</div><p class="result-score">🏆 '+nfmt(v.score)+' نقطة</p><div class="btn-row"><span class="pill">✓ صحيح '+v.correct+'</span><span class="pill">✕ أخطاء '+v.wrong+'</span><span class="pill">🪙 مكافأة '+v.reward+'</span></div><div class="btn-row">'+btn("retry","↻ العب مرة ثانية","cream")+ (nextOpen?btn("next","▶ المرحلة التالية","btn-big"):"")+btn("levels","خريطة المراحل")+btn("worlds","العوالم","cream")+'</div></section>';
 view("نتيجة المرحلة",html,"results");
}
function challenges(){const d=daily(),data=[["sorted",30,"افرز 30 قطعة",d.sorted,25],["combo",6,"احصل على كومبو 6",d.combo,35],["rounds",3,"العب ثلاث جولات",d.rounds,40]];
 let html=heading("تحديات اليوم")+'<section class="gold-frame challenge-list">';
 data.forEach(([key,goal,name,val,coin])=>{const done=val>=goal,claimed=!!save.claimed[key];html+='<div class="challenge"><div><strong>'+name+'</strong><div class="progress-rail"><div class="progress-bar" style="width:'+clamp(100*val/goal,0,100)+'%"></div></div><small>'+Math.min(val,goal)+' / '+goal+'</small></div>'+btn("claim",claimed?"✓ مستلم":done?"احصل على "+coin+" 🪙":"بانتظارك",claimed?"cream":"", 'data-claim="'+key+'" '+(!done||claimed?"disabled":""))+'</div>'});
 html+='</section><div class="btn-row">'+btn("worlds","ابدأ تحدي الفرز","btn-big")+'</div>';view("التحديات",html,"challenges");
}
function claim(key){const obj={sorted:[30,25],combo:[6,35],rounds:[3,40]}[key];if(!obj||save.claimed[key]||daily()[key]<obj[0])return;save.claimed[key]=true;rewardCoins(obj[1]);toast("حصلت على "+obj[1]+" عملة!");challenges()}
function achievements(){let html=heading("الإنجازات")+'<div class="achievement-grid">';for(const [id,name,desc,icon,pred] of ACHIEVEMENTS){const unlocked=pred(save);html+='<div class="achievement '+(unlocked?"":"locked")+'"><span class="symbol">'+icon+'</span><h3>'+name+'</h3><p>'+desc+'</p><span class="pill">'+(unlocked?"✓ مكتمل":"🔒 مقفل")+'</span></div>'}html+='</div>';view("الإنجازات",html,"achievements")}
function shop(){let html=heading("المتجر")+'<div class="hero-top-meta"><span class="pill">رصيدك 🪙 '+save.coins+'</span><span class="pill">المعززات تجميلية وللعب فقط — بلا مشتريات حقيقية</span></div><h3>أشكال صينية الفرز</h3><div class="shop-grid">';
 SKINS.forEach(s=>{const owned=save.owned.includes(s.id),sel=save.skin===s.id;html+='<div class="shop-item"><span class="symbol">'+s.icon+'</span><h3>'+s.name+'</h3><span class="pill">'+(owned?"مملوك":s.price+" 🪙")+'</span>'+btn("skinbuy",sel?"✓ مستخدم":owned?"استخدم":"اشترِ",owned?"cream":"", 'data-skin="'+s.id+'" '+(sel?"disabled":""))+'</div>'});html+='</div><h3>معززات الجولة</h3><div class="shop-grid">';
 POWERUPS.forEach(p=>{html+='<div class="shop-item"><span class="symbol">'+p.icon+'</span><h3>'+p.name+'</h3><p>'+p.desc+'</p><span class="pill">معك: '+save.power[p.id]+'</span>'+btn("powerbuy","اشترِ "+p.price+" 🪙","cream",'data-power="'+p.id+'"')+'</div>'});html+='</div>';view("المتجر",html,"shop")}
function buySkin(id){const s=SKINS.find(x=>x.id===id);if(!s)return;if(save.owned.includes(id)){save.skin=id;persist();shop();return}if(save.coins<s.price){toast("تحتاج عملات أكثر");return}save.coins-=s.price;save.owned.push(id);save.skin=id;persist();toast("تم الشراء!");shop()}
function buyPower(id){const p=POWERUPS.find(x=>x.id===id);if(!p)return;if(save.coins<p.price){toast("ما عندك عملات كافية");return}save.coins-=p.price;save.power[id]++;persist();shop()}
function customize(){let html=heading("تخصيص الصينية")+'<div class="hero-top-meta"><span class="pill">اختر شكل الصينية المناسب لك</span></div><div class="shop-grid">';
 SKINS.forEach(s=>{const owned=save.owned.includes(s.id),sel=save.skin===s.id;html+='<div class="shop-item"><span class="symbol">'+s.icon+'</span><div style="height:90px;width:95%;background:'+s.color+';border:10px ridge '+s.rim+';border-radius:28px"></div><h3>'+s.name+'</h3>'+btn("skinbuy",sel?"✓ الحالي":owned?"استخدم":"المتجر",owned?"cream":"",'data-skin="'+s.id+'" '+(sel?"disabled":""))+'</div>'});html+='</div>';view("التخصيص",html,"customize")}
function settings(){let html=heading("الإعدادات")+'<section class="gold-frame"><div class="setting-row"><span>🔊 المؤثرات الصوتية</span>'+btn("audio",save.audio?"مفعلة ✓":"متوقفة","cream")+'</div><div class="setting-row"><span>♫ موسيقى العوالم</span>'+btn("music",save.music?"مفعلة ✓":"متوقفة","cream")+'</div><div class="setting-row"><span>👁️ تباين أعلى</span>'+btn("contrast",save.highContrast?"مفعل ✓":"عادي","cream")+'</div><div class="setting-row"><span>♿ حركة مخففة</span>'+btn("motion",save.reducedMotion?"مفعلة ✓":"عادية","cream")+'</div><div class="setting-row"><span>❔ شرح اللعب تلقائياً</span>'+btn("showtutorial",save.showTutorial?"نعم":"لا","cream")+'</div><p style="font-size:13px;text-align:center">الحفظ محلي في متصفحك ولا يتم إرسال البيانات إلى خادم.</p></section>';view("الإعدادات",html,"settings")}
function tutorial(){const html=heading("طريقة اللعب")+'<section class="tutorial-wrap"><div class="gold-frame tutorial-copy"><p><strong>1.</strong> المس أي قطعة من خليط الحبوب واسحبها بإصبعك.</p><p><strong>2.</strong> أسقط القطعة في السلة المكتوب عليها اسمها.</p><p><strong>3.</strong> مرّر إصبعك على مجموعة قطع حتى تتحرك مع بعضها.</p><p><strong>4.</strong> فرّز المطلوب قبل انتهاء الوقت، واجمع النجوم والعملات!</p><p>تدعم اللعبة لمس أكثر من إصبع، والماوس على الكمبيوتر. <strong>ما في عيدان.</strong></p><div class="btn-row">'+btn("worlds","ابدأ اللعب","btn-big")+'</div></div><div class="tutorial-illustration"></div></section>';view("طريقة اللعب",html,"tutorial")}
function powerPanel(){if(!state.round)return;state.paused=true;
 let html='<div class="plaque">المعززات</div><p>ساعد نفسك في الفرز! المعززات تُستخدم أثناء الجولة.</p>';
 POWERUPS.forEach(p=>{html+=btn("usepower",p.icon+" "+p.name+" ("+save.power[p.id]+")",save.power[p.id]?"cream":"",'data-power="'+p.id+'" '+(save.power[p.id]?"":"disabled"))});
 html+=btn("resume","متابعة اللعب","btn-big");popup(html)}
function usePower(id){const r=state.round;if(!r||!save.power[id])return;save.power[id]--;persist();
 if(id==="slow"){r.time+=15;gameFeedback("+15 ثانية")}
 else if(id==="double"){r.powerMult=10;gameFeedback("نقاط ×2 لعشر قطع")}
 else if(id==="magnet"){let n=0;while(r.items.length&&n<4&&!r.ended){let g=r.items.shift();success(g.type);n++}gameFeedback("انجذب أقرب 4 قطع!")}
 resume();toast("تم تفعيل المعزز")}
function backScreen(){const m={worlds:"main",levels:"worlds",results:"levels",shop:"main",customize:"main",challenges:"main",achievements:"main",settings:"main",tutorial:"main"};if(state.screen==="game"){pause();return}const to=m[state.screen]||"main";if(to==="levels")levels(state.world);else if(to==="worlds")worlds();else home()}
function dispatch(action,el){const w=+(el.dataset.world||0),l=+(el.dataset.level||1);
 const actions={home,worlds,levels:()=>levels(state.world),world:()=>levels(w),level:()=>stage(state.world,l),next:()=>stage(state.result.world,state.result.level+1),retry:()=>stage(state.result?state.result.world:state.world,state.result?state.result.level:state.level),pause,resume,settings,challenges,achievements,shop,customize,tutorial,powerpanel:powerPanel,back:backScreen,tutorialDone:()=>{save.showTutorial=false;persist();resume()},audio:()=>{save.audio=!save.audio;persist();if(state.screen==="settings")settings();else audioBtn.textContent=save.audio?"♫":"♪";toast(save.audio?"الصوت شغّال":"الصوت مطفي")},music:()=>{save.music=!save.music;persist();if(!save.music)stopMusic();settings()},contrast:()=>{save.highContrast=!save.highContrast;persist();settings()},motion:()=>{save.reducedMotion=!save.reducedMotion;persist();settings()},showtutorial:()=>{save.showTutorial=!save.showTutorial;persist();settings()},claim:()=>claim(el.dataset.claim),skinbuy:()=>buySkin(el.dataset.skin),powerbuy:()=>buyPower(el.dataset.power),usepower:()=>usePower(el.dataset.power)};
 if(actions[action])actions[action]();
}
document.addEventListener("click",ev=>{const el=ev.target.closest("[data-action]");if(el&&!el.disabled)dispatch(el.dataset.action,el)});
back.addEventListener("click",backScreen);audioBtn.addEventListener("click",()=>dispatch("audio",audioBtn));$("settingsBtn").addEventListener("click",settings);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(state.screen==="game"&&!state.paused)pause();else if(state.screen==="game"&&state.paused)resume();else backScreen()}});
/* Original synthesized musical motifs, no samples or third-party copyrighted music */
let ac=null,musicInterval=null,musicIndex=0,musicWorld=-1;
function getAudio(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;if(!ac)ac=new C();if(ac.state==="suspended")ac.resume();return ac}catch{return null}}
function note(freq=440,len=.08,type="sine",gain=.028){if(!save.audio)return;const a=getAudio();if(!a)return;const osc=a.createOscillator(),v=a.createGain();osc.type=type;osc.frequency.setValueAtTime(Math.max(freq,40),a.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(freq*.8,40),a.currentTime+len);v.gain.setValueAtTime(gain,a.currentTime);v.gain.exponentialRampToValueAtTime(.0001,a.currentTime+len);osc.connect(v).connect(a.destination);osc.start();osc.stop(a.currentTime+len+.01)}
function effect(k){if(k==="correct")note(740,.09,"sine",.027);else if(k==="wrong")note(210,.16,"triangle",.03);else if(k==="combo")note(980,.13,"triangle",.018);else if(k==="victory"){note(660,.25,"triangle",.025);setTimeout(()=>note(990,.33,"triangle",.023),180)}}
function stopMusic(){if(musicInterval){clearInterval(musicInterval);musicInterval=null}}
function startMusic(w){if(!save.music||!save.audio){stopMusic();return}if(musicWorld===w&&musicInterval)return;stopMusic();musicWorld=w;musicIndex=0;musicInterval=setInterval(()=>{if(!save.music||!save.audio||state.screen!=="game"||state.paused)return;const step=WORLDS[musicWorld].tone[musicIndex++%8];note(196*Math.pow(2,step/12),.22,"triangle",.008)},490)}
/* Direct responsive canvas and natural lightweight sorting physics */
let cw=0,ch=0,cx=null,ratio=1;
function initCanvas(){const c=$("gameCanvas");if(!c)return;state.canvas=c;state.ctx=c.getContext("2d");cx=state.ctx;resizeCanvas();c.addEventListener("pointerdown",pointerDown,{passive:false});c.addEventListener("pointermove",pointerMove,{passive:false});c.addEventListener("pointerup",pointerUp,{passive:false});c.addEventListener("pointercancel",pointerUp,{passive:false});c.addEventListener("lostpointercapture",pointerUp,{passive:false});state.round.lastTime=performance.now()}
function resizeCanvas(){const c=state.canvas;if(!c)return;const box=c.getBoundingClientRect();cw=box.width||700;ch=box.height||510;ratio=Math.min(devicePixelRatio||1,2);const w=Math.round(cw*ratio),h=Math.round(ch*ratio);if(c.width!==w)c.width=w;if(c.height!==h)c.height=h;cx.setTransform(ratio,0,0,ratio,0,0)}
addEventListener("resize",()=>{if(state.screen==="game")resizeCanvas()});
function pointerCoords(ev){const rect=state.canvas.getBoundingClientRect();return {x:clamp((ev.clientX-rect.left)/rect.width,0,1),y:clamp((ev.clientY-rect.top)/rect.height,0,1)}}
function nearest(p){let idx=-1,dist=42;const r=state.round;if(!r)return -1;for(let i=r.items.length-1;i>=0;i--){const it=r.items[i];if(it.held)continue;let d=Math.hypot((it.x-p.x)*cw,(it.y-p.y)*ch);if(d<dist){dist=d;idx=i}}return idx}
function pointerDown(ev){const r=state.round;if(!r||state.paused)return;ev.preventDefault();state.canvas.setPointerCapture(ev.pointerId);const p=pointerCoords(ev),index=nearest(p);if(index>=0){r.items[index].held=true;r.pointers.set(ev.pointerId,{id:r.items[index].id,last:p,kind:"hold"})}else r.pointers.set(ev.pointerId,{last:p,kind:"sweep"})}
function findHeld(id){const r=state.round;if(!r)return null;return r.items.find(x=>x.id===id)||null}
function pointerMove(ev){const r=state.round;if(!r||state.paused||!r.pointers.has(ev.pointerId))return;ev.preventDefault();const p=pointerCoords(ev),pointer=r.pointers.get(ev.pointerId);
 if(pointer.kind==="hold"){const it=findHeld(pointer.id);if(it){it.x=clamp(p.x,.05,.95);it.y=clamp(p.y,.13,.90);it.vx=it.vy=0}}
 else{const old=pointer.last;let dx=(p.x-old.x)*cw,dy=(p.y-old.y)*ch;const len=Math.hypot(dx,dy)||1;const steps=Math.max(1,Math.ceil(len/18));for(let k=0;k<=steps;k++){const px=old.x+(p.x-old.x)*(k/steps),py=old.y+(p.y-old.y)*(k/steps);for(const it of r.items){if(it.held)continue;const d=Math.hypot((it.x-px)*cw,(it.y-py)*ch);if(d<47){const impulse=(1-d/47);it.vx+=(dx/len)*impulse*.45;it.vy+=(dy/len)*impulse*.6}}}}
 pointer.last=p;
}
function pointerUp(ev){const r=state.round;if(!r||!r.pointers.has(ev.pointerId))return;ev.preventDefault();const p=pointerCoords(ev),pointer=r.pointers.get(ev.pointerId);r.pointers.delete(ev.pointerId);if(pointer.kind!=="hold")return;const it=findHeld(pointer.id);if(!it)return;it.held=false;it.x=p.x;it.y=p.y; if(p.y>=.765){const count=WORLDS[state.world].items.length;const col=Math.floor(p.x*count);if(col>=0&&col<count){if(col===it.type){const index=r.items.indexOf(it);if(index>=0)r.items.splice(index,1);success(it.type);if(state.round)spawnItem(r)}else failure()}}}
function simulate(dt){const r=state.round;if(!r||state.paused)return;r.time=Math.max(0,r.time-dt);if(r.time<=0){endRound(false);return}
 r.spawnAt-=dt;if(r.spawnAt<=0){r.spawnAt=Math.max(3,8-state.level*.8-state.world*.35);let amount=Math.min(5+state.level,11);for(let i=0;i<amount;i++)spawnItem(r);gameFeedback("يمّه! نزلت أشياء جديدة")}
 const n=r.items.length;
 for(let i=0;i<n;i++){const a=r.items[i];if(a.held)continue;a.x+=a.vx*dt;a.y+=a.vy*dt;a.vx*=Math.pow(.16,dt);a.vy*=Math.pow(.16,dt);a.x=clamp(a.x,.06,.94);a.y=clamp(a.y,.16,.68);a.rot+=a.vx*dt*.4}
 const rad=Math.max(13,Math.min(cw/32,25))*1.02;
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=r.items[i],b=r.items[j];if(a.held||b.held)continue;let dx=(a.x-b.x)*cw,dy=(a.y-b.y)*ch;let d=Math.hypot(dx,dy);if(d<rad&&d>.001){const f=(rad-d)/d*.42;a.x=clamp(a.x+dx*f/cw,.06,.94);a.y=clamp(a.y+dy*f/ch,.16,.68);b.x=clamp(b.x-dx*f/cw,.06,.94);b.y=clamp(b.y-dy*f/ch,.16,.68)}}
 if(state.feedbackAt>0&&performance.now()>state.feedbackAt){const el=$("feedback");if(el)el.classList.add("hidden");state.feedbackAt=0}updateHud();
}
function drawImg(img,x,y,w,h){if(imageReady(img))try{cx.drawImage(img,x,y,w,h)}catch(e){}}
function drawFrame(){if(state.screen!=="game"||!state.round||!cx)return;const r=state.round,w=cw,h=ch,visual=textureData[state.world],n=WORLDS[state.world].items.length;cx.clearRect(0,0,w,h);
 const bg=cx.createLinearGradient(0,0,w,h);bg.addColorStop(0,"#97674a");bg.addColorStop(1,"#41261d");cx.fillStyle=bg;cx.fillRect(0,0,w,h);drawImg(visual.background,0,0,w,h);
 cx.fillStyle="rgba(16,9,6,.28)";cx.fillRect(0,0,w,h);
 const skin=SKINS.find(x=>x.id===save.skin)||SKINS[0];cx.fillStyle=skin.color;cx.strokeStyle=skin.rim;cx.lineWidth=Math.max(7,w*.012);const trayX=w*.045,trayY=h*.125,trayW=w*.91,trayH=h*.595;
 cx.beginPath();cx.roundRect(trayX,trayY,trayW,trayH,Math.max(20,w*.035));cx.fill();cx.stroke();
 drawImg(visual.tray,trayX-4,trayY-4,trayW+8,trayH+8);
 const size=clamp(w/27,25,47);
 for(const it of r.items){const img=visual.items[it.type],x=it.x*w,y=it.y*h;cx.save();cx.translate(x,y);cx.rotate(it.rot);cx.shadowColor="#0008";cx.shadowBlur=5;cx.shadowOffsetY=3;if(imageReady(img))drawImg(img,-size/2,-size/2,size,size);else{cx.fillStyle=["#f5e5bb","#e8a14f","#72a3aa","#c9684a","#a6a484"][it.type];cx.beginPath();cx.ellipse(0,0,size*.40,size*.27,0,0,Math.PI*2);cx.fill()}cx.restore()}
 const rowY=h*.76,byH=h*.215,bw=w/n;for(let i=0;i<n;i++){let x=i*bw+3;cx.save();cx.shadowColor="#0008";cx.shadowBlur=8;drawImg(visual.basket,x,rowY+4,bw-6,byH);cx.restore();cx.fillStyle="#30170de8";cx.strokeStyle="#e5b975";cx.lineWidth=2;cx.beginPath();cx.roundRect(x+3,rowY+byH*.59,bw-6,byH*.32,8);cx.fill();cx.stroke();cx.fillStyle="#ffe9b7";cx.textAlign="center";cx.font="900 "+Math.max(10,Math.min(18,bw*.15))+"px Cairo, Tahoma, sans-serif";cx.fillText(WORLDS[state.world].items[i][1],x+bw*.5,rowY+byH*.8,bw-12)}
 for(const p of r.pointers.values()){if(p.kind==="sweep"){cx.strokeStyle="#ffdc82b8";cx.lineWidth=3;cx.beginPath();cx.arc(p.last.x*w,p.last.y*h,33,0,2*Math.PI);cx.stroke()}}
}
function loop(now){if(state.screen==="game"&&state.round){const r=state.round;const dt=Math.min(.035,Math.max(0,(now-r.lastTime)/1000));r.lastTime=now;if(!state.paused)simulate(dt);drawFrame()}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
window.YimmaQA={getState:()=>({screen:state.screen,world:state.world,level:state.level,coins:save.coins,sorted:state.round?.sorted||0,availableLevels:LEVEL_COUNT,worlds:WORLD_COUNT,types:WORLDS.reduce((n,w)=>n+w.items.length,0)}),start:(w,l)=>stage(w,l),finish:()=>{if(state.round)endRound(true)},save:()=>save,worlds:WORLDS.map(x=>x.name),assetPaths:()=>textureData.map(x=>x.background.src)};
home();
})();