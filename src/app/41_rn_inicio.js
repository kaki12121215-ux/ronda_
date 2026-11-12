/* ===================== DISEÑO NUEVO · Inicio =====================
   Los cinco widgets de Iña, fijos (editar Inicio llega en la tanda 6):
   Mis tareas, Menú de la semana, Añadir a la compra, Añadir gasto y Plantas.
   Reglas que vienen de la app de hoy: una tarjeta visible sale siempre, aunque esté vacía (E12, E13);
   el menú parte el texto en líneas y resalta hoy (E15); plantas por nivel de agua y nombres largos en tres líneas (E16). */
const RN_WIDGETS = ['tareas', 'semana', 'rapido', 'gastoRapido', 'plantas'];

/* Las nueve manchas del fondo de Inicio (lienzo de 390 × 844): [color, tono, left, top, diámetro, opacidad] */
const RN_AURORA = [['rosa', 'b', -150, -170, 400, .70], ['coral', 'b', 80, -210, 300, .62], ['amarillo', 'b', 190, -140, 380, .70], ['lavanda', 'b', -170, 150, 330, .34], ['turquesa', 'b', 220, 190, 320, .30], ['azul', 'f', -70, 440, 320, .70], ['lavanda', 'f', 120, 380, 260, .55], ['verde', 'f', 230, 560, 300, .66], ['lima', 'f', 10, 650, 340, .66]];
const rnAurora = () => '<div class="rn-aurora" aria-hidden="true">' + RN_AURORA.map((b, i) => '<i class="rn-bl rn-bl' + i + '" style="left:' + (b[2] / 390 * 100).toFixed(2) + '%;top:' + (b[3] / 844 * 100).toFixed(2) + '%;width:' + (b[4] / 390 * 100).toFixed(2) + 'vw;height:' + (b[4] / 390 * 100).toFixed(2) + 'vw;background:var(--i-' + b[0] + '-' + b[1] + ');--op:' + b[5] + '"></i>').join('') + '</div>';

/* ---------- Cabecera: logo y nombre de la casa, avatares, fecha y saludo ---------- */
function rnCabInicio() {
  const e = espacio(), ps = personas(), yoN = ((yo() || {}).nombre || '').split(' ')[0];
  return '<div class="rn-icab"><div class="rn-marca"><span class="rn-logo">' + rnPuntos(24, .125) + '</span><b>' + esc(e.nombre) + '</b></div><div class="rn-avs">' + ps.map(p => rnAv(p, 32)).join('') + '</div></div>' +
    '<p class="rn-fecha">' + fechaLarga(new Date()) + '</p><h1 class="rn-saludo">' + saludo() + (yoN ? ', ' + esc(yoN) : '') + '</h1>';
}

/* ---------- Mis tareas: aro de hoy y las tres siguientes ---------- */
function rnWTareas() {
  const h = hoyISO(), l = lista('tareas').filter(mias);
  const pend = l.filter(t => !t.hecho).sort((a, b) => ((a.fecha || '9999') + (a.hora || '99')).localeCompare((b.fecha || '9999') + (b.hora || '99')) || (a.orden || 0) - (b.orden || 0));
  const deHoy = l.filter(t => t.fecha === h || (t.hecho && t.hechoEn && isoDia(new Date(t.hechoEn)) === h && t.fecha === h));
  const hechas = deHoy.filter(t => t.hecho).length;
  const der = t => { if (t.fecha && t.fecha < h) return '<span class="rn-q rn-rojo">Atrasada</span>'; if (t.para === 'todos') return '<span class="rn-q">Todos</span>'; return t.fecha ? '<span class="rn-q">' + (t.fecha === h ? 'Hoy' : cuando(t.fecha)) + '</span>' : ''; };
  return rnCd('<div class="rn-wtop"><button class="rn-wtop-b" data-a="rnVerMias">' + rnAro(hechas, deHoy.length, 56, 8) + '<div class="rn-wnum"><b class="rn-num">' + hechas + ' de ' + deHoy.length + '</b><span>hechas hoy</span></div></button>' +
    '<button class="rn-wlink" data-a="rnVerMias">' + (pend.length ? 'Ver las ' + pend.length : 'Tareas') + '</button></div>' +
    (pend.length ? pend.slice(0, 3).map(t => '<div class="rn-rw">' + rnCk(false, t.fecha && t.fecha < h, 'rnHacer', t.id) + '<button class="rn-rwt" data-a="rnVerTarea" data-id="' + t.id + '"><span class="rn-t">' + esc(t.titulo) + rnCandado(t) + '</span></button>' + der(t) + '</div>').join('')
      : '<div class="rn-rw"><span class="rn-n rn-vacio">Nada para hoy</span></div>'), 'rn-k-lima rn-w-tareas');
}
ACC.rnVerMias = () => { Nav.raiz('tareas', { f: 'mias' }); };

