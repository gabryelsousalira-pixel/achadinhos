# Achadinhos

Vitrine de ofertas afiliadas (SHEIN, Shopee, TikTok Shop). Site estático (GitHub Pages), sem dependências.

## Estrutura
- `index.html` — vitrine; `login.html` — entrada do admin; `admin.html` (e `/admin/`) — painel protegido
- `js/supabase.js` — Auth/REST/Storage via fetch; `js/auth-guard.js` — bloqueio do painel; `js/data.js` — acesso aos dados
- `js/config.js` — URL e chave PÚBLICA do Supabase (nunca a secret/service_role)
- `supabase/setup.sql` e `supabase/02-tornar-admin.sql` — banco, RLS, storage e dados iniciais
- `data/*.json` — cópia estática usada como reserva se o banco estiver vazio ou indisponível

## Configuração
Siga **CONFIGURAR-SUPABASE.md**. Teste local: `python3 -m http.server`.
