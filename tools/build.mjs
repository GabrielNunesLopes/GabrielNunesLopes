// Generates every static SVG used by the profile README.
//   cd tools && npm ci && npm run build
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as si from 'simple-icons';
import { TextKit } from './lib/text.mjs';
import { THEMES, svgDoc } from './lib/theme.mjs';
import { person, headerNodes, links, projects, stack } from './profile.data.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets');

function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return rel;
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */
function header(t) {
  const W = 900;
  const H = 340;
  const tk = new TextKit('h');

  // "$ whoami" typed one glyph at a time, then a blinking caret.
  const cmd = '$ whoami';
  const cmdSize = 15;
  const cmdX = 56;
  const cmdY = 84;
  const typed = tk.text(cmd, {
    x: cmdX, y: cmdY, family: 'mono', size: cmdSize, cls: 'cmd',
    perGlyph: (i) => `class="ty" style="animation-delay:${(0.25 + i * 0.07).toFixed(2)}s"`,
  });
  const caretX = cmdX + tk.measure(cmd, { family: 'mono', size: cmdSize }) + 6;

  const name = tk.text(person.name, { x: 54, y: 146, family: 'display', size: 50, tracking: -0.6, cls: 'ink' });
  const role = tk.text(person.role, { x: 56, y: 186, family: 'sansMedium', size: 19, cls: 'accent' });
  const pitchLines = tk.wrap(person.pitch, 440, { family: 'sans', size: 16 });
  const pitch = pitchLines
    .map((line, i) => tk.text(line, { x: 56, y: 226 + i * 25, family: 'sans', size: 16, cls: 'muted' }))
    .join('');
  const edu = tk.text('SENAI · Técnico em Desenvolvimento de Sistemas', { x: 72, y: 294, family: 'mono', size: 12, cls: 'subtle' });

  // Architecture diagram (right side).
  const pos = { web: [590, 92], api: [746, 92], bot: [590, 214], db: [746, 214] };
  const BW = 104;
  const BH = 48;
  const caption = tk.text('// a forma dos sistemas que construo', { x: 590, y: 70, family: 'mono', size: 11, cls: 'subtle' });
  const nodes = headerNodes
    .map((n, i) => {
      const [x, y] = pos[n.id];
      return `<g class="node" style="animation-delay:${(0.9 + i * 0.12).toFixed(2)}s">
<rect x="${x}" y="${y}" width="${BW}" height="${BH}" rx="11" class="box"/>
${tk.text(n.label, { x: x + 14, y: y + 21, family: 'monoMedium', size: 14, cls: 'ink' })}
${tk.text(n.sub, { x: x + 14, y: y + 37, family: 'mono', size: 11, cls: 'muted' })}
<circle cx="${x + BW - 15}" cy="${y + 16}" r="3" class="led" style="animation-delay:${i * 0.6}s"/>
</g>`;
    })
    .join('');
  const wires = [
    { id: 'w1', d: `M${590 + BW} ${92 + 24} H746`, dur: 2.6, begin: 1.4 },
    { id: 'w2', d: `M${590 + BW} ${214 + 18} C720 ${214 + 18} 720 ${92 + 34} 746 ${92 + 34}`, dur: 3.1, begin: 2.0 },
    { id: 'w3', d: `M${746 + BW / 2} ${92 + BH} V214`, dur: 2.2, begin: 1.7 },
  ];
  const wireMarkup = wires.map((w) => `<path id="${w.id}" d="${w.d}" class="wire"/>`).join('');
  const packets = wires
    .map(
      (w) => `<circle r="3.2" class="packet"><animateMotion dur="${w.dur}s" begin="${w.begin}s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#${w.id}"/></animateMotion></circle>`,
    )
    .join('');

  const style = `
.ink{fill:${t.text}}.muted{fill:${t.muted}}.subtle{fill:${t.subtle}}.accent{fill:${t.sky}}.cmd{fill:${t.cyan}}
.box{fill:${t.surface};stroke:${t.borderStrong};stroke-width:1}
.wire{fill:none;stroke:${t.borderStrong};stroke-width:1.5;stroke-dasharray:3 4}
.packet{fill:${t.cyan}}
.led{fill:${t.green};animation:pulse 2.4s ease-in-out infinite}
.ty{animation:type .01s linear both}
.caret{fill:${t.cyan};animation:blink 1.1s steps(1) infinite}
.rise{animation:rise .9s cubic-bezier(.2,.7,.2,1) both}
.node{animation:fade .8s ease-out both}
.drift-a{animation:driftA 14s ease-in-out infinite alternate}
.drift-b{animation:driftB 18s ease-in-out infinite alternate}
@keyframes type{from{opacity:0}to{opacity:1}}
@keyframes blink{0%{opacity:1}50%{opacity:0}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes driftA{from{transform:translate(0,0)}to{transform:translate(60px,20px)}}
@keyframes driftB{from{transform:translate(0,0)}to{transform:translate(-50px,-16px)}}
@media (prefers-reduced-motion: reduce){.packet{display:none}}`;

  const defs = `
<radialGradient id="ga"><stop offset="0" stop-color="${t.glowA}" stop-opacity="${t.name === 'dark' ? 0.42 : 0.35}"/><stop offset="1" stop-color="${t.glowA}" stop-opacity="0"/></radialGradient>
<radialGradient id="gb"><stop offset="0" stop-color="${t.glowB}" stop-opacity="${t.name === 'dark' ? 0.3 : 0.3}"/><stop offset="1" stop-color="${t.glowB}" stop-opacity="0"/></radialGradient>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${t.grid}"/></pattern>
<radialGradient id="fadeMask" cx="0.72" cy="0.5" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="m"><rect width="${W}" height="${H}" fill="url(#fadeMask)"/></mask>
<clipPath id="card"><rect width="${W}" height="${H}" rx="20"/></clipPath>
<linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="${t.blue}" stop-opacity="0"/><stop offset=".35" stop-color="${t.blue}"/><stop offset=".7" stop-color="${t.cyan}"/><stop offset="1" stop-color="${t.cyan}" stop-opacity="0"/></linearGradient>
${tk.defsMarkup()}`;

  const body = `
<g clip-path="url(#card)">
<rect width="${W}" height="${H}" fill="${t.bg}"/>
<g class="drift-a"><circle cx="160" cy="40" r="260" fill="url(#ga)"/></g>
<g class="drift-b"><circle cx="760" cy="300" r="240" fill="url(#gb)"/></g>
<rect width="${W}" height="${H}" fill="url(#dots)" mask="url(#m)"/>
<rect x="0" y="0" width="${W}" height="1.5" fill="url(#edge)"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="none" stroke="${t.border}"/>
${typed}
<rect x="${caretX.toFixed(1)}" y="${cmdY - 12}" width="8" height="15" rx="1" class="caret"/>
<g class="rise" style="animation-delay:.85s">${name}</g>
<g class="rise" style="animation-delay:1.05s">${role}</g>
<g class="rise" style="animation-delay:1.25s">${pitch}</g>
<g class="rise" style="animation-delay:1.45s"><circle cx="61" cy="290" r="3" fill="${t.cyan}"/>${edu}</g>
<g class="node" style="animation-delay:.8s">${caption}</g>
${wireMarkup}
${nodes}
${packets}`;

  return svgDoc({
    width: W,
    height: H,
    title: `${person.name} — ${person.role}`,
    desc: `${person.pitch} Diagrama: web (Next.js) e bot (discord.js) conversando com uma API (Fastify) ligada ao Postgres.`,
    style,
    defs,
    body,
  });
}

