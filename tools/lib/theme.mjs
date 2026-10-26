// Design tokens. Dark is the primary identity; light keeps the same hierarchy
// so the profile reads well on GitHub's light theme too.
export const THEMES = {
  dark: {
    name: 'dark',
    bg: '#0A0F1C',
    bgAlt: '#0E1527',
    surface: '#111A2E',
    border: '#1C2740',
    borderStrong: '#2A3A5C',
    text: '#E8EEF8',
    muted: '#93A3BD',
    subtle: '#5E6E8A',
    blue: '#3B82F6',
    cyan: '#22D3EE',
    sky: '#7DD3FC',
    green: '#34D399',
    amber: '#FBBF24',
    grid: '#1A2540',
    glowA: '#1D4ED8',
    glowB: '#0891B2',
    // contribution levels 0..4
    heat: ['#131C30', '#0E3A5C', '#0E6A8F', '#14A3C7', '#5EEAD4'],
  },
  light: {
    name: 'light',
    bg: '#F7F9FC',
    bgAlt: '#EEF3FA',
    surface: '#FFFFFF',
    border: '#DCE4F0',
    borderStrong: '#C3D0E3',
    text: '#0B1324',
    muted: '#4A5A75',
    subtle: '#7D8BA3',
    blue: '#2563EB',
    cyan: '#0891B2',
    sky: '#0284C7',
    green: '#059669',
    amber: '#B45309',
    grid: '#E3EAF4',
    glowA: '#93C5FD',
    glowB: '#67E8F9',
    heat: ['#E6ECF5', '#BAE6FD', '#67C6F0', '#1D9BD1', '#0B5E8E'],
  },
};

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Wraps content in an accessible, self-contained SVG document.
export function svgDoc({ width, height, title, desc = '', defs = '', style = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<style>${style}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>
<defs>${defs}</defs>
${body}
</svg>
`;
}
