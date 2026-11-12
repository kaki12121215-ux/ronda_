/* ============================ PIEZAS DE INTERFAZ ============================ */
function ic(id, s, ci, color) {
  const o = ICONOS[id];
  if (!o) return '';
  const bolas = o[1].map(b => '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="2.5" fill="' + (b[2] === 'c' ? COL[(ci || 0) % 8] : 'currentColor') + '" stroke="none"/>').join('');
  return '<i class="ic" style="width:' + (s || 24) + 'px;height:' + (s || 24) + 'px' + (color ? ';color:' + color : '') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + o[0] + bolas + '</svg></i>';
}
const ilu = id => '<div class="ill-in">' + (ILUS[id] || '') + '</div>';
const tick = s => '<svg width="' + (s || 16) + '" height="' + (s || 16) + '" viewBox="0 0 16 16" fill="none" stroke="#FFFDF7" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>';
const dot = (c, s) => '<span class="dot" style="background:' + c + ';width:' + (s || 12) + 'px;height:' + (s || 12) + 'px"></span>';
const chev = '<span class="chev">' + ic('atras', 18) + '</span>';
const AVSVG = '<svg viewBox="0 0 48 48"><circle cx="24" cy="19" r="8" fill="#FFFDF7"/><path d="M8 48c0-10 7-16 16-16s16 6 16 16z" fill="#FFFDF7"/></svg>';

/* Avatar: foto con aro del color de la persona, o busto blanco sobre su color. */
function av(p, s) {
  s = s || 44;
  const c = (p && p.color) || '#9FB0B8';
  const img = p && p.foto ? imagen(p.foto) : null;
  if (img) return '<span class="av foto" style="--c:' + c + ';--aro:' + Math.max(3, Math.round(s * 0.09)) + 'px;width:' + s + 'px;height:' + s + 'px"><b style="background-image:url(\'' + img + '\')"></b></span>';
  return '<span class="av" style="--c:' + c + ';width:' + s + 'px;height:' + s + 'px">' + AVSVG + '</span>';
}
/* Cabecera con flecha. En una pantalla de la barra de abajo (raíz) y sin título, no se pinta: así todos los títulos quedan a la misma altura. */
const tope = (t, der) => (!t && !der && Nav.pintando && Nav.pintando.raiz) ? '' : '<div class="top"><button class="bk" data-a="atras" aria-label="Atrás">' + ic('atras', 26) + '</button><b>' + esc(t) + '</b><span class="rt">' + (der || '') + '</span></div>';
const head = (t, sub, der) => { const i = iconoCabecera(); return '<div class="hd' + (i ? ' hdi' : '') + '">' + i + '<div class="hdt"><h1>' + esc(t) + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (der || '') + '</div>'; };
const sq = (icono, ci, sm) => '<span class="sq' + (sm === false ? '' : ' sm') + '" style="background:' + COL[ci] + '22">' + ic(icono, sm === false ? 30 : 26, ci) + '</span>';
const btn = (t, a, cls, extra) => '<button class="btn ' + (cls || 'pri') + '" data-a="' + a + '"' + (extra || '') + '>' + t + '</button>';

/* ---------- navegación entre pantallas */
const P = {};      /* definición de cada pantalla */
const ACC = {};    /* acciones de los botones (data-a) */
const RAICES = [['inicio', 'inicio', 'Inicio', 0], ['compra', 'modulo-compra', 'Compra', 2], ['mas', 'menu', 'Más', 6]];

