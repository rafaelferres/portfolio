# Blog — como escrever e publicar um post

Este arquivo é o guia para quem (pessoa ou agente de IA) publica no blog de Rafael Ferrés.
O site é um portfólio para recrutadores: cada post precisa ser correto, útil e com fontes.

## Onde fica

```
content/blog/<slug>/pt.mdx   ← português (obrigatório)
content/blog/<slug>/en.mdx   ← inglês (obrigatório)
content/blog/<slug>/es.mdx   ← espanhol (obrigatório)
```

- `<slug>`: minúsculas, palavras separadas por hífen, sem acentos, até 60 caracteres, único
  (ex.: `custo-por-tarefa-gpt-6-2-gemini-4-neon`). O mesmo slug nos três idiomas.
- O conteúdo é Markdown com GitHub Flavored Markdown (títulos `##`, listas, tabelas, citações `>`, `código`).
  Não use JSX/componentes nem HTML cru. Não use `#` (H1): o título vem do frontmatter.

## Frontmatter (igual nos três arquivos, traduzido)

```yaml
---
title: "Título claro e específico (até ~90 caracteres)"
description: "Resumo de 1–2 frases (até ~200 caracteres), usado no Google e nas redes."
date: "2026-11-23T17:30:00-03:00"   # ISO 8601, horário de São Paulo, o mesmo nos três idiomas
tags: ["LLMs", "Agentes", "..."]     # 3 a 5 tags, traduzidas quando fizer sentido
sources:
  - title: "Nome do veículo — título da página"
    url: "https://..."               # fontes primárias primeiro (anúncio oficial, paper, docs)
---
```

## Regras de conteúdo

1. **Tema**: notícias e tendências reais de IA das últimas ~48 horas (modelos, agentes, ferramentas,
   pesquisa, regulação, adoção em empresas), sempre com o ângulo "o que muda para quem lidera IA em produção".
2. **Não repetir**: antes de escrever, leia os títulos/descrições dos posts existentes em `content/blog/*/pt.mdx`
   e escolha um assunto ou ângulo diferente.
3. **Fatos verificados**: todo número, data, preço, nome de modelo ou afirmação vem de uma fonte listada em
   `sources` (mínimo 2 fontes, ao menos 1 primária). Se não conseguiu confirmar, não escreva. Diga quando um
   número é do próprio fabricante e ainda não tem verificação independente.
4. **Direitos autorais**: escreva com palavras próprias. Nada de copiar parágrafos; citações literais só se
   indispensáveis, com menos de 15 palavras e no máximo uma por fonte.
5. **Voz**: português claro e direto, frases curtas, sem jargão vazio nem exagero ("revolucionário", "game changer").
   Pode ter opinião analítica ("o que eu faria"), mas **nunca invente experiências, projetos, clientes, números ou
   resultados do Rafael**. Não cite empresas onde ele trabalha como se tivessem feito algo.
6. **Estrutura sugerida** (600–1.000 palavras): abertura com o fato; `## O que aconteceu`; `## Por que importa`;
   `## O que fazer na prática` (lista acionável); `## Em resumo`.
7. **Traduções**: en e es são traduções fiéis do pt, naturais (não literais), com o mesmo frontmatter traduzido.
8. **Segurança**: nada de conteúdo político partidário, ataques a pessoas, dados pessoais, temas médicos/financeiros
   como recomendação, nem instruções perigosas.

## Checklist antes de publicar

- [ ] 3 arquivos criados com o mesmo slug e a mesma data
- [ ] `npm run check:posts` sem erros
- [ ] `npm run build` sem erros
- [ ] Commit com mensagem `blog: <título curto>` direto na `main` (a Vercel publica sozinha)
