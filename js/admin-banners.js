import{$,esc,toast,store}from'./common.js';
import{slide,mountSlider,linkOk}from'./banners.js';
import{getText,putFile,cfg}from'./github.js';
let B=[],ed=null,pv=null;const DK='ach_bn_draft',F=()=>$('#bn-form');
const KEYS=['id','titulo','subtitulo','imagem','botaoTexto','link','corFundo','corDestaque','corTexto','ativo'];
const clean=b=>Object.fromEntries(KEYS.map(k=>[k,b[k]]));
const draft=()=>{store.set(DK,B);$('#bn-status').textContent='Alterações não publicadas.'};
const cur=()=>{const f=F();return{id:ed||'b'+Date.now().toString(36),titulo:f.titulo.value.trim(),subtitulo:f.subtitulo.value.trim(),botaoTexto:f.botaoTexto.value.trim(),link:f.link.value.trim(),corFundo:f.corFundo.value,corDestaque:f.corDestaque.value,corTexto:f.corTexto.value,ativo:f.ativo.checked,imagem:f.imagem.value}};
const prev=()=>{pv?.stop();pv=null;$('#bn-prev').innerHTML=slide(cur(),true)};
function draw(){$('#bn-list').innerHTML=B.map((b,i)=>`<div class="row" style="grid-template-columns:44px 1fr"><img src="${esc(b.imagem||'')}" alt=""><div>${esc(b.titulo)} <small>${b.ativo?'Ativo':'Desativado'} · posição ${i+1}</small><div style="margin-top:6px"><button class="ibtn" data-a="up" data-i="${i}" aria-label="Subir">↑</button><button class="ibtn" data-a="dn" data-i="${i}" aria-label="Descer">↓</button><button class="ibtn" data-a="tg" data-i="${i}">${b.ativo?'Desativar':'Ativar'}</button><button class="ibtn" data-a="ed" data-i="${i}">Editar</button><button class="ibtn" data-a="rm" data-i="${i}">Excluir</button></div></div></div>`).join('')||'<div class="empty">Nenhum banner. Crie o primeiro ao lado.</div>'}
function reset(){ed=null;F().reset();F().imagem.value='';$('#bn-ft').textContent='Novo banner';$('#bn-cancel').hidden=true;$('#bn-err').textContent='';prev()}
F().addEventListener('input',prev);
F().arquivo.addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;
 if(!file.type.startsWith('image/')||file.size>10e6)return $('#bn-err').textContent='Escolha uma imagem de até 10 MB.';
 const bm=await createImageBitmap(file),w=Math.min(1400,bm.width),c=document.createElement('canvas');c.width=w;c.height=Math.round(bm.height*w/bm.width);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);
 F().imagem.value=c.toDataURL('image/webp',.85);$('#bn-err').textContent='';prev()});
F().addEventListener('submit',e=>{e.preventDefault();const b=cur();
 if(!b.titulo)return $('#bn-err').textContent='Informe o título.';
 if(b.botaoTexto&&!linkOk(b.link))return $('#bn-err').textContent='O link do botão precisa começar com https:// ou ser uma âncora como #todos.';
 const i=B.findIndex(x=>x.id===ed);i<0?B.push(b):B[i]=b;draft();draw();reset();toast('Banner salvo no rascunho')});
$('#bn-cancel').onclick=reset;
$('#bn-list').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;const i=+t.dataset.i,a=t.dataset.a;
 if(a==='up'&&i>0)[B[i-1],B[i]]=[B[i],B[i-1]];
 if(a==='dn'&&i<B.length-1)[B[i+1],B[i]]=[B[i],B[i+1]];
 if(a==='tg')B[i].ativo=!B[i].ativo;
 if(a==='rm'){if(!confirm('Excluir "'+B[i].titulo+'"?'))return;B.splice(i,1)}
 if(a==='ed'){const b=B[i],f=F();ed=b.id;for(const k of['titulo','subtitulo','botaoTexto','link','corFundo','corDestaque','corTexto','imagem'])f[k].value=b[k]||'';f.ativo.checked=b.ativo;$('#bn-ft').textContent='Editando banner';$('#bn-cancel').hidden=false;prev();f.scrollIntoView({behavior:'smooth'});return}
 draft();draw()});
$('#bn-all').onclick=()=>{pv?.stop();const l=B.filter(b=>b.ativo);if(!l.length)return toast('Nenhum banner ativo');pv=mountSlider($('#bn-prev'),l,true)};
$('#bn-discard').onclick=async()=>{localStorage.removeItem(DK);await init();toast('Rascunho descartado')};
$('#bn-pub').onclick=async()=>{const s=$('#bn-status'),btn=$('#bn-pub');btn.disabled=true;
 try{if(!confirm('Publicar os banners para todos os visitantes?'))return;
  const c=cfg();
  for(const b of B)if(b.imagem.startsWith('data:')){s.textContent='Enviando imagem: '+b.titulo+'…';
   const ext=b.imagem.startsWith('data:image/webp')?'webp':'png',path=`imagens/banners/${b.id}-${Date.now().toString(36)}.${ext}`;
   await putFile(path,{base64:b.imagem.split(',')[1]},'Banner: imagem '+b.id);b.imagem=path}
  s.textContent='Publicando banners…';
  await putFile('data/banners.json',{text:JSON.stringify(B.map(clean),null,1)},'Atualiza banners pelo painel');
  localStorage.removeItem(DK);draw();s.textContent='Publicado. O site pode levar alguns minutos para mostrar a mudança.';toast('Banners publicados')
 }catch(err){s.textContent='Falha ao publicar: '+err.message}finally{btn.disabled=false}};
async function init(){let d=null;
 try{if(cfg().token){const t=await getText('data/banners.json');if(t)d=JSON.parse(t)}}catch{}
 if(!d)try{d=await(await fetch('data/banners.json',{cache:'no-cache'})).json()}catch{d=[]}
 const dr=store.get(DK,null);B=dr||d;$('#bn-status').textContent=dr?'Rascunho com alterações não publicadas.':'Sincronizado com o site.';draw();reset()}
init();
