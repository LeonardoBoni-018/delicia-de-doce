# Delícia de Doce — loja de encomendas

Prévia de uma lojinha online para a confeitaria **Delícia de Doce** (São Leopoldo / Novo Hamburgo – RS).
O cliente monta o pedido no site e envia tudo pronto pelo WhatsApp. Não tem backend nem banco de dados.

**Online:** https://delicia-de-doce.pages.dev

## Arquivos

| Arquivo | O que tem |
|---|---|
| `products.js` | **Tudo que se edita:** `CONFIG` (nome, WhatsApp, Instagram, antecedência, cidades), `CATEGORIAS`, `PRODUCTS` e `CREDITOS_FOTOS` |
| `index.html` | Estrutura da página |
| `styles.css` | Visual e animações |
| `app.js` | Vitrine, carrinho (salvo no `localStorage`), formulário e mensagem do WhatsApp |
| `img/` | Fotos dos produtos |

## Trocar produtos, fotos e preços

Tudo fica em `products.js`:

- **Preço:** campo `preco` (número, ex.: `42.0`).
- **Foto:** coloque o arquivo em `img/` e aponte `foto: "img/arquivo.jpg"`.
- **Sabores e tamanhos:** campo `opcoes`. O `acrescimo` de cada escolha é somado ao preço.
- Depois de trocar pelos dados reais, apague `exemplo: true` e a lista `CREDITOS_FOTOS`.
- Para tirar a faixa de prévia, mude `modoPrevia` para `false`.

## Rodar localmente

Abra o `index.html` no navegador ou sirva a pasta com qualquer servidor estático.

## Publicar (Cloudflare Pages)

O nome da pasta local tem acento, e isso confunde o wrangler. Por isso, publique a partir de uma cópia numa pasta sem acento:

```bash
mkdir -p ~/delicia-deploy && cp -r index.html styles.css app.js products.js img ~/delicia-deploy/
cd ~/delicia-deploy && npx wrangler pages deploy . --project-name delicia-de-doce --branch main
```

## Créditos

As fotos atuais são **ilustrativas**, tiradas do Wikimedia Commons (licenças CC0, CC BY e CC BY-SA).
Os autores estão listados em `CREDITOS_FOTOS`, no `products.js`, e aparecem no rodapé do site.

Site por Leonardo Boni.
