import { useState, useEffect, useCallback, useRef } from "react";

// ============ SOUND ENGINE ============
function useSoundEngine(enabled) {
  const ctxRef = useRef(null);
  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);
  const play = useCallback(fn => { if (!enabled) return; try { fn(getCtx()); } catch (e) {} }, [enabled, getCtx]);
  const tone = useCallback((c, f, d, t = "sine", v = 0.3, s = 0) => {
    const o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f;
    g.gain.setValueAtTime(v, c.currentTime + s); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + s + d);
    o.connect(g); g.connect(c.destination); o.start(c.currentTime + s); o.stop(c.currentTime + s + d + 0.05);
  }, []);
  const sounds = useRef({});
  useEffect(() => {
    sounds.current = {
      correct: () => play(c => { [523.25,659.25,783.99,1046.50].forEach((f,i) => tone(c,f,0.3,"sine",0.25,i*0.08)); }),
      wrong: () => play(c => { [200,180].forEach((f,i) => tone(c,f,0.25,"square",0.18,i*0.15)); }),
      tick: () => play(c => tone(c,880,0.06,"sine",0.15)),
      tickUrgent: () => play(c => { tone(c,1200,0.05,"square",0.18); tone(c,1200,0.05,"square",0.18,0.07); }),
      timeout: () => play(c => { const o=c.createOscillator(),g=c.createGain(); o.type="sawtooth"; o.frequency.setValueAtTime(500,c.currentTime); o.frequency.exponentialRampToValueAtTime(150,c.currentTime+0.5); g.gain.setValueAtTime(0.2,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.5); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+0.55); }),
      hint: () => play(c => { [660,880].forEach((f,i) => tone(c,f,0.2,"triangle",0.18,i*0.1)); }),
      tap: () => play(c => tone(c,600,0.05,"sine",0.1)),
      victory: () => play(c => { [523.25,659.25,783.99,659.25,783.99,1046.50].forEach((f,i) => tone(c,f,0.35,i<3?"sine":"triangle",0.22,i*0.12)); }),
      ready: () => play(c => { [440,554.37,659.25].forEach((f,i) => tone(c,f,0.25,"triangle",0.2,i*0.12)); }),
      streak: () => play(c => { [783.99,987.77,1174.66,1318.51].forEach((f,i) => tone(c,f,0.2,"sine",0.18,i*0.06)); }),
      bonus: () => play(c => { [880,1108.73].forEach((f,i) => tone(c,f,0.15,"sine",0.12,i*0.08)); }),
    };
  }, [play, tone]);
  useEffect(() => {
    const w = () => { try { getCtx(); } catch (e) {} };
    document.addEventListener("touchstart", w, { once: true }); document.addEventListener("click", w, { once: true });
    return () => { document.removeEventListener("touchstart", w); document.removeEventListener("click", w); };
  }, [getCtx]);
  return sounds;
}

// ============ PARTICLES ============
function Confetti({ active }) {
  if (!active) return null;
  const cols=["#fbbf24","#ef4444","#3b82f6","#22c55e","#a855f7","#ec4899","#f97316"];
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:200,overflow:"hidden"}}>{Array.from({length:35},(_,i)=><div key={i} style={{position:"absolute",top:"40%",left:`${Math.random()*100}%`,width:6+Math.random()*8,height:(6+Math.random()*8)*.6,background:cols[i%cols.length],borderRadius:2,animation:`confettiFall ${1.2+Math.random()}s ease-out ${Math.random()*.5}s forwards`,"--drift":`${(Math.random()-.5)*80}px`,opacity:0}} />)}</div>;
}
function FloatingEmojis({ active }) {
  if (!active) return null;
  const e=["🎉","🏆","⭐","🎊","🌟","✨"];
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:200,overflow:"hidden"}}>{Array.from({length:15},(_,i)=><div key={i} style={{position:"absolute",bottom:"-10%",left:`${Math.random()*100}%`,fontSize:16+Math.random()*20,animation:`emojiFloat ${2+Math.random()*2}s ease-out ${Math.random()*2}s forwards`,opacity:0}}>{e[i%e.length]}</div>)}</div>;
}
function ScreenFlash({ color }) { if(!color) return null; return <div style={{position:"fixed",inset:0,background:color,opacity:0,animation:"screenFlash 0.4s ease-out forwards",pointerEvents:"none",zIndex:150}} />; }
function Sparkles({ active }) {
  if (!active) return null;
  return <span style={{position:"relative",display:"inline-block"}}>{[0,1,2,3,4,5].map(i=><span key={i} style={{position:"absolute",top:"50%",left:"50%",width:4,height:4,background:"#fbbf24",borderRadius:"50%",animation:`sparkle 0.8s ease-out ${i*0.1}s forwards`,"--angle":`${i*60}deg`,opacity:0}} />)}</span>;
}
function BackgroundStars() {
  const s=useRef(Array.from({length:20},()=>({left:Math.random()*100,top:Math.random()*100,size:1+Math.random()*2,delay:Math.random()*5,dur:3+Math.random()*4}))).current;
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>{s.map((st,i)=><div key={i} style={{position:"absolute",left:`${st.left}%`,top:`${st.top}%`,width:st.size,height:st.size,background:"rgba(255,255,255,0.3)",borderRadius:"50%",animation:`twinkle ${st.dur}s ease-in-out ${st.delay}s infinite`}} />)}</div>;
}

// ============ CONTINENT OUTLINES (simplified [lng,lat] polygons) ============
const WORLD_SHAPES = [
  // North America
  [[-168,72],[-155,60],[-140,58],[-135,55],[-130,52],[-126,48],[-124,42],[-120,37],[-118,34],[-113,32],[-108,29],[-103,26],[-98,20],[-93,18],[-88,16],[-85,13],[-83,10],[-82,8],[-80,26],[-82,30],[-80,33],[-76,36],[-74,40],[-71,42],[-68,45],[-60,47],[-55,47],[-58,52],[-63,55],[-60,58],[-66,62],[-73,65],[-82,68],[-100,72],[-135,74],[-168,72]],
  // Greenland
  [[-55,60],[-45,60],[-38,62],[-22,66],[-18,72],[-20,77],[-30,80],[-45,82],[-55,80],[-58,76],[-55,72],[-50,68],[-52,64],[-55,60]],
  // South America
  [[-80,10],[-77,12],[-72,12],[-64,10],[-56,5],[-50,2],[-46,0],[-42,-2],[-38,-6],[-35,-10],[-35,-16],[-38,-20],[-42,-23],[-48,-27],[-52,-32],[-57,-36],[-62,-40],[-66,-44],[-70,-48],[-74,-52],[-75,-48],[-73,-42],[-72,-36],[-70,-28],[-70,-20],[-74,-12],[-77,-6],[-79,-1],[-80,5],[-80,10]],
  // Europe
  [[-10,36],[-5,36],[0,38],[2,43],[-2,44],[-5,48],[-10,52],[-6,54],[-4,58],[-2,57],[1,51],[4,52],[6,54],[9,54],[12,55],[10,58],[16,56],[20,58],[24,56],[28,57],[30,60],[33,64],[30,68],[24,71],[15,72],[5,68],[-5,64],[-12,64],[-22,66],[-24,64],[-15,62],[-10,58],[-10,52],[-10,42],[-10,36]],
  // Africa
  [[-17,15],[-16,12],[-10,6],[-5,5],[2,5],[8,4],[10,2],[12,-4],[16,-10],[22,-16],[26,-20],[30,-26],[33,-34],[28,-34],[26,-30],[18,-28],[15,-22],[14,-12],[20,-8],[32,-4],[40,2],[43,8],[50,12],[44,15],[38,18],[34,22],[33,30],[30,33],[25,36],[10,37],[0,36],[-5,35],[-10,33],[-16,28],[-17,22],[-17,15]],
  // Asia (mainland)
  [[30,42],[35,38],[40,38],[42,42],[48,40],[55,37],[60,40],[64,40],[68,38],[70,40],[75,35],[80,30],[85,28],[88,22],[92,20],[98,16],[102,12],[105,10],[108,16],[110,20],[115,22],[118,25],[120,30],[122,32],[128,34],[130,38],[132,42],[135,36],[138,34],[140,38],[142,44],[140,52],[132,56],[122,56],[108,54],[100,50],[92,48],[82,50],[72,42],[66,42],[58,45],[52,42],[45,42],[38,42],[30,42]],
  // India subcontinent (extra detail)
  [[68,32],[72,28],[75,24],[77,20],[78,15],[78,10],[80,8],[82,10],[85,15],[88,22],[90,22],[92,20],[88,26],[85,28],[80,30],[75,35],[68,35],[68,32]],
  // SE Asia islands
  [[96,8],[100,4],[102,2],[104,0],[106,-2],[108,-5],[110,-7],[115,-8],[118,-8],[120,-5],[118,0],[115,5],[110,8],[105,10],[100,8],[96,8]],
  // Japan/Korea
  [[126,34],[128,36],[130,38],[132,42],[134,44],[136,36],[138,34],[140,38],[142,44],[140,46],[138,42],[136,36],[134,34],[130,34],[126,34]],
  // Australia
  [[115,-14],[120,-14],[130,-12],[136,-14],[142,-18],[148,-20],[152,-25],[153,-28],[150,-34],[143,-36],[137,-35],[130,-32],[122,-34],[116,-32],[114,-28],[114,-22],[115,-14]],
  // Middle East peninsula
  [[34,30],[36,28],[38,24],[40,20],[42,16],[44,13],[46,14],[50,16],[52,18],[55,22],[56,24],[55,26],[52,24],[50,26],[48,28],[44,30],[40,32],[36,32],[34,30]],
  // UK/Ireland
  [[-10,50],[-6,50],[-5,52],[-3,53],[0,51],[2,52],[2,54],[0,56],[-2,58],[-4,58],[-6,56],[-8,54],[-10,52],[-10,50]],
  // New Zealand
  [[166,-35],[168,-37],[172,-40],[176,-42],[178,-44],[176,-46],[172,-44],[170,-42],[168,-40],[166,-38],[166,-35]],
  // Madagascar
  [[44,-13],[48,-14],[50,-18],[50,-22],[48,-25],[44,-24],[44,-20],[43,-16],[44,-13]],
];

