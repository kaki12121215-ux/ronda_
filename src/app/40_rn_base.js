/* ===================== DISEÑO NUEVO · base =====================
   Todo lo nuevo lleva el prefijo «rn-» en las clases (ver B en 03_ERRORES: choques de nombres).
   Las pantallas de la app de hoy siguen en el código, pero en esta tanda solo se ven Inicio, Tareas y Ajustes;
   el resto avisa de en qué tanda llega. */

/* Los iconos nuevos, sin punto. La app antigua cambiaba algunos al cargar (monedas, menú…): se vuelven a poner. */
Object.keys(ICONOS_NUEVOS).forEach(k => { ICONOS[k] = ICONOS_NUEVOS[k]; });

/* Icono: solo línea, trazo 1,9, sin recuadro ni punto. El color lo pone quien lo usa (currentColor). */
function rnIc(id, s, sw) {
  const o = ICONOS[id];
  if (!o) return '';
  return '<svg class="rn-ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.9) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + o[0] + '</svg>';
}
/* La función antigua «ic» también pinta ya los iconos nuevos (sin puntos) */
function ic(id, s, ci, color) { return '<i class="ic" style="width:' + (s || 24) + 'px;height:' + (s || 24) + 'px' + (color ? ';color:' + color : '') + '">' + rnIc(id, s || 24) + '</i>'; }
const rnTick = '<svg class="rn-tick" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.4 6.4l2.5 2.5 4.8-5.2"/></svg>';
const rnFle = '<span class="rn-fle">' + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></span>';
const rnOscuro = () => document.documentElement.dataset.tema === 'oscuro';
const rnIlu = id => '<div class="rn-ilu">' + ((rnOscuro() ? ILUS_OSC[id] : ILUS[id]) || ILUS[id] || '') + '</div>';

/* ---------- Secciones: nombre, icono, color y en qué tanda se viste ---------- */
const RN_SEC = {
  compra: ['Compra', 'modulo-compra', 'amarillo', 2],
  menu: ['Menú semanal', 'cubiertos', 'amarillo', 2],
  agenda: ['Agenda', 'modulo-calendario', 'azul', 3],
  gastos: ['Gastos', 'modulo-gastos', 'rosa', 3],
  plantas: ['Plantas', 'modulo-plantas', 'verde', 4],
  acuario: ['Acuario', 'pez-betta', 'turquesa', 4],
  medicacion: ['Medicación', 'modulo-medicacion', 'verde', 4],
  turnos: ['Turnos', 'turno', 'lima', 5],
  coche: ['Coches', 'modulo-coche', 'azul', 4],
  documentos: ['Documentos', 'modulo-documentos', 'lavanda', 5],
  notas: ['Notas', 'modulo-notas', 'lavanda', 5],
  listasr: ['Listas', 'lista-repetir', 'lavanda', 2],
  tareas: ['Tareas', 'modulo-tareas', 'lima', 1],
  feedback: ['Feedback', 'comentario', 'coral', 5],
  personas: ['Personas', 'personas', 'neutro', 6],
  ajustes: ['Ajustes', 'ajustes', 'neutro', 1],
  buscar: ['Buscar', 'buscar', 'neutro', 5]
};
/* Lo que ya está hecho en esta versión */
const RN_LISTAS = ['inicio', 'tareas', 'tareaVer', 'ajustes'];
const rnColor = id => id === 'inicio' ? '' : id === 'tareaVer' ? 'lima' : (RN_SEC[id] || [])[2] || 'neutro';
/* Nombre corto en la barra: «Menú semanal» → «Menú» */
const rnCorto = k => RN_SEC[k][0].split(' ')[0];
function rnBarra() { const b = ((yo() || {}).barra || ['tareas', 'compra', 'menu']).filter(k => RN_SEC[k] && k !== 'ajustes' && k !== 'personas' && k !== 'buscar'); return b.slice(0, 3); }
function rnPendiente(k) { const s = RN_SEC[k]; toast((s ? s[0] : 'Esta pantalla') + ' llega en la tanda ' + (s ? s[3] : 'siguiente') + '. En esta prueba solo están Inicio, Tareas y Ajustes.'); }
/* Abrir una sección: si está hecha, como pantalla de la barra; si no, el aviso */
function rnAbrir(k) {
  if (k === 'mas') return rnSecciones();
  if (RN_LISTAS.indexOf(k) < 0) return rnPendiente(k);
  const e = Nav.actual();
  if (Nav.pila.length === 1 && e && e.id === k) { $('.pgc', e.el).scrollTo({ top: 0, behavior: 'smooth' }); return; }
  Nav.raiz(k);
}
ACC.rnTab = el => rnAbrir(el.dataset.id);
ACC.abrirMod = el => rnAbrir(el.dataset.id);
ACC.raiz = el => rnAbrir(el.dataset.id);
ACC.ir = el => { const id = el.dataset.id; if (RN_LISTAS.indexOf(id) < 0) return rnPendiente(id); const p = Object.assign({}, el.dataset); delete p.a; delete p.id; Nav.ir(id, p); };

