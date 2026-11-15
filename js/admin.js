import{$,esc,brl,toast}from'./common.js';
import{adminProducts,saveProducts,deleteProduct}from'./data.js';
let P=[],ed=null;
const okImg=v=>/^https:\/\//.test(v)||/^imagens\/[\w.\-\/]+\.(jpe?g|png|webp)$/i.test(v);
async function refresh(){try{P=await adminProducts()}catch(e){toast(e.message)}draw()}
function draw(){const q=$('#aq').value.toLowerCase(),l=P.filter(p=>p.nome.toLowerCase().includes(q));
 $('#ac').textContent=l.length+' de '+P.length;
 $('#list').innerHTML=l.map(p=>`<div class="row"><img src="${esc(p.imagem)}" alt=""><div>${esc(p.nome)}<small>${esc(p.loja)} · ${esc(p.categoria)} · ${brl(p.preco)}</small></div><div><button class="ibtn" data-e="${esc(p.id)}">Editar</button><button class="ibtn" data-d="${esc(p.id)}">Remover</button></div></div>`).join('')||'<div class="empty">Nenhum produto no banco. Rode o supabase/setup.sql ou use “Importar JSON” com data/produtos.json.</div>';
 $('#cl').innerHTML=[...new Set(P.map(p=>p.categoria))].map(c=>`<option value="${esc(c)}">`).join('')}
function reset(){ed=null;$('#form').reset();$('#ft').textContent='Novo produto';$('#cancel').hidden=true;$('#err').textContent=''}
$('#form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),link=d.link.trim(),btn=e.submitter;
 if(!/^https:\/\//.test(link))return $('#err').textContent='O link precisa começar com https://';
 if(!okImg(d.imagem.trim()))return $('#err').textContent='Imagem: use imagens/arquivo.jpg ou um link https://';
 const old=P.find(p=>p.id===ed),o={id:ed||'p'+Date.now().toString(36),nome:d.nome.trim(),loja:d.loja,genero:d.genero,categoria:d.categoria.trim(),imagem:d.imagem.trim(),preco:+d.preco,precoAntigo:+d.precoAntigo||0,vendidos:d.vendidos.trim(),link,destaque:!!d.destaque,ordem:old?old.ordem:Math.min(0,...P.map(p=>p.ordem))-1};
 btn.disabled=true;try{await saveProducts([o]);toast('Produto salvo');reset();await refresh()}catch(x){$('#err').textContent=x.message}finally{btn.disabled=false}});
$('#list').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.d){const p=P.find(x=>x.id===b.dataset.d);if(!confirm('Remover "'+p.nome+'"?'))return;try{await deleteProduct(p.id);toast('Produto removido');await refresh()}catch(x){toast(x.message)}}
 if(b.dataset.e){const p=P.find(x=>x.id===b.dataset.e),f=$('#form');ed=p.id;for(const k of['nome','loja','genero','categoria','preco','precoAntigo','vendidos','imagem','link'])f[k].value=p[k]||'';f.destaque.checked=!!p.destaque;$('#ft').textContent='Editando produto';$('#cancel').hidden=false;f.scrollIntoView({behavior:'smooth'})}});
$('#cancel').onclick=reset;$('#aq').oninput=draw;
$('#exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(P,null,1)],{type:'application/json'}));a.download='produtos.json';a.click();URL.revokeObjectURL(a.href)};
$('#imp').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());
 if(!Array.isArray(d)||d.some(p=>!/^[\w-]{1,40}$/.test(p.id||'')||!p.nome||!(p.preco>0)||!/^https:\/\//.test(p.link)||!okImg(p.imagem||'')))throw Error('Arquivo inválido');
 await saveProducts(d.map((p,i)=>({...p,ordem:p.ordem??i})));toast('Importado: '+d.length+' produtos');await refresh()}catch(x){toast(x.message||'Arquivo inválido')}e.target.value=''};
refresh();
