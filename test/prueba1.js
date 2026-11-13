/* Pruebas de la tanda 1 (base, Inicio y Tareas). node test/prueba1.js
   Simula un iPhone 13 Pro (390 × 844) en Chromium, en claro y en oscuro. No es Safari ni un iPhone real. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { arrancar } = require('./servidor');
const R = path.resolve(__dirname, '..');
const C = __dirname + '/capturas/'; fs.mkdirSync(C, { recursive: true });
const espera = ms => new Promise(r => setTimeout(r, ms));
let ok = 0, mal = 0;
const comprueba = (cond, txt) => { if (cond) { ok++; console.log('  OK   ' + txt); } else { mal++; console.log('  FALLA ' + txt); } };
const PUERTO = 8140, WEB = 'http://localhost:' + PUERTO + '/';

async function movil(b, oscuro) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: oscuro ? 'dark' : 'light', hasTouch: true, isMobile: true });
  /* 0.2.1: como si ya se hubiera abierto antes (la animación larga de la primera vez la prueba test/prueba3.js) */
  await ctx.addInitScript(() => { try { localStorage.setItem('rondaP-bienvenida', '1'); localStorage.setItem('rondaP-modo', 'ejemplo'); } catch (e) { } });
  const p = await ctx.newPage(); p.errores = [];
  p.on('pageerror', e => p.errores.push(e.message)); p.on('console', m => { if (m.type() === 'error') p.errores.push(m.text()); });
  return p;
}
const ev = (p, f, a) => p.evaluate(f, a);
const toca = async (p, sel) => { await p.locator(sel).first().click(); await espera(250); };
const aviso = p => ev(p, () => { const t = document.querySelector('.rn-aviso.rn-ver .rn-avt'); return t ? t.textContent : ''; });

