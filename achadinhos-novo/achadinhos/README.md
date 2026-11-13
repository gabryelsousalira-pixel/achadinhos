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
