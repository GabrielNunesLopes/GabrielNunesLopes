// Single source of truth for the generated profile assets.
// Edit here, then run `npm run build` inside tools/.
// Every claim below was checked against the source code of the repositories.

export const person = {
  name: 'Gabriel Nunes Lopes',
  role: 'Desenvolvedor Back-End · TypeScript & Node.js',
  pitch: 'Construo APIs, bots e plataformas web com arquitetura clara, testes e segurança desde a primeira versão.',
};

// Node diagram in the header: the shape of the systems I actually build
// (GuildOS: web → api ← bot, api → postgres).
export const headerNodes = [
  { id: 'web', label: 'web', sub: 'next.js' },
  { id: 'api', label: 'api', sub: 'fastify' },
  { id: 'bot', label: 'bot', sub: 'discord.js' },
  { id: 'db', label: 'db', sub: 'postgres' },
];

export const links = [
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/gabriel-nunes-lopes-40621b3b5/' },
  { id: 'email', label: 'E-mail', href: 'mailto:gabrielnuneslopes2022@gmail.com' },
];

// status: 'dev' | 'prod' | 'study'
export const projects = [
  {
    slug: 'guildos',
    name: 'GuildOS',
    kind: 'SaaS · monorepo full-stack',
    tagline: 'Plataforma para gerenciar, automatizar e medir comunidades Discord a partir de um único painel.',
    status: { kind: 'dev', label: 'em desenvolvimento' },
    visibility: 'privado',
    chips: ['Next.js', 'Fastify', 'Drizzle', 'Postgres', 'Playwright'],
    icon: 'guild',
  },
  {
    slug: 'security-bot',
    name: 'Security Bot',
    kind: 'segurança · multi-tenant',
    tagline: 'Proteção contra raids e nukes no Discord, com contenção local em tempo real e rollback estrutural.',
    status: { kind: 'dev', label: 'v3.3' },
    visibility: 'privado',
    chips: ['TypeScript', 'discord.js', 'SQLite', 'Supabase'],
    icon: 'shield',
  },
  {
    slug: 'keishodan',
    name: 'Keishōdan System',
    kind: '2 bots · 1 codebase',
    tagline: 'Registro, progressão, desafios, tickets e ranked com ELO para uma comunidade de Project Slayers.',
    status: { kind: 'prod', label: 'em produção' },
    visibility: 'privado',
    chips: ['TypeScript', 'Postgres', 'Supabase', 'sharp'],
    icon: 'rank',
  },
  {
    slug: 'summon-a-monster',
    name: 'Summon a Monster!',
    kind: 'Roblox × Discord · integração',
    tagline: 'Bot de comunidade do jogo no Roblox: painéis bilíngues, tickets e ponte de dados do jogo até o Discord.',
    status: { kind: 'prod', label: 'em produção' },
    visibility: 'privado',
    chips: ['TypeScript', 'Luau', 'Edge Functions', 'Components V2'],
    icon: 'portal',
  },
  {
    slug: 'livraria-api',
    name: 'Livraria API',
    kind: 'API REST · projeto em grupo',
    tagline: 'API de gestão de livraria em Express 5 com arquitetura MVC, desenvolvida em equipe no SENAI.',
    status: { kind: 'study', label: 'acadêmico' },
    visibility: 'público',
    chips: ['Node.js', 'Express 5', 'MVC', 'Postman'],
    icon: 'book',
  },
];

// Stack: only technologies found in the repositories' code and manifests.
// icon = simple-icons export name, or a key of CUSTOM_ICONS in build.mjs.
export const stack = [
  {
    group: 'Linguagens',
    items: [
      ['TypeScript', 'siTypescript'],
      ['JavaScript', 'siJavascript'],
      ['SQL', 'sql'],
      ['Luau', 'siLuau'],
      ['C# / .NET', 'siDotnet'],
    ],
  },
  {
    group: 'Back-End',
    items: [
      ['Node.js', 'siNodedotjs'],
      ['Fastify', 'siFastify'],
      ['Express', 'siExpress'],
      ['Zod', 'siZod'],
      ['discord.js', 'siDiscorddotjs'],
    ],
  },
  {
    group: 'Dados',
    items: [
      ['PostgreSQL', 'siPostgresql'],
      ['Supabase', 'siSupabase'],
      ['Drizzle', 'siDrizzle'],
      ['Prisma', 'siPrisma'],
      ['SQLite', 'siSqlite'],
    ],
  },
  {
    group: 'Front-End',
    items: [
      ['Next.js', 'siNextdotjs'],
      ['React', 'siReact'],
      ['Tailwind CSS', 'siTailwindcss'],
    ],
  },
  {
    group: 'Qualidade & Deploy',
    items: [
      ['Vitest', 'siVitest'],
      ['Playwright', 'playwright'],
      ['GitHub Actions', 'siGithubactions'],
      ['Vercel', 'siVercel'],
      ['Render', 'siRender'],
    ],
  },
];
