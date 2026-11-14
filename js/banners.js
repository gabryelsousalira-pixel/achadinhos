import{esc}from'./common.js';
const col=(c,d)=>/^#[0-9a-f]{6}$/i.test(c)?c:d;
export const linkOk=u=>/^https:\/\/[^\s]+$/.test(u)||/^#[\w-]*$/.test(u);
export function slide(b,on=false){
 const ext=/^https:\/\//.test(b.link);
 return`<div class="bn${on?' on':''}" style="--bg:${col(b.corFundo,'#0c0c0d')};--ac:${col(b.corDestaque,'#ff6a1a')};--tx:${col(b.corTexto,'#f4f2ef')}"><div class="bn-t"><h2>${esc(b.titulo||'')}</h2>${b.subtitulo?`<p>${esc(b.subtitulo)}</p>`:''}${b.botaoTexto?`<a class="bn-b" href="${esc(linkOk(b.link)?b.link:'#todos')}"${ext?' target="_blank" rel="sponsored noopener noreferrer"':''}>${esc(b.botaoTexto)}</a>`:''}</div>${b.imagem?`<div class="bn-i"><img src="${esc(b.imagem)}" alt="${esc(b.titulo||'Banner')}"></div>`:''}</div>`}
export function mountSlider(root,list,auto=true){
 const n=list.length;
 root.innerHTML=`<div class="bs"><div class="bs-v"><div class="bs-tr">${list.map(b=>slide(b)).join('')}</div></div>${n>1?`<button class="bs-a l" aria-label="Banner anterior">‹</button><button class="bs-a r" aria-label="Próximo banner">›</button><div class="bs-d">${list.map((_,k)=>`<button aria-label="Ir para o banner ${k+1}"></button>`).join('')}</div>`:''}</div>`;
 const tr=root.querySelector('.bs-tr'),sl=[...tr.children],dt=[...root.querySelectorAll('.bs-d button')];
 let i=0,t=null;
 const go=k=>{i=(k+n)%n;tr.style.transform=`translateX(-${i*100}%)`;sl.forEach((s,j)=>{s.classList.toggle('on',j===i);s.inert=j!==i;s.setAttribute('aria-hidden',j!==i)});dt.forEach((d,j)=>d.setAttribute('aria-current',j===i))};
 const stop=()=>{clearInterval(t);t=null};
 const play=()=>{stop();if(auto&&n>1&&!matchMedia('(prefers-reduced-motion:reduce)').matches)t=setInterval(()=>go(i+1),6000)};
 root.querySelector('.l')?.addEventListener('click',()=>{go(i-1);play()});
 root.querySelector('.r')?.addEventListener('click',()=>{go(i+1);play()});
 dt.forEach((d,j)=>d.addEventListener('click',()=>{go(j);play()}));
 root.addEventListener('mouseenter',stop);root.addEventListener('mouseleave',play);root.addEventListener('focusin',stop);root.addEventListener('focusout',play);
 let x0=0;root.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
 root.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>50){go(i+(d<0?1:-1));play()}});
 document.addEventListener('visibilitychange',()=>document.hidden?stop():play());
 go(0);play();return{stop};
}
