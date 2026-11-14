import{putFile}from'./github.js';
import{$,esc,brl,store,toast,load}from'./common.js';
let P=[],ed=null;const KEY='ach_admin';
const save=()=>store.set(KEY,P);
const okImg=v=>/^https:\/\//.test(v)||/^imagens\/[\w.\-]+\.(jpe?g|png|webp)$/i.test(v);
function draw(){const q=$('#aq').value.toLowerCase();const l=P.filter(p=>p.nome.toLowerCase().includes(q));
 $('#ac').textContent=l.length+' de '+P.length;
 $('#list').innerHTML=l.map(p=>`<div class="row"><img src="${esc(p.imagem)}" alt=""><div>${esc(p.nome)}<small>${esc(p.loja)} · ${esc(p.categoria)} · ${brl(p.preco)}</small></div><div><button class="ibtn" data-e="${esc(p.id)}">Editar</button><button class="ibtn" data-d="${esc(p.id)}">Remover</button></div></div>`).join('')||'<div class="empty">Nenhum produto.</div>';
 $('#cl').innerHTML=[...new Set(P.map(p=>p.categoria))].map(c=>`<option value="${esc(c)}">`).join('')}
function reset(){ed=null;$('#form').reset();$('#ft').textContent='Novo produto';$('#cancel').hidden=true;$('#err').textContent=''}
$('#form').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
 const link=d.link.trim();if(!/^https:\/\//.test(link))return $('#err').textContent='O link precisa começar com https://';
 if(!okImg(d.imagem.trim()))return $('#err').textContent='Imagem: use imagens/arquivo.jpg ou um link https://';
 const o={id:ed||'p'+Date.now().toString(36),nome:d.nome.trim(),loja:d.loja,genero:d.genero,categoria:d.categoria.trim(),imagem:d.imagem.trim(),preco:+d.preco,precoAntigo:+d.precoAntigo||0,vendidos:d.vendidos.trim(),link,destaque:!!d.destaque};
 const i=P.findIndex(p=>p.id===ed);i<0?P.unshift(o):P[i]=o;save();draw();reset();toast('Produto salvo')});
$('#list').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.d){const p=P.find(x=>x.id===b.dataset.d);if(confirm('Remover "'+p.nome+'"?')){P=P.filter(x=>x!==p);save();draw();toast('Produto removido')}}
 if(b.dataset.e){const p=P.find(x=>x.id===b.dataset.e);ed=p.id;const f=$('#form');for(const k of['nome','loja','genero','categoria','preco','precoAntigo','vendidos','imagem','link'])f[k].value=p[k]||'';f.destaque.checked=!!p.destaque;$('#ft').textContent='Editando produto';$('#cancel').hidden=false;f.scrollIntoView({behavior:'smooth'})}});
$('#cancel').onclick=reset;$('#aq').oninput=draw;
$('#exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(P,null,1)],{type:'application/json'}));a.download='produtos.json';a.click();URL.revokeObjectURL(a.href)};
$('#imp').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());if(!Array.isArray(d)||d.some(p=>!p.id||!p.nome||!(p.preco>0)||!/^https:\/\//.test(p.link)))throw 0;P=d;save();draw();toast('Importado: '+d.length+' produtos')}catch{toast('Arquivo inválido')}e.target.value=''};
const draft=store.get(KEY,null);
load().then(d=>{P=draft||d;draw()}).catch(()=>{P=draft||[];draw()});
$('#pub').onclick=async()=>{if(!confirm('Publicar os produtos para todos os visitantes?'))return;try{await putFile('data/produtos.json',{text:JSON.stringify(P,null,1)},'Atualiza produtos pelo painel');localStorage.removeItem(KEY);toast('Produtos publicados')}catch(e){toast(e.message)}};
