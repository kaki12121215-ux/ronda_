/* ===================== PRUEBA DEL DISEÑO NUEVO · datos de ejemplo =====================
   - No hay script ni Google: todo se guarda en el propio móvil (IndexedDB «ronda_prueba»).
   - La app real vive en el mismo dominio (kaki12121215-ux.github.io), así que la prueba usa SUS PROPIOS
     nombres de almacenamiento («ronda_prueba», «rondaP-…»): nunca lee ni pisa los datos de la app real.
   - Los datos de ejemplo se crean la primera vez, con fechas relativas al día en que se abre. */
const PRUEBA = true;
const DATOS_V = 2;                       /* si cambia, se vuelven a crear los datos de ejemplo (0.1.1: 2) */
let RN_CARGADO = false;                  /* hasta que no están los datos, no se guarda nada */
const PI = 'persona-ina-0000000001', PR = 'persona-ru-00000000002';   /* ids largos (ver J en 03_ERRORES) */

/* ---------- Sin conexión con Google ---------- */
async function api(a) { throw ErrR('prueba', 'En la prueba no hay conexión con Google.'); }
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
