/* ===================== 0.3.0 · INICIO CON TODAS LAS TARJETAS =====================
   - Las 56 tarjetas de la app de hoy, con el diseño nuevo. Cada una conserva su tamaño (S, media; L, entera).
   - Las cinco que ya tenían JPG (Mis tareas, Menú de la semana, Añadir a la compra, Añadir gasto, Plantas) van con su pieza propia.
     Las demás llevan la cabecera nueva (icono sin fondo en el color de su sección y título) y su contenido de hoy con el traje nuevo.
   - «Tu inicio»: arrastrar, el ojo, la rueda, «Añadir tarjeta», «Plantillas», las ocultas y «Restablecer el orden original».
   - El orden, las ocultas y los ajustes de cada tarjeta parten de lo que ya tenías en la hoja y luego se guardan SOLO en este móvil
     (50_rn_casa.js: fijarInicio, fijarCfg). Cambiar Inicio aquí no cambia el Inicio de la app de hoy.
   - Las tarjetas «de hoy» salen siempre, aunque no haya nada («Nada para hoy»). */
const RN_SEC_DE = { Agenda: 'agenda', Tareas: 'tareas', Compra: 'compra', Gastos: 'gastos', 'Cuentas compartidas': 'gastos', 'Menú': 'menu', Notas: 'notas', Documentos: 'documentos', Plantas: 'plantas', 'Medicación': 'medicacion', Acuario: 'acuario', Coches: 'coche', Turnos: 'turnos', Tiempo: '', Varios: '' };
const RN_W = { tareas: () => rnWTareas(), semana: () => rnWMenu(), rapido: () => rnWCompra(), gastoRapido: () => rnWGasto(), plantas: () => rnWPlantas() };
const rnWSec = k => RN_SEC_DE[(W[k] || {}).sec] || '';
const rnWColor = k => { const s = rnWSec(k); if (s) return RN_SEC[s][2]; return (W[k] || {}).sec === 'Tiempo' ? 'azul' : 'neutro'; };
const rnWIcono = k => { const s = rnWSec(k); if (s) return RN_SEC[s][1]; return (W[k] || {}).sec === 'Tiempo' ? 'sol' : ({ accesos: 'menu', rutinas: 'repetir', ultCambios: 'reloj', resumen: 'nota' }[k] || 'inicio'); };
/* La tarjeta de hoy dentro del marco nuevo: la cabecera de la app de hoy se cambia por la nueva */
function rnWGenerica(k) {
  const w = W[k]; let r;
  try { r = w.f() || {}; } catch (e) { anotar('tarjeta ' + k, e); r = { h: lab(w.t) + '<p class="mu2">No se ha podido pintar</p>' }; }
  let h = String(r.h || ''), der = '';
  const m = h.match(/^\s*<div class="wl"><span>([\s\S]*?)<\/span>([\s\S]*?)<\/div>/);
  let tit = w.t;
  if (m) { tit = m[1] || w.t; der = m[2] || ''; h = h.slice(m[0].length); }
  if (!h.replace(/<[^>]+>/g, '').trim() && !/<(svg|img|input|button)/.test(h)) h = '<p class="mu2">Nada por ahora</p>';
  return '<div class="rn-cd rn-gl rn-wgen rn-k-' + rnWColor(k) + '">' + rnCab(rnWIcono(k), tit, der ? '<span class="rn-wder rn-viejo">' + der + '</span>' : '') + '<div class="rn-viejo rn-wv">' + h + '</div></div>';
}
function rnTarjeta(k, modo) {
  const w = W[k]; if (!w) return '';
  let h;
  try { h = RN_W[k] ? RN_W[k]() : rnWGenerica(k); } catch (e) { anotar('tarjeta ' + k, e); h = rnCd(rnCab(rnWIcono(k), w.t) + '<p class="rn-n rn-vacio">No se ha podido pintar</p>'); }
  const ctl = modo === 'edit' || modo === 'hid' ? '<span class="rn-wctl"><button class="rn-wbt" data-a="wOjo" data-k="' + k + '" aria-label="' + (modo === 'hid' ? 'Mostrar' : 'Ocultar') + ' «' + esc(w.t) + '»">' + rnIc(modo === 'hid' ? 'ojo-tachado' : 'ojo', 20, 2) + '</button><button class="rn-wbt" data-a="rnWRueda" data-k="' + k + '" aria-label="Ajustes de «' + esc(w.t) + '»">' + rnIc('ajustes', 20, 2) + '</button></span>' : '';
  return '<div class="rn-wcard rn-wc-' + w.sz + (modo ? ' rn-w-' + modo : '') + '" data-w="' + k + '"' + (modo ? '' : ' data-lp="rnEditarInicio" data-a="rnWAbrir" data-k="' + k + '"') + '>' + h + ctl + '</div>';
}
ACC.rnWAbrir = (el, ev) => {
  if (LP.cancelarClick) return;
  if (ev && ev.target && ev.target.closest && ev.target.closest('input,textarea,select,label,a,button')) return;
  ACC.wAbrir(el, ev);
};

