/* Pruebas de la 0.2.1: barra sin cortar, Actividad con deshacer/rehacer, selector de emoji, «+» gris, micrófono gris
   y la animación del arranque (larga la primera vez, corta las demás). Graba el arranque en vídeo.
   node test/prueba3.js  (capturas y vídeos en test/capturas3/) */
const { chromium } = require('playwright');
const fs = require('fs');
const { arrancar } = require('./servidor');
const C = __dirname + '/capturas3/'; fs.mkdirSync(C, { recursive: true });
const espera = ms => new Promise(r => setTimeout(r, ms));
let ok = 0, mal = 0;
const comprueba = (c, t) => { if (c) { ok++; console.log('  OK   ' + t); } else { mal++; console.log('  FALLA ' + t); } };
(async () => {
  const s = arrancar(8160); const b = await chromium.launch();
  try {
    for (const osc of [false, true]) {
      const m = osc ? 'oscuro' : 'claro';
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: osc ? 'dark' : 'light', hasTouch: true, isMobile: true, recordVideo: { dir: C + 'video_' + m, size: { width: 390, height: 844 } } });
      /* 0.3.0: ya elegido «Probar con datos de ejemplo» (la bienvenida la prueba test/prueba4.js) */
      await ctx.addInitScript(() => { try { localStorage.setItem('rondaP-modo', 'ejemplo'); } catch (e) { } });
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push(e.message)); p.on('console', x => { if (x.type() === 'error') errs.push(x.text()); });
      const ev = (f, a) => p.evaluate(f, a);
      const toca = async sel => { await p.locator(sel).first().tap(); };
      const aviso = () => ev(() => { const t = document.querySelector('.rn-aviso.rn-ver .rn-avt'); return t ? t.textContent : ''; });

      /* ---------- Arranque: la primera vez, la animación larga ---------- */
      const t0 = Date.now();
      await p.goto('http://localhost:8160/');
      await espera(1500); await p.screenshot({ path: C + m + '_arranque_1500ms.png' });
      await espera(1700); await p.screenshot({ path: C + m + '_arranque_3200ms.png' });
      await espera(600); await p.screenshot({ path: C + m + '_arranque_3800ms.png' });
      await p.waitForSelector('#arranque', { state: 'detached', timeout: 15000 });
      const larga = Date.now() - t0;
      comprueba(larga > 4000 && larga < 7500, 'la primera vez, la animación larga (' + larga + ' ms)');
      comprueba(await ev(() => !!document.querySelector('[data-p="inicio"]')), 'después entra Inicio');
      /* Las demás veces, la corta */
      const t1 = Date.now();
      await p.reload(); await p.waitForSelector('#arranque', { state: 'detached', timeout: 15000 });
      const corta = await ev(() => window.RN_ARR_MS);
      comprueba(corta > 500 && corta < 900, 'las demás veces, la corta (' + corta + ' ms; la página entera, ' + (Date.now() - t1) + ' ms)');
      /* 0.3.0 · opción A: termina en «R◯nda». La palabra centrada en la pantalla física y el anillo de 8 bolas en el sitio de la «o» */
      await p.reload(); await espera(700);
      const logo = await ev(() => {
        const a = document.querySelector('#arranque'); if (!a) return null;
        const sv = a.querySelector('.rn-pal'), r = sv.getBoundingClientRect(), P0 = window.RONDA.RN_PAL;
        const bs = [...a.querySelectorAll('.rn-pal-b circle')].map(x => x.getBoundingClientRect());
        const cx = bs.reduce((t, b) => t + b.left + b.width / 2, 0) / bs.length, cy = bs.reduce((t, b) => t + b.top + b.height / 2, 0) / bs.length;
        const ox = r.left + (P0.ox - P0.vx) / P0.vw * r.width, oy = r.top + (P0.oy - P0.vy) / P0.vh * r.height;
        return { n: bs.length, redondas: bs.every(b => Math.abs(b.width - b.height) < 0.6 && Math.abs(b.width - bs[0].width) < 0.6), enLaO: Math.abs(cx - ox) < 1.2 && Math.abs(cy - oy) < 1.2,
          centro: Math.abs(r.left + r.width / 2 - innerWidth / 2) < 1 && Math.abs(r.top + r.height / 2 - innerHeight / 2) < 1, letras: a.querySelectorAll('.rn-pal-l path').length, canvas: !!a.querySelector('canvas') };
      });
      comprueba(logo && logo.n === 8 && logo.redondas && logo.enLaO && logo.centro && logo.letras === 4 && !logo.canvas, 'el arranque termina en «R◯nda»: 8 bolas redondas en la «o», R n d a, centrado y sin canvas ' + JSON.stringify(logo));
      await p.screenshot({ path: C + m + '_arranque_final.png' });
      await p.waitForSelector('#arranque', { state: 'detached', timeout: 15000 }); await espera(400);

      /* ---------- La barra de abajo no se corta aunque falte algo de pantalla ---------- */
      await ev(() => { document.documentElement.style.setProperty('--abajo', '46px'); });
      const barra = await ev(() => { const n = document.querySelector('.rn-b5c').getBoundingClientRect(), pl = document.querySelector('.rn-plus5').getBoundingClientRect(); return n.bottom <= innerHeight && pl.bottom <= innerHeight && n.bottom > innerHeight - 30; });
      comprueba(barra, 'la barra y el «+» quedan enteros dentro de la pantalla');
      await p.screenshot({ path: C + m + '_inicio.png' });

      /* ---------- Menú: el «+» gris, no desaparece ---------- */
      await toca('.rn-tab[data-id="menu"]'); await espera(500);
      /* 0.3.0: el «+» es siempre el mismo gris; en Menú abre «Añadir» */
      comprueba(await ev(() => !!document.querySelector('.rn-plus5') && !document.querySelector('.rn-plus-no')), 'en Menú el «+» está, en su gris de siempre');
      await p.locator('.rn-plus5').first().tap(); await espera(500);
      comprueba(await ev(() => document.querySelectorAll('.rn-hj .rn-sc').length === 6), 'en Menú el «+» abre «Añadir»');
      await ev(() => window.RONDA.ACC.cerrarHoja ? window.RONDA.ACC.cerrarHoja() : null); await espera(400);
      await p.screenshot({ path: C + m + '_menu.png' });
      /* Compra: el micrófono gris */
      await ev(() => window.RONDA.Nav.raiz('compra')); await espera(500);
      comprueba(await ev(() => parseFloat(getComputedStyle(document.querySelector('.rn-qmic')).opacity) < .5), 'el micrófono de Compra sale gris');
      comprueba(await ev(() => !document.querySelector('.rn-plus-no') && !!document.querySelector('.rn-plus5')), 'en Compra el «+» es el de siempre');

      /* ---------- Selector de emoji ---------- */
      await ev(() => window.RONDA.Nav.ir('hogarAj', {})); await espera(500);
      await toca('.emb'); await espera(500);
      const emo = await ev(() => { const e = document.querySelector('.rn-capas .empick .hj'); if (!e) return null; const r = e.getBoundingClientRect(); return { h: r.height, vis: r.top < innerHeight - 100, bg: getComputedStyle(e).backgroundColor }; });
      comprueba(emo && emo.h > 200 && emo.vis && emo.bg !== 'rgba(0, 0, 0, 0)', 'el selector de emoji se ve, con fondo ' + JSON.stringify(emo));
      await p.screenshot({ path: C + m + '_emoji.png' });
      await toca('.empick .grid button'); await espera(400);
      comprueba(await ev(() => document.querySelector('#hoEmo').value === '🏠'), 'al tocar un emoji se pone en la casilla');
      comprueba(await ev(() => getComputedStyle(document.querySelector('.emb')).webkitUserSelect === 'none'), 'la casilla del emoji no se selecciona (sin lupa)');
      await ev(() => window.RONDA.Nav.atras()); await espera(400);

      /* ---------- Actividad ---------- */
      await ev(() => { window.RONDA.Nav.raiz('ajustes'); }); await espera(400);
      comprueba(await ev(() => !!document.querySelector('[data-ir="actividad"]')), 'Ajustes tiene la fila Actividad');
      await toca('[data-ir="actividad"]'); await espera(500);
      comprueba(await ev(() => document.querySelectorAll('[data-a="actDeshacer"]').length >= 2), 'cada cambio de ejemplo lleva «Deshacer»');
      await p.screenshot({ path: C + m + '_actividad.png' });
      const R = () => ev(() => window.RONDA.S.recs.tareas['tarea-ejemplo-0002'].f.para);
      await toca('[data-a="actDeshacer"][data-id="a-ejemplo-1"]'); await espera(300);
      comprueba(await R() === 'persona-ru-00000000002', '«Deshacer» devuelve la tarea a como estaba (para Ru)');
      comprueba(await ev(() => !!document.querySelector('[data-a="actRehacer"][data-id="a-ejemplo-1"]')), 'la línea pasa a «Rehacer»');
      await toca('[data-a="actRehacer"][data-id="a-ejemplo-1"]'); await espera(300);
      comprueba(await R() === 'todos', '«Rehacer» la deja como quedó (para todos)');
      await toca('[data-a="actDeshacer"][data-id="a-ejemplo-2"]'); await espera(300);
      comprueba(await ev(() => window.RONDA.lista('notas').some(n => n.titulo === 'Lista de la ferretería')), 'deshacer un borrado recupera la nota');
      /* Un cambio nuevo también se puede deshacer */
      await ev(() => { const R = window.RONDA; R.cambiar('tareas', 'tarea-ejemplo-0001', { titulo: 'Llamar al fontanero hoy' }); R.Nav.refrescar(true); }); await espera(300);
      /* 0.3.0: «cómo estaba» se guarda solo en el móvil; la línea de la hoja lleva los mismos campos que en la app de hoy */
      const nueva = await ev(() => { const R = window.RONDA, a = R.lista('actividad').sort((x, y) => y.cuando - x.cuando)[0], l = R.actLoc(a.id) || {}; return l.ant && l.ant.titulo === 'Llamar al fontanero' && l.nue.titulo === 'Llamar al fontanero hoy' ? a.id : ''; });
      comprueba(!!nueva, 'un cambio nuevo guarda en el móvil cómo estaba antes');
      comprueba(await ev(() => { const R = window.RONDA; return R.lista('actividad').every(a => !('ant' in a) && !('nue' in a) && !('desh' in a)) && Object.keys(R.S.cola).every(k => !/^actividad/.test(k) || !('ant' in R.S.cola[k].f)); }), 'a la hoja no va ningún campo nuevo en Actividad (ni ant, ni nue, ni desh)');
      await toca('[data-a="actDeshacer"][data-id="' + nueva + '"]'); await espera(300);
      comprueba(await ev(() => window.RONDA.S.recs.tareas['tarea-ejemplo-0001'].f.titulo === 'Llamar al fontanero'), 'y se deshace');
      await p.screenshot({ path: C + m + '_actividad_deshecho.png' });
      comprueba(!errs.length, 'sin errores en la consola' + (errs.length ? ': ' + errs.join(' | ') : ''));
      await ctx.close();
    }
  } catch (e) { mal++; console.log('ERROR', e); }
  await b.close(); s.close();
  console.log('\n' + ok + ' bien, ' + mal + ' mal');
  process.exit(mal ? 1 : 0);
})();
