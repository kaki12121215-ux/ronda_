/* ===================== 0.3.0 · LA BARRA =====================
   Opaca: blanca en claro, oscura en oscuro. Orden: Inicio, sección 1, «+», sección 2, Más. Compra pasa a Más.
   - El «+» siempre gris claro neutro (#EEF1F3; oscuro #34404A) y no cambia de color al cambiar de pestaña.
   - La pestaña activa lleva el color de su sección; Inicio y las neutras (Ajustes…), gris medio B (#55636B; oscuro #65737B) con icono blanco.
   - Las dos secciones se eligen en Ajustes › Barra de abajo y se guardan SOLO en este móvil.
   - Mantener pulsado «Más» sigue funcionando (44_rn_masrapido.js busca .rn-barra .rn-tab[data-id="mas"]).
   - Al cambiar de pestaña, la pastilla de color se desliza de una a otra (con Reducir movimiento, sin moverse). */
const RN_BARRA_DEF = ['tareas', 'menu'];
const RN_BARRA_OK = k => RN_SEC[k] && ['ajustes', 'personas', 'buscar', 'inicio'].indexOf(k) < 0;
function rnBarra() {
  const l = locLeer().barra;
  const b = (Array.isArray(l) ? l : RN_BARRA_DEF).filter(RN_BARRA_OK);
  RN_BARRA_DEF.forEach(k => { if (b.length < 2 && b.indexOf(k) < 0) b.push(k); });
  return b.slice(0, 2);
}
const RN_NOM_BARRA = { menu: 'Menú', listasr: 'Listas', medicacion: 'Medicinas', documentos: 'Papeles' };
const rnNomTab = k => RN_NOM_BARRA[k] || rnCorto(k);
let RN_PILL_X = null;

Nav.barra = function () {
  let n = $('#nav');
  if (!n) { n = document.createElement('nav'); n.id = 'nav'; n.setAttribute('aria-label', 'Secciones'); document.body.appendChild(n); }
  const raiz = this.pila[0], top = this.actual();
  const fuera = !raiz || P[raiz.id].sinBarra || (top && (P[top.id].sinBarra || (!top.raiz && !P[top.id].rn)));
  if (fuera) { n.className = 'rn-barra rn-b5 rn-oculta'; try { rnColorFondo(); } catch (x) { } return; }
  const b = rnBarra(), tabs = [['inicio', 'inicio', 'Inicio'], [b[0], RN_SEC[b[0]][1], rnNomTab(b[0])], null, [b[1], RN_SEC[b[1]][1], rnNomTab(b[1])], ['mas', 'menu', 'Más']];
  const activa = tabs.some(x => x && x[0] === raiz.id) ? raiz.id : 'mas';
  const k = rnColorDe(raiz.id, raiz.params), gris = activa === 'inicio' || !k || k === 'neutro';
  n.className = 'rn-barra rn-b5';
  n.innerHTML = '<div class="rn-b5c"><i class="rn-pil' + (gris ? ' rn-pil-gris' : ' rn-k-' + k) + '"></i>' + tabs.map(x => x === null
    ? '<button class="rn-plus5" data-a="rnPlus" aria-label="Añadir">' + rnIc('anadir', 24, 2.2) + '</button>'
    : '<button class="rn-tab' + (x[0] === activa ? ' rn-on' + (gris ? ' rn-gris' : '') : '') + '" data-a="rnTab" data-id="' + x[0] + '" aria-label="' + x[2] + '"' + (x[0] === activa ? ' aria-current="page"' : '') + '><i>' + rnIc(x[1], 22, x[0] === activa ? 2.1 : 1.8) + '</i><span>' + x[2] + '</span></button>').join('') + '</div>';
  rnPildora(n);
  try { rnColorFondo(); } catch (x) { }
};
/* La pastilla: se coloca debajo de la pestaña activa; si ya estaba en otra, se desliza */
function rnPildora(n) {
  const on = $('.rn-tab.rn-on', n), pil = $('.rn-pil', n), c = $('.rn-b5c', n);
  if (!on || !pil || !c) return;
  const pon = () => { const x = on.offsetLeft; pil.style.width = on.offsetWidth + 'px'; return x; };
  const x = pon();
  if (RN_PILL_X === null || REDUCIR || RN_PILL_X === x) { pil.style.transform = 'translateX(' + x + 'px)'; RN_PILL_X = x; return; }
  pil.style.transition = 'none'; pil.style.transform = 'translateX(' + RN_PILL_X + 'px)';
  on.classList.add('rn-tarde');
  requestAnimationFrame(() => requestAnimationFrame(() => { pil.style.transition = ''; pil.style.transform = 'translateX(' + x + 'px)'; setTimeout(() => on.classList.remove('rn-tarde'), 160); }));
  RN_PILL_X = x;
}
window.addEventListener('resize', () => { RN_PILL_X = null; const n = $('#nav'); if (n && !n.classList.contains('rn-oculta')) rnPildora(n); });
ACC.rnTab = el => { if (RN_MR && RN_MR.anular) return; rnAbrir(el.dataset.id); };