/* ---------- Pantallas: sin la flecha automática de antes; color de la sección en la página ---------- */
Nav.contenido = function (e) {
  this.pintando = e;
  try { return P[e.id].html(e.params, e); }
  catch (x) { anotar('pintar ' + e.id, x); return '<div class="rn-cd rn-gl"><p class="rn-txt">No he podido pintar esta pantalla: ' + esc(x.message) + '</p></div>'; }
};
const _crear40 = Nav.crear;
Nav.crear = function (id, params, raiz) {
  const e = _crear40.call(this, id, params, raiz);
  const k = rnColor(id);
  e.el.classList.add('rn-pg', id === 'inicio' ? 'rn-ini' : id === 'ajustes' ? 'rn-aj' : 'rn-sec');
  if (k) e.el.classList.add('rn-k-' + k);
  return e;
};
Nav.estado = () => { };

/* ---------- Barra de abajo: Inicio, tres secciones, Más y el «+» aparte ---------- */
Nav.barra = function () {
  let n = $('#nav');
  if (!n) { n = document.createElement('nav'); n.id = 'nav'; n.className = 'rn-barra'; n.setAttribute('aria-label', 'Secciones'); document.body.appendChild(n); }
  const raiz = this.pila[0] && this.pila[0].id, b = rnBarra();
  if (!raiz) { n.classList.add('rn-oculta'); return; }
  n.classList.remove('rn-oculta');
  const tabs = [['inicio', 'inicio', 'Inicio']].concat(b.map(k => [k, RN_SEC[k][1], rnCorto(k)])).concat([['mas', 'menu', 'Más']]);
  /* La pestaña activa: la sección abierta; si no está en la barra, «Más» con su color */
  const enBarra = tabs.some(x => x[0] === raiz), activa = enBarra ? raiz : 'mas';
  const k = rnColor(raiz), conPlus = !P[raiz].sinPlus;
  n.className = 'rn-barra' + (k && k !== 'neutro' ? ' rn-k-' + k : ' rn-neutra') + (conPlus ? '' : ' rn-sin-plus') + (raiz === 'inicio' ? ' rn-en-ini' : '');
  n.innerHTML = '<div class="rn-nv rn-gl">' + tabs.map(x => '<button class="rn-tab' + (x[0] === activa ? ' rn-on' : '') + '" data-a="rnTab" data-id="' + x[0] + '" aria-label="' + x[2] + '"' + (x[0] === activa ? ' aria-current="page"' : '') + '>' + rnIc(x[1], 22, x[0] === activa ? 2.1 : 1.8) + '<span>' + x[2] + '</span></button>').join('') + '</div>' +
    (conPlus ? '<button class="rn-plus rn-gl" data-a="rnPlus" aria-label="Añadir">' + rnIc('anadir', 26, 2.2) + '</button>' : '');
};
/* El «+»: lo decide la pantalla de arriba (en Tareas, «Nueva tarea»). */
ACC.rnPlus = () => { const e = Nav.actual(), r = Nav.pila[0]; const d = (e && P[e.id].rnPlus) || (r && P[r.id].rnPlus); if (d) d(); };

