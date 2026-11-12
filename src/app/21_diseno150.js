/* ===================== 1.5.0 · Diseño: franja de color por sección, título con icono, Inicio nuevo =====================
   - Cada sección tiene su color (cabecera, barra, Más). Las tarjetas de Inicio no cambian.
   - Franja de color arriba (la zona de la hora) y título oscuro con el icono de la sección en su color.
   - Al deslizar, el título grande sube y aparece uno pequeño fijo arriba.
   - Inicio sin franja: el anillo, el saludo y un resumen del día. */

/* ---------- Colores por sección ---------- */
const TINTA = '#2B3A42';
const SECC = {
  tareas: [2, 'modulo-tareas'], turnos: [2, 'turno'],
  compra: [1, 'modulo-compra'], menu: [1, 'modulo-menu-semanal'],
  plantas: [3, 'modulo-plantas'], medicacion: [3, 'modulo-medicacion'],
  acuario: [4, 'pez-betta'],
  agenda: [5, 'modulo-calendario'], coche: [5, 'modulo-coche'],
  notas: [6, 'modulo-notas'], documentos: [6, 'modulo-documentos'], listasr: [6, 'lista-repetir'],
  gastos: [7, 'modulo-gastos'],
  mas: [-1, 'menu']
};
/* Pantallas que van con su sección */
const PAG_SEC = {
  tarea: 'tareas', tareaVer: 'tareas', repetir: 'tareas', turno: 'turnos', turnoEditar: 'turnos',
  lista: 'compra', listaEditar: 'compra', producto: 'compra', compartir: 'compra',
  menuDia: 'menu', menuAjustes: 'menu',
  acGraficas: 'acuario', acParams: 'acuario', acDia: 'acuario',
  evento: 'agenda', eventoVer: 'agenda', agendaDia: 'agenda',
  cocheVer: 'coche', cocheEditar: 'coche', cocheFecha: 'coche',
  nota: 'notas', docNuevo: 'documentos', docVer: 'documentos', docCarpeta: 'documentos', docClave: 'documentos', pin: 'documentos',
  listar: 'listasr',
  cuenta: 'gastos', cuentaEditar: 'gastos', mov: 'gastos', fijo: 'gastos', fijoVer: 'gastos', fijosResumen: 'gastos', archivadas: 'gastos', pagos: 'gastos', saldos: 'gastos', saldar: 'gastos',
  ajustes: 'mas', personas: 'mas', persona: 'mas', invitar: 'mas', miperfil: 'mas', avisos: 'mas', sincronizacion: 'mas', apariencia: 'mas', comprobaciones: 'mas', barra: 'mas', acerca: 'mas', buscar: 'mas',
  actividad: 'mas', tiempoAj: 'mas', resumenAj: 'mas', copia: 'mas', hogarAj: 'mas', tarjetasC: 'mas', tarjeta: 'mas', tarjetaConectar: 'mas', tarjetas: 'mas', tarjetasSec: 'mas', plantillas: 'mas'
};
function seccionDe(e) {
  if (!e) return null;
  if (e.id === 'rutina') return (e.params && e.params.col) || null;
  if (SECC[e.id]) return e.id;
  if (PAG_SEC[e.id]) return PAG_SEC[e.id];
  return null;
}
const colorSecc = k => k && SECC[k] ? (SECC[k][0] < 0 ? TINTA : COL[SECC[k][0]]) : null;
/* Mezcla dos colores (para la franja en modo oscuro, un poco más apagada) */
function mezcla(a, b, p) {
  const h = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16));
  const A = h(a), B = h(b);
  return '#' + A.map((v, i) => Math.round(v * p + B[i] * (1 - p)).toString(16).padStart(2, '0')).join('');
}
const oscuro = () => document.documentElement.dataset.tema === 'oscuro';
/* Color de la cabecera de una pantalla (en oscuro, un poco más apagado; Más siempre gris oscuro) */
function colorCab(e) {
  const k = seccionDe(e), c = colorSecc(k);
  if (!c) return null;
  return k === 'mas' ? TINTA : oscuro() ? mezcla(c, '#1B262C', .82) : c;
}
function colorFranja() { return colorCab(Nav.actual && Nav.actual()); }
/* 1.5.2 · Cabecera entera de color (la franja arriba no salía en iOS 26).
   Cada pantalla lleva su color en --hc; el CSS pinta la flecha, el título y lo que haya entre medias. */
function ponerFranja() {
  (Nav.pila || []).forEach(e => { if (!e.el) return; const c = colorCab(e); if (c) e.el.style.setProperty('--hc', c); else e.el.style.removeProperty('--hc'); });
}
/* Cada vez que entra o sale una página: sin esperar al siguiente fotograma, para que no se vea sin color */
new MutationObserver(() => { try { ponerFranja(); } catch (e) { anotar('cabecera', e); } requestAnimationFrame(() => { try { prepararMinis(); } catch (e) { } }); }).observe($('#app'), { childList: true });
const _aplicarTema150 = aplicarTema;
aplicarTema = function () { _aplicarTema150(); try { ponerFranja(); } catch (e) { } };

/* ---------- Título con el icono de la sección (lo usa head()) ---------- */
function iconoCabecera() {
  const k = seccionDe(Nav.pintando);
  if (!k || !SECC[k]) return '';
  return '<span class="hdic">' + icFino(SECC[k][1], 38, null) + '</span>';
}
/* Icono con trazo más fino y puntos más pequeños (para tamaños grandes) */
function icFino(id, s, ci) {
  const o = ICONOS[id]; if (!o) return '';
  const bolas = o[1].map(b => '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="2" fill="' + (b[2] === 'c' && ci !== null && ci !== undefined ? COL[ci % 8] : 'currentColor') + '" stroke="none"/>').join('');
  return '<i class="ic" style="width:' + s + 'px;height:' + s + 'px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + o[0] + bolas + '</svg></i>';
}