const Nav = {
  pila: [],
  actual() { return this.pila[this.pila.length - 1]; },
  crear(id, params, raiz) {
    const d = P[id];
    if (!d) { anotar('nav', 'No existe la pantalla ' + id); return this.crear('inicio', {}, true); }
    const el = document.createElement('div');
    el.className = 'pg ' + (raiz ? 'raiz' : 'sub') + (d.clase ? ' ' + d.clase : '');
    el.dataset.p = id;
    const e = { id: id, params: params || {}, el: el, vistos: {}, raiz: !!raiz };
    el.innerHTML = '<div class="pgc">' + this.contenido(e) + '</div>' + (d.fijo ? d.fijo(e.params, e) : '');
    prepararCampos(el);
    $('#app').appendChild(el);
    if (d.montar) try { d.montar(el, e.params, e); } catch (x) { anotar('montar ' + id, x); }
    return e;
  },
  contenido(e) {
    this.pintando = e;
    try {
      let h = P[e.id].html(e.params, e);
      /* 1.4.2: si la pantalla se abre encima (no está en la barra), siempre lleva flecha para volver */
      if (!e.raiz && this.pila.length && String(h).indexOf('data-a="atras"') < 0) h = tope('') + h;
      /* 1.5.0: la flecha y los botones de arriba siempre lo primero (nunca debajo de pestañas) */
      if (String(h).indexOf('class="top"') > 0) { const t = document.createElement('template'); t.innerHTML = h; const tp = [...t.content.children].find(x => x.classList.contains('top')); if (tp && t.content.firstElementChild !== tp) { t.content.insertBefore(tp, t.content.firstChild); h = t.innerHTML; } }
      return h;
    } catch (x) { anotar('pintar ' + e.id, x); return '<div class="aviso mal">' + ic('error', 22, 0) + '<span>No he podido pintar esta pantalla: ' + esc(x.message) + '</span></div>'; }
  },
  /* Cambiar de sección (barra de abajo): fundido suave. */
  raiz(id, params) {
    const viejas = this.pila.slice();
    const e = this.crear(id, params, true);
    e.el.classList.add('entra-f');
    this.pila = [e];
    requestAnimationFrame(() => requestAnimationFrame(() => e.el.classList.remove('entra-f')));
    viejas.forEach(v => { v.el.style.opacity = '0'; setTimeout(() => v.el.remove(), 330); });
    this.barra();
    Sync.programar();
  },
  /* Abrir una pantalla encima: entra desde la derecha. */
  ir(id, params) {
    const ant = this.actual();
    const e = this.crear(id, params);
    e.el.classList.add('entra-d');
    this.pila.push(e);
    requestAnimationFrame(() => requestAnimationFrame(() => { e.el.classList.remove('entra-d'); if (ant) ant.el.classList.add('sale-i'); }));
    this.barra();
    Sync.programar();
    return e;
  },
  atras(n) {
    n = n || 1;
    if (this.pila.length <= 1) return;
    for (let i = 0; i < n && this.pila.length > 1; i++) {
      const e = this.pila.pop();
      e.el.classList.add('entra-d');
      setTimeout(() => e.el.remove(), 340);
      if (P[e.id].alSalir) try { P[e.id].alSalir(e); } catch (x) { }
    }
    const a = this.actual();
    a.el.classList.remove('sale-i');
    this.refrescar(true);
    this.barra();
    Sync.programar();
  },
  /* Vuelve a pintar la pantalla de arriba conservando el desplazamiento. No pinta si se está escribiendo. */
  refrescar(forzar) {
    const e = this.actual();
    if (!e || (P[e.id].fija && !forzar)) return;
    const c = $('.pgc', e.el);
    const ae = document.activeElement;
    if (!forzar && ae && e.el.contains(ae) && /INPUT|TEXTAREA/.test(ae.tagName) && c.contains(ae)) { e.sucio = true; return; }
    const y = c.scrollTop;
    c.innerHTML = this.contenido(e);
    prepararCampos(c);
    c.scrollTop = y;
    if (P[e.id].tras) try { P[e.id].tras(e.el, e.params, e); } catch (x) { anotar('tras ' + e.id, x); }
    this.estado();
    this.barra();
  },
  estado() {
    const e = this.actual();
    if (!e) return;
    const b = $('[data-r="banda"]', e.el);
    if (b) b.innerHTML = banda();
  },
  barra() {
    let n = $('#nav');
    const e = this.actual();
    const ver = S.cfg && e && e.raiz;
    if (!ver) { if (n) n.classList.add('oculto'); return; }
    if (!n) { n = document.createElement('nav'); n.id = 'nav'; n.className = 'nav'; document.body.appendChild(n); }
    n.classList.remove('oculto');
    const raiz = this.pila[0] && this.pila[0].id;
    n.innerHTML = '<div class="navin">' + raices().map(x => '<a data-a="raiz" data-id="' + x[0] + '" class="' + (x[0] === raiz ? 'on' : '') + '" style="--k:' + COL[colorBarra(x)] + '">' + ic(x[1], 26, x[3]) + '<span>' + x[2] + '</span></a>').join('') + '</div>';
  }
};

