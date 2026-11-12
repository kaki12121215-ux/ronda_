/* ============================ GASTOS: fijos de casa + cuentas compartidas (activables) ============================ */
const CAT_FIJO = [['luz', 'Luz', 1], ['agua', 'Agua', 5], ['gas', 'Gas', 0], ['internet', 'Internet', 6], ['telefono', 'Teléfono', 4], ['alquiler-o-hipoteca', 'Alquiler o hipoteca', 3], ['seguros', 'Seguros', 2], ['suscripciones', 'Suscripciones', 7], ['impuestos', 'Impuestos', 0], ['coche-y-gasolina', 'Coche', 5], ['salud', 'Salud', 7], ['educacion', 'Educación', 1], ['otros', 'Otros', 6]];
const CADA = [['mes', 'Cada mes', 1], ['2meses', 'Cada 2 meses', 2], ['trimestre', 'Cada 3 meses', 3], ['semestre', 'Cada 6 meses', 6], ['anio', 'Cada año', 12]];
const CAT_MOV = [['alojamiento', 'Alojamiento', 'hogar-espacio', 5], ['entretenimiento', 'Entretenimiento', 'ocio', 6], ['supermercado', 'Supermercado', 'supermercado', 2], ['salud', 'Asistencia sanitaria', 'salud', 7], ['seguros', 'Seguros', 'seguros', 3], ['alquiler', 'Alquiler y cargos', 'alquiler-o-hipoteca', 4], ['restaurantes', 'Restaurantes y bares', 'restaurantes', 0], ['compras', 'Compras', 'bolsa', 1], ['transporte', 'Transporte', 'transporte-publico', 5], ['otro', 'Otro', 'otros', 6]];
const cadaP = c => { const m = String(c || '').match(/^p:(\d+):([dsma])$/); return m ? { n: +m[1], u: m[2] } : null; };
const mesesDe = c => { const q = cadaP(c); if (q) return Math.max(0.03, q.n * uni(q.u)[3] / 30.44); return (CADA.find(x => x[0] === c) || CADA[0])[2]; };
const textoCadaF = c => { const q = cadaP(c); return q ? textoU(q.n, q.u) : (CADA.find(x => x[0] === c) || CADA[0])[1]; };
const catF = id => CAT_FIJO.find(x => x[0] === id) || CAT_FIJO[CAT_FIJO.length - 1];
const catM = id => CAT_MOV.find(x => x[0] === id) || (lista('categorias').find(x => x.id === id) ? [id, lista('categorias').find(x => x.id === id).nombre, 'etiqueta', 6] : CAT_MOV[CAT_MOV.length - 1]);
const ajGastos = () => dato('ajustes', 'gastos') || {};
function avanzar(iso, cada) { const d = deISO(iso) || new Date(); const q = cadaP(cada); if (q) return isoDia(sumarU(d, q.n, q.u)); d.setMonth(d.getMonth() + mesesDe(cada)); return isoDia(d); }
function primerCobro(dia) { const h = new Date(); let d = new Date(h.getFullYear(), h.getMonth(), Math.min(28, dia || 1)); if (d < new Date(h.getFullYear(), h.getMonth(), h.getDate())) d.setMonth(d.getMonth() + 1); return isoDia(d); }

P.gastos = {
  raiz: true, clase: 'con-barra',
  html: p => {
    const cuentasOn = ajGastos().cuentas;
    p.modo = cuentasOn ? (p.modo || 'fijos') : 'fijos';
    let h = '<div data-r="banda">' + banda() + '</div>' + head('Gastos', p.modo === 'fijos' ? 'Gastos fijos de casa' : 'Cuentas compartidas', p.modo === 'fijos' ? '<button class="mini" data-a="ir" data-id="resumenFijos">Resumen</button>' : '');
    if (cuentasOn) h += '<div class="seg"><button class="' + (p.modo === 'fijos' ? 'on' : '') + '" data-a="pSet" data-k="modo" data-v="fijos">Gastos fijos</button><button class="' + (p.modo === 'cuentas' ? 'on' : '') + '" data-a="pSet" data-k="modo" data-v="cuentas">Cuentas</button></div>';
    if (p.modo === 'cuentas') return h + htmlCuentas();
    const l = lista('fijos').sort((a, b) => (a.proximo || '').localeCompare(b.proximo || ''));
    if (!l.length) return h + vacio('sin-gastos', 'Sin gastos fijos', 'Añade la luz, internet o el alquiler y Ronda te recuerda cuándo toca.') + (cuentasOn ? '' : '<button class="row card" data-a="ir" data-id="activarCuentas" style="margin-top:20px">' + sq('dividir-cuentas', 4) + '<div class="f"><b>Cuentas compartidas</b><small>Para viajes y cenas: quién ha pagado y quién debe</small></div>' + chev + '</button>');
    const mes = l.reduce((a, x) => a + (Number(x.importe) || 0) / mesesDe(x.cada), 0);
    h += '<div class="card bal" style="margin:6px 0 4px"><p class="eye">Al mes, de media</p><div class="big2"><b>' + euros(mes) + '</b></div><div class="legend" style="margin:6px 0 0">' + personas().map(x => '<span>' + dot(x.color, 10) + ' ' + esc(x.nombre) + ' ' + euros(l.reduce((a, f) => a + (f.quien === x.id ? Number(f.importe) || 0 : f.quien === 'mitad' ? (Number(f.importe) || 0) / personas().length : 0) / mesesDe(f.cada), 0)) + '</span>').join('') + '</div></div>';
    h += '<h3>Próximos</h3><div class="list">' + l.map(x => {
      const c = catF(x.categoria), atras = x.proximo && x.proximo < hoyISO();
      return '<button class="row card" data-a="ir" data-id="fijoVer" data-fid="' + x.id + '">' + emo(x.emoji, sq(c[0], c[2]), 44) + '<div class="f"><b>' + esc(x.nombre) + '</b><small' + (atras ? ' style="color:#C8402B"' : '') + '>' + (x.proximo ? cuando(x.proximo) : 'Sin fecha') + ' · ' + (x.quien === 'mitad' ? 'a medias' : esc(nombreDe(x.quien))) + '</small></div><b style="flex:none">' + euros(x.importe) + '</b></button>';
    }).join('') + '</div>';
    if (!cuentasOn) h += '<button class="row card" data-a="ir" data-id="activarCuentas" style="margin-top:14px">' + sq('dividir-cuentas', 4) + '<div class="f"><b>Cuentas compartidas</b><small>Activar para viajes y cenas</small></div>' + chev + '</button>';
    return h;
  },
  fijo: p => '<button class="fab" data-a="nuevoGasto" aria-label="Añadir">' + ic('anadir', 28) + '</button>'
};
ACC.nuevoGasto = () => { const p = Nav.actual().params; if (p.modo === 'cuentas') Nav.ir('cuentaEditar', {}); else Nav.ir('fijo', { categoria: 'luz', cada: 'mes', quien: 'mitad', dia: 1 }); };

