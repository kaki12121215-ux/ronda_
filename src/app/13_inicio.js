/* ============================ INICIO: tarjetas a elegir, ocultar con el ojo y ordenar arrastrando ============================
   Cada persona tiene su inicio (personas.inicio = orden, personas.inicioOcultas = ocultas, personas.inicioCfg = ajustes de tarjetas).
   Las tarjetas sin nada que enseñar no salen (salvo en el modo editar). */
const [cCO, cLI, cLA, cVE, cTU, cAZ, cLV, cRO] = COL;
const yoId = () => S.cfg && S.cfg.persona;
const mias = t => t.para === yoId() || t.para === 'todos';
const lab = (t, link) => '<div class="wl"><span>' + t + '</span>' + (link || '') + '</div>';
const wlink = (t, a) => '<button class="wa" data-a="' + a + '">' + t + '</button>';
const big = (n, t) => '<div class="bign"><b>' + n + '</b><span>' + (t || '') + '</span></div>';
const wck = (col, on, a, extra) => '<button class="ck' + (on ? ' on' : '') + '" data-a="' + a + '" ' + (extra || '') + ' style="' + (on ? 'background:' + col + ';border-color:transparent' : 'border-color:' + col) + '">' + tick(14) + '</button>';
const sqi = (id, ci) => '<span class="si" style="background:' + COL[ci] + '22">' + ic(id, 22, ci) + '</span>';
function donut(p, col, txt) {
  const r = 40, C = 2 * Math.PI * r;
  return '<svg class="donut" viewBox="0 0 100 100"><circle cx="50" cy="50" r="' + r + '" fill="none" stroke="var(--ln)" stroke-width="12"/><circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (C * Math.max(0, Math.min(1, p))).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 50 50)"/><text x="50" y="57" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="21" fill="currentColor">' + txt + '</text></svg>';
}
const cfgInicio = () => (yo() || {}).inicioCfg || {};
function fijarCfg(o) { cambiar('personas', yoId(), { inicioCfg: Object.assign({}, cfgInicio(), o) }); }
function eventosEntre(d0, d1) {
  const a = d0.getTime(), b = d1.getTime(), vis = {}, out = [];
  Object.keys(AG.cache).forEach(m => (AG.cache[m].ev || []).forEach(e => { if (!vis[e.id] && e.inicio < b && e.fin > a) { vis[e.id] = 1; out.push(e); } }));
  return out.sort((x, y) => x.inicio - y.inicio);
}
const hoy0 = () => { const h = new Date(); h.setHours(0, 0, 0, 0); return h; };
const diasHasta = iso => faltan(iso);
const cuantoFalta = ms => { const m = Math.round((ms - Date.now()) / 60000); if (m < 60) return [Math.max(0, m), 'min']; if (m < 60 * 24) return [Math.round(m / 60), 'h']; return [Math.round(m / 1440), Math.round(m / 1440) === 1 ? 'día' : 'días']; };
const frecuentes = (lid, n) => {
  const m = S.recs.compra || {}, vis = {}, pend = {};
  lista('compra').filter(x => !x.hecho && listaDe(x) === lid).forEach(x => { pend[normal(x.nombre).trim()] = 1; });
  Object.keys(m).forEach(id => { const f = m[id].f; if (!f.nombre || (f.lista || LSUPER) !== lid) return; const k = normal(f.nombre).trim(); if (pend[k]) return; vis[k] = vis[k] && (vis[k].veces || 1) >= (f.veces || 1) ? vis[k] : { nombre: f.nombre, veces: f.veces || 1 }; });
  return Object.keys(vis).map(k => vis[k]).sort((a, b) => b.veces - a.veces || a.nombre.localeCompare(b.nombre, 'es')).slice(0, n);
};
const cuentaInicio = () => { const l = lista('cuentas').filter(c => !c.archivada).sort((a, b) => (b.creada || 0) - (a.creada || 0)); return l.find(c => c.id === cfgInicio().cuenta) || l[0] || null; };
function notaElegida(k, filtro) { const l = lista('notas').filter(n => n.titulo || n.texto || n.html).filter(filtro || (() => true)).sort((a, b) => (b.fijada ? 1 : 0) - (a.fijada ? 1 : 0) || (b.editada || 0) - (a.editada || 0)); return l.find(n => n.id === cfgInicio()[k]) || l[0] || null; }
const rutinasHoy = () => {
  const out = [];
  ['acuario', 'plantas', 'medicacion'].forEach(c => lista(c).forEach(x => {
    const hechaHoy = x.ultima && isoDia(new Date(x.ultima)) === hoyISO();
    if (tocaHoy(c, x) || (hechaHoy && conRecuerdo(c, x))) out.push([c, x, hechaHoy && !tocaHoy(c, x)]);
  }));
  return out;
};

/* ---------- las tarjetas ---------- [título, sección, tamaño, color, pintar → {h, vacio}] */
const W = {};
const SECS = ['Agenda', 'Tareas', 'Compra', 'Gastos', 'Cuentas compartidas', 'Menú', 'Notas', 'Documentos', 'Plantas', 'Medicación', 'Acuario', 'Coches', 'Varios'];
const SECCOL = { Agenda: 5, Tareas: 1, Compra: 2, Gastos: 6, 'Cuentas compartidas': 7, 'Menú': 0, Notas: 1, Documentos: 6, Plantas: 3, 'Medicación': 7, Acuario: 4, Coches: 5, Varios: 4 };
const wd = (k, t, sec, sz, col, desc, f) => { W[k] = { t: t, sec: sec, sz: sz, col: col, desc: desc, f: f }; };

