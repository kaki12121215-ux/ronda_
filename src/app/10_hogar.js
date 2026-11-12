/* ============================ CASA: menú semanal, plantas, medicación, acuario y coches ============================ */

/* ---------- 52 · Menú semanal: hasta 5 comidas al día (por defecto, comida y cena) ---------- */
const lunesDe = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return sumaDias(x, -(diaSemana(x) - 1)); };
/* 1.4.0: cada comida con su icono (taza, bocadillo, plato, magdalena, cuenco), sin puntos de color que parecían de una persona. */
const COMIDAS = [['y', 'Desayuno', 1, 'menu-desayuno'], ['a', 'Almuerzo', 2, 'menu-almuerzo'], ['c', 'Comida', 0, 'menu-comida'], ['m', 'Merienda', 7, 'menu-merienda'], ['n', 'Cena', 5, 'menu-cena']];
const ICOMIDA = { y: 'menu-desayuno', a: 'menu-almuerzo', c: 'menu-comida', m: 'menu-merienda', n: 'menu-cena' };
function comidasOn() {
  const a = (dato('ajustes', 'menu') || {}).comidas;
  const l = Array.isArray(a) && a.length ? a : ['c', 'n'];
  return COMIDAS.filter(c => l.indexOf(c[0]) >= 0);
}
const idSemana = lun => 'w' + isoDia(lun).replace(/-/g, '');
/* Lo que hay que comer un día: [[comida, texto], …] */
function menuDe(d) {
  const m = dato('menu', idSemana(lunesDe(d))) || {}, k = 'd' + diaSemana(d);
  return comidasOn().map(c => [c, m[k + c[0]] || '']);
}
P.menu = {
  clase: 'con-barra',
  html: p => {
    const lun = p.semana ? deISO(p.semana) : lunesDe(new Date());
    p.semana = isoDia(lun);
    const m = dato('menu', idSemana(lun)) || {};
    const fin = sumaDias(lun, 6), cs = comidasOn();
    return tope('') + head('Menú semanal', lun.getDate() + ' – ' + fin.getDate() + ' de ' + MESES[fin.getMonth()],
      '<div style="display:flex;gap:2px;align-items:center"><button class="icb" data-a="menuSem" data-v="-1" aria-label="Semana anterior">' + ic('atras', 24) + '</button><button class="icb" data-a="menuSem" data-v="1" style="transform:scaleX(-1)" aria-label="Semana siguiente">' + ic('atras', 24) + '</button><button class="icb" data-a="ir" data-id="menuAjustes" aria-label="Ajustes del menú">' + ic('ajustes', 24, 5) + '</button></div>') +
      '<button class="qb2" data-a="menuACompra">' + ic('modulo-compra', 20, 2) + ' Añadir lo que falta a la compra</button>' +
      '<div class="list">' + [0, 1, 2, 3, 4, 5, 6].map(i => {
        const d = sumaDias(lun, i), k = 'd' + (i + 1);
        return '<button class="card dia2' + (isoDia(d) === hoyISO() ? ' hoy' : '') + '" data-a="menuDia" data-d="' + (i + 1) + '"><b class="dn2">' + cap(DIAS[d.getDay()]) + ' ' + d.getDate() + '</b>' +
          cs.map(c => '<span class="ml"><span>' + ic(c[3], 20, c[2]) + c[1] + '</span><b class="' + (m[k + c[0]] ? '' : 'ph') + '">' + esc(m[k + c[0]] || 'Añadir') + '</b></span>').join('') + '</button>';
      }).join('') + '</div>';
  }
};
/* ---------- Del menú a la compra ---------- */
const idPlato = t => 'p' + (normal(t).trim().replace(/\s+/g, '_').replace(/[^a-z0-9_ñ]/g, '').slice(0, 36) || uid());
const platoGuardado = t => t && t.trim() ? dato('platos', idPlato(t)) : null;
ACC.ingQuitar = el => { const e = Nav.actual(); guardarCampos(e); e.params.ing[el.dataset.c].splice(+el.dataset.i, 1); Nav.refrescar(true); };
function faltaDelMenu(lunISO) {
  const lun = deISO(lunISO), m = dato('menu', idSemana(lun)) || {}, h0 = hoy0(), out = [];
  const pend = {}; lista('compra').filter(x => !x.hecho).forEach(x => { pend[sinAcentos(x.nombre).trim()] = 1; });
  for (let i = 0; i < 7; i++) {
    const d = sumaDias(lun, i); if (d < h0) continue;
    comidasOn().forEach(c => {
      const k = 'd' + (i + 1), plato = m[k + c[0]], ing = m['i' + k + c[0]];
      if (!plato || !Array.isArray(ing) || !ing.length) return;
      out.push({ plato: plato, dia: DIAS[d.getDay()], ing: ing.map(x => ({ n: x, ya: !!pend[sinAcentos(x).trim()] })) });
    });
  }
  return out;
}
ACC.menuACompra = () => {
  const p = Nav.actual().params, l = faltaDelMenu(p.semana || isoDia(lunesDe(new Date())));
  if (!l.length) return toast('Ningún plato de hoy en adelante tiene ingredientes. Añádelos al editar el día.');
  const sel = {}; l.forEach((g, gi) => g.ing.forEach((x, i) => { if (!x.ya) sel[gi + '_' + i] = true; }));
  const pinta = () => { const n = Object.keys(sel).filter(k => sel[k]).length; return '<h3>Para esta semana hace falta</h3>' + l.map((g, gi) => '<p class="lab2">' + esc(g.plato.split('\n')[0].slice(0, 50)) + ' · ' + g.dia + '</p><div class="card grp">' + g.ing.map((x, i) => '<div class="row' + (x.ya ? ' dn' : '') + '"' + (x.ya ? '' : ' data-a="mcTog" data-k="' + gi + '_' + i + '"') + '><span class="ck' + (sel[gi + '_' + i] ? ' on' : '') + '" style="' + (sel[gi + '_' + i] ? 'background:' + COL[1] + ';border-color:transparent' : '') + '">' + tick(14) + '</span><b style="flex:1">' + esc(x.n) + '</b>' + (x.ya ? '<small class="k">ya en la lista</small>' : '') + '</div>').join('') + '</div>').join('') + '<button class="btn pri" data-a="mcOk" style="margin-top:16px"' + (n ? '' : ' disabled') + '>Añadir ' + n + ' a ' + esc((datoLista(LSUPER) || { nombre: 'Supermercado' }).nombre) + '</button>'; };
  const h = abrirHoja(pinta());
  ACC.mcTog = el => { sel[el.dataset.k] = !sel[el.dataset.k]; $('.hc', h).innerHTML = pinta(); };
  ACC.mcOk = () => {
    let n = 0; const vistos = {};
    l.forEach((g, gi) => g.ing.forEach((x, i) => { const k = sinAcentos(x.n).trim(); if (!sel[gi + '_' + i] || vistos[k]) return; vistos[k] = 1; if (!anadirProducto(x.n, LSUPER, { para: g.plato.split('\n')[0].slice(0, 30) + ' · ' + g.dia })) n++; }));
    cerrarHoja(); toast(n + (n === 1 ? ' añadido' : ' añadidos') + ' a ' + (datoLista(LSUPER) || { nombre: 'Supermercado' }).nombre);
  };
};
ACC.menuSem = el => { const p = Nav.actual().params; p.semana = isoDia(sumaDias(deISO(p.semana), 7 * Number(el.dataset.v))); Nav.refrescar(true); };
ACC.menuDia = el => { const p = Nav.actual().params; Nav.ir('menuDia', { semana: p.semana || isoDia(lunesDe(new Date())), d: +el.dataset.d }); };
/* Editar un día: un cuadro de texto alto por comida */
P.menuDia = {
  clase: 'con-boton', fija: true,
  html: p => {
    const lun = deISO(p.semana), d = sumaDias(lun, p.d - 1), m = dato('menu', idSemana(lun)) || {}, k = 'd' + p.d;
    p.ing = p.ing || {};
    comidasOn().forEach(c => { if (!p.ing[c[0]]) { const g = m['i' + k + c[0]]; p.ing[c[0]] = Array.isArray(g) ? g.slice() : (platoGuardado(m[k + c[0]]) || {}).ingredientes || []; } });
    if (p.recordar === undefined) p.recordar = true;
    return tope(cap(DIAS[d.getDay()]) + ' ' + d.getDate()) + comidasOn().map(c => '<label class="fld"><small>' + ic(c[3], 16, c[2]) + ' ' + c[1] + '</small><textarea id="mc' + c[0] + '" rows="3" maxlength="300" placeholder="Lentejas, pescado al horno…">' + esc(pv(p, 'mc' + c[0], m[k + c[0]] || '')) + '</textarea></label>' +
      '<div class="ingr"><small>Ingredientes (opcional)</small><div class="chips">' + p.ing[c[0]].map((x, i) => '<button class="chip" data-a="ingQuitar" data-c="' + c[0] + '" data-i="' + i + '">' + esc(x) + ' <i class="cx">×</i></button>').join('') + '<input class="ingin" data-c="' + c[0] + '" placeholder="+ Añadir" maxlength="40" enterkeyhint="done" autocomplete="off"></div></div>').join('') +
      '<div class="row card" style="margin-top:12px"><div class="f"><b>Recordar estos platos</b><small>La próxima vez que escribas el plato, sus ingredientes salen solos</small></div>' + swi(!!p.recordar, 'pTog', 'data-k="recordar"') + '</div>';
  },
  tras(el, p) {
    $$('.ingin', el).forEach(i => {
      const meter = () => { const v = cap(i.value.trim()); if (!v) return; guardarCampos(Nav.actual()); p.ing[i.dataset.c].push(v); Nav.refrescar(true); const n = $('.ingin[data-c="' + i.dataset.c + '"]'); if (n) n.focus(); };
      i.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ',') { ev.preventDefault(); meter(); } });
      i.addEventListener('blur', () => { if (i.value.trim()) meter(); });
    });
    /* Si el plato ya se ha hecho antes, sus ingredientes salen solos al terminar de escribirlo. */
    $$('textarea[id^="mc"]', el).forEach(t => t.addEventListener('change', () => { const c = t.id.slice(2); if (p.ing[c] && p.ing[c].length) return; const g = platoGuardado(t.value); if (g && g.ingredientes && g.ingredientes.length) { guardarCampos(Nav.actual()); p.ing[c] = g.ingredientes.slice(); Nav.refrescar(true); } }));
  },
  montar(el, p) { P.menuDia.tras(el, p); },
  fijo: () => '<div class="btns">' + btn('Guardar', 'menuDiaOk') + '</div>'
};
ACC.menuDiaOk = () => {
  const p = Nav.actual().params, o = {}, k = 'd' + p.d;
  $$('.ingin', Nav.actual().el).forEach(i => { const v = cap(i.value.trim()); if (v) p.ing[i.dataset.c].push(v); });
  comidasOn().forEach(c => {
    o[k + c[0]] = cap(val('mc' + c[0]).replace(/\s+\n/g, '\n'));
    o['i' + k + c[0]] = (p.ing || {})[c[0]] || [];
    if (p.recordar && o[k + c[0]] && o['i' + k + c[0]].length) cambiar('platos', idPlato(o[k + c[0]]), { nombre: o[k + c[0]], ingredientes: o['i' + k + c[0]], usado: Date.now() });
  });
  cambiar('menu', idSemana(deISO(p.semana)), o);
  Nav.atras(); toast('Menú guardado');
};
P.menuAjustes = {
  html: () => {
    const on = comidasOn().map(c => c[0]);
    return tope('Ajustes del menú') + '<p class="texto">Qué comidas apuntáis. Vale para los dos.</p><div class="card grp" style="margin-top:12px">' +
      COMIDAS.map(c => '<div class="row">' + ic(c[3], 22, c[2]) + '<b style="flex:1">' + c[1] + '</b>' + swi(on.indexOf(c[0]) >= 0, 'menuComida', 'data-v="' + c[0] + '"') + '</div>').join('') + '</div>' +
      '<p class="cap" style="text-align:left;margin-top:12px">Por defecto, Comida y Cena. Las que apaguéis no se borran: se ocultan.</p>';
  }
};
ACC.menuComida = el => {
  const on = comidasOn().map(c => c[0]), v = el.dataset.v, i = on.indexOf(v);
  if (i >= 0) { if (on.length === 1) return toast('Deja al menos una comida.'); on.splice(i, 1); } else on.push(v);
  cambiar('ajustes', 'menu', { comidas: COMIDAS.map(c => c[0]).filter(c => on.indexOf(c) >= 0) });
  Nav.refrescar(true);
};