/* ------------------------------------------------------------------ */
/* Contact buttons                                                     */
/* ------------------------------------------------------------------ */
const LINK_ICONS = {
  linkedin: (c) => `<rect x="1" y="1" width="18" height="18" rx="4.5" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M6 8.6V14.4M6 5.7v.1M9.4 14.4V8.6M9.4 11.2c0-1.6 1-2.6 2.3-2.6s2.3.9 2.3 2.6v3.2" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`,
  email: (c) => `<rect x="1" y="3.5" width="18" height="13" rx="3" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M2.5 5.5l7.5 5.6 7.5-5.6" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
};

function button(link, t) {
  const tk = new TextKit('b');
  const label = tk.text(link.label, { x: 46, y: 29.5, family: 'sansMedium', size: 15, cls: 'ink' });
  const W = Math.ceil(46 + tk.measure(link.label, { family: 'sansMedium', size: 15 }) + 44);
  const H = 46;
  return svgDoc({
    width: W,
    height: H,
    title: link.label,
    style: `.ink{fill:${t.text}}`,
    defs: tk.defsMarkup(),
    body: `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="${t.surface}" stroke="${t.borderStrong}"/>
<g transform="translate(16 13)">${LINK_ICONS[link.id](t.cyan)}</g>
${label}
<path d="M${W - 26} ${H / 2 + 4}l7-7M${W - 25} ${H / 2 - 3}h6v6" fill="none" stroke="${t.muted}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  });
}

