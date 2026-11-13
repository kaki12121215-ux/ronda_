/* ===================== 0.3.0 · TODAS LAS PANTALLAS CON EL DISEÑO NUEVO =====================
   Las pantallas de dentro que todavía usan la estructura de hoy (formularios, detalles, ajustes…) salen con las piezas nuevas:
   - Arriba, la flecha con el nombre de la pantalla de la que vienes y el título grande (como en los JPG), no la barra fina de antes.
   - Las personas, con su inicial en su color (o su foto), no la silueta de antes.
   - Las ilustraciones, en su versión oscura cuando toca.
   - En las neutras (Ajustes y lo de dentro), fondo claro liso y tarjetas blancas planas; en las de una sección, su color.
   El resto del traje está en diseno030.css (.rn-viejo). */

/* ---------- Las personas, siempre con el avatar nuevo ---------- */
function av(p, s) { return rnAv(p && (p.nombre || p.color) ? p : { nombre: (p && p.nombre) || '?', color: (p && p.color) || '#9FB0B8' }, s || 44); }

/* ---------- Ilustraciones: la oscura en modo oscuro, en todas partes ---------- */
(function () {
  const claras = Object.assign({}, ILUS);
  Object.keys(claras).forEach(k => Object.defineProperty(ILUS, k, { get: () => (rnOscuro() && ILUS_OSC[k]) || claras[k], configurable: true, enumerable: true }));
})();

/* ---------- Cabecera nueva para las pantallas de hoy ---------- */
function rnNombreAtras(e) {
  const i = Nav.pila.indexOf(e), prev = i > 0 ? Nav.pila[i - 1] : i < 0 ? Nav.actual() : null;
  if (!prev) return 'Atrás';
  let t = '';
  try { const h = prev.el && prev.el.querySelector('.rn-tit h1, .hd h1'); t = h ? h.textContent.trim() : ''; } catch (x) { }
  if (!t) t = prev.id === 'inicio' ? 'Inicio' : RN_SEC[prev.id] ? RN_SEC[prev.id][0] : 'Atrás';
  return t.length > 20 ? 'Atrás' : t;
}
const _cont54 = Nav.contenido;
Nav.contenido = function (e) {
  const h = _cont54.call(this, e);
  if (P[e.id].rn || String(h).indexOf('class="top"') < 0) return h;
  try {
    const t = document.createElement('template'); t.innerHTML = h;
    const tp = t.content.querySelector('.top'); if (!tp) return h;
    const RN_TIT = { estadisticas: 'Estadísticas', mas: 'Más', comprobaciones: 'Comprobaciones', acerca: 'Acerca de Ronda' };
    const b = tp.querySelector(':scope > b'), tit = (b ? b.textContent.trim() : '') || RN_TIT[e.id] || '';
    const rt = tp.querySelector('.rt'), der = rt ? rt.innerHTML.trim() : '';
    const hayHd = !!t.content.querySelector('.hd h1');
    const atras = rnNombreAtras(e);
    const n = document.createElement('template');
    n.innerHTML = hayHd || !tit
      ? '<div class="rn-atras"><button class="rn-atrasb" data-a="atras" aria-label="Volver a ' + esc(atras) + '">' + rnIc('atras', 22, 2) + '<span>' + esc(atras) + '</span></button>' + (der ? '<div class="rn-titd rn-viejo-der">' + der + '</div>' : '') + '</div>'
      : rnTitulo(esc(tit), { atras: esc(atras), der: der ? '<span class="rn-viejo-der">' + der + '</span>' : '' });
    tp.replaceWith(n.content);
    return t.innerHTML;
  } catch (x) { anotar('cabecera ' + e.id, x); return h; }
};

