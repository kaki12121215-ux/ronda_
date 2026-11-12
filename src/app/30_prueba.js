/* ===================== PRUEBA DEL DISEÑO NUEVO · datos de ejemplo =====================
   - No hay script ni Google: todo se guarda en el propio móvil (IndexedDB «ronda_prueba»).
   - La app real vive en el mismo dominio (kaki12121215-ux.github.io), así que la prueba usa SUS PROPIOS
     nombres de almacenamiento («ronda_prueba», «rondaP-…»): nunca lee ni pisa los datos de la app real.
   - Los datos de ejemplo se crean la primera vez, con fechas relativas al día en que se abre. */
const PRUEBA = true;
const DATOS_V = 3;                       /* si cambia, se vuelven a crear los datos de ejemplo (0.1.1: 2) */
let RN_CARGADO = false;                  /* hasta que no están los datos, no se guarda nada */
const PI = 'persona-ina-0000000001', PR = 'persona-ru-00000000002';   /* ids largos (ver J en 03_ERRORES) */

/* ---------- Sin conexión con Google ---------- */
/* Un «Google» de mentira dentro del móvil: la agenda, los archivos y los calendarios funcionan con datos locales.
   Lo demás (invitar, copias, tarjetas…) responde que en la prueba no hay conexión. */
const RN_PARTES = {};
const rnEv = () => lista('eventos').map(e => ({ id: e.id, titulo: e.titulo, inicio: e.inicio, fin: e.fin, todoDia: !!e.todoDia, lugar: e.lugar || '', notas: e.notas || '', tipo: e.tipo || 'recordatorio', quien: e.quien || '', aviso: e.aviso === undefined ? '' : e.aviso, ronda: e.ronda || '' }));
async function api(a, x) {
  x = x || {};
  await espera(60);
  const ok = o => Object.assign({ ok: true, sv: 'prueba' }, o || {});
  switch (a) {
    case 'estado': return ok({ persona: S.cfg.persona, rol: 'admin', cal: S.cal, seq: 0, sid: 'prueba' });
    case 'cambios': case 'guardar': return ok({ seq: 0, sid: 'prueba', cambios: [] });
    case 'calendarios': return ok({ lista: [{ id: 'cal-casa', nombre: 'Casa', propio: true, color: '#82ADE9' }] });
    case 'calendario-elegir': S.cal = { id: 'cal-casa', nombre: 'Casa' }; return ok({ cal: S.cal });
    case 'agenda': return ok({ eventos: rnEv().filter(e => e.inicio < x.hasta && e.fin > x.desde), cal: S.cal });
    case 'evento-guardar': {
      const ev = x.ev || {}, id = ev.id || 'evento-' + uid();
      const f = Object.assign({}, ev); delete f.id; delete f.destino; delete f.copia;
      cambiar('eventos', id, f);
      return ok({ evento: Object.assign({ id: id }, f) });
    }
    case 'evento-borrar': cambiar('eventos', x.id, { _b: 1 }); return ok();
    case 'archivo-subir': {
      if (x.parte) { const tid = 'parte-' + uid(); RN_PARTES[tid] = x.data; return ok({ tid: tid }); }
      const fid = 'archivo-' + uid(); await DB.set('archivo:' + fid, { data: x.data, tipo: x.tipo, nombre: x.nombre }); return ok({ fid: fid });
    }
    case 'archivo-unir': {
      const fid = 'archivo-' + uid(); await DB.set('archivo:' + fid, { data: x.ids.map(t => RN_PARTES[t] || '').join(''), tipo: x.tipo, nombre: x.nombre });
      x.ids.forEach(t => delete RN_PARTES[t]); return ok({ fid: fid });
    }
    case 'archivo-leer': {
      const f = await DB.get('archivo:' + x.fid); if (!f) throw ErrR('archivo', 'Este archivo no está en este móvil (en la prueba, cada móvil guarda los suyos).');
      const bin = atob(f.data), parte = bin.slice(x.desde || 0, (x.desde || 0) + (x.largo || bin.length));
      return ok({ data: btoa(parte), total: bin.length, tipo: f.tipo });
    }
    case 'archivo-borrar': await DB.del('archivo:' + x.fid); return ok();
  }
  throw ErrR('prueba', 'En la prueba no hay conexión con Google.');
}
Sync.ya = async () => { S.cola = {}; S.red.ok = true; S.red.error = null; S.red.ultimo = Date.now(); };
Sync.pronto = () => { setTimeout(() => { S.cola = {}; }, 0); };
Sync.programar = () => { };
Cal.pronto = () => { };
Cal.ya = async () => { };

