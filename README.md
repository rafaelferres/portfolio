# Rafael Ferrés — site pessoal

Portfólio em **Next.js 15 (App Router)** com chip 3D (three.js), três idiomas (pt/en/es) e formulário de contato.

## Rodando localmente
```bash
npm install
npm run dev
```

## Deploy na Vercel
```bash
npx vercel --prod
```
ou importe o repositório em vercel.com/new (framework: Next.js, sem configuração extra).

### Formulário de contato (opcional)
Para os e-mails chegarem direto na sua caixa, configure na Vercel:
- `RESEND_API_KEY` – chave do Resend (resend.com)
- `CONTACT_TO` – destino (padrão: rafael@ferres.tech)
- `CONTACT_FROM` – remetente num domínio verificado no Resend, ex.: `Site <site@ferres.tech>`

Sem essas variáveis o formulário abre o app de e-mail do visitante com a mensagem pronta.

## Onde editar
- Textos: `src/i18n/dictionaries/{pt,en,es}.json`
- Links e ferramentas: `src/lib/site.ts`
- Currículos em PDF: `public/cv/`
- Foto: `public/rafael.jpg`
