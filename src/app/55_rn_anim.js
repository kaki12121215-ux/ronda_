/* ===================== 0.3.0 · LAS ANIMACIONES (ronda_animaciones_ficha.md) =====================
   Curvas: entrar cubic-bezier(.2,0,0,1) · muelle cubic-bezier(.2,.9,.25,1.04) · salir cubic-bezier(.4,0,1,1).
   Lo que se va es más rápido que lo que llega. Solo transform y opacity (salvo excepciones cortas).
   El cambio de claro a oscuro no se anima. Con «Reducir movimiento», fundidos de 150 ms. Las tiempos están en diseno030.css. */

/* ---------- Claro ↔ oscuro: sin animación ---------- */
const _tema55 = aplicarTema;
aplicarTema = function () {
  const r = document.documentElement; r.classList.add('rn-sin-trans');
  try { _tema55.apply(this, arguments); } finally { requestAnimationFrame(() => requestAnimationFrame(() => r.classList.remove('rn-sin-trans'))); }
};

/* ---------- Avisos: entran con muelle; 5 s con botón, 2,5 s solo texto; el de error se queda hasta que se toca ---------- */
let RN_AV_T = null;
function toast(msg, accion, fn, icono) {
  const capa = $('#capa'); if (!capa) return;
  $$('.rn-aviso', capa).forEach(t => { t.classList.remove('rn-ver'); t.classList.add('rn-sale'); setTimeout(() => t.remove(), 240); });
  const error = icono === 'aviso';
  const t = document.createElement('div');
  t.className = 'rn-aviso' + (error ? ' rn-mal' : '');
  t.setAttribute('role', error ? 'alert' : 'status');
  t.innerHTML = (icono ? '<span class="rn-avi">' + (icono === 'hecho' ? rnTick : rnIc(icono, 20, 2.2)) + '</span>' : '') + '<span class="rn-avt">' + esc(msg) + '</span>' + (accion ? '<button class="rn-ava">' + esc(accion) + '</button>' : error ? '<button class="rn-ava rn-avx" aria-label="Cerrar">' + rnIc('cerrar', 18, 2.2) + '</button>' : '');
  capa.appendChild(t);
  const quitar = () => { clearTimeout(RN_AV_T); t.classList.remove('rn-ver'); t.classList.add('rn-sale'); setTimeout(() => t.remove(), 240); };
  if (accion) $('button', t).addEventListener('click', () => { quitar(); fn(); });
  else if (error) t.addEventListener('click', quitar);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('rn-ver')));
  clearTimeout(RN_AV_T);
  if (!error) RN_AV_T = setTimeout(quitar, accion ? 5000 : 2500);
}

/* ---------- Al llegar a una sección (desde la barra o Más): los bloques entran escalonados. No al volver ni al refrescar. ---------- */
const _raiz55 = Nav.raiz;
Nav.raiz = function (id, params) {
  const r = _raiz55.call(this, id, params);
  const e = this.pila[0];
  if (e && e.el && !REDUCIR && !RN_ARRANCANDO) {
    e.el.classList.add('rn-llega');
    $$('.pgc > *', e.el).slice(0, 6).forEach((b, i) => b.style.setProperty('--rn-i', i));
    setTimeout(() => { if (e.el) e.el.classList.remove('rn-llega'); }, 1300);
  }
  return r;
};

/* ---------- Marcar: la casilla salta, la marca se dibuja, el texto se tacha; la fila se recoge pasados 700 ms ---------- */
document.addEventListener('click', ev => {
  const c = ev.target.closest && ev.target.closest('.rn-ck');
  if (!c) return;
  const f = c.closest('.rn-it, .rn-rw');
  c.classList.add('rn-recien'); if (f) f.classList.add('rn-recien');
  setTimeout(() => { c.classList.remove('rn-recien'); if (f) f.classList.remove('rn-recien'); }, 1200);
}, true);

/* ---------- Mantener pulsado «Más»: la pestaña se encoge poco a poco mientras espera ---------- */
document.addEventListener('touchstart', ev => { const m = ev.target.closest && ev.target.closest('.rn-b5 .rn-tab[data-id="mas"]'); if (m) m.classList.add('rn-espera'); }, { passive: true });
['touchend', 'touchcancel'].forEach(t => document.addEventListener(t, () => $$('.rn-tab.rn-espera').forEach(x => x.classList.remove('rn-espera')), { passive: true }));

