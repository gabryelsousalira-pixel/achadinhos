import{$,store}from'./common.js';
const guess=()=>{const h=location.hostname,p=location.pathname.split('/')[1];return h.endsWith('.github.io')?{owner:h.split('.')[0],repo:p||h}:{owner:'',repo:''}};
export const cfg=()=>({...guess(),branch:'main',...store.get('ach_gh',{}),token:sessionStorage.getItem('ach_tk')||''});
const b64=s=>btoa(unescape(encodeURIComponent(s)));
const MSG={401:'Token inválido ou expirado.',403:'Sem permissão. O token precisa de Contents: leitura e escrita neste repositório.',404:'Repositório, branch ou arquivo não encontrado. Confira os dados da conexão.',409:'Conflito de versão. Recarregue o painel e publique de novo.',422:'O GitHub recusou o envio. Recarregue o painel e tente de novo.'};
async function api(path,o={}){const c=cfg();if(!c.token||!c.owner||!c.repo)throw Error('Preencha e salve a conexão com o GitHub primeiro.');
 const r=await fetch(`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${path}${o.method?'':'?ref='+encodeURIComponent(c.branch)}`,{...o,headers:{Authorization:'Bearer '+c.token,Accept:'application/vnd.github+json','Content-Type':'application/json'}});
 if(r.status===404&&!o.method)return null;
 if(!r.ok)throw Error(MSG[r.status]||'Erro do GitHub ('+r.status+').');return r.json()}
export async function getText(path){const j=await api(path);return j?decodeURIComponent(escape(atob(j.content.replace(/\n/g,'')))):null}
export async function putFile(path,{text,base64},msg){const c=cfg(),old=await api(path);
 await api(path,{method:'PUT',body:JSON.stringify({message:msg,content:base64??b64(text),branch:c.branch,...(old?{sha:old.sha}:{})})})}
export function initConnection(){const f=$('#gh-form');if(!f)return;const c=cfg();
 for(const k of['owner','repo','branch','token'])f[k].value=c[k]||'';
 f.addEventListener('submit',e=>{e.preventDefault();store.set('ach_gh',{owner:f.owner.value.trim(),repo:f.repo.value.trim(),branch:f.branch.value.trim()||'main'});sessionStorage.setItem('ach_tk',f.token.value.trim());$('#gh-ok').textContent='Conexão salva (o token vale só até fechar esta aba).'})}