/* ---------- Hojas que suben desde abajo ---------- */
/* hojaAbierta es la variable de 03_ui.js */
function abrirHoja(html, opts) {
  opts = opts || {};
  cerrarHoja(true);
  const capa = $('#capa');
  const velo = document.createElement('div'); velo.className = 'rn-velo';
  const h = document.createElement('div'); h.className = 'rn-hj rn-gl' + (opts.clase ? ' ' + opts.clase : '');
  h.setAttribute('role', 'dialog');
  h.innerHTML = '<i class="rn-tirador"></i><div class="rn-hjc">' + html + '</div>';
  capa.appendChild(velo); capa.appendChild(h);
  hojaAbierta = { h: h, velo: velo, alCerrar: opts.alCerrar };
  velo.addEventListener('click', () => cerrarHoja());
  /* Arrastrar hacia abajo para cerrar, solo si el contenido está arriba del todo */
  let y0 = null, dy = 0;
  h.addEventListener('touchstart', e => { const hc = $('.rn-hjc', h); if (hc.scrollTop > 0 || e.target.closest('input,textarea')) { y0 = null; return; } y0 = e.touches[0].clientY; dy = 0; h.style.transition = 'none'; }, { passive: true });
  h.addEventListener('touchmove', e => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); if (dy > 0) h.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
  h.addEventListener('touchend', () => { if (y0 === null) return; h.style.transition = ''; h.style.transform = ''; if (dy > 90) cerrarHoja(); y0 = null; });
  requestAnimationFrame(() => requestAnimationFrame(() => { velo.classList.add('rn-ver'); h.classList.add('rn-ver'); }));
  if (opts.montar) opts.montar(h);
  return h;
}
function cerrarHoja(rapido) {
  const o = hojaAbierta;
  if (!o) return;
  hojaAbierta = null;
  const ae = document.activeElement; if (ae && o.h.contains(ae) && ae.blur) ae.blur();
  o.h.classList.remove('rn-ver'); o.velo.classList.remove('rn-ver');
  setTimeout(() => { o.h.remove(); o.velo.remove(); }, rapido ? 0 : 320);
  if (o.alCerrar) o.alCerrar();
}
ACC.cerrarHoja = () => cerrarHoja();
/* Cabecera de hoja: título a la izquierda y ✕ (o lupa) a la derecha */
const rnCabHoja = (t, der) => '<div class="rn-hjcab"><h2 class="rn-hjt">' + t + '</h2>' + (der === undefined ? '<button class="rn-x" data-a="cerrarHoja" aria-label="Cerrar">' + rnIc('cerrar', 22, 2) + '</button>' : der) + '</div>';

