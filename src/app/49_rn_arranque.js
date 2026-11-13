/* ===================== DISEÑO NUEVO · arranque (pieza 05) =====================
   El círculo con los puntos y «Ronda», centrado con CSS en la pantalla física (sin medir texto: A4).
   Dura como mucho 0,75 s y se va con un fundido (A5). La animación propia del arranque llega en la tanda 8. */
/* ---------- Medidas de la pantalla abierta desde el icono (iOS 26) ----------
   1) Con la zona de la hora transparente, el iPhone deja la página más corta que la pantalla y abajo queda
      una franja vacía (0.1.0: barra blanca). Se mide cuánto falta y la app se alarga hasta abajo del todo.
   2) iOS difumina una banda debajo de la hora: el contenido empieza por debajo de esa banda. */
function rnMedir() {
  const r = document.documentElement.style;
  let falta = 0;
  try {
    const vert = innerHeight >= innerWidth, alto = vert ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
    const d = alto - innerHeight;
    /* 0.2.0: también se compara con el alto «grande» de la pantalla (100lvh), que en iOS 26 puede ser distinto */
    let lvh = 0; try { const pr = document.createElement('div'); pr.style.cssText = 'position:fixed;top:0;height:100lvh;width:1px;visibility:hidden'; document.body.appendChild(pr); lvh = pr.getBoundingClientRect().height; pr.remove(); } catch (e) { }
    const d2 = lvh - innerHeight;
    if (enIcono()) { const m = Math.max(d > 0 && d < 120 ? d : 0, d2 > 0 && d2 < 120 ? d2 : 0); falta = m; }
  } catch (e) { }
  r.setProperty('--abajo', falta + 'px');
  /* Lo que ocupa la raya de abajo del iPhone, para que nada quede debajo */
  r.setProperty('--pie', falta ? '34px' : 'env(safe-area-inset-bottom)');
  document.documentElement.classList.toggle('rn-icono', enIcono());
}
rnMedir();
window.addEventListener('resize', rnMedir);
window.addEventListener('orientationchange', () => setTimeout(rnMedir, 300));
/* Por si el iPhone no pinta la franja: el fondo del documento con el color de abajo de la pantalla */
function rnColorFondo() {
  const e = Nav.pila[0], osc = rnOscuro();
  document.documentElement.style.backgroundColor = osc ? '#0F1417' : e && e.id === 'inicio' ? '#E6F2D9' : e && e.id === 'ajustes' ? '#F7F8F9' : '#FFFFFF';
}
const _barra49 = Nav.barra;
Nav.barra = function () { _barra49.call(this); try { rnColorFondo(); } catch (x) { } };
/* 0.3.0: rnArrancar está en 52_rn_arranque.js (ejemplo o casa) */
/* Sin menú del iPhone al mantener pulsado (A2) */
document.addEventListener('contextmenu', ev => { if (ev.target.closest('.rn-barra,.rn-it,[data-lp]')) ev.preventDefault(); });
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aplicarTema); } catch (e) { }
document.addEventListener('visibilitychange', () => { if (!document.hidden) { aplicarTema(); if (Nav.actual() && !hojaAbierta) Nav.refrescar(); } });
