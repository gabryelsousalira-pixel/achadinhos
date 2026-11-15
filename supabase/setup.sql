-- ACHADINHOS: estrutura, segurança (RLS) e dados iniciais.
-- Cole TUDO no Supabase em SQL Editor > New query e clique em Run. Pode rodar de novo sem duplicar nada.
-- Este arquivo NÃO contém senhas nem chaves.

-- 1) Quem é administrador (a tabela fica fechada para a API; só a função is_admin() a consulta)
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 2) Produtos
create table if not exists public.products (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,40}$'),
  nome text not null check (char_length(nome) between 1 and 140),
  loja text not null check (loja in ('SHEIN','Shopee','TikTok Shop')),
  genero text not null check (char_length(genero) between 1 and 20),
  categoria text not null check (char_length(categoria) between 1 and 40),
  imagem text not null check (imagem ~ '^(https://|imagens/)'),
  preco numeric(10,2) not null check (preco > 0),
  preco_antigo numeric(10,2) not null default 0 check (preco_antigo >= 0),
  vendidos text not null default '' check (char_length(vendidos) <= 60),
  link text not null check (link ~ '^https://'),
  destaque boolean not null default false,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
drop policy if exists products_select on public.products;
drop policy if exists products_insert on public.products;
drop policy if exists products_update on public.products;
drop policy if exists products_delete on public.products;
create policy products_select on public.products for select to anon, authenticated using (true);
create policy products_insert on public.products for insert to authenticated with check (public.is_admin());
create policy products_update on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy products_delete on public.products for delete to authenticated using (public.is_admin());

-- 3) Banners (visitantes só enxergam os ativos)
create table if not exists public.banners (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,40}$'),
  titulo text not null check (char_length(titulo) between 1 and 80),
  subtitulo text not null default '' check (char_length(subtitulo) <= 160),
  imagem text not null default '' check (imagem = '' or imagem ~ '^(https://|imagens/)'),
  botao_texto text not null default '' check (char_length(botao_texto) <= 30),
  link text not null default '#todos' check (link ~ '^(https://[^ ]+|#[A-Za-z0-9_-]*)$'),
  cor_fundo text not null default '#0c0c0d' check (cor_fundo ~ '^#[0-9a-fA-F]{6}$'),
  cor_destaque text not null default '#ff6a1a' check (cor_destaque ~ '^#[0-9a-fA-F]{6}$'),
  cor_texto text not null default '#f4f2ef' check (cor_texto ~ '^#[0-9a-fA-F]{6}$'),
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.banners enable row level security;
drop policy if exists banners_select on public.banners;
drop policy if exists banners_insert on public.banners;
drop policy if exists banners_update on public.banners;
drop policy if exists banners_delete on public.banners;
create policy banners_select on public.banners for select to anon, authenticated using (ativo or public.is_admin());
create policy banners_insert on public.banners for insert to authenticated with check (public.is_admin());
create policy banners_update on public.banners for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy banners_delete on public.banners for delete to authenticated using (public.is_admin());

-- 4) Armazenamento de imagens de banner (leitura pública; envio/alteração/exclusão só admin)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagens','imagens',true,5242880,array['image/webp','image/png','image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/webp','image/png','image/jpeg'];
drop policy if exists imagens_insert on storage.objects;
drop policy if exists imagens_update on storage.objects;
drop policy if exists imagens_delete on storage.objects;
create policy imagens_insert on storage.objects for insert to authenticated with check (bucket_id = 'imagens' and public.is_admin());
create policy imagens_update on storage.objects for update to authenticated using (bucket_id = 'imagens' and public.is_admin()) with check (bucket_id = 'imagens' and public.is_admin());
create policy imagens_delete on storage.objects for delete to authenticated using (bucket_id = 'imagens' and public.is_admin());