/* Color de la cápsula de cada pestaña (1.4.0). */
const COLBARRA = { inicio: 0, tareas: 2, gastos: 7, menu: 1, mas: 6, compra: 1, agenda: 5, acuario: 4, notas: 6, documentos: 6, plantas: 3, medicacion: 3, coche: 5, coches: 5, turnos: 2, listasr: 6 };
const colorBarra = x => COLBARRA[x[0]] !== undefined ? COLBARRA[x[0]] : (x[3] || 0);

/* Aviso de conexión arriba de las pantallas principales. */
function banda() {
  const n = Sync.pendientes();
  if (S.red.viejo) return '<div class="banda">' + ic('aviso', 20, 1) + '<span>El script está en la versión ' + esc(S.sv) + ' y esta app necesita la ' + MIN_SCRIPT + '. Actualízalo.</span></div>';
  if (!S.red.ok && S.red.error && S.red.error.code === 'sinred') return '<div class="banda">' + ic('sin-conexion', 20, 7) + '<span>Sin conexión. ' + (n ? 'Se guardará al volver.' : 'Enseño lo último descargado.') + '</span></div>';
  if (!S.red.ok && S.red.error) return '<div class="banda" data-a="ir" data-id="sincronizacion">' + ic('error', 20, 0) + '<span>No se ha podido sincronizar. ' + (n ? n + ' cambio' + (n > 1 ? 's' : '') + ' esperando.' : '') + '</span></div>';
  return '';
}

/* ---------- toques: acciones, pulsación larga */
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-a]');
  if (!el || el.disabled) return;
  if (LP.cancelarClick) { LP.cancelarClick = false; ev.preventDefault(); return; }
  const f = ACC[el.dataset.a];
  if (!f) return;
  ev.preventDefault();
  try { const r = f(el, ev); if (r && r.catch) r.catch(e => { anotar(el.dataset.a, e); toast(e.message || 'Algo ha fallado'); }); }
  catch (e) { anotar(el.dataset.a, e); toast(e.message || 'Algo ha fallado'); }
});

const LP = { t: null, x: 0, y: 0, el: null, cancelarClick: false };
document.addEventListener('pointerdown', ev => {
  const el = ev.target.closest('[data-lp]');
  if (!el) return;
  LP.el = el; LP.x = ev.clientX; LP.y = ev.clientY;
  clearTimeout(LP.t);
  LP.t = setTimeout(() => {
    if (!LP.el) return;
    LP.cancelarClick = true;
    setTimeout(() => { LP.cancelarClick = false; }, 700);
    const f = ACC[LP.el.dataset.lp];
    if (f) f(LP.el);
    LP.el = null;
  }, 480);
});
const lpFuera = () => { clearTimeout(LP.t); LP.el = null; };
document.addEventListener('pointermove', ev => { if (LP.el && Math.hypot(ev.clientX - LP.x, ev.clientY - LP.y) > 10) lpFuera(); });
document.addEventListener('pointerup', lpFuera);
document.addEventListener('pointercancel', lpFuera);
document.addEventListener('contextmenu', ev => { if (ev.target.closest('[data-lp]')) ev.preventDefault(); });
/* Sin zoom con dos dedos (Safari ignora user-scalable en algunos casos). */
document.addEventListener('gesturestart', ev => { if (!ev.target.closest('.escena')) ev.preventDefault(); });

ACC.atras = () => Nav.atras();
ACC.ir = el => { const p = Object.assign({}, el.dataset); delete p.a; delete p.id; Nav.ir(el.dataset.id, p); };
ACC.raiz = el => { const e = Nav.actual(); if (Nav.pila.length === 1 && e.id === el.dataset.id) { $('.pgc', e.el).scrollTo({ top: 0, behavior: 'smooth' }); return; } Nav.raiz(el.dataset.id); };

