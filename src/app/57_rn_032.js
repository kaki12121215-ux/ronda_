/* ===================== 0.3.2 · las dos animaciones aprobadas en MP4 =====================
   1. «Más»: la barra se abre y se convierte en la hoja «Secciones». Las pestañas quedan como base de la hoja,
      las secciones llegan en ola desde la esquina de «Más» y, detrás, la pantalla se difumina y retrocede.
   2. Dilo: mantener pulsado el «+» un segundo. El «+» se encoge mientras un aro con los 8 colores se completa; después
      se convierte en el anillo de bolitas, que sube en arco hasta el centro. Al cerrar, baja y vuelve a ser el «+».
      El micrófono ya no está en la cabecera de Inicio. Dilo también se abre desde la hoja «Añadir» y desde Compra.
   3. Arranque: Inicio (o la bienvenida) ya está pintado debajo cuando «R◯nda» se va: sin hueco vacío.
      En la bienvenida, la palabra se desliza desde el centro hasta su sitio y entran el texto y los botones.
   Con «Reducir movimiento», todo son fundidos. */

/* ---------- 1. «Más» ---------- */
let RN_MAS_ABIERTA = false, RN_MAS_ELIGE = false;
Nav.barra = function () {
  let n = $('#nav');
  if (!n) { n = document.createElement('nav'); n.id = 'nav'; n.setAttribute('aria-label', 'Secciones'); document.body.appendChild(n); }
  const raiz = this.pila[0], top = this.actual();
  const fuera = !raiz || P[raiz.id].sinBarra || (top && (P[top.id].sinBarra || (!top.raiz && !P[top.id].rn)));
  if (fuera) { n.className = 'rn-barra rn-b5 rn-oculta'; try { rnColorFondo(); } catch (x) { } return; }
  const b = rnBarra(), tabs = [['inicio', 'inicio', 'Inicio'], [b[0], RN_SEC[b[0]][1], rnNomTab(b[0])], null, [b[1], RN_SEC[b[1]][1], rnNomTab(b[1])], ['mas', 'menu', 'Más']];
  const activa = RN_MAS_ABIERTA || !tabs.some(x => x && x[0] === raiz.id) ? 'mas' : raiz.id;
  const k = rnColorDe(raiz.id, raiz.params), gris = RN_MAS_ABIERTA || activa === 'inicio' || !k || k === 'neutro';
  n.className = 'rn-barra rn-b5';
  n.innerHTML = '<div class="rn-b5c"><i class="rn-pil' + (gris ? ' rn-pil-gris' : ' rn-k-' + k) + '"></i>' + tabs.map(x => x === null
    ? '<button class="rn-plus5' + (Dilo.el || RN_DILO.vuelo ? ' rn-plus-ido' : '') + '" data-a="rnPlus" aria-label="Añadir. Mantén pulsado para Dilo">' + rnIc('anadir', 24, 2.2) + '</button>'
    : '<button class="rn-tab' + (x[0] === activa ? ' rn-on' + (gris ? ' rn-gris' : '') : '') + '" data-a="rnTab" data-id="' + x[0] + '" aria-label="' + x[2] + '"' + (x[0] === activa ? ' aria-current="page"' : '') + '><i>' + rnIc(x[1], 22, x[0] === activa ? 2.1 : 1.8) + '</i><span>' + x[2] + '</span></button>').join('') + '</div>';
  rnPildora(n);
  try { rnColorFondo(); } catch (x) { }
};
function rnSecciones() {
  if (RN_MAS_ABIERTA) return cerrarHoja();
  const act = Nav.pila[0] && Nav.pila[0].id, r = document.documentElement;
  const h = abrirHoja(rnCabHoja('Secciones', '<button class="rn-x" data-a="rnBuscar" aria-label="Buscar">' + rnIc('buscar', 22, 2) + '</button>') +
    '<div class="rn-secs">' + RN_ORDEN_SEC.map(k => '<button class="rn-sc rn-k-' + RN_SEC[k][2] + (k === act ? ' rn-on' : '') + '" data-a="rnSecElegir" data-id="' + k + '">' + rnChip(RN_SEC[k][1], 40) + '<span>' + RN_SEC[k][0] + '</span></button>').join('') + '</div>',
    { clase: 'rn-hj-sec rn-hj-mas', alCerrar: () => {
      RN_MAS_ABIERTA = false; r.classList.remove('rn-prof');
      /* 0.3.5: la barra deja de estar por encima justo cuando la hoja ya no está (antes, 20 ms antes: la hoja blanca la tapaba un instante y parpadeaba) */
      const suelta = () => { if (RN_MAS_ABIERTA) return; if (h && h.isConnected) return requestAnimationFrame(suelta); r.classList.remove('rn-mas'); };
      setTimeout(suelta, 300);
      if (!RN_MAS_ELIGE) Nav.barra();
    } });
  RN_MAS_ABIERTA = true;
  /* 0.3.3: el hueco de la barra, en píxeles (en el iPhone, con porcentajes, la hoja no crecía: aparecía de golpe) */
  h.style.setProperty('--ct', Math.max(0, h.offsetHeight - 82) + 'px'); h.getBoundingClientRect();
  if (hojaAbierta) hojaAbierta.velo.classList.add('rn-velo-prof');
  r.classList.add('rn-mas', 'rn-prof');
  Nav.barra();
  /* La ola: cada sección sale desde la esquina de «Más», las más cercanas primero */
  const m = $('#nav .rn-tab[data-id="mas"]'), o = m ? m.getBoundingClientRect() : { left: innerWidth - 60, top: innerHeight - 60, width: 0, height: 0 };
  const ox = o.left + o.width / 2, oy = o.top + o.height / 2;
  $$('.rn-sc', h).forEach(c => { const q = c.getBoundingClientRect(), dx = ox - (q.left + q.width / 2), dy = oy - (q.top + q.height / 2), d = Math.hypot(dx, dy) || 1; c.style.setProperty('--d', Math.round(80 + d / 1.5) + 'ms'); c.style.setProperty('--ux', (dx / d * 14).toFixed(1) + 'px'); c.style.setProperty('--uy', (dy / d * 14).toFixed(1) + 'px'); });
  return h;
}
const _secElegir57 = ACC.rnSecElegir;
ACC.rnSecElegir = el => { RN_MAS_ELIGE = true; setTimeout(() => { RN_MAS_ELIGE = false; Nav.barra(); }, 520); return _secElegir57(el); };
ACC.rnTab = el => {
  if (RN_MR && RN_MR.anular) return;
  const k = el.dataset.id;
  if (RN_MAS_ABIERTA) { cerrarHoja(); if (k !== 'mas') setTimeout(() => rnAbrir(k), 160); return; }
  rnAbrir(k);
};

