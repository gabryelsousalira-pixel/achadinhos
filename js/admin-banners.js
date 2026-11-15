import{$,esc,toast}from'./common.js';
import{slide,mountSlider,linkOk}from'./banners.js';
import{adminBanners,saveBanners,deleteBanner}from'./data.js';
import{upload}from'./supabase.js';
let B=[],ed=null,pv=null,blob=null;const F=()=>$('#bn-form');
const cur=()=>{const f=F();return{id:ed||'b'+Date.now().toString(36),titulo:f.titulo.value.trim(),subtitulo:f.subtitulo.value.trim(),botaoTexto:f.botaoTexto.value.trim(),link:f.link.value.trim(),corFundo:f.corFundo.value,corDestaque:f.corDestaque.value,corTexto:f.corTexto.value,ativo:f.ativo.checked,imagem:f.imagem.value}};
const prev=()=>{pv?.stop();pv=null;$('#bn-prev').innerHTML=slide(cur(),true)};
async function refresh(){try{B=await adminBanners()}catch(e){toast(e.message)}draw()}
function draw(){$('#bn-list').innerHTML=B.map((b,i)=>`<div class="row" style="grid-template-columns:44px 1fr"><img src="${esc(b.imagem||'')}" alt=""><div>${esc(b.titulo)} <small>${b.ativo?'Ativo':'Desativado'} · posição ${i+1}</small><div style="margin-top:6px"><button class="ibtn" data-a="up" data-i="${i}" aria-label="Subir">↑</button><button class="ibtn" data-a="dn" data-i="${i}" aria-label="Descer">↓</button><button class="ibtn" data-a="tg" data-i="${i}">${b.ativo?'Desativar':'Ativar'}</button><button class="ibtn" data-a="ed" data-i="${i}">Editar</button><button class="ibtn" data-a="rm" data-i="${i}">Excluir</button></div></div></div>`).join('')||'<div class="empty">Nenhum banner. Crie o primeiro ao lado.</div>'}
function reset(){ed=null;blob=null;F().reset();F().imagem.value='';$('#bn-ft').textContent='Novo banner';$('#bn-cancel').hidden=true;$('#bn-err').textContent='';prev()}
F().addEventListener('input',prev);
F().arquivo.addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;
 if(!file.type.startsWith('image/')||file.size>10e6)return $('#bn-err').textContent='Escolha uma imagem de até 10 MB.';
 const bm=await createImageBitmap(file),w=Math.min(1400,bm.width),c=document.createElement('canvas');c.width=w;c.height=Math.round(bm.height*w/bm.width);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);
 blob=await new Promise(r=>c.toBlob(r,'image/webp',.85));F().imagem.value=URL.createObjectURL(blob);$('#bn-err').textContent='';prev()});
F().addEventListener('submit',async e=>{e.preventDefault();const b=cur(),btn=e.submitter;
 if(!b.titulo)return $('#bn-err').textContent='Informe o título.';
 if(b.botaoTexto&&!linkOk(b.link))return $('#bn-err').textContent='O link do botão precisa começar com https:// ou ser uma âncora como #todos.';
 btn.disabled=true;
 try{if(blob){const ext=blob.type==='image/webp'?'webp':'png';b.imagem=await upload(`banners/${b.id}-${Date.now().toString(36)}.${ext}`,blob)}
  const i=B.findIndex(x=>x.id===ed),l=i<0?[...B,b]:B.map(x=>x.id===ed?b:x);await saveBanners(l);toast('Banner salvo');reset();await refresh()}
 catch(x){$('#bn-err').textContent=x.message}finally{btn.disabled=false}});
$('#bn-cancel').onclick=reset;
$('#bn-list').addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;const i=+t.dataset.i,a=t.dataset.a,l=B.map(x=>({...x}));
 try{if(a==='ed'){const b=B[i],f=F();ed=b.id;blob=null;for(const k of['titulo','subtitulo','botaoTexto','link','corFundo','corDestaque','corTexto','imagem'])f[k].value=b[k]||'';f.ativo.checked=b.ativo;$('#bn-ft').textContent='Editando banner';$('#bn-cancel').hidden=false;prev();f.scrollIntoView({behavior:'smooth'});return}
 if(a==='rm'){if(!confirm('Excluir "'+B[i].titulo+'"?'))return;await deleteBanner(B[i].id);toast('Banner excluído');return await refresh()}
 if(a==='up'&&i>0)[l[i-1],l[i]]=[l[i],l[i-1]];
 if(a==='dn'&&i<l.length-1)[l[i+1],l[i]]=[l[i],l[i+1]];
 if(a==='tg')l[i].ativo=!l[i].ativo;
 await saveBanners(l);await refresh()}catch(x){toast(x.message)}});
$('#bn-all').onclick=()=>{pv?.stop();const l=B.filter(b=>b.ativo);if(!l.length)return toast('Nenhum banner ativo');pv=mountSlider($('#bn-prev'),l,true)};
refresh().then(reset);