/* Agenda */
wd('hoy', 'Hoy', 'Agenda', 'L', cAZ, 'El día en línea de tiempo: eventos y tus tareas', () => {
  const h = hoyISO(), evs = eventosDia(h), ts = lista('tareas').filter(t => !t.hecho && t.fecha && t.fecha <= h && mias(t)).sort((a, b) => (a.hora || '99').localeCompare(b.hora || '99'));
  const it = evs.map(e => [e.todoDia ? 'Todo el día' : hora(new Date(e.inicio)), '<span class="pb" style="background:' + colorEv(e) + '"></span><button class="tt2" data-a="verEvento" data-id="' + esc(e.id) + '">' + esc(e.titulo) + '</button>', e.todoDia ? '0' : hora(new Date(e.inicio))])
    .concat(ts.map(t => [t.fecha < h ? 'Atrasada' : (t.hora || 'Hoy'), wck(t.para === 'todos' ? 'var(--ink)' : colorDe(t.para), false, 'hacerTarea', 'data-id="' + t.id + '"') + '<button class="tt2" data-a="verTarea" data-id="' + t.id + '">' + esc(t.titulo) + candado(t) + '</button>', t.fecha < h ? '00' : (t.hora || '99')]))
    .sort((a, b) => a[2].localeCompare(b[2])).slice(0, 6);
  const d = new Date();
  return { vacio: !it.length, h: lab('Hoy', wlink('Agenda', 'wAgenda')) + '<div class="hoyw"><div class="dia3"><b>' + d.getDate() + '</b><span>' + DIAS[d.getDay()] + '</span></div><div class="tl">' + (it.length ? it.map(x => '<div class="ti"><small>' + x[0] + '</small><div class="tb">' + x[1] + '</div></div>').join('') : '<p class="mu2">Nada para hoy</p>') + '</div></div>' };
});
wd('proxEv', 'Próximo evento', 'Agenda', 'S', cAZ, 'Lo siguiente y cuánto falta', () => {
  const e = eventosEntre(new Date(), sumaDias(hoy0(), 60)).filter(x => x.todoDia ? x.inicio >= hoy0().getTime() : x.inicio > Date.now())[0];
  if (!e) return { vacio: true, h: lab('Próximo evento') + '<p class="mu2">Nada en la agenda</p>' };
  const f = e.todoDia ? [diasHasta(isoDia(new Date(e.inicio))), ''] : cuantoFalta(e.inicio);
  const n = e.todoDia ? (f[0] === 0 ? 'Hoy' : f[0] === 1 ? 'Mañana' : f[0]) : f[0];
  return { h: lab('Próximo evento') + '<button class="wbody" data-a="verEvento" data-id="' + esc(e.id) + '">' + big(n, e.todoDia ? (typeof n === 'number' ? 'días' : '') : f[1]) + '<b class="tt">' + esc(e.titulo) + '</b><small class="mu2">' + (e.todoDia ? cuando(isoDia(new Date(e.inicio))) : cuando(isoDia(new Date(e.inicio)), hora(new Date(e.inicio)))) + (e.lugar ? ' · ' + esc(e.lugar) : '') + '</small></button>' };
});
wd('cumple', 'Cumpleaños', 'Agenda', 'S', cRO, 'Los próximos de la agenda', () => {
  const l = eventosEntre(hoy0(), sumaDias(hoy0(), 62)).filter(e => e.tipo === 'cumpleanos' || /cumple/i.test(e.titulo)).slice(0, 3);
  return { vacio: !l.length, h: lab('Cumpleaños') + (l.length ? l.map(e => '<button class="cu" data-a="verEvento" data-id="' + esc(e.id) + '">' + ic('cumpleanos', 22, 7) + '<div><b>' + esc(e.titulo.replace(/^cumple(años)?( de)?\s*/i, '') || e.titulo) + '</b><small>' + cuando(isoDia(new Date(e.inicio))).toLowerCase() + '</small></div></button>').join('') : '<p class="mu2">Ninguno en los próximos dos meses</p>') };
});
wd('mes', 'Mes', 'Agenda', 'L', cAZ, 'Calendario pequeño con puntos', () => {
  const d = new Date(), ini = new Date(d.getFullYear(), d.getMonth(), 1), n = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  let h = LETRAS.map(x => '<small>' + x + '</small>').join('') + '<span></span>'.repeat(diaSemana(ini) - 1);
  for (let i = 1; i <= n; i++) {
    const iso = isoDia(new Date(d.getFullYear(), d.getMonth(), i));
    const ps = eventosDia(iso).slice(0, 3).map(e => dot(colorEv(e), 4)).join('') + (lista('tareas').some(t => !t.hecho && t.fecha === iso && mias(t)) ? dot(cLI, 4) : '');
    h += '<span class="' + (i === d.getDate() ? 'td' : '') + '">' + i + '<em>' + ps + '</em></span>';
  }
  return { h: lab(cap(MESES[d.getMonth()]), wlink('Agenda', 'wAgenda')) + '<div class="mcal">' + h + '</div>' };
});
function proximos7() {
  const h = hoyISO(), fin = isoDia(sumaDias(hoy0(), 6)), out = [];
  const en = f => f && f >= h && f <= fin;
  lista('fijos').filter(x => en(x.proximo)).forEach(x => out.push([x.proximo, x.nombre + (x.importe ? ' · ' + euros(x.importe) : ''), 'Gasto fijo', cLI, 'verFijo', x.id]));
  lista('coche').filter(x => en(x.fecha)).forEach(x => out.push([x.fecha, x.nombre + ' · ' + ((datoCoche(cocheDe(x)) || {}).nombre || 'coche'), 'Coche', cAZ, 'cocheFechaVer', x.id]));
  ['plantas', 'acuario', 'medicacion'].forEach(c => lista(c).filter(x => conRecuerdo(c, x) && en(x.proximo) && x.proximo > h).forEach(x => out.push([x.proximo, (c === 'plantas' ? 'Regar ' : '') + x.nombre, MODS[c][0], COL[RUTINAS[c].ci], 'rutVer" data-col="' + c, x.id])));
  lista('documentos').filter(x => en(x.vence)).forEach(x => out.push([x.vence, x.nombre + ' caduca', 'Documentos', cLV, 'docAbrir', x.id]));
  lista('tareas').filter(t => !t.hecho && mias(t) && en(t.fecha) && t.fecha > h).forEach(t => out.push([t.fecha, t.titulo, 'Tarea', cLI, 'verTarea', t.id]));
  eventosEntre(sumaDias(hoy0(), 1), sumaDias(hoy0(), 7)).forEach(e => out.push([isoDia(new Date(e.inicio)), e.titulo, 'Agenda', colorEv(e), 'verEvento', e.id]));
  return out.sort((a, b) => a[0].localeCompare(b[0]));
}
wd('proximos', 'Próximos 7 días', 'Agenda', 'L', cVE, 'Pagos, ITV, riego, caducidades, tareas y eventos de la semana', () => {
  const l = proximos7(), h0 = hoy0();
  const tira = [0, 1, 2, 3, 4, 5, 6].map(i => { const d = sumaDias(h0, i), iso = isoDia(d), xs = l.filter(x => x[0] === iso); return '<div class="' + (xs.length ? 'on' : '') + (i === 0 ? ' hoy' : '') + '"><small>' + LETRAS[diaSemana(d) - 1] + '</small><b>' + d.getDate() + '</b><em>' + xs.slice(0, 3).map(x => dot(x[3], 6)).join('') + '</em></div>'; }).join('');
  return { vacio: !l.length, h: lab('Próximos 7 días') + '<div class="strip">' + tira + '</div>' + (l.length ? l.slice(0, 4).map(x => { const d = deISO(x[0]); return '<button class="rw" data-a="' + x[4] + '" data-id="' + esc(x[5]) + '"><span class="dd" style="background:' + x[3] + '26">' + LETRAS[diaSemana(d) - 1] + ' ' + d.getDate() + '</span><b>' + esc(x[1]) + '</b><small>' + x[2] + '</small></button>'; }).join('') : '<p class="mu2">Semana tranquila</p>') };
});
wd('cuenta', 'Cuenta atrás', 'Agenda', 'S', cCO, 'Días que faltan para un evento que elijas', () => {
  const c = cfgInicio().cuentaAtras;
  if (!c || !c.fecha || c.fecha < hoyISO()) return { vacio: false, h: lab('Cuenta atrás') + '<p class="mu2" style="margin-bottom:10px">Elige un evento de la agenda</p><button class="btn3" data-a="wCuentaElegir">Elegir</button>' };
  const n = diasHasta(c.fecha);
  return { h: lab('Cuenta atrás') + '<button class="wbody" data-a="wCuentaElegir">' + big(n, n === 1 ? 'día' : 'días') + '<b class="tt">' + esc(c.titulo) + '</b><small class="mu2">' + fechaCorta(deISO(c.fecha)) + '</small></button>' };
});

/* Tareas */
wd('tareas', 'Mis tareas', 'Tareas', 'L', cLI, 'Cuántas llevas hechas hoy y las siguientes', () => {
  const l = lista('tareas').filter(mias), pend = l.filter(t => !t.hecho).sort((a, b) => ((a.fecha || '9999') + (a.hora || '99')).localeCompare((b.fecha || '9999') + (b.hora || '99')));
  const hoyT = l.filter(t => t.fecha === hoyISO() || (t.hecho && t.hechoEn && isoDia(new Date(t.hechoEn)) === hoyISO())), hechas = hoyT.filter(t => t.hecho).length;
  return { vacio: !pend.length && !hoyT.length, h: lab('Mis tareas', wlink(pend.length ? 'Ver las ' + pend.length : 'Tareas', 'wTareas')) + '<div class="prg"><b>' + hechas + '</b><span>de ' + hoyT.length + ' hechas hoy</span></div><div class="bar2"><i style="width:' + (hoyT.length ? Math.round(100 * hechas / hoyT.length) : 0) + '%;background:' + cLI + '"></i></div>' +
    (pend.length ? pend.slice(0, 3).map(t => '<div class="rw">' + wck(t.para === 'todos' ? 'var(--ink)' : colorDe(t.para), false, 'hacerTarea', 'data-id="' + t.id + '"') + '<button class="tt2" data-a="verTarea" data-id="' + t.id + '">' + esc(t.titulo) + candado(t) + '</button><small>' + (t.para === 'todos' ? 'Todos' : t.fecha ? cuando(t.fecha).replace('Atrasada · ', '') : '') + '</small></div>').join('') : '<p class="mu2">Nada pendiente</p>') };
});
wd('paraHoy', 'Para hoy', 'Tareas', 'S', cLI, 'Cuántas y de quién', () => {
  const l = lista('tareas').filter(t => !t.hecho && t.fecha && t.fecha <= hoyISO());
  const atr = l.filter(t => t.fecha < hoyISO()).length;
  return { vacio: !l.length, h: lab('Para hoy') + '<button class="wbody" data-a="wTareas">' + big(l.length, l.length === 1 ? 'tarea' : 'tareas') + (atr ? '<span class="warn">' + atr + (atr === 1 ? ' atrasada' : ' atrasadas') + '</span>' : '') + '<div class="avs">' + personas().map(p => av(p, 24) + '<b>' + l.filter(t => t.para === p.id || t.para === 'todos').length + '</b>').join('') + '</div></button>' };
});
wd('atras', 'Atrasadas', 'Tareas', 'S', cCO, 'Solo lo que se ha pasado', () => {
  const l = lista('tareas').filter(t => !t.hecho && t.fecha && t.fecha < hoyISO()).sort((a, b) => a.fecha.localeCompare(b.fecha));
  return { vacio: !l.length, h: lab('Atrasadas') + '<div class="alert">' + ic('aviso', 22, 0) + '<b>' + l.length + '</b></div>' + l.slice(0, 2).map(t => '<div class="rw">' + wck(t.para === 'todos' ? 'var(--ink)' : colorDe(t.para), false, 'hacerTarea', 'data-id="' + t.id + '"') + '<button class="tt2" data-a="verTarea" data-id="' + t.id + '">' + esc(t.titulo) + candado(t) + '</button></div>').join('') };
});
wd('quien', 'Quién tiene qué', 'Tareas', 'S', cVE, 'Tareas pendientes de cada persona', () => {
  const l = lista('tareas').filter(t => !t.hecho), mx = Math.max(1, ...personas().map(p => l.filter(t => t.para === p.id).length));
  return { vacio: !l.length, h: lab('Quién tiene qué') + personas().map(p => { const n = l.filter(t => t.para === p.id).length; return '<div class="qq">' + av(p, 26) + '<div class="f"><b>' + esc(p.nombre) + ' · ' + n + '</b><div class="bar2 sm"><i style="width:' + Math.round(100 * n / mx) + '%;background:' + p.color + '"></i></div></div></div>'; }).join('') + '<small class="mu2">' + l.filter(t => t.para === 'todos').length + ' de todos · ' + l.filter(t => t.fecha === hoyISO()).length + ' para hoy</small>' };
});
function racha() {
  const l = lista('tareas');
  let n = 0, hoyOk = false;
  for (let i = 0; i < 60; i++) {
    const iso = isoDia(sumaDias(hoy0(), -i));
    const del = l.filter(t => t.fecha === iso || (t.hecho && t.hechoEn && isoDia(new Date(t.hechoEn)) === iso));
    if (!del.length) { if (i === 0) continue; else continue; }
    const ok = del.every(t => t.hecho || (t.fecha && t.fecha > iso));
    if (i === 0) { hoyOk = ok; if (ok) n++; continue; }
    if (!ok) break;
    n++;
  }
  return [n, hoyOk];
}
wd('racha', 'Racha', 'Tareas', 'S', cVE, 'Días seguidos con todo hecho', () => {
  const r = racha(), sem = [0, 1, 2, 3, 4, 5, 6].map(i => i < Math.min(7, r[0]));
  return { h: lab('Racha') + big(r[0], r[0] === 1 ? 'día con todo hecho' : 'días con todo hecho') + '<div class="rach">' + sem.reverse().map((x, i) => '<i class="' + (x ? 'on' : '') + (i === 6 ? ' hoy' : '') + '"></i>').join('') + '</div>' };
});