/* 41 · Nuevo gasto fijo */
P.fijo = {
  clase: 'con-boton', fija: true,
  html: p => tope(p.id ? 'Cambiar gasto fijo' : 'Nuevo gasto fijo') +
    filaNombreEmoji('fEmo', pv(p, 'fEmo', p.emoji), fldTxt('fNom', 'Qué es', pv(p, 'fNom', p.nombre), 'Luz, internet, alquiler…', 'maxlength="60"')) +
    '<div style="display:flex;gap:10px">' + fldTxt('fImp', 'Importe (€)', pv(p, 'fImp', p.importe ? String(p.importe).replace('.', ',') : ''), '0,00', 'inputmode="decimal"') + '<label class="fld" style="flex:1"><small>Próximo cobro</small><input type="date" id="fPro" value="' + esc(pv(p, 'fPro', p.proximo || primerCobro(1))) + '"></label></div>' +
    '<p class="lab2">Cada cuánto</p><div class="chips">' + CADA.map(c => '<button class="chip' + (p.cada === c[0] ? ' on' : '') + '" data-a="pSet" data-k="cada" data-v="' + c[0] + '">' + c[1] + '</button>').join('') + '<button class="chip' + (cadaP(p.cada) || p.cada === 'p' ? ' on' : '') + '" data-a="fCadaP">Personalizado</button></div>' +
    (cadaP(p.cada) || p.cada === 'p' ? bloqueFrecuencia(p, pv(p, 'fPro', p.proximo || primerCobro(1))) : '') +
    '<p class="lab2">Categoría</p><div class="chips">' + CAT_FIJO.map(c => '<button class="chip' + (p.categoria === c[0] ? ' on' : '') + '" data-a="pSet" data-k="categoria" data-v="' + c[0] + '">' + c[1] + '</button>').join('') + '</div>' +
    '<p class="lab2">Quién lo paga</p><div class="chips"><button class="chip' + (p.quien === 'mitad' ? ' on' : '') + '" data-a="pSet" data-k="quien" data-v="mitad">A medias</button>' + personas().map(x => '<button class="chip' + (p.quien === x.id ? ' on' : '') + '" data-a="pSet" data-k="quien" data-v="' + x.id + '">' + esc(x.nombre) + '</button>').join('') + '</div>' +
    '<div class="list" style="margin-top:14px">' + filaCal(!!p.cal, 'pTog" data-k="cal') + (p.cal ? filaAviso(p.aviso, 'fAviso') : '') + '</div>' +
    (p.id ? '<button class="btn sec peligro" data-a="borrarFijo" data-id="' + esc(p.id) + '" style="margin-top:14px">Borrar gasto fijo</button>' : ''),
  fijo: () => '<div class="btns">' + btn('Guardar', 'guardarFijo') + '</div>'
};
ACC.fCadaP = () => { const e = Nav.actual(); guardarCampos(e); const q = cadaP(e.params.cada); e.params.fqN = e.params.fqN || (q ? q.n : 1); e.params.fqU = e.params.fqU || (q ? q.u : 'm'); e.params.cada = 'p'; Nav.refrescar(true); };
ACC.fAviso = () => { const e = Nav.actual(); guardarCampos(e); hojaOpciones('Aviso', AVISOS, e.params.aviso, v => { e.params.aviso = v; Nav.refrescar(true); }); };
ACC.guardarFijo = () => {
  const e = Nav.actual(); guardarCampos(e); const p = e.params;
  const nombre = cap(val('fNom')), importe = numero(val('fImp')), proximo = val('fPro');
  if (!nombre) return toast('Escribe qué gasto es.');
  const id = p.id || 'f' + uid();
  if (p.cada === 'p' || cadaP(p.cada)) p.cada = 'p:' + (Number(p.fqN) || 1) + ':' + (p.fqU || 'm');
  cambiar('fijos', id, { nombre: nombre, emoji: primerEmoji(val('fEmo')), importe: importe, proximo: proximo, cada: p.cada, categoria: p.categoria, quien: p.quien, cal: !!p.cal, aviso: p.cal ? (p.aviso === undefined ? '1440' : p.aviso) : '', pagos: p.pagos || [] });
  if (p.cal || p.evId) marcarCal('fijos', id);
  Nav.atras(); toast('Gasto fijo guardado');
};
ACC.borrarFijo = async el => {
  const x = dato('fijos', el.dataset.id);
  if (!await preguntar('¿Borrar «' + x.nombre + '»?', 'Se borra también su historial de pagos.', 'Borrar', true)) return;
  cambiar('fijos', x.id, { _b: 1 }); if (x.evId) marcarCal('fijos', x.id);
  Nav.atras(Nav.actual().id === 'fijo' ? 2 : 1); toast('Borrado', 'Deshacer', () => { cambiar('fijos', x.id, { _b: 0 }); Nav.refrescar(); });
};

