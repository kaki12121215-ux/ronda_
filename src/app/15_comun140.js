/* ============================ 1.4.0 · PIEZAS COMUNES ============================
   Frecuencia personalizada, casilla de emoji, actividad (quién ha cambiado qué), gráficas y avatares pequeños. */

/* ---------- Frecuencia: las de siempre + «Personalizado» (un número y la unidad) ---------- */
const UNIDADES = [['d', 'día', 'días', 1], ['s', 'semana', 'semanas', 7], ['m', 'mes', 'meses', 30.44], ['a', 'año', 'años', 365.25]];
const uni = u => UNIDADES.find(x => x[0] === u) || UNIDADES[0];
function sumarU(d, n, u) {
  const x = new Date(d); n = Math.max(1, Number(n) || 1);
  if (u === 'm') x.setMonth(x.getMonth() + n);
  else if (u === 'a') x.setFullYear(x.getFullYear() + n);
  else x.setDate(x.getDate() + n * (u === 's' ? 7 : 1));
  return x;
}
const textoU = (n, u) => { n = Number(n) || 1; const U = uni(u); return n === 1 ? (U[0] === 's' || U[0] === 'a' ? 'Cada ' + U[1] : 'Cada ' + U[1]) : 'Cada ' + n + ' ' + U[2]; };
const diasU = (n, u) => Math.max(1, Math.round((Number(n) || 1) * uni(u)[3]));
function proximasU(desde, n, u, k) {
  const out = []; let d = deISO(desde) || hoy0();
  for (let i = 0; i < (k || 3); i++) { d = sumarU(d, n, u); out.push(d.getDate() + ' ' + MESES[d.getMonth()].slice(0, 3)); }
  return out.join(' · ');
}
/* Bloque del «Personalizado». Lee y escribe e.params.fqN y e.params.fqU de la pantalla actual. */
function bloqueFrecuencia(p, desde, unidades) {
  const n = Number(p.fqN) || 1, u = p.fqU || 'd';
  return '<div class="cus"><div class="cada2"><span>Cada</span><button class="stp" data-a="fqMas" data-v="-1" aria-label="Menos">−</button><b class="num2">' + n + '</b><button class="stp" data-a="fqMas" data-v="1" aria-label="Más">+</button></div>' +
    '<div class="unt">' + UNIDADES.filter(x => !unidades || unidades.indexOf(x[0]) >= 0).map(x => '<button class="' + (x[0] === u ? 'on' : '') + '" data-a="fqU" data-v="' + x[0] + '">' + (n === 1 ? x[1] : x[2]) + '</button>').join('') + '</div>' +
    (desde ? '<p class="k" style="margin-top:10px">Próximas: ' + proximasU(desde, n, u) + '</p>' : '') + '</div>';
}
ACC.fqMas = el => { const e = Nav.actual(); guardarCampos(e); e.params.fqN = Math.max(1, Math.min(99, (Number(e.params.fqN) || 1) + Number(el.dataset.v))); Nav.refrescar(true); };
ACC.fqU = el => { const e = Nav.actual(); guardarCampos(e); e.params.fqU = el.dataset.v; Nav.refrescar(true); };