/* ---------- Rutinas de casa: plantas, medicación y acuario comparten forma ---------- */
const RUTINAS = {
  plantas: { titulo: 'Plantas', uno: 'planta', icono: 'modulo-plantas', ci: 3, ilus: 'il-plantas', hecho: 'Regada', verbo: 'Regar', ph: 'Monstera, albahaca…', cada: [1, 2, 3, 7, 14, 30], defCada: 3 },
  medicacion: { titulo: 'Medicación', uno: 'medicamento', icono: 'modulo-medicacion', ci: 7, ilus: 'il-medicacion', hecho: 'Tomada', verbo: 'Tomar', ph: 'Omeprazol 20 mg, vitamina D…', cada: [1, 2, 3, 7, 14, 30], defCada: 1, extra: true },
  acuario: { titulo: 'Acuario', uno: 'tarea del acuario', icono: 'pez-betta', ci: 4, ilus: 'il-acuario', hecho: 'Hecho', verbo: '', ph: 'Cambio de agua, limpiar el filtro…', cada: [1, 2, 3, 7, 14, 30], defCada: 7, sugeridas: [['Dar de comer', 1], ['Cambio de agua (25 %)', 7], ['Test del agua', 7], ['Limpiar el cristal', 14], ['Limpiar el filtro', 30], ['Podar las plantas', 30]] }
};
const textoCada = (n, x) => x && x.cadaU && x.cadaU !== 'd' ? textoU(x.cadaN || 1, x.cadaU) : n === 1 ? 'Cada día' : n === 7 ? 'Cada semana' : n === 30 ? 'Cada mes' : 'Cada ' + n + ' días';
/* Siguiente vez de una rutina: por días, o por meses/años si se eligió así en «Personalizado». */
const sigRutina = (x, desde) => x.cadaU === 'm' || x.cadaU === 'a' ? isoDia(sumarU(deISO(desde || hoyISO()), x.cadaN || 1, x.cadaU)) : isoDia(sumaDias(deISO(desde || hoyISO()), Math.max(1, x.cada || 1)));
/* La medicación puede ser solo un registro (sin fechas ni avisos). Lo antiguo con fecha sigue avisando. */
const conRecuerdo = (col, x) => col !== 'medicacion' || (x.rec === undefined ? !!x.proximo : !!x.rec);
const tocaHoy = (col, x) => conRecuerdo(col, x) && x.proximo && x.proximo <= hoyISO();
function filaRutina(col, x) {
  const R = RUTINAS[col], toca = tocaHoy(col, x), rec = conRecuerdo(col, x);
  const sub = col === 'medicacion'
    ? [x.dosis ? esc(x.dosis) : '', rec ? (toca ? 'Toca ' + cuando(x.proximo, x.hora).toLowerCase() : textoCada(x.cada || 1, x) + (x.hora ? ' · ' + x.hora : '') + (x.proximo ? ' · próxima ' + cuando(x.proximo).toLowerCase() : '')) + (x.cal ? ' · avisa' : '') : 'Solo registro'].filter(Boolean).join(' · ')
    : (toca ? (R.verbo ? R.verbo + ' ' : 'Toca ') + cuando(x.proximo, x.hora).toLowerCase() : 'Próxima: ' + cuando(x.proximo, x.hora).toLowerCase()) + (x.ultima ? ' · última ' + esc(nombreDe(x.ultimaPor)) : '');
  return '<div class="row card" data-a="rutVer" data-col="' + col + '" data-id="' + x.id + '">' + emo(x.emoji, sq(R.icono, R.ci), 44) + '<div class="f"><b>' + esc(x.nombre) + '</b><small' + (rec && x.proximo && x.proximo < hoyISO() ? ' style="color:#C8402B"' : '') + '>' + sub + '</small></div>' +
    (toca ? '<button class="chip on" data-a="rutHecho" data-col="' + col + '" data-id="' + x.id + '" style="padding:6px 12px;flex:none">' + R.hecho + '</button>' : '') + '</div>';
}
function htmlRutina(col) {
  const R = RUTINAS[col];
  const l = lista(col).sort((a, b) => (a.proximo || '9').localeCompare(b.proximo || '9') || (a.hora || '').localeCompare(b.hora || '') || String(a.nombre).localeCompare(String(b.nombre), 'es'));
  const hoyN = l.filter(x => tocaHoy(col, x)).length;
  let h = tope('') + '<div data-r="banda">' + banda() + '</div>' + head(R.titulo, col === 'medicacion' ? (l.length ? 'Lo que toma cada uno' : '') : (l.length ? hoyN + ' para hoy' : ''));
  if (!l.length) {
    h += vacio(R.ilus, 'Nada todavía', 'Añade ' + (col === 'acuario' ? 'la primera tarea del acuario' : col === 'plantas' ? 'la primera planta' : 'el primer medicamento') + ' con el botón +.');
    if (R.sugeridas) h += '<h3>Para empezar</h3><div class="chips">' + R.sugeridas.map(s => '<button class="chip" data-a="rutSug" data-col="' + col + '" data-n="' + esc(s[0]) + '" data-c="' + s[1] + '">' + esc(s[0]) + '</button>').join('') + '</div>';
    return h;
  }
  if (col !== 'medicacion') return h + '<div class="list">' + l.map(x => filaRutina(col, x)).join('') + '</div>';
  /* Medicación: agrupada por persona */
  const grupos = personas().map(p => [p, l.filter(x => x.quien === p.id)]).filter(g => g[1].length);
  const sin = l.filter(x => !x.quien || !dato('personas', x.quien));
  grupos.forEach(g => { h += '<h3>' + av(g[0], 28) + '<span style="margin-left:8px">' + esc(g[0].nombre) + '</span></h3><div class="list">' + g[1].map(x => filaRutina(col, x)).join('') + '</div>'; });
  if (sin.length) {
    const porPara = {};
    sin.forEach(x => { const k = x.para || 'Sin asignar'; (porPara[k] = porPara[k] || []).push(x); });
    Object.keys(porPara).forEach(k => { h += '<h3>' + esc(k) + '</h3><div class="list">' + porPara[k].map(x => filaRutina(col, x)).join('') + '</div>'; });
  }
  return h;
}
Object.keys(RUTINAS).forEach(col => {
  P[col] = { html: () => htmlRutina(col), fijo: () => '<button class="fab" data-a="rutNueva" data-col="' + col + '" aria-label="Añadir">' + ic('anadir', 28) + '</button>', clase: 'con-barra' };
});
ACC.rutSug = el => { const col = el.dataset.col; cambiar(col, 'r' + uid(), { nombre: el.dataset.n, cada: +el.dataset.c, proximo: hoyISO(), hora: '', cal: false, creadoPor: S.cfg.persona }); Nav.refrescar(true); };
ACC.rutNueva = el => { const col = el.dataset.col; Nav.ir('rutina', { col: col, cada: RUTINAS[col].defCada, proximo: hoyISO(), rec: col !== 'medicacion', quien: col === 'medicacion' ? S.cfg.persona : '' }); };
ACC.rutVer = el => { const col = el.dataset.col, x = dato(col, el.dataset.id); Nav.ir('rutina', Object.assign({ col: col }, x, { rec: conRecuerdo(col, x) })); };
ACC.rutHecho = (el, ev) => {
  if (ev) ev.stopPropagation();
  const col = el.dataset.col, x = dato(col, el.dataset.id); if (!x) return;
  const sig = sigRutina(x);
  const antes = { proximo: x.proximo, ultima: x.ultima || '', ultimaPor: x.ultimaPor || '', hist: x.hist || [] };
  cambiar(col, x.id, { proximo: sig, ultima: Date.now(), ultimaPor: S.cfg.persona, hist: (x.hist || []).filter(d => d !== hoyISO()).concat([hoyISO()]).slice(-30) });
  if (x.cal) marcarCal(col, x.id);
  Nav.refrescar(true);
  toast(RUTINAS[col].hecho + '. Próxima: ' + cuando(sig).toLowerCase(), 'Deshacer', () => { cambiar(col, x.id, antes); if (x.cal) marcarCal(col, x.id); Nav.refrescar(); });
};
P.rutina = {
  clase: 'con-boton', fija: true,
  html: p => {
    const R = RUTINAS[p.col], med = !!R.extra;
    const enLista = R.cada.indexOf(Number(p.cada)) >= 0 && (!p.cadaU || p.cadaU === 'd');
    const otro = p.otro || (p.cada && !enLista);
    if (otro && !p.fqU) { p.fqU = p.cadaU || 'd'; p.fqN = p.cadaN || p.cada || 1; }
    let h = tope(p.id ? 'Cambiar' : med ? 'Nuevo medicamento' : 'Añadir ' + R.uno) + filaNombreEmoji('rEmo', pv(p, 'rEmo', p.emoji), fldTxt('rNom', 'Nombre', pv(p, 'rNom', p.nombre), R.ph, 'maxlength="60"'));
    if (med) h += '<p class="lab2">Quién lo toma</p>' + chipsPersonas(p.quien, 'rQuien') +
      fldTxt('rDos', 'Dosis y cuándo', pv(p, 'rDos', p.dosis), 'Uno en ayunas, 20 mg por la noche…', 'maxlength="80"') +
      '<div class="row card" style="margin-top:6px"><div class="f"><b>Recordármelo</b><small>' + (p.rec ? 'Con fecha, hora y, si quieres, en el calendario' : 'Apagado: solo queda apuntado') + '</small></div>' + swi(!!p.rec, 'pTog', 'data-k="rec"') + '</div>';
    if (!med || p.rec) {
      h += '<p class="lab2">Cada cuánto</p><div class="chips">' + R.cada.map(n => '<button class="chip' + (!otro && Number(p.cada) === n ? ' on' : '') + '" data-a="rutCada" data-v="' + n + '">' + textoCada(n) + '</button>').join('') +
        '<button class="chip' + (otro ? ' on' : '') + '" data-a="rutOtro">Personalizado</button></div>' +
        (otro ? bloqueFrecuencia(p, pv(p, 'rPro', p.proximo || hoyISO())) : '') +
        '<div style="display:flex;gap:10px;margin-top:8px"><label class="fld" style="flex:1.3"><small>Próxima vez</small><input type="date" id="rPro" value="' + esc(pv(p, 'rPro', p.proximo || hoyISO())) + '"></label><label class="fld" style="flex:1"><small>Hora</small><input type="time" id="rHor" value="' + esc(pv(p, 'rHor', p.hora || '')) + '"></label></div>' +
        '<div class="list" style="margin-top:6px">' + filaCal(!!p.cal, 'pTog" data-k="cal') + (p.cal ? filaAviso(p.aviso, 'rAviso') : '') + '</div>';
    }
    return h + fldArea('rNot', 'Notas', pv(p, 'rNot', p.notas), 'Opcional') +
      (p.id ? '<button class="btn sec peligro" data-a="rutBorrar" style="margin-top:12px">Borrar</button>' : '');
  },
  fijo: () => '<div class="btns">' + btn('Guardar', 'rutGuardar') + '</div>'
};
ACC.rutCada = el => { const e = Nav.actual(); guardarCampos(e); e.params.cada = +el.dataset.v; e.params.otro = false; e.params.cadaU = ''; Nav.refrescar(true); };
ACC.rutOtro = () => { const e = Nav.actual(); guardarCampos(e); e.params.otro = true; e.params.fqN = e.params.fqN || e.params.cada || 1; e.params.fqU = e.params.fqU || 'd'; Nav.refrescar(true); };
ACC.rQuien = el => { const e = Nav.actual(); e.params.quien = e.params.quien === el.dataset.v ? '' : el.dataset.v; repintar(); };
ACC.rAviso = () => { const e = Nav.actual(); guardarCampos(e); hojaOpciones('Aviso', AVISOS, e.params.aviso, v => { e.params.aviso = v; Nav.refrescar(true); }); };
ACC.rutGuardar = () => {
  const e = Nav.actual(); guardarCampos(e); const p = e.params, n = cap(val('rNom'));
  if (!n) return toast('Escribe el nombre.');
  const R = RUTINAS[p.col], med = !!R.extra, rec = !med || !!p.rec;
  const enLista = R.cada.indexOf(Number(p.cada)) >= 0;
  let cada = Number(p.cada) || 1, cadaN = 0, cadaU = '';
  if (rec && p.otro) { cadaN = Number(p.fqN) || 1; cadaU = p.fqU || 'd'; cada = diasU(cadaN, cadaU); }
  const id = p.id || 'r' + uid();
  const c = { nombre: n, emoji: primerEmoji(val('rEmo')), notas: val('rNot') };
  if (rec) Object.assign(c, { cada: cada, cadaN: cadaN, cadaU: cadaU, proximo: val('rPro') || hoyISO(), hora: val('rHor'), cal: !!p.cal, aviso: p.cal ? (p.aviso === undefined ? '0' : p.aviso) : '' });
  else Object.assign(c, { proximo: '', hora: '', cal: false, aviso: '' });
  if (med) { c.dosis = val('rDos'); c.quien = p.quien || ''; c.rec = rec; }
  if (!p.id) c.creadoPor = S.cfg.persona;
  cambiar(p.col, id, c);
  if (c.cal || p.evId) marcarCal(p.col, id);
  Nav.atras(); toast('Guardado');
};
ACC.rutBorrar = () => { const p = Nav.actual().params; cambiar(p.col, p.id, { _b: 1 }); if (p.evId) marcarCal(p.col, p.id); Nav.atras(); toast('Borrado', 'Deshacer', () => { cambiar(p.col, p.id, { _b: 0 }); Nav.refrescar(); }); };