/* 42 · Detalle de gasto fijo */
P.fijoVer = {
  clase: 'con-boton',
  html: p => {
    const x = dato('fijos', p.fid); if (!x) return tope('') + '<p class="mu">Ya no existe.</p>';
    const c = catF(x.categoria);
    return tope(x.nombre, '<button class="rt" data-a="editarFijo" data-id="' + x.id + '" style="border:0;background:none">' + ic('editar', 24) + '</button>') +
      '<div class="card" style="padding:18px;text-align:center">' + sq(c[0], c[2], false) + '<div class="amount" style="font-size:44px;margin:10px 0 2px">' + euros(x.importe) + '</div><p class="cap" style="margin:0">' + (CADA.find(y => y[0] === x.cada) || CADA[0])[1] + ' · ' + (x.quien === 'mitad' ? 'a medias' : 'paga ' + esc(nombreDe(x.quien))) + '</p></div>' +
      '<div class="card" style="padding:4px 16px;margin-top:14px"><div class="kv"><small>Próximo cobro</small><b>' + cuando(x.proximo) + '</b></div><div class="kv"><small>Categoría</small><b>' + c[1] + '</b></div><div class="kv"><small>Calendario</small><b>' + (x.cal ? textoAviso(x.aviso) : 'No') + '</b></div></div>' +
      '<h3>Pagos</h3>' + ((x.pagos || []).length ? '<div class="card grp">' + x.pagos.slice().reverse().slice(0, 24).map(g => '<div class="row"><div class="f"><b>' + fechaCorta(deISO(g.fecha)) + '</b><small>Marcado por ' + esc(nombreDe(g.por)) + '</small></div><b style="flex:none">' + euros(g.importe) + '</b></div>').join('') + '</div>' : '<p class="texto">Todavía no habéis marcado ningún pago.</p>');
  },
  fijo: p => '<div class="btns">' + btn('Marcar como pagado', 'pagarFijo" data-id="' + esc(p.fid)) + '</div>'
};
ACC.editarFijo = el => { const x = dato('fijos', el.dataset.id); Nav.ir('fijo', Object.assign({}, x, { importe: x.importe })); };
ACC.pagarFijo = el => {
  const x = dato('fijos', el.dataset.id); if (!x) return;
  const pagos = (x.pagos || []).concat([{ fecha: x.proximo || hoyISO(), importe: x.importe, por: S.cfg.persona }]).slice(-36);
  const sig = avanzar(x.proximo || hoyISO(), x.cada);
  cambiar('fijos', x.id, { pagos: pagos, proximo: sig });
  if (x.cal) marcarCal('fijos', x.id);
  Nav.refrescar(true); toast('Pagado. Próximo: ' + cuando(sig).toLowerCase());
};

/* 43 · Resumen de gastos fijos */
P.resumenFijos = {
  html: () => {
    const l = lista('fijos');
    const porCat = {};
    l.forEach(x => { porCat[x.categoria] = (porCat[x.categoria] || 0) + (Number(x.importe) || 0) / mesesDe(x.cada); });
    const tot = Object.keys(porCat).reduce((a, k) => a + porCat[k], 0) || 1;
    const meses = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); meses.push(d); }
    const pagadoMes = d => l.reduce((a, x) => a + (x.pagos || []).filter(g => g.fecha && g.fecha.slice(0, 7) === claveMes(d)).reduce((b, g) => b + (Number(g.importe) || 0), 0), 0);
    const maxM = Math.max(1, ...meses.map(pagadoMes));
    return tope('Resumen') + head('Gastos fijos', 'Media al mes: ' + euros(tot === 1 && !l.length ? 0 : tot)) +
      '<h3>Por categoría</h3><div class="card" style="padding:14px 16px">' + Object.keys(porCat).sort((a, b) => porCat[b] - porCat[a]).map(k => { const c = catF(k); return '<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-weight:700;font-size:14.5px"><span>' + c[1] + '</span><span>' + euros(porCat[k]) + '</span></div><div class="barra"><i style="width:' + Math.round(porCat[k] / tot * 100) + '%;background:' + COL[c[2]] + '"></i></div></div>'; }).join('') + '</div>' +
      '<h3>Pagado los últimos meses</h3><div class="card barras">' + meses.map(d => { const v = pagadoMes(d); return '<div><i style="height:' + Math.round(v / maxM * 100) + '%"></i><small>' + MESES[d.getMonth()].slice(0, 3) + '</small><b>' + Math.round(v) + '</b></div>'; }).join('') + '</div>';
  }
};

/* 49h · Activar cuentas compartidas */
P.activarCuentas = {
  clase: 'con-boton',
  html: () => tope('Cuentas compartidas') + '<div class="ill big">' + ilu('primer-gasto-compartido') + '</div><h2 class="lg">Cuentas a medias</h2><p class="mu">Para un viaje, una cena con amigos o el piso: cada uno apunta lo que paga y Ronda dice quién debe a quién. Pueden entrar personas que no usan Ronda.</p>',
  fijo: () => '<div class="btns">' + btn('Activar', 'activarCuentasYa') + btn('Ahora no', 'atras', 'sec') + '</div>'
};
ACC.activarCuentasYa = () => { cambiar('ajustes', 'gastos', { cuentas: true }); Nav.atras(); const p = Nav.actual().params; p.modo = 'cuentas'; Nav.refrescar(true); };

