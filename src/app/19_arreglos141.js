/* ===================== 1.4.1 · arreglos tras probar la 1.4.0 en el iPhone =====================
   - Selector de emoji propio (el iPhone no deja abrir su teclado de emojis desde una web).
   - Los nombres que empezaban por un emoji lo pasan a su casilla.
   - Fecha límite en las tareas.
   - Importar medidas del acuario desde un CSV de otra app. */

/* ---------- Selector de emoji ---------- */
const EMOJIS = [
  ['Casa', '🏠 🏡 🛋️ 🛏️ 🚿 🛁 🧺 🧹 🧽 🧼 🪣 🧴 🪴 🔑 🚪 🪟 💡 🔌 🔋 🧯 🛠️ 🔧 🪛 🧰 📦 🗑️ ♻️ 🧸 🖼️ 🕯️ 🛒 🏷️'],
  ['Comida', '🍎 🍊 🍋 🍌 🍉 🍇 🍓 🍒 🥑 🥦 🥕 🌽 🥔 🧅 🧄 🍅 🥬 🥚 🧀 🥛 🍞 🥖 🥐 🍝 🍕 🍔 🌮 🥗 🍲 🍜 🍣 🍗 🥩 🐟 🍤 🍰 🍪 🍫 ☕ 🍵 🍷 🍺 🧃 💧'],
  ['Dinero', '💶 💳 💰 🪙 🧾 🏦 📈 📉 💸 🏧 🛍️ 🎁 🧮 📊 💼 🤝'],
  ['Viajes', '🚗 🚙 🚕 🏍️ 🚲 🛴 🚌 🚆 ✈️ 🚢 ⛽ 🅿️ 🗺️ 🧳 🏖️ ⛰️ 🏕️ 🏙️ 🎡 🎢 🏰 🗼 🎒 🛂'],
  ['Naturaleza', '🌱 🌿 🍀 🌵 🌴 🌳 🌲 🌸 🌼 🌻 🌹 🌷 🍁 🍂 🍄 🌊 ☀️ 🌤️ ⛅ 🌧️ ⛈️ ❄️ 🌈 🌙 ⭐ 🔥'],
  ['Animales', '🐠 🐟 🐡 🦐 🦀 🐌 🐢 🐶 🐱 🐰 🐹 🐦 🦜 🐝 🦋 🐞 🐴 🐮 🐷 🐑 🦊 🐻 🐼 🐸'],
  ['Cosas', '📄 📁 🗂️ 📋 📝 ✏️ 📌 📎 📅 🗓️ ⏰ ⌛ 📱 💻 🖥️ 📺 🎧 📷 🔍 💊 🩺 🩹 🧪 🌡️ 🪪 🛡️ 📚 🎓 🏋️ ⚽ 🎾 🎮 🎨 🎸 🎬 🎉'],
  ['Caras', '😀 😊 😍 🥰 😘 😎 🤓 🥳 😴 🤒 😅 😂 🤔 😬 😢 😡 👍 👌 🙌 👏 💪 🙏 👀 💙 💚 💛 🧡 ❤️ 💜 🖤 🤍'],
  ['Símbolos', '✅ ☑️ ❌ ⚠️ ❗ ❓ 💯 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟥 🟧 🟨 🟩 🟦 🟪 ⭕ 🔺 🔷 ♾️ 🔁 🔔 🏁 🚩 ✨']
].map(c => [c[0], c[1].split(' ')]);
let emPick = null;
function abrirEmojis(inp) {
  cerrarEmojis(true);
  let cat = 0;
  const d = document.createElement('div');
  d.className = 'empick';
  const pinta = () => {
    d.innerHTML = '<div class="fon"></div><div class="hj"><div class="tir"></div><div class="cab"><b>Elige un emoji</b>' + (inp.value ? '<button class="mini" data-em="quitar">Quitar</button>' : '') + '<button class="mini" data-em="cerrar">Cerrar</button></div>' +
      '<div class="cats">' + EMOJIS.map((c, i) => '<button class="' + (i === cat ? 'on' : '') + '" data-cat="' + i + '">' + c[0] + '</button>').join('') + '</div>' +
      '<div class="grid">' + EMOJIS[cat][1].map(e => '<button data-e="' + e + '">' + e + '</button>').join('') + '</div>' +
      '<div class="otro"><input placeholder="Otro: escríbelo con el teclado de emojis" aria-label="Otro emoji" autocomplete="off" enterkeyhint="done"></div></div>';
  };
  pinta();
  const poner = e => { inp.value = e; inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true })); cerrarEmojis(); };
  d.addEventListener('click', ev => {
    const b = ev.target.closest('button');
    if (ev.target.classList.contains('fon')) return cerrarEmojis();
    if (!b) return;
    if (b.dataset.e) return poner(b.dataset.e);
    if (b.dataset.cat) { cat = +b.dataset.cat; const g = $('.grid', d); g.innerHTML = EMOJIS[cat][1].map(e => '<button data-e="' + e + '">' + e + '</button>').join(''); g.scrollTop = 0; $$('.cats button', d).forEach((x, i) => x.classList.toggle('on', i === cat)); return; }
    if (b.dataset.em === 'quitar') return poner('');
    if (b.dataset.em === 'cerrar') return cerrarEmojis();
  });
  d.addEventListener('input', ev => { if (!ev.target.closest('.otro')) return; ev.stopPropagation(); const e = primerEmoji(ev.target.value); if (e) poner(e); }, true);
  document.body.appendChild(d);
  emPick = d;
  requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('ver')));
}
function cerrarEmojis(ya) {
  const d = emPick; if (!d) return; emPick = null;
  if (ya) return d.remove();
  d.classList.remove('ver'); setTimeout(() => d.remove(), 280);
}
/* La casilla ya no abre el teclado normal: abre el selector */
document.addEventListener('click', ev => {
  const l = ev.target.closest && ev.target.closest('.emb'); if (!l) return;
  ev.preventDefault(); ev.stopPropagation();
  const i = $('input', l); if (i) { i.blur(); abrirEmojis(i); }
}, true);
/* El input se queda sin teclado (solo guarda el valor) */
new MutationObserver(() => { $$('.emb input:not([readonly])').forEach(i => { i.readOnly = true; i.tabIndex = -1; }); }).observe(document.documentElement, { childList: true, subtree: true });

