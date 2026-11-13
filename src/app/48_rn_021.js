/* ===================== 0.2.1 · arreglos tras probar la 0.2.0 en el iPhone =====================
   1. Actividad en Ajustes, con «Deshacer» y «Rehacer» en cada cambio.
   2. El selector de emoji (y el resto de capas de la app de hoy que se ponen encima de todo) con su estilo.
   3. El «+» de las secciones donde no hay nada que añadir (Menú): gris, sin quitarlo.
   4. El micrófono (Dilo) gris: necesita Google.
   5. La animación del arranque, la de la 1.8.0 con el logo nuevo (los puntos sobre el círculo blanco y «Ronda» debajo).
      Centrada con CSS en la pantalla física: no se mide ningún texto (error 4). */

/* ---------- 1. Actividad: cada cambio guarda cómo estaba antes y cómo quedó ---------- */
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
  const clave = col + '|' + id + '|' + acc, ya = ACT_RECIENTE[clave];
  const aid = ya && Date.now() - ya.t < 90000 ? ya.id : 'a' + uid();
  ACT_RECIENTE[clave] = { id: aid, t: Date.now() };
  const r = { q: S.cfg.persona, col: col, ref: id, acc: acc, txt: String(txt).slice(0, 80), cuando: Date.now(), desh: 0 };
  if (col === 'fijos' && acc === 'p') r.imp = Number(todo.importe) || 0;
  if (col === 'movs' && acc === 'n') r.imp = Number(todo.importe) || 0;
  if (col === 'menu') r.txt = 'el menú de la semana';
  /* Cómo estaba y cómo quedó (solo los campos que cambian). Si se junta con la línea anterior, se queda el «antes» de la primera. */
  if (acc !== 'n' && acc !== 'b' && acc !== 'r') {
    const ant = {}, nue = {};
    ks.forEach(k => { if (CAMPOS_MUDOS.indexOf(k) >= 0) return; ant[k] = antes && antes[k] !== undefined ? antes[k] : null; nue[k] = campos[k]; });
    const prev = actLoc(aid);
    r.ant = Object.assign({}, ant, prev && prev.ant || {});
    r.nue = Object.assign({}, prev && prev.nue || {}, nue);
    if (JSON.stringify(r.ant).length + JSON.stringify(r.nue).length > 6000) { delete r.ant; delete r.nue; }
  }
  /* 0.3.0: «cómo estaba» y «cómo quedó» se guardan SOLO en este móvil. A la hoja va la línea con los mismos campos que hoy. */
  if (r.ant) actLocPoner(aid, { ant: r.ant, nue: r.nue });
  delete r.ant; delete r.nue; delete r.desh;
  _cambiarBase('actividad', aid, r);
}
/* Lo que la actividad guarda solo en el móvil (por modo): { aid: { ant, nue, desh } } */
const ACT_K = 'rondaP-act-' + MODO;
let ACT_LOC = null;
function actLocTodo() { if (!ACT_LOC) { try { ACT_LOC = JSON.parse(localStorage.getItem(ACT_K) || '{}') || {}; } catch (e) { ACT_LOC = {}; } } return ACT_LOC; }
function actLoc(aid) { return actLocTodo()[aid] || null; }
function actLocPoner(aid, o) {
  const t = actLocTodo(); t[aid] = Object.assign({}, t[aid] || {}, o, { t: Date.now() });
  const ks = Object.keys(t); if (ks.length > 400) ks.sort((a, b) => (t[a].t || 0) - (t[b].t || 0)).slice(0, ks.length - 400).forEach(k => delete t[k]);
  try { localStorage.setItem(ACT_K, JSON.stringify(t)); } catch (e) { anotar('actividad local', e); }
}
const actConLoc = a => a ? Object.assign({}, a, actLoc(a.id) || {}) : a;
/* Qué hace «Deshacer» y «Rehacer» en cada línea */
function rnPasoActividad(a, deshacer) {
  if (a.acc === 'n' || a.acc === 'r') return { _b: deshacer ? 1 : 0 };
  if (a.acc === 'b') return { _b: deshacer ? 0 : 1 };
  if (deshacer ? a.ant : a.nue) return Object.assign({}, deshacer ? a.ant : a.nue);
  return null;
}
function rnSePuedeDeshacer(a) { a = actConLoc(a); return !!(S.recs[a.col] && S.recs[a.col][a.ref] && rnPasoActividad(a, true)); }
function rnHacerActividad(aid, deshacer) {
  const a = actConLoc(dato('actividad', aid)); if (!a) return;
  const c = rnPasoActividad(a, deshacer); if (!c) return toast('Este cambio no se puede ' + (deshacer ? 'deshacer' : 'rehacer') + '.');
  /* Sin apuntarlo como un cambio nuevo: la misma línea pasa a «deshecho» */
  _cambiarBase(a.col, a.ref, c);
  actLocPoner(aid, { desh: deshacer ? 1 : 0 });
  Nav.refrescar(true);
  toast(deshacer ? 'Deshecho: «' + (a.txt || COLNOM[a.col]) + '»' : 'Rehecho: «' + (a.txt || COLNOM[a.col]) + '»', deshacer ? 'Rehacer' : 'Deshacer', () => rnHacerActividad(aid, !deshacer), 'deshacer');
}
ACC.actDeshacer = el => rnHacerActividad(el.dataset.id, true);
ACC.actRehacer = el => rnHacerActividad(el.dataset.id, false);
ACC.actRecuperar = el => { const a = lista('actividad').find(x => x.ref === el.dataset.ref && x.acc === 'b'); if (a) rnHacerActividad(a.id, true); else { cambiar(el.dataset.col, el.dataset.ref, { _b: 0 }); Nav.refrescar(true); toast('Recuperado'); } };
P.actividad = {
  html: p => {
    p.q = p.q || ''; p.s = p.s || '';
    let l = actividades(30).map(actConLoc);
    if (p.q) l = l.filter(a => a.q === p.q);
    if (p.s) l = l.filter(a => COLNOM[a.col] === p.s);
    const secs = []; actividades(30).forEach(a => { const s = COLNOM[a.col]; if (s && secs.indexOf(s) < 0) secs.push(s); });
    let h = tope('') + head('Actividad', 'Últimos 30 días. Toca «Deshacer» para volver a como estaba.') + '<div class="chips" style="flex-wrap:nowrap;overflow-x:auto;margin-bottom:6px"><button class="chip' + (!p.q ? ' on' : '') + '" data-a="pSet" data-k="q" data-v="">Todo</button>' + personas().map(x => '<button class="chip' + (p.q === x.id ? ' on' : '') + '" data-a="pSet" data-k="q" data-v="' + x.id + '" style="flex:none">' + esc(x.nombre) + '</button>').join('') + '</div>' +
      (secs.length > 1 ? '<div class="chips" style="flex-wrap:nowrap;overflow-x:auto;margin-bottom:10px"><button class="chip' + (!p.s ? ' on' : '') + '" data-a="pSet" data-k="s" data-v="" style="flex:none">Todas las secciones</button>' + secs.map(s => '<button class="chip' + (p.s === s ? ' on' : '') + '" data-a="pSet" data-k="s" data-v="' + esc(s) + '" style="flex:none">' + esc(s) + '</button>').join('') + '</div>' : '');
    if (!l.length) return h + vacio('sin-avisos', 'Nada por aquí', 'Cuando alguien añada, cambie o borre algo, saldrá aquí.');
    let dia = '';
    return h + l.slice(0, 200).map(a => {
      const d = isoDia(new Date(a.cuando)); let sep = '';
      if (d !== dia) { sep = (dia ? '</div>' : '') + '<p class="lab2">' + cap(cuando(d)) + '</p><div class="card grp">'; dia = d; }
      const puede = rnSePuedeDeshacer(a);
      const bt = !puede ? '' : a.desh ? '<button class="mini rn-act-b" data-a="actRehacer" data-id="' + a.id + '">Rehacer</button>' : '<button class="mini rn-act-b" data-a="actDeshacer" data-id="' + a.id + '">Deshacer</button>';
      return sep + '<div class="row' + (a.desh ? ' rn-act-desh' : '') + '">' + (dato('personas', a.q) ? av(dato('personas', a.q), 30) : sq('tarjeta', 7)) + '<div class="f"><b style="font-size:15px">' + textoActividad(a) + '</b><small>' + esc(COLNOM[a.col] || '') + ' · ' + hora(new Date(a.cuando)) + (a.desh ? ' · deshecho' : '') + '</small></div>' + bt + '</div>';
    }).join('') + '</div>';
  }
};

