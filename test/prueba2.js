/* Pruebas de la 0.2.0: todas las secciones y pantallas de dentro se abren, en claro y en oscuro, sin errores.
   node test/prueba2.js  (capturas en test/capturas2/) */
const { chromium } = require('playwright');
const fs = require('fs');
const { arrancar } = require('./servidor');
const C = __dirname + '/capturas2/'; fs.mkdirSync(C, { recursive: true });
const espera = ms => new Promise(r => setTimeout(r, ms));
let ok = 0, mal = 0;
const comprueba = (c, t) => { if (c) { ok++; } else { mal++; console.log('  FALLA ' + t); } };
const SECS = ['compra', 'menu', 'agenda', 'gastos', 'plantas', 'acuario', 'medicacion', 'turnos', 'coche', 'documentos', 'notas', 'listasr', 'tareas', 'feedback', 'personas', 'ajustes', 'inicio'];
/* Pantallas de dentro: [id, parámetros (se rellenan en la página), nombre] */
const DENTRO = [
  ['lista', 'R => ({ lid: "lsuper" })'], ['listaEditar', 'R => ({ icono: "bolsa", ci: 7 })'], ['producto', 'R => { const x = R.lista("compra")[0]; return Object.assign({}, x); }'],
  ['listar', 'R => ({ lid: R.lista("listasr")[0].id })'], ['menuDia', 'R => ({ semana: R.hoyISO(), d: 4 })'], ['menuAjustes', 'R => ({})'],
  ['turno', 'R => ({ tid: R.lista("turnos")[0].id })'], ['turnoEditar', 'R => ({ quienes: [R.PI, R.PR], rota: "semana" })'],
  ['evento', 'R => ({ fecha: R.hoyISO(), quien: [R.PI], tipo: "recordatorio", aviso: "" })'], ['eventoVer', 'R => ({ id: R.lista("eventos")[0].id })'],
  ['cuenta', 'R => ({ cid: "cuenta-noviembre-0001" })'], ['mov', 'R => ({ cid: "cuenta-noviembre-0001", pagadoPor: "part-ina-000001" })'], ['fijo', 'R => ({ categoria: "luz", cada: "mes", quien: "mitad" })'], ['fijoVer', 'R => ({ id: R.lista("fijos")[0].id })'], ['estadisticas', 'R => ({ cid: "cuenta-noviembre-0001" })'], ['cuentaEditar', 'R => ({})'],
  ['rutina', 'R => Object.assign({ col: "plantas" }, R.lista("plantas")[0])'], ['acGraficas', 'R => ({})'], ['acParams', 'R => ({})'],
  ['cocheVer', 'R => ({ kid: "coche-ejemplo-000001" })'], ['cocheEditar', 'R => ({})'], ['cocheFecha', 'R => ({ coche: "coche-ejemplo-000001" })'],
  ['docClave', 'R => ({})'], ['nota', 'R => ({ id: R.lista("notas")[0].id })'], ['buscar', 'R => ({})'],
  ['miperfil', 'R => ({})'], ['hogarAj', 'R => ({})'], ['avisos', 'R => ({})'], ['apariencia', 'R => ({})'], ['barra', 'R => ({})'], ['sincronizacion', 'R => ({})'], ['copia', 'R => ({})'], ['comprobaciones', 'R => ({})'], ['acerca', 'R => ({})']
];
(async () => {
  const s = arrancar(8150); const b = await chromium.launch();
  try {
    for (const osc of [false, true]) {
      const m = osc ? 'oscuro' : 'claro';
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: osc ? 'dark' : 'light', hasTouch: true, isMobile: true });
      /* 0.3.0: ya elegido «Probar con datos de ejemplo» (la bienvenida la prueba test/prueba4.js) */
      await ctx.addInitScript(() => { try { localStorage.setItem('rondaP-modo', 'ejemplo'); } catch (e) { } });
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push(e.message)); p.on('console', x => { if (x.type() === 'error') errs.push(x.text()); });
      await p.goto('http://localhost:8150/'); await p.waitForSelector('[data-p="inicio"]'); await espera(1200);
      await p.addStyleTag({ content: '.pgc{padding-top:51px!important}' });
      for (const k of SECS) {
        await p.evaluate(k => window.RONDA.Nav.raiz(k), k); await espera(650);
        const t = await p.evaluate(k => { const e = document.querySelector('[data-p="' + k + '"]:last-of-type'); return e ? e.textContent : ''; }, k);
        comprueba(t && !/No he podido pintar/.test(t), m + ': se abre ' + k);
        await p.screenshot({ path: C + m + '_' + k + '.png' });
      }
      /* Pestañas sin JPG */
      for (const [k, par, v] of [['agenda', 'vista', 'semana'], ['agenda', 'vista', 'lista'], ['gastos', 't', 'fijos'], ['gastos', 't', 'resumen'], ['acuario', 'tab', 'medidas'], ['acuario', 'tab', 'calendario']]) {
        await p.evaluate(([k, par, v]) => { const o = {}; o[par] = v; window.RONDA.Nav.raiz(k, o); }, [k, par, v]); await espera(650);
        const t = await p.evaluate(k => document.querySelector('[data-p="' + k + '"]').textContent, k);
        comprueba(!/No he podido pintar/.test(t), m + ': ' + k + ' · ' + v);
        await p.screenshot({ path: C + m + '_' + k + '_' + v + '.png' });
      }
      await p.evaluate(() => window.RONDA.Nav.raiz('ajustes')); await espera(500);
      for (const [id, f] of DENTRO) {
        const r = await p.evaluate(([id, f]) => { try { const R = window.RONDA; const par = (new Function('return ' + f))()(R); R.Nav.ir(id, par); return 'ok'; } catch (e) { return e.message; } }, [id, f]);
        await espera(500);
        const t = await p.evaluate(id => { const e = [...document.querySelectorAll('[data-p="' + id + '"]')].pop(); return e ? e.textContent : ''; }, id);
        comprueba(r === 'ok' && t && !/No he podido pintar/.test(t), m + ': se abre ' + id + ' (' + r + ')');
        if (!osc || ['lista', 'nota', 'rutina', 'mov', 'evento', 'cuenta'].indexOf(id) >= 0) await p.screenshot({ path: C + m + '_dentro_' + id + '.png' });
        await p.evaluate(() => window.RONDA.Nav.atras()); await espera(380);
      }
      /* Hoja «Añadir» del «+» de Inicio */
      await p.evaluate(() => window.RONDA.Nav.raiz('inicio')); await espera(600);
      await p.click('.rn-plus5'); await espera(600);
      comprueba(await p.evaluate(() => document.querySelectorAll('.rn-hj .rn-sc').length === 6), m + ': el «+» de Inicio abre «Añadir» con 6 opciones');
      await p.screenshot({ path: C + m + '_anadir.png' });
      await p.click('.rn-sc[data-i="0"]'); await espera(900);
      comprueba(await p.evaluate(() => /Nueva tarea/.test((document.querySelector('.rn-hj .rn-hjt') || {}).textContent || '')), m + ': «Tarea» abre «Nueva tarea»');
      await p.click('.rn-hj .rn-x'); await espera(400);
      comprueba(!errs.length, m + ': sin errores en la consola' + (errs.length ? ': ' + errs.slice(0, 5).join(' | ') : ''));
      await ctx.close();
    }
  } catch (e) { mal++; console.log('ERROR', e); }
  finally { await b.close(); s.close(); }
  console.log(ok + ' bien, ' + mal + ' mal');
  process.exit(mal ? 1 : 0);
})();
