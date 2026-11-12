/* RONDA · prueba del diseño nuevo · montaje.
   Une las piezas de src/app en docs/app.js con los iconos (sin punto) y las ilustraciones (claro y oscuro).
   node src/build.js            → docs/app.js y docs/ronda.css
   node src/build.js --iconos   → además, los iconos de la app (docs/icons) con Playwright */
const fs = require('fs'), path = require('path');
const R = path.resolve(__dirname, '..');

/* Iconos: { id: '<trazos>' }. La app antigua espera [trazos, puntos]: se pasan sin puntos. */
const fuenteIconos = fs.readFileSync(R + '/src/iconos/iconos_ronda_sin_punto.js', 'utf8');
const NUEVOS = new Function(fuenteIconos + '\nreturn ICONOS;')();
const ICONOS = {};
Object.keys(NUEVOS).forEach(k => { ICONOS[k] = [NUEVOS[k].replace(/\s+/g, ' '), []]; });

/* Ilustraciones: las 40, en claro y en oscuro. Ids únicos dentro de cada una para que no choquen en la misma página. */
const leerIlus = dir => {
  const out = {};
  fs.readdirSync(dir).filter(f => f.endsWith('.svg')).sort().forEach(f => {
    const id = f.slice(0, -4), suf = dir.endsWith('oscuro') ? id + '-o' : id;
    let s = fs.readFileSync(dir + '/' + f, 'utf8').replace(/<\?xml[^>]*>/, '').replace(/\s+/g, ' ').trim();
    s = s.replace(/id="([^"]+)"/g, `id="${suf}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${suf}-$1)`).replace(/href="#([^"]+)"/g, `href="#${suf}-$1"`);
    out[id] = s;
  });
  return out;
};
const ILUS = leerIlus(R + '/src/ilustraciones/svg');
const ILUS_OSC = leerIlus(R + '/src/ilustraciones/svg_oscuro');

const datos = '/* Generado por src/build.js: iconos e ilustraciones dentro del código, para que salgan siempre. */\n' +
  'const ICONOS = ' + JSON.stringify(ICONOS) + ';\nconst ICONOS_NUEVOS = ' + JSON.stringify(ICONOS) + ';\n' +
  'const ILUS = ' + JSON.stringify(ILUS) + ';\nconst ILUS_OSC = ' + JSON.stringify(ILUS_OSC) + ';\n';
const partes = fs.readdirSync(R + '/src/app').filter(f => f.endsWith('.js')).sort().map(f => `/* ---- ${f} ---- */\n` + fs.readFileSync(R + '/src/app/' + f, 'utf8'));
const version = /VERSION = '([^']+)'/.exec(partes.join(''))[1];
const out = `/* RONDA · prueba del diseño nuevo · versión ${version} · se genera con src/build.js a partir de src/app */\n(function () {\n'use strict';\n${datos}\n${partes.join('\n')}\n})();\n`;
fs.writeFileSync(R + '/docs/app.js', out);
new Function(out); /* comprobar que se puede leer */
/* Las pantallas de dentro que aún no tienen JPG propio usan la estructura de la 1.7.3, limitada a ellas (.rn-viejo) y a las
   hojas antiguas (.rn-hj). Se quitan las fuentes, la navegación, las páginas y la capa; el diseño nuevo (diseno.css) va encima. */
function acotar(css) {
  const PRE = ':where(.rn-viejo, .rn-hj) ';
  const fuera = sel => /^(\*|html|body|:root|#app|#nav|#capa|#arranque|#franja|\.pg\b|\.pgc\b|\.nav\b|\.toast\b|\.hoja\b|\.velo\b|\.oculto\b|\.aparece|\.ya\b|\.fab\b)/.test(sel);
  let out = '', i = 0;
  while (i < css.length) {
    const ab = css.indexOf('{', i); if (ab < 0) break;
    let cab = css.slice(i, ab).replace(/\/\*[\s\S]*?\*\//g, '').trim();
    let n = 1, j = ab + 1; while (j < css.length && n) { if (css[j] === '{') n++; else if (css[j] === '}') n--; j++; }
    const cuerpo = css.slice(ab + 1, j - 1);
    i = j;
    if (/^@font-face/.test(cab)) continue;
    if (/^@keyframes/.test(cab)) { out += cab.replace(/@keyframes\s+/, '@keyframes rnv-') + '{' + cuerpo + '}\n'; continue; }
    if (/^@(media|container|supports)/.test(cab)) { out += cab + '{' + acotar(cuerpo) + '}\n'; continue; }
    const sels = cab.split(',').map(x => x.trim()).filter(Boolean).map(x => {
      if (/^:root$/.test(x)) return ':where(.rn-viejo, .rn-hj)';
      if (/^html\[data-tema="oscuro"\]$/.test(x)) return '[data-tema="oscuro"] :where(.rn-viejo, .rn-hj)';
      const osc = /^html\[data-tema="oscuro"\]\s+/.test(x); const y = x.replace(/^html\[data-tema="oscuro"\]\s+/, '');
      if (fuera(y)) return null;
      return (osc ? '[data-tema="oscuro"] ' : '') + PRE + y;
    }).filter(Boolean);
    if (sels.length) out += sels.join(',') + '{' + cuerpo.replace(/animation(-name)?:\s*([a-z][\w-]*)/g, (m, a, nm) => 'animation' + (a || '') + ':rnv-' + nm) + '}\n';
  }
  return out;
}
const viejo = acotar(fs.readFileSync(R + '/src/css/viejo_1.7.3.css', 'utf8')).replace(/Nunito/g, 'Inter');
/* 0.2.1: también para las capas que la app de hoy pone encima de todo (#rn-capas: selector de emoji…) */
const conCapas = css => css.replace(/:(where|is)\(\.rn-viejo, \.rn-hj\)/g, ':$1(.rn-viejo, .rn-hj, .rn-capas)');
/* Estilos: los tokens aprobados (sin la clase de ejemplo del final) y el diseño */
const tokens = fs.readFileSync(R + '/src/css/tokens.css', 'utf8').replace(/\/\* Fondo de una sección \(claro\)[\s\S]*$/, '');
fs.writeFileSync(R + '/docs/ronda.css', '/* RONDA · prueba ' + version + ' · se genera con src/build.js a partir de src/css (tokens.css + diseno.css) */\n' + tokens + '\n/* ---- estructura de la 1.7.3 para las pantallas de dentro (acotada) ---- */\n' + conCapas(viejo) + '\n' + conCapas(fs.readFileSync(R + '/src/css/diseno.css', 'utf8')));
/* El service worker lleva la versión: así el iPhone sabe que hay una nueva */
const sw = R + '/docs/sw.js';
fs.writeFileSync(sw, fs.readFileSync(sw, 'utf8').replace(/const VERSION = '[^']*';/, `const VERSION = 'prueba_ronda_${version}';`));
console.log('app.js', Math.round(out.length / 1024) + ' KB · versión ' + version + ' · ' + Object.keys(ICONOS).length + ' iconos · ' + Object.keys(ILUS).length + ' ilustraciones (+ ' + Object.keys(ILUS_OSC).length + ' en oscuro)');

/* Iconos de la app: los ocho puntos con sus colores originales. 0.2.0: sobre el fondo oscuro de la app de hoy,
   porque sobre blanco el brillo que iOS 26 pone a los iconos hacía que las bolas se vieran aplastadas. */
if (process.argv.includes('--iconos')) (async () => {
  const { chromium } = require('playwright');
  const LOGO = ['#FF7D5E', '#FFCB3D', '#B9DE4A', '#62D08D', '#4AD3CD', '#74ABF7', '#B5A3F4', '#F99DBA'];
  const puntos = (c, r, d) => LOGO.map((col, i) => { const a = i * Math.PI / 4; return `<circle cx="${(c + r * Math.sin(a)).toFixed(3)}" cy="${(c - r * Math.cos(a)).toFixed(3)}" r="${d.toFixed(3)}" fill="${col}"/><circle cx="${(c + r * Math.sin(a)).toFixed(3)}" cy="${(c - r * Math.cos(a)).toFixed(3)}" r="${d.toFixed(3)}" fill="url(#brillo)"/>`; }).join('');
  /* El brillito: una luz suave arriba a la izquierda de cada bola, sin cambiar su forma (siguen siendo círculos perfectos) */
  const BRILLO = '<defs><radialGradient id="brillo" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#fff" stop-opacity="0.45"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.10"/></radialGradient></defs>';
  const b = await chromium.launch();
  for (const [n, s, fondo] of [['icon-180', 180, '#2B3A42'], ['icon-192', 192, '#2B3A42'], ['icon-512', 512, '#2B3A42'], ['favicon-32', 32, '#2B3A42']]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    /* Mismas proporciones que el icono de hoy: los puntos ocupan el 70 % del lado */
    await p.setContent(`<html><body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100">${BRILLO}<rect width="100" height="100" fill="${fondo}"/>${puntos(50, 27.4, 7.6)}</svg></body></html>`);
    await p.screenshot({ path: R + '/docs/icons/' + n + '.png', omitBackground: false });
    await p.close();
  }
  await b.close();
  console.log('iconos de la app hechos');
})();