/* Cabecera de Inicio con Dilo (opción A: micrófono en un círculo de cristal) */
function rnCabInicio() {
  const e = espacio(), ps = personas(), yoN = ((yo() || {}).nombre || '').split(' ')[0];
  return '<div class="rn-icab"><div class="rn-marca"><span class="rn-logo">' + rnPuntos(24, .125) + '</span><b>' + esc(e.nombre || '') + '</b></div><div class="rn-avs">' + ps.map(p => rnAv(p, 32)).join('') + '</div></div>' +   /* 0.3.2: Dilo ya no va aquí: se abre manteniendo pulsado el «+» */
    '<p class="rn-fecha">' + fechaLarga(new Date()) + '</p><h1 class="rn-saludo">' + saludo() + (yoN ? ', ' + esc(yoN) : '') + '</h1>';
}

/* Mis tareas, con sus ajustes (qué enseña, cuántas, con las atrasadas) */
const rnCfgTareas = () => Object.assign({ q: 'mias', n: 3, atr: true }, cfgInicio().rnTareas || {});
function rnWTareas() {
  const c = rnCfgTareas(), h = hoyISO();
  const l = lista('tareas').filter(c.q === 'todos' ? (() => true) : mias);
  let pend = l.filter(t => !t.hecho).filter(t => c.q !== 'hoy' || (t.fecha && t.fecha <= h)).filter(t => c.atr || !(t.fecha && t.fecha < h))
    .sort((a, b) => ((a.fecha || '9999') + (a.hora || '99')).localeCompare((b.fecha || '9999') + (b.hora || '99')) || (a.orden || 0) - (b.orden || 0));
  const deHoy = l.filter(t => t.fecha === h), hechas = deHoy.filter(t => t.hecho).length;
  const der = t => { if (t.fecha && t.fecha < h) return '<span class="rn-q rn-rojo">Atrasada</span>'; if (t.para === 'todos') return '<span class="rn-q">Todos</span>'; return t.fecha ? '<span class="rn-q">' + (t.fecha === h ? 'Hoy' : cuando(t.fecha)) + '</span>' : ''; };
  const n = c.n || pend.length;
  return rnCd('<div class="rn-wtop"><button class="rn-wtop-b" data-a="rnVerMias">' + rnAro(hechas, deHoy.length, 56, 8) + '<div class="rn-wnum"><b class="rn-num">' + hechas + ' de ' + deHoy.length + '</b><span>hechas hoy</span></div></button>' +
    '<button class="rn-wlink" data-a="rnVerMias">' + (pend.length ? 'Ver las ' + pend.length : 'Tareas') + '</button></div>' +
    (pend.length ? pend.slice(0, n).map(t => '<div class="rn-rw">' + rnCk(false, t.fecha && t.fecha < h, 'rnHacer', t.id) + '<button class="rn-rwt" data-a="rnVerTarea" data-id="' + t.id + '"><span class="rn-t">' + esc(t.titulo) + rnCandado(t) + '</span></button>' + der(t) + '</div>').join('')
      : '<div class="rn-rw"><span class="rn-n rn-vacio">Nada para hoy</span></div>'), 'rn-k-lima rn-w-tareas');
}