/* ---------- Cuentas compartidas ---------- */
function saldosDe(cuentaId) {
  const c = dato('cuentas', cuentaId); if (!c) return {};
  const s = {}; (c.participantes || []).forEach(x => { s[x.id] = 0; });
  lista('movs').filter(m => m.cuenta === cuentaId).forEach(m => {
    const imp = Number(m.importe) || 0;
    if (m.tipo === 'transferencia') { s[m.pagadoPor] = (s[m.pagadoPor] || 0) + imp; s[m.para] = (s[m.para] || 0) - imp; return; }
    s[m.pagadoPor] = (s[m.pagadoPor] || 0) + imp;
    const r = m.reparto || {}, qs = (r.quienes && r.quienes.length) ? r.quienes : (c.participantes || []).map(x => x.id);
    if (r.modo === 'partes') { const tot = qs.reduce((a, q) => a + (Number((r.partes || {})[q]) || 1), 0); qs.forEach(q => { s[q] = (s[q] || 0) - imp * (Number((r.partes || {})[q]) || 1) / tot; }); }
    else if (r.modo === 'importes') qs.forEach(q => { s[q] = (s[q] || 0) - (Number((r.importes || {})[q]) || 0); });
    else qs.forEach(q => { s[q] = (s[q] || 0) - imp / qs.length; });
  });
  /* prueba 0.1.0: con 1e-6 para que 93,355 redondee a 93,36 (con coma flotante salía 93,35) */
  Object.keys(s).forEach(k => { s[k] = Math.round(s[k] * 100 + (s[k] >= 0 ? 1e-6 : -1e-6)) / 100; });
  return s;
}
function reembolsos(s) {
  const d = Object.keys(s).filter(k => s[k] < -0.004).map(k => [k, -s[k]]).sort((a, b) => b[1] - a[1]);
  const c = Object.keys(s).filter(k => s[k] > 0.004).map(k => [k, s[k]]).sort((a, b) => b[1] - a[1]);
  const out = [];
  let i = 0, j = 0;
  while (i < d.length && j < c.length) { const x = Math.min(d[i][1], c[j][1]); out.push({ de: d[i][0], a: c[j][0], importe: Math.round(x * 100) / 100 }); d[i][1] -= x; c[j][1] -= x; if (d[i][1] < 0.005) i++; if (c[j][1] < 0.005) j++; }
  return out;
}
const partNombre = (c, id) => ((c.participantes || []).find(x => x.id === id) || {}).nombre || '?';
const partColor = (c, id, i) => { const x = (c.participantes || []).find(y => y.id === id) || {}; return x.persona ? colorDe(x.persona) : COL[(i || 0) % 8]; };
function htmlCuentas() {
  const l = lista('cuentas').filter(c => !c.archivada).sort((a, b) => (b.creada || 0) - (a.creada || 0));
  if (!l.length) return vacio('primer-gasto-compartido', 'Sin cuentas', 'Crea una para un viaje o una cena con el botón +.');
  return '<div class="list" style="margin-top:6px">' + l.map(c => {
    const tot = lista('movs').filter(m => m.cuenta === c.id && m.tipo !== 'transferencia').reduce((a, m) => a + (Number(m.importe) || 0), 0);
    const s = saldosDe(c.id), mio = (c.participantes || []).find(x => x.persona === S.cfg.persona);
    const sm = mio ? s[mio.id] || 0 : 0;
    return '<button class="row card" data-a="ir" data-id="cuenta" data-cid="' + c.id + '">' + sq('dividir-cuentas', COL.indexOf(c.color) >= 0 ? COL.indexOf(c.color) : 4) + '<div class="f"><b>' + esc(c.nombre) + '</b><small>' + (c.participantes || []).length + ' personas · total ' + euros(tot) + '</small></div><small style="font-weight:800;color:' + (sm < -0.004 ? '#C8402B' : sm > 0.004 ? '#2E8B57' : 'var(--mu)') + '">' + (mio ? (sm > 0.004 ? 'Te deben ' + euros(sm) : sm < -0.004 ? 'Debes ' + euros(-sm) : 'Al día') : '') + '</small></button>';
  }).join('') + '</div>';
}