/* ---------- Aviso breve, abajo, encima de la barra (pieza 01 y 02) ---------- */
/* toastT es la variable de 03_ui.js */
function toast(msg, accion, fn, icono) {
  const capa = $('#capa');
  $$('.rn-aviso', capa).forEach(t => { t.classList.remove('rn-ver'); setTimeout(() => t.remove(), 300); });
  const t = document.createElement('div');
  t.className = 'rn-aviso' + (icono === 'aviso' ? ' rn-mal' : '');
  t.setAttribute('role', 'status');
  t.innerHTML = (icono ? '<span class="rn-avi">' + (icono === 'hecho' ? rnTick : rnIc(icono, 20, 2.2)) + '</span>' : '') + '<span class="rn-avt">' + esc(msg) + '</span>' + (accion ? '<button class="rn-ava">' + esc(accion) + '</button>' : '');
  capa.appendChild(t);
  if (accion) $('button', t).addEventListener('click', () => { fn(); t.classList.remove('rn-ver'); setTimeout(() => t.remove(), 300); });
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('rn-ver')));
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.classList.remove('rn-ver'); setTimeout(() => t.remove(), 300); }, accion ? 5000 : 3400);
}
const toastError = msg => toast(msg, null, null, 'aviso');
/* Las preguntas usan una hoja de opciones (tipo 05), nunca ventanas del navegador */
function preguntar(titulo, texto, si, peligro) {
  return new Promise(ok => {
    let r = false;
    abrirHoja(rnCabHoja(esc(titulo)) + (texto ? '<p class="rn-txt rn-hjp">' + texto + '</p>' : '') +
      '<button class="rn-btnp' + (peligro ? ' rn-peligro' : '') + '" data-a="hojaSi">' + esc(si) + '</button>', { alCerrar: () => ok(r), clase: 'rn-k-neutro' });
    ACC.hojaSi = () => { r = true; cerrarHoja(); };
  });
}

/* ---------- Piezas comunes ---------- */
const rnCd = (h, cls, st) => '<div class="rn-cd rn-gl' + (cls ? ' ' + cls : '') + '"' + (st ? ' style="' + st + '"' : '') + '>' + h + '</div>';
const rnCnt = t => '<em class="rn-cnt">' + t + '</em>';
const rnGrupo = (t, der, k) => '<div class="rn-ch' + (k ? ' rn-k-' + k : '') + '"><i class="rn-pt"></i><span class="rn-cht">' + t + '</span>' + (der !== undefined && der !== '' ? rnCnt(der) : '') + '</div>';
const rnChip = (id, s) => '<span class="rn-chip">' + rnIc(id, Math.round(s * 0.74), 2.1) + '</span>';
const rnCab = (id, t, der) => '<div class="rn-ch">' + rnChip(id, 34) + '<span class="rn-cht">' + t + '</span>' + (der ? '<span class="rn-chd">' + der + '</span>' : '') + '</div>';
const rnRb = (id, a, lab, extra) => '<button class="rn-rb rn-gl" data-a="' + a + '" aria-label="' + lab + '"' + (extra || '') + '>' + rnIc(id, 21, 2) + '</button>';
/* Cabecera de sección: título grande, botones redondos y subtítulo opcional */
const rnTitulo = (t, o) => { o = o || {}; return '<div class="rn-tit' + (o.peq ? ' rn-tit-peq' : '') + '"><h1>' + t + '</h1>' + (o.der ? '<div class="rn-titd">' + o.der + '</div>' : '') + '</div>' + (o.sub ? '<p class="rn-sub">' + o.sub + '</p>' : ''); };
/* Avatar: la inicial sobre el color de la persona (Iña coral, Ru azul) */
const RN_COLPER = { '#F0674B': 'coral', '#F2B824': 'amarillo', '#A6C93A': 'lima', '#2E8B57': 'verde', '#2BB5B0': 'turquesa', '#3C78C8': 'azul', '#9B86E0': 'lavanda', '#EE8AA8': 'rosa' };
const rnKPer = p => RN_COLPER[String((p && p.color) || '').toUpperCase()] || 'azul';
const rnAv = (p, s) => p ? '<span class="rn-av rn-k-' + rnKPer(p) + '" style="width:' + s + 'px;height:' + s + 'px;font-size:' + (s * 0.383).toFixed(1) + 'px">' + esc((p.nombre || '?').charAt(0).toUpperCase()) + '</span>' : '';
/* Casilla redonda: vacía, marcada (fondo b, marca en t) o atrasada (borde rojo) */
const rnCk = (on, atras, a, id) => '<button class="rn-ck' + (on ? ' rn-on' : '') + (atras ? ' rn-atr' : '') + '" data-a="' + a + '" data-id="' + id + '" aria-label="' + (on ? 'Marcar como pendiente' : 'Marcar como hecha') + '" role="checkbox" aria-checked="' + (on ? 'true' : 'false') + '">' + rnTick + '</button>';
/* Aro de avance */
function rnAro(n, t, s, w) {
  const r = s / 2 - w / 2 - 1, L = 2 * Math.PI * r, c = s / 2;
  return '<svg class="rn-aro" width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '" aria-hidden="true"><circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" class="rn-aro-p" stroke-width="' + w + '"/><circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" class="rn-aro-r" stroke-width="' + w + '" stroke-linecap="round" stroke-dasharray="' + (t ? L * n / t : 0).toFixed(1) + ' ' + L.toFixed(1) + '" transform="rotate(-90 ' + c + ' ' + c + ')"/></svg>';
}
/* El logo: los ocho puntos con los colores originales */
const RN_LOGO = ['#FF7D5E', '#FFCB3D', '#B9DE4A', '#62D08D', '#4AD3CD', '#74ABF7', '#B5A3F4', '#F99DBA'];
function rnPuntos(s, r) { let o = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o += '<circle cx="' + (s / 2 + s * .36 * Math.sin(a)).toFixed(2) + '" cy="' + (s / 2 - s * .36 * Math.cos(a)).toFixed(2) + '" r="' + (s * r).toFixed(2) + '" fill="' + RN_LOGO[i] + '"/>'; } return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '" aria-hidden="true">' + o + '</svg>'; }
/* Interruptor */
const rnSw = (on, a) => '<button class="rn-sw' + (on ? ' rn-on' : '') + '" data-a="' + a + '" role="switch" aria-checked="' + (on ? 'true' : 'false') + '"><i></i></button>';