/* ---------- Los nombres que empiezan por emoji lo pasan a su casilla (una vez, sin apuntarlo en Actividad) ---------- */
const COLS_EMOJI = [['cuentas', 'nombre'], ['fijos', 'nombre'], ['listas', 'nombre'], ['plantas', 'nombre'], ['acuario', 'nombre'], ['medicacion', 'nombre'], ['coches', 'nombre'], ['documentos', 'nombre'], ['tarjetas', 'nombre'], ['turnos', 'nombre'], ['listasr', 'nombre'], ['notas', 'titulo']];
function separarEmoji(t) {
  t = String(t || ''); const s = t.trimStart(); const e = primerEmoji(s.slice(0, 16));
  if (!e || s.indexOf(e) !== 0) return null;
  let resto = s.slice(e.length).replace(/^[\s️‍]+/, '');
  return resto ? { e: e, resto: resto } : null;
}
function moverEmojis() {
  if (!S.cfg) return;
  COLS_EMOJI.forEach(c => {
    lista(c[0]).forEach(x => {
      if (x.emoji) return;
      const r = separarEmoji(x[c[1]]); if (!r) return;
      const f = { emoji: r.e }; f[c[1]] = r.resto;
      _cambiarBase(c[0], x.id, f);
    });
  });
}
setTimeout(() => { try { moverEmojis(); } catch (e) { anotar('emojis', e); } }, 7000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.cfg) setTimeout(() => { try { moverEmojis(); } catch (e) { anotar('emojis', e); } }, 5000); });

/* ---------- Fecha límite ---------- */
function textoLimite(iso, plano) {
  const d = deISO(iso); if (!d) return '';
  const n = Math.round((d - hoy0()) / 864e5);
  const t = n < 0 ? 'Límite pasado · ' + fechaCortaTxt(iso) : n === 0 ? 'Límite hoy' : n === 1 ? 'Límite mañana' : n < 7 ? 'Límite en ' + n + ' días' : 'Límite · ' + fechaCortaTxt(iso);
  if (plano) return t;
  return '<span class="lim' + (n < 0 ? ' pasada' : n <= 2 ? ' pronto' : '') + '">' + ic('reloj', 13) + esc(t) + '</span>';
}