/* 45-47 · Cuenta: Gastos · Saldos · Fotos */
P.cuenta = {
  clase: 'con-barra',
  html: p => {
    const c = dato('cuentas', p.cid); if (!c) return tope('') + '<p class="mu">Esta cuenta ya no existe.</p>';
    p.tab = p.tab || 'gastos';
    const movs = lista('movs').filter(m => m.cuenta === c.id).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.creado || 0) - (a.creado || 0));
    const tot = movs.filter(m => m.tipo !== 'transferencia').reduce((a, m) => a + (Number(m.importe) || 0), 0);
    try { localStorage.setItem('rondaP-ultcuenta', c.id); } catch (e) { }
    let h = '<div class="top"><button class="bk bkt" data-a="atras" aria-label="Cuentas">' + ic('atras', 26) + '<small>Cuentas</small></button><b>' + (c.emoji ? esc(c.emoji) + ' ' : '') + esc(c.nombre) + '</b><span class="rt"><button class="rt" data-a="menuCuenta" data-id="' + c.id + '" style="border:0;background:none">' + ic('menu', 24) + '</button></span></div>' +
      '<div class="seg">' + [['gastos', 'Gastos'], ['saldos', 'Saldos'], ['fotos', 'Fotos']].map(t => '<button class="' + (p.tab === t[0] ? 'on' : '') + '" data-a="pSet" data-k="tab" data-v="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
    if (p.tab === 'gastos') {
      h += '<div class="card" style="padding:14px 16px;margin:6px 0 4px;display:flex;justify-content:space-between"><div><p class="eye">Total</p><b style="font-size:24px;font-weight:800">' + euros(tot) + '</b></div><div style="text-align:right"><p class="eye">Gastos</p><b style="font-size:24px;font-weight:800">' + movs.filter(m => m.tipo !== 'transferencia').length + '</b></div></div>';
      if (!movs.length) return h + vacio('sin-gastos', 'Sin gastos', 'Añade el primero con el botón +.');
      let dia = '';
      h += movs.map(m => {
        let sep = ''; if (m.fecha !== dia) { dia = m.fecha; sep = '<h3>' + cuando(m.fecha).replace(/^Atrasada · /, '') + '</h3>'; }
        const k = catM(m.categoria);
        return sep + '<button class="row card" data-a="verMov" data-id="' + m.id + '" style="margin-bottom:8px">' + (m.tipo === 'transferencia' ? sq('dividir-cuentas', 3) : sq(k[2], k[3])) + '<div class="f"><b>' + esc(m.tipo === 'transferencia' ? partNombre(c, m.pagadoPor) + ' → ' + partNombre(c, m.para) : m.concepto) + '</b><small>' + (m.tipo === 'transferencia' ? 'Transferencia' : 'Pagó ' + esc(partNombre(c, m.pagadoPor))) + (m.foto ? ' · con foto' : '') + (m.tarjeta ? ' · ' + ic('tarjeta', 14, 7) + ' ' + esc(m.tarjetaNom || 'tarjeta') : '') + '</small></div><b style="flex:none">' + euros(m.importe) + '</b></button>';
      }).join('');
    } else if (p.tab === 'saldos') {
      const s = saldosDe(c.id), max = Math.max(1, ...Object.keys(s).map(k => Math.abs(s[k])));
      h += '<div class="card" style="padding:14px 16px;margin-top:6px">' + (c.participantes || []).map((x, i) => { const v = s[x.id] || 0; return '<div class="saldo"><b>' + esc(x.nombre) + '</b><div class="sb2"><i style="' + (v >= 0 ? 'left:50%' : 'right:50%') + ';width:' + Math.round(Math.abs(v) / max * 50) + '%;background:' + (v >= 0 ? '#2E8B57' : '#C8402B') + '"></i></div><small style="color:' + (v > 0.004 ? '#2E8B57' : v < -0.004 ? '#C8402B' : 'var(--mu)') + '">' + (v > 0 ? '+' : '') + euros(v) + '</small></div>'; }).join('') + '</div>';
      const rs = reembolsos(s);
      h += '<h3>Para quedar en paz</h3>' + (rs.length ? '<div class="list">' + rs.map(r => '<div class="row card"><div class="f"><b>' + esc(partNombre(c, r.de)) + ' paga a ' + esc(partNombre(c, r.a)) + '</b><small>' + euros(r.importe) + '</small></div><button class="mini" data-a="liquidar" data-de="' + r.de + '" data-para="' + r.a + '" data-imp="' + r.importe + '">Hecho</button></div>').join('') + '</div>' : '<p class="texto">Estáis en paz.</p>');
      h += '<button class="btn sec" data-a="ir" data-id="estadisticas" data-cid="' + c.id + '" style="margin-top:16px">Ver estadísticas</button>';
    } else {
      const fotos = movs.filter(m => m.foto);
      h += fotos.length ? '<div class="fotos">' + fotos.map(m => { const img = imagen(m.foto); return '<button data-a="verMov" data-id="' + m.id + '" style="' + (img ? 'background-image:url(\'' + img + '\')' : '') + '"><span>' + esc(m.concepto) + '</span></button>'; }).join('') + '</div>' : '<p class="texto" style="margin-top:12px">Las fotos de los tickets que añadáis a los gastos salen aquí.</p>';
    }
    return h;
  },
  fijo: p => '<div class="btns" style="flex-direction:row"><button class="btn sec" data-a="nuevaTransf" style="flex:1">Transferencia</button><button class="btn pri" data-a="nuevoMov" style="flex:1.4">' + ic('anadir', 22) + 'Gasto</button></div>'
};
ACC.menuCuenta = el => abrirHoja('<h3>' + esc(dato('cuentas', el.dataset.id).nombre) + '</h3><div class="list"><button class="row card" data-a="editarCuenta" data-id="' + el.dataset.id + '">' + ic('editar', 24) + '<b>Cambiar nombre, emoji y personas</b></button><button class="row card" data-a="estadCuenta" data-id="' + el.dataset.id + '">' + ic('grafico-circular', 24, 4) + '<b>Estadísticas</b></button><button class="row card" data-a="ir" data-id="categorias">' + ic('etiqueta', 24, 6) + '<b>Categorías</b></button><button class="row card" data-a="archivarCuenta" data-id="' + el.dataset.id + '">' + ic('archivar', 24, 5) + '<b>Archivar</b></button><button class="row card" data-a="borrarCuenta" data-id="' + el.dataset.id + '">' + ic('borrar', 24, 0) + '<b>Borrar cuenta</b></button></div>');
ACC.editarCuenta = el => { cerrarHoja(); const c = dato('cuentas', el.dataset.id); Nav.ir('cuentaEditar', { id: c.id, nombre: c.nombre, emoji: c.emoji || '', creada: c.creada, color: c.color, participantes: JSON.parse(JSON.stringify(c.participantes || [])) }); };
ACC.estadCuenta = el => { cerrarHoja(); Nav.ir('estadisticas', { cid: el.dataset.id }); };
ACC.archivarCuenta = el => { cerrarHoja(); const id = el.dataset.id; cambiar('cuentas', id, { archivada: true }); if (Nav.actual().id === 'cuenta') Nav.atras(); else Nav.refrescar(true); toast('Cuenta archivada', 'Deshacer', () => { cambiar('cuentas', id, { archivada: false }); Nav.refrescar(); }); };
ACC.borrarCuenta = async el => { cerrarHoja(); const c = dato('cuentas', el.dataset.id); if (!await preguntar('¿Borrar «' + c.nombre + '»?', 'Se borran también sus gastos.', 'Borrar', true)) return; lista('movs').filter(m => m.cuenta === c.id).forEach(m => cambiar('movs', m.id, { _b: 1 })); cambiar('cuentas', c.id, { _b: 1 }); Nav.atras(); toast('Cuenta borrada'); };
ACC.liquidar = el => { const p = Nav.actual().params; cambiar('movs', 'm' + uid(), { cuenta: p.cid, tipo: 'transferencia', pagadoPor: el.dataset.de, para: el.dataset.para, importe: Number(el.dataset.imp), fecha: hoyISO(), creado: Date.now(), por: S.cfg.persona }); Nav.refrescar(true); toast('Apuntado como pagado'); };
ACC.nuevoMov = () => { const c = dato('cuentas', Nav.actual().params.cid); const yoP = (c.participantes || []).find(x => x.persona === S.cfg.persona); Nav.ir('mov', { cid: c.id, pagadoPor: yoP ? yoP.id : (c.participantes[0] || {}).id, categoria: 'otro', modo: 'iguales', quienes: (c.participantes || []).map(x => x.id), fecha: hoyISO() }); };
ACC.nuevaTransf = () => { const c = dato('cuentas', Nav.actual().params.cid); Nav.ir('transf', { cid: c.id, de: (c.participantes[0] || {}).id, para: (c.participantes[1] || {}).id }); };
ACC.verMov = el => { const m = dato('movs', el.dataset.id); if (m.tipo === 'transferencia') Nav.ir('transf', Object.assign({}, m, { cid: m.cuenta, de: m.pagadoPor })); else Nav.ir('mov', Object.assign({}, m, { cid: m.cuenta, modo: (m.reparto || {}).modo || 'iguales', quienes: (m.reparto || {}).quienes || [], partes: (m.reparto || {}).partes || {}, importes: (m.reparto || {}).importes || {} })); };