/* ---------- 2. Capas de la app de hoy que se ponen encima de todo (selector de emoji…) ----------
   Se metían sueltas en <body>, fuera de las pantallas, y se quedaban sin estilo (el selector no se veía).
   Ahora van dentro de #rn-capas, que lleva el mismo estilo que las pantallas de dentro. */
(function () {
  let capas = document.getElementById('rn-capas');
  if (!capas) { capas = document.createElement('div'); capas.id = 'rn-capas'; capas.className = 'rn-capas'; document.body.appendChild(capas); }
  const nuestra = el => !el.className || typeof el.className !== 'string' || /(^|\s)rn-/.test(el.className) || el.id === 'app' || el.id === 'arranque' || el.id === 'nav' || el.id === 'capa' || el.id === 'rn-capas';
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType !== 1 || n.parentNode !== document.body || /^(SCRIPT|TEXTAREA|A|INPUT|STYLE|LINK)$/.test(n.tagName) || nuestra(n)) return;
    capas.appendChild(n);
  }))).observe(document.body, { childList: true });
})();

/* ---------- 3 y 4. El «+» y el micrófono, grises donde no se pueden usar ---------- */
const _barra48 = Nav.barra;
Nav.barra = function () {
  _barra48.call(this);
  const n = $('#nav'), raiz = this.pila[0], top = this.actual();
  if (!n || !raiz || n.classList.contains('rn-oculta') || (top && !top.raiz && !P[top.id].rn)) return;
  /* Inicio y Ajustes no llevan «+» en los JPG; las demás secciones sí, aunque no haya nada que añadir */
  if (raiz.id === 'ajustes' || raiz.id === 'inicio' || $('.rn-plus', n)) return;
  n.classList.remove('rn-sin-plus');
  n.insertAdjacentHTML('beforeend', '<button class="rn-plus rn-gl rn-plus-no" data-a="rnPlusNo" aria-disabled="true" aria-label="Añadir (aquí no hay nada que añadir)">' + rnIc('anadir', 26, 2.2) + '</button>');
};
ACC.rnPlusNo = () => {
  const r = Nav.pila[0];
  toast(r && r.id === 'menu' ? 'En el menú no se añade nada: toca un día para cambiar la comida o la cena.' : 'Aquí no hay nada que añadir.');
};
ACC.rnDilo = () => toast('Dilo necesita Google (Gemini) y en la prueba no hay conexión con Google. En la app de verdad funciona.');

