import{requireAdmin}from'./auth-guard.js';
import{signOut,SESSION_KEY}from'./supabase.js';
const s=await requireAdmin();
if(s){
 const $=i=>document.getElementById(i);
 $('who').textContent=s.user.email;$('app').hidden=false;
 $('out').onclick=async()=>{await signOut();location.replace('login.html')};
 addEventListener('storage',e=>{if(e.key===SESSION_KEY&&!e.newValue)location.replace('login.html')});
 addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
 await import('./admin.js');await import('./admin-banners.js');
}
