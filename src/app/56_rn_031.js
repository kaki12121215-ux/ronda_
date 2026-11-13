/* ===================== 0.3.1 · arreglos tras probar la 0.3.0 en el iPhone, conectada a la casa =====================
   1. Documentos cifrados: en un móvil sin documentos, pedir el código daba «g.hasta». Ahora va a «Clave de documentos».
   2. Listas: un doble toque al crear una lista la creaba dos veces (salía «Maleta» repetida).
   3. Notas: con el teclado abierto, la nota y la barra de formato se quedan encima del teclado y se ve lo que escribes.
   4. La barra: la mancha de color ya no se desliza desde Inicio cada vez que se repinta.
   5. Arranque: sin el rato en blanco; la palabra se ve desde el primer momento y la barra entra a la vez que Inicio. */
let RN_ARRANCANDO = true;

/* ---------- 1. Documentos cifrados ---------- */
ACC.rnDocsAbrir = () => pedirClave(() => Nav.refrescar(true));
const _pin56 = ACC.pinTecla;
ACC.pinTecla = async el => {
  const p = Nav.actual().params;
  if (!p.nuevo && !(await DB.get('docs:' + S.sid))) { p.v = ''; Nav.atras(); setTimeout(() => Nav.ir('docClave', { seguir: p.seguir }), 360); return; }
  return _pin56(el);
};

/* ---------- 2. Sin listas dobles por un doble toque ---------- */
const rnUnaVez = f => { let t = 0; return function () { if (Date.now() - t < 2000) return; t = Date.now(); return f.apply(this, arguments); }; };
ACC.listaRPlant = rnUnaVez(ACC.listaRPlant);
ACC.listaRCrear = rnUnaVez(ACC.listaRCrear);

/* ---------- 3. Notas con el teclado: la pantalla mide lo que queda visible y la barra de formato va encima del teclado ---------- */
(function () {
  const vv = window.visualViewport; if (!vv) return;
  const r = document.documentElement;
  const f = () => {
    const ae = document.activeElement, ed = !!(ae && (ae.isContentEditable || (/INPUT|TEXTAREA/.test(ae.tagName) && !/range|file|checkbox|radio/.test(ae.type))));
    const kb = Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop)), a = Nav.actual();
    const nota = !!(a && a.id === 'nota' && ed && (kb > 80 || vv.height < innerHeight - 80));
    r.classList.toggle('rn-kb-nota', nota);
    if (nota) { r.style.setProperty('--vvh', Math.round(vv.height) + 'px'); r.style.setProperty('--vvy', Math.round(vv.offsetTop) + 'px'); }
    if (ae && ae.isContentEditable) r.classList.toggle('conteclado', kb > 80);
    if (nota) requestAnimationFrame(rnCursorVisible);
  };
  vv.addEventListener('resize', f); vv.addEventListener('scroll', f);
  document.addEventListener('focusin', () => setTimeout(f, 60)); document.addEventListener('focusout', () => setTimeout(f, 80));
  document.addEventListener('selectionchange', () => { if (r.classList.contains('rn-kb-nota')) rnCursorVisible(); });
  document.addEventListener('input', () => { if (r.classList.contains('rn-kb-nota')) rnCursorVisible(); });
})();
/* Lo que escribes, siempre a la vista: entre la cabecera y la barra de formato */
function rnCursorVisible() {
  const a = Nav.actual(); if (!a || a.id !== 'nota') return;
  const s = getSelection(); if (!s || !s.rangeCount) return;
  let rc = null; try { const rs = s.getRangeAt(0).getClientRects(); rc = rs.length ? rs[rs.length - 1] : s.getRangeAt(0).startContainer.parentElement.getBoundingClientRect(); } catch (e) { return; }
  if (!rc) return;
  const pg = $('.pgc', a.el), tb = $('.tbar', a.el); if (!pg) return;
  const pr = pg.getBoundingClientRect(), abajo = (tb ? tb.getBoundingClientRect().top : pr.bottom) - 18, arriba = pr.top + 70;
  if (rc.bottom > abajo) pg.scrollTop += rc.bottom - abajo; else if (rc.top < arriba) pg.scrollTop -= arriba - rc.top;
}

/* ---------- 4. La mancha de la barra, sin deslizarse cuando no cambia de pestaña ---------- */
function rnPildora(n) {
  const on = $('.rn-tab.rn-on', n), pil = $('.rn-pil', n), c = $('.rn-b5c', n);
  if (!on || !pil || !c) return;
  const x = on.offsetLeft, w = on.offsetWidth;
  const quieta = RN_PILL_X === null || REDUCIR || RN_PILL_X === x || !x;
  pil.style.transition = 'none';
  pil.style.width = w + 'px';
  pil.style.transform = 'translateX(' + (quieta ? x : RN_PILL_X) + 'px)';
  pil.getBoundingClientRect();
  pil.style.transition = '';
  if (!quieta) { on.classList.add('rn-tarde'); requestAnimationFrame(() => { pil.style.transform = 'translateX(' + x + 'px)'; setTimeout(() => on.classList.remove('rn-tarde'), 160); }); }
  if (x) RN_PILL_X = x;
}