/* ---------- hojas que suben desde abajo */
let hojaAbierta = null;
function abrirHoja(html, opts) {
  opts = opts || {};
  cerrarHoja(true);
  const capa = $('#capa');
  const velo = document.createElement('div'); velo.className = 'velo';
  const h = document.createElement('div'); h.className = 'hoja';
  h.innerHTML = '<i class="grab"></i><div class="hc">' + html + '</div>';
  capa.appendChild(velo); capa.appendChild(h);
  hojaAbierta = { h: h, velo: velo, alCerrar: opts.alCerrar };
  velo.addEventListener('click', () => cerrarHoja());
  /* Arrastrar hacia abajo para cerrar, solo si el contenido está arriba del todo. */
  let y0 = null, dy = 0;
  h.addEventListener('touchstart', e => { const hc = $('.hc', h); if (hc.scrollTop > 0 || e.target.closest('input,textarea')) { y0 = null; return; } y0 = e.touches[0].clientY; dy = 0; h.style.transition = 'none'; }, { passive: true });
  h.addEventListener('touchmove', e => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); if (dy > 0) h.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
  h.addEventListener('touchend', () => { if (y0 === null) return; h.style.transition = ''; h.style.transform = ''; if (dy > 90) cerrarHoja(); y0 = null; });
  prepararCampos(h);
  requestAnimationFrame(() => requestAnimationFrame(() => { velo.classList.add('ver'); h.classList.add('ver'); }));
  if (opts.montar) opts.montar(h);
  return h;
}
function cerrarHoja(rapido) {
  const o = hojaAbierta;
  if (!o) return;
  hojaAbierta = null;
  o.h.classList.remove('ver'); o.velo.classList.remove('ver');
  setTimeout(() => { o.h.remove(); o.velo.remove(); }, rapido ? 0 : 340);
  if (o.alCerrar) o.alCerrar();
}
ACC.cerrarHoja = () => cerrarHoja();

/* Pregunta con dos botones (nunca ventanas del navegador). */
function preguntar(titulo, texto, si, peligro) {
  return new Promise(ok => {
    let r = false;
    abrirHoja('<h3>' + esc(titulo) + '</h3>' + (texto ? '<p class="texto" style="margin-bottom:18px">' + texto + '</p>' : '') +
      '<div class="list"><button class="btn ' + (peligro ? 'pri' : 'pri') + '" data-a="hojaSi" style="' + (peligro ? 'background:#C8402B;color:#fff' : '') + '">' + esc(si) + '</button><button class="btn sec" data-a="cerrarHoja">Cancelar</button></div>',
      { alCerrar: () => ok(r) });
    ACC.hojaSi = () => { r = true; cerrarHoja(); };
  });
}

/* ---------- avisos abajo, con «Deshacer» */
let toastT = null;
function toast(msg, accion, fn) {
  const capa = $('#capa');
  $$('.toast', capa).forEach(t => { t.classList.remove('ver'); setTimeout(() => t.remove(), 340); });
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<span>' + esc(msg) + '</span>' + (accion ? '<button>' + esc(accion) + '</button>' : '');
  /* 1.4.0: los avisos bajan desde arriba, debajo de la hora: así nunca tapan el botón de abajo. */
  capa.appendChild(t);
  if (accion) $('button', t).addEventListener('click', () => { fn(); t.classList.remove('ver'); setTimeout(() => t.remove(), 340); });
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('ver')));
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.classList.remove('ver'); setTimeout(() => t.remove(), 340); }, accion ? 5000 : 3200);
}

/* Botón con ruedita mientras espera. */
async function conEspera(el, f) {
  if (el.classList.contains('cargando')) return;
  el.classList.add('cargando'); el.disabled = true;
  try { return await f(); } finally { el.classList.remove('cargando'); el.disabled = false; }
}
function mostrarError(el, msg) {
  if (!el) return toast(msg);
  el.innerHTML = msg ? '<div class="aviso mal">' + ic('error', 22, 0) + '<span>' + esc(msg) + '</span></div>' : '';
}

