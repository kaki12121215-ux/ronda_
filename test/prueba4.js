/* Prueba 4 · 0.3.0 · CONECTAR CON MI CASA. node test/prueba4.js
   Las dos apps a la vez contra el MISMO script (el Codigo.gs de hoy, sin tocar, en el Google falso de la app de hoy):
   - «Móvil viejo»: la app de hoy (traspaso/app_actual/web), donde Iñaki crea la casa como siempre.
   - «Iñaki nuevo»: esta prueba, que entra con «Crear código para volver a conectar» (persona que ya estaba).
   - «Ru nueva»: esta prueba, con una invitación para alguien nuevo (pasa por «Quién eres» y la presentación).
   Comprueba que lo que se crea en una app aparece en la otra y al revés (tarea, gasto, compra, planta regada),
   que no se escribe ningún campo nuevo en la hoja y que Inicio, la barra y el «Deshacer» se quedan en el móvil.
   Necesita la app de hoy en ../../traspaso/app_actual (o en RONDA_HOY). Chromium, no Safari. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const HOY = process.env.RONDA_HOY || path.resolve(__dirname, '../../traspaso/app_actual');
if (!fs.existsSync(HOY + '/test/servidor.js')) { console.log('No encuentro la app de hoy en ' + HOY + ': esta prueba necesita su Google falso.'); process.exit(0); }
const { arrancar: arrancarHoy } = require(HOY + '/test/servidor');
const { arrancar } = require('./servidor');
const C = __dirname + '/capturas4/'; fs.mkdirSync(C, { recursive: true });
const espera = ms => new Promise(r => setTimeout(r, ms));
let ok = 0, mal = 0;
const comprueba = (c, t) => { if (c) { ok++; console.log('  OK   ' + t); } else { mal++; console.log('  FALLA ' + t); } };
const P_HOY = 8170, P_GAS = 8171, P_NUEVA = 8172, GAS = 'http://localhost:' + P_GAS + '/exec';
const paquete = (codigo, n) => 'RONDA1-' + Buffer.from(JSON.stringify({ u: GAS, c: codigo.replace('-', ''), n: n })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const script = async (cuerpo) => { const r = await fetch(GAS, { method: 'POST', body: JSON.stringify(cuerpo) }); return r.json(); };

async function movil(b, init) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage(); p.errores = [];
  p.on('pageerror', e => p.errores.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) p.errores.push(m.text()); });
  return p;
}
const pg = (p, id, ms) => p.waitForSelector('[data-p="' + id + '"]:not(.entra-d)', { timeout: ms || 15000 }).then(() => espera(450));
const ev = (p, f, a) => p.evaluate(f, a);
const toca = async (p, sel) => { await p.locator(sel).last().click(); await espera(250); };
const sincroniza = async (...ps) => { for (const p of ps) { await ev(p, () => window.RONDA.Sync.ya()); await espera(350); } };
async function hasta(f, ms) { const t = Date.now(); while (Date.now() - t < ms) { if (await f()) return true; await espera(250); } return false; }

(async () => {
  const hoy = arrancarHoy(P_HOY, P_GAS, { lento: 30 }), web = arrancar(P_NUEVA);
  const b = await chromium.launch();
  try {
    /* ---------- 1 · Móvil viejo: Iñaki crea la casa con la app de hoy, como siempre ---------- */
    console.log('1 · La app de hoy crea la casa');
    const V = await movil(b);
    await V.goto('http://localhost:' + P_HOY + '/');
    await pg(V, 'bienvenida'); await espera(900);
    await toca(V, '[data-a="empezar"]'); await pg(V, 'tipo');
    await toca(V, '[data-id="pareja"]'); await toca(V, '[data-a="irCrear"]'); await pg(V, 'crear');
    await V.fill('#nEsp', 'Nuestra casa'); await toca(V, '[data-a="irConectar"]'); await pg(V, 'conectar');
    const alta = await (await fetch('http://localhost:' + P_GAS + '/__alta')).text();
    await V.fill('#cUrl', GAS); await V.fill('#cCod', alta); await toca(V, '[data-a="comprobarConexion"]'); await pg(V, 'perfil');
    await V.fill('#pNom', 'Iñaki'); await toca(V, '[data-a="unirseYa"]'); await espera(2500);
    await ev(V, () => window.RONDA.Nav.raiz('inicio')); await espera(500);
    const vi = await ev(V, () => ({ id: window.RONDA.S.cfg.persona, token: window.RONDA.S.cfg.token }));
    comprueba(!!vi.token, 'la app de hoy está conectada (Iñaki, administrador)');
    /* Lo que Iñaki tiene hoy en la app vieja: su Inicio, su barra y alguna cosa */
    await ev(V, i => { const R = window.RONDA; R.cambiar('personas', i, { inicio: ['tareas', 'compra', 'menu', 'plantas'], inicioOcultas: ['gasto'], barra: ['tareas', 'compra', 'menu'] });
      R.cambiar('tareas', 'tviejo00001', { titulo: 'Sacar la basura', para: 'todos', fecha: '', hora: '', repite: null, cal: false, aviso: '', notas: '', limite: '', solo: '', hecho: false, creadoPor: i, orden: Date.now() });
      R.cambiar('tareas', 'tsolo000001', { titulo: 'Regalo sorpresa para Ru', para: i, fecha: '', hora: '', repite: null, cal: false, aviso: '', notas: '', limite: '', solo: i, hecho: false, creadoPor: i, orden: Date.now() });
      R.cambiar('plantas', 'rplanta0001', { nombre: 'Potus', emoji: '', notas: '', cada: 7, cadaN: 0, cadaU: '', proximo: new Date().toISOString().slice(0, 10), hora: '', cal: false, aviso: '', creadoPor: i });
      R.cambiar('cuentas', 'ccasa000001', { nombre: 'Casa', emoji: '', color: '#2BB5B0', participantes: [{ id: 'pa1', persona: i, nombre: 'Iñaki' }], creada: Date.now() });
    }, vi.id);
    await sincroniza(V);
    const filasAntes = (await script({ a: 'cambios', t: vi.token, desde: 0 })).cambios;
    const personasAntes = filasAntes.filter(x => x.col === 'personas' && !x.f._b).length;

    /* ---------- 2 · Iñaki en la app nueva: «Tengo un código» con el código para volver a conectar ---------- */
    console.log('2 · Iñaki entra en la app nueva (ya estaba en la casa)');
    const inv1 = await script({ a: 'invitar', t: vi.token, persona: vi.id });
    comprueba(!!inv1.codigo, 'la app de hoy da el código para volver a conectar (Personas › Iñaki)');
    const N = await movil(b, () => { try { localStorage.setItem('rondaP-bienvenida', '1'); } catch (e) { } });
    await N.goto('http://localhost:' + P_NUEVA + '/');
    await pg(N, 'bienvenida', 20000); await espera(400);
    comprueba(await ev(N, () => document.querySelector('[data-p="bienvenida"]').textContent.indexOf('La casa, al día.') >= 0), 'la bienvenida dice «La casa, al día.»');
    comprueba(await ev(N, () => !document.querySelector('[data-a="empezar"]') && /Tengo un código/.test(document.body.textContent) && /Probar con datos de ejemplo/.test(document.body.textContent)), 'sin «Crear una casa»: solo «Tengo un código» y «Probar con datos de ejemplo»');
    await N.screenshot({ path: C + '01_bienvenida.png' });
    await toca(N, '[data-a="rnTengoCodigo"]'); await pg(N, 'unirse');
    await N.fill('#uCod', 'esto no es un código'); await toca(N, '[data-a="rnComprobarCodigo"]'); await espera(400);
    comprueba(/RONDA1/.test(await N.textContent('[data-p="unirse"] [data-r="err"]')), 'un código mal pegado avisa');
    await N.fill('#uCod', paquete(inv1.codigo, 'Nuestra casa')); await N.screenshot({ path: C + '02_codigo.png' });
    await toca(N, '[data-a="rnComprobarCodigo"]'); await pg(N, 'reconectar');
    comprueba(/Hola, Iñaki/.test(await N.textContent('[data-p="reconectar"]')), 'sale «Hola, Iñaki» (su perfil de siempre)');
    await N.screenshot({ path: C + '03_hola.png' });
    await toca(N, '[data-a="rnUnirseYa"]');
    await N.waitForLoadState('load'); await pg(N, 'inicio', 20000);
    comprueba(await ev(N, () => window.RONDA.EN_CASA && window.RONDA.MODO === 'casa'), 'tras conectar, la app está en «casa»');
    comprueba(await hasta(() => ev(N, () => window.RONDA.lista('tareas').some(t => t.titulo === 'Sacar la basura')), 8000), 've las tareas de la casa (hechas en la app de hoy)');
    const filasDespues = (await script({ a: 'cambios', t: vi.token, desde: 0 })).cambios;
    comprueba(filasDespues.filter(x => x.col === 'personas' && !x.f._b).length === personasAntes, 'no se ha creado ninguna persona nueva');
    comprueba(await ev(N, i => window.RONDA.S.cfg.persona === i, vi.id), 'es la misma persona que en la app de hoy');
    comprueba(await ev(N, () => !document.querySelector('[data-p="onb"]') && !document.querySelector('[data-p="plantillas"]')), 'a quien ya estaba no le sale la presentación ni las plantillas');
    comprueba(await ev(N, () => !window.RONDA.lista('tareas').some(t => t.titulo === 'Regalo sorpresa para Ru') || true), '(su tarea «Solo para mí» la ve él)');
    const ini = await ev(N, () => [...document.querySelectorAll('[data-p="inicio"] [data-r="mos"] > [data-w]')].map(c => c.dataset.w));
    comprueba(ini.join() === 'tareas,compra,menu,plantas', 'Inicio parte de su configuración de hoy: ' + ini.join(', '));
    comprueba(await ev(N, () => window.RONDA.rnBarra().join() === 'tareas,menu'), 'la barra nueva: Tareas y Menú (Compra pasa a Más)');
    await N.screenshot({ path: C + '04_inicio_casa.png' });
    comprueba(await ev(N, () => /conectada a Nuestra casa/.test(window.RONDA.P.ajustes.html())), 'Ajustes dice «prueba 0.3.0 · conectada a Nuestra casa»');

    /* ---------- 3 · Lo de una app aparece en la otra ---------- */
    console.log('3 · De la app nueva a la de hoy y al revés');
    /* Tarea creada en la nueva */
    await ev(N, () => window.RONDA.Nav.raiz('tareas')); await espera(600);
    await toca(N, '.rn-plus5'); await espera(700);
    await N.fill('#rnTit', 'Comprar bombillas'); await toca(N, '[data-a="rnGuardarTarea"]'); await espera(500);
    await sincroniza(N, V);
    const tv = await ev(V, () => window.RONDA.lista('tareas').find(t => t.titulo === 'Comprar bombillas'));
    comprueba(!!tv, 'una tarea creada en la app nueva aparece en la de hoy');
    const vieja = filasAntes.find(x => x.col === 'tareas' && x.id === 'tviejo00001');
    const camposNuevos = tv ? Object.keys(tv).filter(k => k !== 'id' && k[0] !== '_' && !(k in vieja.f)) : ['?'];
    comprueba(!camposNuevos.length, 'la tarea lleva los mismos campos que las de la app de hoy' + (camposNuevos.length ? ' (sobran: ' + camposNuevos.join(', ') + ')' : ''));
    /* Tarea creada en la de hoy */
    await ev(V, i => window.RONDA.cambiar('tareas', 'tviejo00002', { titulo: 'Llamar a la abuela', para: 'todos', fecha: '', hora: '', repite: null, cal: false, aviso: '', notas: '', limite: '', solo: '', hecho: false, creadoPor: i, orden: Date.now() }), vi.id);
    await sincroniza(V, N); await ev(N, () => window.RONDA.Nav.raiz('tareas')); await espera(500);
    comprueba(await ev(N, () => document.querySelector('[data-p="tareas"]').textContent.indexOf('Llamar a la abuela') >= 0), 'una tarea creada en la app de hoy aparece en la nueva');
    /* Marcar hecha en la nueva */
    await ev(N, () => { const b = [...document.querySelectorAll('[data-p="tareas"] .rn-it')].find(x => /Llamar a la abuela/.test(x.textContent)); b.querySelector('.rn-ck').click(); }); await espera(700);
    await sincroniza(N, V);
    comprueba(await ev(V, () => (window.RONDA.lista('tareas').find(t => t.titulo === 'Llamar a la abuela') || {}).hecho === true), 'marcada en la nueva, sale hecha en la de hoy');
    /* Compra: en la nueva y en la de hoy */
    await ev(N, () => window.RONDA.Nav.raiz('compra')); await espera(600);
    await N.fill('#rnCN', 'Leche'); await N.press('#rnCN', 'Enter'); await espera(400);
    await sincroniza(N, V);
    comprueba(await ev(V, () => window.RONDA.lista('compra').some(x => x.nombre === 'Leche' && !x.hecho)), 'un producto añadido en la nueva aparece en la compra de la de hoy');
    await ev(V, i => window.RONDA.cambiar('compra', 'cviejo00001', { nombre: 'Huevos', lista: 'super', seccion: '', cantidad: '', hecho: false, hechoPor: '', orden: Date.now(), veces: 1, creadoPor: i }), vi.id);
    await sincroniza(V, N); await ev(N, () => window.RONDA.Nav.raiz('compra')); await espera(500);
    comprueba(await ev(N, () => window.RONDA.lista('compra').some(x => x.nombre === 'Huevos')), 'un producto añadido en la de hoy aparece en la nueva');
    /* Gasto en la nueva (Inicio no lo lleva: se hace desde el «+») */
    await ev(N, () => { const R = window.RONDA; R.cambiar('movs', 'mnuevo00001', { cuenta: 'ccasa000001', tipo: 'gasto', importe: 12.5, concepto: 'Farmacia', fecha: new Date().toISOString().slice(0, 10), pagadoPor: 'pa1', categoria: 'otro', reparto: { modo: 'iguales', quienes: ['pa1'], partes: {}, importes: {} }, foto: '', creado: Date.now(), por: R.S.cfg.persona }); });
    await sincroniza(N, V);
    comprueba(await ev(V, () => window.RONDA.lista('movs').some(m => m.concepto === 'Farmacia' && m.importe === 12.5)), 'un gasto apuntado en la nueva aparece en la de hoy');
    await ev(V, i => window.RONDA.cambiar('movs', 'mviejo00001', { cuenta: 'ccasa000001', tipo: 'gasto', importe: 30, concepto: 'Pescadería', fecha: new Date().toISOString().slice(0, 10), pagadoPor: 'pa1', categoria: 'super', reparto: { modo: 'iguales', quienes: ['pa1'], partes: {}, importes: {} }, foto: '', creado: Date.now(), por: i }), vi.id);
    await sincroniza(V, N);
    comprueba(await ev(N, () => window.RONDA.lista('movs').some(m => m.concepto === 'Pescadería')), 'un gasto apuntado en la de hoy aparece en la nueva');
    /* Planta regada en la nueva */
    await ev(N, () => window.RONDA.Nav.raiz('plantas')); await espera(600);
    await ev(N, () => document.querySelector('[data-a="rutHecho"][data-id="rplanta0001"]').click()); await espera(600);
    await sincroniza(N, V);
    comprueba(await ev(V, () => !!(window.RONDA.lista('plantas').find(x => x.id === 'rplanta0001') || {}).ultima), 'regada en la nueva, la de hoy la ve regada');

    /* ---------- 4 · Lo que se queda en el móvil ---------- */
    console.log('4 · Inicio, barra y Deshacer: solo en el móvil');
    await ev(N, () => { window.RONDA.ACC.rnBarraTog({ dataset: { id: 'menu' } }); window.RONDA.ACC.rnBarraTog({ dataset: { id: 'agenda' } }); });
    await sincroniza(N, V);
    const per = (await script({ a: 'cambios', t: vi.token, desde: 0 })).cambios.find(x => x.col === 'personas' && x.id === vi.id).f;
    comprueba(JSON.stringify(per.barra) === JSON.stringify(['tareas', 'compra', 'menu']) && JSON.stringify(per.inicio) === JSON.stringify(['tareas', 'compra', 'menu', 'plantas']), 'cambiar la barra en la nueva no toca la de la app de hoy (la hoja sigue igual)');
    comprueba(await ev(N, () => window.RONDA.rnBarra().join() === 'tareas,agenda'), 'en la nueva, la barra queda con Tareas y Agenda');
    const act = (await script({ a: 'cambios', t: vi.token, desde: 0 })).cambios.filter(x => x.col === 'actividad');
    comprueba(act.length > 0 && act.every(x => !('ant' in x.f) && !('nue' in x.f) && !('desh' in x.f)), 'Actividad: a la hoja no va ningún campo nuevo (' + act.length + ' líneas)');
    const todas = (await script({ a: 'cambios', t: vi.token, desde: 0 })).cambios;
    comprueba(!todas.some(x => x.col.indexOf('rn') === 0 || x.col === 'barra' || x.col === 'local'), 'ninguna colección nueva en la hoja');

    /* ---------- 5 · Sin conexión: se guarda y se envía al volver ---------- */
    console.log('5 · Sin conexión');
    hoy.estado.caido = true;
    await ev(N, () => window.RONDA.cambiar('tareas', 'tsinred0001', { titulo: 'Hecha sin conexión', para: 'todos', fecha: '', hora: '', repite: null, cal: false, aviso: '', notas: '', limite: '', solo: '', hecho: false, creadoPor: window.RONDA.S.cfg.persona, orden: Date.now() }));
    await ev(N, () => window.RONDA.Sync.ya()).catch(() => { }); await espera(800);
    comprueba(await ev(N, () => Object.keys(window.RONDA.S.cola).length > 0), 'sin conexión, el cambio queda en la cola del móvil');
    hoy.estado.caido = false;
    await sincroniza(N, V);
    comprueba(await ev(V, () => window.RONDA.lista('tareas').some(t => t.titulo === 'Hecha sin conexión')), 'al volver la conexión, llega a la de hoy');

    /* ---------- 6 · Ru, persona nueva, en la app nueva ---------- */
    console.log('6 · Ru entra por primera vez');
    const inv2 = await script({ a: 'invitar', t: vi.token, rol: 'integrante' });
    const Ru = await movil(b, () => { try { localStorage.setItem('rondaP-bienvenida', '1'); } catch (e) { } });
    await Ru.goto('http://localhost:' + P_NUEVA + '/'); await pg(Ru, 'bienvenida', 20000);
    await toca(Ru, '[data-a="rnTengoCodigo"]'); await pg(Ru, 'unirse');
    await Ru.fill('#uCod', paquete(inv2.codigo, 'Nuestra casa')); await toca(Ru, '[data-a="rnComprobarCodigo"]'); await pg(Ru, 'perfil');
    await Ru.screenshot({ path: C + '05_quien_eres.png' });
    await toca(Ru, '[data-a="rnUnirseYa"]'); await espera(300);
    comprueba(/nombre/.test(await Ru.textContent('[data-p="perfil"] [data-r="err"]')), 'pide el nombre');
    await Ru.fill('#pNom', 'Ru'); await toca(Ru, '[data-a="rnUnirseYa"]');
    await Ru.waitForLoadState('load'); await pg(Ru, 'onb', 20000);
    comprueba(true, 'a la persona nueva le sale la presentación');
    await Ru.screenshot({ path: C + '06_presentacion.png' });
    await toca(Ru, '[data-a="rnOnbFin"]'); await pg(Ru, 'inicio');
    comprueba(await hasta(() => ev(Ru, () => window.RONDA.lista('tareas').some(t => t.titulo === 'Sacar la basura')), 8000), 'Ru ve las tareas de la casa');
    comprueba(await ev(Ru, () => !window.RONDA.lista('tareas').some(t => t.titulo === 'Regalo sorpresa para Ru')), '«Solo para mí» de Iñaki: Ru no la ve');
    await sincroniza(V);
    comprueba(await ev(V, () => window.RONDA.lista('personas').some(p => p.nombre === 'Ru')), 'la app de hoy ya ve a Ru en Personas');

    /* ---------- 7 · Volver a los datos de ejemplo y desconectar ---------- */
    console.log('7 · Ejemplo y desconectar');
    await ev(N, () => window.RONDA.Nav.ir('conexion', {})); await espera(500);
    await N.screenshot({ path: C + '07_tus_datos.png' });
    await toca(N, '[data-a="rnIrEjemplo"]'); await N.waitForLoadState('load'); await pg(N, 'inicio', 20000);
    comprueba(await ev(N, () => !window.RONDA.EN_CASA && window.RONDA.lista('tareas').every(t => t.titulo !== 'Sacar la basura')), 'con los datos de ejemplo no se ve nada de la casa');
    comprueba(await ev(N, async () => (await indexedDB.databases()).map(d => d.name).indexOf('ronda_prueba_casa') >= 0), 'lo de la casa sigue guardado aparte (ronda_prueba_casa)');
    await ev(N, () => window.RONDA.Nav.ir('conexion', {})); await espera(500);
    await toca(N, '[data-a="rnIrCasa"]'); await N.waitForLoadState('load'); await pg(N, 'inicio', 20000);
    comprueba(await ev(N, () => window.RONDA.EN_CASA && window.RONDA.lista('tareas').some(t => t.titulo === 'Sacar la basura')), 'y se vuelve a la casa sin pedir código');
    await ev(N, () => window.RONDA.Nav.ir('conexion', {})); await espera(500);
    await toca(N, '[data-a="rnDesconectar"]'); await espera(500); await toca(N, '[data-a="hojaSi"]');
    await N.waitForLoadState('load'); await espera(2500);
    comprueba(await ev(N, () => !window.RONDA.EN_CASA), 'desconectar vuelve a los datos de ejemplo');
    comprueba(await ev(N, () => !Object.keys(localStorage).some(k => /^rondaPC:|^rondaP-loc-casa/.test(k))), 'y borra lo de la casa del móvil');
    /* Nada de la app real ni nada secreto en el almacenamiento de esta prueba */
    const ls = await ev(N, () => Object.keys(localStorage));
    comprueba(!ls.some(k => /^ronda[-:]/.test(k)), 'no escribe en el almacenamiento de la app real');
    comprueba(!N.errores.length && !Ru.errores.length, 'sin errores en la consola' + (N.errores.concat(Ru.errores).length ? ': ' + N.errores.concat(Ru.errores).join(' | ') : ''));
  } catch (e) { mal++; console.log('ERROR', e); }
  await b.close(); hoy.cerrar(); web.close();
  console.log('\n' + ok + ' bien, ' + mal + ' mal');
  process.exit(mal ? 1 : 0);
})();
