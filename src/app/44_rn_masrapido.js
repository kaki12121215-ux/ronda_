/* ===================== DISEÑO NUEVO · mantener pulsado «Más» (de la 1.6.1 y la 1.7.0) =====================
   La misma lógica del gesto que 24_masrapido161.js, adaptada a la hoja «Secciones»:
   - Mantener pulsado «Más» 420 ms: la hoja sube sola, sin levantar el dedo.
   - Sin soltar, se arrastra hasta una sección: la de debajo se resalta (fondo y borde de su color).
   - Al soltar encima, se abre esa sección y la hoja se cierra. Al soltar fuera, la hoja se cierra sin más.
   - Mientras tanto: ni menú del iPhone, ni selección de texto, ni se mueve la pantalla de detrás (A2).
   - Solo existe donde hay barra de abajo. Sin vibración: la app de hoy no la tiene en este gesto.
   Un toque normal en «Más» sigue abriendo la hoja como siempre. */
const RN_MR = { t: null, x0: 0, y0: 0, activo: false, sobre: null, anular: false };
const rnMasDe = ev => ev.target && ev.target.closest && ev.target.closest('.rn-barra:not(.rn-oculta) .rn-tab[data-id="mas"]');
function rnMrAbrir() {
  RN_MR.activo = true; RN_MR.sobre = null; RN_MR.anular = true;
  rnSecciones();
  if (hojaAbierta) hojaAbierta.h.classList.add('rn-mr');
}
/* Resaltar la sección que hay debajo del dedo */
function rnMrMarcar(x, y) {
  if (!RN_MR.activo || !hojaAbierta) return;
  const el = document.elementFromPoint(x, y), b = el && el.closest && el.closest('.rn-hj .rn-sc');
  if (RN_MR.sobre && RN_MR.sobre !== b) RN_MR.sobre.classList.remove('rn-sob');
  if (b) b.classList.add('rn-sob');
  RN_MR.sobre = b;
  const g = $('.rn-secs', hojaAbierta.h); if (g) g.classList.toggle('rn-arrastra', !!b);
}
function rnMrSoltar() {
  if (!RN_MR.activo) return;
  RN_MR.activo = false;
  const b = RN_MR.sobre; RN_MR.sobre = null;
  /* Al soltar encima: la hoja se cierra siempre; si la sección aún no está, sale el aviso de su tanda */
  if (b && RN_LISTAS.indexOf(b.dataset.id) < 0) { cerrarHoja(); rnPendiente(b.dataset.id); }
  else if (b) ACC.rnSecElegir(b);
  else cerrarHoja();
  setTimeout(() => { RN_MR.anular = false; }, 400);
}
function rnMrCancelar() { clearTimeout(RN_MR.t); RN_MR.t = null; }
(function () {
  /* Dedo */
  document.addEventListener('touchstart', ev => {
    const m = rnMasDe(ev); if (!m || ev.touches.length !== 1) return;
    RN_MR.x0 = ev.touches[0].clientX; RN_MR.y0 = ev.touches[0].clientY;
    rnMrCancelar(); RN_MR.t = setTimeout(() => { RN_MR.t = null; rnMrAbrir(); }, 420);
  }, { passive: true });
  document.addEventListener('touchmove', ev => {
    const p = ev.touches[0];
    if (RN_MR.t) { if (Math.hypot(p.clientX - RN_MR.x0, p.clientY - RN_MR.y0) > 12) rnMrCancelar(); return; }
    /* Con la hoja abierta por el gesto: la pantalla de detrás no se mueve */
    if (RN_MR.activo) { ev.preventDefault(); rnMrMarcar(p.clientX, p.clientY); }
  }, { passive: false });
  document.addEventListener('touchend', ev => {
    rnMrCancelar();
    if (!RN_MR.activo) return;
    ev.preventDefault();
    rnMrSoltar();
  }, { passive: false });
  document.addEventListener('touchcancel', () => { rnMrCancelar(); if (RN_MR.activo) { RN_MR.activo = false; cerrarHoja(); } });
  /* Ratón (y pruebas): igual */
  document.addEventListener('mousedown', ev => { if (!rnMasDe(ev)) return; RN_MR.x0 = ev.clientX; RN_MR.y0 = ev.clientY; rnMrCancelar(); RN_MR.t = setTimeout(() => { RN_MR.t = null; rnMrAbrir(); }, 420); });
  document.addEventListener('mousemove', ev => { if (RN_MR.t && Math.hypot(ev.clientX - RN_MR.x0, ev.clientY - RN_MR.y0) > 12) rnMrCancelar(); if (RN_MR.activo) rnMrMarcar(ev.clientX, ev.clientY); });
  document.addEventListener('mouseup', () => { rnMrCancelar(); if (RN_MR.activo) rnMrSoltar(); });
  /* El toque que abrió la hoja con el gesto no puede abrirla otra vez ni elegir nada al soltar */
  document.addEventListener('click', ev => { if (RN_MR.anular && (rnMasDe(ev) || (ev.target.closest && ev.target.closest('.rn-velo,.rn-hj')))) { ev.stopPropagation(); ev.preventDefault(); RN_MR.anular = false; } }, true);
  /* Sin menú del iPhone sobre la barra (A2) */
  document.addEventListener('contextmenu', ev => { if (ev.target.closest && ev.target.closest('.rn-barra')) ev.preventDefault(); });
})();
Object.assign(window.RONDA || (window.RONDA = {}), { RN_MR: RN_MR });