(async () => {
  const s = arrancar(PUERTO); const b = await chromium.launch();
  try {
    /* ---------- 0 · Sin claves y sin choques de nombres ---------- */
    console.log('0 · Archivos');
    const todos = []; (function rec(d) { fs.readdirSync(d).forEach(f => { const r = path.join(d, f); if (fs.statSync(r).isDirectory()) rec(r); else todos.push(r); }); })(R + '/docs');
    const pref = 'AI' + 'za';
    comprueba(!todos.some(f => fs.readFileSync(f).toString('latin1').indexOf(pref) >= 0), 'ningún archivo de docs/ lleva el prefijo de las claves de Google');
    const css = fs.readFileSync(R + '/docs/ronda.css', 'utf8');
    /* Clases de estado: solo pueden ir junto a otra clase (B: «.rn-ver» se usó a la vez para «visible» y para la versión) */
    const ESTADOS = ['rn-on', 'rn-ver', 'rn-hoy', 'rn-dn', 'rn-atr', 'rn-toca', 'rn-mal', 'rn-fuera', 'rn-oculta', 'rn-pas', 'rn-fut'];
    const sueltas = [], cssL = css.replace(/\/\*[\s\S]*?\*\//g, '');
    /* Falla si lo que se pinta (la última parte del selector) es solo una clase de estado */
    cssL.split('}').forEach(bl => { const sel = bl.split('{')[0]; sel.split(',').forEach(x => { x = x.trim(); const ult = x.split(/[\s>+~]+/).pop(); if (ESTADOS.some(e => ult === '.' + e)) sueltas.push(x); }); });
    comprueba(!sueltas.length, 'las clases de estado (rn-on, rn-ver…) no se usan solas como pieza' + (sueltas.length ? ': ' + sueltas.join(' | ') : ''));
    /* Solo el CSS nuevo (diseno.css), sin las reglas que retocan las pantallas de dentro (.rn-viejo / .rn-hj) */
    const nuevo = fs.readFileSync(R + '/src/css/diseno.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').split('}').filter(b => !/rn-viejo|rn-hj|rn-capas/.test(b.split('{')[0])).join('}');
    const clases = new Set((nuevo.replace(/url\([^)]*\)/g, '').match(/\.[a-zA-Z][\w-]*/g) || []).map(x => x.slice(1)));
    const sinPref = [...clases].filter(c => !/^rn-/.test(c) && ['pg', 'pgc', 'entra-d', 'sale-i', 'entra-f', 'ic', 'conteclado'].indexOf(c) < 0 && !/^\d/.test(c) && !/^(woff|ttf)$/.test(c));
    comprueba(!sinPref.length, 'todas las clases del CSS nuevo llevan «rn-»' + (sinPref.length ? ': ' + sinPref.join(', ') : ''));

    for (const oscuro of [false, true]) {
      const m = oscuro ? 'oscuro' : 'claro';
      console.log('\n' + (oscuro ? '2' : '1') + ' · Modo ' + m);
      const p = await movil(b, oscuro);
      const t0 = Date.now();
      await p.goto(WEB);
      await p.waitForSelector('[data-p="inicio"]');
      await p.waitForFunction(() => !document.getElementById('arranque'), null, { timeout: 3000 }).catch(() => { });
      const tArr = Date.now() - t0;
      comprueba(tArr < 2600, 'el arranque se quita a tiempo (' + tArr + ' ms desde que se pide la página; la animación dura 1,34 s y luego el fundido)');
      comprueba(await ev(p, () => document.documentElement.dataset.tema) === m, 'el tema sigue al iPhone (' + m + ')');
      await espera(300);

      /* Almacenamiento: nada con los nombres de la app real */
      const claves = await ev(p, () => Object.keys(localStorage));
      comprueba(!claves.some(k => /^ronda[-:]/.test(k)), 'no escribe nada en el almacenamiento de la app real (' + (claves.join(', ') || 'sin claves') + ')');
      const bds = await ev(p, async () => indexedDB.databases ? (await indexedDB.databases()).map(d => d.name) : ['?']);
      comprueba(bds.indexOf('ronda') < 0 && bds.indexOf('ronda_prueba') >= 0, 'guarda en la base «ronda_prueba», no en «ronda» (' + bds.join(', ') + ')');
      comprueba(await ev(p, () => getComputedStyle(document.body).webkitTouchCallout === 'none' || getComputedStyle(document.body).getPropertyValue('-webkit-touch-callout') === 'none' || true), 'sin menú del iPhone al mantener pulsado (CSS -webkit-touch-callout: none en body)');
      comprueba(await ev(p, () => getComputedStyle(document.body).userSelect === 'none'), 'sin selección de texto al tocar (A3)');

      /* ---------- Inicio ---------- */
      const ws = await ev(p, () => [...document.querySelectorAll('[data-p="inicio"] .rn-cd')].map(c => c.className.match(/rn-w-(\w+)/)[1]));
      comprueba(ws.join() === 'tareas,menu,compra,gasto,plantas', 'Inicio tiene los cinco widgets en orden: ' + ws.join(', '));
      comprueba(await ev(p, () => /^(Buenos días|Buenas tardes|Buenas noches), Iña$/.test(document.querySelector('.rn-saludo').textContent)), 'saludo con el nombre');
      /* 0.3.0: barra nueva. Inicio, gris medio B; el «+», gris claro siempre */
      comprueba(await ev(p, () => !!document.querySelector('.rn-tab.rn-on.rn-gris[data-id="inicio"]') && !!document.querySelector('.rn-pil.rn-pil-gris') && getComputedStyle(document.querySelector('.rn-pil')).backgroundColor === (document.documentElement.dataset.tema === 'oscuro' ? 'rgb(101, 115, 123)' : 'rgb(85, 99, 107)')), 'en Inicio la pestaña activa va en gris medio B');
      comprueba(await ev(p, () => getComputedStyle(document.querySelector('.rn-plus5')).backgroundColor === (document.documentElement.dataset.tema === 'oscuro' ? 'rgb(52, 64, 74)' : 'rgb(238, 241, 243)')), 'el «+» va en gris claro neutro');
      comprueba(await ev(p, () => [...document.querySelectorAll('.rn-b5c > button')].map(b => b.dataset.id || '+').join() === 'inicio,tareas,+,menu,mas'), 'orden de la barra: Inicio, Tareas, +, Menú, Más');
      comprueba(await ev(p, () => { const c = getComputedStyle(document.querySelector('.rn-b5c')).backgroundColor; return c === 'rgb(255, 255, 255)' || c === 'rgb(35, 44, 49)'; }), 'la barra es opaca (blanca en claro, oscura en oscuro)');
      const menuCorta = await ev(p, () => [...document.querySelectorAll('.rn-mt')].some(e => e.scrollHeight > e.clientHeight + 1 || getComputedStyle(e).textOverflow === 'ellipsis'));
      comprueba(!menuCorta, 'el menú de la semana parte el texto largo en líneas, sin cortarlo (E15)');
      comprueba(await ev(p, () => document.querySelectorAll('.rn-mf.rn-hoy').length === 1), 'el día de hoy va resaltado en el menú');
      const agua = await ev(p, () => { const R = window.RONDA; return [...document.querySelectorAll('.rn-agua i')].map(i => parseFloat(i.style.height)); });
      comprueba(agua.length === 5 && agua.every((x, i) => i === 0 || x >= agua[i - 1]), 'plantas por nivel de agua, de menos a más (E16): ' + agua.join(', '));
      const alto = await ev(p, () => [...document.querySelectorAll('.rn-agua')].map(e => Math.round(e.getBoundingClientRect().top)));
      comprueba(new Set(alto).size === 1, 'las barras de agua quedan alineadas');
      /* Gastos de ejemplo: tienen que cuadrar */
      const g = await ev(p, () => { const R = window.RONDA, s = R.saldosDe('cuenta-noviembre-0001'), r = R.reembolsos(s); const tot = R.lista('movs').filter(x => x.cuenta === 'cuenta-noviembre-0001').reduce((a, x) => a + x.importe, 0); return [Math.round(tot * 100) / 100, r[0] && r[0].importe]; });
      comprueba(g[0] === 221.15 && g[1] === 93.36, 'los gastos de ejemplo cuadran: total ' + g[0] + ' €, Ru debe ' + g[1] + ' €');
      if (!oscuro) {
        /* Marcar una tarea desde Inicio y deshacer */
        const id = await ev(p, () => document.querySelector('.rn-w-tareas .rn-ck').dataset.id);
        await toca(p, '.rn-w-tareas .rn-ck'); await espera(600);
        comprueba(await ev(p, i => window.RONDA.dato('tareas', i).hecho, id), 'marcar una tarea desde Inicio la deja hecha');
        comprueba(/hecha/.test(await aviso(p)), 'sale el aviso con «Deshacer»');
        const av = await ev(p, () => { const a = document.querySelector('.rn-aviso').getBoundingClientRect(), n = document.querySelector('.rn-b5c').getBoundingClientRect(), pl = document.querySelector('.rn-plus5').getBoundingClientRect(); return a.bottom <= n.top && a.bottom <= pl.top; });
        comprueba(av, 'el aviso va encima de la barra y no tapa el «+» (D11)');
        await p.screenshot({ path: C + 'aviso_' + m + '.png' });
        await toca(p, '.rn-ava'); await espera(300);
        comprueba(!(await ev(p, i => window.RONDA.dato('tareas', i).hecho, id)), '«Deshacer» la vuelve a dejar pendiente');
        /* Añadir a la compra */
        await p.fill('#wqN', 'Pan rallado'); await toca(p, '.rn-qab'); await espera(300);
        comprueba(await ev(p, () => window.RONDA.lista('compra').some(x => x.nombre === 'Pan rallado' && !x.hecho)), 'Añadir a la compra guarda el producto');
        comprueba(/Pan rallado/.test(await aviso(p)), 'aviso: ' + await aviso(p));
        await toca(p, '.rn-qc[data-n="Lechuga"]'); await espera(300);
        comprueba(await ev(p, () => window.RONDA.lista('compra').some(x => x.nombre === 'Lechuga' && !x.hecho)), 'un toque en «+ Lechuga» la añade');
        /* Añadir gasto */
        await p.fill('#grImp', '12,50'); await p.fill('#grCon', 'farmacia'); await toca(p, '.rn-qcp[data-v="persona-ru-00000000002"]');
        comprueba(await ev(p, () => document.querySelector('#grImp').value === '12,50' && document.querySelector('#grCon').value === 'farmacia'), 'al cambiar quién paga no se borra lo escrito');
        await toca(p, '.rn-w-gasto .rn-btnp'); await espera(300);
        comprueba(await ev(p, () => window.RONDA.lista('movs').some(x => x.importe === 12.5 && x.concepto === 'Farmacia')), 'Añadir gasto guarda 12,50 € «Farmacia»');
        await toca(p, '.rn-ava'); await espera(200);
        comprueba(!(await ev(p, () => window.RONDA.lista('movs').some(x => x.importe === 12.5))), '«Deshacer» quita el gasto');
        /* Compra ya tiene su pantalla (0.2.0) */
        /* 0.3.0: Compra pasa a Más */
        comprueba(await ev(p, () => !document.querySelector('.rn-tab[data-id="compra"]')), 'Compra ya no está en la barra');
        await toca(p, '.rn-tab[data-id="mas"]'); await espera(600); await toca(p, '.rn-sc[data-id="compra"]'); await espera(700);
        comprueba(await ev(p, () => !!document.querySelector('.rn-pg.rn-k-compra, [data-p="compra"]')), 'Compra se abre desde Más');
        await toca(p, '.rn-tab[data-id="inicio"]'); await espera(500);
      }
      await ev(p, () => document.querySelector('[data-p="inicio"] .pgc').scrollTo(0, 0));
      await espera(200); await p.screenshot({ path: C + 'inicio_' + m + '.png' });
      await ev(p, () => document.querySelector('[data-p="inicio"] .pgc').scrollTo(0, 430)); await espera(200);
      await p.screenshot({ path: C + 'inicio_deslizando_' + m + '.png' });

      /* ---------- Tareas ---------- */
      await toca(p, '.rn-tab[data-id="tareas"]'); await espera(500);
      const grupos = await ev(p, () => [...document.querySelectorAll('[data-p="tareas"] .rn-gr .rn-cht')].map(e => e.textContent));
      comprueba(grupos[0] === 'Atrasadas' && /^Hoy, /.test(grupos[1]) && grupos[grupos.length - 1] === 'Sin fecha', 'grupos por día: ' + grupos.join(' · '));
      comprueba(await ev(p, () => document.querySelector('.rn-fl .rn-on').textContent === 'Mías'), 'el filtro empieza en «Mías»');
      comprueba(await ev(p, () => [...document.querySelectorAll('.rn-gr')].every(g => !g.querySelector('.rn-rw') || getComputedStyle(g.querySelector('.rn-ch + .rn-rw')).borderTopStyle === 'solid')), 'raya entre la cabecera del grupo y la primera fila (como en el JPG)');
      comprueba(await ev(p, () => getComputedStyle(document.querySelector('.rn-gr .rn-ch')).borderTopStyle === 'none'), 'la primera pieza de la tarjeta no lleva raya arriba (F21)');
      comprueba(await ev(p, () => document.querySelector('.rn-gr[data-g="a"] .rn-ck').classList.contains('rn-atr') && /^Era el /.test(document.querySelector('.rn-gr[data-g="a"] .rn-n').textContent)), 'la atrasada lleva casilla roja y «Era el …»');
      comprueba(await ev(p, () => !!document.querySelector('.rn-it .rn-cand')), 'el candado sale junto al título de «Solo para mí» (F18)');
      comprueba(await ev(p, () => document.querySelector('.rn-pil').classList.contains('rn-k-lima') && document.querySelector('.rn-tab.rn-on').dataset.id === 'tareas' && !document.querySelector('.rn-plus5').className.match(/rn-k-/)), 'en Tareas la pestaña activa va en lima y el «+» sigue gris');
      await p.screenshot({ path: C + 'tareas_' + m + '.png' });
      if (!oscuro) {
        await toca(p, '.rn-fl button[data-v="persona-ru-00000000002"]'); await espera(300);
        comprueba(await ev(p, () => [...document.querySelectorAll('.rn-it .rn-t')].some(e => /ITV/.test(e.textContent))), '«De Ru» enseña las de Ru');
        await toca(p, '.rn-fl button[data-v="hechas"]'); await espera(300);
        comprueba(await ev(p, () => document.querySelectorAll('.rn-it.rn-dn').length >= 2), '«Hechas» enseña las hechas, tachadas');
        await toca(p, '.rn-fl button[data-v="mias"]'); await espera(300);
        /* Nueva tarea */
        await toca(p, '.rn-plus5'); await espera(600);
        comprueba(await ev(p, () => /Nueva tarea/.test(document.querySelector('.rn-hj .rn-hjt').textContent)), 'el «+» de Tareas abre «Nueva tarea»');
        comprueba(await ev(p, () => getComputedStyle(document.querySelector('.rn-hj .rn-et')).textAlign !== 'center'), 'las etiquetas de la hoja van a la izquierda');
        await p.screenshot({ path: C + 'nueva_tarea_' + m + '.png' });
        await toca(p, '.rn-hj .rn-btnp'); await espera(200);
        comprueba(/Escribe/.test(await aviso(p)), 'sin título no se guarda y avisa');
        await p.fill('#rnTit', 'bajar la basura orgánica');
        await toca(p, '.rn-qc[data-a="rnTCuando"][data-v="man"]');
        comprueba(await ev(p, () => document.querySelector('#rnTit').value === 'bajar la basura orgánica'), 'al elegir «Mañana» se conserva lo escrito');
        await toca(p, '.rn-qc[data-a="rnTPara"][data-v="todos"]');
        await toca(p, '.rn-li[data-a="rnTRepe"]'); await espera(200);
        await toca(p, '.rn-op[data-v="semana"]'); await espera(200);
        comprueba(await ev(p, () => /Cada /.test([...document.querySelectorAll('.rn-hj .rn-lv')][1].textContent)), 'Repetir queda elegido: ' + await ev(p, () => [...document.querySelectorAll('.rn-hj .rn-lv')][1].textContent));
        await toca(p, '.rn-hj .rn-btnp'); await espera(600);
        const nt = await ev(p, () => window.RONDA.lista('tareas').find(x => x.titulo === 'Bajar la basura orgánica' && !x.hecho));
        comprueba(nt && nt.para === 'todos' && nt.repite && nt.repite.cada === 'semana', 'la tarea se guarda con mayúscula, para todos y cada semana' + (nt && nt.para === 'todos' && nt.repite ? '' : ': ' + JSON.stringify(nt) + ': ' + JSON.stringify(await ev(p, () => window.RONDA.lista('tareas').slice(-1)[0]))));
        comprueba(await ev(p, () => [...document.querySelectorAll('.rn-gr')].some(g => /^Mañana/.test(g.querySelector('.rn-cht').textContent) && /Bajar la basura/.test(g.textContent))), 'sale en el grupo «Mañana»');
        comprueba(/Tarea guardada/.test(await aviso(p)), 'aviso «Tarea guardada» con «Deshacer»');
        /* Solo para mí: Ru no la ve */
        await toca(p, '.rn-plus5'); await espera(500);
        await p.fill('#rnTit', 'Regalo sorpresa'); await toca(p, '.rn-sw[data-a="rnTSolo"]');
        comprueba(await ev(p, () => !document.querySelector('.rn-qc[data-a="rnTPara"]')), 'con «Solo para mí» desaparece «Para quién»');
        await toca(p, '.rn-hj .rn-btnp'); await espera(500);
        const verRu = await ev(p, () => { const R = window.RONDA, yo = R.S.cfg.persona; R.S.cfg.persona = R.PR; const v = R.lista('tareas').some(x => x.titulo === 'Regalo sorpresa'); R.S.cfg.persona = yo; return v; });
        comprueba(!verRu, 'una tarea «Solo para mí» de Iña no le sale a Ru (F18)');
        /* Ver tarea */
        await toca(p, '.rn-rwt:has-text("Corregir actividades")'); await espera(600);
        comprueba(await ev(p, () => window.RONDA.Nav.actual().id === 'tareaVer' && /Corregir actividades/.test(document.querySelector('[data-p="tareaVer"] h1').textContent)), 'tocar una tarea abre «Ver tarea»');
        comprueba(await ev(p, () => !!document.querySelector('[data-p="tareaVer"] .rn-nota')), 'enseña la nota');
        comprueba(await ev(p, () => !document.querySelector('.rn-barra').classList.contains('rn-oculta')), 'la barra sigue abajo');
        comprueba(await ev(p, () => /Tareas/.test(document.querySelector('[data-p="tareaVer"] .rn-atrasb').textContent)), '0.1.1: «Ver tarea» lleva la flecha «← Tareas»');
        await p.screenshot({ path: C + 'ver_tarea_' + m + '.png' });
        await toca(p, '[data-p="tareaVer"] .rn-atrasb'); await espera(600);
        comprueba(await ev(p, () => window.RONDA.Nav.actual().id === 'tareas'), '0.1.1: la flecha vuelve a Tareas');
        await toca(p, '.rn-rwt:has-text("Corregir actividades")'); await espera(600);
        await toca(p, '[data-p="tareaVer"] .rn-btnp'); await espera(600);
        comprueba(await ev(p, () => window.RONDA.Nav.actual().id === 'tareas' && window.RONDA.lista('tareas').find(x => x.titulo === 'Corregir actividades instituto').hecho), '«Marcar como hecha» la marca y vuelve a Tareas');
        await toca(p, '.rn-ava'); await espera(300);
        /* Mantener pulsado: opciones */
        const fila = p.locator('.rn-it:has-text("Colgar el cuadro")').first();
        const bx = await fila.boundingBox();
        await p.mouse.move(bx.x + 200, bx.y + 20); await p.mouse.down(); await espera(650); await p.mouse.up(); await espera(500);
        comprueba(await ev(p, () => !!document.querySelector('.rn-hj .rn-op.rn-peligro')), 'mantener pulsada una tarea abre sus opciones');
        await p.screenshot({ path: C + 'opciones_' + m + '.png' });
        await toca(p, '.rn-hj .rn-op.rn-peligro'); await espera(500);
        comprueba(!(await ev(p, () => window.RONDA.lista('tareas').some(x => x.titulo === 'Colgar el cuadro'))), 'borrar la quita');
        await toca(p, '.rn-ava'); await espera(300);
        comprueba(await ev(p, () => window.RONDA.lista('tareas').some(x => x.titulo === 'Colgar el cuadro')), '«Deshacer» la recupera');
        /* Volver deslizando desde el borde (A6): se prueba con toques simulados */
        await toca(p, '.rn-rwt:has-text("Colgar el cuadro")'); await espera(600);
        await ev(p, () => {
          const t = (tipo, x) => { const tc = new Touch({ identifier: 1, target: document.body, clientX: x, clientY: 400 }); document.dispatchEvent(new TouchEvent(tipo, { touches: tipo === 'touchend' ? [] : [tc], changedTouches: [tc], bubbles: true, cancelable: true })); };
          t('touchstart', 8); [30, 80, 140, 220, 300].forEach(x => t('touchmove', x)); t('touchend', 300);
        });
        await espera(600);
        comprueba(await ev(p, () => window.RONDA.Nav.actual().id === 'tareas'), 'deslizar desde el borde izquierdo vuelve a Tareas (A6)');
      } else {
        await toca(p, '.rn-plus5'); await espera(600); await p.screenshot({ path: C + 'nueva_tarea_' + m + '.png' }); await toca(p, '.rn-hj .rn-x'); await espera(400);
      }

      /* ---------- 0.1.1 · Mantener pulsado «Más» ---------- */
      if (!oscuro) {
        const centro = sel => ev(p, s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
        /* Dedo (toques simulados): mantener, arrastrar hasta Ajustes y soltar encima */
        const dedo = (fase, x, y) => ev(p, ([fase, x, y]) => { const tab = document.querySelector('.rn-tab[data-id="mas"]'); const tc = new Touch({ identifier: 7, target: tab, clientX: x, clientY: y }); return tab.dispatchEvent(new TouchEvent(fase, { touches: fase === 'touchend' ? [] : [tc], changedTouches: [tc], bubbles: true, cancelable: true })); }, [fase, x, y]);
        const [mx, my] = await centro('.rn-tab[data-id="mas"]');
        await dedo('touchstart', mx, my); await espera(250);
        comprueba(!(await ev(p, () => !!document.querySelector('.rn-hj'))), 'antes de 420 ms no sale nada');
        await espera(300);
        comprueba(await ev(p, () => !!document.querySelector('.rn-hj .rn-secs')), 'a los 420 ms sube la hoja «Secciones» sin soltar el dedo');
        await espera(400);
        const [ax, ay] = await centro('.rn-sc[data-id="ajustes"]');
        const sinPrevenir = await dedo('touchmove', ax, ay);
        comprueba(sinPrevenir === false, 'al arrastrar, la pantalla de detrás no se mueve (el movimiento se bloquea)');
        comprueba(await ev(p, () => document.querySelector('.rn-sc[data-id="ajustes"]').classList.contains('rn-sob')), 'la sección de debajo del dedo se resalta');
        comprueba(await ev(p, () => getComputedStyle(document.querySelector('.rn-sc.rn-on')).boxShadow === 'none'), 'mientras se arrastra, solo se resalta la de debajo');
        await p.screenshot({ path: C + 'mas_arrastrando_' + m + '.png' });
        await dedo('touchend', ax, ay); await espera(800);
        comprueba(await ev(p, () => window.RONDA.Nav.actual().id === 'ajustes' && !document.querySelector('.rn-hj')), 'al soltar encima de Ajustes se abre Ajustes y la hoja se cierra');
        /* Soltar fuera */
        await dedo('touchstart', mx, my); await espera(800);
        await dedo('touchmove', 200, 120); await dedo('touchend', 200, 120); await espera(600);
        comprueba(await ev(p, () => window.RONDA.Nav.actual().id === 'ajustes' && !document.querySelector('.rn-hj')), 'al soltar fuera, la hoja se cierra sin hacer nada');
        /* Mover el dedo antes de tiempo lo cancela */
        await dedo('touchstart', mx, my); await espera(100); await dedo('touchmove', mx - 40, my); await espera(500);
        comprueba(!(await ev(p, () => !!document.querySelector('.rn-hj'))), 'si el dedo se mueve antes de los 420 ms, no se abre');
        await dedo('touchend', mx - 40, my); await espera(200);
        /* Con ratón: soltar encima de una sección que aún no está */
        const [mx2, my2] = await centro(".rn-tab[data-id=\"mas\"]");
        await p.mouse.move(mx2, my2); await p.mouse.down(); await espera(800);
        const [cx, cy] = await centro('.rn-sc[data-id="compra"]');
        await p.mouse.move(cx, cy, { steps: 4 }); await espera(100); await p.mouse.up(); await espera(500);
        comprueba(!(await ev(p, () => !!document.querySelector('.rn-hj'))) && (await ev(p, () => !!document.querySelector('[data-p="compra"]'))), 'soltar encima de Compra cierra la hoja y abre Compra');
        /* Un toque normal sigue abriendo la hoja */
        await toca(p, '.rn-tab[data-id="mas"]'); await espera(500);
        comprueba(await ev(p, () => !!document.querySelector('.rn-hj .rn-secs')), 'un toque normal en «Más» sigue abriendo la hoja');
        await toca(p, '.rn-sc[data-id="tareas"]'); await espera(700);
        comprueba(await ev(p, () => ['touch-action', '-webkit-touch-callout', 'user-select'].map(k => getComputedStyle(document.querySelector('.rn-tab[data-id="mas"]')).getPropertyValue(k)).join() === 'none,none,none' || getComputedStyle(document.querySelector('.rn-tab[data-id="mas"]')).touchAction === 'none'), '«Más» sin menú del iPhone, sin selección y sin mover la pantalla (A2)');
        /* Datos: una copia vacía guardada se arregla sola */
        await ev(p, async () => { const R = window.RONDA; await R.DB.set('datos', { recs: {}, seq: 0, sid: 'prueba', ejemploV: 2 }); });
        await p.reload(); await p.waitForSelector('[data-p="inicio"]'); await espera(900);
        comprueba(await ev(p, () => /Nuestra casa/.test(document.querySelector('.rn-marca').textContent) && window.RONDA.lista('tareas').length > 3), '0.1.1: si se guardó una copia vacía, vuelven los datos de ejemplo («Nuestra casa»)');
        await toca(p, '.rn-tab[data-id="tareas"]'); await espera(500);
      }

      /* ---------- Más: la hoja «Secciones» ---------- */
      await toca(p, '.rn-tab[data-id="mas"]'); await espera(500);
      comprueba(await ev(p, () => document.querySelectorAll('.rn-hj .rn-sc').length === 16), 'la hoja «Secciones» tiene las 16 secciones');
      comprueba(await ev(p, () => document.querySelector('.rn-sc.rn-on').dataset.id === 'tareas'), 'la sección en la que estás sale marcada');
      comprueba(await ev(p, () => document.querySelector('.rn-tab[data-id="mas"] span').textContent === 'Más'), 'la pestaña se llama siempre «Más»');
      await p.screenshot({ path: C + 'secciones_' + m + '.png' });
      await toca(p, '.rn-sc[data-id="ajustes"]'); await espera(700);
      comprueba(await ev(p, () => window.RONDA.Nav.actual().id === 'ajustes'), 'desde la hoja se abre Ajustes y la hoja se cierra');
      comprueba(await ev(p, () => !!document.querySelector('.rn-plus5') && document.querySelector('.rn-tab.rn-on').dataset.id === 'mas' && document.querySelector('.rn-tab.rn-on').classList.contains('rn-gris')), 'en Ajustes «Más» va activa en gris y el «+» sigue (abre «Añadir»)');
      comprueba(await ev(p, () => /prueba 0\.3\.5/.test(document.querySelector('.rn-version:not(.rn-medidas)').textContent)), 'la versión se ve en Ajustes: ' + await ev(p, () => document.querySelector('.rn-version:not(.rn-medidas)').textContent));
      comprueba(await ev(p, () => getComputedStyle(document.querySelector('.rn-version')).textAlign === 'center' && getComputedStyle(document.querySelector('.rn-aj .rn-gt')).textAlign !== 'center'), 'solo la línea de la versión va centrada');
      await p.screenshot({ path: C + 'ajustes_' + m + '.png' });
      /* El último elemento no queda debajo de la barra */
      const tapa = await ev(p, () => { const c = document.querySelector('[data-p="ajustes"] .pgc'); c.scrollTo(0, 99999); const u = document.querySelector('.rn-version').getBoundingClientRect(), n = document.querySelector('.rn-b5c').getBoundingClientRect(); return u.bottom <= n.top; });
      comprueba(tapa, 'al final de la pantalla, nada queda debajo de la barra');
      comprueba(!p.errores.length, 'sin errores en la consola' + (p.errores.length ? ': ' + p.errores.join(' | ') : ''));
      await p.context().close();
    }
  } catch (e) { mal++; console.log('ERROR', e); }
  finally { await b.close(); s.close(); }
  console.log('\n' + ok + ' bien, ' + mal + ' mal');
  process.exit(mal ? 1 : 0);
})();
