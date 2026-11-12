/* ===================== 1.6.0 · Plantas: cuánta agua les queda =====================
   Arriba en Plantas, todas con su emoji, su nombre entero (dos líneas), su barra de agua y cuánto falta.
   Si no caben, se desliza de lado con una barrita. En rojo las que toca regar hoy. */
function nivelAgua(x) { const n = diasHasta(x.proximo); return n === null ? 1 : Math.max(0.06, Math.min(1, n / Math.max(1, x.cada || 1))); }
function faltaRiego(x) {
  const n = diasHasta(x.proximo);
  if (n === null) return '—';
  if (n <= 0) return 'Hoy';
  return n === 1 ? 'Mañana' : n + ' días';
}
function panelAgua() {
  const l = ordenAgua(lista('plantas'));
  if (!l.length) return '';
  const hoy = l.filter(x => tocaHoy('plantas', x)).length;
  return '<div class="card agp"><div class="agt"><b>Cuánta agua les queda</b><small>' + (hoy ? hoy + (hoy === 1 ? ' toca regar hoy' : ' toca regar hoy') : 'Todas regadas') + '</small></div>' +
    '<div class="agw"><div class="ags">' + l.map(x => { const t = tocaHoy('plantas', x); return '<button class="agi" data-a="rutVer" data-col="plantas" data-id="' + x.id + '">' + (x.emoji ? '<span class="agem">' + esc(x.emoji) + '</span>' : '<span class="agem">' + ic('modulo-plantas', 26, 3) + '</span>') + '<b>' + esc(x.nombre) + '</b><span class="agb"><i style="height:' + Math.round(100 * nivelAgua(x)) + '%' + (t ? ';background:#E0563C' : '') + '"></i></span><small' + (t ? ' class="r"' : '') + '>' + faltaRiego(x) + '</small></button>'; }).join('') + '</div><span class="agbar"><i></i></span></div></div>';
}
const _htmlRutina160 = htmlRutina;
htmlRutina = function (col) {
  const h = _htmlRutina160(col);
  if (col !== 'plantas') return h;
  const i = h.indexOf('<div class="list">');
  return i < 0 ? h : h.slice(0, i) + panelAgua() + h.slice(i);
};
/* La barrita de abajo del panel: ancho y posición según lo que se ve */
function barraAgua(s) {
  const w = s.closest('.agw'); if (!w) return;
  const th = $('.agbar i', w), bar = $('.agbar', w); if (!th || !bar) return;
  const sobra = s.scrollWidth - s.clientWidth;
  w.classList.toggle('hay', sobra > 2);
  if (sobra <= 2) return;
  const ancho = Math.max(24, bar.clientWidth * s.clientWidth / s.scrollWidth);
  th.style.width = ancho + 'px';
  th.style.transform = 'translateX(' + ((bar.clientWidth - ancho) * s.scrollLeft / sobra) + 'px)';
}
document.addEventListener('scroll', ev => { const s = ev.target; if (s && s.classList && s.classList.contains('ags')) barraAgua(s); }, true);
new MutationObserver(() => { $$('.ags').forEach(s => { if (!s._ag) { s._ag = 1; requestAnimationFrame(() => barraAgua(s)); } }); }).observe(document.documentElement, { childList: true, subtree: true });
Object.assign(window.RONDA || (window.RONDA = {}), { panelAgua: panelAgua, faltaRiego: faltaRiego, nivelAgua: nivelAgua });