/* ---------- Título pequeño al deslizar ---------- */
function prepararMinis() {
  $$('#app > .pg').forEach(pg => {
    const c = $('.pgc', pg); if (!c || c._mini) return;
    c._mini = 1;
    c.addEventListener('scroll', () => miniTitulo(pg, c), { passive: true });
  });
}
function miniTitulo(pg, c) {
  const h1 = $('.hd.hdi h1', pg);
  if (!h1) return;
  const st = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--st')) || 0;
  const ver = c.scrollTop > 4 && h1.getBoundingClientRect().bottom < c.getBoundingClientRect().top + Math.max(st, 8) + 48;
  let m = $('.minit', pg);
  if (ver && !m) {
    const e = Nav.pila.find(x => x.el === pg);
    const atras = e && !e.raiz;
    m = document.createElement('div');
    m.className = 'minit';
    m.innerHTML = (atras ? '<button class="bk" data-a="atras" aria-label="Atrás">' + ic('atras', 24) + '</button>' : '<span class="hu"></span>') + '<b>' + ($('.hdic', pg) ? $('.hdic', pg).outerHTML.replace(/width:38px;height:38px/g, 'width:22px;height:22px') : '') + esc(h1.textContent) + '</b><span class="hu"></span>';
    pg.appendChild(m);
    requestAnimationFrame(() => m.classList.add('vis'));
  } else if (m) m.classList.toggle('vis', ver);
}

/* ---------- Gastos: dos monedas apiladas ---------- */
ICONOS['modulo-gastos'] = ['<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v4a7 3 0 0 0 14 0V7"/><path d="M5 11v4a7 3 0 0 0 14 0v-4"/>', [[12, 7, 'c']]];

/* ---------- Inicio: anillo, saludo y resumen del día ---------- */
function anilloMarca(s) {
  let o = '';
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o += '<circle cx="' + (s / 2 + s * .36 * Math.sin(a)).toFixed(1) + '" cy="' + (s / 2 - s * .36 * Math.cos(a)).toFixed(1) + '" r="' + (s * .105).toFixed(1) + '" fill="' + COL[i] + '"/>'; }
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '" aria-hidden="true">' + o + '</svg>';
}
function saludo() { const h = new Date().getHours(); return h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'; }
function resumenInicio() {
  const h = hoyISO(), out = [];
  if (modOn('tareas')) { const n = lista('tareas').filter(t => !t.hecho && mias(t) && t.fecha && t.fecha <= h).length; out.push([COL[2], n, n === 1 ? 'tarea hoy' : 'tareas hoy', 'wTareasMias']); }
  if (modOn('compra')) { const n = lista('compra').filter(x => !x.hecho).length; out.push([COL[1], n, 'en la compra', 'wCompra']); }
  if (modOn('agenda')) { let n = 0; try { n = eventosDia(h).length; } catch (e) { } out.push([COL[5], n, n === 1 ? 'evento hoy' : 'eventos hoy', 'wAgenda']); }
  try {
    const c = typeof cuentaInicio === 'function' ? cuentaInicio() : null;
    if (c) {
      const [s, yoP] = miSaldo(c), r = reembolsos(s), mio = r.find(x => yoP && (x.de === yoP.id || x.a === yoP.id));
      const txt = !mio ? 'estáis en paz' : mio.a === yoP.id ? partNombre(c, mio.de) + ' te debe' : 'debes a ' + partNombre(c, mio.a);
      out.push([COL[7], mio ? euros(mio.importe) : '0 €', txt, 'wGastos']);
    }
  } catch (e) { }
  return out;
}
function modOn(k) { try { return typeof modActivo === 'function' ? modActivo(k) : true; } catch (e) { return true; } }
function cabeceraInicio(e) {
  const yoN = ((yo() || {}).nombre || '').split(' ')[0];
  return '<div class="ini150"><div class="itop"><div class="marca">' + anilloMarca(30) + '<b>' + esc(e.nombre) + (e.emoji ? ' ' + esc(e.emoji) : '') + '</b></div>' + pilaAvatares() + '</div>' +
    '<p class="eye">' + fechaLarga(new Date()) + '</p><h1 class="sal">' + saludo() + (yoN ? ', ' + esc(yoN) : '') + '</h1>' +
    '</div>'; /* 1.5.1: sin la fila de resumen */
}

/* ---------- Compra: «6 unidades» y «Para preparar «Lentejas» el miércoles» ---------- */
function textoCantidad(c) {
  c = String(c || '').trim();
  if (/^\d+([.,]\d+)?$/.test(c)) return c + (c === '1' ? ' unidad' : ' unidades');
  return c;
}
function textoPara(p) {
  p = String(p || '').trim(); if (!p) return '';
  const m = p.match(/^(.*?)\s*·\s*(.+)$/);
  return m ? 'Para preparar «' + m[1] + '» el ' + m[2].toLowerCase() : 'Para ' + p;
}

Object.assign(window.RONDA, { seccionDe: seccionDe, colorFranja: colorFranja, textoCantidad: textoCantidad, textoPara: textoPara, resumenInicio: resumenInicio, ICONOS: ICONOS });

/* Más: cada sección con su color siempre (antes se cambiaban para no repetir al lado) */
coloresRejilla = prefs => prefs.slice();
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => setTimeout(ponerFranja, 50)); } catch (e) { }