/* ---------- «Más»: la hoja «Secciones» ---------- */
const RN_ORDEN_SEC = ['compra', 'menu', 'agenda', 'gastos', 'plantas', 'acuario', 'medicacion', 'turnos', 'coche', 'documentos', 'notas', 'listasr', 'tareas', 'feedback', 'personas', 'ajustes'];
function rnSecciones() {
  const act = Nav.pila[0] && Nav.pila[0].id;
  abrirHoja(rnCabHoja('Secciones', '<button class="rn-x" data-a="rnBuscar" aria-label="Buscar">' + rnIc('buscar', 22, 2) + '</button>') +
    '<div class="rn-secs">' + RN_ORDEN_SEC.map(k => '<button class="rn-sc rn-k-' + RN_SEC[k][2] + (k === act ? ' rn-on' : '') + '" data-a="rnSecElegir" data-id="' + k + '">' + rnChip(RN_SEC[k][1], 40) + '<span>' + RN_SEC[k][0] + '</span></button>').join('') + '</div>', { clase: 'rn-hj-sec' });
}
ACC.rnSecElegir = el => { const k = el.dataset.id; if (RN_LISTAS.indexOf(k) < 0) { rnPendiente(k); return; } cerrarHoja(); setTimeout(() => rnAbrir(k), 120); };
ACC.rnBuscar = () => rnPendiente('buscar');

/* ---------- Tema: claro, oscuro o automático (sigue al iPhone) ---------- */
function aplicarTema() {
  let t = 'auto';
  try { t = localStorage.getItem('rondaP-tema') || 'auto'; } catch (e) { }
  let o = t === 'oscuro';
  try { if (t === 'auto') o = matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { }
  const antes = document.documentElement.dataset.tema;
  document.documentElement.dataset.tema = o ? 'oscuro' : 'claro';
  /* Las ilustraciones cambian con el modo: se repinta la pantalla */
  if (antes && antes !== document.documentElement.dataset.tema && Nav.actual()) Nav.refrescar(true);
}
/* Lo de la versión 1.5 (franja y título pequeño) no se usa en el diseño nuevo */
function ponerFranja() { }
function prepararMinis() { }
function banda() { return ''; }