/* 48-49 · Nuevo gasto (y dividir) */
P.mov = {
  clase: 'con-boton', fija: true,
  html: p => {
    const c = dato('cuentas', p.cid) || { participantes: [] };
    const imp = numero(pv(p, 'mImp', p.importe ? String(p.importe).replace('.', ',') : ''));
    let h = tope(p.id ? 'Cambiar gasto' : 'Nuevo gasto') + '<div class="amount"><input id="mImp" inputmode="decimal" placeholder="0,00" value="' + esc(pv(p, 'mImp', p.importe ? String(p.importe).replace('.', ',') : '')) + '" style="width:70%;text-align:center;border:0;background:none;font:inherit;color:inherit;outline:0"><small> €</small></div>' +
      fldTxt('mCon', 'Concepto', pv(p, 'mCon', p.concepto), 'Cena, gasolina, entradas…', 'maxlength="80"') +
      '<label class="fld"><small>Fecha</small><input type="date" id="mFec" value="' + esc(pv(p, 'mFec', p.fecha)) + '"></label>' +
      '<p class="lab2">Pagado por</p><div class="chips">' + c.participantes.map((x, i) => '<button class="chip' + (p.pagadoPor === x.id ? ' on' : '') + '" data-a="pSet" data-k="pagadoPor" data-v="' + x.id + '">' + esc(x.nombre) + '</button>').join('') + '</div>' +
      '<p class="lab2">Categoría</p><div class="chips">' + CAT_MOV.concat(lista('categorias').map(x => [x.id, x.nombre])).map(k => '<button class="chip' + (p.categoria === k[0] ? ' on' : '') + '" data-a="pSet" data-k="categoria" data-v="' + k[0] + '">' + esc(k[1]) + '</button>').join('') + '</div>' +
      '<p class="lab2">Para quién</p><div class="seg">' + [['iguales', 'A partes iguales'], ['partes', 'Por partes'], ['importes', 'Por importes']].map(m => '<button class="' + (p.modo === m[0] ? 'on' : '') + '" data-a="pSet" data-k="modo" data-v="' + m[0] + '">' + m[1] + '</button>').join('') + '</div><div class="card grp" style="margin-top:8px">';
    const qs = p.quienes || [];
    const tot = qs.reduce((a, q) => a + (Number((p.partes || {})[q]) || 1), 0) || 1;
    h += c.participantes.map((x, i) => {
      const on = qs.indexOf(x.id) >= 0;
      let der = '';
      if (on && p.modo === 'iguales') der = '<small class="mq" data-q="' + x.id + '" style="font-weight:800">' + euros(imp / qs.length) + '</small>';
      if (on && p.modo === 'partes') der = '<div class="pm"><button data-a="mParte" data-q="' + x.id + '" data-v="-1">−</button><b>' + ((p.partes || {})[x.id] || 1) + '</b><button data-a="mParte" data-q="' + x.id + '" data-v="1">+</button></div><small class="mq" data-q="' + x.id + '" style="font-weight:800;min-width:64px;text-align:right">' + euros(imp * ((p.partes || {})[x.id] || 1) / tot) + '</small>';
      if (on && p.modo === 'importes') der = '<input class="impq" data-q="' + x.id + '" inputmode="decimal" placeholder="0,00" value="' + esc((p.importes || {})[x.id] !== undefined ? String(p.importes[x.id]).replace('.', ',') : '') + '">';
      return '<div class="row"><button class="ck' + (on ? ' on' : '') + '" data-a="mQuien" data-q="' + x.id + '" style="' + (on ? 'background:' + partColor(c, x.id, i) + ';border-color:transparent' : '') + '">' + tick(16) + '</button><b style="flex:1">' + esc(x.nombre) + '</b>' + der + '</div>';
    }).join('') + '</div>';
    if (p.modo === 'importes') { const suma = Object.keys(p.importes || {}).filter(q => qs.indexOf(q) >= 0).reduce((a, q) => a + (Number(p.importes[q]) || 0), 0); h += '<p class="cap repcap" style="text-align:left;color:' + (Math.abs(suma - imp) < 0.01 ? 'var(--mu)' : '#C8402B') + '">Repartido ' + euros(suma) + ' de ' + euros(imp) + '</p>'; }
    h += '<div class="list" style="margin-top:14px"><label class="row card">' + sq('camara', 0) + '<div class="f"><b>' + (p.foto ? 'Cambiar foto del ticket' : 'Foto del ticket') + '</b><small>' + (p.foto ? 'Guardada' : p.subiendo ? 'Subiendo…' : 'Opcional') + '</small></div><input type="file" accept="image/*" class="arch" data-r="mFoto"></label></div>' +
      (p.id ? '<button class="btn sec peligro" data-a="borrarMov" data-id="' + esc(p.id) + '" style="margin-top:12px">Borrar gasto</button>' : '');
    return h;
  },
  montar(el, p) { P.mov.tras(el, p); },
  tras(el, p) {
    $$('.impq', el).forEach(i => i.addEventListener('change', () => { p.importes = p.importes || {}; p.importes[i.dataset.q] = numero(i.value); repintar(); }));
    /* 1.4.0: al escribir el importe, el reparto se recalcula al momento. */
    const mi = $('#mImp', el);
    if (mi) mi.addEventListener('input', () => {
      p._mImp = mi.value; const imp = numero(mi.value), qs = p.quienes || [];
      const tot = qs.reduce((a, q) => a + (Number((p.partes || {})[q]) || 1), 0) || 1;
      $$('.mq', el).forEach(s => { const q = s.dataset.q; s.textContent = euros(p.modo === 'partes' ? imp * ((p.partes || {})[q] || 1) / tot : imp / Math.max(1, qs.length)); });
      const cap2 = $('.repcap', el); if (cap2) { const suma = qs.reduce((a, q) => a + (Number((p.importes || {})[q]) || 0), 0); cap2.textContent = 'Repartido ' + euros(suma) + ' de ' + euros(imp); cap2.style.color = Math.abs(suma - imp) < 0.01 ? 'var(--mu)' : '#C8402B'; }
    });
    const f = $('[data-r="mFoto"]', el);
    if (f) f.addEventListener('change', async () => {
      if (!f.files[0]) return;
      p.subiendo = true; repintar();
      try { const b = await reducir(f.files[0], 1600, 0.82); const r = await subirArchivo(b, 'ticket.jpg'); p.foto = r.fid; } catch (e) { toast('No he podido subir la foto: ' + e.message); }
      p.subiendo = false; if (Nav.actual().params === p) repintar();
    });
  },
  fijo: () => '<div class="btns">' + btn('Guardar', 'guardarMov') + '</div>'
};
ACC.mQuien = el => { const p = Nav.actual().params; p.quienes = p.quienes || []; const i = p.quienes.indexOf(el.dataset.q); if (i >= 0) p.quienes.splice(i, 1); else p.quienes.push(el.dataset.q); repintar(); };
ACC.mParte = el => { const p = Nav.actual().params; p.partes = p.partes || {}; p.partes[el.dataset.q] = Math.max(1, Math.min(20, (p.partes[el.dataset.q] || 1) + Number(el.dataset.v))); repintar(); };
ACC.guardarMov = () => {
  const e = Nav.actual(); guardarCampos(e); const p = e.params;
  $$('.impq', e.el).forEach(i => { p.importes = p.importes || {}; p.importes[i.dataset.q] = numero(i.value); });
  const imp = numero(val('mImp')), con = cap(val('mCon'));
  if (!imp) return toast('Escribe el importe.');
  if (!con) return toast('Escribe el concepto.');
  if (!(p.quienes || []).length) return toast('Elige para quién es el gasto.');
  if (p.subiendo) return toast('Espera a que se suba la foto.');
  if (p.modo === 'importes') { const s = p.quienes.reduce((a, q) => a + (Number((p.importes || {})[q]) || 0), 0); if (Math.abs(s - imp) > 0.01) return toast('Los importes suman ' + euros(s) + ' y el gasto es de ' + euros(imp) + '.'); }
  const id = p.id || 'm' + uid();
  cambiar('movs', id, { cuenta: p.cid, tipo: 'gasto', importe: imp, concepto: con, fecha: val('mFec') || hoyISO(), pagadoPor: p.pagadoPor, categoria: p.categoria, reparto: { modo: p.modo, quienes: p.quienes, partes: p.partes || {}, importes: p.importes || {} }, foto: p.foto || '', creado: p.creado || Date.now(), por: S.cfg.persona });
  Nav.atras(); toast('Gasto guardado');
};
ACC.borrarMov = el => { const id = el.dataset.id; cambiar('movs', id, { _b: 1 }); Nav.atras(); toast('Gasto borrado', 'Deshacer', () => { cambiar('movs', id, { _b: 0 }); Nav.refrescar(); }); };

