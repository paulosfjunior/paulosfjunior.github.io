# paulosfjunior.github.io

Página pessoal de Paulo Freitas — [paulofreitas.tooark.com](https://paulofreitas.tooark.com/).
Site estático (HTML/CSS/JS puro) hospedado no **GitHub Pages**, com DNS e borda
pela **Cloudflare** (zona `tooark.com`).

## Estrutura

```text
├── .github/workflows/ci.yml    # CI: Prettier, html-validate e sintaxe JS
├── docs/
│   └── cloudflare-security-headers.md  # Runbook de security headers (Cloudflare)
├── css/style.css
├── js/
│   ├── bg-animation.js         # Animação de fundo em canvas
│   ├── i18n.js                 # Traduções (pt/en)
│   └── main.js                 # Lógica da página e consumo de APIs
├── media/                      # Imagens e ícones SVG
├── index.html
├── 404.html                    # Redireciona rotas inexistentes para /
├── robots.txt
└── sitemap.xml
```

## Desenvolvimento

Sem build — basta servir a raiz do projeto:

```bash
npx serve .
```

Antes de commitar, rode as mesmas checagens do CI:

```bash
npx prettier --check .
npx html-validate index.html 404.html
for f in js/*.js; do node --check "$f"; done
```

## Segurança

Os security headers (HSTS, CSP, X-Frame-Options, Permissions-Policy etc.) são
aplicados na borda da Cloudflare — veja
[docs/cloudflare-security-headers.md](docs/cloudflare-security-headers.md).
O `index.html` mantém um CSP via `<meta>` como defesa em profundidade; os dois
valores devem ser mantidos em sincronia.