/* Copiar y pegar */
async function copiar(txt) {
  try { await navigator.clipboard.writeText(txt); return true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (x) { } ta.remove(); return ok;
  }
}
async function pegarEn(sel) {
  const el = $(sel, Nav.actual().el);
  try { const t = await navigator.clipboard.readText(); if (t) { el.value = t.trim(); el.dispatchEvent(new Event('input')); } }
  catch (e) { el.focus(); toast('Mantén el dedo en el recuadro y toca «Pegar».'); }
}

/* Tema: claro, oscuro o automático. */
function aplicarTema() {
  let t = 'auto';
  try { t = localStorage.getItem('rondaP-tema') || 'auto'; } catch (e) { }
  let o = t === 'oscuro';
  try { if (t === 'auto') o = matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { }
  document.documentElement.dataset.tema = o ? 'oscuro' : 'claro';
  /* La franja de la hora: el iPhone solo la repinta si la etiqueta theme-color se cambia por otra nueva. */
  const c = o ? '#1B262C' : '#FFFDF7', m = $('#tc');
  if (m && m.content !== c) { const n = document.createElement('meta'); n.name = 'theme-color'; n.id = 'tc'; n.content = c; m.parentNode.replaceChild(n, m); }
}
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aplicarTema); } catch (e) { }
/* Al volver a la app (por ejemplo, tras cambiar el modo en el iPhone) se vuelve a mirar el tema. */
document.addEventListener('visibilitychange', () => { if (!document.hidden) aplicarTema(); });
window.addEventListener('focus', aplicarTema);

/* ============================ LOGO Y ARRANQUE ============================ */
const cl = (x, a, b) => Math.min(b === undefined ? 1 : b, Math.max(a || 0, x));
const oB = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const oC = x => 1 - Math.pow(1 - x, 3);
const io = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const T0 = 3.0, TM = 0.95;

/* Coloca «r_nda» y calcula dónde va el anillo que hace de «o». */
function medirLogo(cont, topPx, fs) {
  /* 1.7.3: medidas de la «o» de Nunito ExtraBold fijas (por cada px de letra). Antes se medían con canvas y en el iPhone,
     si la letra aún no estaba lista para canvas, salían mal y el anillo quedaba alto. */
  const mo = { width: 0.589 * fs, actualBoundingBoxLeft: -0.03 * fs, actualBoundingBoxRight: 0.56 * fs, actualBoundingBoxAscent: 0.51 * fs, actualBoundingBoxDescent: 0.02 * fs };
  const oW = mo.actualBoundingBoxLeft + mo.actualBoundingBoxRight, oH = mo.actualBoundingBoxAscent + mo.actualBoundingBoxDescent;
  const sb = (mo.width - oW) / 2, D = oH * 1.15, padL = sb + 0.06 * fs, padR = sb + 0.01 * fs;
  cont.innerHTML = '<div class="logo" style="top:' + topPx + 'px;font-size:' + fs + 'px"><span class="logo-palabra" style="position:relative;display:inline-block"><span class="l">r</span><span class="ph" style="display:inline-block;height:1px;width:' + (padL + D + padR) + 'px"></span><i class="bl" style="display:inline-block;width:0;height:0"></i><span class="l">n</span><span class="l">d</span><span class="l">a</span></span></div><svg class="anillo"></svg>';
  const cr = cont.getBoundingClientRect(), p = $('.ph', cont).getBoundingClientRect(), bl = $('.bl', cont).getBoundingClientRect();
  const FAC = (37.5 + 10.4) * 2 / 100;
  return { cx: p.left - cr.left + padL + D / 2, cy: bl.bottom - cr.top - (mo.actualBoundingBoxAscent - mo.actualBoundingBoxDescent) / 2, S: D / FAC };
}
function dibujarAnillo(svg, t, T, START) {
  const m = io(cl((t - T0) / TM));
  const cx = START.cx + (T.cx - START.cx) * m, cy = START.cy + (T.cy - START.cy) * m, Sx = START.S + (T.S - START.S) * m, k = Sx / 100;
  let o = '';
  const rot = -110 * (1 - oC(cl((t - 0.2) / 1.6)));
  for (let i = 0; i < 8; i++) {
    const t0 = 0.35 + i * 0.12, p = cl((t - t0) / 0.55), e = oB(p), R = 37.5 * e, a = (i * 45 + rot) * Math.PI / 180;
    let s = cl(p * 2.2) * (0.55 + 0.45 * Math.min(1.25, e));
    const wv = cl((t - 1.9 - i * 0.07) / 0.5); s *= 1 + 0.16 * Math.sin(wv * Math.PI) * (1 - m);
    const q = cl((t - t0 - 0.28) / 0.6);
    if (q > 0 && q < 1 && m === 0) o += '<circle cx="' + (37.5 * Math.sin(a)).toFixed(2) + '" cy="' + (-37.5 * Math.cos(a)).toFixed(2) + '" r="' + (10.4 + 16 * oC(q)).toFixed(2) + '" fill="' + COL[i] + '" opacity="' + (0.28 * (1 - q)).toFixed(3) + '"/>';
    if (p > 0) o += '<circle cx="' + (R * Math.sin(a)).toFixed(2) + '" cy="' + (-R * Math.cos(a)).toFixed(2) + '" r="' + (10.4 * Math.max(s, 0)).toFixed(3) + '" fill="' + COL[i] + '"/>';
  }
  svg.innerHTML = '<g transform="translate(' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ') scale(' + k.toFixed(4) + ')">' + o + '</g>';
}
/* 1.7.2 · Arranque rápido: la palabra ya en su sitio; las bolas saltan una a una dentro de la «o» mientras el anillo gira un cuarto de vuelta.
   t va en «segundos de animación»: se dibuja a 1,333× para que dure 0,75 s. */
