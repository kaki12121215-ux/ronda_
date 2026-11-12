/* ===================== 1.6.1 · Más rápido =====================
   Mantener pulsado «Más» en la barra de abajo, desde cualquier pantalla: sale una cuadrícula con todas las secciones.
   Se puede soltar encima de una para ir directo, o soltar fuera y tocar después. Un toque normal sigue abriendo Más. */
let MR = null;
let mrSoltarFuera = () => { };
function mrSecciones() {
  /* Solo las de la pestaña Más: las que ya están en la barra de abajo no salen */
  const enBarra = raices().map(x => x[0]);
  return Object.keys(MODS).filter(k => k !== 'buscar' && enBarra.indexOf(k) < 0).map(k => { const s = SECC[k], ci = s ? s[0] : MODS[k][2]; return [k, MODS[k][0], MODS[k][1], ci < 0 ? 6 : ci]; });
}
function mrAbrir(desde) {
  if (MR) return;
  const v = document.createElement('div'); v.id = 'mrapido';
  v.innerHTML = '<div class="mrv"></div><div class="mrc" role="dialog" aria-label="Ir a"><p>Ir a</p><div class="mrg">' + mrSecciones().map(x => '<button data-k="' + x[0] + '"><span style="color:' + (x[0] === 'mas' ? TINTA : COL[x[3]]) + '">' + ic(x[2], 26, x[3]) + '</span><b>' + esc(x[1]) + '</b></button>').join('') + '</div></div>';
  document.body.appendChild(v);
  const r = desde.getBoundingClientRect(), c = $('.mrc', v);
  c.style.setProperty('--ox', Math.max(0, r.left + r.width / 2 - c.getBoundingClientRect().left) + 'px');
  MR = { v: v, sobre: null };
  requestAnimationFrame(() => v.classList.add('ab'));
  v.addEventListener('click', ev => { const b = ev.target.closest('.mrg button'); if (b) mrIr(b.dataset.k); else if (!ev.target.closest('.mrc')) mrCerrar(); });
}
function mrCerrar() {
  if (!MR) return; const v = MR.v; MR = null;
  v.classList.remove('ab'); setTimeout(() => v.remove(), 220);
}
function mrIr(k) {
  mrCerrar();
  if (hojaAbierta) cerrarHoja(true);
  const enBarra = raices().some(x => x[0] === k);
  if (enBarra) Nav.raiz(k);
  else { if (Nav.actual().id !== 'mas') Nav.raiz('mas'); ACC.abrirMod({ dataset: { id: k } }); }
}
function mrMarcar(x, y) {
  if (!MR) return; const el = document.elementFromPoint(x, y), b = el && el.closest('.mrg button');
  if (MR.sobre && MR.sobre !== b) MR.sobre.classList.remove('sob');
  if (b) b.classList.add('sob'); MR.sobre = b;
}
(function () {
  let t = null, x0 = 0, y0 = 0, hecho = false;
  const masDe = ev => ev.target.closest && ev.target.closest('#nav [data-a="raiz"][data-id="mas"]');
  document.addEventListener('touchstart', ev => {
    const m = masDe(ev); if (!m) return;
    hecho = false; x0 = ev.touches[0].clientX; y0 = ev.touches[0].clientY;
    clearTimeout(t); t = setTimeout(() => { hecho = true; mrAbrir(m); }, 420);
  }, { passive: true });
  document.addEventListener('touchmove', ev => {
    const p = ev.touches[0];
    if (!hecho) { if (Math.hypot(p.clientX - x0, p.clientY - y0) > 12) clearTimeout(t); return; }
    if (MR) { ev.preventDefault(); mrMarcar(p.clientX, p.clientY); }
  }, { passive: false });
  document.addEventListener('touchend', ev => {
    clearTimeout(t);
    if (!hecho) return;
    ev.preventDefault();
    const b = MR && MR.sobre; if (b) mrIr(b.dataset.k); else mrSoltarFuera();
    setTimeout(() => { hecho = false; }, 60);
  }, { passive: false });
  document.addEventListener('contextmenu', ev => { if (masDe(ev)) ev.preventDefault(); });
  /* Con ratón (y en las pruebas): mantener pulsado también vale */
  document.addEventListener('mousedown', ev => { const m = masDe(ev); if (!m) return; hecho = false; clearTimeout(t); t = setTimeout(() => { hecho = true; mrAbrir(m); }, 420); });
  document.addEventListener('mouseup', () => clearTimeout(t));
  /* El toque que abre la cuadrícula no debe abrir además Más */
  document.addEventListener('click', ev => { if (hecho && masDe(ev)) { ev.stopPropagation(); ev.preventDefault(); hecho = false; } }, true);
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') mrCerrar(); });
})();

Object.assign(window.RONDA || (window.RONDA = {}), { mrAbrir: mrAbrir, mrCerrar: mrCerrar, mrIr: mrIr });
