import{configured,signIn,signOut,getSession,rest}from'./supabase.js';
const $=s=>document.querySelector(s),err=$('#err'),btn=$('#go');
const M={config:'O Supabase ainda não foi configurado. Preencha js/config.js (veja CONFIGURAR-SUPABASE.md).',perm:'Esta conta não tem permissão de administrador.',net:'Sem conexão com o servidor. Tente novamente.'};
const q=new URLSearchParams(location.search).get('e');if(q)err.textContent=M[q]||'';
$('#eye').onclick=e=>{const p=$('#pass'),show=p.type==='password';p.type=show?'text':'password';e.target.textContent=show?'Ocultar':'Mostrar';e.target.setAttribute('aria-pressed',show);e.target.setAttribute('aria-label',show?'Ocultar senha':'Mostrar senha')};
const isAdmin=async()=>{try{return(await rest('rpc/is_admin',{method:'POST',body:{}}))===true}catch(e){return e.status?false:null}};
if(!q&&configured)getSession().then(async s=>{if(s&&await isAdmin()===true)location.replace('admin.html')});
$('#lf').addEventListener('submit',async e=>{e.preventDefault();err.textContent='';
 const email=$('#email').value.trim(),pw=$('#pass').value;
 if(!configured)return err.textContent=M.config;
 if(!email||!pw)return err.textContent='Informe e-mail e senha.';
 btn.disabled=true;btn.textContent='Entrando…';
 try{await signIn(email,pw);const a=await isAdmin();if(a===true)return location.replace('admin.html');await signOut();err.textContent=a===false?M.perm:M.net}
 catch(x){$('#pass').value='';err.textContent=!x.status?M.net:x.status===429?'Muitas tentativas. Aguarde alguns minutos e tente de novo.':x.code==='email_not_confirmed'?'Confirme seu e-mail antes de entrar.':'E-mail ou senha incorretos.'}
 finally{btn.disabled=false;btn.textContent='Entrar'}});