/* ---------- Importar medidas del acuario (CSV de otra app: parámetro, valor, fecha) ---------- */
const AC_ALIAS = { amoniaco: 'amoniaco', amonio: 'amoniaco', ammonia: 'amoniaco', nh3: 'amoniaco', nh4: 'amoniaco', fosfato: 'fosfato', fosfatos: 'fosfato', phosphate: 'fosfato', po4: 'fosfato', gh: 'gh', kh: 'kh', hierro: 'hierro', iron: 'hierro', fe: 'hierro', nitrato: 'nitrato', nitratos: 'nitrato', nitrate: 'nitrato', no3: 'nitrato', nitrito: 'nitrito', nitritos: 'nitrito', nitrite: 'nitrito', no2: 'nitrito', ph: 'ph', temperatura: 'temp', temperature: 'temp', temp: 'temp' };
const sinTildes = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
function leerCSV(txt) {
  const filas = [];
  String(txt || '').replace(/^﻿/, '').split(/\r?\n/).forEach(l => {
    if (!l.trim()) return;
    const c = []; let cur = '', q = false;
    for (let i = 0; i < l.length; i++) { const ch = l[i]; if (ch === '"') { if (q && l[i + 1] === '"') { cur += '"'; i++; } else q = !q; } else if ((ch === ',' || ch === ';') && !q) { c.push(cur); cur = ''; } else cur += ch; }
    c.push(cur); filas.push(c.map(x => x.trim()));
  });
  return filas;
}
/* Devuelve { dias: {iso: {k: valor}}, n, params: {k: nombre}, nuevos: [{k,n}], malas } */
function analizarMedidas(txt) {
  const f = leerCSV(txt); if (!f.length) return null;
  const cab = f[0].map(sinTildes);
  let iP = cab.findIndex(x => /param|nombre|name/.test(x)), iV = cab.findIndex(x => /valor|value/.test(x)), iF = cab.findIndex(x => /fecha|date|created|cuando/.test(x));
  let desde = 1; if (iP < 0 || iV < 0 || iF < 0) { iP = 0; iV = 1; iF = 2; desde = /^[a-z]/i.test(f[0][1] || '') ? 1 : 0; }
  const params = acParams(true), porNombre = {};
  params.forEach(p => { porNombre[sinTildes(p.n)] = p.k; porNombre[sinTildes(p.k)] = p.k; });
  const dias = {}, usados = {}, nuevos = [], ult = {}; let n = 0, malas = 0;
  f.slice(desde).forEach(r => {
    const nom = r[iP] || '', v = Number(String(r[iV] || '').replace(',', '.')), m = String(r[iF] || '').match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
    if (!nom || !isFinite(v) || String(r[iV] || '').trim() === '' || !m) { malas++; return; }
    const s = sinTildes(nom);
    let k = porNombre[s] || AC_ALIAS[s];
    if (!k) { let x = nuevos.find(y => sinTildes(y.n) === s); if (!x) { x = { k: 'x' + uid().slice(-6), n: cap(nom.trim()), u: '' }; nuevos.push(x); } porNombre[s] = x.k; k = x.k; }
    const iso = m[1] + '-' + m[2] + '-' + m[3], t = (m[4] || '00') + (m[5] || '00');
    dias[iso] = dias[iso] || {};
    if (!ult[iso + k] || t >= ult[iso + k]) { dias[iso][k] = v; ult[iso + k] = t; }
    usados[k] = (params.find(p => p.k === k) || nuevos.find(p => p.k === k) || {}).n || nom; n++;
  });
  return { dias: dias, n: n, params: usados, nuevos: nuevos, malas: malas };
}
/* Solo rellena lo que está vacío: lo apuntado a mano en Ronda no se toca */
function importarMedidas(a) {
  if (a.nuevos.length) cambiar('ajustes', 'acuario', { params: acParams(true).map(x => Object.assign({}, x)).concat(a.nuevos.map(x => ({ k: x.k, n: x.n, u: x.u, on: true }))) });
  let puestos = 0, dejados = 0;
  Object.keys(a.dias).sort().forEach(iso => {
    const ya = medidaDe(iso) || {}, f = {};
    Object.keys(a.dias[iso]).forEach(k => { if (valorDe(ya, k) === null) { f['v_' + k] = a.dias[iso][k]; puestos++; } else dejados++; });
    if (Object.keys(f).length) { f.fecha = iso; if (!ya.fecha) f.creado = Date.now(); _cambiarBase('medidas', idMedida(iso), f); }
  });
  return { puestos: puestos, dejados: dejados };
}
ACC.acImportar = () => {
  const i = document.createElement('input'); i.type = 'file'; i.accept = '.csv,text/csv,text/plain';
  i.addEventListener('change', () => {
    const f = i.files && i.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const a = analizarMedidas(r.result);
      if (!a || !a.n) return toast('No he encontrado medidas en ese archivo.');
      const ds = Object.keys(a.dias).sort();
      const h = abrirHoja('<h3>Importar medidas</h3><div class="impres"><b>' + a.n + ' medidas</b> en <b>' + ds.length + ' días</b>, del ' + esc(fechaCortaTxt(ds[0])) + ' al ' + esc(fechaCortaTxt(ds[ds.length - 1])) + '.<br>' + esc(Object.values(a.params).join(', ')) + '.' +
        (a.nuevos.length ? '<br>Parámetros nuevos que se añaden: <b>' + esc(a.nuevos.map(x => x.n).join(', ')) + '</b>.' : '') + (a.malas ? '<br>' + a.malas + (a.malas === 1 ? ' fila no se entiende y se salta.' : ' filas no se entienden y se saltan.') : '') +
        '</div><p class="cap" style="text-align:left;margin-top:10px">Cada valor va a su día. Si un día ya tiene ese parámetro apuntado en Ronda, se deja el de Ronda.</p><button class="btn pri" data-a="acImpOk" style="margin-top:12px">Importar</button>');
      ACC.acImpOk = () => { const res = importarMedidas(a); cerrarHoja(); Nav.refrescar(true); toast(res.puestos + ' medidas importadas' + (res.dejados ? ' · ' + res.dejados + ' ya estaban' : '')); };
      void h;
    };
    r.readAsText(f);
  });
  i.click();
};
const _acParamsHtml = P.acParams.html;
P.acParams.html = p => _acParamsHtml(p) + '<button class="row card" data-a="acImportar" style="margin-top:12px">' + sq('subir', 5) + '<div class="f"><b>Importar medidas de otra app</b><small>Un archivo CSV con parámetro, valor y fecha</small></div>' + chev + '</button>';

Object.assign(window.RONDA, { analizarMedidas: analizarMedidas, importarMedidas: importarMedidas, moverEmojis: moverEmojis, textoLimite: textoLimite });