/* El «+»: lo de la pantalla de arriba; si aquí no hay nada propio que añadir (Menú, Ajustes…), la hoja «Añadir» de Inicio */
ACC.rnPlus = () => {
  const e = Nav.actual(), r = Nav.pila[0];
  const d = (e && P[e.id].rnPlus) || (r && r === e && P[r.id].rnPlus);
  if (d) return d();
  const f = e && $('.fab', e.el); if (f) return f.click();
  P.inicio.rnPlus();
};

/* ---------- Ajustes › Barra de abajo ---------- */
P.barra = {
  rn: true,
  html: () => {
    const b = rnBarra(), op = RN_ORDEN_SEC.filter(RN_BARRA_OK);
    const vista = [['inicio', 'inicio', 'Inicio'], [b[0], RN_SEC[b[0]][1], rnNomTab(b[0])], null, [b[1], RN_SEC[b[1]][1], rnNomTab(b[1])], ['mas', 'menu', 'Más']];
    return rnTitulo('Barra de abajo', { atras: 'Ajustes' }) + '<p class="rn-txt rn-pie-txt">Inicio, el «+» y Más van fijos. Elige las dos secciones de los lados. Lo demás se abre desde Más. Se guarda en este móvil.</p>' +
      '<div class="rn-b5c rn-b5-vista">' + vista.map((x, i) => x === null ? '<span class="rn-plus5">' + rnIc('anadir', 24, 2.2) + '</span>' : '<span class="rn-tab' + (i === 1 || i === 3 ? ' rn-marca5' : '') + '"><i>' + rnIc(x[1], 22, 1.8) + '</i><span>' + x[2] + '</span></span>').join('') + '</div>' +
      '<div class="rn-cd">' + op.map(k => { const on = b.indexOf(k) >= 0; return '<button class="rn-rw rn-k-' + RN_SEC[k][2] + '" data-a="rnBarraTog" data-id="' + k + '" role="checkbox" aria-checked="' + on + '">' + rnChip(RN_SEC[k][1], 30) + '<span class="rn-t" style="flex:1">' + RN_SEC[k][0] + '</span><span class="rn-ck5' + (on ? ' rn-on' : '') + '">' + rnTick + '</span></button>'; }).join('') + '</div>' +
      '<p class="rn-txt rn-pie-txt" style="font-size:13px">Para elegir otra, quita antes una de las dos.</p>';
  }
};
ACC.rnBarraTog = el => {
  const k = el.dataset.id, g = locLeer().barra, b = (Array.isArray(g) ? g : rnBarra()).filter(RN_BARRA_OK).slice(0, 2), i = b.indexOf(k);
  if (i >= 0) b.splice(i, 1);
  else { if (b.length >= 2) return toast('Para elegir otra, quita antes una de las dos.'); b.push(k); }
  locPoner({ barra: b });
  RN_PILL_X = null; Nav.refrescar(true); Nav.barra();
};
