# Z-ice Gelo — Site e Sistema Completo

Site institucional + loja online + programa de fidelidade + painel administrativo para a **Z-ice Gelo** — fábrica em Guaramirim, Santa Catarina.

## Funcionalidades

- **Site público** com cores da marca, logo, informações da fábrica
- **Loja** com produtos Varejo e Atacado
- **Checkout PIX** com upload de comprovante (confirmação manual pelo admin)
- **WhatsApp flutuante** — (47) 99647-1803
- **Programa Fidelidade** — pontos para clientes varejo
- **Lojistas (atacado)** — sacos grátis ao atingir meta de compras
- **Painel Admin** — pedidos, lojistas, freezers, compras semanais, configurações PIX

## Como rodar

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

### Acessar no PC (Windows)

1. **Duplo clique** em `ABRIR-SITE.bat` — abre o site no navegador automaticamente.
2. Ou execute `INICIAR-SERVIDOR.bat` e abra no navegador: **http://localhost:3000**

Na mesma rede Wi-Fi (celular/outro PC): use o endereço **Network** que aparece no terminal (ex.: `http://192.168.x.x:3000`).

Acesse: **http://localhost:3000**

### Login Admin (padrão após seed)

- **E-mail:** admin@zicegelo.com.br
- **Senha:** admin123

> Altere a senha em produção editando o `.env` antes do seed.

## Estrutura

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/loja` | Catálogo de produtos |
| `/carrinho` | Carrinho de compras |
| `/checkout` | Pagamento PIX |
| `/fidelidade` | Programa de pontos |
| `/contato` | Contato e WhatsApp |
| `/login` | Login clientes/lojistas/admin |
| `/minha-conta` | Área do cliente (pontos) |
| `/lojista` | Área do lojista (sacos grátis) |
| `/admin` | Painel administrativo |

## Configurações

No painel **Admin → Configurações** você pode alterar:

- Chave PIX e titular
- WhatsApp
- Pontos por real gasto
- Meta de sacos e recompensa para lojistas

## Deploy

Recomendado: [Vercel](https://vercel.com) + banco PostgreSQL (altere `provider` no `schema.prisma` para `postgresql`).

Para SQLite local, os dados ficam em `prisma/dev.db`.

---

**Z-ice Gelo** — Faltou gelo? Fique Zem. 🧊