/* 49b · Transferencia */
P.transf = {
  clase: 'con-boton', fija: true,
  html: p => {
    const c = dato('cuentas', p.cid) || { participantes: [] };
    const fila = (k, t) => '<p class="lab2">' + t + '</p><div class="chips">' + c.participantes.map(x => '<button class="chip' + (p[k] === x.id ? ' on' : '') + '" data-a="pSet" data-k="' + k + '" data-v="' + x.id + '">' + esc(x.nombre) + '</button>').join('') + '</div>';
    return tope(p.id ? 'Transferencia' : 'Nueva transferencia') + '<div class="amount"><input id="tImp" inputmode="decimal" placeholder="0,00" value="' + esc(pv(p, 'tImp', p.importe ? String(p.importe).replace('.', ',') : '')) + '" style="width:70%;text-align:center;border:0;background:none;font:inherit;color:inherit;outline:0"><small> €</small></div>' +
      fila('de', 'De') + fila('para', 'Para') + '<label class="fld" style="margin-top:14px"><small>Fecha</small><input type="date" id="tFe" value="' + esc(pv(p, 'tFe', p.fecha || hoyISO())) + '"></label>' +
      (p.id ? '<button class="btn sec peligro" data-a="borrarMov" data-id="' + esc(p.id) + '" style="margin-top:12px">Borrar transferencia</button>' : '');
  },
  fijo: () => '<div class="btns">' + btn('Guardar', 'guardarTransf') + '</div>'
};
ACC.guardarTransf = () => {
  const e = Nav.actual(); guardarCampos(e); const p = e.params, imp = numero(val('tImp'));
  if (!imp) return toast('Escribe el importe.');
  if (!p.de || !p.para || p.de === p.para) return toast('Elige quién paga y a quién.');
  cambiar('movs', p.id || 'm' + uid(), { cuenta: p.cid, tipo: 'transferencia', pagadoPor: p.de, para: p.para, importe: imp, fecha: val('tFe') || hoyISO(), creado: p.creado || Date.now(), por: S.cfg.persona });
  Nav.atras(); toast('Transferencia guardada');
};

