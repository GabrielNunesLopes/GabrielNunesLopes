// Builds assets/activity-{dark,light}.svg from the real GitHub contribution
// calendar. Runs daily in .github/workflows/profile-assets.yml.
//
//   GH_TOKEN=... node activity.mjs                 # live data
//   node activity.mjs --fixture data.json --out dir # local preview
//
// Without a token (or if the API fails) it renders an honest "waiting for the
// first sync" state instead of inventing numbers.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TextKit } from './lib/text.mjs';
import { THEMES, svgDoc } from './lib/theme.mjs';

const LOGIN = process.env.PROFILE_LOGIN || 'GabrielNunesLopes';
const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const OUT = arg('--out') || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

async function fetchCalendar() {
  const fixture = arg('--fixture');
  if (fixture) return JSON.parse(fs.readFileSync(fixture, 'utf8'));
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) return null;
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{
    totalContributions weeks{contributionDays{date contributionCount contributionLevel}}}}}}`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-activity' },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    console.error('GitHub API error:', res.status, JSON.stringify(json.errors ?? json).slice(0, 300));
    return null;
  }
  return json.data.user.contributionsCollection.contributionCalendar;
}

function summarize(cal) {
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Current streak: today may still be empty, so start from yesterday in that case.
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].contributionCount === 0) i -= 1;
  for (; i >= 0 && days[i].contributionCount > 0; i -= 1) current += 1;
  const activeDays = days.filter((d) => d.contributionCount > 0).length;
  return { total: cal.totalContributions, longest, current, activeDays };
}

const fmt = (n) => n.toLocaleString('pt-BR');

function render(t, cal, updatedAt) {
  const W = 800;
  const CELL = 11;
  const GAP = 3;
  const tk = new TextKit('a');
  const weeks = cal ? cal.weeks : Array.from({ length: 53 }, () => ({ contributionDays: Array.from({ length: 7 }, () => null) }));
  const gridW = weeks.length * (CELL + GAP) - GAP;
  const gx = Math.round((W - gridW) / 2);
  const gy = 150;
  const H = gy + 7 * (CELL + GAP) - GAP + 34;

  const parts = [];
  parts.push(tk.text('ATIVIDADE NO GITHUB  ·  ÚLTIMOS 12 MESES', { x: gx, y: 44, family: 'mono', size: 11.5, tracking: 0.6, cls: 'subtle' }));
  parts.push(
    tk.text(updatedAt ? `atualizado em ${updatedAt}` : 'aguardando a primeira sincronização', {
      x: gx + gridW, y: 44, family: 'mono', size: 11.5, anchor: 'end', cls: 'subtle',
    }),
  );

  if (cal) {
    const s = summarize(cal);
    const stats = [
      [fmt(s.total), 'contribuições'],
      [fmt(s.activeDays), 'dias ativos'],
      [fmt(s.longest), 'maior sequência'],
      [fmt(s.current), 'sequência atual'],
    ];
    const colW = gridW / stats.length;
    stats.forEach(([value, label], i) => {
      const x = gx + i * colW;
      parts.push(`<g class="rise" style="animation-delay:${(0.1 + i * 0.1).toFixed(1)}s">${tk.text(value, { x, y: 92, family: 'display', size: 30, cls: 'ink' })}${tk.text(label, { x, y: 114, family: 'sans', size: 13, cls: 'muted' })}</g>`);
      if (i > 0) parts.push(`<rect x="${(x - 16).toFixed(1)}" y="68" width="1" height="50" fill="${t.border}"/>`);
    });
  } else {
    parts.push(tk.text('Os números aparecem aqui depois da primeira execução do workflow.', { x: gx, y: 100, family: 'sans', size: 14, cls: 'muted' }));
  }

  // Month labels where a new month starts (kept at least 3 columns apart).
  let lastMonth = -1;
  let lastLabelCol = -9;
  weeks.forEach((w, col) => {
    const first = w.contributionDays.find(Boolean);
    if (!first) return;
    const m = Number(first.date.slice(5, 7)) - 1;
    if (m !== lastMonth && col - lastLabelCol >= 3 && col < weeks.length - 1) {
      parts.push(tk.text(MONTHS[m], { x: gx + col * (CELL + GAP), y: gy - 10, family: 'mono', size: 10.5, cls: 'subtle' }));
      lastLabelCol = col;
    }
    lastMonth = m;
  });

  // Cells. The first calendar week can be partial, so align by weekday.
  const cells = [];
  weeks.forEach((w, col) => {
    const daysInWeek = w.contributionDays;
    const offset = cal && col === 0 ? 7 - daysInWeek.length : 0;
    daysInWeek.forEach((d, row) => {
      const lvl = d ? LEVEL[d.contributionLevel] ?? 0 : 0;
      const x = gx + col * (CELL + GAP);
      const y = gy + (row + offset) * (CELL + GAP);
      const delay = (col * 0.018).toFixed(3);
      cells.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" class="l${lvl}" style="animation-delay:${delay}s"/>`);
    });
  });
  parts.push(`<g class="cells">${cells.join('')}</g>`);

  const s = cal ? summarize(cal) : null;
  return svgDoc({
    width: W,
    height: H,
    title: 'Atividade no GitHub nos últimos 12 meses',
    desc: s
      ? `${s.total} contribuições, ${s.activeDays} dias ativos, maior sequência de ${s.longest} dias, sequência atual de ${s.current} dias. Atualizado em ${updatedAt}.`
      : 'Aguardando a primeira sincronização do workflow.',
    style: `
.ink{fill:${t.text}}.muted{fill:${t.muted}}.subtle{fill:${t.subtle}}
${t.heat.map((c, i) => `.l${i}{fill:${c}}`).join('')}
.cells rect{animation:pop .5s ease-out both}
.rise{animation:rise .8s ease-out both}
@keyframes pop{from{opacity:0}to{opacity:1}}
@keyframes rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`,
    defs: `<clipPath id="c"><rect width="${W}" height="${H}" rx="18"/></clipPath>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.surface}"/><stop offset="1" stop-color="${t.bgAlt}"/></linearGradient>
${tk.defsMarkup()}`,
    body: `<g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="url(#bg)"/></g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="${t.border}"/>
${parts.join('\n')}`,
  });
}

const cal = await fetchCalendar();
const now = new Date();
const updatedAt = cal ? now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : null;
fs.mkdirSync(OUT, { recursive: true });
for (const t of Object.values(THEMES)) {
  const file = path.join(OUT, `activity-${t.name}.svg`);
  if (!cal && fs.existsSync(file) && !fs.readFileSync(file, 'utf8').includes('aguardando')) {
    // Keep the last good card instead of replacing it with the empty state.
    console.log(`kept ${file} (API unavailable)`);
    continue;
  }
  fs.writeFileSync(file, render(t, cal, updatedAt));
  console.log(`wrote ${file}${cal ? '' : ' (empty state)'}`);
}
