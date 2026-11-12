/* ===================== DISEÑO NUEVO · 0.2.0 · toda la app =====================
   - Todas las secciones se abren. Las que tienen JPG propio llevan su pantalla nueva (rn: true).
   - El resto de pantallas de dentro (formularios, detalles, ajustes…) usan su estructura de hoy, vestida con el diseño
     nuevo: clase rn-viejo en la página y el CSS de la 1.7.3 acotado a ellas, con los colores y piezas nuevos encima.
   - Al guardar una pantalla vieja de una sección, conserva el color de esa sección. */

/* Las pantallas nuevas */
['inicio', 'tareas', 'tareaVer', 'ajustes'].forEach(k => { P[k].rn = true; });
/* Qué sección es cada pantalla (para su color) */
function rnSecDe(id, params) {
  if (RN_SEC[id]) return id;
  if (id === 'rutina') return (params && params.col) || 'plantas';
  if (id === 'listar') return 'listasr';
  if (id === 'mas') return 'ajustes';
  const s = typeof PAG_SEC !== 'undefined' ? PAG_SEC[id] : null;
  if (s === 'mas') return 'ajustes';
  return s && RN_SEC[s] ? s : null;
}
const rnColorDe = (id, params) => { if (id === 'inicio') return ''; const s = rnSecDe(id, params); return s ? RN_SEC[s][2] : 'neutro'; };
/* Abrir una sección desde la barra o la hoja: siempre como pantalla de la barra */
function rnAbrir(k) {
  if (k === 'mas') return rnSecciones();
  if (!P[k]) return toast('Esta pantalla no existe en la prueba.');
  const e = Nav.actual();
  if (Nav.pila.length === 1 && e && e.id === k) { $('.pgc', e.el).scrollTo({ top: 0, behavior: 'smooth' }); return; }
  Nav.raiz(k);
}
ACC.rnSecElegir = el => { const k = el.dataset.id; cerrarHoja(); setTimeout(() => rnAbrir(k), 120); };
ACC.rnBuscar = () => { cerrarHoja(); setTimeout(() => Nav.ir('buscar', {}), 120); };
ACC.ir = el => { const p = Object.assign({}, el.dataset); delete p.a; delete p.id; if (!P[el.dataset.id]) return toast('Esta pantalla no existe en la prueba.'); Nav.ir(el.dataset.id, p); };
ACC.rnAjPend = el => { const d = el && el.dataset && el.dataset.ir; if (d && P[d]) Nav.ir(d, {}); };
/* Al mantener pulsado «Más» también se abre cualquier sección */
function rnMrSoltar() {
  if (!RN_MR.activo) return;
  RN_MR.activo = false;
  const b = RN_MR.sobre; RN_MR.sobre = null;
  if (b) ACC.rnSecElegir(b); else cerrarHoja();
  setTimeout(() => { RN_MR.anular = false; }, 400);
}

/* Pintar: las pantallas viejas con su flecha de volver como antes */
Nav.contenido = function (e) {
  this.pintando = e;
  try {
    let h = P[e.id].html(e.params, e);
    if (!P[e.id].rn) {
      if (!e.raiz && this.pila.length && String(h).indexOf('data-a="atras"') < 0) h = tope('') + h;
      if (String(h).indexOf('class="top"') > 0) { const t = document.createElement('template'); t.innerHTML = h; const tp = [...t.content.children].find(x => x.classList.contains('top')); if (tp && t.content.firstElementChild !== tp) { t.content.insertBefore(tp, t.content.firstChild); h = t.innerHTML; } }
    }
    return h;
  } catch (x) { anotar('pintar ' + e.id, x); return '<div class="rn-cd rn-gl"><p class="rn-txt" style="padding:6px 0 12px">No he podido pintar esta pantalla: ' + esc(x.message) + '</p></div>'; }
};
Nav.crear = function (id, params, raiz) {
  const e = _crear40.call(this, id, params, raiz);
  e.el.classList.remove('rn-sec', 'rn-aj', 'rn-ini');
  [...e.el.classList].filter(c => /^rn-k-/.test(c)).forEach(c => e.el.classList.remove(c));
  const k = rnColorDe(id, params);
  e.el.classList.add('rn-pg', id === 'inicio' ? 'rn-ini' : k === 'neutro' && !/^(buscar)$/.test(id) ? 'rn-aj' : 'rn-sec');
  if (k) e.el.classList.add('rn-k-' + k);
  if (!P[id].rn) e.el.classList.add('rn-viejo');
  return e;
};
/* Una pantalla nueva que en una pestaña usa la de hoy (Agenda Semana, Gastos fijos…) */
function rnModoViejo(si) { const e = Nav.pintando; if (e && e.el) e.el.classList.toggle('rn-viejo', !!si); }
/* El icono de sección que la 1.5 ponía junto al título: no va en el diseño nuevo */
function iconoCabecera() { return ''; }

/* Barra: se ve en las pantallas de la barra y en las de dentro nuevas; en las de dentro viejas (con sus botones abajo), no */
const _barra46 = Nav.barra;
Nav.barra = function () {
  const top = this.actual();
  const n = $('#nav');
  if (top && !top.raiz && !P[top.id].rn) { if (n) n.classList.add('rn-oculta'); return; }
  _barra46.call(this);
  const raiz = this.pila[0];
  if (!raiz || !n) return;
  const k = rnColorDe(raiz.id, raiz.params);
  n.className = n.className.replace(/rn-k-\w+/g, '').replace(/rn-neutra/g, '') + (k && k !== 'neutro' ? ' rn-k-' + k : ' rn-neutra');
  /* «+» solo donde hay algo que añadir */
  const plus = P[raiz.id].rnPlus || (!P[raiz.id].rn && P[raiz.id].fijo && /class="fab"/.test(String(P[raiz.id].fijo(raiz.params, raiz) || '')));
  if (!plus && $('.rn-plus', n)) { $('.rn-plus', n).remove(); n.classList.add('rn-sin-plus'); }
};
/* El «+»: el de la pantalla nueva o, en una vieja, el botón «+» que tenía */
ACC.rnPlus = () => {
  const e = Nav.actual(), r = Nav.pila[0];
  const d = (e && P[e.id].rnPlus) || (r && P[r.id].rnPlus);
  if (d) return d();
  const f = e && $('.fab', e.el); if (f) f.click();
};