/* Compra */
wd('rapido', 'Añadir rápido', 'Compra', 'L', cLA, 'Escribir sin entrar y lo que más compráis a un toque', () => {
  const lid = cfgInicio().rapido && datoLista(cfgInicio().rapido) ? cfgInicio().rapido : ultimaLista(), L = datoLista(lid) || { nombre: 'Supermercado' };
  const fr = frecuentes(lid, 5);
  return { h: lab('Añadir a la compra') + '<form class="qa2" onsubmit="return false">' + ic('anadir', 20) + '<input id="wqN" placeholder="¿Qué falta?" autocomplete="off" enterkeyhint="done" maxlength="60" data-lid="' + lid + '"><button type="button" class="qal" data-a="wqLista">' + esc(L.nombre) + '</button><button type="submit" class="oculto" data-a="wqOk"></button></form>' +
    (fr.length ? '<div class="chips sm3">' + fr.map(x => '<button class="chip" data-a="wqFrec" data-n="' + esc(x.nombre) + '" data-lid="' + lid + '">+ ' + esc(x.nombre) + '</button>').join('') + '</div><small class="mu2">Lo que más compráis, a un toque</small>' : '') };
});
wd('compra', 'Resumen de la compra', 'Compra', 'S', cLA, 'Total por comprar y cuánto en cada lista', () => {
  const ls = listasCompra(), tot = ls.reduce((a, l) => a + pendientesDe(l.id), 0);
  return { vacio: !tot, h: lab('Compra') + '<button class="plus" data-a="aProducto" aria-label="Añadir">' + ic('anadir', 20, 0, 'var(--bg)') + '</button><button class="wbody" data-a="wCompra">' + big(tot, 'por comprar') + '<div class="lst">' + ls.slice(0, 4).map(l => '<div><span style="background:' + COL[l.ci || 0] + '"></span><small>' + esc(l.nombre) + '</small><b>' + pendientesDe(l.id) + '</b></div>').join('') + '</div></button>' };
});
wd('siempre', 'Lo de siempre', 'Compra', 'S', cLA, 'Productos frecuentes a un toque', () => {
  const fr = frecuentes(LSUPER, 5);
  return { vacio: !fr.length, h: lab('Lo de siempre') + (fr.length ? '<div class="chips sm3">' + fr.map(x => '<button class="chip" data-a="wqFrec" data-n="' + esc(x.nombre) + '" data-lid="' + LSUPER + '">+ ' + esc(x.nombre) + '</button>').join('') + '</div>' : '<p class="mu2">Saldrán cuando compréis algo varias veces</p>') };
});
wd('lista', 'Una lista', 'Compra', 'L', cLA, 'La lista que elijas, para marcar desde aquí', () => {
  const L = datoLista(cfgInicio().lista) || listasCompra()[0] || { id: LSUPER, nombre: 'Supermercado' };
  const l = lista('compra').filter(x => !x.hecho && listaDe(x) === L.id).sort((a, b) => (a.orden || 0) - (b.orden || 0));
  return { vacio: !l.length, h: lab(esc(L.nombre), wlink(l.length + ' por comprar', 'wLista" data-id="' + L.id)) + (l.length ? '<div class="two2">' + l.slice(0, 8).map(x => '<div class="cl it" data-a="marcar" data-id="' + x.id + '"><span class="ck">' + tick(12) + '</span><span class="cln">' + esc(x.nombre) + '</span></div>').join('') + '</div>' : '<p class="mu2">Nada por comprar</p>') };
});