/* ---------- 2. Dilo desde el «+» ---------- */
const RN_DILO = { t: null, raf: 0, x0: 0, y0: 0, armado: false, vuelo: false, pulsado: false, desdeMas: false };
const rnE = { cl: x => Math.max(0, Math.min(1, x)), lerp: (a, b, t) => a + (b - a) * t,
  bez(x1, y1, x2, y2) { return x => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, u = .5; for (let i = 0; i < 24; i++) { u = (lo + hi) / 2; const bx = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u; if (bx < x) lo = u; else hi = u; } return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u; }; },
  muelle(t, k, c) { if (t <= 0) return 0; const w0 = Math.sqrt(k), z = c / (2 * w0), wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)); } };
rnE.entrar = rnE.bez(.2, 0, 0, 1); rnE.io = rnE.bez(.45, 0, .15, 1); rnE.rellenar = rnE.bez(.2, .7, .2, 1);
function rnLienzo() {
  let s = $('#rn-vuelo');
  if (!s) { s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.id = 'rn-vuelo'; s.setAttribute('aria-hidden', 'true'); document.body.appendChild(s); }
  s.setAttribute('viewBox', '0 0 ' + innerWidth + ' ' + innerHeight); s.setAttribute('width', innerWidth); s.setAttribute('height', innerHeight);
  return s;
}
const rnPlusCentro = () => { const p = $('#nav:not(.rn-oculta) .rn-plus5'); if (!p) return null; const r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, el: p }; };
const rnMezcla = (c1, c2, t) => { const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)), a = p(c1), b = p(c2); return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',') + ')'; };
/* El aro de progreso alrededor del «+» (0 a 1) */
function rnAroProgreso(c, pr, sc) {
  /* 0.3.3: más gruesa y más lejos del botón, para que se vea alrededor del dedo */
  const R = 26 * sc + 13, N = 96, n = Math.round(N * pr); let h = '';
  for (let k = 0; k < n; k++) { const a0 = k / N * 2 * Math.PI, a1 = (k + 1.25) / N * 2 * Math.PI, ci = k / N * 8; h += '<path d="M' + (c.x + R * Math.sin(a0)).toFixed(2) + ' ' + (c.y - R * Math.cos(a0)).toFixed(2) + 'A' + R + ' ' + R + ' 0 0 1 ' + (c.x + R * Math.sin(a1)).toFixed(2) + ' ' + (c.y - R * Math.cos(a1)).toFixed(2) + '" stroke="' + rnMezcla(RN_LOGO[Math.floor(ci) % 8], RN_LOGO[(Math.floor(ci) + 1) % 8], ci % 1) + '"/>'; }
  return '<g fill="none" stroke-width="7" stroke-linecap="round" opacity=".95">' + h + '</g>';
}
/* El anillo en un punto del viaje: p (0 en el «+», 1 arriba), S escala, rot giro, m separación, a opacidad */
function rnAnilloSvg(P0, P1, p, S, rot, tam, m, a) {
  const PC = { x: P0.x + 78, y: rnE.lerp(P0.y, P1.y, .46) }, x = (1 - p) * (1 - p) * P0.x + 2 * (1 - p) * p * PC.x + p * p * P1.x, y = (1 - p) * (1 - p) * P0.y + 2 * (1 - p) * p * PC.y + p * p * P1.y;
  let h = '';
  for (let i = 0; i < 8; i++) { const mi = typeof m === 'function' ? m(i) : m, ai = typeof a === 'function' ? a(i) : a, g = (i * 45 + rot) * Math.PI / 180; if (ai <= 0) continue; h += '<circle cx="' + (x + .36 * tam * S * mi * Math.sin(g)).toFixed(2) + '" cy="' + (y - .36 * tam * S * mi * Math.cos(g)).toFixed(2) + '" r="' + (.1 * tam * S * (.6 + .4 * Math.min(1, mi))).toFixed(2) + '" fill="' + RN_LOGO[i] + '" opacity="' + ai.toFixed(3) + '"/>'; }
  return h;
}
const RN_S0 = .38, RN_M0 = .58;
function rnDestinoDilo() { const d = Dilo.el && $('.dring svg', Dilo.el); if (!d) return { x: innerWidth / 2, y: innerHeight * .3, tam: 146 }; const r = d.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, tam: r.width || 146 }; }
/* Subida: del «+» al centro */
function rnDiloSube(P0) {
  const s = rnLienzo(), t0 = performance.now(); RN_DILO.vuelo = true;
  const ring = Dilo.el && $('.dring', Dilo.el); if (ring) ring.classList.add('rn-espera-vuelo');
  const paso = now => {
    const t = (now - t0) / 1000, D = rnDestinoDilo(), tt = t - .1;
    const p = rnE.muelle(tt, 170, 22), S = rnE.lerp(RN_S0, 1, rnE.muelle(tt, 170, 17)), rot = -120 * (1 - rnE.entrar(rnE.cl(tt / .7)));
    const m = i => rnE.lerp(RN_M0, 1, rnE.entrar(rnE.cl((t - .02 * i) / .18))), a = i => rnE.cl((t - .02 * i) / .07);
    let h = '';
    if (tt > 0 && t < .72) { const f = 1 - rnE.cl((t - .56) / .16); [2, 1].forEach(k => { const t2 = tt - .035 * k; if (t2 > 0) h += '<g opacity="' + ([.16, .09][k - 1] * f).toFixed(3) + '">' + rnAnilloSvg(P0, D, rnE.muelle(t2, 170, 22), rnE.lerp(RN_S0, 1, rnE.muelle(t2, 170, 17)), -120 * (1 - rnE.entrar(rnE.cl(t2 / .7))), D.tam, 1, 1) + '</g>'; }); }
    s.innerHTML = h + rnAnilloSvg(P0, D, p, S, rot, D.tam, m, a);
    if (t < .82 && Dilo.el) RN_DILO.raf = requestAnimationFrame(paso);
    else { s.innerHTML = ''; RN_DILO.vuelo = false; if (ring) ring.classList.remove('rn-espera-vuelo'); }
  };
  RN_DILO.raf = requestAnimationFrame(paso);
}
/* Bajada: del centro al «+», que vuelve a aparecer */
function rnDiloBaja(D) {
  const c = rnPlusCentro(); const fin = () => { RN_DILO.vuelo = false; const p = $('.rn-plus5'); if (p) { p.classList.remove('rn-plus-ido'); p.classList.add('rn-plus-vuelve'); setTimeout(() => p.classList.remove('rn-plus-vuelve'), 320); } };
  if (!c || REDUCIR || !D) return fin();
  const s = rnLienzo(), t0 = performance.now(); RN_DILO.vuelo = true; cancelAnimationFrame(RN_DILO.raf);
  const paso = now => {
    const t = (now - t0) / 1000;
    if (t < .45) { const q = rnE.io(t / .45); s.innerHTML = rnAnilloSvg(c, D, 1 - q, rnE.lerp(1, RN_S0, q), -120 * q, D.tam, 1, 1); }
    else { const u = (t - .45) / .12, e = rnE.entrar(rnE.cl(u)); s.innerHTML = rnAnilloSvg(c, D, 0, RN_S0, -120, D.tam, rnE.lerp(1, RN_M0, e), 1 - rnE.cl((u - .45) / .55)); }
    if (t < .57) requestAnimationFrame(paso); else { s.innerHTML = ''; fin(); }
  };
  requestAnimationFrame(paso);
}
/* Abrir y cerrar Dilo: a pantalla completa, con el fondo difuminado y la pantalla un paso atrás */
const _diloAbrir57 = Dilo.abrir, _diloCerrar57 = Dilo.cerrar, _diloEscuchar57 = Dilo.escuchar, _diloRes57 = Dilo.resultado;
Dilo.abrir = function (modo, desdeMas) {
  if (this.el) return;
  const c = desdeMas ? rnPlusCentro() : null;
  if (desdeMas === 'espera') this.escuchar = function () { this.modo = 'escucha'; this.cuerpo('<p class="live" data-r="live"></p><p class="cap">Suelta y habla con normalidad</p>', '<button class="btn sec" data-a="diloEscribir">' + ic('teclado', 20) + 'Escribir</button><button class="btn pri" data-a="diloListo">Listo</button>'); };
  try { _diloAbrir57.call(this, modo); } finally { this.escuchar = _diloEscuchar57; }
  if (!this.el) return;
  $$('.dring circle', this.el).forEach((x, i) => x.setAttribute('fill', RN_LOGO[i % 8]));
  document.documentElement.classList.add('rn-prof', 'rn-prof-nav');
  RN_DILO.desdeMas = !!c;
  const p = $('.rn-plus5'); if (p && c) p.classList.add('rn-plus-ido');
  if (c && !REDUCIR) rnDiloSube(c);
};
Dilo.cerrar = function () {
  if (!this.el) return;
  const D = rnDestinoDilo(), vis = !$('.dring', this.el).classList.contains('peq');
  cancelAnimationFrame(RN_DILO.raf); const s = $('#rn-vuelo'); if (s) s.innerHTML = '';
  this.el.classList.add('rn-dilo-cierra');
  _diloCerrar57.call(this);
  document.documentElement.classList.remove('rn-prof', 'rn-prof-nav');
  if (RN_DILO.desdeMas) rnDiloBaja(vis ? D : null);
  RN_DILO.desdeMas = false;
};
Dilo.resultado = function () { if (!EN_CASA && this.aviso) this.aviso = 'Con los datos de ejemplo lo ordena el móvil solo. Conectado a vuestra casa, lo afina Google.'; return _diloRes57.call(this); };
ACC.rnDilo = () => Dilo.abrir();
ACC.rnDiloHoja = () => { cerrarHoja(); setTimeout(() => Dilo.abrir(null, true), 200); };

