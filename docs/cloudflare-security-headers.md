# Security headers via Cloudflare

O GitHub Pages não permite configurar headers de resposta customizados. Como o
domínio `paulofreitas.tooark.com` é um subdomínio da zona **tooark.com**,
proxiada pela Cloudflare, os security headers devem ser aplicados na borda, com
**Response Header Transform Rules** — mesma abordagem já usada no site
`tooark.com` (ver `tooark.github.io/docs/cloudflare-security-headers.md`).

> **Importante**: a zona `tooark.com` já possui a Transform Rule
> `security-headers` com a expressão `(http.host eq "tooark.com")`, que **não**
> cobre este subdomínio. É preciso criar uma **segunda regra** para
> `paulofreitas.tooark.com` (ou ajustar a expressão da existente) — sem
> sobrescrever a regra do site principal.

## Como aplicar (dashboard)

1. Acesse o dashboard da Cloudflare → zona **tooark.com**.
2. Vá em **Rules → Overview → Create rule → Response Header Transform Rule**
   (em planos/UIs antigas: **Rules → Transform Rules → Modify Response Header**).
3. Nome sugerido: `security-headers-paulofreitas`.
4. Expressão de filtro (aplica apenas neste site):

   ```txt
   (http.host eq "paulofreitas.tooark.com")
   ```

5. Adicione as operações **Set static** abaixo e faça o deploy da regra.

## Headers

| Header                      | Valor                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`                                                                           |
| `X-Content-Type-Options`    | `nosniff`                                                                                                       |
| `X-Frame-Options`           | `DENY`                                                                                                          |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                               |
| `Permissions-Policy`        | `accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()` |
| `Content-Security-Policy`   | ver seção abaixo                                                                                                |

## Content-Security-Policy

Valor completo (uma linha):

```txt
default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://github.com https://avatars.githubusercontent.com; connect-src 'self' https://api.github.com https://azuresearch-usnc.nuget.org https://marketplace.visualstudio.com; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
```

Racional das origens permitidas (manter em sincronia com `js/main.js` e o
`<head>` de `index.html`):

- **script-src**: além dos scripts próprios (`'self'`), o beacon do
  Cloudflare Web Analytics (`static.cloudflareinsights.com`), injetado
  automaticamente pela Cloudflare na borda quando o Web Analytics está ativo
  na zona.
- **style-src / font-src**: Google Fonts (`fonts.googleapis.com` /
  `fonts.gstatic.com`). `'unsafe-inline'` é necessário para estilos aplicados
  dinamicamente pelo JS da página.
- **img-src**: avatar do GitHub (`github.com/paulosfjunior.png` redireciona
  para `avatars.githubusercontent.com`) e imagens `data:`.
- **connect-src**: APIs consumidas pelo site — GitHub (`api.github.com`, stats
  de repositórios), NuGet (`azuresearch-usnc.nuget.org`, downloads dos
  pacotes) e VS Code Marketplace (`marketplace.visualstudio.com`, contagem de
  extensões). **Ao adicionar uma nova API no JS, inclua a origem aqui e no CSP
  do `index.html`.**
- **form-action 'none'**: o site não possui formulários.

### CSP no `<meta>` do index.html (defesa em profundidade)

O `index.html` mantém uma `<meta http-equiv="Content-Security-Policy">` com o
mesmo valor, que protege mesmo sem a regra na Cloudflare (ex.: acesso direto a
`paulosfjunior.github.io`). Limitações conhecidas do CSP via meta — por isso o
header na borda é o mecanismo autoritativo:

- `frame-ancestors` é **ignorado** quando entregue via meta (por isso a meta
  do `index.html` omite essa diretiva — na borda ela é obrigatória);
- report-only não funciona via meta;
- `X-Content-Type-Options` via meta não tem efeito (só como header real).

Fora isso, manter os dois **sempre com o mesmo valor de CSP**.

### Rollout seguro

Publique primeiro como **`Content-Security-Policy-Report-Only`** com o mesmo
valor, navegue pelo site com o console aberto (F12) verificando violações e,
só então, troque para `Content-Security-Policy`.

Achados já conhecidos do rollout no `tooark.com` (mesma zona, valem aqui):

1. **Bot Fight Mode** injeta script inline com conteúdo variável (ray ID +
   timestamp) — allowlist por hash não funciona. Na zona `tooark.com` ele foi
   **desativado** (Security → Bots) para manter `script-src` sem inline.
2. **Web Analytics** injeta `https://static.cloudflareinsights.com/beacon.min.js`
   — origem já incluída no `script-src` acima.