/* ---------- La pantalla ---------- */
const _ini47 = P.inicio;
P.inicio = Object.assign({}, _ini47, {
  rn: true, raiz: true, clase: 'con-barra',
  html: p => {
    try { cargarMes(new Date()); } catch (e) { }
    if (p.editar) {
      const vis = ordenInicio().map(k => rnTarjeta(k, 'edit')).join(''), hid = ocultasInicio().map(k => rnTarjeta(k, 'hid')).join('');
      return '<div class="rn-tit rn-tit-in"><h1>Tu inicio</h1><div class="rn-titd"><button class="rn-btnp rn-btnc rn-btno rn-listo" data-a="inicioListo">Listo</button></div></div>' +
        '<p class="rn-sub">Mantén pulsada una tarjeta y arrástrala. El ojo la oculta; la rueda, sus ajustes.</p>' +
        '<div class="rn-mos rn-mos-ed" data-r="mos">' + vis + '</div>' +
        '<div class="rn-dos"><button class="rn-btnp rn-btng rn-gl" data-a="ir" data-id="tarjetas">' + rnIc('anadir', 20, 2.2) + 'Añadir tarjeta</button><button class="rn-btnp rn-btng rn-gl" data-a="ir" data-id="plantillas">' + rnIc('duplicar', 20, 2) + 'Plantillas</button></div>' +
        (hid ? '<h2 class="rn-gt">Ocultas</h2><p class="rn-txt rn-pie-txt">Toca el ojo para volver a mostrarlas.</p><div class="rn-mos rn-mos-hid">' + hid + '</div>' : '') +
        '<button class="rn-version rn-verbv rn-rst" data-a="inicioRestablecer">Restablecer el orden original</button>';
    }
    let h = rnCabInicio();
    if (esAdmin() && personas().length < 2) h += '<button class="rn-cd rn-gl rn-fila-g" data-a="ir" data-id="invitar">' + rnChip('invitar', 30) + '<span class="rn-fat"><b>Invita a los tuyos</b><span class="rn-n">Crea un código para que se unan</span></span>' + rnFle + '</button>';
    if (esAdmin() && EN_CASA && (!S.cal || !S.cal.id)) h += '<button class="rn-cd rn-gl rn-fila-g" data-a="ir" data-id="avisos">' + rnChip('modulo-calendario', 30) + '<span class="rn-fat"><b>Elige vuestro calendario</b><span class="rn-n">Para la agenda y los avisos</span></span>' + rnFle + '</button>';
    const ks = ordenInicio();
    h += ks.length ? '<div class="rn-mos" data-r="mos">' + ks.map(k => rnTarjeta(k)).join('') + '</div>' : '<div class="rn-vac">' + rnIlu('todo-en-un-sitio') + '<p class="rn-txt">No tienes ninguna tarjeta. Toca «Personalizar» para elegirlas.</p></div>';
    return h + '<button class="rn-version rn-verbv rn-pers" data-a="rnEditarInicio">' + rnIc('ordenar', 16, 2) + ' Personalizar inicio</button>';
  },
  fijo: () => rnAurora(),
  montar(el, p) { P.inicio.tras(el, p); },
  tras(el, p) {
    p = p || {};
    if (p.editar) rnArrastre(el, p);
    const i = $('#wqN', el);
    if (i) i.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ACC.wqOk(); } });
    const g = $('#grCon', el), m = $('#grImp', el);
    if (m) m.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); if (g) g.focus(); } });
    if (g) g.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); const b = $('[data-a="grOk"]', el); if (b) ACC.grOk(b); } });
    /* Las tarjetas de hoy que tienen sus propios campos (nota rápida…) */
    $$('.rn-wv input', el).forEach(x => x.addEventListener('keydown', ev => { if (ev.key === 'Enter') { const b = x.closest('.rn-wv').querySelector('[data-a]'); if (b && b.tagName === 'BUTTON') { ev.preventDefault(); b.click(); } } }));
  }
});
P.inicio.rnPlus = _ini47.rnPlus;
ACC.rnEditarInicio = () => { if (Nav.pila[0].id !== 'inicio') Nav.raiz('inicio'); const e = Nav.pila[0]; if (Nav.pila.length > 1) Nav.atras(Nav.pila.length - 1); e.params.editar = true; Nav.refrescar(true); $('.pgc', e.el).scrollTop = 0; };
ACC.editarInicio = ACC.rnEditarInicio;
ACC.inicioRestablecer = async () => { if (!await preguntar('¿Volver al orden original?', 'Se ponen las tarjetas de «Lo de hoy» en su orden. Solo en este móvil.', 'Restablecer')) return; fijarInicio(PLANTILLAS[0][3].slice(), []); Nav.refrescar(true); toast('Orden original'); };

