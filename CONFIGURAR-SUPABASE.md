# Configurar o login e o banco (Supabase)

Você só precisa fazer isto uma vez. Nada aqui exige servidor próprio: o site continua no GitHub Pages.
Enquanto `js/config.js` estiver vazio, a loja funciona com os arquivos `data/*.json` e o painel fica bloqueado.

## 1. Criar o projeto
1. Acesse https://supabase.com e clique em **Sign in** (ou crie a conta).
2. Clique em **New project**. Nome: `achadinhos`.
3. Em **Database password**, use **Generate a password** e guarde num gerenciador de senhas. Ela NÃO vai no site.
4. Em **Region**, escolha **South America (São Paulo)**. Clique em **Create new project** e aguarde.

## 2. Criar tabelas e regras de segurança
1. Menu da esquerda: **SQL Editor** → **New query**.
2. Abra `supabase/setup.sql`, copie tudo, cole e clique em **Run**. Deve aparecer *Success*.
   Isso cria as tabelas, ativa o RLS, cria o bucket de imagens e carrega seus 41 produtos e 2 banners.

## 3. Travar cadastros públicos
1. Menu: **Authentication** → **Sign In / Providers** → **Email**.
2. Desligue **Allow new users to sign up** e clique em **Save**.
   (Sem isso qualquer pessoa poderia criar conta. Mesmo assim ela não editaria nada, mas desligue.)

## 4. Criar sua conta de administrador
1. **Authentication** → **Users** → **Add user** → **Create new user**.
2. Digite seu e-mail e uma senha forte (a senha só existe no Supabase).
3. Marque **Auto Confirm User** e clique em **Create user**.

## 5. Autorizar essa conta como admin
1. **SQL Editor** → **New query**. Abra `supabase/02-tornar-admin.sql`.
2. Troque `SEU_EMAIL_AQUI` pelo e-mail do passo 4 (mantenha as aspas) e clique em **Run**.
3. O resultado deve listar 1 linha com o seu e-mail. Se vier vazio, o e-mail está diferente do cadastrado.

## 6. Pegar a URL e a chave pública
1. **Project Settings** (ícone de engrenagem) → **API Keys**. O botão **Connect**, no topo do projeto, também mostra a URL.
2. Copie a **Project URL** (`https://xxxx.supabase.co`).
3. Aba **Publishable and secret API keys**: copie a **Publishable key** (`sb_publishable_...`).
   Se aparecer **Create new API keys**, clique nele primeiro. Alternativa: na aba legada, a chave `anon`.
4. NUNCA use a `secret` (`sb_secret_...`) nem a `service_role`. O site recusa essas chaves.

## 7. Conectar ao site
Edite `js/config.js`:
```js
export const SUPABASE_URL = 'https://xxxx.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_...';
```
Envie os arquivos ao GitHub. Abra `seu-site/admin.html`: ele leva ao login. Entre com o e-mail e a senha do passo 4.

## 8. Conferir se o bloqueio funciona (2 minutos)
No terminal (troque URL e chave pública), simulando um visitante tentando inserir um produto:
```bash
curl -i -X POST "https://xxxx.supabase.co/rest/v1/products" \
  -H "apikey: sb_publishable_..." -H "Content-Type: application/json" \
  -d '{"id":"teste","nome":"x","loja":"SHEIN","genero":"Masculino","categoria":"c","imagem":"imagens/a.jpg","preco":1,"link":"https://x.com"}'
```
O esperado é **401 ou 403**. Ler continua liberado: `curl "https://xxxx.supabase.co/rest/v1/products?select=id&limit=1" -H "apikey: sb_publishable_..."` deve devolver 200.

## Observações de segurança
- O painel é só uma porta de entrada; quem protege os dados é o **RLS no banco**. Ele continua valendo mesmo que alguém copie o código do site.
- A sessão fica no navegador (localStorage) e renova sozinha. Use **Sair** em computadores compartilhados.
- Para dar acesso a outra pessoa: crie o usuário (passo 4) e rode o passo 5 com o e-mail dela. Para remover: `delete from public.admins where user_id = '...';`.
- Se a senha vazar: **Authentication → Users →** (menu do usuário) para redefinir ou excluir.