/* ---------- El «+» gira a «×» mientras está abierta la hoja que ha abierto ---------- */
const _plus55 = ACC.rnPlus;
ACC.rnPlus = el => {
  const r = _plus55(el);
  setTimeout(() => { if (hojaAbierta && !RN_MAS_ABIERTA) { const p = $('.rn-plus5'); if (p) { p.classList.add('rn-x45'); const o = hojaAbierta.alCerrar; hojaAbierta.alCerrar = () => { p.classList.remove('rn-x45'); if (o) o(); }; } } }, 30);
  return r;
};

/* ---------- Filtros de Tareas: la píldora elegida se desliza ---------- */
function rnPildoraFiltro(cont) {
  const on = cont && $('.rn-on', cont); if (!on) return;
  let p = $('.rn-flp', cont); const nueva = !p;
  if (!p) { p = document.createElement('i'); p.className = 'rn-flp'; cont.insertBefore(p, cont.firstChild); }
  const ant = cont.dataset.x ? JSON.parse(cont.dataset.x) : null, x = [on.offsetLeft, on.offsetWidth];
  if (ant && !REDUCIR && (ant[0] !== x[0] || ant[1] !== x[1])) { p.style.transition = 'none'; p.style.transform = 'translateX(' + ant[0] + 'px)'; p.style.width = ant[1] + 'px'; p.getBoundingClientRect(); p.style.transition = ''; }
  p.style.transform = 'translateX(' + x[0] + 'px)'; p.style.width = x[1] + 'px';
  cont.dataset.x = JSON.stringify(x); cont.classList.add('rn-fl-p');
}
let RN_FL_X = null;
const _tras55 = P.tareas.tras;
P.tareas.tras = function (el, p) {
  if (_tras55) _tras55.call(this, el, p);
  const c = $('.rn-fl', el); if (!c) return;
  if (RN_FL_X) c.dataset.x = RN_FL_X;
  rnPildoraFiltro(c); RN_FL_X = c.dataset.x;
};
if (!P.tareas.montar) P.tareas.montar = function (el, p) { P.tareas.tras(el, p); };

/* ---------- Código de 4 cifras: cada punto salta al llenarse; si está mal, la fila tiembla ---------- */
/* Al refrescar tras un código mal puesto, la fila de puntos tiembla (el mensaje «Código incorrecto» lo pone 11_documentos.js) */
const _cont55 = Nav.contenido;
Nav.contenido = function (e) {
  let h = _cont55.call(this, e);
  if (/Código incorrecto/.test(h) && h.indexOf('class="pin"') >= 0) h = h.replace('class="pin"', 'class="pin rn-tiembla"');
  return h;
};

/* ---------- Volver: lo mismo al revés, más rápido (240 ms, ease-out) ---------- */
const _atras55 = Nav.atras;
Nav.atras = function (n) {
  const ps = this.pila.slice(-((n || 1) + 1));
  ps.forEach(p => p.el && p.el.classList.add('rn-volviendo'));
  const r = _atras55.apply(this, arguments);
  setTimeout(() => ps.forEach(p => p.el && p.el.classList.remove('rn-volviendo')), 400);
  return r;
};

/* ---------- Dilo (el panel de la app de hoy): con el traje nuevo, en la capa de arriba ---------- */
const _diloAbrir55 = Dilo.abrir;
Dilo.abrir = function (modo) {
  const r = _diloAbrir55.call(this, modo);
  /* 0.3.1: se queda en la capa de arriba (#capa), con su propio estilo; dentro, las piezas de hoy acotadas (.rn-capas) */
  if (this.el) { this.el.classList.add('rn-capas', 'rn-dilo-p'); this.velo.classList.add('rn-dilo-v'); }
  return r;
};
/* Al elegir una sección en la hoja, la celda se resalta 160 ms y luego la hoja baja */
const _secElegir55 = ACC.rnSecElegir;
ACC.rnSecElegir = el => { if (el && el.classList) el.classList.add('rn-sob'); setTimeout(() => _secElegir55(el), REDUCIR ? 0 : 160); };
/* Mientras algo se mueve, sin desenfoque (el cristal es caro) */
function rnMoviendo(ms) { const r = document.documentElement; r.classList.add('rn-moviendo'); clearTimeout(rnMoviendo.t); rnMoviendo.t = setTimeout(() => r.classList.remove('rn-moviendo'), ms || 450); }
['ir', 'atras', 'raiz'].forEach(k => { const f = Nav[k]; Nav[k] = function () { rnMoviendo(); return f.apply(this, arguments); }; });
const _hoja55 = abrirHoja;
abrirHoja = function () { rnMoviendo(480); return _hoja55.apply(this, arguments); };