-- 5) Dados atuais do site (links de afiliado preservados; não sobrescreve o que já existir)
insert into public.products (id,nome,loja,genero,categoria,imagem,preco,preco_antigo,vendidos,link,destaque,ordem) values
  ('p11','Kit 2 Camisetas Slim Fit Caneladas Preta e Branca','SHEIN','Masculino','Camisetas','imagens/p11.jpg',59.90,89.90,'10mil+ vendidos','https://onelink.shein.com/47/5yl6418xgxtg',true,0),
  ('p12','Camiseta Oversized Branca Estampa Lábios e Cruz','SHEIN','Masculino','Camisetas','imagens/p12.jpg',49.90,79.90,'5mil+ vendidos','https://onelink.shein.com/47/5yl6dydiw9y2',false,1),
  ('p13','Camiseta Preta Oversized com Vivos Brancos Streetwear','SHEIN','Masculino','Camisetas','imagens/p13.jpg',54.90,84.90,'3mil+ vendidos','https://onelink.shein.com/47/5yl6jxfw5jyv',false,2),
  ('p14','Moletom Zíper Cinza com Bordado Cruz Premium','SHEIN','Masculino','Moletons','imagens/p14.jpg',99.90,149.90,'2mil+ vendidos','https://onelink.shein.com/47/5yl6wfaxtd2d',false,3),
  ('p15','Cinto Preto Couro Fivela Prata Oval Design','SHEIN','Masculino','Acessórios','imagens/p15.jpg',39.90,69.90,'8mil+ vendidos','https://onelink.shein.com/47/5yl709f3qlv2',false,4),
  ('p16','Vestido/Conjunto Floral Azul e Branco com Amarração','SHEIN','Feminino','Vestidos','imagens/p16.jpg',79.90,119.90,'4mil+ vendidos','https://onelink.shein.com/47/5yl80tgpt3m2',false,5),
  ('p17','Blusa Gola Alta Canelada Vinho Manga Longa','SHEIN','Feminino','Camisetas','imagens/p17.jpg',44.90,69.90,'6mil+ vendidos','https://onelink.shein.com/47/5yl828riqivv',true,6),
  ('p18','Vestido Tomara que Caia Tubinho Vinho Justo','SHEIN','Feminino','Vestidos','imagens/p18.jpg',49.90,79.90,'7mil+ vendidos','https://onelink.shein.com/47/5yl8ectcncre',false,7),
  ('p19','Moletom Hoodie Cinza Claro Cropped com Cruz','SHEIN','Feminino','Moletons','imagens/p19.jpg',89.90,139.90,'3mil+ vendidos','https://onelink.shein.com/47/5ylhts3r6gix',false,8),
  ('p20','Macaquinho Preto Tomara que Caia com Detalhes Dourados','SHEIN','Feminino','Vestidos','imagens/p20.jpg',69.90,109.90,'2mil+ vendidos','https://onelink.shein.com/47/5ylhuzifp2m3',false,9),
  ('p21','Vestido Tomara que Caia Azul Padrão Étnico','SHEIN','Feminino','Vestidos','imagens/p21.jpg',59.90,99.90,'4mil+ vendidos','https://onelink.shein.com/47/5yli0euhtsuj',false,10),
  ('p22','Vestido Preto Halter Decote V Franzido Sexy','SHEIN','Feminino','Vestidos','imagens/p22.jpg',54.90,89.90,'5mil+ vendidos','https://onelink.shein.com/47/5yli1m96aazv',false,11),
  ('p23','Vestido Tomara que Caia Estampa Tropical Azul e Branco','SHEIN','Feminino','Vestidos','imagens/p23.jpg',64.90,99.90,'3mil+ vendidos','https://onelink.shein.com/47/5yli2bwkt4jw',true,12),
  ('p24','Vestido Longo Branco e Azul Estampa Paisley','SHEIN','Feminino','Vestidos','imagens/p24.jpg',79.90,129.90,'2mil+ vendidos','https://onelink.shein.com/47/5yli37h2jwat',false,13),
  ('p25','Moletom Zíper Preto Streetwear Estampa Unissex','SHEIN','Masculino','Moletons','imagens/p25.jpg',89.90,149.90,'3mil+ vendidos','https://onelink.shein.com/47/5yliyryvgwmh',false,14),
  ('p26','Kit Camiseta + Short Streetwear Paris Style Premium','SHEIN','Masculino','Camisetas','imagens/p26.jpg',79.90,119.90,'2mil+ vendidos','https://onelink.shein.com/47/5ylizvfhq03w',false,15),
  ('p27','Kit Moletom Canguru + Calça de Moletom Inverno Premium','SHEIN','Masculino','Moletons','imagens/p27.jpg',129.90,199.90,'1mil+ vendidos','https://onelink.shein.com/47/5ylj0p0yetrc',false,16),
  ('p28','Kit 3 Camisetas Masculinas Estampa Países California Paris Milan','SHEIN','Masculino','Camisetas','imagens/p28.jpg',69.90,99.90,'5mil+ vendidos','https://onelink.shein.com/47/5ylj1ojif41q',false,17),
  ('p29','Kit 2 Peças Panther Camiseta + Short Streetwear Masculino','SHEIN','Masculino','Camisetas','imagens/p29.jpg',74.90,109.90,'2mil+ vendidos','https://onelink.shein.com/47/5ylj2g5xzvo0',true,18),
  ('p30','Kit Inverno Moletom com Capuz + Calça Moletom Casual','SHEIN','Masculino','Moletons','imagens/p30.jpg',119.90,179.90,'1mil+ vendidos','https://onelink.shein.com/47/5ylj39reo026',false,19),
  ('p31','Moletom Colorblock Casual Pullover Manfinity Homme','SHEIN','Masculino','Moletons','imagens/p31.jpg',59.90,89.90,'4mil+ vendidos','https://onelink.shein.com/47/5ylj3xfs0nr2',false,20),
  ('p32','Bermuda Jeans Masculina Destroyed Clássica','SHEIN','Masculino','Calças e bermudas','imagens/p32.jpg',59.90,89.90,'8mil+ vendidos','https://onelink.shein.com/47/5ylnivdens53',false,21),
  ('p33','Conjunto Feminino Cereja Top + Saia Lápis Fenda','SHEIN','Feminino','Kits e conjuntos','imagens/p33.jpg',79.90,119.90,'2mil+ vendidos','https://onelink.shein.com/47/5ylnjuvyqvpp',false,22),
  ('p34','Conjunto Esportivo Moletom + Calça Jogger Inverno','SHEIN','Masculino','Moletons','imagens/p34.jpg',99.90,149.90,'3mil+ vendidos','https://onelink.shein.com/47/5ylnksfhnt5i',false,23),
  ('p35','Calça Jeans Destroyed com Respingos de Tinta Masculina','SHEIN','Masculino','Calças e bermudas','imagens/p35.jpg',69.90,99.90,'5mil+ vendidos','https://onelink.shein.com/47/5ylnm3s8d4ip',true,24),
  ('p36','Bermuda Jeans Curta com Cordão Estilo Player','SHEIN','Masculino','Calças e bermudas','imagens/p36.jpg',49.90,79.90,'4mil+ vendidos','https://onelink.shein.com/47/5ylnmxdp1y58',false,25),
  ('p37','Calça Jeans Preta Skinny Destroyed Masculina','SHEIN','Masculino','Calças e bermudas','imagens/p37.jpg',64.90,94.90,'6mil+ vendidos','https://onelink.shein.com/47/5ylnnn13inud',false,26),
  ('p38','Camiseta Feminina Estampa Retrô Manga Curta Casual','SHEIN','Feminino','Camisetas','imagens/p38.jpg',39.90,59.90,'3mil+ vendidos','https://onelink.shein.com/47/5ylnoapgvbjc',false,27),
  ('p39','Polo Masculina Patchwork Estampada Manga Curta Verão','SHEIN','Masculino','Camisetas','imagens/p39.jpg',54.90,84.90,'2mil+ vendidos','https://onelink.shein.com/47/5ylnp2bwg36z',false,28),
  ('p40','Boné Esportivo Gabardine Algodão Orgânico','SHEIN','Masculino','Acessórios','imagens/p40.jpg',34.90,54.90,'7mil+ vendidos','https://onelink.shein.com/47/5ylnpq09sqxw',false,29),
  ('p41','Meias de Futebol Masculinas Kit Esportivo','SHEIN','Masculino','Kits e conjuntos','imagens/p41.jpg',19.90,29.90,'10mil+ vendidos','https://onelink.shein.com/47/5ylnqtgw1ued',true,30),
  ('p42','Macaquinho Feminino Halter Laço Texturizado Praia','SHEIN','Feminino','Vestidos','imagens/p42.jpg',69.90,109.90,'2mil+ vendidos','https://onelink.shein.com/47/5ylns0vkhn9i',false,31),
  ('p43','Calça Jeans Preta Skinny com Lycra Masculina','SHEIN','Masculino','Calças e bermudas','imagens/p43.jpg',59.90,89.90,'9mil+ vendidos','https://onelink.shein.com/47/5ylnt2d5lzig',false,32),
  ('p44','Kit 3 Camisetas Térmicas UV Protection Second Skin','SHEIN','Masculino','Camisetas','imagens/p44.jpg',74.90,119.90,'4mil+ vendidos','https://onelink.shein.com/47/5ylntzwoix4l',false,33),
  ('p45','Kit 2 Moletons Gola Redonda Algodão Unissex','SHEIN','Masculino','Kits e conjuntos','imagens/p45.png',89.90,139.90,'3mil+ vendidos','https://onelink.shein.com/47/5ylnunl1wa4f',false,34),
  ('p46','Vestido Ombro a Ombro Cinza Preto Canelado Fenda','SHEIN','Feminino','Vestidos','imagens/p46.jpg',59.90,94.90,'2mil+ vendidos','https://onelink.shein.com/47/5ylnvb9facg1',false,35),
  ('p47','Conjunto Polo Xadrez + Short Masculino Verão','SHEIN','Masculino','Camisetas','imagens/p47.jpg',79.90,119.90,'2mil+ vendidos','https://onelink.shein.com/47/5ylnw4uvz60b',true,36),
  ('p48','Jaqueta Cropped Pelúcia Capuz Feminina Outono/Inverno','SHEIN','Feminino','Moletons','imagens/p48.jpg',84.90,129.90,'1mil+ vendidos','https://onelink.shein.com/47/5ylnwuiadrtg',false,37),
  ('p49','Moletom Masculino Patchwork Gola Redonda Tricotado','SHEIN','Masculino','Moletons','imagens/p49.jpg',69.90,109.90,'3mil+ vendidos','https://onelink.shein.com/47/5ylnxk5ouhhn',false,38),
  ('p50','Kit 3 Camisetas Masculinas Estampadas 100% Algodão','SHEIN','Masculino','Camisetas','imagens/p50.jpg',64.90,99.90,'5mil+ vendidos','https://onelink.shein.com/47/5ylny7u27uh9',false,39),
  ('p51','Polo Masculina Piqué Manga Curta Clássica','SHEIN','Masculino','Camisetas','imagens/p51.jpg',44.90,69.90,'8mil+ vendidos','https://onelink.shein.com/47/5ylnyxhgnuvs',false,40)
on conflict (id) do nothing;

insert into public.banners (id,titulo,subtitulo,imagem,botao_texto,link,cor_fundo,cor_destaque,cor_texto,ativo,ordem) values
  ('b1','Ofertas da semana','Os maiores descontos da SHEIN, Shopee e TikTok Shop selecionados para você.','imagens/p14.jpg','Ver ofertas','#todos','#0c0c0d','#ff6a1a','#f4f2ef',true,0),
  ('b2','Moda para todo dia','Camisetas, vestidos e moletons com preço de achadinho.','imagens/p23.jpg','Explorar produtos','#todos','#1a1410','#ff8a3d','#f4f2ef',true,1)
on conflict (id) do nothing;