/* Gastos */
wd('cats', 'Por categoría', 'Gastos', 'L', cLV, 'En qué se van los gastos fijos al mes', () => {
  const l = lista('fijos'), m = {};
  l.forEach(x => { const c = catF(x.categoria); m[c[0]] = m[c[0]] || [c[1], 0, COL[c[2]]]; m[c[0]][1] += (Number(x.importe) || 0) / mesesDe(x.cada); });
  const xs = Object.keys(m).map(k => m[k]).sort((a, b) => b[1] - a[1]).slice(0, 5), mx = Math.max(1, ...xs.map(x => x[1])), tot = xs.reduce((a, x) => a + x[1], 0);
  return { vacio: !xs.length, h: lab('Gastos fijos al mes', wlink(euros(tot), 'wGastos')) + xs.map(x => '<div class="hb"><small>' + esc(x[0]) + '</small><div class="bar2"><i style="width:' + Math.round(100 * x[1] / mx) + '%;background:' + x[2] + '"></i></div><b>' + euros(x[1]).replace(',00', '') + '</b></div>').join('') };
});
wd('fijosMes', 'Fijos del mes', 'Gastos', 'S', cLV, 'Lo pagado del mes', () => {
  const l = lista('fijos'), mk = claveMes(new Date());
  const pag = l.reduce((a, x) => a + (x.pagos || []).filter(g => g.fecha && g.fecha.slice(0, 7) === mk).reduce((b, g) => b + (Number(g.importe) || 0), 0), 0);
  const falta = l.filter(x => x.proximo && x.proximo.slice(0, 7) <= mk).reduce((a, x) => a + (Number(x.importe) || 0), 0);
  const tot = pag + falta;
  return { vacio: !l.length, h: lab('Gastos fijos') + '<button class="wbody" data-a="wGastos"><div class="cen">' + donut(tot ? pag / tot : 1, cLV, tot ? Math.round(100 * pag / tot) + ' %' : 'Al día') + '</div><small class="mu2" style="text-align:center">' + (tot ? euros(pag).replace(',00', '') + ' de ' + euros(tot).replace(',00', '') : 'Nada que pagar') + ' · ' + MESES[new Date().getMonth()] + '</small></button>' };
});
wd('proxPago', 'Próximo pago', 'Gastos', 'S', cLV, 'El siguiente gasto fijo', () => {
  const x = lista('fijos').filter(f => f.proximo).sort((a, b) => a.proximo.localeCompare(b.proximo))[0];
  if (!x) return { vacio: true, h: lab('Próximo pago') + '<p class="mu2">Sin gastos fijos</p>' };
  const c = catF(x.categoria), n = diasHasta(x.proximo);
  return { h: lab('Próximo pago') + '<button class="wbody" data-a="verFijo" data-id="' + x.id + '">' + big(euros(x.importe).replace(' €', ''), '€') + '<div class="cu">' + ic(c[0], 22, c[2]) + '<div><b>' + esc(x.nombre) + '</b><small>' + textoFaltan(n) + ' · ' + (x.quien === 'mitad' ? 'a medias' : esc(nombreDe(x.quien))) + '</small></div></div></button>' };
});
wd('mesVs', 'Gastado este mes', 'Gastos', 'S', cLV, 'Lo de las cuentas, comparado con el mes anterior', () => {
  const d = new Date(), mk = claveMes(d), ant = claveMes(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const movs = lista('movs').filter(m => m.tipo !== 'transferencia');
  const t = k => movs.filter(m => (m.fecha || '').slice(0, 7) === k).reduce((a, m) => a + (Number(m.importe) || 0), 0);
  const a = t(mk), b = t(ant);
  if (!a && !b) return { vacio: true, h: lab('Gastado este mes') + '<p class="mu2">Sin gastos en las cuentas</p>' };
  const pc = b ? Math.round(100 * (a - b) / b) : 0;
  const ser = [5, 4, 3, 2, 1, 0].map(i => t(claveMes(new Date(d.getFullYear(), d.getMonth() - i, 1)))), mx = Math.max(1, ...ser);
  return { h: lab('Gastado este mes') + big(euros(a).replace(',00', '').replace(' €', ''), '€') + (b ? '<span class="' + (pc <= 0 ? 'good' : 'warn') + '">' + (pc > 0 ? '+' : '') + pc + ' % que ' + MESES[(d.getMonth() + 11) % 12] + '</span>' : '') +
    '<svg class="spk" viewBox="0 0 120 34" preserveAspectRatio="none"><polyline points="' + ser.map((v, i) => (i * 24) + ',' + (30 - 26 * v / mx).toFixed(1)).join(' ') + '" fill="none" stroke="' + cLV + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' };
});

/* Cuentas compartidas */
function miSaldo(c) { const s = saldosDe(c.id), yoP = (c.participantes || []).find(x => x.persona === yoId()); return [s, yoP]; }
wd('balance', 'Balance', 'Cuentas compartidas', 'S', cRO, 'Quién debe a quién', () => {
  const c = cuentaInicio();
  if (!c) return { vacio: true, h: lab('Cuentas') + '<p class="mu2">Sin cuentas compartidas</p>' };
  const [s, yoP] = miSaldo(c), r = reembolsos(s), mio = r.find(x => yoP && (x.de === yoP.id || x.a === yoP.id)) || r[0];
  const tot = lista('movs').filter(m => m.cuenta === c.id && m.tipo !== 'transferencia').reduce((a, m) => a + (Number(m.importe) || 0), 0);
  const txt = !mio ? 'Estáis en paz' : yoP && mio.a === yoP.id ? esc(partNombre(c, mio.de)) + ' te debe' : yoP && mio.de === yoP.id ? 'Debes a ' + esc(partNombre(c, mio.a)) : esc(partNombre(c, mio.de)) + ' debe a ' + esc(partNombre(c, mio.a));
  const ps = (c.participantes || []).map((x, i) => [x, Math.max(0, lista('movs').filter(m => m.cuenta === c.id && m.tipo !== 'transferencia' && m.pagadoPor === x.id).reduce((a, m) => a + (Number(m.importe) || 0), 0)), partColor(c, x.id, i)]);
  return { h: lab(esc(c.nombre)) + '<button class="wbody" data-a="ir" data-id="cuenta" data-cid="' + c.id + '"><small class="who">' + txt + '</small><div class="amt">' + (mio ? euros(mio.importe) : '0 €') + '</div><div class="split2">' + ps.map(x => '<i style="flex:' + Math.max(1, Math.round(x[1])) + ';background:' + x[2] + '"></i>').join('') + '</div><small class="mu2">' + euros(tot) + ' en total</small></button>' };
});
wd('saldar', 'Saldar', 'Cuentas compartidas', 'S', cRO, 'Lo que falta para quedar en paz', () => {
  const c = cuentaInicio();
  if (!c) return { vacio: true, h: lab('Saldar') + '<p class="mu2">Sin cuentas compartidas</p>' };
  const [s, yoP] = miSaldo(c), r = reembolsos(s), x = r.find(y => yoP && (y.de === yoP.id || y.a === yoP.id)) || r[0];
  if (!x) return { vacio: true, h: lab('Saldar') + '<p class="mu2">Estáis en paz</p>' };
  return { h: lab('Para quedar en paz') + '<div class="pz"><b>' + esc(partNombre(c, x.de)) + '</b><span>→</span><b>' + esc(partNombre(c, x.a)) + '</b></div><div class="amt" style="margin:6px 0 8px">' + euros(x.importe) + '</div><button class="btn3" data-a="ir" data-id="cuenta" data-cid="' + c.id + '">Saldar</button>' };
});
wd('movs', 'Últimos gastos', 'Cuentas compartidas', 'L', cRO, 'De la cuenta compartida más reciente', () => {
  const c = cuentaInicio();
  if (!c) return { vacio: true, h: lab('Últimos gastos') + '<p class="mu2">Sin cuentas compartidas</p>' };
  const l = lista('movs').filter(m => m.cuenta === c.id && m.tipo !== 'transferencia').sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.creado || 0) - (a.creado || 0)).slice(0, 3);
  return { vacio: !l.length, h: lab(esc(c.nombre) + ' · últimos gastos', wlink('Cuenta', 'ir" data-id="cuenta" data-cid="' + c.id)) + (l.length ? l.map(m => { const pp = (c.participantes || []).find(x => x.id === m.pagadoPor) || {}; return '<button class="rw" data-a="verMov" data-id="' + m.id + '">' + (pp.persona && dato('personas', pp.persona) ? av(dato('personas', pp.persona), 26) : dot(partColor(c, m.pagadoPor, 0), 12)) + '<b>' + esc(m.concepto || 'Gasto') + '</b><small>' + euros(m.importe) + '</small></button>'; }).join('') : '<p class="mu2">Sin gastos todavía</p>') };
});