function dibujarAnilloRapido(svg, t, T) {
  const k = T.S / 100, rot = -90 * (1 - oC(cl(t / 0.95)));
  let o = '';
  for (let i = 0; i < 8; i++) {
    const t0 = 0.05 + i * 0.065, p = cl((t - t0) / 0.38), e = oB(p), R = 37.5 * e, a = (i * 45 + rot) * Math.PI / 180;
    const s = cl(p * 2.4) * (0.6 + 0.4 * Math.min(1.25, e));
    const q = cl((t - t0 - 0.2) / 0.45);
    if (q > 0 && q < 1) o += '<circle cx="' + (37.5 * Math.sin(a)).toFixed(2) + '" cy="' + (-37.5 * Math.cos(a)).toFixed(2) + '" r="' + (10.4 + 12 * oC(q)).toFixed(2) + '" fill="' + COL[i] + '" opacity="' + (0.3 * (1 - q)).toFixed(3) + '"/>';
    if (p > 0) o += '<circle cx="' + (R * Math.sin(a)).toFixed(2) + '" cy="' + (-R * Math.cos(a)).toFixed(2) + '" r="' + (10.4 * Math.max(s, 0)).toFixed(3) + '" fill="' + COL[i] + '"/>';
  }
  svg.innerHTML = '<g transform="translate(' + T.cx.toFixed(2) + ' ' + T.cy.toFixed(2) + ') scale(' + k.toFixed(4) + ')">' + o + '</g>';
}
/* Logo quieto (bienvenida, Acerca de). */
function logoQuieto(cont, topPx, fs) {
  const T = medirLogo(cont, topPx, fs);
  const svg = $('svg.anillo', cont);
  svg.setAttribute('width', cont.clientWidth); svg.setAttribute('height', cont.clientHeight);
  svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';
  dibujarAnillo(svg, 10, T, T);
}

