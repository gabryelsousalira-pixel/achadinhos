import{configured,getSession,rest,signOut}from'./supabase.js';
const go=e=>location.replace('login.html'+(e?'?e='+e:''));
// Retorna a sessão só se houver login E a conta estiver na tabela admins (is_admin no servidor).
export async function requireAdmin(){
 if(!configured)return go('config');
 const s=await getSession();if(!s)return go();
 try{if((await rest('rpc/is_admin',{method:'POST',body:{}}))!==true){await signOut();return go('perm')}}
 catch(e){if(e.status){await signOut();return go('perm')}return go('net')}
 return s}