/* ---------- Menú de la semana: hoy y los dos días siguientes, comida y cena ---------- */
function rnWMenu() {
  const cs = comidasOn().filter(c => c[0] === 'c' || c[0] === 'n'), H = hoy0();
  const usa = cs.length ? cs : comidasOn().slice(0, 2);
  const filas = [0, 1, 2].map(i => {
    const d = sumaDias(H, i), m = menuDe(d).filter(x => usa.some(c => c[0] === x[0][0]));
    return '<button class="rn-mf' + (i === 0 ? ' rn-hoy' : '') + '" data-a="rnAbrirSec" data-id="menu"><span class="rn-md"><small>' + LETRAS[diaSemana(d) - 1] + '</small><b class="rn-num">' + d.getDate() + '</b></span>' + m.map(x => '<span class="rn-mt' + (x[1] ? '' : ' rn-mv') + '">' + (x[1] ? esc(x[1]) : 'Sin poner') + '</span>').join('') + '</button>';
  });
  return rnCd(rnCab('cubiertos', 'Menú de la semana', '<button class="rn-wlink" data-a="rnAbrirSec" data-id="menu">Editar</button>') +
    '<div class="rn-mh"><span></span>' + usa.map(c => '<span>' + c[1] + '</span>').join('') + '</div>' + filas.join(''), 'rn-k-amarillo rn-w-menu');
}

/* ---------- Añadir a la compra: escribir sin entrar y lo que más compráis a un toque ---------- */
function rnWCompra() {
  const lid = cfgInicio().rapido && datoLista(cfgInicio().rapido) ? cfgInicio().rapido : ultimaLista(), L = datoLista(lid) || { nombre: 'Supermercado' };
  const fr = frecuentes(lid, 5);
  return rnCd(rnCab('modulo-compra', 'Añadir a la compra') +
    '<form class="rn-qa" onsubmit="return false"><input id="wqN" class="rn-qai" placeholder="¿Qué falta?" autocomplete="off" autocorrect="on" enterkeyhint="done" maxlength="60" data-lid="' + lid + '" aria-label="¿Qué falta?">' +
    '<button type="button" class="rn-tg" data-a="wqLista" aria-label="Cambiar de lista">' + esc(L.nombre) + '</button><button type="button" class="rn-qab" data-a="wqOk" aria-label="Añadir">' + rnIc('anadir', 20, 2.2) + '</button></form>' +
    (fr.length ? '<div class="rn-qcs">' + fr.map(x => '<button class="rn-qc" data-a="wqFrec" data-n="' + esc(x.nombre) + '" data-lid="' + lid + '">+ ' + esc(x.nombre) + '</button>').join('') + '</div><p class="rn-s">Lo que más compráis, a un toque</p>' : '<p class="rn-s">Aquí saldrá lo que más compráis</p>'), 'rn-k-amarillo rn-w-compra');
}

/* ---------- Añadir gasto: importe, concepto, quién paga y cómo se reparte ---------- */
function rnWGasto() {
  const cs = cuentasAbiertas();
  if (!ajGastos().cuentas || !cs.length) return rnCd(rnCab('modulo-gastos', 'Añadir gasto') + '<p class="rn-n rn-vacio">No hay ninguna cuenta abierta</p>', 'rn-k-rosa rn-w-gasto');
  const cid = cfgInicio().gastoCuenta, c = (cid && cid !== 'ultima' && dato('cuentas', cid) && !dato('cuentas', cid).archivada) ? dato('cuentas', cid) : (ultimaCuenta() || cs[0]);
  const st = P.inicio.gr || (P.inicio.gr = { paga: S.cfg.persona, rep: 'medias' });
  const ps = (c.participantes || []).filter(q => q.persona);
  return rnCd(rnCab('modulo-gastos', 'Añadir gasto', '<button class="rn-wlink" data-a="rnCuentaSig">' + (c.emoji ? '<span class="rn-emo">' + esc(c.emoji) + '</span> ' : '') + esc(c.nombre) + '</button>') +
    '<div class="rn-gq"><label class="rn-fld"><small>Importe</small><input id="grImp" inputmode="decimal" placeholder="0,00 €" autocomplete="off" enterkeyhint="next"></label><label class="rn-fld"><small>Concepto</small><input id="grCon" placeholder="Súper, pan…" maxlength="60" autocomplete="off" enterkeyhint="done"></label></div>' +
    '<div class="rn-gpaga"><span class="rn-s">Paga</span>' + ps.map(q => '<button class="rn-qc rn-qcp' + (st.paga === q.persona ? ' rn-on' : '') + '" data-a="grSet" data-k="paga" data-v="' + q.persona + '">' + esc(q.nombre) + '</button>').join('') +
    '<button class="rn-s rn-grep" data-a="grRep">' + (st.rep === 'medias' ? 'A medias' : 'Solo ' + esc(nombreDe(st.rep))) + '</button></div>' +
    '<button class="rn-btnp" data-a="grOk" data-cid="' + c.id + '">' + rnIc('anadir', 20, 2.2) + 'Añadir</button>', 'rn-k-rosa rn-w-gasto');
}
/* Cambiar de cuenta: pasa a la siguiente abierta (la hoja para elegirla no está dibujada) */
ACC.rnCuentaSig = () => { const cs = cuentasAbiertas(); if (cs.length < 2) return toast('Solo hay una cuenta abierta: «' + cs[0].nombre + '».'); const act = cfgInicio().gastoCuenta; const i = cs.findIndex(c => c.id === act); fijarCfg({ gastoCuenta: cs[(i + 1) % cs.length].id }); Nav.refrescar(true); };
/* Al cambiar quién paga, se conserva lo escrito */
ACC.grSet = el => { const i = $('#grImp'), n = $('#grCon'), a = [i && i.value, n && n.value]; P.inicio.gr[el.dataset.k] = el.dataset.v; Nav.refrescar(true); if ($('#grImp')) { $('#grImp').value = a[0] || ''; $('#grCon').value = a[1] || ''; } };
/* El gasto se guarda en la cuenta (lógica de la app de hoy) y el aviso lleva «Deshacer» */
const _grOk41 = ACC.grOk;
ACC.grOk = el => {
  const antes = Object.keys(S.recs.movs || {});
  const imp = numero(val('grImp')), con = cap(val('grCon'));
  if (!imp) { $('#grImp').focus(); return toast('Escribe el importe.'); }
  if (!con) { $('#grCon').focus(); return toast('Escribe el concepto.'); }
  const toast0 = toast; let txt = '';
  toast = (m) => { txt = m; };
  try { _grOk41(el); } finally { toast = toast0; }
  const nuevo = Object.keys(S.recs.movs || {}).find(k => antes.indexOf(k) < 0);
  const ae = document.activeElement; if (ae && ae.blur) ae.blur();
  toast(txt || 'Gasto añadido', nuevo ? 'Deshacer' : null, () => { cambiar('movs', nuevo, { _b: 1 }); Nav.refrescar(true); }, 'hecho');
};