/* ---------- 54 · Coches: una carpeta por coche, con sus vencimientos (ITV, seguro, revisión…) y sus datos ---------- */
const KPRIN = 'kprincipal';   /* el coche que ya había antes de poder tener varios */
function coches() {
  const l = lista('coches').sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const r = S.recs.coches && S.recs.coches[KPRIN];
  const viejo = dato('ajustes', 'coche') || {};
  if (!l.find(c => c.id === KPRIN) && !(r && r.f._b) && (lista('coche').some(x => !x.coche) || viejo.modelo || viejo.matricula))
    l.unshift({ id: KPRIN, nombre: viejo.modelo || 'Coche', matricula: viejo.matricula || '', notas: viejo.notas || '', orden: 0 });
  return l;
}
const cocheDe = x => x.coche || KPRIN;
const datoCoche = id => coches().find(c => c.id === id) || null;
const vencimientos = kid => lista('coche').filter(x => cocheDe(x) === kid).sort((a, b) => (a.fecha || '9').localeCompare(b.fecha || '9'));
const icoVenc = n => /ITV/i.test(n) ? 'coche-itv-y-permiso' : /seguro/i.test(n) ? 'seguro' : /impuesto/i.test(n) ? 'impuestos' : /rueda|neum/i.test(n) ? 'coche-y-gasolina' : 'modulo-coche';
const COLCOCHE = [5, 0, 3, 6, 1, 4, 7, 2];
function proximoVenc(kid) { return vencimientos(kid).filter(x => x.fecha)[0] || null; }
const faltan = iso => { const d = deISO(iso); if (!d) return null; const h = new Date(); h.setHours(0, 0, 0, 0); return Math.round((d - h) / 86400000); };
const textoFaltan = n => n === null ? '' : n < 0 ? 'hace ' + (-n) + (n === -1 ? ' día' : ' días') : n === 0 ? 'hoy' : n === 1 ? 'mañana' : n < 60 ? 'en ' + n + ' días' : 'en ' + Math.round(n / 30) + ' meses';
P.coche = {
  clase: 'con-barra',
  html: () => {
    const l = coches();
    let h = tope('') + '<div data-r="banda">' + banda() + '</div>' + head('Coches', l.length ? l.length + (l.length === 1 ? ' coche' : ' coches') : 'Sus fechas y sus datos');
    if (!l.length) return h + vacio('il-coches', 'Sin coches', 'Añade el primero: luego le pones la ITV, el seguro o la revisión y te avisa.') + '<button class="btn pri" data-a="nuevoCoche" style="margin-top:18px">Añadir coche</button>';
    h += '<div class="list">' + l.map((c, i) => {
      const x = proximoVenc(c.id), col = COL[c.ci === undefined ? COLCOCHE[i % 8] : c.ci];
      return '<button class="carc" style="--c:' + col + '" data-a="verCoche" data-id="' + c.id + '">' + emo(c.emoji, ic('coche', 34, c.ci === undefined ? COLCOCHE[i % 8] : c.ci), 40) + '<div class="f"><b>' + esc(c.nombre) + '</b><small>' + esc([c.matricula, c.anio].filter(Boolean).join(' · ') || 'Sin matrícula') + '</small>' + (x ? '<em' + (x.fecha < hoyISO() ? ' style="color:#C8402B"' : '') + '>' + esc(x.nombre) + ' · ' + textoFaltan(faltan(x.fecha)) + '</em>' : '') + '</div>' + chev + '</button>';
    }).join('') + '<button class="row card dash" data-a="nuevoCoche">' + ic('anadir', 22) + '<b>Añadir coche</b></button></div>';
    return h;
  },
  fijo: () => '<button class="fab" data-a="nuevoCoche" aria-label="Añadir coche">' + ic('anadir', 28) + '</button>'
};
ACC.nuevoCoche = () => Nav.ir('cocheEditar', {});
ACC.verCoche = el => Nav.ir('cocheVer', { kid: el.dataset.id });
P.cocheVer = {
  html: p => {
    const c = datoCoche(p.kid);
    if (!c) return tope('') + '<p class="mu">Este coche ya no está.</p>';
    const l = vencimientos(c.id);
    let h = tope('', '<button class="rt" data-a="editarCoche" data-id="' + c.id + '" aria-label="Cambiar datos">' + ic('editar', 22) + '</button>') + head(c.nombre, esc([c.matricula, c.anio].filter(Boolean).join(' · ')));
    h += '<h3 style="margin-top:0">Vencimientos</h3>';
    if (l.length) h += '<div class="card grp">' + l.map(x => '<button class="row" data-a="cocheFechaVer" data-id="' + x.id + '">' + sq(icoVenc(x.nombre), 5) + '<div class="f"><b>' + esc(x.nombre) + '</b><small' + (x.fecha && x.fecha < hoyISO() ? ' style="color:#C8402B"' : '') + '>' + (x.fecha ? fechaCorta(deISO(x.fecha)) + ' · ' + textoFaltan(faltan(x.fecha)) : 'Sin fecha') + (x.meses ? ' · ' + textoU(x.meses, 'm').toLowerCase() : x.anios ? ' · cada ' + (x.anios === 1 ? 'año' : x.anios + ' años') : '') + '</small></div>' + chev + '</button>').join('') + '</div>';
    else h += '<p class="texto" style="font-size:14px">Añade la ITV, el seguro o la revisión y te lo recordamos.</p><div class="chips" style="margin-top:10px">' + ['ITV', 'Seguro', 'Revisión', 'Impuesto de circulación', 'Cambio de ruedas'].map(n => '<button class="chip" data-a="cocheSug" data-n="' + n + '">' + n + '</button>').join('') + '</div>';
    const datos = [['Seguro', c.seguro], ['Póliza', c.poliza], ['Asistencia en carretera', c.asistencia]].filter(x => x[1]);
    if (datos.length || c.notas) h += '<h3>Datos</h3><div class="card" style="padding:4px 16px">' + datos.map(x => '<div class="kv"><small>' + x[0] + '</small><b>' + esc(x[1]) + '</b></div>').join('') + (c.notas ? '<div class="kv" style="display:block"><small>Notas</small><b style="display:block;text-align:left;margin-top:4px;white-space:pre-wrap;font-weight:600">' + esc(c.notas) + '</b></div>' : '') + '</div>';
    h += '<h3>Documentos</h3><button class="row card" data-a="docCarpeta" data-v="coche">' + sq('coche-itv-y-permiso', 6) + '<div class="f"><b>Documentos del coche</b><small>Permiso de circulación, ficha técnica… cifrados</small></div>' + chev + '</button>';
    return h;
  },
  fijo: p => '<button class="fab" data-a="cocheNuevaFecha" data-kid="' + esc(p.kid) + '" aria-label="Añadir vencimiento">' + ic('anadir', 28) + '</button>'
};
ACC.editarCoche = el => { const c = datoCoche(el.dataset.id); Nav.ir('cocheEditar', Object.assign({ kid: c.id }, c)); };
ACC.cocheSug = el => Nav.ir('cocheFecha', { nombre: el.dataset.n, cal: true, aviso: '10080', coche: Nav.actual().params.kid, anios: /ITV|Seguro|Impuesto/.test(el.dataset.n) ? 1 : 0 });
ACC.cocheNuevaFecha = el => Nav.ir('cocheFecha', { cal: true, aviso: '10080', coche: el.dataset.kid });
ACC.cocheFechaVer = el => { const x = dato('coche', el.dataset.id); Nav.ir('cocheFecha', Object.assign({}, x, { coche: cocheDe(x) })); };
P.cocheEditar = {
  clase: 'con-boton', fija: true,
  html: p => tope(p.kid ? 'Datos del coche' : 'Nuevo coche') +
    filaNombreEmoji('kEmo', pv(p, 'kEmo', p.emoji), fldTxt('kNom', 'Nombre', pv(p, 'kNom', p.nombre), 'Seat Córdoba, la furgo…', 'maxlength="40"')) +
    '<div style="display:flex;gap:10px">' + fldTxt('kMat', 'Matrícula', pv(p, 'kMat', p.matricula), '0000 XXX', 'maxlength="12" autocapitalize="characters"') + fldTxt('kAn', 'Año', pv(p, 'kAn', p.anio), '2014', 'maxlength="4" inputmode="numeric"') + '</div>' +
    fldTxt('kSeg', 'Seguro', pv(p, 'kSeg', p.seguro), 'Compañía', 'maxlength="40"') +
    fldTxt('kPol', 'Póliza', pv(p, 'kPol', p.poliza), 'Número de póliza', 'maxlength="40"') +
    fldTxt('kAsi', 'Asistencia en carretera', pv(p, 'kAsi', p.asistencia), 'Teléfono', 'maxlength="30" inputmode="tel"') +
    fldArea('kNot', 'Notas', pv(p, 'kNot', p.notas), 'Taller de confianza, presión de las ruedas…') +
    (p.kid ? '<button class="btn sec peligro" data-a="borrarCoche" data-id="' + esc(p.kid) + '" style="margin-top:12px">Borrar coche</button>' : ''),
  fijo: () => '<div class="btns">' + btn('Guardar', 'guardarCoche') + '</div>'
};
ACC.guardarCoche = () => {
  const e = Nav.actual(); guardarCampos(e); const p = e.params, n = cap(val('kNom'));
  if (!n) return toast('Ponle un nombre al coche.');
  const id = p.kid || 'k' + uid();
  const c = { nombre: n, emoji: primerEmoji(val('kEmo')), matricula: val('kMat').toUpperCase(), anio: val('kAn'), seguro: val('kSeg'), poliza: val('kPol'), asistencia: val('kAsi'), notas: val('kNot') };
  if (!p.kid) c.orden = Date.now();
  cambiar('coches', id, c);
  Nav.atras(); toast(p.kid ? 'Datos guardados' : 'Coche añadido');
};
ACC.borrarCoche = async el => {
  const c = datoCoche(el.dataset.id); if (!c) return;
  if (!await preguntar('¿Borrar «' + c.nombre + '»?', 'Se borran también sus vencimientos.', 'Borrar coche', true)) return;
  vencimientos(c.id).forEach(x => { cambiar('coche', x.id, { _b: 1 }); if (x.evId) marcarCal('coche', x.id); });
  cambiar('coches', c.id, { _b: 1 });
  Nav.atras(); if (Nav.actual().id === 'cocheVer') Nav.atras();
  toast('Coche borrado');
};
const AVISOS_LARGOS = AVISOS.concat([['10080', '1 semana antes'], ['43200', '1 mes antes']]);
P.cocheFecha = {
  clase: 'con-boton', fija: true,
  html: p => {
    const enL = [0, 1, 2].indexOf(Number(p.anios || 0)) >= 0 && !p.meses, otro = p.otroA || !enL;
    if (otro && !p.fqU) { p.fqU = p.meses ? 'm' : 'a'; p.fqN = p.meses || p.anios || 1; }
    return tope(p.id ? 'Cambiar vencimiento' : 'Nuevo vencimiento') + fldTxt('cfN', 'Qué es', pv(p, 'cfN', p.nombre), 'ITV, seguro, revisión…', 'maxlength="50"') +
      '<label class="fld"><small>Fecha</small><input type="date" id="cfF" value="' + esc(pv(p, 'cfF', p.fecha || '')) + '"></label>' +
      '<p class="lab2">Se repite</p><div class="chips">' + [[0, 'No'], [1, 'Cada año'], [2, 'Cada 2 años']].map(x => '<button class="chip' + (!otro && Number(p.anios || 0) === x[0] ? ' on' : '') + '" data-a="cfAnios" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '<button class="chip' + (otro ? ' on' : '') + '" data-a="cfOtro">Personalizado</button></div>' +
      (otro ? bloqueFrecuencia(p, pv(p, 'cfF', p.fecha || hoyISO()), ['m', 'a']) : '') +
      '<div class="list" style="margin-top:10px">' + filaCal(!!p.cal, 'pTog" data-k="cal') + (p.cal ? '<button class="row card" data-a="cfAviso">' + sq('alarma', 1) + '<div class="f"><b>Aviso</b><small>' + (AVISOS_LARGOS.find(x => x[0] === String(p.aviso)) || AVISOS[0])[1] + '</small></div>' + chev + '</button>' : '') + '</div>' +
      fldArea('cfNot', 'Notas', pv(p, 'cfNot', p.notas), 'Taller, precio, número de póliza…') +
      (p.id && (p.anios || p.meses) && p.fecha ? '<button class="btn sec" data-a="cfRenovado" style="margin-top:12px">Hecho: pasar al ' + (p.meses ? 'siguiente' : 'de ' + (deISO(p.fecha).getFullYear() + Number(p.anios))) + '</button>' : '') +
      (p.id ? '<button class="btn sec peligro" data-a="cfBorrar" style="margin-top:12px">Borrar</button>' : '');
  },
  fijo: () => '<div class="btns">' + btn('Guardar', 'cfGuardar') + '</div>'
};
ACC.cfAnios = el => { const e = Nav.actual(); guardarCampos(e); e.params.anios = +el.dataset.v; e.params.meses = 0; e.params.otroA = false; Nav.refrescar(true); };
ACC.cfOtro = () => { const e = Nav.actual(); guardarCampos(e); e.params.otroA = true; e.params.fqN = e.params.fqN || 1; e.params.fqU = e.params.fqU || 'a'; Nav.refrescar(true); };
ACC.cfAviso = () => { const e = Nav.actual(); guardarCampos(e); hojaOpciones('Aviso', AVISOS_LARGOS, e.params.aviso, v => { e.params.aviso = v; Nav.refrescar(true); }); };
ACC.cfGuardar = () => {
  const e = Nav.actual(); guardarCampos(e); const p = e.params, n = cap(val('cfN'));
  if (!n) return toast('Escribe qué es.');
  let anios = Number(p.anios) || 0, meses = 0;
  const enL = [0, 1, 2].indexOf(anios) >= 0 && !p.meses;
  if (p.otroA || !enL) { if ((p.fqU || 'a') === 'm') { meses = Number(p.fqN) || 1; anios = 0; } else { anios = Number(p.fqN) || 1; } }
  const id = p.id || 'v' + uid();
  cambiar('coche', id, { nombre: n, fecha: val('cfF'), anios: anios, meses: meses, cal: !!p.cal, aviso: p.cal ? (p.aviso || '') : '', notas: val('cfNot'), coche: p.coche || KPRIN });
  if (p.cal || p.evId) marcarCal('coche', id);
  Nav.atras(); toast('Guardado');
};
ACC.cfRenovado = () => {
  const p = Nav.actual().params, d = deISO(p.fecha); if (p.meses) d.setMonth(d.getMonth() + Number(p.meses)); else d.setFullYear(d.getFullYear() + Number(p.anios));
  cambiar('coche', p.id, { fecha: isoDia(d) });
  if (p.cal || p.evId) marcarCal('coche', p.id);
  Nav.atras(); toast('Próximo: ' + fechaCorta(d));
};
ACC.cfBorrar = () => { const p = Nav.actual().params; cambiar('coche', p.id, { _b: 1 }); if (p.evId) marcarCal('coche', p.id); Nav.atras(); };