/* ---------- Generar los datos de ejemplo ---------- */
function crearEjemplo() {
  const ahora = Date.now(), H = hoy0(), d = n => isoDia(sumaDias(H, n));
  const recs = {};
  const pon = (col, id, f) => { recs[col] = recs[col] || {}; recs[col][id] = { f: f, t: {}, rev: 1, por: PI }; };
  /* Días relativos: próximo domingo, lunes de esta semana, próximo lunes */
  const dsem = diaSemana(H);
  const dom = d(dsem === 7 ? 7 : 7 - dsem), lunPasado = d(dsem === 1 ? -7 : 1 - dsem), lunSig = d(8 - dsem);

  pon('espacio', 'espacio', { nombre: 'Nuestra casa', tipo: 'hogar', color: COL[4] });
  pon('personas', PI, { nombre: 'Iña', color: COL[0], alta: 1, barra: ['tareas', 'compra', 'menu'] });
  pon('personas', PR, { nombre: 'Ru', color: COL[5], alta: 2, barra: ['tareas', 'compra', 'menu'] });

  /* Tareas: las de la maqueta, con fechas de esta semana */
  let o = 1;
  const t = (titulo, f) => pon('tareas', 'tarea-ejemplo-' + String(o).padStart(4, '0'), Object.assign({ titulo: titulo, para: PI, fecha: '', hora: '', repite: null, cal: false, aviso: '', notas: '', limite: '', hecho: false, creadoPor: PI, orden: o++, solo: '' }, f));
  t('Llamar al fontanero', { fecha: lunPasado });
  t('Recoger pila al lavavajillas', { fecha: d(0), para: 'todos' });
  t('Trabajo TFM hacer', { fecha: dom, solo: PI });
  t('Corregir actividades instituto', { fecha: dom, limite: lunSig, notas: 'Las rúbricas están en la carpeta del trimestre. Subir las notas al cuaderno al terminar.' });
  t('Colgar el cuadro', {});
  t('Mirar la persiana del dormitorio', {});
  t('Pedir cita para la ITV', { fecha: d(3), para: PR });
  t('Bajar la basura orgánica', { fecha: d(-1), hecho: true, hechoPor: PI, hechoEn: ahora - 86400000 });
  t('Poner la lavadora de toallas', { fecha: d(-2), para: PR, hecho: true, hechoPor: PR, hechoEn: ahora - 2 * 86400000 });
  t('Comprar regalo para Bego', { fecha: d(2) });

  /* Compra: cuatro listas y lo que más compráis (ya comprado, con veces) */
  pon('listas', LSUPER, { nombre: 'Supermercado', emoji: '🛒', icono: 'carrito', ci: 2, secciones: true, orden: 0 });
  pon('listas', 'lista-farmacia-000001', { nombre: 'Farmacia', emoji: '💊', icono: 'salud', ci: 1, orden: 1 });
  pon('listas', 'lista-bazar-00000001', { nombre: 'Bazar', emoji: '🧺', icono: 'bolsa', ci: 7, orden: 2 });
  pon('listas', 'lista-ferreteria-001', { nombre: 'Ferretería', emoji: '', icono: 'carrito', ci: 4, orden: 3 });
  let c = 1;
  const pr = (nombre, lid, f) => pon('compra', 'compra-ejemplo-' + String(c++).padStart(4, '0'), Object.assign({ nombre: nombre, seccion: adivinarSeccion(nombre), cantidad: '', hecho: false, orden: c, creadoPor: PI, lista: lid, veces: 1 }, f || {}));
  ['Tomates', 'Plátanos', 'Leche sin lactosa', 'Pan de molde', 'Huevos'].forEach(n => pr(n, LSUPER));
  ['Ibuprofeno', 'Tiritas', 'Suero fisiológico'].forEach(n => pr(n, 'lista-farmacia-000001'));
  [['Lechuga', 9], ['Tranchetes', 8], ['Yogur bífidus', 7], ['Yogur coco', 6], ['Borraja', 5], ['Cardo', 3]].forEach(x => pr(x[0], LSUPER, { hecho: true, hechoPor: PI, veces: x[1] }));

  /* Menú: hoy y los dos días siguientes, como en la maqueta */
  const menu = {};
  const mn = (n, comida, cena) => { const dd = sumaDias(H, n), id = idSemana(lunesDe(dd)), k = 'd' + diaSemana(dd); menu[id] = menu[id] || {}; menu[id][k + 'c'] = comida; menu[id][k + 'n'] = cena; };
  mn(0, 'Ru: pescado con puré y ensalada de tomate. Iña: ensalada de tomate y revuelto con jamón', 'Cardo + hamburguesas con pimientos rojos');
  mn(1, 'Comida tecnología', 'Borraja con patatas + hamburguesas');
  mn(2, 'González Tablas', 'Cumple Bego');
  mn(3, 'Cumple Bego', 'Caldo + salchichas con chilli cheese bites');
  Object.keys(menu).forEach(id => pon('menu', id, menu[id]));

  /* Gastos: una cuenta a medias. Iña 203,93 €, Ru 17,22 €, total 221,15 €, Ru debe 93,36 € */
  pon('ajustes', 'gastos', { cuentas: true });
  pon('cuentas', 'cuenta-noviembre-0001', { nombre: 'Noviembre Gastos', emoji: '🍄', creada: ahora - 12 * 86400000, archivada: false, participantes: [{ id: 'part-ina-000001', nombre: 'Iña', persona: PI }, { id: 'part-ru-0000001', nombre: 'Ru', persona: PR }] });
  const rep = { modo: 'iguales', quienes: ['part-ina-000001', 'part-ru-0000001'], partes: {}, importes: {} };
  pon('movs', 'mov-ejemplo-00000001', { cuenta: 'cuenta-noviembre-0001', tipo: 'gasto', importe: 203.93, concepto: 'Súper', fecha: d(-2), pagadoPor: 'part-ina-000001', categoria: 'super', reparto: rep, foto: '', creado: ahora - 2 * 86400000, por: PI });
  pon('movs', 'mov-ejemplo-00000002', { cuenta: 'cuenta-noviembre-0001', tipo: 'gasto', importe: 17.22, concepto: 'Pan', fecha: d(-2), pagadoPor: 'part-ru-0000001', categoria: 'super', reparto: rep, foto: '', creado: ahora - 2 * 86400000 + 1000, por: PR });

  /* Plantas: 12, cinco a la vista en Inicio */
  let pl = 1;
  const planta = (nombre, emoji, cada, faltanDias) => pon('plantas', 'planta-ejemplo-' + String(pl++).padStart(4, '0'), { nombre: nombre, emoji: emoji, cada: cada, proximo: d(faltanDias), ultima: ahora - (cada - faltanDias) * 86400000, ultimaPor: PR, cal: false });
  planta('Ave del paraíso', '🦜', 10, 0);
  planta('Poto (acuario)', '🌱', 5, 1);
  planta('Aloe vera (cocina)', '🌵', 14, 12);
  planta('Coco', '🥥', 10, 8);
  planta('Espatifilium al lado de la ventana', '🪴', 7, 7);
  planta('Monstera', '🌿', 7, 4);
  planta('Espatifilium grande (salón)', '🪴', 7, 3);
  planta('Ficus', '🌳', 10, 9);
  planta('Albahaca', '🌿', 2, 2);
  planta('Cactus', '🌵', 21, 20);
  planta('Orquídea', '🌸', 7, 6);
  planta('Lazo de amor', '🌱', 6, 5);

  /* ----- 0.2.0: el resto de secciones ----- */
  const hora = (n, h, m) => { const x = sumaDias(H, n); x.setHours(h, m || 0, 0, 0); return x.getTime(); };
  let k = 1;
  const id = p => p + '-ejemplo-' + String(k++).padStart(5, '0');
  /* Agenda (eventos de ejemplo, guardados en el móvil) */
  [[0, 16, 0, 17, 30, 'Claustro', 'Instituto', PI, 'reunion'], [0, 21, 0, 23, 0, 'Cena con los aitas', '', PI + ',' + PR, 'cena'], [1, 9, 0, 10, 0, 'Llevar el coche al taller', '', PI, 'recordatorio'], [3, 12, 0, 14, 0, 'Cumple Bego', 'Casa de Bego', PI + ',' + PR, 'cumpleanos'], [-3, 18, 0, 19, 0, 'Dentista', 'Clínica', PR, 'medico'], [8, 19, 30, 21, 0, 'Cine', '', PI + ',' + PR, 'fiesta'], [15, 10, 0, 11, 0, 'Revisión del acuario', '', PI, 'recordatorio']].forEach(e => pon('eventos', id('evento'), { titulo: e[5], inicio: hora(e[0], e[1], e[2]), fin: hora(e[0], e[3], e[4]), todoDia: false, lugar: e[6], quien: e[7], tipo: e[8], notas: '', aviso: '' }));
  /* Listas que se repiten */
  const lr = (n, e, items, hechas, extra) => { const lid = id('listar'); pon('listasr', lid, Object.assign({ nombre: n, emoji: e, creado: ahora - 40 * 86400000, creadoPor: PI }, extra || {})); items.forEach((t, i) => pon('listasri', id('item'), { lista: lid, t: t[0], s: t[1] || '', h: i < hechas, orden: i + 1 })); };
  lr('Maleta de viaje', '🧳', [['Pasaporte', 'Papeles'], ['DNI', 'Papeles'], ['Billetes', 'Papeles'], ['Cargadores', 'Cosas'], ['Auriculares', 'Cosas'], ['Gafas de sol', 'Cosas'], ['Cepillo de dientes', 'Aseo'], ['Pasta de dientes', 'Aseo'], ['Desodorante', 'Aseo'], ['Champú', 'Aseo'], ['Medicinas', 'Aseo'], ['Camisetas', 'Ropa'], ['Pantalones', 'Ropa'], ['Ropa interior', 'Ropa'], ['Calcetines', 'Ropa'], ['Pijama', 'Ropa'], ['Chaqueta', 'Ropa'], ['Bañador', 'Ropa']], 6, { veces: 4 });
  lr('Limpieza de los sábados', '🧽', [['Baño'], ['Cocina'], ['Aspirar'], ['Fregar'], ['Polvo'], ['Sábanas'], ['Toallas'], ['Basura'], ['Cristales']], 9);
  lr('Antes de irnos de casa', '🏠', [['Ventanas'], ['Gas'], ['Peces'], ['Plantas regadas'], ['Luces'], ['Basura'], ['Llaves']], 2);
  lr('Botiquín', '', [['Tiritas'], ['Gasas'], ['Alcohol'], ['Termómetro'], ['Paracetamol']], 0);
  /* Turnos */
  const lun = isoDia(lunesDe(H));
  [['Sacar la basura', PI, 'semana'], ['Limpiar el baño', PR, 'semana'], ['Cambio de agua del acuario', PI, 'vez'], ['Cocinar el domingo', PR, 'semana']].forEach(t => pon('turnos', id('turno'), { nombre: t[0], emoji: '', quienes: [PI, PR], rota: t[2], toca: t[1], semana: lun, dias: {}, hist: [], creadoPor: PI }));
  /* Gastos fijos y otra cuenta (saldada) */
  [['Alquiler', '', 750, 1, 'mes', 'alquiler', 'mitad'], ['Luz', '', 62.4, 6, 'mes', 'luz', 'mitad'], ['Internet', '', 35, 9, 'mes', 'internet', 'mitad'], ['Seguro del coche', '', 420, 36, 'anio', 'seguro', PI]].forEach(f => pon('fijos', id('fijo'), { nombre: f[0], emoji: f[1], importe: f[2], proximo: d(f[3]), cada: f[4], categoria: f[5], quien: f[6], cal: false, aviso: '', pagos: [] }));
  pon('cuentas', 'cuenta-octubre-00001', { nombre: 'Octubre Gastos', emoji: '🍂', creada: ahora - 45 * 86400000, archivada: false, saldada: true, participantes: [{ id: 'part-ina-000002', nombre: 'Iña', persona: PI }, { id: 'part-ru-0000002', nombre: 'Ru', persona: PR }] });
  pon('movs', 'mov-ejemplo-00000003', { cuenta: 'cuenta-octubre-00001', tipo: 'gasto', importe: 1184.2, concepto: 'Octubre', fecha: d(-25), pagadoPor: 'part-ina-000002', categoria: 'casa', reparto: { modo: 'iguales', quienes: ['part-ina-000002'], partes: {}, importes: {} }, foto: '', creado: ahora - 25 * 86400000, por: PI });
  /* Acuario: cuidados y medidas */
  pon('acuario', id('acuario'), { nombre: 'Dar de comer (mañana)', cada: 1, proximo: d(1), hora: '8:30', ultima: ahora - 3600000 * 4, ultimaPor: PR, hist: [d(0)] });
  pon('acuario', id('acuario'), { nombre: 'Dar de comer (tarde)', cada: 1, proximo: d(0), hora: '18:30', ultima: ahora - 86400000, ultimaPor: PI, hist: [] });
  pon('acuario', id('acuario'), { nombre: 'Cambio de agua (25 %)', cada: 7, proximo: isoDia(sumaDias(lunesDe(H), 5)), hora: '', ultima: ahora - 5 * 86400000, ultimaPor: PI, hist: [] });
  pon('acuario', id('acuario'), { nombre: 'Test del agua', cada: 7, proximo: isoDia(sumaDias(lunesDe(H), 5)), hora: '', ultima: ahora - 7 * 86400000, ultimaPor: PR, hist: [] });
  pon('acuario', id('acuario'), { nombre: 'Limpiar el cristal', cada: 14, proximo: isoDia(sumaDias(lunesDe(H), 6)), hora: '', ultima: ahora - 8 * 86400000, ultimaPor: PI, hist: [] });
  pon('ajustes', 'acuario', { litros: 200, tipo: 'comunitario' });
  [[-28, 25.1, 7.2, 15], [-21, 25.4, 7.0, 12], [-14, 25.2, 7.1, 16], [-7, 25.6, 6.9, 9], [0, 25.5, 7.0, 10]].forEach(m => { const f = d(m[0]); pon('medidas', idMedida(f), { fecha: f, v_temp: m[1], v_ph: m[2], v_nitrato: m[3] }); });
  /* Medicación */
  pon('medicacion', id('med'), { nombre: 'Vitamina D', dosis: '1 cápsula · con el desayuno', cada: 1, hora: '9:00', proximo: d(1), ultima: ahora - 3600000 * 3, ultimaPor: PI, rec: true, quien: PI, stock: 18, hist: [d(0)] });
  pon('medicacion', id('med'), { nombre: 'Vitamina D (noche)', dosis: '1 cápsula · con la cena', cada: 1, hora: '21:00', proximo: d(0), rec: true, quien: PI, hist: [] });
  pon('medicacion', id('med'), { nombre: 'Ibuprofeno 400', dosis: 'Solo si hace falta', cada: 1, rec: false, stock: 6 });
  pon('medicacion', id('med'), { nombre: 'Paracetamol', dosis: 'Solo si hace falta · caduca en marzo', cada: 1, rec: false, stock: 20 });
  /* Coches */
  pon('coches', 'coche-ejemplo-000001', { nombre: 'Seat León', matricula: '0000 XXX', combustible: 'gasolina', anio: '2019', km: '84.200', notas: '', orden: 1 });
  [['Revisión en el taller', 1, 0, 0], ['Seguro', 36, 1, 0], ['ITV', 140, 2, 0], ['Impuesto de circulación', 170, 1, 0]].forEach(c => pon('coche', id('cochef'), { nombre: c[0], fecha: d(c[1]), anios: c[2], meses: c[3], cal: false, aviso: '', notas: '', coche: 'coche-ejemplo-000001' }));
  /* Notas */
  [['Compra grande', 'Aceite, arroz, legumbres, papel de cocina, detergente y pastillas del lavavajillas', COL[1], 0, PI], ['Ideas de regalo', 'Entradas, un libro, cena fuera', COL[7], 1, PR], ['Wifi de casa', 'La red y la clave están en Documentos, carpeta Casa', COL[6], 2, PR], ['Disneyland', 'Febrero: los dos parques, dos días y una noche. Mirar trenes', COL[4], 4, PI], ['Medidas del salón', 'Pared del sofá: 3,42 m. Hueco de la estantería: 86 cm', COL[5], 23, PI], ['Acuario', 'Probar bettas hembra en vez de gouramis. Preguntar en la tienda', COL[3], 10, PI]].forEach(n => pon('notas', id('nota'), { titulo: n[0], emoji: '', html: '<p>' + esc(n[1]) + '</p>', texto: n[1], color: n[2], editada: ahora - n[3] * 86400000, por: n[4], fijada: n[0] === 'Wifi de casa' }));
  /* Feedback */
  [['En el menú de la semana, cuando el texto es muy largo se corta en la tarjeta de Inicio', 'menu', PI, 0, 'p'], ['Poder cambiar el orden de las plantas arrastrando', 'plantas', PR, 1, 'p'], ['Al añadir un gasto desde Inicio, que recuerde quién pagó la última vez', 'gastos', PI, 2, 'p'], ['El candado de las tareas privadas', 'tareas', PI, 20, 'h']].forEach(f => pon('feedback', id('fb'), { texto: f[0], sec: f[1], adj: [], por: f[2], creado: ahora - f[3] * 86400000, estado: f[4] }));
  return recs;
}