/* Mantener pulsado el «+»: un segundo */
(function () {
  const cancelar = () => {
    clearTimeout(RN_DILO.t); RN_DILO.t = null; cancelAnimationFrame(RN_DILO.rafP); RN_DILO.pulsado = false;
    const p = $('.rn-plus5.rn-cargando'); if (p) p.classList.remove('rn-cargando');
    if (!RN_DILO.vuelo) { const s = $('#rn-vuelo'); if (s) s.innerHTML = ''; }
  };
  document.addEventListener('pointerdown', ev => {
    const p = ev.target.closest && ev.target.closest('#nav .rn-plus5'); if (!p || Dilo.el || hojaAbierta || RN_DILO.vuelo) return;
    const c = rnPlusCentro(); if (!c) return;
    RN_DILO.x0 = ev.clientX; RN_DILO.y0 = ev.clientY; RN_DILO.pulsado = true; RN_DILO.armado = false;
    if (!REDUCIR) {
      p.classList.add('rn-cargando');
      const s = rnLienzo(), t0 = performance.now();
      const paso = now => { if (!RN_DILO.t) return; const pr = rnE.cl((now - t0 - 120) / 880); s.innerHTML = rnAroProgreso(c, pr, 1 - .12 * rnE.cl((now - t0) / 1000)); RN_DILO.rafP = requestAnimationFrame(paso); };
      RN_DILO.rafP = requestAnimationFrame(paso);
    }
    RN_DILO.t = setTimeout(() => {
      RN_DILO.t = null; cancelAnimationFrame(RN_DILO.rafP);
      LP.cancelarClick = true; setTimeout(() => { LP.cancelarClick = false; }, 900);
      p.classList.remove('rn-cargando');
      /* El aro se cierra y destella una vez */
      const s = $('#rn-vuelo'); if (s && !REDUCIR) { const d = document.createElement('div'); d.className = 'rn-destello'; d.style.left = c.x + 'px'; d.style.top = c.y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 300); s.innerHTML = ''; }
      RN_DILO.armado = true;
      Dilo.abrir(null, RN_DILO.pulsado ? 'espera' : true);
    }, 1000);
  }, true);
  document.addEventListener('pointermove', ev => { if (RN_DILO.t && Math.hypot(ev.clientX - RN_DILO.x0, ev.clientY - RN_DILO.y0) > 12) cancelar(); }, true);
  const soltar = ev => {
    const armado = RN_DILO.armado; RN_DILO.armado = false;
    if (RN_DILO.t) cancelar(); RN_DILO.pulsado = false;
    /* Al soltar (un toque de verdad, que es lo que pide el iPhone para el micrófono), empieza a escuchar */
    if (armado && (!ev || ev.pointerType !== 'touch') && Dilo.el && Dilo.modo === 'escucha' && !Dilo.rec && hayVoz()) Dilo.escuchar();   /* con el dedo, lo arranca el touchend (58_rn_033.js) */
  };
  document.addEventListener('pointerup', soltar, true); document.addEventListener('pointercancel', soltar, true);
})();

