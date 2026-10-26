# Assets do perfil

Todos os SVGs em `assets/` são gerados por este diretório. Não edite os SVGs à mão.

| Arquivo | O que faz |
| --- | --- |
| `profile.data.mjs` | Conteúdo: nome, frase, projetos, stack e links. **Edite aqui.** |
| `build.mjs` | Gera header, botões, banners dos projetos, ícones da stack e footer (tema escuro e claro). |
| `activity.mjs` | Gera o card de atividade a partir do calendário de contribuições (API GraphQL do GitHub). |
| `showcase.mjs` | Enquadra os screenshots reais do GuildOS em WebP. Rodar só quando os screenshots mudarem. |
| `lib/text.mjs` | Converte texto em contornos: o GitHub não carrega fontes externas em SVG. |
| `lib/theme.mjs` | Cores dos temas escuro e claro. |

```bash
cd tools
npm ci
npm run build                              # assets estáticos
GH_TOKEN=<token> npm run activity          # card de atividade
node showcase.mjs ../../GuildOS/docs/screenshots
```

O workflow `.github/workflows/profile-assets.yml` roda `build` e `activity` todo dia e sempre que algo em `tools/` muda.

Fontes: Space Grotesk, Inter e JetBrains Mono (SIL Open Font License, em `fonts/`). Ícones: [Simple Icons](https://simpleicons.org) (CC0).