// ============ 195 COUNTRIES ============
const FLAGS = [
  {code:"🇦🇷",name:"Argentina",continent:"América",hint:"Celeste y blanca con sol",tier:1,pos:[-34.6,-58.4]},
  {code:"🇧🇴",name:"Bolivia",continent:"América",hint:"Roja, amarilla y verde",tier:2,pos:[-17,-65]},
  {code:"🇧🇷",name:"Brasil",continent:"América",hint:"Verde y amarilla con disco azul",tier:1,pos:[-14.2,-51.9]},
  {code:"🇨🇦",name:"Canadá",continent:"América",hint:"Hoja de arce roja",tier:1,pos:[56.1,-106.3]},
  {code:"🇨🇱",name:"Chile",continent:"América",hint:"Roja, blanca y azul con estrella",tier:1,pos:[-35.7,-71.5]},
  {code:"🇨🇴",name:"Colombia",continent:"América",hint:"Amarillo grande, azul y rojo",tier:1,pos:[4.6,-74.1]},
  {code:"🇨🇷",name:"Costa Rica",continent:"América",hint:"Azul, blanca y roja",tier:2,pos:[9.7,-83.7]},
  {code:"🇨🇺",name:"Cuba",continent:"América",hint:"Franjas azules, triángulo rojo",tier:1,pos:[21.5,-79.9]},
  {code:"🇩🇴",name:"Rep. Dominicana",continent:"América",hint:"Cruz blanca con cuartos",tier:2,pos:[18.7,-70.2]},
  {code:"🇪🇨",name:"Ecuador",continent:"América",hint:"Amarillo, azul y rojo con escudo",tier:2,pos:[-1.8,-78.2]},
  {code:"🇸🇻",name:"El Salvador",continent:"América",hint:"Azul y blanca con escudo",tier:2,pos:[13.8,-88.9]},
  {code:"🇬🇹",name:"Guatemala",continent:"América",hint:"Celeste y blanca con quetzal",tier:2,pos:[15.8,-90.2]},
  {code:"🇬🇾",name:"Guyana",continent:"América",hint:"Triángulo verde con flecha",tier:3,pos:[5,-59]},
  {code:"🇭🇹",name:"Haití",continent:"América",hint:"Azul y roja con escudo",tier:2,pos:[19,-72.1]},
  {code:"🇭🇳",name:"Honduras",continent:"América",hint:"Azul y blanca con estrellas",tier:3,pos:[15.2,-86.2]},
  {code:"🇯🇲",name:"Jamaica",continent:"América",hint:"Cruz diagonal dorada",tier:1,pos:[18.1,-77.3]},
  {code:"🇲🇽",name:"México",continent:"América",hint:"Verde, blanca y roja con águila",tier:1,pos:[23.6,-102.5]},
  {code:"🇳🇮",name:"Nicaragua",continent:"América",hint:"Azul y blanca con triángulo",tier:3,pos:[12.9,-85.2]},
  {code:"🇵🇦",name:"Panamá",continent:"América",hint:"Cuartos con estrellas",tier:2,pos:[8.5,-80.8]},
  {code:"🇵🇾",name:"Paraguay",continent:"América",hint:"Roja, blanca y azul con escudos",tier:2,pos:[-23.4,-58.4]},
  {code:"🇵🇪",name:"Perú",continent:"América",hint:"Roja y blanca vertical",tier:1,pos:[-9.2,-75]},
  {code:"🇸🇷",name:"Surinam",continent:"América",hint:"Verde, blanca, roja con estrella",tier:3,pos:[3.9,-56]},
  {code:"🇹🇹",name:"Trinidad y Tobago",continent:"América",hint:"Roja con diagonal negra",tier:3,pos:[10.7,-61.2]},
  {code:"🇺🇸",name:"Estados Unidos",continent:"América",hint:"Estrellas y franjas",tier:1,pos:[37.1,-95.7]},
  {code:"🇺🇾",name:"Uruguay",continent:"América",hint:"Franjas celestes con sol",tier:1,pos:[-32.5,-55.8]},
  {code:"🇻🇪",name:"Venezuela",continent:"América",hint:"Amarillo, azul y rojo",tier:2,pos:[6.4,-66.6]},
  {code:"🇧🇸",name:"Bahamas",continent:"América",hint:"Aguamarina con triángulo negro",tier:3,pos:[25,-77.4]},
  {code:"🇧🇧",name:"Barbados",continent:"América",hint:"Azul con tridente negro",tier:3,pos:[13.2,-59.5]},
  {code:"🇧🇿",name:"Belice",continent:"América",hint:"Azul con franjas rojas",tier:3,pos:[17.2,-88.5]},
  {code:"🇩🇲",name:"Dominica",continent:"América",hint:"Verde con loro morado",tier:3,pos:[15.4,-61.4]},
  {code:"🇬🇩",name:"Granada",continent:"América",hint:"Roja con nuez moscada",tier:3,pos:[12.1,-61.7]},
  {code:"🇰🇳",name:"S. Cristóbal y Nieves",continent:"América",hint:"Diagonal con estrellas",tier:3,pos:[17.4,-62.8]},
  {code:"🇻🇨",name:"San Vicente",continent:"América",hint:"Azul, dorada y verde",tier:3,pos:[13.3,-61.2]},
  {code:"🇱🇨",name:"Santa Lucía",continent:"América",hint:"Celeste con triángulos",tier:3,pos:[14,-61]},
  {code:"🇦🇬",name:"Antigua y Barbuda",continent:"América",hint:"Roja con sol naciente",tier:3,pos:[17.1,-61.8]},
  {code:"🇦🇱",name:"Albania",continent:"Europa",hint:"Roja con águila negra",tier:2,pos:[41.2,20.2]},
  {code:"🇩🇪",name:"Alemania",continent:"Europa",hint:"Negra, roja y dorada",tier:1,pos:[51.2,10.4]},
  {code:"🇦🇩",name:"Andorra",continent:"Europa",hint:"Azul, amarilla y roja",tier:3,pos:[42.5,1.5]},
  {code:"🇦🇹",name:"Austria",continent:"Europa",hint:"Roja, blanca y roja",tier:2,pos:[47.5,14.6]},
  {code:"🇧🇪",name:"Bélgica",continent:"Europa",hint:"Negra, amarilla y roja",tier:2,pos:[50.5,4.5]},
  {code:"🇧🇾",name:"Bielorrusia",continent:"Europa",hint:"Roja y verde con bordado",tier:3,pos:[53.7,27.9]},
  {code:"🇧🇦",name:"Bosnia",continent:"Europa",hint:"Azul con triángulo amarillo",tier:3,pos:[43.9,17.7]},
  {code:"🇧🇬",name:"Bulgaria",continent:"Europa",hint:"Blanca, verde y roja",tier:2,pos:[42.7,25.5]},
  {code:"🇭🇷",name:"Croacia",continent:"Europa",hint:"Con escudo ajedrezado",tier:2,pos:[45.1,15.2]},
  {code:"🇨🇾",name:"Chipre",continent:"Europa",hint:"Blanca con silueta",tier:3,pos:[35.1,33.4]},
  {code:"🇨🇿",name:"Rep. Checa",continent:"Europa",hint:"Blanca y roja con triángulo azul",tier:2,pos:[49.8,15.5]},
  {code:"🇩🇰",name:"Dinamarca",continent:"Europa",hint:"Roja con cruz blanca",tier:2,pos:[56.3,9.5]},
  {code:"🇸🇰",name:"Eslovaquia",continent:"Europa",hint:"Con cruz doble",tier:3,pos:[48.7,19.7]},
  {code:"🇸🇮",name:"Eslovenia",continent:"Europa",hint:"Con montaña",tier:3,pos:[46.2,14.9]},
  {code:"🇪🇸",name:"España",continent:"Europa",hint:"Roja y amarilla con escudo",tier:1,pos:[40.5,-3.7]},
  {code:"🇪🇪",name:"Estonia",continent:"Europa",hint:"Azul, negra y blanca",tier:3,pos:[58.6,25]},
  {code:"🇫🇮",name:"Finlandia",continent:"Europa",hint:"Blanca con cruz azul",tier:2,pos:[61.9,25.7]},
  {code:"🇫🇷",name:"Francia",continent:"Europa",hint:"Azul, blanca y roja vertical",tier:1,pos:[46.2,2.2]},
  {code:"🇬🇪",name:"Georgia",continent:"Europa",hint:"Blanca con cruces rojas",tier:3,pos:[42.3,43.4]},
  {code:"🇬🇷",name:"Grecia",continent:"Europa",hint:"Franjas azules y blancas",tier:1,pos:[39.1,21.8]},
  {code:"🇭🇺",name:"Hungría",continent:"Europa",hint:"Roja, blanca y verde",tier:2,pos:[47.2,19.5]},
  {code:"🇮🇸",name:"Islandia",continent:"Europa",hint:"Azul con cruz roja",tier:2,pos:[65,-18.9]},
  {code:"🇮🇪",name:"Irlanda",continent:"Europa",hint:"Verde, blanca y naranja",tier:1,pos:[53.4,-8.2]},
  {code:"🇮🇹",name:"Italia",continent:"Europa",hint:"Verde, blanca y roja vertical",tier:1,pos:[41.9,12.6]},
  {code:"🇱🇻",name:"Letonia",continent:"Europa",hint:"Granate con franja blanca",tier:3,pos:[56.9,24.1]},
  {code:"🇱🇮",name:"Liechtenstein",continent:"Europa",hint:"Azul y roja con corona",tier:3,pos:[47.2,9.6]},
  {code:"🇱🇹",name:"Lituania",continent:"Europa",hint:"Amarilla, verde y roja",tier:3,pos:[55.2,23.9]},
  {code:"🇱🇺",name:"Luxemburgo",continent:"Europa",hint:"Roja, blanca y celeste",tier:3,pos:[49.8,6.1]},
  {code:"🇲🇰",name:"Macedonia del Norte",continent:"Europa",hint:"Roja con sol amarillo",tier:3,pos:[41.5,21.7]},
  {code:"🇲🇹",name:"Malta",continent:"Europa",hint:"Blanca y roja",tier:3,pos:[35.9,14.4]},
  {code:"🇲🇩",name:"Moldavia",continent:"Europa",hint:"Azul, amarilla y roja",tier:3,pos:[47,28.9]},
  {code:"🇲🇨",name:"Mónaco",continent:"Europa",hint:"Roja y blanca",tier:3,pos:[43.7,7.4]},
  {code:"🇲🇪",name:"Montenegro",continent:"Europa",hint:"Roja con borde dorado",tier:3,pos:[42.7,19.4]},
  {code:"🇳🇱",name:"Países Bajos",continent:"Europa",hint:"Roja, blanca y azul",tier:1,pos:[52.1,5.3]},
  {code:"🇳🇴",name:"Noruega",continent:"Europa",hint:"Roja con cruz azul",tier:2,pos:[60.5,8.5]},
  {code:"🇵🇱",name:"Polonia",continent:"Europa",hint:"Blanca y roja",tier:2,pos:[51.9,19.1]},
  {code:"🇵🇹",name:"Portugal",continent:"Europa",hint:"Verde y roja con escudo",tier:1,pos:[39.4,-8.2]},
  {code:"🇬🇧",name:"Reino Unido",continent:"Europa",hint:"Cruces superpuestas",tier:1,pos:[55.4,-3.4]},
  {code:"🇷🇴",name:"Rumania",continent:"Europa",hint:"Azul, amarilla y roja",tier:2,pos:[45.9,25]},
  {code:"🇷🇺",name:"Rusia",continent:"Europa",hint:"Blanca, azul y roja",tier:1,pos:[61.5,105]},
  {code:"🇸🇲",name:"San Marino",continent:"Europa",hint:"Blanca y celeste",tier:3,pos:[43.9,12.5]},
  {code:"🇷🇸",name:"Serbia",continent:"Europa",hint:"Roja, azul y blanca",tier:2,pos:[44.2,20.9]},
  {code:"🇸🇪",name:"Suecia",continent:"Europa",hint:"Azul con cruz amarilla",tier:1,pos:[60.1,18.6]},
  {code:"🇨🇭",name:"Suiza",continent:"Europa",hint:"Roja con cruz blanca",tier:1,pos:[46.8,8.2]},
  {code:"🇺🇦",name:"Ucrania",continent:"Europa",hint:"Azul y amarilla",tier:1,pos:[48.4,31.2]},
  {code:"🇻🇦",name:"Vaticano",continent:"Europa",hint:"Amarilla y blanca con llaves",tier:2,pos:[41.9,12.5]},
  {code:"🇦🇫",name:"Afganistán",continent:"Asia",hint:"Negra, roja y verde",tier:2,pos:[33.9,67.7]},
  {code:"🇸🇦",name:"Arabia Saudita",continent:"Asia",hint:"Verde con espada",tier:2,pos:[23.9,45]},
  {code:"🇦🇲",name:"Armenia",continent:"Asia",hint:"Roja, azul y naranja",tier:3,pos:[40.1,45]},
  {code:"🇦🇿",name:"Azerbaiyán",continent:"Asia",hint:"Azul, roja y verde",tier:3,pos:[40.1,47.6]},
  {code:"🇧🇭",name:"Baréin",continent:"Asia",hint:"Roja y blanca con zigzag",tier:3,pos:[26,50.6]},
  {code:"🇧🇩",name:"Bangladés",continent:"Asia",hint:"Verde con círculo rojo",tier:2,pos:[23.7,90.4]},
  {code:"🇧🇳",name:"Brunéi",continent:"Asia",hint:"Amarilla con franjas",tier:3,pos:[4.5,114.7]},
  {code:"🇧🇹",name:"Bután",continent:"Asia",hint:"Naranja con dragón",tier:3,pos:[27.5,90.4]},
  {code:"🇰🇭",name:"Camboya",continent:"Asia",hint:"Con Angkor Wat",tier:2,pos:[12.6,105]},
  {code:"🇨🇳",name:"China",continent:"Asia",hint:"Roja con estrellas",tier:1,pos:[35.9,104.2]},
  {code:"🇰🇵",name:"Corea del Norte",continent:"Asia",hint:"Roja y azul con estrella",tier:2,pos:[40.3,127.5]},
  {code:"🇰🇷",name:"Corea del Sur",continent:"Asia",hint:"Blanca con yin-yang",tier:1,pos:[35.9,127.8]},
  {code:"🇦🇪",name:"Emiratos Árabes",continent:"Asia",hint:"Verde, blanca, negra",tier:2,pos:[23.4,53.8]},
  {code:"🇵🇭",name:"Filipinas",continent:"Asia",hint:"Azul y roja con sol",tier:2,pos:[12.9,121.8]},
  {code:"🇮🇳",name:"India",continent:"Asia",hint:"Naranja, blanca y verde",tier:1,pos:[20.6,79]},
  {code:"🇮🇩",name:"Indonesia",continent:"Asia",hint:"Roja y blanca",tier:2,pos:[-0.8,113.9]},
  {code:"🇮🇶",name:"Irak",continent:"Asia",hint:"Roja, blanca y negra",tier:2,pos:[33.2,43.7]},
  {code:"🇮🇷",name:"Irán",continent:"Asia",hint:"Verde, blanca y roja",tier:2,pos:[32.4,53.7]},
  {code:"🇮🇱",name:"Israel",continent:"Asia",hint:"Blanca con estrella azul",tier:1,pos:[31.1,34.9]},
  {code:"🇯🇵",name:"Japón",continent:"Asia",hint:"Blanca con círculo rojo",tier:1,pos:[36.2,138.3]},
  {code:"🇯🇴",name:"Jordania",continent:"Asia",hint:"Negra, blanca y verde",tier:2,pos:[30.6,36.2]},
  {code:"🇰🇿",name:"Kazajistán",continent:"Asia",hint:"Celeste con sol dorado",tier:3,pos:[48,68]},
  {code:"🇰🇬",name:"Kirguistán",continent:"Asia",hint:"Roja con sol y yurta",tier:3,pos:[41.2,74.8]},
  {code:"🇰🇼",name:"Kuwait",continent:"Asia",hint:"Verde, blanca y roja",tier:3,pos:[29.3,47.5]},
  {code:"🇱🇦",name:"Laos",continent:"Asia",hint:"Roja y azul con círculo",tier:3,pos:[19.9,102.5]},
  {code:"🇱🇧",name:"Líbano",continent:"Asia",hint:"Con cedro verde",tier:2,pos:[33.9,35.9]},
  {code:"🇲🇾",name:"Malasia",continent:"Asia",hint:"Franjas con cuadro azul",tier:2,pos:[4.2,101.9]},
  {code:"🇲🇻",name:"Maldivas",continent:"Asia",hint:"Roja con luna verde",tier:3,pos:[3.2,73.2]},
  {code:"🇲🇳",name:"Mongolia",continent:"Asia",hint:"Roja y azul con soyombo",tier:3,pos:[46.9,103.8]},
  {code:"🇲🇲",name:"Myanmar",continent:"Asia",hint:"Amarilla, verde y roja",tier:3,pos:[21.9,96]},
  {code:"🇳🇵",name:"Nepal",continent:"Asia",hint:"Única no rectangular",tier:2,pos:[28.4,84.1]},
  {code:"🇴🇲",name:"Omán",continent:"Asia",hint:"Roja, blanca y verde",tier:3,pos:[21.5,55.9]},
  {code:"🇵🇰",name:"Pakistán",continent:"Asia",hint:"Verde con luna y estrella",tier:2,pos:[30.4,69.3]},
  {code:"🇶🇦",name:"Catar",continent:"Asia",hint:"Granate con zigzag",tier:2,pos:[25.4,51.2]},
  {code:"🇸🇬",name:"Singapur",continent:"Asia",hint:"Roja y blanca con luna",tier:2,pos:[1.4,103.8]},
  {code:"🇸🇾",name:"Siria",continent:"Asia",hint:"Roja, blanca y negra",tier:2,pos:[35,38]},
  {code:"🇱🇰",name:"Sri Lanka",continent:"Asia",hint:"Granate con león",tier:2,pos:[7.9,80.8]},
  {code:"🇹🇭",name:"Tailandia",continent:"Asia",hint:"Roja, blanca y azul",tier:2,pos:[15.9,100.9]},
  {code:"🇹🇯",name:"Tayikistán",continent:"Asia",hint:"Roja, blanca y verde",tier:3,pos:[38.9,71.3]},
  {code:"🇹🇱",name:"Timor Oriental",continent:"Asia",hint:"Roja con triángulos",tier:3,pos:[-8.9,126]},
  {code:"🇹🇲",name:"Turkmenistán",continent:"Asia",hint:"Verde con alfombras",tier:3,pos:[39,59.6]},
  {code:"🇹🇷",name:"Turquía",continent:"Asia",hint:"Roja con media luna",tier:1,pos:[39,35.2]},
  {code:"🇺🇿",name:"Uzbekistán",continent:"Asia",hint:"Azul, blanca y verde",tier:3,pos:[41.4,64.6]},
  {code:"🇻🇳",name:"Vietnam",continent:"Asia",hint:"Roja con estrella amarilla",tier:2,pos:[14.1,108.3]},
  {code:"🇾🇪",name:"Yemen",continent:"Asia",hint:"Roja, blanca y negra",tier:3,pos:[15.6,48.5]},
  {code:"🇩🇿",name:"Argelia",continent:"África",hint:"Verde y blanca con luna roja",tier:2,pos:[28,1.7]},
  {code:"🇦🇴",name:"Angola",continent:"África",hint:"Roja y negra con machete",tier:3,pos:[-11.2,17.9]},
  {code:"🇧🇯",name:"Benín",continent:"África",hint:"Verde con franjas",tier:3,pos:[9.3,2.3]},
  {code:"🇧🇼",name:"Botsuana",continent:"África",hint:"Celeste con franja negra",tier:3,pos:[-22.3,24.7]},
  {code:"🇧🇫",name:"Burkina Faso",continent:"África",hint:"Roja y verde con estrella",tier:3,pos:[12.3,-1.6]},
  {code:"🇧🇮",name:"Burundi",continent:"África",hint:"Cruz con cuartos",tier:3,pos:[-3.4,29.9]},
  {code:"🇨🇻",name:"Cabo Verde",continent:"África",hint:"Azul con estrellas",tier:3,pos:[16,-24]},
  {code:"🇨🇲",name:"Camerún",continent:"África",hint:"Verde, roja y amarilla",tier:3,pos:[7.4,12.4]},
  {code:"🇹🇩",name:"Chad",continent:"África",hint:"Azul, amarilla y roja",tier:3,pos:[15.5,18.7]},
  {code:"🇰🇲",name:"Comoras",continent:"África",hint:"Franjas con triángulo",tier:3,pos:[-11.9,43.9]},
  {code:"🇨🇮",name:"Costa de Marfil",continent:"África",hint:"Naranja, blanca y verde",tier:2,pos:[7.5,-5.5]},
  {code:"🇨🇬",name:"Rep. del Congo",continent:"África",hint:"Verde, amarilla y roja",tier:3,pos:[-0.2,15.8]},
  {code:"🇨🇩",name:"R.D. del Congo",continent:"África",hint:"Azul con franja roja",tier:3,pos:[-4.1,21.8]},
  {code:"🇪🇬",name:"Egipto",continent:"África",hint:"Roja, blanca y negra con águila",tier:1,pos:[26.8,30.8]},
  {code:"🇪🇷",name:"Eritrea",continent:"África",hint:"Roja, verde y azul",tier:3,pos:[15.2,39.8]},
  {code:"🇪🇹",name:"Etiopía",continent:"África",hint:"Verde, amarilla y roja con estrella",tier:2,pos:[9.1,40.5]},
  {code:"🇬🇦",name:"Gabón",continent:"África",hint:"Verde, amarilla y azul",tier:3,pos:[-0.8,11.6]},
  {code:"🇬🇲",name:"Gambia",continent:"África",hint:"Roja, azul y verde",tier:3,pos:[13.4,-16.6]},
  {code:"🇬🇭",name:"Ghana",continent:"África",hint:"Roja, dorada y verde",tier:2,pos:[7.9,-1]},
  {code:"🇬🇳",name:"Guinea",continent:"África",hint:"Roja, amarilla y verde",tier:3,pos:[9.9,-9.7]},
  {code:"🇬🇼",name:"Guinea-Bisáu",continent:"África",hint:"Con estrella roja",tier:3,pos:[12,-15]},
  {code:"🇬🇶",name:"Guinea Ecuatorial",continent:"África",hint:"Con triángulo azul",tier:3,pos:[1.6,10.3]},
  {code:"🇰🇪",name:"Kenia",continent:"África",hint:"Negra, roja y verde con escudo",tier:2,pos:[-0.02,37.9]},
  {code:"🇱🇸",name:"Lesoto",continent:"África",hint:"Azul, blanca y verde",tier:3,pos:[-29.6,28.2]},
  {code:"🇱🇷",name:"Liberia",continent:"África",hint:"Franjas con cuadro azul",tier:3,pos:[6.4,-9.4]},
  {code:"🇱🇾",name:"Libia",continent:"África",hint:"Roja, negra y verde",tier:3,pos:[26.3,17.2]},
  {code:"🇲🇬",name:"Madagascar",continent:"África",hint:"Blanca, roja y verde",tier:3,pos:[-18.8,46.9]},
  {code:"🇲🇼",name:"Malaui",continent:"África",hint:"Negra, roja y verde",tier:3,pos:[-13.3,34.3]},
  {code:"🇲🇱",name:"Malí",continent:"África",hint:"Verde, dorada y roja",tier:3,pos:[17.6,-4]},
  {code:"🇲🇦",name:"Marruecos",continent:"África",hint:"Roja con estrella verde",tier:2,pos:[31.8,-7.1]},
  {code:"🇲🇺",name:"Mauricio",continent:"África",hint:"Cuatro franjas de colores",tier:3,pos:[-20.3,57.6]},
  {code:"🇲🇷",name:"Mauritania",continent:"África",hint:"Verde con luna dorada",tier:3,pos:[21,-11]},
  {code:"🇲🇿",name:"Mozambique",continent:"África",hint:"Con rifle y azada",tier:3,pos:[-18.7,35.5]},
  {code:"🇳🇦",name:"Namibia",continent:"África",hint:"Azul y verde con sol",tier:3,pos:[-22.9,18.5]},
  {code:"🇳🇪",name:"Níger",continent:"África",hint:"Naranja, blanca y verde",tier:3,pos:[17.6,8]},
  {code:"🇳🇬",name:"Nigeria",continent:"África",hint:"Verde, blanca y verde",tier:2,pos:[9.1,8.7]},
  {code:"🇨🇫",name:"Rep. Centroafricana",continent:"África",hint:"Cuatro franjas con roja",tier:3,pos:[6.6,20.9]},
  {code:"🇷🇼",name:"Ruanda",continent:"África",hint:"Azul, amarilla y verde",tier:3,pos:[-1.9,29.9]},
  {code:"🇸🇹",name:"Santo Tomé",continent:"África",hint:"Verde y amarilla",tier:3,pos:[0.2,6.6]},
  {code:"🇸🇳",name:"Senegal",continent:"África",hint:"Verde, dorada y roja",tier:3,pos:[14.5,-14.5]},
  {code:"🇸🇨",name:"Seychelles",continent:"África",hint:"Rayos de colores",tier:3,pos:[-4.7,55.5]},
  {code:"🇸🇱",name:"Sierra Leona",continent:"África",hint:"Verde, blanca y azul",tier:3,pos:[8.5,-11.8]},
  {code:"🇸🇴",name:"Somalia",continent:"África",hint:"Celeste con estrella",tier:3,pos:[5.2,46.2]},
  {code:"🇿🇦",name:"Sudáfrica",continent:"África",hint:"Seis colores con Y",tier:1,pos:[-30.6,22.9]},
  {code:"🇸🇩",name:"Sudán",continent:"África",hint:"Roja, blanca y negra",tier:3,pos:[12.9,30.2]},
  {code:"🇸🇸",name:"Sudán del Sur",continent:"África",hint:"Negra, roja y verde",tier:3,pos:[6.9,31.3]},
  {code:"🇸🇿",name:"Esuatini",continent:"África",hint:"Azul y amarilla con escudo",tier:3,pos:[-26.5,31.5]},
  {code:"🇹🇿",name:"Tanzania",continent:"África",hint:"Verde y azul diagonal",tier:3,pos:[-6.4,34.9]},
  {code:"🇹🇬",name:"Togo",continent:"África",hint:"Franjas verdes y amarillas",tier:3,pos:[8.6,0.8]},
  {code:"🇹🇳",name:"Túnez",continent:"África",hint:"Roja con luna y estrella",tier:2,pos:[33.9,9.5]},
  {code:"🇺🇬",name:"Uganda",continent:"África",hint:"Franjas con grulla",tier:3,pos:[1.4,32.3]},
  {code:"🇩🇯",name:"Yibuti",continent:"África",hint:"Celeste y verde",tier:3,pos:[11.6,43.1]},
  {code:"🇿🇲",name:"Zambia",continent:"África",hint:"Verde con águila naranja",tier:3,pos:[-13.1,27.8]},
  {code:"🇿🇼",name:"Zimbabue",continent:"África",hint:"Siete franjas",tier:3,pos:[-19,29.2]},
  {code:"🇦🇺",name:"Australia",continent:"Oceanía",hint:"Azul con estrellas",tier:1,pos:[-25.3,133.8]},
  {code:"🇫🇯",name:"Fiyi",continent:"Oceanía",hint:"Celeste con Union Jack",tier:3,pos:[-18,-175]},
  {code:"🇲🇭",name:"Islas Marshall",continent:"Oceanía",hint:"Azul con franjas",tier:3,pos:[7.1,171.2]},
  {code:"🇸🇧",name:"Islas Salomón",continent:"Oceanía",hint:"Azul y verde diagonal",tier:3,pos:[-9.6,160.2]},
  {code:"🇰🇮",name:"Kiribati",continent:"Oceanía",hint:"Roja y azul con ave",tier:3,pos:[1.9,-157.4]},
  {code:"🇫🇲",name:"Micronesia",continent:"Oceanía",hint:"Celeste con estrellas",tier:3,pos:[7.4,150.6]},
  {code:"🇳🇷",name:"Nauru",continent:"Oceanía",hint:"Azul con franja amarilla",tier:3,pos:[-0.5,166.9]},
  {code:"🇳🇿",name:"Nueva Zelanda",continent:"Oceanía",hint:"Azul con estrellas rojas",tier:1,pos:[-40.9,174.9]},
  {code:"🇵🇼",name:"Palaos",continent:"Oceanía",hint:"Celeste con círculo",tier:3,pos:[7.5,134.6]},
  {code:"🇵🇬",name:"Papúa Nueva Guinea",continent:"Oceanía",hint:"Roja y negra con ave",tier:3,pos:[-6.3,143.9]},
  {code:"🇼🇸",name:"Samoa",continent:"Oceanía",hint:"Roja con cuadro azul",tier:3,pos:[-13.8,-172]},
  {code:"🇹🇴",name:"Tonga",continent:"Oceanía",hint:"Roja con cruz blanca",tier:3,pos:[-21.2,-175.2]},
  {code:"🇹🇻",name:"Tuvalu",continent:"Oceanía",hint:"Celeste con estrellas",tier:3,pos:[-7.1,177.6]},
  {code:"🇻🇺",name:"Vanuatu",continent:"Oceanía",hint:"Roja y verde con Y",tier:3,pos:[-15.4,166.9]},
];