/* 49g · Crear o cambiar cuenta */
P.cuentaEditar = {
  clase: 'con-boton', fija: true,
  html: p => {
    if (!p.participantes) p.participantes = personas().map(x => ({ id: 'q' + x.id, nombre: x.nombre, persona: x.id }));
    p.color = p.color || COL[4];
    return tope(p.id ? 'Cambiar cuenta' : 'Nueva cuenta') + filaNombreEmoji('cEmo', pv(p, 'cEmo', p.emoji), fldTxt('cNom', 'Nombre', pv(p, 'cNom', p.nombre), 'Escapada a Madrid, el piso…', 'maxlength="50"')) +
      '<p class="lab2">Color</p><div class="cols">' + COL.map(c => '<button class="cdot' + (p.color === c ? ' on' : '') + '" style="background:' + c + '" data-a="pSet" data-k="color" data-v="' + c + '"></button>').join('') + '</div>' +
      '<p class="lab2">Personas</p><div class="card grp">' + p.participantes.map((x, i) => '<div class="row">' + dot(x.persona ? colorDe(x.persona) : COL[i % 8], 14) + '<b style="flex:1">' + esc(x.nombre) + (x.persona ? ' <small style="color:var(--mu);font-weight:700">· en Ronda</small>' : '') + '</b>' + (x.persona === S.cfg.persona ? '' : '<button class="mini" data-a="quitarPart" data-i="' + i + '">Quitar</button>') + '</div>').join('') + '</div>' +
      '<div class="fld fldr" style="margin-top:10px"><div class="f"><small>Añadir a alguien que no usa Ronda</small><input id="cOtro" placeholder="Nombre" maxlength="30"></div><button class="mini" data-a="anadirPart">Añadir</button></div>';
  },
  fijo: () => '<div class="btns">' + btn('Guardar', 'guardarCuenta') + '</div>'
};
ACC.anadirPart = () => { const e = Nav.actual(); guardarCampos(e); const n = cap(val('cOtro')); if (!n) return; e.params.participantes.push({ id: 'q' + uid(), nombre: n }); e.params._cOtro = ''; Nav.refrescar(true); };
ACC.quitarPart = el => { const e = Nav.actual(); guardarCampos(e); const x = e.params.participantes[+el.dataset.i]; if (e.params.id && lista('movs').some(m => m.cuenta === e.params.id && (m.pagadoPor === x.id || m.para === x.id || ((m.reparto || {}).quienes || []).indexOf(x.id) >= 0))) return toast('No se puede quitar: tiene gastos en esta cuenta.'); e.params.participantes.splice(+el.dataset.i, 1); Nav.refrescar(true); };
ACC.guardarCuenta = () => {
  const e = Nav.actual(); guardarCampos(e); const p = e.params, n = cap(val('cNom'));
  if (!n) return toast('Ponle un nombre a la cuenta.');
  if (p.participantes.length < 2) return toast('Hacen falta al menos dos personas.');
  const id = p.id || 'k' + uid();
  cambiar('cuentas', id, { nombre: n, emoji: primerEmoji(val('cEmo')), color: p.color, participantes: p.participantes, creada: p.creada || Date.now() });
  Nav.atras();
  if (!p.id) Nav.ir('cuenta', { cid: id });
};

/* 49c · Categorías propias */
P.categorias = {
  html: () => tope('Categorías') + '<div class="card grp">' + CAT_MOV.map(k => '<div class="row">' + sq(k[2], k[3]) + '<b style="flex:1">' + k[1] + '</b></div>').join('') + lista('categorias').map(k => '<div class="row">' + sq('etiqueta', 6) + '<b style="flex:1">' + esc(k.nombre) + '</b><button class="mini" data-a="borrarCat" data-id="' + k.id + '">Quitar</button></div>').join('') + '</div>' +
    '<div class="fld fldr" style="margin-top:12px"><div class="f"><small>Nueva categoría</small><input id="catN" maxlength="30" placeholder="Por ejemplo, Regalos"></div><button class="mini" data-a="nuevaCat">Añadir</button></div>'
};
ACC.nuevaCat = () => { const n = cap(val('catN')); if (!n) return; cambiar('categorias', 'g' + uid(), { nombre: n }); Nav.refrescar(true); };
ACC.borrarCat = el => { cambiar('categorias', el.dataset.id, { _b: 1 }); Nav.refrescar(true); };

/* 49e · Estadísticas */
P.estadisticas = {
  html: p => {
    const c = dato('cuentas', p.cid) || {};
    const movs = lista('movs').filter(m => m.cuenta === p.cid && m.tipo !== 'transferencia');
    const por = {}; movs.forEach(m => { por[m.categoria] = (por[m.categoria] || 0) + (Number(m.importe) || 0); });
    const tot = movs.reduce((a, m) => a + (Number(m.importe) || 0), 0);
    const ks = Object.keys(por).sort((a, b) => por[b] - por[a]);
    let ang = 0;
    const arcos = ks.map(k => { const v = por[k] / (tot || 1); const a0 = ang; ang += v; const k2 = catM(k); return '<circle r="15.9" cx="20" cy="20" fill="none" stroke="' + COL[k2[3]] + '" stroke-width="7" stroke-dasharray="' + (v * 100).toFixed(2) + ' ' + (100 - v * 100).toFixed(2) + '" stroke-dashoffset="' + (25 - a0 * 100).toFixed(2) + '"/>'; }).join('');
    const quien = {}; movs.forEach(m => { quien[m.pagadoPor] = (quien[m.pagadoPor] || 0) + (Number(m.importe) || 0); });
    return tope('Estadísticas') + head(c.nombre || '', 'Total ' + euros(tot)) +
      (tot ? '<div class="dona"><svg viewBox="0 0 40 40">' + arcos + '</svg><div><b>' + euros(tot) + '</b><small>' + movs.length + ' gastos</small></div></div>' : '<p class="texto">Todavía no hay gastos.</p>') +
      '<div class="card grp" style="margin-top:14px">' + ks.map(k => { const k2 = catM(k); return '<div class="row">' + dot(COL[k2[3]], 12) + '<b style="flex:1">' + esc(k2[1]) + '</b><small style="font-weight:800">' + euros(por[k]) + ' · ' + Math.round(por[k] / tot * 100) + ' %</small></div>'; }).join('') + '</div>' +
      '<h3>Quién ha pagado</h3><div class="card grp">' + (c.participantes || []).map(x => '<div class="row"><b style="flex:1">' + esc(x.nombre) + '</b><small style="font-weight:800">' + euros(quien[x.id] || 0) + '</small></div>').join('') + '</div>';
  }
};