/* Al arrancar: la persona de este móvil es Iña, y si no hay datos (o son de otra versión), se crean */
async function cargarPrueba() {
  await DB.abrir();
  S.cfg = { url: '', token: '', persona: PI, rol: 'admin', prueba: true };
  const d = (await DB.get('datos')) || {};
  /* 0.1.1: si lo guardado está vacío o sin la casa y las personas (en el iPhone se llegó a guardar una copia vacía
     antes de cargar: salía «Nuestro espacio»), se vuelven a crear los datos de ejemplo */
  const sano = r => r && r.espacio && r.espacio.espacio && r.personas && r.personas[PI] && r.tareas;
  if (d.ejemploV === DATOS_V && sano(d.recs)) { S.recs = d.recs; }
  else { S.recs = crearEjemplo(); }
  RN_CARGADO = true;
  S.cal = { id: 'cal-casa', nombre: 'Casa' };
  S.seq = 0; S.sid = 'prueba'; S.cola = {};
  guardarLocal(true);
}
/* Guardar también la marca de los datos de ejemplo */
function guardarLocal(ya) {
  if (!RN_CARGADO) return;
  clearTimeout(guardarT);
  const f = () => { DB.set('datos', { recs: S.recs, seq: 0, sid: 'prueba', ejemploV: DATOS_V }); };
  if (ya) f(); else guardarT = setTimeout(f, 250);
}
