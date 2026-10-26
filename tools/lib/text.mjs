// Text → SVG outlines.
// GitHub serves README images through a proxy that blocks web fonts, so every
// SVG ships its own glyph outlines. Each glyph is defined once in <defs> and
// reused with <use>, which keeps files small and typography identical on
// every OS and on mobile.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const FONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fonts');

// Each family is a list of subset files tried in order (latin, then latin-ext).
const FAMILIES = {
  display: ['space-grotesk-latin-600-normal', 'space-grotesk-latin-ext-600-normal'],
  displayMedium: ['space-grotesk-latin-500-normal', 'space-grotesk-latin-ext-600-normal'],
  sans: ['inter-latin-400-normal', 'inter-latin-ext-400-normal'],
  sansMedium: ['inter-latin-500-normal', 'inter-latin-ext-500-normal'],
  sansSemibold: ['inter-latin-600-normal', 'inter-latin-ext-500-normal'],
  mono: ['jetbrains-mono-latin-400-normal', 'jetbrains-mono-latin-ext-400-normal'],
  monoMedium: ['jetbrains-mono-latin-500-normal', 'jetbrains-mono-latin-ext-500-normal'],
};

const cache = new Map();
function load(file) {
  if (!cache.has(file)) {
    const buf = fs.readFileSync(path.join(FONT_DIR, `${file}.woff`));
    cache.set(file, opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)));
  }
  return cache.get(file);
}

const r1 = (n) => Math.round(n * 10) / 10;

export class TextKit {
  constructor(prefix = 'g') {
    this.prefix = prefix;
    this.defs = new Map(); // key -> { id, d }
  }

  // Resolve each character to [font, glyph, fileKey].
  #shape(text, family) {
    const files = FAMILIES[family];
    if (!files) throw new Error(`Unknown family ${family}`);
    return [...text].map((ch) => {
      for (const file of files) {
        const font = load(file);
        const glyph = font.charToGlyph(ch);
        if (glyph && glyph.index !== 0) return { ch, font, glyph, file };
      }
      if (ch === ' ') {
        const font = load(files[0]);
        return { ch, font, glyph: font.charToGlyph(' '), file: files[0] };
      }
      throw new Error(`Glyph missing for "${ch}" (U+${ch.codePointAt(0).toString(16)}) in ${family}`);
    });
  }

  // Width in px of `text` at `size`.
  measure(text, { family = 'sans', size = 16, tracking = 0 } = {}) {
    const shaped = this.#shape(text, family);
    let w = 0;
    shaped.forEach((s, i) => {
      w += (s.glyph.advanceWidth / s.font.unitsPerEm) * size + tracking;
      const next = shaped[i + 1];
      if (next && next.font === s.font) w += (s.font.getKerningValue(s.glyph, next.glyph) / s.font.unitsPerEm) * size;
    });
    return w - (shaped.length ? tracking : 0);
  }

  #glyphId(s) {
    const key = `${s.file}:${s.glyph.index}`;
    if (!this.defs.has(key)) {
      const upm = s.font.unitsPerEm;
      const d = s.glyph.getPath(0, 0, upm).toPathData(0);
      this.defs.set(key, { id: `${this.prefix}${this.defs.size.toString(36)}`, d, upm });
    }
    return this.defs.get(key).id;
  }

  // Returns an SVG <g> drawing `text`. (x, y) is the baseline start
  // (or the end/middle with anchor). Positions are in font units inside a
  // scaled group, so every glyph keeps its exact advance and kerning.
  // `perGlyph(i)` may return extra attributes for each glyph (used by the
  // typing animation).
  text(text, { x = 0, y = 0, family = 'sans', size = 16, tracking = 0, anchor = 'start', cls = '', fill, perGlyph, attrs = '' } = {}) {
    const shaped = this.#shape(text, family);
    const width = this.measure(text, { family, size, tracking });
    let startX = x;
    if (anchor === 'middle') startX = x - width / 2;
    if (anchor === 'end') startX = x - width;

    const upm = shaped[0]?.font.unitsPerEm ?? 1000;
    const scale = size / upm;
    let cursor = 0; // in font units
    const uses = [];
    shaped.forEach((s, i) => {
      if (s.ch !== ' ') {
        const extra = perGlyph ? perGlyph(i) : '';
        uses.push(`<use href="#${this.#glyphId(s)}" x="${Math.round(cursor)}"${extra ? ' ' + extra : ''}/>`);
      }
      const ratio = upm / s.font.unitsPerEm;
      cursor += s.glyph.advanceWidth * ratio + tracking / scale;
      const next = shaped[i + 1];
      if (next && next.font === s.font) cursor += s.font.getKerningValue(s.glyph, next.glyph) * ratio;
    });
    const cl = cls ? ` class="${cls}"` : '';
    const fl = fill ? ` fill="${fill}"` : '';
    return `<g${cl}${fl}${attrs ? ' ' + attrs : ''} transform="translate(${r1(startX)} ${r1(y)}) scale(${+scale.toFixed(5)})">${uses.join('')}</g>`;
  }

  // Greedy word wrap. Returns lines that fit in maxWidth.
  wrap(text, maxWidth, opts) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (this.measure(candidate, opts) <= maxWidth || !line) line = candidate;
      else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  defsMarkup() {
    return [...this.defs.values()].map((g) => `<path id="${g.id}" d="${g.d}"/>`).join('');
  }
}