3. `The Content Security Policy directive 'upgrade-insecure-requests' is
ignored when delivered in a report-only policy.` — aviso esperado no modo
   Report-Only, sem ação.

> **Nota sobre o 404.html**: ele possui um pequeno script inline de
> redirecionamento que será bloqueado pelo CSP estrito. Sem problema — o
> `<meta http-equiv="refresh">` da mesma página faz o redirecionamento.

## Como aplicar (API)

Para automatizar (requer `CF_API_TOKEN` com permissão `Zone.Transform Rules:Edit`
e o `CF_ZONE_ID` da zona `tooark.com`):

> **Cuidado**: o `PUT` no entrypoint **substitui todas as regras existentes**
> da fase `http_response_headers_transform` — e a zona já tem a regra
> `security-headers` do `tooark.com`. Antes do `PUT`, faça um `GET` no mesmo
> endpoint, copie as regras existentes e inclua-as no payload junto com a nova.

```bash
# 1. Listar as regras atuais da fase (inclua-as no PUT abaixo)
curl -s \
  "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/rulesets/phases/http_response_headers_transform/entrypoint" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" | jq '.result.rules'

# 2. PUT com TODAS as regras (existentes + a nova deste site)
curl -X PUT \
  "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/rulesets/phases/http_response_headers_transform/entrypoint" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "rules": [
      { "...": "regras existentes da zona copiadas do GET acima" },
      {
        "description": "security-headers-paulofreitas",
        "expression": "(http.host eq \"paulofreitas.tooark.com\")",
        "action": "rewrite",
        "action_parameters": {
          "headers": {
            "Strict-Transport-Security": { "operation": "set", "value": "max-age=31536000; includeSubDomains" },
            "X-Content-Type-Options": { "operation": "set", "value": "nosniff" },
            "X-Frame-Options": { "operation": "set", "value": "DENY" },
            "Referrer-Policy": { "operation": "set", "value": "strict-origin-when-cross-origin" },
            "Permissions-Policy": { "operation": "set", "value": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" },
            "Content-Security-Policy-Report-Only": { "operation": "set", "value": "default-src '\''self'\''; script-src '\''self'\'' https://static.cloudflareinsights.com; style-src '\''self'\'' '\''unsafe-inline'\'' https://fonts.googleapis.com; font-src '\''self'\'' https://fonts.gstatic.com; img-src '\''self'\'' data: https://github.com https://avatars.githubusercontent.com; connect-src '\''self'\'' https://api.github.com https://azuresearch-usnc.nuget.org https://marketplace.visualstudio.com; object-src '\''none'\''; base-uri '\''self'\''; form-action '\''none'\''; frame-ancestors '\''none'\''; upgrade-insecure-requests" }
          }
        }
      }
    ]
  }'
```

> O exemplo acima usa `Content-Security-Policy-Report-Only`; após validar,
> renomeie a chave para `Content-Security-Policy`.

## Verificação

```bash
curl -sI https://paulofreitas.tooark.com | grep -iE "strict-transport|content-type-options|frame-options|referrer|permissions|content-security"
```

E teste o site inteiro (troca de idioma PT/EN, carregamento das estatísticas
de repositórios e downloads) com o console do navegador aberto — violações de
CSP aparecem como erros `Refused to ...`.
