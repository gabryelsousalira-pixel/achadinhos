// Cliente mínimo do Supabase (Auth + REST + Storage) via fetch, sem bibliotecas.
import{SUPABASE_URL as U,SUPABASE_KEY as K}from'./config.js';
export const configured=(/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(U)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(U))&&K.length>20&&!/secret|service_role/i.test(K);
export const SESSION_KEY='ach_sb_session';
const read=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY))}catch{return null}};
const write=s=>s?localStorage.setItem(SESSION_KEY,JSON.stringify(s)):localStorage.removeItem(SESSION_KEY);
// A chave publishable vai SÓ no header apikey; o Authorization leva apenas o token do usuário logado.
const hdr=t=>({apikey:K,'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})});
async function auth(path,body,tok){
 const r=await fetch(U+'/auth/v1/'+path,{method:'POST',headers:hdr(tok),body:body?JSON.stringify(body):undefined});
 const j=await r.json().catch(()=>({}));
 if(!r.ok)throw Object.assign(new Error(j.msg||j.error_description||'Erro de autenticação'),{status:r.status,code:j.error_code||j.error});
 return j}
const pack=j=>({access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||Math.floor(Date.now()/1000)+j.expires_in,user:{id:j.user.id,email:j.user.email}});
export async function signIn(email,password){const s=pack(await auth('token?grant_type=password',{email,password}));write(s);return s}
export async function signOut(){const s=read();write(null);if(s)try{await auth('logout?scope=local',null,s.access_token)}catch{}}
let refreshing=null;
export async function getSession(){
 const s=read();if(!s)return null;
 if(s.expires_at-60>Date.now()/1000)return s;
 refreshing??=auth('token?grant_type=refresh_token',{refresh_token:s.refresh_token}).then(j=>{const n=pack(j);write(n);return n}).catch(e=>{if(e.status&&e.status<500)write(null);return null}).finally(()=>{refreshing=null});
 return refreshing}
export async function rest(path,{method='GET',body,prefer}={}){
 const s=await getSession(),h=hdr(s?.access_token);
 if(method!=='GET')h.Prefer=[prefer,'return=representation'].filter(Boolean).join(',');
 const r=await fetch(U+'/rest/v1/'+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});
 const j=await r.json().catch(()=>null);
 if(!r.ok)throw Object.assign(new Error(r.status===401||r.status===403?'Sem permissão para esta ação.':(j?.message||'Erro ao acessar o banco de dados.')),{status:r.status});
 // O RLS bloqueia UPDATE/DELETE devolvendo lista vazia (sem erro): tratamos como "sem permissão".
 if((method==='PATCH'||method==='DELETE')&&Array.isArray(j)&&!j.length)throw Object.assign(new Error('Sem permissão ou item inexistente.'),{status:403});
 return j}
export async function upload(path,blob){
 const s=await getSession();if(!s)throw Error('Sessão expirada. Entre novamente.');
 const r=await fetch(`${U}/storage/v1/object/imagens/${path}`,{method:'POST',headers:{apikey:K,Authorization:'Bearer '+s.access_token,'Content-Type':blob.type,'x-upsert':'false'},body:blob});
 if(!r.ok)throw Error('Não foi possível enviar a imagem (sem permissão ou arquivo inválido).');
 return`${U}/storage/v1/object/public/imagens/${path}`}