const CONTINENTS_LIST = ["Todos", ...new Set(FLAGS.map(f => f.continent))];
const DIFFICULTY = {
  easy:{label:"Fácil",emoji:"😊",options:3,time:20,points:10,hintCost:3,maxTier:1},
  medium:{label:"Medio",emoji:"🤔",options:4,time:15,points:20,hintCost:7,maxTier:2},
  hard:{label:"Difícil",emoji:"🧠",options:5,time:10,points:30,hintCost:12,maxTier:3},
};
const PCOLORS=["#f59e0b","#3b82f6","#ef4444","#10b981","#a855f7","#ec4899"];
const PAVATARS=["🦁","🐯","🦊","🐸","🦉","🐧"];
const shuffle=a=>[...a].sort(()=>Math.random()-0.5);
const pickRandom=(a,n,ex=[])=>shuffle(a.filter(i=>!ex.includes(i))).slice(0,n);
const RPP=5,SOLO_R=10;

// ============ MOBILE MAP WITH SVG CONTINENTS ============
function MobileMap({ options, correctName, selected, onSelect }) {
  const lats=options.map(o=>o.pos[0]),lngs=options.map(o=>o.pos[1]);
  const minLat=Math.min(...lats),maxLat=Math.max(...lats);
  const minLng=Math.min(...lngs),maxLng=Math.max(...lngs);
  const padLat=Math.max((maxLat-minLat)*0.35,5);
  const padLng=Math.max((maxLng-minLng)*0.35,8);
  const vMinLat=minLat-padLat,vMaxLat=maxLat+padLat;
  const vMinLng=minLng-padLng,vMaxLng=maxLng+padLng;
  const rngLng=vMaxLng-vMinLng||1,rngLat=vMaxLat-vMinLat||1;

  // SVG viewBox: x=lng, y=-lat
  const svgVB=`${vMinLng} ${-vMaxLat} ${rngLng} ${rngLat}`;

  // Pin positions as %
  const positioned=options.map(opt=>({
    ...opt,
    x:((opt.pos[1]-vMinLng)/rngLng)*100,
    y:((vMaxLat-opt.pos[0])/rngLat)*100,
  }));
  // Collision nudge
  const PH=13,PW=26;
  for(let i=0;i<positioned.length;i++){
    for(let j=i+1;j<positioned.length;j++){
      const a=positioned[i],b=positioned[j];
      if(Math.abs(a.x-b.x)<PW&&Math.abs(a.y-b.y)<PH){
        const nudge=(PH-Math.abs(a.y-b.y))/2+3;
        if(a.y<b.y){a.y-=nudge;b.y+=nudge;}else{a.y+=nudge;b.y-=nudge;}
      }
    }
  }
  positioned.forEach(p=>{p.x=Math.max(8,Math.min(92,p.x));p.y=Math.max(4,Math.min(96,p.y));});

  return(
    <div style={{position:"relative",width:"100%",maxWidth:420,aspectRatio:"1/1.05",borderRadius:20,overflow:"hidden",margin:"0 auto",background:"radial-gradient(ellipse at 50% 40%, rgba(20,40,70,0.7), rgba(10,18,35,0.95))"}}>
      {/* SVG Continent Outlines */}
      <svg viewBox={svgVB} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} preserveAspectRatio="none">
        {/* Grid */}
        {[-60,-30,0,30,60].map(lat=><line key={`lat${lat}`} x1={vMinLng} y1={-lat} x2={vMaxLng} y2={-lat} stroke="rgba(255,255,255,0.03)" strokeWidth={rngLat*0.003} />)}
        {Array.from({length:13},(_,i)=>(i-6)*30).map(lng=><line key={`lng${lng}`} x1={lng} y1={-vMaxLat} x2={lng} y2={-vMinLat} stroke="rgba(255,255,255,0.03)" strokeWidth={rngLng*0.003} />)}
        {/* Equator */}
        <line x1={vMinLng} y1={0} x2={vMaxLng} y2={0} stroke="rgba(251,191,36,0.08)" strokeWidth={rngLat*0.004} strokeDasharray={`${rngLng*0.02},${rngLng*0.01}`} />
        {/* Continents */}
        {WORLD_SHAPES.map((shape,i)=>(
          <polygon key={i}
            points={shape.map(([lng,lat])=>`${lng},${-lat}`).join(" ")}
            fill="rgba(100,160,120,0.12)"
            stroke="rgba(130,190,150,0.25)"
            strokeWidth={Math.min(rngLng,rngLat)*0.005}
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {/* Compass */}
      <div style={{position:"absolute",top:8,right:10,fontSize:9,color:"rgba(255,255,255,0.2)",fontWeight:700,letterSpacing:1,zIndex:2}}>N ↑</div>

      {/* Connector lines from pins to actual position */}
      {positioned.map(opt=>{
        const actualX=((opt.pos[1]-vMinLng)/rngLng)*100;
        const actualY=((vMaxLat-opt.pos[0])/rngLat)*100;
        const dx=Math.abs(actualX-opt.x),dy=Math.abs(actualY-opt.y);
        if(dx<3&&dy<3)return null;
        return <svg key={`line-${opt.name}`} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1}}>
          <line x1={`${opt.x}%`} y1={`${opt.y}%`} x2={`${actualX}%`} y2={`${actualY}%`} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="3,3" />
          <circle cx={`${actualX}%`} cy={`${actualY}%`} r={3} fill="rgba(255,255,255,0.15)" />
        </svg>;
      })}

      {/* Pin buttons */}
      {positioned.map((opt,i)=>{
        const isCorrect=opt.name===correctName;
        const isSel=selected?.name===opt.name;
        let bg="rgba(255,255,255,0.1)",border="1.5px solid rgba(255,255,255,0.2)",color="#e2e8f0",shadow="0 2px 10px rgba(0,0,0,0.4)";
        let op=1,sc="scale(1)";
        if(selected){
          if(isCorrect){bg="rgba(34,197,94,0.3)";border="2px solid #22c55e";color="#22c55e";shadow="0 0 20px rgba(34,197,94,0.5)";sc="scale(1.08)";}
          else if(isSel){bg="rgba(239,68,68,0.3)";border="2px solid #ef4444";color="#ef4444";shadow="0 0 16px rgba(239,68,68,0.4)";sc="scale(1.05)";}
          else{op=0.25;}
        }
        const shortName=opt.name.length>13?opt.name.slice(0,12)+"…":opt.name;
        return(
          <button key={opt.name} onClick={()=>!selected&&onSelect(opt)} disabled={!!selected}
            style={{position:"absolute",left:`${opt.x}%`,top:`${opt.y}%`,transform:`translate(-50%,-50%) ${sc}`,background:bg,border,color,borderRadius:14,padding:"10px 14px",fontSize:13,fontWeight:700,fontFamily:"'Nunito',sans-serif",cursor:selected?"default":"pointer",opacity:op,boxShadow:shadow,backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",transition:"all 0.3s cubic-bezier(.34,1.56,.64,1)",animation:`mapPinEnter 0.4s cubic-bezier(.34,1.56,.64,1) ${i*0.08}s both`,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",zIndex:selected&&(isCorrect||isSel)?10:2,minHeight:44,minWidth:44}}>
            <span style={{fontSize:10,opacity:0.6}}>📍</span>
            {shortName}
            {selected&&isCorrect&&<span>✓</span>}
            {selected&&isSel&&!isCorrect&&<span>✗</span>}
          </button>
        );
      })}
    </div>
  );
}