/* ------------------------------------------------------------------ */
/* Project banners                                                     */
/* ------------------------------------------------------------------ */
const PROJECT_ICONS = {
  guild: (a, b) => `<path d="M22.6 10.9A8.2 8.2 0 1 0 24.2 16H17.4" fill="none" stroke="${a}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="22.6" cy="10.9" r="1.7" fill="${a}"/><circle cx="15.6" cy="16" r="2.3" fill="${b}"/>`,
  shield: (a, b) => `<path d="M16 3.5 26 7.2v7.6c0 6.4-4.3 10.7-10 12.7-5.7-2-10-6.3-10-12.7V7.2Z" fill="none" stroke="${a}" stroke-width="2.2" stroke-linejoin="round"/><path d="m11.5 15.8 3.2 3.2 6-6.4" fill="none" stroke="${b}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  rank: (a, b) => `<path d="m7 24 9-7 9 7" fill="none" stroke="${a}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="m7 17 9-7 9 7" fill="none" stroke="${a}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/><circle cx="16" cy="5.5" r="2.2" fill="${b}"/>`,
  portal: (a, b) => `<circle cx="16" cy="16" r="11" fill="none" stroke="${a}" stroke-width="2.2"/><circle cx="16" cy="16" r="5.5" fill="none" stroke="${b}" stroke-width="2.2"/><circle cx="16" cy="16" r="1.6" fill="${b}"/>`,
  book: (a, b) => `<path d="M16 8.5C13 6.3 9.5 6 5.5 7v16.5c4-1 7.5-.7 10.5 1.5 3-2.2 6.5-2.5 10.5-1.5V7c-4-1-7.5-.7-10.5 1.5Z" fill="none" stroke="${a}" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 8.5V25" stroke="${b}" stroke-width="2.2"/>`,
};

function lockIcon(c, open) {
  return open
    ? `<rect x="1.5" y="6" width="10" height="7.5" rx="2" fill="none" stroke="${c}" stroke-width="1.4"/><path d="M4 6V4.2a2.6 2.6 0 0 1 5-.9" fill="none" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/>`
    : `<rect x="1.5" y="6" width="10" height="7.5" rx="2" fill="none" stroke="${c}" stroke-width="1.4"/><path d="M4 6V4.4a2.5 2.5 0 0 1 5 0V6" fill="none" stroke="${c}" stroke-width="1.4"/>`;
}

function banner(p, index, t) {
  const W = 800;
  const tk = new TextKit('p');
  const statusColor = { dev: t.amber, prod: t.green, study: t.sky }[p.status.kind];

  const kicker = tk.text(`${String(index + 1).padStart(2, '0')}  —  ${p.kind.toUpperCase()}`, {
    x: 112, y: 50, family: 'mono', size: 12, tracking: 0.6, cls: 'subtle',
  });
  const name = tk.text(p.name, { x: 111, y: 88, family: 'display', size: 34, tracking: -0.4, cls: 'ink' });
  const tagLines = tk.wrap(p.tagline, 640, { family: 'sans', size: 18 }).slice(0, 2);
  const tagline = tagLines.map((l, i) => tk.text(l, { x: 112, y: 126 + i * 25, family: 'sans', size: 18, cls: 'muted' })).join('');
  const chipsY = 126 + tagLines.length * 25 + 8;

  // Tech chips
  let cx = 112;
  const chips = p.chips
    .map((c) => {
      const w = tk.measure(c, { family: 'mono', size: 12.5 }) + 22;
      const out = `<rect x="${cx}" y="${chipsY}" width="${w.toFixed(1)}" height="26" rx="7" class="chip"/>${tk.text(c, { x: cx + 11, y: chipsY + 17.5, family: 'mono', size: 12.5, cls: 'muted' })}`;
      cx += w + 8;
      return out;
    })
    .join('');
  const H = chipsY + 26 + 34;

  // Pills (right aligned): visibility + status
  const pill = (label, x, color, icon) => {
    const textW = tk.measure(label, { family: 'mono', size: 12 });
    const w = textW + (icon ? 40 : 38);
    const px = x - w;
    const content = icon
      ? `<g transform="translate(${px + 12} ${31})">${icon}</g>${tk.text(label, { x: px + 29, y: 45, family: 'mono', size: 12, cls: 'muted' })}`
      : `<circle cx="${px + 16}" cy="41" r="4" fill="${color}" class="${p.status.kind === 'study' ? '' : 'pulse'}"/>${tk.text(label, { x: px + 27, y: 45, family: 'mono', size: 12, fill: color })}`;
    return { w, markup: `<rect x="${px}" y="28" width="${w.toFixed(1)}" height="26" rx="13" class="pill"/>${content}` };
  };
  const status = pill(p.status.label, W - 32, statusColor);
  const vis = pill(p.visibility, W - 32 - status.w - 8, null, lockIcon(t.muted, p.visibility === 'público'));

  const iconTile = `<rect x="32" y="32" width="56" height="56" rx="15" class="tile"/><g transform="translate(44 44)">${PROJECT_ICONS[p.icon](t.cyan, t.blue)}</g>`;

  return svgDoc({
    width: W,
    height: H,
    title: `${p.name} — ${p.kind}`,
    desc: `${p.tagline} Status: ${p.status.label}. Repositório ${p.visibility}. Tecnologias: ${p.chips.join(', ')}.`,
    style: `
.ink{fill:${t.text}}.muted{fill:${t.muted}}.subtle{fill:${t.subtle}}
.chip{fill:${t.bg};stroke:${t.border}}
.pill{fill:${t.bg};stroke:${t.border}}
.tile{fill:${t.bg};stroke:${t.borderStrong}}
.pulse{animation:pulse 2.4s ease-in-out infinite}
.sheen{animation:sheen 7s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes sheen{0%,100%{opacity:.35}50%{opacity:1}}`,
    defs: `
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.surface}"/><stop offset="1" stop-color="${t.bgAlt}"/></linearGradient>
<linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="${t.blue}"/><stop offset=".5" stop-color="${t.cyan}"/><stop offset="1" stop-color="${t.cyan}" stop-opacity="0"/></linearGradient>
<clipPath id="c"><rect width="${W}" height="${H}" rx="18"/></clipPath>
${tk.defsMarkup()}`,
    body: `
<g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W * 0.6}" height="2" fill="url(#edge)" class="sheen"/></g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="${t.border}"/>
${iconTile}
${kicker}
${name}
${status.markup}
${vis.markup}
${tagline}
${chips}`,
  });
}