/* La rueda de cada tarjeta */
ACC.rnWRueda = (el, ev) => {
  if (ev) ev.stopPropagation();
  const k = el.dataset.k, w = W[k]; if (!w) return;
  const vis = ordenInicio().indexOf(k) >= 0, s = rnWSec(k);
  let h = rnCabHoja(esc(w.t));
  if (k === 'tareas') {
    const c = rnCfgTareas(), qs = (campo, ops) => '<div class="rn-qcs">' + ops.map(o => '<button class="rn-qc' + (String(c[campo]) === String(o[0]) ? ' rn-on' : '') + '" data-a="rnWTCfg" data-c="' + campo + '" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div>';
    h += '<p class="rn-et">Qué enseña</p>' + qs('q', [['mias', 'Mis tareas'], ['todos', 'De todos'], ['hoy', 'Solo hoy']]) + '<p class="rn-et">Cuántas</p>' + qs('n', [[3, '3'], [5, '5'], [0, 'Todas']]) +
      '<div class="rn-cd" style="margin-top:12px"><div class="rn-rw"><span class="rn-t" style="flex:1">Con las atrasadas</span>' + rnSw(c.atr, 'rnWTAtr') + '</div></div>';
  }
  h += '<div class="rn-cd" style="margin-top:12px">' +
    '<button class="rn-rw rn-fa" data-a="rnWOjoH" data-k="' + k + '"><span class="rn-chip">' + rnIc(vis ? 'ojo-tachado' : 'ojo', 24, 2) + '</span><span class="rn-t" style="flex:1">' + (vis ? 'Ocultar en Inicio' : 'Mostrar en Inicio') + '</span></button>' +
    (s ? '<button class="rn-rw rn-fa" data-a="rnWIr" data-id="' + s + '"><span class="rn-chip">' + rnIc(RN_SEC[s][1], 24, 2) + '</span><span class="rn-t" style="flex:1">Abrir ' + esc(RN_SEC[s][0]) + '</span>' + rnFle + '</button>' : '') + '</div>' +
    '<p class="rn-txt rn-pie-txt" style="font-size:12.5px">' + (w.sz === 'L' ? 'Tarjeta grande' : 'Tarjeta pequeña') + (w.desc ? ' · ' + esc(w.desc) : '') + '</p>' +
    '<button class="rn-btnp rn-btno" data-a="cerrarHoja" style="margin-top:14px">Listo</button>';
  abrirHoja(h, { clase: 'rn-k-' + rnWColor(k) });
};
ACC.rnWTCfg = el => { const c = rnCfgTareas(); c[el.dataset.c] = el.dataset.c === 'n' ? +el.dataset.v : el.dataset.v; fijarCfg({ rnTareas: c }); $$('[data-c="' + el.dataset.c + '"]', el.parentNode).forEach(b => b.classList.toggle('rn-on', b === el)); Nav.refrescar(true); };
ACC.rnWTAtr = el => { const c = rnCfgTareas(); c.atr = !c.atr; fijarCfg({ rnTareas: c }); el.classList.toggle('rn-on', c.atr); el.setAttribute('aria-checked', c.atr); Nav.refrescar(true); };
ACC.rnWOjoH = el => { cerrarHoja(); ACC.wOjo(el); };
ACC.rnWIr = el => { cerrarHoja(); setTimeout(() => rnAbrir(el.dataset.id), 120); };

/* ---------- Plantillas: cada una enseña sus tarjetas ---------- */
P.plantillas = {
  rn: true,
  html: p => {
    const act = JSON.stringify(ordenInicio());
    return rnTitulo('Plantillas', { atras: 'Tu inicio', sub: 'Empieza con una y luego cámbiala a tu gusto' }) + PLANTILLAS.map(x => {
      const sel = JSON.stringify(x[3].filter(k => W[k])) === act;
      return '<div class="rn-cd rn-gl rn-plt"><div class="rn-plt-c"><div class="rn-fat"><b>' + esc(x[1]) + (sel ? ' <span class="rn-tg">La de ahora</span>' : '') + '</b><span class="rn-n">' + esc(x[2]) + '</span></div>' + (sel ? '' : '<button class="rn-qc" data-a="rnUsarPlantilla" data-v="' + x[0] + '">Usar</button>') + '</div>' +
        '<div class="rn-plt-t">' + x[3].filter(k => W[k]).map(k => '<span class="rn-plt-chip rn-k-' + rnWColor(k) + (W[k].sz === 'L' ? ' rn-plt-l' : '') + '">' + rnIc(rnWIcono(k), 16, 2) + '<span>' + esc(W[k].t) + '</span></span>').join('') + '</div></div>';
    }).join('') + '<p class="rn-txt rn-pie-txt" style="font-size:12.5px">Se guarda en este móvil. El Inicio de la app de hoy no cambia.</p>';
  }
};
ACC.rnUsarPlantilla = el => {
  const x = PLANTILLAS.find(y => y[0] === el.dataset.v) || PLANTILLAS[0];
  fijarInicio(x[3].slice(), []);
  try { localStorage.setItem('rondaP-inicio-elegido', '1'); } catch (e) { }
  Nav.atras(); const e = Nav.pila[0]; if (e && e.id === 'inicio') { e.params.editar = true; Nav.refrescar(true); }
  toast('Inicio «' + x[1] + '»');
};
ACC.usarPlantilla = () => ACC.rnUsarPlantilla({ dataset: { v: (Nav.actual().params || {}).sel || 'hoy' } });

/* ---------- Añadir tarjeta: por secciones, con la muestra de cada una ---------- */
P.tarjetas = {
  rn: true,
  html: () => rnTitulo('Añadir tarjeta', { atras: 'Tu inicio', sub: 'Elige de qué y luego cómo la quieres' }) + '<div class="rn-cd">' +
    SECS.concat(['Turnos', 'Tiempo']).filter((s, i, a) => a.indexOf(s) === i && Object.keys(W).some(k => W[k].sec === s)).map(s => {
      const ks = Object.keys(W).filter(k => W[k].sec === s), k0 = ks[0], dentro = ks.filter(k => ordenInicio().indexOf(k) >= 0).length;
      return '<button class="rn-rw rn-fa rn-k-' + rnWColor(k0) + '" data-a="ir" data-id="tarjetasSec" data-sec="' + esc(s) + '"><span class="rn-chip rn-chip-c">' + rnIc(rnWIcono(k0), 24, 2) + '</span><span class="rn-fat"><span class="rn-t">' + esc(s) + '</span><span class="rn-n">' + ks.length + (ks.length === 1 ? ' tarjeta' : ' tarjetas') + (dentro ? ' · ' + dentro + ' en tu inicio' : '') + '</span></span>' + rnFle + '</button>';
    }).join('') + '</div>'
};
P.tarjetasSec = {
  rn: true,
  html: p => {
    const o = ordenInicio();
    return rnTitulo(esc(p.sec), { atras: 'Añadir tarjeta' }) + '<div class="rn-mos rn-mos-muestra">' + Object.keys(W).filter(k => W[k].sec === p.sec).map(k => {
      const dentro = o.indexOf(k) >= 0;
      return '<div class="rn-muestra rn-wc-' + W[k].sz + '"><div class="rn-muestra-v" aria-hidden="true">' + rnTarjeta(k, 'muestra') + '</div><div class="rn-muestra-p"><span class="rn-fat"><span class="rn-t">' + esc(W[k].t) + '</span><span class="rn-n">' + (W[k].sz === 'L' ? 'Grande' : 'Pequeña') + (W[k].desc ? ' · ' + esc(W[k].desc) : '') + '</span></span>' +
        (dentro ? '<span class="rn-tg">En tu inicio</span>' : '<button class="rn-qc rn-on" data-a="rnAnadirTarjeta" data-k="' + k + '">Añadir</button>') + '</div></div>';
    }).join('') + '</div>';
  }
};
ACC.rnAnadirTarjeta = el => { const k = el.dataset.k; fijarInicio(ordenInicio().concat([k]), ocultasInicio().filter(x => x !== k)); Nav.refrescar(true); toast('«' + W[k].t + '» añadida a tu inicio', 'Deshacer', () => { fijarInicio(ordenInicio().filter(x => x !== k), ocultasInicio()); Nav.refrescar(true); }, 'hecho'); };

/* Arrastrar para ordenar (la lógica de la app de hoy, con clases propias: regla B de 03_ERRORES) */
function rnArrastre(el, p) {
  const cont = $('[data-r="mos"]', el); if (!cont) return;
  let d = null, t = null, x0 = 0, y0 = 0;
  const cancelar = () => { clearTimeout(t); t = null; };
  cont.addEventListener('pointerdown', ev => {
    const w = ev.target.closest('.rn-wcard'); if (!w || ev.target.closest('.rn-wctl')) return;
    x0 = ev.clientX; y0 = ev.clientY; cancelar();
    t = setTimeout(() => {
      const r = w.getBoundingClientRect();
      const ph = document.createElement('div'); ph.className = 'rn-hueco rn-wc-' + (w.classList.contains('rn-wc-L') ? 'L' : 'S'); ph.style.height = r.height + 'px';
      w.parentNode.insertBefore(ph, w);
      d = { w: w, ph: ph, dx: x0 - r.left, dy: y0 - r.top };
      w.classList.add('rn-levantada'); w.style.width = r.width + 'px'; w.style.left = r.left + 'px'; w.style.top = r.top + 'px';
      document.body.appendChild(w);
      try { navigator.vibrate && navigator.vibrate(10); } catch (e) { }
    }, 320);
  });
  const mover = ev => {
    if (!d) { if (t && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) cancelar(); return; }
    d.w.style.left = (ev.clientX - d.dx) + 'px'; d.w.style.top = (ev.clientY - d.dy) + 'px';
    const otro = $$('.rn-wcard', cont).find(o => { const r = o.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; });
    if (otro) { const r = otro.getBoundingClientRect(); const antes = otro.classList.contains('rn-wc-L') ? ev.clientY < r.top + r.height / 2 : ev.clientX < r.left + r.width / 2; cont.insertBefore(d.ph, antes ? otro : otro.nextSibling); }
    /* Si se arrastra al borde, la página se desplaza sola. */
    const pgc = cont.closest('.pgc'), pr = pgc.getBoundingClientRect();
    if (ev.clientY < pr.top + 60) pgc.scrollTop -= 12; else if (ev.clientY > pr.bottom - 60) pgc.scrollTop += 12;
  };
  const soltar = () => {
    cancelar();
    if (!d) return;
    const w = d.w; w.classList.remove('rn-levantada'); ['width', 'left', 'top', 'height', 'transform'].forEach(x => w.style.removeProperty(x));
    cont.insertBefore(w, d.ph); d.ph.remove(); d = null;
    const orden = $$('.rn-wcard', cont).map(x => x.dataset.w).filter(Boolean);
    fijarInicio(orden, ocultasInicio());
    LP.cancelarClick = true; setTimeout(() => { LP.cancelarClick = false; }, 400);
  };
  const cancela = () => { if (d) soltar(); else cancelar(); }, tm = ev => { if (d) ev.preventDefault(); };
  if (ARR.quitar) ARR.quitar();
  document.addEventListener('pointermove', mover);
  document.addEventListener('pointerup', soltar);
  document.addEventListener('pointercancel', cancela);
  document.addEventListener('touchmove', tm, { passive: false });
  ARR.quitar = () => { document.removeEventListener('pointermove', mover); document.removeEventListener('pointerup', soltar); document.removeEventListener('pointercancel', cancela); document.removeEventListener('touchmove', tm); ARR.quitar = null; };
}