/* ---------- 5. Arranque: la animación de la 1.8.0 con el logo nuevo ----------
   La primera vez que se abre, la larga (la de la bienvenida: las bolas salen girando, laten y se colocan en el círculo,
   y «Ronda» aparece letra a letra). Las demás veces, la corta de 0,75 s. */
const RN_ARR_R = 36, RN_ARR_D = 12.5, RN_ARR_K = 0.96;   /* en el círculo de 132 px: anillo de 34,6 px y bolas de 12 px */
const RN_ARR_SUBE = 34;                                   /* el centro del círculo queda 34 px por encima del centro de la pantalla */
function rnArrBolas(t, rapido) {
  let o = '', cx = 0, cy = 0, k = RN_ARR_K, m = 1;
  const rot = rapido ? -90 * (1 - oC(cl(t / 0.95))) : -110 * (1 - oC(cl((t - 0.2) / 1.6)));
  if (!rapido) { m = io(cl((t - T0) / TM)); const k0 = RN_ARR_K * 3.3; k = k0 + (RN_ARR_K - k0) * m; cy = RN_ARR_SUBE * (1 - m); }
  for (let i = 0; i < 8; i++) {
    const t0 = rapido ? 0.05 + i * 0.065 : 0.35 + i * 0.12, p = cl((t - t0) / (rapido ? 0.38 : 0.55)), e = oB(p), R = RN_ARR_R * e, a = (i * 45 + rot) * Math.PI / 180;
    let s = rapido ? cl(p * 2.4) * (0.6 + 0.4 * Math.min(1.25, e)) : cl(p * 2.2) * (0.55 + 0.45 * Math.min(1.25, e));
    if (!rapido) { const wv = cl((t - 1.9 - i * 0.07) / 0.5); s *= 1 + 0.16 * Math.sin(wv * Math.PI) * (1 - m); }
    const q = cl((t - t0 - (rapido ? 0.2 : 0.28)) / (rapido ? 0.45 : 0.6));
    if (q > 0 && q < 1 && (rapido || m === 0)) o += '<circle cx="' + (RN_ARR_R * Math.sin(a)).toFixed(2) + '" cy="' + (-RN_ARR_R * Math.cos(a)).toFixed(2) + '" r="' + (RN_ARR_D + (rapido ? 12 : 16) * oC(q)).toFixed(2) + '" fill="' + RN_LOGO[i] + '" opacity="' + ((rapido ? 0.3 : 0.28) * (1 - q)).toFixed(3) + '"/>';
    if (p > 0) o += '<circle cx="' + (R * Math.sin(a)).toFixed(2) + '" cy="' + (-R * Math.cos(a)).toFixed(2) + '" r="' + (RN_ARR_D * Math.max(s, 0)).toFixed(3) + '" fill="' + RN_LOGO[i] + '"/>';
  }
  return { svg: '<g transform="translate(' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ') scale(' + k.toFixed(4) + ')">' + o + '</g>', m: m };
}
function rnPrimeraVez() { try { return !localStorage.getItem('rondaP-bienvenida'); } catch (e) { return false; } }
function rnAnimarArranque(ar) {
  return new Promise(ok => {
    const larga = rnPrimeraVez();
    try { localStorage.setItem('rondaP-bienvenida', '1'); } catch (e) { }
    ar.classList.add('rn-anim');
    ar.innerHTML = rnAurora() + '<div class="rn-arr"><span class="rn-arr-c"><i class="rn-arr-f"></i><svg class="rn-arr-s" width="1" height="1" aria-hidden="true"></svg></span><b aria-label="Ronda">' + 'Ronda'.split('').map(l => '<span class="rn-arr-l">' + l + '</span>').join('') + '</b></div>';
    const svg = $('.rn-arr-s', ar), fondo = $('.rn-arr-f', ar), letras = $$('.rn-arr-l', ar);
    let tA = 0;
    const fin = () => { window.RN_ARR_MS = tA ? Math.round(performance.now() - tA) : 0; const b = rnArrBolas(9, true); svg.innerHTML = b.svg; fondo.style.cssText = ''; letras.forEach(l => { l.style.opacity = 1; l.style.transform = ''; }); ok(); };
    if (REDUCIR) { fin(); return; }
    const t0 = tA = performance.now(), FIN = T0 + 0.3 + 4 * 0.1 + 0.55 + 0.25;
    const paso = now => {
      if (larga) {
        const t = (now - t0) / 1000;
        const b = rnArrBolas(t, false); svg.innerHTML = b.svg;
        /* El círculo blanco aparece mientras las bolas viajan a su sitio */
        fondo.style.opacity = b.m.toFixed(3); fondo.style.transform = 'scale(' + (0.7 + 0.3 * b.m).toFixed(3) + ')';
        letras.forEach((l, i) => { const p = oC(cl((t - (T0 + 0.3 + i * 0.1)) / 0.55)); l.style.opacity = p; l.style.transform = 'translateY(' + (18 * (1 - p)).toFixed(1) + 'px)'; });
        if (t < FIN) requestAnimationFrame(paso); else fin();
      } else {
        const t = (now - t0) / 1000 * 1.333;
        const b = rnArrBolas(t, true); svg.innerHTML = b.svg;
        const f = oC(cl(t / 0.35)); fondo.style.opacity = f.toFixed(3); fondo.style.transform = 'scale(' + (0.85 + 0.15 * f).toFixed(3) + ')';
        letras.forEach((l, i) => { const p = oC(cl((t - i * 0.05) / 0.4)); l.style.opacity = p; l.style.transform = 'translateY(' + (10 * (1 - p)).toFixed(1) + 'px)'; });
        if (t < 1.0) requestAnimationFrame(paso); else fin();
      }
    };
    requestAnimationFrame(paso);
  });
}
/* Para volver a ver la animación larga (Ajustes, abajo) */
ACC.rnVerBienvenida = () => { try { localStorage.removeItem('rondaP-bienvenida'); } catch (e) { } location.reload(); };
