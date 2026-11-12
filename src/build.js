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
/* Estilos: los tokens aprobados (sin la clase de ejemplo del final) y el diseño */
const tokens = fs.readFileSync(R + '/src/css/tokens.css', 'utf8').replace(/\/\* Fondo de una sección \(claro\)[\s\S]*$/, '');
fs.writeFileSync(R + '/docs/ronda.css', '/* RONDA · prueba ' + version + ' · se genera con src/build.js a partir de src/css (tokens.css + diseno.css) */\n' + tokens + '\n' + fs.readFileSync(R + '/src/css/diseno.css', 'utf8'));
/* El service worker lleva la versión: así el iPhone sabe que hay una nueva */
const sw = R + '/docs/sw.js';
fs.writeFileSync(sw, fs.readFileSync(sw, 'utf8').replace(/const VERSION = '[^']*';/, `const VERSION = 'prueba_ronda_${version}';`));
console.log('app.js', Math.round(out.length / 1024) + ' KB · versión ' + version + ' · ' + Object.keys(ICONOS).length + ' iconos · ' + Object.keys(ILUS).length + ' ilustraciones (+ ' + Object.keys(ILUS_OSC).length + ' en oscuro)');

/* Iconos de la app (pieza 06): los ocho puntos con sus colores originales sobre blanco. */
if (process.argv.includes('--iconos')) (async () => {
  const { chromium } = require('playwright');
  const LOGO = ['#FF7D5E', '#FFCB3D', '#B9DE4A', '#62D08D', '#4AD3CD', '#74ABF7', '#B5A3F4', '#F99DBA'];
  const puntos = (c, r, d) => LOGO.map((col, i) => { const a = i * Math.PI / 4; return `<circle cx="${(c + r * Math.sin(a)).toFixed(3)}" cy="${(c - r * Math.cos(a)).toFixed(3)}" r="${d.toFixed(3)}" fill="${col}"/>`; }).join('');
  const b = await chromium.launch();
  for (const [n, s, fondo] of [['icon-180', 180, '#FFFFFF'], ['icon-192', 192, '#FFFFFF'], ['icon-512', 512, '#FFFFFF'], ['favicon-32', 32, '#FFFFFF']]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    /* Mismas proporciones que el icono de hoy: los puntos ocupan el 70 % del lado */
    await p.setContent(`<html><body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100"><rect width="100" height="100" fill="${fondo}"/>${puntos(50, 27.4, 7.6)}</svg></body></html>`);
    await p.screenshot({ path: R + '/docs/icons/' + n + '.png', omitBackground: false });
    await p.close();
  }
  await b.close();
  console.log('iconos de la app hechos');
})();