/* ---------- Plantas: cuánta agua les queda ---------- */
function rnWPlantas() {
  const todas = lista('plantas'), l = ordenAgua(todas).slice(0, 5);
  const largos = l.some(x => String(x.nombre).length > 18);
  const barra = x => { const n = nivelAgua(x), toca = tocaHoy('plantas', x); return '<span class="rn-agua' + (toca ? ' rn-toca' : '') + '"><i style="height:' + Math.round(100 * n) + '%"></i></span>'; };
  return rnCd(rnCab('modulo-plantas', 'Plantas', '<button class="rn-wlink" data-a="rnAbrirSec" data-id="plantas">' + todas.length + '</button>') +
    (l.length ? '<div class="rn-pls' + (largos ? ' rn-tres' : '') + '">' + l.map(x => '<button class="rn-pl" data-a="rnAbrirSec" data-id="plantas" aria-label="' + esc(x.nombre) + '">' + (x.emoji ? '<span class="rn-pem">' + esc(x.emoji) + '</span>' : '<span class="rn-pem rn-pic">' + rnIc('modulo-plantas', 24) + '</span>') + '<span class="rn-pn">' + esc(x.nombre) + '</span>' + barra(x) + '</button>').join('') + '</div><p class="rn-s">El agua baja hasta el día de riego</p>'
      : '<p class="rn-n rn-vacio">Todavía no hay plantas</p>'), 'rn-k-verde rn-w-plantas');
}
ACC.rnAbrirSec = el => rnAbrir(el.dataset.id);

/* ---------- La pantalla ---------- */
P.inicio = {
  raiz: true, clase: 'con-barra',
  html: () => rnCabInicio() + rnWTareas() + rnWMenu() + rnWCompra() + rnWGasto() + rnWPlantas(),
  fijo: () => rnAurora(),
  montar(el) { P.inicio.tras(el); },
  tras(el) {
    const i = $('#wqN', el);
    if (i) i.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ACC.wqOk(); } });
    const g = $('#grCon', el), m = $('#grImp', el);
    if (m) m.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); if (g) g.focus(); } });
    if (g) g.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); const b = $('[data-a="grOk"]', el); if (b) ACC.grOk(b); } });
  },
  /* El «+» de Inicio abre la hoja «Añadir»: pendiente de que Iñaki apruebe su JPG */
  rnPlus: () => toast('El «+» de Inicio llega cuando apruebes su diseño. Para añadir una tarea, usa el «+» de Tareas.')
};
/* Los avisos de añadir a la compra llevan la marca */
const _wqOk41 = ACC.wqOk, _wqFrec41 = ACC.wqFrec;
const conMarca = f => el => { const t0 = toast; toast = (m) => t0(m, null, null, /ya está/.test(m) ? null : 'hecho'); try { f(el); } finally { toast = t0; } };
ACC.wqOk = conMarca(_wqOk41);
ACC.wqFrec = conMarca(_wqFrec41);
