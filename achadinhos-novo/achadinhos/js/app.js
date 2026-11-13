import{$,esc,brl,safeUrl,store,pct,toast,load}from'./common.js';
let P=[],favs=new Set(store.get('ach_favs',[]));
const f={q:'',loja:'Todas',gen:'Todos',cat:'Todas',sort:'rel',fav:false};
const card=p=>{const d=pct(p),on=favs.has(p.id);return`<article class="card"><div class="pic"><img src="${esc(p.imagem)}" alt="${esc(p.nome)}" loading="lazy" width="400" height="400">${d?`<span class="off">-${d}%</span>`:''}<button class="fav${on?' on':''}" data-id="${esc(p.id)}" aria-pressed="${on}" aria-label="${on?'Remover dos':'Adicionar aos'} favoritos">${on?'♥':'♡'}</button></div><div class="info"><span class="loja ${esc(p.loja.split(' ')[0])}">${esc(p.loja)}</span><h3>${esc(p.nome)}</h3>${d?`<span class="old">${brl(p.precoAntigo)}</span>`:''}<span class="price">${brl(p.preco)}</span><span class="sold">${esc(p.vendidos||'')}</span><a class="buy" href="${esc(safeUrl(p.link))}" target="_blank" rel="sponsored noopener noreferrer">Conferir na ${esc(p.loja)}</a></div></article>`};
const uniq=k=>['Todas',...new Set(P.map(p=>p[k]))];
function chips(el,vals,key){$(el).innerHTML=vals.map(v=>`<button class="chip${f[key]===v?' on':''}" data-k="${key}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}
function render(){
 const q=f.q.trim().toLowerCase();
 let l=P.filter(p=>(!q||(p.nome+' '+p.loja+' '+p.categoria).toLowerCase().includes(q))&&(f.loja==='Todas'||p.loja===f.loja)&&(f.gen==='Todos'||p.genero===f.gen)&&(f.cat==='Todas'||p.categoria===f.cat)&&(!f.fav||favs.has(p.id)));
 const s={asc:(a,b)=>a.preco-b.preco,desc:(a,b)=>b.preco-a.preco,off:(a,b)=>pct(b)-pct(a),rel:(a,b)=>(parseInt(b.vendidos)||0)-(parseInt(a.vendidos)||0)};
 l.sort(s[f.sort]);
 chips('#lojas',uniq('loja'),'loja');chips('#gens',['Todos',...new Set(P.map(p=>p.genero))],'gen');chips('#cats',uniq('categoria'),'cat');
 $('#grid').innerHTML=l.map(card).join('');
 $('#count').textContent=l.length+(l.length===1?' produto':' produtos');
 $('#empty').hidden=l.length>0;
 $('#favbtn').textContent='♥ Favoritos ('+favs.size+')';$('#favbtn').classList.toggle('on',f.fav);
 const free=!q&&f.loja==='Todas'&&f.gen==='Todos'&&f.cat==='Todas'&&!f.fav;
 $('#home').hidden=!free;
 if(free){$('#car').innerHTML=P.filter(p=>p.destaque).map(card).join('');
  $('#deals').innerHTML=[...P].sort(s.off).slice(0,8).map(card).join('')}
}
document.addEventListener('click',e=>{
 const c=e.target.closest('.chip'),fv=e.target.closest('.fav');
 if(c){f[c.dataset.k]=c.dataset.v;render()}
 if(fv){const id=fv.dataset.id;favs.has(id)?favs.delete(id):favs.add(id);store.set('ach_favs',[...favs]);toast(favs.has(id)?'Salvo nos favoritos':'Removido dos favoritos');render()}
 if(e.target.closest('[data-go]')){$('#todos').scrollIntoView({behavior:'smooth'})}
 if(e.target.closest('#reset')){Object.assign(f,{q:'',loja:'Todas',gen:'Todos',cat:'Todas',fav:false});$('#q').value='';render()}
 const n=e.target.closest('[data-nav]');if(n)$('#car').scrollBy({left:n.dataset.nav*260,behavior:'smooth'});
});
$('#q').addEventListener('input',e=>{f.q=e.target.value;render()});
$('#sbox').addEventListener('submit',e=>{e.preventDefault();$('#todos').scrollIntoView({behavior:'smooth'})});
$('#sort').addEventListener('change',e=>{f.sort=e.target.value;render()});
$('#favbtn').addEventListener('click',()=>{f.fav=!f.fav;render();$('#todos').scrollIntoView({behavior:'smooth'})});
load().then(d=>{P=d;render()}).catch(()=>{$('#grid').innerHTML='<div class="empty">Não foi possível carregar os produtos. Abra o site por um servidor (GitHub Pages ou <code>python3 -m http.server</code>), não direto pelo arquivo.</div>'});
