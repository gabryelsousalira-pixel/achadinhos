export const $=(s,r=document)=>r.querySelector(s);
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export const LOJAS={SHEIN:'SHEIN',Shopee:'Shopee','TikTok Shop':'TikTok'};
export const safeUrl=u=>{try{return ['https:','http:'].includes(new URL(u).protocol)?u:'#'}catch{return '#'}};
export const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
export const pct=p=>p.precoAntigo>p.preco?Math.round((1-p.preco/p.precoAntigo)*100):0;
export function toast(m){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';t.setAttribute('role','status');document.body.append(t)}t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2200)}