/* La hoja «Añadir» enseña también Dilo (para que se sepa que existe) */
const _anadir57 = P.inicio.rnPlus;
P.inicio.rnPlus = () => { const h = _anadir57(); const c = hojaAbierta && $('.rn-hjc', hojaAbierta.h); if (c) c.insertAdjacentHTML('beforeend', '<button class="rn-dilo-fila" data-a="rnDiloHoja"><span class="rn-dilo-pts">' + rnPuntos(26, .12) + '</span><span class="rn-fat"><span class="rn-t">Dilo o escríbelo</span><span class="rn-n">También manteniendo pulsado el «+» un segundo</span></span>' + rnFle + '</button>'); return h; };

/* ---------- 3. Arranque sin hueco, y la bienvenida como continuación ---------- */
async function rnArrancar() {
  const ar = $('#arranque');
  aplicarTema();
  const anim = ar ? rnAnimarArranque(ar) : Promise.resolve();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(e => anotar('sw', e));
  let destino = 'inicio';
  if (EN_CASA) {
    const ok = await cargarCasa();
    if (!ok) { try { localStorage.removeItem('rondaP-modo'); localStorage.removeItem('rondaP-casa'); } catch (e) { } location.reload(); return; }
    let onb = ''; try { onb = localStorage.getItem('rondaP-onb-pend') || ''; } catch (e) { }
    if (onb) destino = 'onb';
  } else {
    await cargarPrueba();
    if (!rnModoElegido()) destino = 'bienvenida';
  }
  await anim;
  Nav.raiz(destino, destino === 'onb' ? { paso: 0 } : {});
  RN_ARRANCANDO = false;
  /* La pantalla ya está entera debajo (sin su fundido de entrada): al irse la palabra no se ve ningún hueco */
  const pg = Nav.actual() && Nav.actual().el;
  if (pg) { pg.style.transition = 'none'; pg.classList.remove('entra-f'); pg.getBoundingClientRect(); setTimeout(() => { pg.style.transition = ''; }, 60); }
  if (!ar) return;
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const pal = pg && destino === 'bienvenida' && $('.rn-pal-bienv', pg), org = $('.rn-arr5:not(.rn-arr-pre)', ar) || $('.rn-arr5', ar);
  if (pal && org && !REDUCIR) {
    /* La palabra se desliza del centro a su sitio; el texto y los botones entran después */
    const a = org.getBoundingClientRect(), b = pal.getBoundingClientRect();
    pal.style.opacity = 0; pg.classList.add('rn-bv-entra'); ar.classList.add('rn-a-bienv');
    org.style.transform = 'translate(calc(-50% + ' + (b.left + b.width / 2 - a.left - a.width / 2).toFixed(1) + 'px), calc(-50% + ' + (b.top + b.height / 2 - a.top - a.height / 2).toFixed(1) + 'px)) scale(' + (b.width / a.width).toFixed(4) + ')';
    setTimeout(() => { pal.style.opacity = ''; ar.remove(); }, 640);
    setTimeout(() => pg.classList.remove('rn-bv-entra'), 1600);
  } else { ar.classList.add('rn-fuera'); setTimeout(() => ar.remove(), 620); }
}