/* Menú */
const mitades = cs => '<div class="halves n' + Math.min(cs.length, 3) + '">' + cs.map(x => '<div style="--h:' + COL[x[0][2]] + '">' + ic(x[0][3], 20, x[0][2]) + '<small>' + x[0][1] + '</small><b class="' + (x[1] ? '' : 'ph') + '">' + esc(x[1] || 'Sin poner') + '</b></div>').join('') + '</div>';
wd('menu', 'Menú de hoy', 'Menú', 'L', cCO, 'Las comidas de hoy, enteras', () => {
  const cs = menuDe(new Date());
  return { vacio: !cs.some(x => x[1]), h: lab('Menú de hoy', wlink('Semana', 'wMenu')) + '<button class="wbody" data-a="wMenuDia" data-d="0">' + mitades(cs) + '</button>' };
});
wd('manana', 'Menú de mañana', 'Menú', 'S', cCO, 'Para ir pensando', () => {
  const cs = menuDe(sumaDias(hoy0(), 1));
  return { vacio: !cs.some(x => x[1]), h: lab('Menú de mañana') + '<button class="wbody" data-a="wMenuDia" data-d="1">' + cs.map(x => '<div class="mm">' + ic(x[0][3], 18, x[0][2]) + '<b class="' + (x[1] ? '' : 'ph') + '">' + esc(x[1] || 'Sin poner') + '</b></div>').join('') + '</button>' };
});
wd('semana', 'Menú de la semana', 'Menú', 'L', cCO, 'La semana en una tabla compacta. Eliges qué comidas y qué días', () => {
  const cfg = cfgInicio().semana || {}, on = comidasOn();
  let cs = on.filter(c => !cfg.comidas || cfg.comidas.indexOf(c[0]) >= 0); if (!cs.length) cs = on.slice(0, 2);
  const lun = lunesDe(new Date()), h0 = hoy0(), modo = cfg.dias || 'adelante';
  let dias = [0, 1, 2, 3, 4, 5, 6].map(i => sumaDias(lun, i));
  if (modo === 'adelante') dias = dias.filter(d => d >= h0);
  else if (modo === 'dos') dias = [h0, sumaDias(h0, 1)];
  else if (modo === 'hoy') dias = [h0];
  const filas = dias.map(d => { const m = menuDe(d).filter(x => cs.some(c => c[0] === x[0][0])), hoy = isoDia(d) === hoyISO(); return '<div class="tqr' + (hoy ? ' hoy' : '') + '"><b><small>' + LETRAS[diaSemana(d) - 1] + '</small>' + d.getDate() + '</b>' + m.map(x => x[1] ? '<span>' + esc(x[1]) + '</span>' : '<span class="vac">·</span>').join('') + '</div>'; });
  return { vacio: !dias.some(d => menuDe(d).some(x => x[1])), h: lab('Menú de la semana', wlink('Editar', 'wMenu')) + '<div class="tq tqc" style="--n:' + cs.length + '"><div class="tqh"><span></span>' + cs.map(c => '<span>' + c[1] + '</span>').join('') + '</div>' + filas.join('') + '</div>' };
});
W.semana.opciones = 'wSemanaOpc';
ACC.wSemanaOpc = () => {
  const cfg = Object.assign({ dias: 'adelante' }, cfgInicio().semana || {}), on = comidasOn();
  cfg.comidas = cfg.comidas || on.map(c => c[0]).slice(0, 2);
  const pinta = () => '<h3>Tarjeta «Menú de la semana»</h3><p class="lab2">Qué comidas enseña</p><div class="card grp">' + on.map(c => '<div class="row">' + ic(ICOMIDA[c[0]], 22, c[2]) + '<b style="flex:1">' + c[1] + '</b>' + swi(cfg.comidas.indexOf(c[0]) >= 0, 'wsCom', 'data-v="' + c[0] + '"') + '</div>').join('') + '</div>' +
    '<p class="lab2">Qué días</p><div class="chips">' + [['adelante', 'De hoy en adelante'], ['semana', 'Semana entera'], ['dos', 'Hoy y mañana'], ['hoy', 'Solo hoy']].map(x => '<button class="chip' + (cfg.dias === x[0] ? ' on' : '') + '" data-a="wsDia" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
    '<p class="cap">Solo cambia la tarjeta: el menú sigue teniendo todas sus comidas.</p>';
  const h = abrirHoja(pinta(), { alCerrar: () => { fijarCfg({ semana: cfg }); Nav.refrescar(true); } });
  ACC.wsCom = el => { const v = el.dataset.v, i = cfg.comidas.indexOf(v); if (i >= 0) { if (cfg.comidas.length === 1) return toast('Deja al menos una.'); cfg.comidas.splice(i, 1); } else cfg.comidas.push(v); $('.hc', h).innerHTML = pinta(); };
  ACC.wsDia = el => { cfg.dias = el.dataset.v; $('.hc', h).innerHTML = pinta(); };
};


/* Notas */
const postit = n => '<button class="post" style="--c:' + (colorNota(n) || 'var(--ln)') + '" data-a="verNota" data-id="' + n.id + '"><b>' + esc(n.titulo || 'Nota') + '</b><div class="pv">' + htmlNota(n) + '</div></button>';
wd('notas', 'Notas fijadas', 'Notas', 'L', cLI, 'Las notas fijadas, como pósits', () => {
  const l = lista('notas').filter(n => n.fijada && (n.titulo || n.texto || n.html)).sort((a, b) => (b.editada || 0) - (a.editada || 0)).slice(0, 4);
  return { vacio: !l.length, h: lab('Notas fijadas', wlink('Notas', 'wNotas')) + (l.length ? '<div class="posts">' + l.map(postit).join('') + '</div>' : '<p class="mu2">Fija una nota desde su menú</p>') };
});
wd('nota', 'Una nota', 'Notas', 'S', cLV, 'La nota que elijas', () => {
  const n = notaElegida('nota');
  return { vacio: !n, h: lab('Nota') + (n ? '<div class="posts uno">' + postit(n) + '</div>' : '<p class="mu2">Sin notas</p>') };
});
wd('casillas', 'Casillas de una nota', 'Notas', 'L', cLI, 'Marcar sin abrir la nota', () => {
  const n = notaElegida('casillas', x => /class="todo"/.test(x.html || ''));
  if (!n) return { vacio: true, h: lab('Casillas') + '<p class="mu2">Crea una nota con casillas</p>' };
  const lis = []; try { new DOMParser().parseFromString(n.html, 'text/html').querySelectorAll('ul.todo > li').forEach(li => lis.push([li.textContent.trim(), li.classList.contains('hecho')])); } catch (e) { }
  return { h: lab(esc(n.titulo || 'Nota'), wlink('Abrir', 'verNota" data-id="' + n.id)) + '<div class="two2">' + lis.slice(0, 10).map((x, i) => '<button class="cl" data-a="wCasilla" data-id="' + n.id + '" data-i="' + i + '"><span class="ck' + (x[1] ? ' on' : '') + '" style="' + (x[1] ? 'background:' + cLI + ';border-color:transparent' : 'border-color:' + cLI) + '">' + tick(12) + '</span><span class="cln">' + (x[1] ? '<s>' + esc(x[0]) + '</s>' : esc(x[0])) + '</span></button>').join('') + '</div>' };
});

/* Documentos */
wd('caducan', 'Caducan pronto', 'Documentos', 'S', cLV, 'DNI, tarjetas, seguros…', () => {
  const l = lista('documentos').filter(d => d.vence && d.vence <= isoDia(sumaDias(hoy0(), 180))).sort((a, b) => a.vence.localeCompare(b.vence)).slice(0, 2);
  return { vacio: !l.length, h: lab('Caducan pronto') + (l.length ? l.map(d => { const c = CARPETAS.find(x => x[0] === d.carpeta) || CARPETAS[7]; return '<button class="cu" data-a="docAbrir" data-id="' + d.id + '">' + ic(c[2], 22, c[3]) + '<div><b>' + esc(d.nombre) + '</b><small' + (d.vence < hoyISO() ? ' style="color:#C8402B"' : '') + '>' + textoFaltan(diasHasta(d.vence)) + '</small></div></button>'; }).join('') : '<p class="mu2">Nada caduca pronto</p>') };
});
wd('carpetas', 'Carpetas de documentos', 'Documentos', 'L', cLV, 'Entrar directo a una carpeta', () => {
  if (!docsActivos()) return { vacio: true, h: lab('Documentos') + '<p class="mu2">Activa los documentos cifrados</p>' };
  const cs = CARPETAS.map(c => [c, lista('documentos').filter(d => d.carpeta === c[0]).length]).sort((a, b) => b[1] - a[1]).slice(0, 4);
  return { h: lab('Documentos', wlink('Cifrados', 'wDocs')) + '<div class="fold">' + cs.map(x => '<button data-a="docCarpeta" data-v="' + x[0][0] + '">' + sqi(x[0][2], x[0][3]) + '<b>' + x[0][1] + '</b><small>' + x[1] + '</small></button>').join('') + '</div>' };
});

/* Plantas */
wd('regar', 'Toca regar', 'Plantas', 'S', cVE, 'Las de hoy', () => {
  const l = lista('plantas'), t = l.filter(x => tocaHoy('plantas', x));
  return { vacio: !l.length, h: lab('Toca regar') + '<button class="wbody" data-a="wPlantas">' + big(t.length, t.length === 1 ? 'planta' : 'plantas') + t.slice(0, 2).map(x => '<div class="cu">' + ic('gota', 20, 5) + '<div><b>' + esc(x.nombre) + '</b><small>' + cuando(x.proximo).toLowerCase() + '</small></div></div>').join('') + (t.length ? '' : '<small class="mu2">Todas regadas</small>') + '</button>' };
});
wd('plantas', 'Mis plantas', 'Plantas', 'L', cVE, 'Cuánta agua les queda', () => {
  /* 1.7.0: de menos agua a más */
  const l = ordenAgua(lista('plantas')).slice(0, 5);
  const largos = l.some(x => String(x.nombre).length > 18);
  const nivel = x => { const n = diasHasta(x.proximo); return n === null ? 1 : Math.max(0.06, Math.min(1, n / Math.max(1, x.cada || 1))); };
  return { vacio: !l.length, h: lab('Plantas', wlink(lista('plantas').length + '', 'wPlantas')) + '<div class="pl' + (largos ? ' tres' : '') + '">' + l.map(x => '<button data-a="rutVer" data-col="plantas" data-id="' + x.id + '">' + (x.emoji ? '<span class="pem">' + esc(x.emoji) + '</span>' : ic('modulo-plantas', 26, 3)) + '<b class="pn2">' + esc(x.nombre) + '</b><div class="wl2"><i style="height:' + Math.round(100 * nivel(x)) + '%' + (tocaHoy('plantas', x) ? ';background:#E0563C' : '') + '"></i></div></button>').join('') + '</div><small class="mu2">El agua baja hasta el día de riego</small>' };
});

/* Medicación */
wd('medHoy', 'Medicación de hoy', 'Medicación', 'S', cRO, 'Tomas de hoy, para marcar', () => {
  const l = lista('medicacion').filter(x => conRecuerdo('medicacion', x) && (tocaHoy('medicacion', x) || (x.ultima && isoDia(new Date(x.ultima)) === hoyISO())));
  return { vacio: !l.length, h: lab('Medicación hoy') + (l.length ? l.slice(0, 3).map(x => { const ya = !tocaHoy('medicacion', x); return '<div class="cu">' + (ya ? '<span class="ck on" style="background:' + cRO + ';border-color:transparent">' + tick(12) + '</span>' : '<button class="ck" style="border-color:' + cRO + '" data-a="rutHecho" data-col="medicacion" data-id="' + x.id + '">' + tick(12) + '</button>') + '<div><b>' + esc(x.nombre) + '</b><small>' + [x.hora, x.quien ? nombreDe(x.quien) : ''].filter(Boolean).join(' · ') + '</small></div></div>'; }).join('') : '<p class="mu2">Nada que tomar hoy</p>') };
});
wd('medSem', 'Medicación de la semana', 'Medicación', 'L', cRO, 'Qué se ha tomado cada día', () => {
  const l = lista('medicacion').filter(x => conRecuerdo('medicacion', x)).slice(0, 4), lun = lunesDe(new Date());
  if (!l.length) return { vacio: true, h: lab('Tomas de la semana') + '<p class="mu2">Sin medicación con recordatorio</p>' };
  return { vacio: !l.length, h: lab('Tomas de la semana') + '<div class="msem"><span></span>' + LETRAS.map(x => '<small>' + x + '</small>').join('') + l.map(x => '<b>' + esc(x.nombre) + '</b>' + [0, 1, 2, 3, 4, 5, 6].map(i => { const iso = isoDia(sumaDias(lun, i)); return '<i class="' + ((x.hist || []).indexOf(iso) >= 0 ? 'on' : iso === hoyISO() ? 'hoy' : '') + '"></i>'; }).join('')).join('') + '</div>' };
});

/* Acuario */
wd('acProx', 'Próximo cuidado', 'Acuario', 'S', cTU, 'Cuánto falta para lo siguiente', () => {
  const x = lista('acuario').filter(y => y.proximo).sort((a, b) => a.proximo.localeCompare(b.proximo))[0];
  if (!x) return { vacio: true, h: lab('Acuario') + '<p class="mu2">Sin tareas</p>' };
  const n = diasHasta(x.proximo);
  return { h: lab('Acuario') + '<button class="wbody" data-a="wAcuario">' + big(n <= 0 ? 'Hoy' : n, n <= 0 ? '' : n === 1 ? 'día' : 'días') + '<b class="tt">' + esc(x.nombre) + '</b><small class="mu2">' + textoCada(x.cada || 1).toLowerCase() + '</small></button>' };
});
wd('acCuid', 'Cuidados del acuario', 'Acuario', 'L', cTU, 'Con su botón de hecho', () => {
  const l = lista('acuario').sort((a, b) => (a.proximo || '9').localeCompare(b.proximo || '9')).slice(0, 3);
  return { vacio: !l.length, h: lab('Cuidados del acuario', wlink('Acuario', 'wAcuario')) + l.map(x => '<div class="rw">' + ic('pez-betta', 22, 4) + '<button class="tt2" data-a="rutVer" data-col="acuario" data-id="' + x.id + '">' + esc(x.nombre) + '</button>' + (tocaHoy('acuario', x) ? '<button class="pill" data-a="rutHecho" data-col="acuario" data-id="' + x.id + '">Hecho</button>' : '<small>' + cuando(x.proximo) + '</small>') + '</div>').join('') };
});

/* Coches */
wd('coche', 'Próximo vencimiento', 'Coches', 'S', cAZ, 'Días para la ITV, el seguro…', () => {
  const x = lista('coche').filter(v => v.fecha).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  if (!x) return { vacio: true, h: lab('Coche') + '<p class="mu2">Sin vencimientos</p>' };
  const c = datoCoche(cocheDe(x)) || { nombre: 'Coche' }, n = diasHasta(x.fecha);
  return { h: lab('Coche') + '<button class="wbody" data-a="cocheFechaVer" data-id="' + x.id + '"><div class="carw">' + ic('coche', 26, 5) + '<b>' + esc(c.nombre) + '</b></div>' + big(n < 0 ? '!' : n, n < 0 ? 'pasado: ' + esc(x.nombre) : (n === 1 ? 'día' : 'días') + ' para ' + esc(x.nombre)) + '</button>' };
});
wd('coches', 'Todos los coches', 'Coches', 'L', cAZ, 'Lo próximo de cada uno', () => {
  const l = coches();
  return { vacio: !l.length, h: lab('Coches', wlink(l.length + '', 'wCoches')) + l.slice(0, 3).map(c => { const x = proximoVenc(c.id); return '<button class="rw" data-a="verCoche" data-id="' + c.id + '">' + ic('coche', 24, 5) + '<b>' + esc(c.nombre) + '</b>' + (x ? '<span class="tag" style="background:' + (x.fecha < hoyISO() ? cCO : cAZ) + '22">' + esc(x.nombre) + ' · ' + textoFaltan(diasHasta(x.fecha)) + '</span>' : '<small>Sin fechas</small>') + '</button>'; }).join('') };
});

/* Varios */
wd('rutinas', 'Rutinas de hoy', 'Varios', 'S', cTU, 'Acuario, plantas y medicación de hoy', () => {
  const l = rutinasHoy(), h = l.filter(x => x[2]).length;
  return { vacio: !l.length, h: lab('Rutinas de hoy') + '<div class="cen">' + donut(l.length ? h / l.length : 0, cTU, h + '/' + l.length) + '</div><div class="mini3">' + l.slice(0, 4).map(x => '<span class="' + (x[2] ? 'ok' : '') + '">' + ic(RUTINAS[x[0]].icono, 20, RUTINAS[x[0]].ci) + '</span>').join('') + '</div>' };
});
wd('accesos', 'Accesos directos', 'Varios', 'L', cTU, 'Hasta 4 apartados que elijas', () => {
  const ks = (cfgInicio().accesos || ['documentos', 'notas', 'acuario', 'coche']).filter(k => MODS[k]).slice(0, 4);
  const cs = coloresRejilla(ks.map(k => MODS[k][2]));
  return { h: lab('Accesos directos', wlink('Elegir', 'wAccesos')) + '<div class="acc2">' + ks.map((k, i) => '<button data-a="abrirMod" data-id="' + k + '"><span style="background:' + COL[cs[i]] + '">' + ic(MODS[k][1], 28, cs[i], '#FFFDF7') + '</span><small>' + MODS[k][0].split(' ')[0] + '</small></button>').join('') + '</div>' };
});

/* ---------- plantillas ---------- */
const PLANTILLAS = [
  ['hoy', 'Lo de hoy', 'Lo que pasa hoy y lo que toca hacer.', ['hoy', 'compra', 'paraHoy', 'menu', 'proximos', 'accesos']],
  ['casa', 'Casa al día', 'Riego, medicación, acuario y menú.', ['rutinas', 'regar', 'hoy', 'semana', 'siempre', 'medHoy', 'acCuid']],
  ['semana', 'Semana organizada', 'Agenda, tareas y quién hace qué.', ['proxEv', 'cuenta', 'proximos', 'tareas', 'quien', 'racha', 'mes']],
  ['cuentas', 'Cuentas claras', 'Los gastos y las cuentas a la vista.', ['mesVs', 'proxPago', 'cats', 'balance', 'saldar', 'movs', 'fijosMes', 'caducan']],
  ['justo', 'Lo justo', 'El día, apuntar rápido y las notas.', ['hoy', 'rapido', 'notas']]
];
const ordenInicio = () => { const y = yo() || {}; return (Array.isArray(y.inicio) ? y.inicio : PLANTILLAS[0][3]).filter(k => W[k]); };
const ocultasInicio = () => { const y = yo() || {}; return (Array.isArray(y.inicioOcultas) ? y.inicioOcultas : []).filter(k => W[k] && ordenInicio().indexOf(k) < 0); };
function fijarInicio(orden, ocultas) { cambiar('personas', yoId(), { inicio: orden, inicioOcultas: ocultas }); }

function pintarW(k, modo) {
  const w = W[k];
  let r;
  try { r = w.f(); } catch (e) { anotar('tarjeta ' + k, e); r = { vacio: true, h: lab(w.t) + '<p class="mu2">No se ha podido pintar</p>' }; }
  return { vacio: r.vacio, h: '<div class="w ' + w.sz + (modo ? ' ' + modo : '') + (r.vacio && !modo ? ' vac' : '') + '" style="--a:' + (r.col || w.col) + '" data-w="' + k + '"' + (modo ? '' : ' data-lp="editarInicio" data-a="wAbrir" data-k="' + k + '"') + '>' + r.h + (modo === 'edit' || modo === 'hid' ? '<button class="eyeb' + (modo === 'hid' ? ' off' : '') + '" data-a="wOjo" data-k="' + k + '" aria-label="' + (modo === 'hid' ? 'Mostrar' : 'Ocultar') + '">' + ic(modo === 'hid' ? 'ojo-tachado' : 'ojo', 20) + '</button>' : '') + (modo === 'edit' && w.opciones ? '<button class="opcb" data-a="' + w.opciones + '" aria-label="Opciones">' + ic('ajustes', 18) + '</button>' : '') + '</div>' };
}

/* ---------- 10 · Inicio ---------- */
P.inicio = {
  raiz: true, clase: 'con-barra',
  html: (p) => {
    const e = espacio(), ps = personas();
    cargarMes(new Date()); cargarMes(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));
    if (p.editar) {
      const vis = ordenInicio().map(k => pintarW(k, 'edit').h).join(''), hid = ocultasInicio().map(k => pintarW(k, 'hid').h).join('');
      return '<div class="hd"><div><h1>Tu inicio</h1><p>Mantén pulsada una tarjeta y arrástrala. El ojo la oculta.</p></div><button class="listo" data-a="inicioListo">Listo</button></div>' +
        '<div class="mos edit" data-r="mos">' + vis + '</div>' +
        '<div class="btns2" style="margin-top:16px"><button class="btn sec sm" data-a="ir" data-id="tarjetas">' + ic('anadir', 20) + 'Añadir tarjeta</button><button class="btn sec sm" data-a="ir" data-id="plantillas">Plantillas</button></div>' +
        (hid ? '<p class="hidl">Ocultas · toca el ojo para volver a mostrarlas</p><div class="mos">' + hid + '</div>' : '') +
        '<button class="rst" data-a="inicioRestablecer">Restablecer orden original</button>';
    }
    let h = '<div data-r="banda">' + banda() + '</div>' +
      cabeceraInicio(e); /* 1.5.0: anillo, saludo y resumen del día */
    if (esAdmin() && ps.length < 2) h += '<button class="row card" data-a="ir" data-id="invitar" style="margin-bottom:12px">' + sq('invitar', 4) + '<div class="f"><b>Invita a los tuyos</b><small>Crea un código para que se unan</small></div>' + chev + '</button>';
    if (esAdmin() && (!S.cal || !S.cal.id)) h += '<button class="row card" data-a="ir" data-id="avisos" style="margin-bottom:12px">' + sq('modulo-calendario', 5) + '<div class="f"><b>Elige vuestro calendario</b><small>Para la agenda y los avisos</small></div>' + chev + '</button>';
    /* 1.4.0: las tarjetas con el ojo abierto salen siempre (antes, las que no tenían nada desaparecían al pulsar «Listo»). */
    const ws = ordenInicio().map(k => pintarW(k));
    h += ws.length ? '<div class="mos">' + ws.map(x => x.h).join('') + '</div>' : '<div class="aviso">' + ic('informacion', 22, 5) + '<span>Todo tranquilo. Las tarjetas salen cuando tienen algo que enseñar.</span></div>';
    return h + '<button class="pers2" data-a="editarInicio">' + ic('ordenar', 18) + ' Personalizar inicio</button>';
  },
  montar(el, p) { P.inicio.tras(el, p); },
  tras(el, p) {
    if (p.editar) montarArrastre(el, p);
    const i = $('#wqN', el);
    if (i) i.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ACC.wqOk(); } });
    /* La primera vez, cada persona elige cómo empezar. */
    let visto = true; try { visto = !!localStorage.getItem('rondaP-inicio-elegido'); } catch (e) { }
    const y = yo();
    if (!visto && y && !Array.isArray(y.inicio) && !p.editar && !P.inicio.esperando) {
      P.inicio.esperando = true;
      setTimeout(() => { P.inicio.esperando = false; let ya = false; try { ya = !!localStorage.getItem('rondaP-inicio-elegido'); } catch (e) { } const a = Nav.actual(); if (!ya && a && a.id === 'inicio' && Nav.pila.length === 1 && !a.params.editar) { try { localStorage.setItem('rondaP-inicio-elegido', '1'); } catch (e) { } Nav.ir('plantillas', { primera: true }); } }, 800);
    }
  },
  fijo: () => botonDilo() + '<button class="fab" data-a="anadir" aria-label="Añadir">' + ic('anadir', 28) + '</button>'
};
ACC.editarInicio = () => { if (Nav.pila[0].id !== 'inicio') Nav.raiz('inicio'); const e = Nav.pila[0]; Nav.atras(Nav.pila.length - 1); e.params.editar = true; Nav.refrescar(true); $('.pgc', e.el).scrollTop = 0; };
ACC.inicioListo = () => { const e = Nav.actual(); e.params.editar = false; if (ARR.quitar) ARR.quitar(); Nav.refrescar(true); };
ACC.inicioRestablecer = async () => { if (!await preguntar('¿Volver al inicio original?', 'Se ponen las tarjetas de «Lo de hoy» en su orden.', 'Restablecer')) return; fijarInicio(PLANTILLAS[0][3].slice(), []); Nav.refrescar(true); };
ACC.wOjo = (el, ev) => {
  if (ev) ev.stopPropagation();
  const k = el.dataset.k, o = ordenInicio(), h = ocultasInicio();
  if (o.indexOf(k) >= 0) fijarInicio(o.filter(x => x !== k), h.concat([k]));
  else fijarInicio(o.concat([k]), h.filter(x => x !== k));
  Nav.refrescar(true);
};
/* Arrastrar para ordenar: mantener pulsado, mover y soltar. */
function montarArrastre(el, p) {
  const cont = $('[data-r="mos"]', el); if (!cont) return;
  let d = null, t = null, x0 = 0, y0 = 0;
  const cancelar = () => { clearTimeout(t); t = null; };
  cont.addEventListener('pointerdown', ev => {
    const w = ev.target.closest('.w'); if (!w || ev.target.closest('.eyeb')) return;
    x0 = ev.clientX; y0 = ev.clientY; cancelar();
    t = setTimeout(() => {
      const r = w.getBoundingClientRect();
      const ph = document.createElement('div'); ph.className = 'w ' + (w.classList.contains('L') ? 'L' : 'S') + ' hole'; ph.style.height = r.height + 'px';
      w.parentNode.insertBefore(ph, w);
      d = { w: w, ph: ph, dx: x0 - r.left, dy: y0 - r.top };
      w.classList.add('lift'); w.style.width = r.width + 'px'; w.style.left = r.left + 'px'; w.style.top = r.top + 'px';
      document.body.appendChild(w);
      try { navigator.vibrate && navigator.vibrate(10); } catch (e) { }
    }, 320);
  });
  const mover = ev => {
    if (!d) { if (t && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) cancelar(); return; }
    d.w.style.left = (ev.clientX - d.dx) + 'px'; d.w.style.top = (ev.clientY - d.dy) + 'px';
    const otro = $$('.w:not(.hole)', cont).find(o => { const r = o.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; });
    if (otro) { const r = otro.getBoundingClientRect(); const antes = otro.classList.contains('L') ? ev.clientY < r.top + r.height / 2 : ev.clientX < r.left + r.width / 2; cont.insertBefore(d.ph, antes ? otro : otro.nextSibling); }
    /* Si se arrastra al borde, la página se desplaza sola. */
    const pgc = cont.closest('.pgc'), pr = pgc.getBoundingClientRect();
    if (ev.clientY < pr.top + 60) pgc.scrollTop -= 12; else if (ev.clientY > pr.bottom - 60) pgc.scrollTop += 12;
  };
  const soltar = () => {
    cancelar();
    if (!d) return;
    const w = d.w; w.classList.remove('lift'); ['width', 'left', 'top', 'height', 'transform'].forEach(x => w.style.removeProperty(x));
    cont.insertBefore(w, d.ph); d.ph.remove(); d = null;
    const orden = $$('.w', cont).map(x => x.dataset.w).filter(Boolean);
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
const ARR = { quitar: null };

/* Plantillas */
const miniPlantilla = ks => '<div class="minip">' + ks.map(k => W[k] ? (W[k].sz === 'L' ? '<i class="l"></i>' : '<i></i>') : '').join('') + '</div>';
P.plantillas = {
  clase: 'con-boton', fija: true,
  html: p => {
    p.sel = p.sel || 'hoy';
    return tope('Elige tu inicio') + '<p class="texto">' + (p.primera ? 'Ronda tiene un inicio nuevo. ' : '') + 'Empieza con una de estas y luego cámbiala a tu gusto. Puedes volver aquí desde Personalizar inicio.</p><div class="list" style="margin-top:12px">' +
      PLANTILLAS.map((x, i) => '<button class="row card' + (p.sel === x[0] ? ' sel' : '') + '" data-a="pSet" data-k="sel" data-v="' + x[0] + '"><span class="mw" style="--c:' + COL[[5, 3, 1, 6, 0][i]] + '">' + miniPlantilla(x[3]) + '</span><div class="f"><b>' + x[1] + (i === 0 ? ' <span class="pd">Predeterminado</span>' : '') + '</b><small>' + x[2] + '</small></div><span class="rad' + (p.sel === x[0] ? ' on' : '') + '"></span></button>').join('') + '</div>';
  },
  fijo: () => '<div class="btns">' + btn('Usar esta', 'usarPlantilla') + '</div>'
};
ACC.usarPlantilla = () => {
  const p = Nav.actual().params, x = PLANTILLAS.find(y => y[0] === p.sel) || PLANTILLAS[0];
  fijarInicio(x[3].slice(), []);
  try { localStorage.setItem('rondaP-inicio-elegido', '1'); } catch (e) { }
  Nav.atras(); const e = Nav.pila[0]; if (e && e.id === 'inicio') { e.params.editar = false; Nav.refrescar(true); }
  toast('Inicio «' + x[1] + '»');
};

/* Galería para añadir tarjetas */
P.tarjetas = {
  html: () => tope('Añadir tarjeta') + '<p class="texto">Elige de qué y luego cómo la quieres.</p><div class="card grp" style="margin-top:12px">' +
    SECS.map(s => '<button class="row" data-a="ir" data-id="tarjetasSec" data-sec="' + esc(s) + '">' + dot(COL[SECCOL[s]], 12) + '<b style="flex:1">' + s + '</b><small style="font-weight:800;color:var(--mu)">' + Object.keys(W).filter(k => W[k].sec === s).length + '</small>' + chev + '</button>').join('') + '</div>'
};
P.tarjetasSec = {
  html: p => {
    const o = ordenInicio();
    return tope(p.sec) + Object.keys(W).filter(k => W[k].sec === p.sec).map(k => '<div class="prev ' + W[k].sz + '">' + pintarW(k, 'muestra').h + '<div class="prevb"><div class="f"><b>' + W[k].t + '</b><small>' + (W[k].sz === 'L' ? 'Grande' : 'Pequeña') + ' · ' + W[k].desc + '</small></div>' + (o.indexOf(k) >= 0 ? '<span class="mini" style="opacity:.6">Puesta</span>' : '<button class="mini" data-a="wAnadir" data-k="' + k + '">Añadir</button>') + '</div></div>').join('');
  }
};
ACC.wAnadir = el => { const k = el.dataset.k; fijarInicio(ordenInicio().filter(x => x !== k).concat([k]), ocultasInicio().filter(x => x !== k)); Nav.refrescar(true); toast('Añadida al final de tu inicio'); };

/* Acciones desde las tarjetas */
/* Tocar una tarjeta abre la pantalla de lo que enseña (los botones y campos de dentro siguen haciendo lo suyo). */
const SEC_IR = { Agenda: 'wAgenda', Tareas: 'wTareasMias', Compra: 'wCompra', Gastos: 'wGastos', 'Cuentas compartidas': 'wGastos', 'Menú': 'wMenu', Notas: 'wNotas', Documentos: 'wDocs', Plantas: 'wPlantas', 'Medicación': 'wMedicacion', Acuario: 'wAcuario', Coches: 'wCoches', Tiempo: '', Varios: '' };
ACC.wAbrir = (el, ev) => {
  if (ev && ev.target && ev.target.closest && ev.target.closest('input,textarea,select,label,a')) return;
  const w = W[el.dataset.k]; if (!w) return;
  const a = w.ir !== undefined ? w.ir : SEC_IR[w.sec];
  if (a && ACC[a]) ACC[a](el, ev);
};
ACC.wTareasMias = () => { ACC.abrirMod({ dataset: { id: 'tareas' } }); setTimeout(() => { const e = Nav.actual(); if (e && e.id === 'tareas') { e.params.f = 'mias'; Nav.refrescar(true); } }, 40); };
ACC.wMedicacion = () => ACC.abrirMod({ dataset: { id: 'medicacion' } });
ACC.wAgenda = () => ACC.abrirMod({ dataset: { id: 'agenda' } });
ACC.wTareas = () => ACC.abrirMod({ dataset: { id: 'tareas' } });
ACC.wCompra = () => ACC.abrirMod({ dataset: { id: 'compra' } });
ACC.wGastos = () => ACC.abrirMod({ dataset: { id: 'gastos' } });
ACC.wMenu = () => ACC.abrirMod({ dataset: { id: 'menu' } });
ACC.wNotas = () => ACC.abrirMod({ dataset: { id: 'notas' } });
ACC.wDocs = () => ACC.abrirMod({ dataset: { id: 'documentos' } });
ACC.wPlantas = () => ACC.abrirMod({ dataset: { id: 'plantas' } });
ACC.wAcuario = () => ACC.abrirMod({ dataset: { id: 'acuario' } });
ACC.wCoches = () => ACC.abrirMod({ dataset: { id: 'coche' } });
ACC.wLista = el => { fijarUltima(el.dataset.id); Nav.ir('lista', { lid: el.dataset.id }); };
ACC.wMenuDia = el => { const d = sumaDias(hoy0(), +el.dataset.d); Nav.ir('menuDia', { semana: isoDia(lunesDe(d)), d: diaSemana(d) }); };
ACC.wqLista = () => {
  const ls = listasCompra(), i = $('#wqN'), act = i ? i.dataset.lid : ultimaLista();
  const sig = ls[(ls.findIndex(l => l.id === act) + 1) % ls.length];
  if (!sig) return;
  fijarCfg({ rapido: sig.id }); Nav.refrescar(true);
};
ACC.wqOk = () => {
  const i = $('#wqN'); if (!i) return;
  const v = i.value.trim(); if (!v) return i.focus();
  const aviso = anadirProducto(v, i.dataset.lid);
  toast(aviso || '«' + cap(partirCantidad(v).nombre) + '» añadido a ' + (datoLista(i.dataset.lid) || {}).nombre);
  i.value = ''; Nav.refrescar(true);
};
ACC.wqFrec = el => { const aviso = anadirProducto(el.dataset.n, el.dataset.lid); toast(aviso || '«' + el.dataset.n + '» añadido a ' + (datoLista(el.dataset.lid) || {}).nombre); Nav.refrescar(true); };
ACC.wCasilla = el => {
  const n = dato('notas', el.dataset.id); if (!n) return;
  try {
    const doc = new DOMParser().parseFromString('<body>' + n.html + '</body>', 'text/html');
    const li = doc.querySelectorAll('ul.todo > li')[+el.dataset.i]; if (!li) return;
    li.classList.toggle('hecho');
    const html = limpiarHtml(doc.body.innerHTML);
    cambiar('notas', n.id, { html: html, texto: textoPlano(html), editada: Date.now(), por: yoId() });
    Nav.refrescar(true);
  } catch (e) { anotar('casilla', e); }
};
ACC.wCuentaElegir = () => {
  const l = eventosEntre(hoy0(), sumaDias(hoy0(), 62)).slice(0, 30);
  abrirHoja('<h3>Cuenta atrás</h3><p class="texto" style="font-size:14px;margin-bottom:12px">Elige un evento de la agenda (los de los dos próximos meses).</p>' + (l.length ? '<div class="list">' + l.map(e => '<button class="row card" data-a="wCuentaSi" data-t="' + esc(e.titulo) + '" data-f="' + isoDia(new Date(e.inicio)) + '"><div class="f"><b>' + esc(e.titulo) + '</b><small>' + cuando(isoDia(new Date(e.inicio))) + '</small></div></button>').join('') + '</div>' : '<p class="mu2">No hay eventos en la agenda.</p>'));
};
ACC.wCuentaSi = el => { fijarCfg({ cuentaAtras: { titulo: el.dataset.t, fecha: el.dataset.f } }); cerrarHoja(); Nav.refrescar(true); };
ACC.wAccesos = () => {
  const sel = (cfgInicio().accesos || ['documentos', 'notas', 'acuario', 'coche']).slice();
  const pinta = () => '<h3>Accesos directos</h3><p class="texto" style="font-size:14px;margin-bottom:12px">Hasta 4.</p><div class="card grp">' + Object.keys(MODS).map(k => '<button class="row" data-a="wAccTog" data-k="' + k + '">' + ic(MODS[k][1], 24, MODS[k][2]) + '<b style="flex:1">' + MODS[k][0] + '</b><span class="rad' + (sel.indexOf(k) >= 0 ? ' on' : '') + '"></span></button>').join('') + '</div>';
  const h = abrirHoja(pinta(), { alCerrar: () => { fijarCfg({ accesos: sel }); Nav.refrescar(true); } });
  ACC.wAccTog = el => { const k = el.dataset.k, i = sel.indexOf(k); if (i >= 0) sel.splice(i, 1); else { if (sel.length >= 4) return toast('Como mucho 4: quita uno antes.'); sel.push(k); } $('.hc', h).innerHTML = pinta(); };
};