/* ---------- Emoji: un cuadrado a la izquierda del nombre ---------- */
function primerEmoji(t) {
  t = String(t || '').trim(); if (!t) return '';
  let g = [];
  try { g = Array.from(new Intl.Segmenter('es', { granularity: 'grapheme' }).segment(t)).map(x => x.segment); } catch (e) { g = Array.from(t); }
  const x = g.find(s => /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(s));
  return x || '';
}
const campoEmoji = (id, v) => '<label class="emb' + (v ? ' lleno' : '') + '"><input id="' + id + '" value="' + esc(v || '') + '" maxlength="16" autocomplete="off" aria-label="Emoji" enterkeyhint="done"><span class="emph">' + ic('anadir', 20) + '</span></label>';
const filaNombreEmoji = (idE, vE, campo) => '<div class="emrow">' + campoEmoji(idE, vE) + '<div class="f">' + campo + '</div></div>';
const emo = (e, alt, s) => e ? '<span class="emo" style="' + (s ? 'width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s * 0.55) + 'px' : '') + '">' + esc(e) + '</span>' : (alt || '');
/* Al escribir en la casilla, se queda solo el primer emoji. */
document.addEventListener('input', ev => {
  const i = ev.target; if (!i || !i.closest || !i.closest('.emb')) return;
  const e = primerEmoji(i.value);
  if (i.value !== e) i.value = e;
  i.closest('.emb').classList.toggle('lleno', !!e);
  if (e) i.blur();
}, true);

/* ---------- Avatar pequeño de quien tiene una tarea; «Todos» si es de los dos ---------- */
const avQuien = (id, s) => id === 'todos' ? '<span class="tdo">Todos</span>' : (dato('personas', id) ? av(dato('personas', id), s || 28) : '');

/* ---------- Actividad: quién ha cambiado qué (últimos 30 días) ---------- */
const COLNOM = { compra: 'Compra', tareas: 'Tareas', movs: 'Gastos', fijos: 'Gastos fijos', cuentas: 'Cuentas', notas: 'Notas', menu: 'Menú', plantas: 'Plantas', acuario: 'Acuario', medicacion: 'Medicación', coche: 'Coches', coches: 'Coches', documentos: 'Documentos', turnos: 'Turnos', listasr: 'Listas', medidas: 'Acuario', acfotos: 'Acuario', tarjetas: 'Tarjetas', pagos: 'Pagos', listas: 'Compra', platos: 'Menú' };
const SIN_ACT = ['actividad', 'personas', 'ajustes', 'aprendido', 'espacio', 'categorias', 'resumen', 'compartidas', 'pagos'];
const CAMPOS_MUDOS = ['calPend', 'evId', 'orden', 'veces', 'cal', 'aviso', 'por', 'editada', 'vista', 'ultUso'];
const ACT_RECIENTE = {};
function nombreRegistro(col, f) {
  if (col === 'menu') return 'el menú';
  if (col === 'medidas') return 'medidas del ' + fechaCortaTxt(f.fecha || hoyISO());
  return f.nombre || f.titulo || f.concepto || (f.texto ? String(f.texto).split('\n')[0].slice(0, 40) : '') || '';
}
function registrarActividad(col, id, campos, previo) {
  if (!S.cfg || SIN_ACT.indexOf(col) >= 0 || !COLNOM[col]) return;
  const ks = Object.keys(campos);
  if (!ks.length || ks.every(k => CAMPOS_MUDOS.indexOf(k) >= 0)) return;
  const antes = previo ? previo.f : null, todo = Object.assign({}, antes || {}, campos);
  let acc = 'c';
  if (campos._b === 1) acc = 'b'; else if (campos._b === 0) acc = 'r';
  else if (!antes || antes._b) acc = 'n';
  else if (col === 'compra' && campos.hecho === true) acc = 'k';
  else if (col === 'tareas' && campos.hecho === true) acc = 'h';
  else if (col === 'fijos' && campos.pagos && (campos.pagos.length > ((antes.pagos || []).length))) acc = 'p';
  else if (['plantas', 'acuario', 'medicacion'].indexOf(col) >= 0 && campos.ultima) acc = 'h';
  else if (col === 'turnos' && campos.hist) acc = 'h';
  const txt = nombreRegistro(col, todo);
  /* Lo mismo varias veces seguidas (escribir, ajustar): una sola línea. */
  const clave = col + '|' + id + '|' + acc, ya = ACT_RECIENTE[clave];
  const aid = ya && Date.now() - ya.t < 90000 ? ya.id : 'a' + uid();
  ACT_RECIENTE[clave] = { id: aid, t: Date.now() };
  const r = { q: S.cfg.persona, col: col, ref: id, acc: acc, txt: String(txt).slice(0, 80), cuando: Date.now() };
  if (col === 'fijos' && acc === 'p') r.imp = Number(todo.importe) || 0;
  if (col === 'movs' && acc === 'n') r.imp = Number(todo.importe) || 0;
  if (col === 'menu') r.txt = 'el menú de la semana';
  _cambiarBase('actividad', aid, r);
}
const _cambiarBase = cambiar;
cambiar = function (col, id, campos) {
  try { registrarActividad(col, id, campos, S.recs[col] && S.recs[col][id]); } catch (e) { anotar('actividad', e); }
  _cambiarBase(col, id, campos);
};
const VERBO = { n: 'ha añadido', b: 'ha borrado', r: 'ha recuperado', c: 'ha cambiado', k: 'ha comprado', h: 'ha hecho', p: 'ha pagado' };
function textoActividad(a) {
  const q = nombreDe(a.q) || 'Alguien';
  if (a.col === 'pagos' || (a.col === 'movs' && a.tarjeta)) return 'Pago de ' + esc(a.txt);
  return esc(q) + ' ' + VERBO[a.acc || 'c'] + (a.txt ? ' «' + esc(a.txt) + '»' : '') + (a.imp ? ' · ' + euros(a.imp) : '');
}
function actividades(dias) {
  const lim = Date.now() - (dias || 30) * 86400000;
  return lista('actividad').filter(a => (a.cuando || 0) >= lim).sort((a, b) => b.cuando - a.cuando);
}
/* Limpieza: lo de más de 30 días se borra (una vez al día, en este móvil). */
function limpiarActividad() {
  try { const k = 'rondaP-actlimpia', h = hoyISO(); if (localStorage.getItem(k) === h) return; localStorage.setItem(k, h); } catch (e) { return; }
  const lim = Date.now() - 31 * 86400000;
  Object.keys(S.recs.actividad || {}).forEach(id => { const f = S.recs.actividad[id].f; if (!f._b && (f.cuando || 0) < lim) _cambiarBase('actividad', id, { _b: 1 }); });
}
/* «Añadido por Ru hace 2 días · cambiado por Iña hoy a las 9:12» */
function pieCambios(col, id) {
  const r = S.recs[col] && S.recs[col][id]; if (!r) return '';
  const ts = Object.keys(r.t || {}).filter(k => CAMPOS_MUDOS.indexOf(k) < 0).map(k => r.t[k]);
  const ult = ts.length ? Math.max.apply(null, ts) : 0, prim = ts.length ? Math.min.apply(null, ts) : 0;
  const crea = r.f.creadoPor || r.f.por || r.por, camb = r.por;
  const a = [];
  if (crea && nombreDe(crea)) a.push('Añadido por ' + esc(nombreDe(crea)) + (prim ? ' ' + haceRato(prim) : ''));
  if (camb && nombreDe(camb) && ult && ult - prim > 60000) a.push('cambiado por ' + esc(nombreDe(camb)) + ' ' + haceRato(ult));
  if (!a.length) return '';
  return '<div class="pie">' + (dato('personas', camb || crea) ? av(dato('personas', camb || crea), 22) : '') + '<span>' + a.join(' · ') + '</span></div>';
}

/* ---------- Gráfica de línea (acuario) ---------- */
function grafica(vals, etiq, col, w, h) {
  w = w || 320; h = h || 140; col = col || COL[5];
  if (!vals.length) return '';
  const mx = Math.max.apply(null, vals), mn = Math.min(0, Math.min.apply(null, vals)), rg = (mx - mn) || 1;
  const X = i => 40 + (vals.length === 1 ? (w - 62) / 2 : i * (w - 62) / (vals.length - 1)), Y = v => h - 22 - (v - mn) / rg * (h - 36);
  const fl = x => { const a = Math.abs(x); return String(a >= 10 ? Math.round(x) : a >= 1 ? +x.toFixed(1) : +x.toFixed(2)).replace('.', ','); };
  const pts = vals.map((v, i) => X(i).toFixed(1) + ',' + Y(v).toFixed(1));
  let s = '<svg class="graf" viewBox="0 0 ' + w + ' ' + h + '" width="100%" preserveAspectRatio="xMidYMid meet">';
  for (let k = 0; k < 4; k++) { const y = h - 22 - k * (h - 36) / 3; s += '<line x1="40" x2="' + (w - 6) + '" y1="' + y + '" y2="' + y + '" stroke="var(--ln)" stroke-width="1.5"/><text x="34" y="' + (y + 4) + '" text-anchor="end" font-size="10.5" font-weight="700" fill="var(--mu)">' + fl(mn + k * rg / 3) + '</text>'; }
  s += '<polygon points="' + X(0) + ',' + (h - 22) + ' ' + pts.join(' ') + ' ' + X(vals.length - 1) + ',' + (h - 22) + '" fill="' + col + '" opacity=".16"/><polyline points="' + pts.join(' ') + '" fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linejoin="round"/>';
  vals.forEach((v, i) => { s += '<circle cx="' + X(i) + '" cy="' + Y(v) + '" r="' + (i === vals.length - 1 ? 5 : 3.2) + '" fill="' + col + '"/><circle class="gp" data-i="' + i + '" cx="' + X(i) + '" cy="' + Y(v) + '" r="14" fill="transparent"/>'; });
  const paso = Math.max(1, Math.ceil(etiq.length / 6));
  etiq.forEach((t, i) => { if (i % paso === 0 || i === etiq.length - 1) s += '<text x="' + X(i) + '" y="' + (h - 5) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--mu)">' + t + '</text>'; });
  return s + '</svg>';
}