// ============ MAIN GAME ============
export default function FlagGame() {
  const [screen,setScreen]=useState("menu");
  const [gameMode,setGameMode]=useState(null);
  const [difficulty,setDifficulty]=useState(null);
  const [soundOn,setSoundOn]=useState(true);
  const [continent,setContinent]=useState("Todos");
  const sounds=useSoundEngine(soundOn);

  const [currentFlag,setCurrentFlag]=useState(null);
  const [options,setOptions]=useState([]);
  const [selected,setSelected]=useState(null);
  const [showHint,setShowHint]=useState(false);
  const [timeLeft,setTimeLeft]=useState(0);
  const [shakeWrong,setShakeWrong]=useState(false);
  const [usedFlags,setUsedFlags]=useState([]);
  const [flagKey,setFlagKey]=useState(0);

  const [round,setRound]=useState(0);
  const [score,setScore]=useState(0);
  const [streak,setStreak]=useState(0);
  const [bestStreak,setBestStreak]=useState(0);
  const [roundHistory,setRoundHistory]=useState([]);

  const [players,setPlayers]=useState([]);
  const [newPlayerName,setNewPlayerName]=useState("");
  const [currentPlayerIdx,setCurrentPlayerIdx]=useState(0);
  const [playerRound,setPlayerRound]=useState(0);
  const [familyScores,setFamilyScores]=useState({});
  const [familyHistory,setFamilyHistory]=useState({});
  const [familyStreaks,setFamilyStreaks]=useState({});
  const [showPassScreen,setShowPassScreen]=useState(false);

  const [showConfetti,setShowConfetti]=useState(false);
  const [showVictoryEmojis,setShowVictoryEmojis]=useState(false);
  const [flashColor,setFlashColor]=useState(null);
  const [scorePop,setScorePop]=useState(false);
  const [showSparkles,setShowSparkles]=useState(false);

  const [explorerTime,setExplorerTime]=useState(0);
  const [explorerScore,setExplorerScore]=useState(0);
  const [explorerCorrect,setExplorerCorrect]=useState(0);
  const [explorerTotal,setExplorerTotal]=useState(0);
  const [explorerHistory,setExplorerHistory]=useState([]);
  const [explorerBestStreak,setExplorerBestStreak]=useState(0);
  const [explorerStreak,setExplorerStreak]=useState(0);
  const explorerTimerRef=useRef(null);

  const sfx=useCallback(name=>{sounds.current[name]?.();},[sounds]);
  const getPool=useCallback(maxTier=>{
    const mt=maxTier||(DIFFICULTY[difficulty]?DIFFICULTY[difficulty].maxTier:3);
    return(continent==="Todos"?FLAGS:FLAGS.filter(f=>f.continent===continent)).filter(f=>f.tier<=mt);
  },[continent,difficulty]);

  const triggerCorrect=s=>{setShowConfetti(true);setFlashColor("rgba(34,197,94,0.15)");setScorePop(true);if(s)setShowSparkles(true);setTimeout(()=>{setShowConfetti(false);setFlashColor(null);setScorePop(false);setShowSparkles(false);},1500);};
  const triggerWrong=()=>{setShakeWrong(true);setFlashColor("rgba(239,68,68,0.12)");setTimeout(()=>setFlashColor(null),400);};
  const triggerVictory=()=>{setShowVictoryEmojis(true);setShowConfetti(true);setTimeout(()=>{setShowVictoryEmojis(false);setShowConfetti(false);},4000);};

  const setupRound=useCallback(()=>{
    const isExp=gameMode==="explorer";
    const diff=DIFFICULTY[difficulty];if(!diff)return;
    const flagPool=getPool();
    const available=flagPool.filter(f=>!usedFlags.includes(f.name));
    const pickFrom=available.length>=diff.options?available:flagPool;
    const flag=pickFrom[Math.floor(Math.random()*pickFrom.length)];
    const numOpts=isExp?Math.min(diff.options+1,6):diff.options;
    let wrong;
    if(isExp){
      const sameC=flagPool.filter(f=>f.continent===flag.continent&&f.name!==flag.name);
      if(sameC.length>=numOpts-1){wrong=pickRandom(sameC,numOpts-1,[flag]);}
      else{wrong=[...shuffle(sameC),...pickRandom(flagPool.filter(f=>f.continent!==flag.continent),numOpts-1-sameC.length,[flag])].slice(0,numOpts-1);}
    }else{wrong=pickRandom(flagPool.length>=numOpts?flagPool:FLAGS,numOpts-1,[flag]);}
    setCurrentFlag(flag);setOptions(shuffle([flag,...wrong]));
    setSelected(null);setShowHint(false);setShakeWrong(false);
    setUsedFlags(p=>[...p,flag.name]);setFlagKey(k=>k+1);
    if(!isExp)setTimeLeft(diff.time);
  },[difficulty,usedFlags,getPool,gameMode]);

  useEffect(()=>{if(screen==="playing"&&!currentFlag&&!showPassScreen)setupRound();},[screen,round,playerRound,currentFlag,setupRound,showPassScreen]);

  useEffect(()=>{
    if(screen!=="playing"||gameMode==="explorer"||selected!==null||timeLeft<=0||showPassScreen)return;
    const t=setInterval(()=>{setTimeLeft(v=>{if(v<=1){clearInterval(t);sfx("timeout");handleAnswer(null);return 0;}if(v-1<=5&&v-1>2)sfx("tick");else if(v-1<=2)sfx("tickUrgent");return v-1;});},1000);
    return()=>clearInterval(t);
  },[screen,selected,timeLeft,showPassScreen,sfx,gameMode]);

  useEffect(()=>{
    if(screen!=="playing"||gameMode!=="explorer")return;
    explorerTimerRef.current=setInterval(()=>{setExplorerTime(v=>{if(v<=1){clearInterval(explorerTimerRef.current);sfx("timeout");setScreen("explorer-results");triggerVictory();return 0;}if(v<=6&&v>3)sfx("tick");else if(v<=3)sfx("tickUrgent");return v-1;});},1000);
    return()=>clearInterval(explorerTimerRef.current);
  },[screen,gameMode,sfx]);

  const handleAnswer=option=>{
    if(selected!==null)return;
    const correct=option?.name===currentFlag?.name;
    setSelected(option);
    if(gameMode==="explorer"){
      setExplorerTotal(t=>t+1);
      if(correct){setExplorerScore(s=>s+20);setExplorerCorrect(c=>c+1);setExplorerTime(t=>t+3);
        setExplorerStreak(s=>{const n=s+1;setExplorerBestStreak(b=>Math.max(b,n));if(n>=3){sfx("streak");triggerCorrect(true);}else{sfx("correct");triggerCorrect(false);}return n;});sfx("bonus");
      }else{setExplorerStreak(0);sfx("wrong");triggerWrong();}
      setExplorerHistory(h=>[...h,{flag:currentFlag,correct}]);
      setTimeout(()=>setCurrentFlag(null),1200);return;
    }
    if(gameMode==="solo"){
      if(correct){const d=DIFFICULTY[difficulty];const pts=(showHint?d.points-d.hintCost:d.points)+Math.floor(timeLeft/2)+(streak>=2?streak*2:0);setScore(s=>s+pts);
        setStreak(s=>{const n=s+1;setBestStreak(b=>Math.max(b,n));if(n>=3){sfx("streak");triggerCorrect(true);}else{sfx("correct");triggerCorrect(false);}return n;});
      }else{setStreak(0);sfx("wrong");triggerWrong();}
      setRoundHistory(h=>[...h,{flag:currentFlag,correct}]);
      setTimeout(()=>{if(round+1>=SOLO_R){setScreen("results");sfx("victory");triggerVictory();}else{setRound(r=>r+1);setCurrentFlag(null);}},1600);
    }else{
      const pid=players[currentPlayerIdx].id;const d=DIFFICULTY[difficulty];const cs=familyStreaks[pid]||0;
      if(correct){const ns=cs+1;const pts=(showHint?d.points-d.hintCost:d.points)+Math.floor(timeLeft/2)+(ns>=2?ns*2:0);setFamilyScores(s=>({...s,[pid]:(s[pid]||0)+pts}));setFamilyStreaks(s=>({...s,[pid]:ns}));if(ns>=3){sfx("streak");triggerCorrect(true);}else{sfx("correct");triggerCorrect(false);}}
      else{setFamilyStreaks(s=>({...s,[pid]:0}));sfx("wrong");triggerWrong();}
      setFamilyHistory(h=>({...h,[pid]:[...(h[pid]||[]),{flag:currentFlag,correct}]}));
      setTimeout(()=>{if(playerRound+1>=RPP){if(currentPlayerIdx+1>=players.length){setScreen("family-results");sfx("victory");triggerVictory();}else{setCurrentPlayerIdx(i=>i+1);setPlayerRound(0);setCurrentFlag(null);setShowPassScreen(true);}}else{setPlayerRound(r=>r+1);setCurrentFlag(null);}},1600);
    }
  };

  const addPlayer=()=>{const t=newPlayerName.trim();if(!t||players.length>=6)return;sfx("tap");setPlayers(p=>[...p,{id:`p${Date.now()}`,name:t,color:PCOLORS[p.length],avatar:PAVATARS[p.length]}]);setNewPlayerName("");};
  const startSolo=d=>{sfx("ready");setGameMode("solo");setDifficulty(d);setRound(0);setScore(0);setStreak(0);setBestStreak(0);setRoundHistory([]);setUsedFlags([]);setCurrentFlag(null);setScreen("playing");};
  const startFamily=d=>{sfx("ready");setGameMode("family");setDifficulty(d);setCurrentPlayerIdx(0);setPlayerRound(0);setUsedFlags([]);setCurrentFlag(null);const sc={},hi={},st={};players.forEach(p=>{sc[p.id]=0;hi[p.id]=[];st[p.id]=0;});setFamilyScores(sc);setFamilyHistory(hi);setFamilyStreaks(st);setShowPassScreen(true);setScreen("playing");};
  const startExplorer=d=>{sfx("ready");setGameMode("explorer");setDifficulty(d);setUsedFlags([]);setCurrentFlag(null);setExplorerTime(20);setExplorerScore(0);setExplorerCorrect(0);setExplorerTotal(0);setExplorerHistory([]);setExplorerStreak(0);setExplorerBestStreak(0);setScreen("playing");};
  const goMenu=()=>{sfx("tap");setScreen("menu");setGameMode(null);setPlayers([]);setCurrentFlag(null);if(explorerTimerRef.current)clearInterval(explorerTimerRef.current);};

  const timerPct=currentFlag&&gameMode!=="explorer"?(timeLeft/DIFFICULTY[difficulty]?.time)*100:100;
  const timerColor=timerPct>50?"#22c55e":timerPct>25?"#eab308":"#ef4444";
  const bg="linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)";
  const card={background:"rgba(255,255,255,0.06)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20};
  const accent="#fbbf24";
  const cp=players[currentPlayerIdx];
  const tierCount=mt=>(continent==="Todos"?FLAGS:FLAGS.filter(f=>f.continent===continent)).filter(f=>f.tier<=mt).length;

  const ContinentPicker=()=>(<div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:18}}>
    {CONTINENTS_LIST.map(c=>(<button key={c} onClick={()=>{sfx("tap");setContinent(c);}} style={{padding:"6px 12px",borderRadius:20,border:continent===c?`1.5px solid ${accent}`:"1px solid rgba(255,255,255,0.1)",background:continent===c?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.04)",color:continent===c?accent:"#94a3b8",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>{c==="Todos"?`🌍 ${FLAGS.length}`:`${c} (${FLAGS.filter(f=>f.continent===c).length})`}</button>))}
  </div>);

  return(
    <div style={{minHeight:"100vh",background:bg,fontFamily:"'Nunito', sans-serif",color:"#f1f5f9",overflow:"hidden",position:"relative"}}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes popIn{0%{transform:scale(0) rotate(-10deg);opacity:0}60%{transform:scale(1.15) rotate(2deg)}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-10px)}30%{transform:translateX(10px)}45%{transform:translateX(-6px)}60%{transform:translateX(6px)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.1)}}
        @keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(251,191,36,.2)}50%{box-shadow:0 0 50px rgba(251,191,36,.6)}}
        @keyframes flagEnter{0%{transform:rotateY(90deg) scale(.5);opacity:0}50%{transform:rotateY(-10deg) scale(1.05)}100%{transform:rotateY(0) scale(1);opacity:1}}
        @keyframes scorePop{0%{transform:scale(1)}30%{transform:scale(1.6)}60%{transform:scale(.9)}100%{transform:scale(1)}}
        @keyframes confettiFall{0%{transform:translateY(0) translateX(0) rotate(0);opacity:1}100%{transform:translateY(400px) translateX(var(--drift,0px)) rotate(720deg);opacity:0}}
        @keyframes emojiFloat{0%{transform:translateY(0) scale(0);opacity:0}15%{opacity:1;transform:translateY(-50px) scale(1)}100%{transform:translateY(-600px) scale(.5) rotate(30deg);opacity:0}}
        @keyframes screenFlash{0%{opacity:.5}100%{opacity:0}}
        @keyframes sparkle{0%{transform:translate(-50%,-50%) rotate(var(--angle)) translateX(0) scale(0);opacity:1}100%{transform:translate(-50%,-50%) rotate(var(--angle)) translateX(25px) scale(0);opacity:0}}
        @keyframes twinkle{0%,100%{opacity:.15}50%{opacity:.8}}
        @keyframes timerPulse{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.8)}}
        @keyframes optionEnter{0%{transform:translateX(-20px);opacity:0}100%{transform:translateX(0);opacity:1}}
        @keyframes correctPulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.4)}70%{box-shadow:0 0 0 12px rgba(34,197,94,0)}}
        @keyframes wrongShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
        @keyframes podiumRise{0%{transform:scaleY(0)}100%{transform:scaleY(1)}}
        @keyframes crownBounce{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-5px) rotate(-5deg)}75%{transform:translateY(-5px) rotate(5deg)}}
        @keyframes resultRow{0%{transform:translateX(-40px);opacity:0}100%{transform:translateX(0);opacity:1}}
        @keyframes spinIn{0%{transform:rotate(0) scale(0);opacity:0}50%{transform:rotate(200deg) scale(1.2)}100%{transform:rotate(360deg) scale(1);opacity:1}}
        @keyframes menuItem{0%{transform:translateY(50px);opacity:0}60%{transform:translateY(-4px)}100%{transform:translateY(0);opacity:1}}
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
        @keyframes mapPinEnter{0%{transform:translate(-50%,-50%) scale(0);opacity:0}60%{transform:translate(-50%,-50%) scale(1.15)}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
        .btn{transition:all .2s cubic-bezier(.34,1.56,.64,1);cursor:pointer}.btn:hover{transform:translateY(-3px) scale(1.02)}.btn:active{transform:translateY(-1px) scale(.98)}
      `}</style>

      <BackgroundStars /><Confetti active={showConfetti} /><FloatingEmojis active={showVictoryEmojis} /><ScreenFlash color={flashColor} />
      <button onClick={()=>setSoundOn(v=>!v)} style={{position:"fixed",top:16,right:16,zIndex:100,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",color:"#f1f5f9"}}>{soundOn?"🔊":"🔇"}</button>

      {/* MENU */}
      {screen==="menu"&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24,textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{fontSize:80,animation:"float 3s ease-in-out infinite, spinIn 0.8s ease both",marginBottom:8}}>🌍</div>
        <h1 style={{fontFamily:"'Fredoka',sans-serif",fontSize:"clamp(28px,6vw,44px)",fontWeight:700,background:`linear-gradient(135deg,${accent},#f97316,#ef4444)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"0 0 4px",animation:"breathe 4s ease-in-out infinite"}}>¿Qué bandera es?</h1>
        <p style={{color:"#94a3b8",fontSize:15,marginBottom:16}}>{FLAGS.length} países del mundo</p>
        <ContinentPicker />
        <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:340}}>
          {[{k:"solo-diff",i:"🎮",l:"Jugar solo",s:"10 rondas · Opciones múltiples",d:.1},{k:"explorer-diff",i:"🗺️",l:"Explorador",s:"Ubicá países en su continente · Contrarreloj",d:.2,hl:1},{k:"family-setup",i:"👨‍👩‍👧‍👦",l:"Desafío familiar",s:"Turnos por jugador",d:.3}].map(m=>(
            <button key={m.k} className="btn" onClick={()=>{sfx("tap");setScreen(m.k);}} style={{...card,padding:"18px 22px",display:"flex",alignItems:"center",gap:14,color:"#f1f5f9",fontSize:16,fontWeight:700,fontFamily:"'Nunito',sans-serif",animation:`menuItem .6s ease ${m.d}s both`,...(m.hl?{background:"linear-gradient(135deg,rgba(59,130,246,.12),rgba(139,92,246,.08))",border:"1.5px solid rgba(59,130,246,.3)"}:{})}}>
              <span style={{fontSize:32}}>{m.i}</span><div style={{textAlign:"left",flex:1}}><div>{m.l}</div><div style={{fontSize:11,color:"#64748b",fontWeight:400}}>{m.s}</div></div><span style={{color:accent,fontSize:18}}>→</span>
            </button>))}
        </div>
      </div>)}

      {/* DIFF SCREENS */}
      {(screen==="solo-diff"||screen==="explorer-diff")&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24,position:"relative",zIndex:1}}>
        <button onClick={()=>{sfx("tap");setScreen("menu");}} style={{position:"absolute",top:20,left:20,background:"none",border:"none",color:"#64748b",fontSize:14,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>← Volver</button>
        <div style={{fontSize:48,marginBottom:8,animation:"popIn .5s ease both"}}>{screen==="solo-diff"?"🎮":"🗺️"}</div>
        <h2 style={{fontFamily:"'Fredoka',sans-serif",fontSize:26,fontWeight:700,margin:"0 0 6px"}}>{screen==="solo-diff"?"Elegí dificultad":"Explorador"}</h2>
        {screen==="explorer-diff"&&<p style={{color:"#64748b",fontSize:13,marginBottom:14}}>20s · Ubicá el país en su continente · +3s por acierto</p>}
        <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%",maxWidth:340,marginTop:screen==="solo-diff"?14:0}}>
          {Object.entries(DIFFICULTY).map(([k,d],i)=>(<button key={k} className="btn" onClick={()=>screen==="solo-diff"?startSolo(k):startExplorer(k)} style={{...card,padding:"18px 24px",display:"flex",alignItems:"center",gap:14,color:"#f1f5f9",fontSize:17,fontWeight:600,fontFamily:"'Nunito',sans-serif",animation:`menuItem .5s ease ${.1+i*.1}s both`}}>
            <span style={{fontSize:32}}>{d.emoji}</span><div style={{textAlign:"left",flex:1}}><div>{d.label}</div><div style={{fontSize:12,color:"#64748b"}}>{screen==="explorer-diff"?`${d.options+1} pines`:`${d.options} opciones · ${d.time}s`} · {tierCount(d.maxTier)} banderas</div></div><span style={{color:accent,fontSize:20}}>→</span>
          </button>))}
        </div>
      </div>)}

      {/* FAMILY SETUP */}
      {screen==="family-setup"&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24,position:"relative",zIndex:1}}>
        <button onClick={()=>{sfx("tap");setScreen("menu");setPlayers([]);}} style={{position:"absolute",top:20,left:20,background:"none",border:"none",color:"#64748b",fontSize:14,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>← Volver</button>
        <div style={{fontSize:48,marginBottom:8}}>👨‍👩‍👧‍👦</div>
        <h2 style={{fontFamily:"'Fredoka',sans-serif",fontSize:26,fontWeight:700,margin:"0 0 4px"}}>Desafío familiar</h2>
        <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>{RPP} rondas por jugador</p>
        <div style={{display:"flex",gap:8,width:"100%",maxWidth:340,marginBottom:20}}>
          <input value={newPlayerName} onChange={e=>setNewPlayerName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPlayer()} placeholder="Nombre..." maxLength={15} style={{flex:1,padding:"12px 16px",borderRadius:14,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.06)",color:"#f1f5f9",fontSize:15,fontFamily:"'Nunito',sans-serif",outline:"none"}} />
          <button onClick={addPlayer} disabled={!newPlayerName.trim()||players.length>=6} style={{padding:"12px 18px",borderRadius:14,border:"none",background:accent,color:"#1e293b",fontWeight:700,fontSize:18,opacity:!newPlayerName.trim()||players.length>=6?.4:1}}>+</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:340,marginBottom:24}}>
          {players.length===0&&<div style={{textAlign:"center",color:"#475569",fontSize:14,padding:20}}>Agregá al menos 2</div>}
          {players.map((p,i)=>(<div key={p.id} style={{...card,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,borderLeft:`4px solid ${p.color}`}}><span style={{fontSize:28}}>{p.avatar}</span><span style={{flex:1,fontWeight:700}}>{p.name}</span><button onClick={()=>{sfx("tap");setPlayers(pl=>pl.filter(x=>x.id!==p.id));}} style={{background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer"}}>✕</button></div>))}
        </div>
        {players.length>=2&&(<div><p style={{color:"#94a3b8",fontSize:14,fontWeight:600,marginBottom:12,textAlign:"center"}}>Dificultad:</p><div style={{display:"flex",gap:10,justifyContent:"center"}}>{Object.entries(DIFFICULTY).map(([k,d])=>(<button key={k} className="btn" onClick={()=>startFamily(k)} style={{...card,padding:"14px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,color:"#f1f5f9",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:600,minWidth:80}}><span style={{fontSize:24}}>{d.emoji}</span>{d.label}</button>))}</div></div>)}
      </div>)}

      {/* PASS PHONE */}
      {screen==="playing"&&gameMode==="family"&&showPassScreen&&cp&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24,textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{fontSize:72,animation:"spinIn .6s ease both, bounce 1.2s ease-in-out .6s infinite",marginBottom:16}}>{cp.avatar}</div>
        <h2 style={{fontFamily:"'Fredoka',sans-serif",fontSize:30,fontWeight:700,margin:"0 0 28px"}}><span style={{color:cp.color}}>¡Turno de {cp.name}!</span></h2>
        <button className="btn" onClick={()=>{sfx("ready");setShowPassScreen(false);setCurrentFlag(null);setSelected(null);}} style={{padding:"16px 48px",borderRadius:16,border:"none",background:cp.color,color:"#fff",fontFamily:"'Fredoka',sans-serif",fontSize:20,fontWeight:700,animation:"glow 2s ease-in-out infinite"}}>¡Estoy listo!</button>
      </div>)}

      {/* EXPLORER PLAYING */}
      {screen==="playing"&&gameMode==="explorer"&&currentFlag&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"14px 12px",minHeight:"100vh",position:"relative",zIndex:1}}>
        <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <button onClick={goMenu} style={{background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer",padding:"4px",marginRight:4}}>🏠</button>
            {explorerStreak>=2&&<span style={{fontSize:12,color:"#f97316",fontWeight:700,animation:"pulse 1s infinite"}}>🔥x{explorerStreak}</span>}
            <span style={{fontSize:13,color:"#94a3b8"}}>{explorerCorrect} acertadas</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"4px 14px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:14}}>⏱️</span>
            <span style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,fontWeight:700,color:explorerTime<=5?"#ef4444":explorerTime<=10?"#eab308":accent,animation:explorerTime<=5?"pulse .5s infinite":"none"}}>{explorerTime}s</span>
          </div>
        </div>
        <div key={flagKey} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,animation:"flagEnter .5s cubic-bezier(.34,1.56,.64,1) both"}}>
          <span style={{fontSize:50,lineHeight:1}}>{currentFlag.code}</span>
          <div><div style={{fontSize:16,fontWeight:700}}>¿Dónde queda?</div><div style={{fontSize:12,color:"#64748b"}}>{currentFlag.continent}</div></div>
        </div>
        {!showHint&&selected===null&&<button onClick={()=>{sfx("hint");setShowHint(true);}} style={{background:"none",border:"1px solid rgba(255,255,255,.1)",color:"#94a3b8",padding:"3px 12px",borderRadius:10,fontSize:12,cursor:"pointer",marginBottom:4,fontFamily:"'Nunito',sans-serif"}}>💡 Pista</button>}
        {showHint&&<div style={{fontSize:12,color:accent,marginBottom:4,fontStyle:"italic"}}>💡 {currentFlag.hint}</div>}
        <div style={{width:"100%",maxWidth:420,marginBottom:6,animation:shakeWrong?"shake .4s ease":"none"}}>
          <MobileMap options={options} correctName={currentFlag.name} selected={selected} onSelect={handleAnswer} />
        </div>
        {selected!==null&&<div style={{fontSize:14,fontWeight:700,animation:"popIn .3s ease",color:selected?.name===currentFlag.name?"#22c55e":"#ef4444"}}>{selected?.name===currentFlag.name?"🎉 ¡Correcto! +3s":`❌ ${currentFlag.name}`}</div>}
        <div style={{...card,padding:"8px 20px",marginTop:4,width:"100%",maxWidth:420,display:"flex",justifyContent:"space-around"}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:10,color:"#64748b"}}>Puntos</div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18,fontWeight:700,color:accent,animation:scorePop?"scorePop .4s ease":"none"}}>{explorerScore}</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:10,color:"#64748b"}}>Aciertos</div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18,fontWeight:700,color:"#22c55e"}}>{explorerCorrect}/{explorerTotal}</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:10,color:"#64748b"}}>Racha</div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18,fontWeight:700,color:"#f97316"}}>🔥{explorerBestStreak}</div></div>
        </div>
      </div>)}

      {/* QUIZ PLAYING */}
      {screen==="playing"&&gameMode!=="explorer"&&currentFlag&&!showPassScreen&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 16px",minHeight:"100vh",position:"relative",zIndex:1}}>
        <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          {gameMode==="solo"?(<><div style={{display:"flex",alignItems:"center",gap:6}}><button onClick={goMenu} style={{background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer",padding:"4px"}}>🏠</button><span style={{fontSize:13,color:"#64748b"}}><span style={{color:accent,fontWeight:700,fontSize:15}}>{round+1}</span>/{SOLO_R}</span></div><div style={{display:"flex",alignItems:"center",gap:6,position:"relative"}}>{streak>=2&&<span style={{fontSize:12,color:"#f97316",fontWeight:700,animation:"pulse 1s infinite"}}>🔥x{streak}</span>}<Sparkles active={showSparkles}/><span style={{fontFamily:"'Fredoka',sans-serif",fontSize:20,fontWeight:700,color:accent,animation:scorePop?"scorePop .4s ease":"none"}}>{score}</span></div></>):
          (<><div style={{display:"flex",alignItems:"center",gap:6}}><button onClick={goMenu} style={{background:"none",border:"none",color:"#64748b",fontSize:18,cursor:"pointer",padding:"4px"}}>🏠</button><span style={{fontSize:20}}>{cp?.avatar}</span><span style={{fontWeight:700,fontSize:14,color:cp?.color}}>{cp?.name}</span><span style={{fontSize:12,color:"#64748b",marginLeft:4}}>{playerRound+1}/{RPP}</span></div><div style={{display:"flex",alignItems:"center",gap:6,position:"relative"}}>{(familyStreaks[cp?.id]||0)>=2&&<span style={{fontSize:12,color:"#f97316",fontWeight:700,animation:"pulse 1s infinite"}}>🔥x{familyStreaks[cp?.id]}</span>}<Sparkles active={showSparkles}/><span style={{fontFamily:"'Fredoka',sans-serif",fontSize:20,fontWeight:700,color:cp?.color,animation:scorePop?"scorePop .4s ease":"none"}}>{familyScores[cp?.id]||0}</span></div></>)}
        </div>
        <div style={{width:"100%",maxWidth:420,height:6,background:"rgba(255,255,255,.08)",borderRadius:4,marginBottom:24,overflow:"hidden"}}><div style={{height:"100%",width:`${timerPct}%`,background:gameMode==="family"?cp?.color:timerColor,borderRadius:4,transition:"width 1s linear",animation:timeLeft<=5&&selected===null?"timerPulse .5s ease infinite":"none",boxShadow:timeLeft<=5?`0 0 12px ${timerColor}`:"none"}} /></div>
        <div key={flagKey} style={{...card,padding:"32px 40px",marginBottom:8,animation:"flagEnter .6s cubic-bezier(.34,1.56,.64,1) both",textAlign:"center"}}><div style={{fontSize:"clamp(80px,20vw,120px)",lineHeight:1}}>{currentFlag.code}</div></div>
        <div style={{fontSize:12,color:"#64748b",background:"rgba(255,255,255,.06)",padding:"4px 12px",borderRadius:20,marginBottom:20}}>{currentFlag.continent}</div>
        {!showHint&&selected===null&&<button onClick={()=>{sfx("hint");setShowHint(true);}} style={{background:"none",border:"1px solid rgba(255,255,255,.1)",color:"#94a3b8",padding:"6px 16px",borderRadius:12,fontSize:13,cursor:"pointer",marginBottom:16,fontFamily:"'Nunito',sans-serif"}}>💡 Pista (-{DIFFICULTY[difficulty].hintCost} pts)</button>}
        {showHint&&<div style={{fontSize:14,color:accent,marginBottom:16,fontStyle:"italic",animation:"popIn .3s ease"}}>💡 {currentFlag.hint}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:420,animation:shakeWrong?"shake .5s ease":"none"}}>
          {options.map((opt,i)=>{const isC=opt.name===currentFlag.name,isS=selected?.name===opt.name;let b2="rgba(255,255,255,.06)",bc="rgba(255,255,255,.1)",ea="";if(selected){if(isC){b2="rgba(34,197,94,.18)";bc="#22c55e";ea="correctPulse .6s ease";}else if(isS){b2="rgba(239,68,68,.18)";bc="#ef4444";ea="wrongShake .3s ease";}}
          return(<button key={opt.name} className="btn" onClick={()=>handleAnswer(opt)} disabled={selected!==null} style={{...card,background:b2,border:`1.5px solid ${bc}`,padding:"14px 20px",color:"#f1f5f9",fontSize:16,fontWeight:600,fontFamily:"'Nunito',sans-serif",cursor:selected?"default":"pointer",display:"flex",alignItems:"center",gap:12,animation:`optionEnter .4s ease ${.05+i*.07}s both${ea?`, ${ea}`:""}`,opacity:selected&&!isC&&!isS?.35:1,transition:"opacity .4s"}}><span style={{width:28,height:28,borderRadius:"50%",background:selected&&isC?"#22c55e":selected&&isS?"#ef4444":"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,color:"#fff",transition:"all .3s",transform:selected&&(isC||isS)?"scale(1.2)":"scale(1)"}}>{selected&&isC?"✓":selected&&isS&&!isC?"✗":String.fromCharCode(65+i)}</span>{opt.name}</button>);})}
        </div>
        {selected!==null&&<div style={{marginTop:16,fontSize:16,fontWeight:700,animation:"popIn .4s ease",color:selected?.name===currentFlag.name?"#22c55e":"#ef4444"}}>{selected?.name===currentFlag.name?(streak>=3?"🔥 ¡Imparable!":"🎉 ¡Correcto!"):`❌ Era ${currentFlag.name}`}</div>}
        {!selected&&timeLeft===0&&<div style={{marginTop:16,fontSize:16,fontWeight:700,color:"#ef4444"}}>⏱️ ¡Tiempo! Era {currentFlag.name}</div>}
      </div>)}

      {/* RESULTS */}
      {(screen==="results"||screen==="explorer-results")&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 16px",minHeight:"100vh",position:"relative",zIndex:1}}>
        <div style={{fontSize:64,animation:"spinIn .6s ease both, float 2.5s ease-in-out .6s infinite",marginBottom:8}}>{screen==="results"?(score>200?"🏆":score>100?"🌟":"🌍"):"🗺️"}</div>
        <h2 style={{fontFamily:"'Fredoka',sans-serif",fontSize:34,fontWeight:700,color:screen==="results"?accent:"#3b82f6",margin:"0 0 4px"}}>{screen==="results"?`${score} pts`:"¡Tiempo!"}</h2>
        {screen==="results"&&<p style={{color:"#94a3b8",fontSize:14,marginBottom:4}}>{roundHistory.filter(r=>r.correct).length}/{SOLO_R} · 🔥{bestStreak}</p>}
        {screen==="explorer-results"&&<div style={{display:"flex",gap:20,marginBottom:16,marginTop:12}}><div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:36,fontWeight:700,color:accent}}>{explorerScore}</div><div style={{fontSize:12,color:"#64748b"}}>pts</div></div><div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:36,fontWeight:700,color:"#22c55e"}}>{explorerCorrect}</div><div style={{fontSize:12,color:"#64748b"}}>ok</div></div><div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:36,fontWeight:700,color:"#f97316"}}>{explorerBestStreak}</div><div style={{fontSize:12,color:"#64748b"}}>🔥</div></div></div>}
        {(screen==="results"?roundHistory:explorerHistory).length>0&&(<div style={{...card,padding:16,width:"100%",maxWidth:400,marginBottom:24,marginTop:screen==="results"?16:0,maxHeight:300,overflowY:"auto"}}>{(screen==="results"?roundHistory:explorerHistory).map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<(screen==="results"?roundHistory:explorerHistory).length-1?"1px solid rgba(255,255,255,.06)":"none",animation:`resultRow .4s ease ${.2+i*.05}s both`}}><span style={{fontSize:22}}>{r.flag.code}</span><span style={{flex:1,fontSize:13,fontWeight:600}}>{r.flag.name}</span><span>{r.correct?"✅":"❌"}</span></div>))}</div>)}
        <div style={{display:"flex",gap:12}}>
          <button className="btn" onClick={()=>screen==="results"?startSolo(difficulty):startExplorer(difficulty)} style={{padding:"12px 28px",borderRadius:14,border:"none",background:screen==="results"?accent:"#3b82f6",color:screen==="results"?"#1e293b":"#fff",fontFamily:"'Nunito',sans-serif",fontSize:15,fontWeight:700}}>🔄 De nuevo</button>
          <button className="btn" onClick={goMenu} style={{...card,padding:"12px 28px",borderRadius:14,color:"#f1f5f9",fontFamily:"'Nunito',sans-serif",fontSize:15,fontWeight:700,background:"transparent"}}>🏠 Menú</button>
        </div>
      </div>)}

      {/* FAMILY RESULTS */}
      {screen==="family-results"&&(()=>{const sorted=[...players].sort((a,b)=>(familyScores[b.id]||0)-(familyScores[a.id]||0));const w=sorted[0];const po=[sorted[1],sorted[0],sorted[2]].filter(Boolean);const hs=[100,150,80];const ms=["🥈","🥇","🥉"];return(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 16px",minHeight:"100vh",position:"relative",zIndex:1}}>
          <div style={{fontSize:20,animation:"crownBounce 1s ease-in-out infinite",marginBottom:2}}>👑</div>
          <div style={{fontSize:64,animation:"spinIn .6s ease .1s both, bounce 1.5s ease-in-out .7s infinite",marginBottom:4}}>🏆</div>
          <h2 style={{fontFamily:"'Fredoka',sans-serif",fontSize:30,fontWeight:700,color:w.color,margin:"0 0 4px"}}>¡{w.name} gana!</h2>
          <p style={{color:"#94a3b8",fontSize:14,marginBottom:24}}>{familyScores[w.id]} pts</p>
          <div style={{display:"flex",alignItems:"flex-end",gap:14,marginBottom:28}}>{po.map((p,idx)=>(<div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",animation:`slideUp .6s ease ${.5+idx*.2}s both`}}><span style={{fontSize:30,marginBottom:4}}>{p.avatar}</span><span style={{fontSize:13,fontWeight:700,color:p.color,marginBottom:4}}>{p.name}</span><div style={{width:76,height:hs[idx],borderRadius:"14px 14px 0 0",background:`linear-gradient(180deg,${p.color}44,${p.color}11)`,border:`1.5px solid ${p.color}55`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,animation:`podiumRise .6s ease ${.8+idx*.15}s both`,transformOrigin:"bottom"}}><span style={{fontSize:26}}>{ms[idx]}</span><span style={{fontFamily:"'Fredoka',sans-serif",fontSize:20,fontWeight:700,color:p.color}}>{familyScores[p.id]}</span></div></div>))}</div>
          <div style={{...card,padding:16,width:"100%",maxWidth:400,marginBottom:24}}>{sorted.map((p,i)=>{const c=(familyHistory[p.id]||[]).filter(r=>r.correct).length;return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<sorted.length-1?"1px solid rgba(255,255,255,.06)":"none"}}><span style={{fontFamily:"'Fredoka',sans-serif",fontSize:16,fontWeight:700,color:"#64748b",width:24}}>#{i+1}</span><span style={{fontSize:24}}>{p.avatar}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,color:p.color}}>{p.name}</div><div style={{fontSize:12,color:"#64748b"}}>{c}/{RPP}</div></div><span style={{fontFamily:"'Fredoka',sans-serif",fontSize:20,fontWeight:700,color:p.color}}>{familyScores[p.id]}</span></div>);})}</div>
          <div style={{display:"flex",gap:12}}><button className="btn" onClick={()=>startFamily(difficulty)} style={{padding:"12px 28px",borderRadius:14,border:"none",background:accent,color:"#1e293b",fontFamily:"'Nunito',sans-serif",fontSize:15,fontWeight:700}}>🔄 Revancha</button><button className="btn" onClick={goMenu} style={{...card,padding:"12px 28px",borderRadius:14,color:"#f1f5f9",fontFamily:"'Nunito',sans-serif",fontSize:15,fontWeight:700,background:"transparent"}}>🏠 Menú</button></div>
        </div>);})()}
    </div>
  );
}
