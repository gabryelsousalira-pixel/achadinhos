import{configured,rest}from'./supabase.js';
const toP=r=>({id:r.id,nome:r.nome,loja:r.loja,genero:r.genero,categoria:r.categoria,imagem:r.imagem,preco:+r.preco,precoAntigo:+r.preco_antigo||0,vendidos:r.vendidos||'',link:r.link,destaque:r.destaque,ordem:r.ordem});
const fromP=(p,i)=>({id:p.id,nome:p.nome,loja:p.loja,genero:p.genero,categoria:p.categoria,imagem:p.imagem,preco:p.preco,preco_antigo:p.precoAntigo||0,vendidos:p.vendidos||'',link:p.link,destaque:!!p.destaque,ordem:p.ordem??i??0});
const toB=r=>({id:r.id,titulo:r.titulo,subtitulo:r.subtitulo,imagem:r.imagem,botaoTexto:r.botao_texto,link:r.link,corFundo:r.cor_fundo,corDestaque:r.cor_destaque,corTexto:r.cor_texto,ativo:r.ativo,ordem:r.ordem});
const fromB=(b,i)=>({id:b.id,titulo:b.titulo,subtitulo:b.subtitulo||'',imagem:b.imagem||'',botao_texto:b.botaoTexto||'',link:b.link||'#todos',cor_fundo:b.corFundo,cor_destaque:b.corDestaque,cor_texto:b.corTexto,ativo:!!b.ativo,ordem:i});
const stat=u=>fetch(u,{cache:'no-cache'}).then(r=>{if(!r.ok)throw 0;return r.json()});
// Vitrine pública: banco (leitura pública via RLS); se não configurado/vazio/offline, usa os JSON estáticos.
export async function loadProducts(){
 if(configured)try{const r=await rest('products?select=*&order=ordem.asc,created_at.desc');if(r.length)return r.map(toP)}catch{}
 return stat('data/produtos.json')}
export async function loadBanners(){
 if(configured)try{const r=await rest('banners?select=*&ordem=gte.0&order=ordem.asc');if(r.length)return r.map(toB)}catch{}
 return stat('data/banners.json')}
// Painel (exige sessão de admin; o RLS do banco é quem realmente autoriza).
export const adminProducts=()=>rest('products?select=*&order=ordem.asc,created_at.desc').then(r=>r.map(toP));
export const saveProducts=l=>rest('products?on_conflict=id',{method:'POST',prefer:'resolution=merge-duplicates',body:l.map(fromP)});
export const deleteProduct=id=>rest('products?id=eq.'+encodeURIComponent(id),{method:'DELETE'});
export const adminBanners=()=>rest('banners?select=*&order=ordem.asc').then(r=>r.map(toB));
export const saveBanners=l=>rest('banners?on_conflict=id',{method:'POST',prefer:'resolution=merge-duplicates',body:l.map(fromB)});
export const deleteBanner=id=>rest('banners?id=eq.'+encodeURIComponent(id),{method:'DELETE'});
