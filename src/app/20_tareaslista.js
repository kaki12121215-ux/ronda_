/* ===================== 1.4.3 · Tarjeta pequeña «Mis tareas» con casillas =====================
   Las tuyas y las de Todos sin hacer: primero las de hoy (y las que se han pasado), luego las que vienen y al final las sin fecha.
   Si hay muchas, la lista se desliza por dentro de la tarjeta con una barrita fina. */
function tareasMiasOrden() {
  const h = hoyISO();
  const g = t => !t.fecha ? 2 : t.fecha <= h ? 0 : 1;
  return lista('tareas').filter(t => mias(t) && !t.hecho).sort((a, b) => g(a) - g(b) || ((a.fecha || '') + (a.hora || '99')).localeCompare((b.fecha || '') + (b.hora || '99')) || (a.orden || 0) - (b.orden || 0));
}
const extraTarea = t => {
  const h = hoyISO();
  if (t.fecha && t.fecha < h) return '<small class="tlx pas">' + esc(fechaCortaTxt(t.fecha)) + '</small>';
  if (t.fecha === h) return t.hora ? '<small class="tlx">' + esc(t.hora) + '</small>' : '';
  if (t.fecha) return '<small class="tlx">' + esc(fechaCortaTxt(t.fecha)) + (t.hora ? ' · ' + esc(t.hora) : '') + '</small>';
  return '';
};
wd('tareasLista', 'Mis tareas en lista', 'Tareas', 'S', cLI, 'Tus tareas con su casilla. Si hay muchas, se desliza por dentro', () => {
  const l = tareasMiasOrden();
  return {
    vacio: !l.length,
    h: lab('Mis tareas', '<span class="tlc">' + l.length + '</span>') +
      (l.length ? '<div class="tlw"><div class="tls">' + l.map(t => '<div class="tlr it">' + wck(t.para === 'todos' ? 'var(--ink)' : colorDe(t.para), false, 'hacerTarea', 'data-id="' + t.id + '"') + '<button class="tlt" data-a="verTarea" data-id="' + t.id + '"><b>' + esc(t.titulo) + candado(t) + '</b>' + extraTarea(t) + '</button></div>').join('') + '</div><span class="tlbar"><i></i></span></div>'
        : '<p class="mu2">Nada pendiente</p>')
  };
});
W.tareasLista.ir = 'wTareasMias';
/* La barrita: alto y posición según lo que se ve de la lista */
function barraTareas(s) {
  const w = s.closest('.tlw'); if (!w) return;
  const bar = $('.tlbar', w), th = $('.tlbar i', w); if (!bar || !th) return;
  const sobra = s.scrollHeight - s.clientHeight;
  w.classList.toggle('hay', sobra > 2);
  if (sobra <= 2) return;
  const alto = Math.max(18, bar.clientHeight * s.clientHeight / s.scrollHeight);
  th.style.height = alto + 'px';
  th.style.transform = 'translateY(' + ((bar.clientHeight - alto) * s.scrollTop / sobra) + 'px)';
  w.classList.toggle('abajo', s.scrollTop >= sobra - 2);
}
document.addEventListener('scroll', ev => { const s = ev.target; if (s && s.classList && s.classList.contains('tls')) barraTareas(s); }, true);
new MutationObserver(() => { $$('.tls').forEach(s => { if (!s._tl) { s._tl = 1; requestAnimationFrame(() => barraTareas(s)); } }); }).observe(document.documentElement, { childList: true, subtree: true });