/* Animación al abrir: «rápida» si ya hay espacio, «bienvenida» (a su ritmo) la primera vez. */
function animarArranque(modo) {
  return new Promise(async ok => {
    const ar = $('#arranque');
    /* Esperar a que la letra Nunito esté cargada: con otra letra, el hueco de la «o» se mide mal y el anillo acaba descolocado. */
    try { await Promise.race([document.fonts.load('800 88px Nunito').then(() => document.fonts.ready), espera(3000)]); } catch (e) { }
    let W, H, fs, T, svg, letras, CY;
    const montar = () => {
      /* El tamaño de la pantalla se lee cada vez: al abrir desde el icono, el iPhone puede tardar un instante en darlo bien. */
      W = innerWidth; H = innerHeight;
      fs = Math.round(88 * Math.min(1, W / 390));
      CY = centroPantalla(H);
      if (modo === 'b') T = medirLogo(ar, Math.round(H * 318 / 844), fs);
      else { const t0 = medirLogo(ar, 0, fs); T = medirLogo(ar, Math.round(CY - t0.cy), fs); }
      svg = $('svg.anillo', ar);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      letras = $$('.l', ar);
    };
    montar();
    let remedido = false;
    const START = { cx: W / 2, cy: modo === 'b' ? H * 422 / 844 : CY, S: 200 * Math.min(1, W / 390) };
    const K = modo === 'b' ? 1 : 2;
    const FIN = T0 + 0.3 + 3 * 0.1 + 0.55 + 0.25;
    if (REDUCIR) { dibujarAnillo(svg, 10, T, T); letras.forEach(l => { l.style.opacity = 1; }); await espera(500); return ok(); }
    const t0 = performance.now();
    /* 1.7.2: al abrir con espacio ya creado, la animación corta (0,75 s); la bienvenida de la primera vez queda igual */
    if (modo !== 'b') {
      const rapido = now => {
        const t = (now - t0) / 1000 * 1.333;
        /* Al abrir desde el icono, el iPhone puede tardar un momento en dar el alto real de la pantalla: se recoloca al principio */
        if (now - t0 < 450) { try { const h0 = H; W = innerWidth; H = innerHeight; if (H !== h0) montar(); } catch (e) { } }
        dibujarAnilloRapido(svg, t, T);
        letras.forEach((l, i) => { const p = oC(cl((t - i * 0.05) / 0.4)); l.style.opacity = p; l.style.transform = 'translateY(' + (10 * (1 - p)) + 'px)'; });
        if (t < 1.0) requestAnimationFrame(rapido); else { dibujarAnilloRapido(svg, 2, T); letras.forEach(l => { l.style.opacity = 1; l.style.transform = ''; }); ok(); }
      };
      requestAnimationFrame(rapido);
      return;
    }
    const paso = now => {
      const t = (now - t0) / 1000 * K;
      /* Justo antes de que el anillo viaje a la «o», se vuelve a medir con la letra ya cargada: así va directo a su sitio. */
      if (!remedido && t >= T0 - 0.2) { remedido = true; try { if (document.fonts.check('800 88px Nunito')) montar(); } catch (e) { } }
      dibujarAnillo(svg, t, T, START);
      letras.forEach((l, i) => { const p = oC(cl((t - (T0 + 0.3 + i * 0.1)) / 0.55)); l.style.opacity = p; l.style.transform = 'translateY(' + (18 * (1 - p)) + 'px)'; });
      if (t < FIN) requestAnimationFrame(paso); else ok();
    };
    requestAnimationFrame(paso);
  });
}
/* Mitad de la pantalla física. Abierta desde el icono, la franja de la hora no forma parte de la página:
   si no se tiene en cuenta, el logo queda más abajo del centro. */
function centroPantalla(H) {
  let off = 0;
  try {
    const port = innerHeight >= innerWidth;
    const hs = port ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
    const d = hs - H;
    if (enIcono() && d > 0 && d < 80) off = d;
  } catch (e) { }
  return (H + off) / 2 - off;
}
function quitarArranque() {
  const ar = $('#arranque');
  /* 1.4.2: la app no aparece de golpe: se funde suavemente mientras se va la animación */
  const capas = [$('#app'), $('#nav')].filter(Boolean);
  if (!REDUCIR) capas.forEach(c => c.classList.add('aparece'));
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ar.classList.add('fuera');
    capas.forEach(c => c.classList.add('ya'));
    setTimeout(() => { capas.forEach(c => c.classList.remove('aparece', 'ya')); }, 850);
  }));
  setTimeout(() => ar.remove(), 750);
}

