/* Invincible Games — versioned offline cache for the original full Yimma game. */
const CACHE="yimma-original-game-20261126-v1";
const ASSETS=[
  "./",
  "./index.html",
  "./production-completion.js",
  "./production-completion.css",
  "./manifest.webmanifest",
  "../final/app-icon.svg",
  "./assets/trays/W01_Kitchen.svg",
  "./assets/trays/W02_Spice_Market.svg",
  "./assets/trays/W03_Sweets.svg",
  "./assets/trays/W04_Crafts.svg",
  "./assets/trays/W05_Pearl_Coast.svg",
  "./assets/items-v2/Rice.svg",
  "./assets/items-v2/Lentil.svg",
  "./assets/items-v2/Chickpea.svg",
  "./assets/items-v2/MungBean.svg",
  "./assets/items-v2/KidneyBean.svg",
  "./assets/items-v2/Cardamom.svg",
  "./assets/items-v2/Clove.svg",
  "./assets/items-v2/Peppercorn.svg",
  "./assets/items-v2/Coriander.svg",
  "./assets/items-v2/StarAnise.svg",
  "./assets/items-v2/PinkSweet.svg",
  "./assets/items-v2/YellowSweet.svg",
  "./assets/items-v2/GreenSweet.svg",
  "./assets/items-v2/Chocolate.svg",
  "./assets/items-v2/CandyBall.svg",
  "./assets/items-v2/BlueButton.svg",
  "./assets/items-v2/RedButton.svg",
  "./assets/items-v2/PearlBead.svg",
  "./assets/items-v2/WoodBead.svg",
  "./assets/items-v2/Pearl.svg",
  "./assets/items-v2/SeaGlass.svg",
  "./assets/items-v2/Shell.svg",
  "./assets/items-v2/Stone.svg"
];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("yimma-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{const req=event.request;if(req.method!=="GET")return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;
event.respondWith((async()=>{const cache=await caches.open(CACHE);if(req.mode==="navigate"){try{const response=await fetch(req);if(response.ok)await cache.put(req,response.clone());return response}catch(e){return await cache.match(req,{ignoreSearch:true})||await cache.match("./")||Response.error()}}
const hit=await cache.match(req,{ignoreSearch:true});if(hit)return hit;try{const response=await fetch(req);if(response.ok)await cache.put(req,response.clone());return response}catch(e){return Response.error()}})())});
