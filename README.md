# Achadinhos

Vitrine de ofertas afiliadas (SHEIN, Shopee, TikTok Shop). Site estático, sem dependências.

## Estrutura
- `index.html` — vitrine (busca, filtros, ordenação, favoritos, carrossel)
- `admin.html` — painel para adicionar, editar e remover produtos
- `data/produtos.json` — catálogo publicado (fonte única dos produtos)
- `css/style.css`, `js/` — estilos e scripts
- `imagens/` — fotos dos produtos

## Como atualizar produtos
1. Abra `admin.html`, edite os produtos e clique em **Baixar produtos.json**
2. Substitua `data/produtos.json` no repositório do GitHub
3. Imagens novas vão em `imagens/`; no painel, informe `imagens/nome.jpg`

As edições do painel ficam salvas só no seu navegador até você publicar o JSON.
O painel não tem senha: ele não altera o site público, quem publica é o acesso ao seu GitHub.

## Testar localmente
`python3 -m http.server` e abra http://localhost:8000

## Banners e publicação (compartilhado entre visitantes)
- Banners ficam em `data/banners.json`; imagens enviadas vão para `imagens/banners/`.
- No `admin.html`: abra **Conexão com o GitHub**, informe usuário, repositório, branch e um token
  fine-grained restrito a este repositório com **Contents: Read and write**.
  O token fica só na aba aberta (sessionStorage) e nunca no código.
- Em **GERENCIAR BANNERS**, edite e confira a prévia; **Publicar banners** grava no repositório
  e o GitHub Pages atualiza o site em alguns minutos. **Publicar produtos** faz o mesmo com `data/produtos.json`.
- Sem token, o painel continua funcionando como rascunho local (e o export de produtos segue disponível).