/* ------------------------------------------------------------------ */
/* Stack tiles                                                         */
/* ------------------------------------------------------------------ */
// Tiles use one neutral dark style that reads well on both GitHub themes.
const CUSTOM_ICONS = {
  sql: `<ellipse cx="12" cy="5.5" rx="7.5" ry="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
  playwright: `<rect x="2.5" y="4" width="19" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M2.5 8.5h19" stroke="currentColor" stroke-width="1.8"/><path d="m8.5 14.2 2.3 2.3 4.7-4.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
};

function tile(name, iconKey) {
  const S = 44;
  const fg = '#D6E2F3';
  let glyph;
  if (CUSTOM_ICONS[iconKey]) glyph = CUSTOM_ICONS[iconKey];
  else {
    const icon = si[iconKey];
    if (!icon) throw new Error(`Unknown icon ${iconKey}`);
    glyph = `<path d="${icon.path}" fill="currentColor"/>`;
  }
  return svgDoc({
    width: S,
    height: S,
    title: name,
    body: `<rect x=".5" y=".5" width="${S - 1}" height="${S - 1}" rx="11" fill="#111A2E" stroke="#26365A"/>
<g transform="translate(11 11) scale(.9167)" color="${fg}" style="color:${fg}">${glyph}</g>`,
  });
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */
function footer(t) {
  const W = 800;
  const H = 120;
  const tk = new TextKit('f');
  const thanks = tk.text('Obrigado pela visita.', { x: W / 2, y: 70, family: 'displayMedium', size: 20, anchor: 'middle', cls: 'ink' });
  const meta = tk.text('assets gerados por tools/build.mjs  ·  atividade atualizada todo dia', {
    x: W / 2, y: 96, family: 'mono', size: 11.5, anchor: 'middle', cls: 'subtle',
  });
  return svgDoc({
    width: W,
    height: H,
    title: 'Obrigado pela visita.',
    style: `.ink{fill:${t.text}}.subtle{fill:${t.subtle}}
.run{stroke-dasharray:120 680;animation:run 6s linear infinite}
@keyframes run{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}`,
    defs: `<linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="${t.blue}" stop-opacity="0"/><stop offset=".5" stop-color="${t.cyan}"/><stop offset="1" stop-color="${t.blue}" stop-opacity="0"/></linearGradient>${tk.defsMarkup()}`,
    body: `<path d="M0 24H${W}" stroke="${t.border}" stroke-width="1"/>
<path d="M0 24H${W}" stroke="url(#l)" stroke-width="2" class="run" fill="none"/>
<circle cx="${W / 2}" cy="24" r="4" fill="${t.bg}" stroke="${t.cyan}" stroke-width="1.5"/>
${thanks}
${meta}`,
  });
}

/* ------------------------------------------------------------------ */
const written = [];
for (const t of Object.values(THEMES)) {
  written.push(write(`header-${t.name}.svg`, header(t)));
  written.push(write(`footer-${t.name}.svg`, footer(t)));
  for (const l of links) written.push(write(`links/${l.id}-${t.name}.svg`, button(l, t)));
  projects.forEach((p, i) => written.push(write(`projects/${p.slug}-${t.name}.svg`, banner(p, i, t))));
}
for (const g of stack) for (const [name, key] of g.items) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  written.push(write(`stack/${slug}.svg`, tile(name, key)));
}
for (const rel of written) {
  const kb = (fs.statSync(path.join(OUT, rel)).size / 1024).toFixed(1);
  console.log(`${kb.padStart(6)} KB  assets/${rel}`);
}