/* Teclado del iPhone: las pantallas terminan encima del teclado, para que la barra de añadir y los botones se vean. */
(function () {
  const vv = window.visualViewport;
  if (!vv) return;
  const f = () => {
    const kb = Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop));
    const ae = document.activeElement;
    const escribiendo = ae && /INPUT|TEXTAREA/.test(ae.tagName) && !/range|file/.test(ae.type);
    document.documentElement.style.setProperty('--kb', kb + 'px');
    document.documentElement.classList.toggle('conteclado', escribiendo && kb > 80);
  };
  vv.addEventListener('resize', f); vv.addEventListener('scroll', f);
  document.addEventListener('focusin', () => setTimeout(f, 50));
  document.addEventListener('focusout', () => setTimeout(f, 50));
})();
const enIcono = () => { try { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; } catch (e) { return false; } };

/* ---------- campos: una ✕ para dejarlos vacíos (fechas, horas, textos) */
function prepararCampos(root) {
  $$('.fld', root).forEach(l => {
    const i = $('input:not([type=file]):not([type=checkbox]):not([type=range]),textarea', l);
    if (!i || l.hasAttribute('data-nox') || $('.xb', l) || $('button', l)) return; /* 1.4.1: si el campo ya lleva un botón (Buscar…), sin ✕ */
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'xb'; b.dataset.a = 'limpiarCampo'; b.setAttribute('aria-label', 'Borrar');
    b.innerHTML = ic('cerrar', 14);
    l.appendChild(b);
    l.classList.toggle('lleno', !!i.value);
  });
}
const marcaLleno = ev => { const t = ev.target; if (!t || !t.closest) return; const l = t.closest('.fld'); if (l && $('.xb', l)) l.classList.toggle('lleno', !!t.value); };
document.addEventListener('input', marcaLleno, true);
document.addEventListener('change', marcaLleno, true);
ACC.limpiarCampo = el => {
  const l = el.closest('.fld'), i = l && $('input,textarea', l);
  if (!i) return;
  i.value = '';
  i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true }));
  l.classList.remove('lleno');
};

/* ---------- volver deslizando desde el borde izquierdo, como en las apps del iPhone */
(function () {
  let sw = null;
  document.addEventListener('touchstart', ev => {
    sw = null;
    if (ev.touches.length !== 1 || hojaAbierta || Nav.pila.length < 2) return;
    const t = ev.touches[0];
    if (t.clientX > 26) return;
    const top = Nav.actual(), prev = Nav.pila[Nav.pila.length - 2];
    if (!top || top.raiz || P[top.id].sinDeslizar || document.querySelector('.recorte.ver,.celebra')) return;
    sw = { x0: t.clientX, y0: t.clientY, top: top, prev: prev, activo: false, dx: 0, hist: [[t.clientX, Date.now()]] };
  }, { passive: true });
  document.addEventListener('touchmove', ev => {
    if (!sw) return;
    const t = ev.touches[0], dx = t.clientX - sw.x0, dy = t.clientY - sw.y0;
    if (!sw.activo) {
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { sw = null; return; }
      if (dx < 6) return;
      sw.activo = true;
      [sw.top.el, sw.prev.el].forEach(e => { e.style.transition = 'none'; });
      const ae = document.activeElement; if (ae && ae.blur && ae !== document.body) ae.blur();
    }
    ev.preventDefault();
    const W = innerWidth;
    sw.dx = Math.max(0, Math.min(W, dx));
    const p = sw.dx / W;
    sw.top.el.style.transform = 'translateX(' + sw.dx + 'px)';
    sw.prev.el.style.transform = 'translateX(' + (-28 * (1 - p)) + '%)';
    sw.prev.el.style.opacity = String(0.6 + 0.4 * p);
    sw.hist.push([t.clientX, Date.now()]); if (sw.hist.length > 6) sw.hist.shift();
  }, { passive: false });
  const fin = () => {
    const s = sw; sw = null;
    if (!s || !s.activo) return;
    const a = s.hist[0], b = s.hist[s.hist.length - 1];
    const vel = (b[0] - a[0]) / Math.max(1, b[1] - a[1]);
    const volver = s.dx > innerWidth * 0.4 || (vel > 0.45 && s.dx > 30);
    [s.top.el, s.prev.el].forEach(e => { e.style.transition = ''; e.style.transform = ''; e.style.opacity = ''; });
    if (volver) Nav.atras();
  };
  document.addEventListener('touchend', fin);
  document.addEventListener('touchcancel', fin);
})();
