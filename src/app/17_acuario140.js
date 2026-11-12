/* ============================ 1.4.0 · ACUARIO: medidas, gráficas, calendario y fotos ============================
   Medidas: colección «medidas», un registro por día (id mAAAAMMDD) con un campo por parámetro (v_<clave>), así cada
   parámetro se guarda por separado. Fotos: colección «acfotos» (fecha, fid) en la carpeta de Drive, sin cifrar.
   Parámetros: ajustes.acuario.params = [{k, n, u, on}] en el orden elegido. */
const AC_DEF = [['amoniaco', 'Amoníaco', 'ppm'], ['fosfato', 'Fosfato', 'ppm'], ['gh', 'GH', '°dH'], ['hierro', 'Hierro', 'ppm'], ['kh', 'KH', 'dKH'], ['nitrato', 'Nitrato', 'ppm'], ['nitrito', 'Nitrito', 'ppm'], ['ph', 'pH', ''], ['temp', 'Temperatura', '°C']];
function acParams(todos) {
  const g = (dato('ajustes', 'acuario') || {}).params;
  const l = Array.isArray(g) && g.length ? g : AC_DEF.map(x => ({ k: x[0], n: x[1], u: x[2], on: true }));
  return todos ? l : l.filter(x => x.on !== false);
}
const idMedida = iso => 'm' + iso.replace(/-/g, '');
const medidaDe = iso => dato('medidas', idMedida(iso)) || null;
const valorDe = (m, k) => { const v = m && m['v_' + k]; return v === '' || v === undefined || v === null ? null : Number(v); };
const medidasOrden = () => lista('medidas').filter(m => m.fecha && acParams(true).some(p => valorDe(m, p.k) !== null)).sort((a, b) => a.fecha.localeCompare(b.fecha));
const fotosDe = iso => lista('acfotos').filter(f => f.fecha === iso).sort((a, b) => (a.creado || 0) - (b.creado || 0));
const numTxt = v => v === null ? '—' : String(+Number(v).toFixed(3)).replace('.', ',');
const fechaCortaTxt = iso => { const d = deISO(iso); return d ? d.getDate() + ' ' + MESES[d.getMonth()].slice(0, 3) : ''; };

/* Pestañas del acuario: Cuidados (lo de siempre) · Medidas · Calendario */
const _acHtml = P.acuario.html;
P.acuario.html = (p, e) => {
  p.tab = p.tab || 'cuidados';
  const tabs = '<div class="seg" style="margin-bottom:12px">' + [['cuidados', 'Cuidados'], ['medidas', 'Medidas'], ['calendario', 'Calendario']].map(t => '<button class="' + (p.tab === t[0] ? 'on' : '') + '" data-a="pSet" data-k="tab" data-v="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
  if (p.tab === 'medidas') return tope('', '<span style="display:flex;gap:4px"><button class="rt" data-a="ir" data-id="acGraficas" aria-label="Gráficas">' + ic('grafica-linea', 24, 5) + '</button><button class="rt" data-a="ir" data-id="acParams" aria-label="Parámetros">' + ic('ajustes', 24, 5) + '</button></span>') + head('Acuario', '') + tabs + htmlMedidas(p);
  if (p.tab === 'calendario') return tope('') + head('Acuario', '') + tabs + htmlCalAcuario(p);
  const h = _acHtml(p, e), i = h.indexOf('<div class="hd'), j = i >= 0 ? h.indexOf('</div></div>', i) : -1;
  return j >= 0 ? h.slice(0, j + 12) + tabs + h.slice(j + 12) : tabs + h;
};
P.acuario.tras = (el, p) => { if (p.tab === 'medidas') montarMedidas(el, p); };
P.acuario.montar = P.acuario.tras;
P.acuario.fijo = () => '<button class="fab" data-a="acFab" aria-label="Añadir">' + ic('anadir', 28) + '</button>';
ACC.acFab = el => {
  const p = Nav.actual().params;
  if (p.tab === 'medidas') { const i = $('.minp'); if (i) i.focus(); return; }
  if (p.tab === 'calendario') return Nav.ir('acDia', { dia: hoyISO() });
  ACC.rutNueva({ dataset: { col: 'acuario' } });
};

function htmlMedidas(p) {
  p.dia = p.dia || hoyISO();
  const m = medidaDe(p.dia), ps = acParams(), fs = fotosDe(p.dia);
  let h = '<div class="dnav"><button class="icb" data-a="acDiaMov" data-v="-1" aria-label="Día anterior">' + ic('atras', 22) + '</button><b>' + cap(fechaCorta(deISO(p.dia))) + (p.dia === hoyISO() ? ' <em>Hoy</em>' : '') + '</b><button class="icb fl" data-a="acDiaMov" data-v="1" aria-label="Día siguiente"' + (p.dia >= hoyISO() ? ' disabled' : '') + '>' + ic('atras', 22) + '</button></div>';
  h += '<div class="card grp">' + ps.map(x => '<div class="row"><button class="f rowb" data-a="ir" data-id="acGraficas" data-k="' + x.k + '"><b>' + esc(x.n) + '</b></button><input class="minp" data-k="' + x.k + '" inputmode="decimal" placeholder="—" value="' + esc(valorDe(m, x.k) === null ? '' : numTxt(valorDe(m, x.k))) + '" aria-label="' + esc(x.n) + '"><small class="un">' + esc(x.u) + '</small></div>').join('') + '</div>';
  h += '<div class="fst">' + fs.map(f => { const img = imagen(f.fid); return '<button class="fto" data-a="acFotoVer" data-id="' + f.id + '" style="' + (img ? 'background-image:url(\'' + img + '\')' : '') + '"></button>'; }).join('') +
    '<label class="fadd">' + ic('camara', 24) + '<small>' + (p.subiendo ? 'Subiendo…' : 'Foto') + '</small><input type="file" accept="image/*" class="arch" data-r="acFoto"></label></div>';
  /* Anterior y última */
  const ms = medidasOrden(), ult = ms[ms.length - 1], ant = ms[ms.length - 2];
  if (ult) {
    h += '<h3>Anterior y última</h3><div class="tbl"><div class="th"><span></span><span>Anterior' + (ant ? '<small>' + fechaCortaTxt(ant.fecha) + '</small>' : '') + '</span><span>Última<small>' + fechaCortaTxt(ult.fecha) + '</small></span></div>' +
      ps.map(x => {
        const a = valorDe(ant, x.k), u = valorDe(ult, x.k), d = a !== null && u !== null ? Math.round((u - a) * 1000) / 1000 : null;
        return '<button class="tr" data-a="ir" data-id="acGraficas" data-k="' + x.k + '"><b>' + esc(x.n) + '</b><span>' + (a === null ? '—' : numTxt(a) + ' ' + esc(x.u)) + '</span><span>' + (d !== null ? '<i class="' + (d > 0 ? 'up' : 'dn') + '">(' + (d > 0 ? '+' : '') + numTxt(d) + ')</i> ' : '') + '<b>' + (u === null ? '—' : numTxt(u) + ' ' + esc(x.u)) + '</b></span></button>';
      }).join('') + '</div><p class="cap" style="text-align:left">Entre paréntesis, la diferencia: en verde si ha subido y en gris si ha bajado o sigue igual.</p>';
  }
  return h;
}
function montarMedidas(el, p) {
  $$('.minp', el).forEach(i => i.addEventListener('change', () => {
    const t = i.value.trim(), v = t === '' ? '' : numero(t);
    if (t !== '' && isNaN(Number(String(t).replace(',', '.')))) { toast('Escribe un número.'); return; }
    const c = { fecha: p.dia }; c['v_' + i.dataset.k] = v === '' ? '' : Number(String(t).replace(',', '.'));
    cambiar('medidas', idMedida(p.dia), c);
    i.value = v === '' ? '' : numTxt(c['v_' + i.dataset.k]);
    clearTimeout(P.acuario.t); P.acuario.t = setTimeout(() => { const a = document.activeElement; if (!a || !a.classList.contains('minp')) Nav.refrescar(true); }, 900);
  }));
  const f = $('[data-r="acFoto"]', el);
  if (f) f.addEventListener('change', () => subirFotoAcuario(f, p));
}
async function subirFotoAcuario(f, p) {
  if (!f.files[0]) return;
  p.subiendo = true; Nav.refrescar(true);
  try { const b = await reducir(f.files[0], 1800, 0.84); const r = await subirArchivo(b, 'acuario-' + (p.dia || hoyISO()) + '.jpg'); cambiar('acfotos', 'f' + uid(), { fecha: p.dia || hoyISO(), fid: r.fid, creado: Date.now(), creadoPor: S.cfg.persona }); toast('Foto guardada'); }
  catch (e) { toast('No he podido subir la foto: ' + e.message); }
  p.subiendo = false; Nav.refrescar(true);
}
ACC.acDiaMov = el => { const p = Nav.actual().params; const d = isoDia(sumaDias(deISO(p.dia || hoyISO()), Number(el.dataset.v))); if (d > hoyISO()) return; p.dia = d; Nav.refrescar(true); };
ACC.acFotoVer = el => {
  const f = dato('acfotos', el.dataset.id); if (!f) return;
  const img = imagen(f.fid);
  abrirHoja('<h3>' + cap(fechaCorta(deISO(f.fecha))) + '</h3>' + (img ? '<img class="fgr" src="' + img + '" alt="">' : '<p class="texto">Cargando…</p>') + '<button class="btn sec peligro" data-a="acFotoBorrar" data-id="' + f.id + '" style="margin-top:14px">Borrar foto</button>');
};
ACC.acFotoBorrar = el => { const id = el.dataset.id; cambiar('acfotos', id, { _b: 1 }); cerrarHoja(); Nav.refrescar(true); toast('Foto borrada', 'Deshacer', () => { cambiar('acfotos', id, { _b: 0 }); Nav.refrescar(); }); };

/* Gráficas: una por parámetro, en el mismo orden */
P.acGraficas = {
  html: p => {
    const ms = medidasOrden(), ps = acParams().filter(x => !p.k || x.k === p.k);
    if (!ms.length) return tope('Gráficas') + vacio('sin-resultados', 'Sin medidas todavía', 'Apunta las primeras en Acuario › Medidas.');
    return tope(p.k ? (ps[0] || {}).n || 'Gráfica' : 'Gráficas') + (p.k ? '<button class="lnk" data-a="pSet" data-k="k" data-v="" style="margin-bottom:8px">Ver todas</button>' : '') + ps.filter(x => p.k || ms.some(m => valorDe(m, x.k) !== null)).map(x => {
      const pts = ms.filter(m => valorDe(m, x.k) !== null), vals = pts.map(m => valorDe(m, x.k)), et = pts.map(m => { const d = deISO(m.fecha); return d.getDate() + '/' + (d.getMonth() + 1); });
      const u = pts[pts.length - 1];
      return '<div class="gc"><div class="gh"><b>' + esc(x.n) + '</b>' + (u ? '<span><b>' + numTxt(valorDe(u, x.k)) + ' ' + esc(x.u) + '</b> · ' + fechaCortaTxt(u.fecha) + '</span>' : '<span>Sin datos</span>') + '</div>' + (vals.length ? grafica(vals, et, COL[5]) : '') + '<p class="gval" data-k="' + x.k + '"></p></div>';
    }).join('') + (() => { const sin = p.k ? [] : ps.filter(x => !ms.some(m => valorDe(m, x.k) !== null)); return sin.length ? '<p class="cap" style="text-align:left;margin-top:10px">Sin datos todavía: ' + sin.map(x => esc(x.n)).join(', ') + '.</p>' : ''; })();
  },
  tras(el) {
    $$('.gc', el).forEach(g => g.addEventListener('click', ev => {
      const c = ev.target.closest('.gp'); if (!c) return;
      const k = $('.gval', g).dataset.k, x = acParams().find(y => y.k === k), pts = medidasOrden().filter(m => valorDe(m, k) !== null), m = pts[+c.dataset.i];
      if (m) $('.gval', g).textContent = cap(fechaCorta(deISO(m.fecha))) + ': ' + numTxt(valorDe(m, k)) + ' ' + (x ? x.u : '');
    }));
  },
  montar(el, p) { P.acGraficas.tras(el, p); }
};

/* Parámetros: ordenar arrastrando, ocultar y añadir */
P.acParams = {
  html: () => '' + tope('Parámetros') + '<p class="texto">Arrastra desde las rayas para cambiar el orden. Los ocultos no salen en las medidas ni en las gráficas.</p><div class="card grp" data-r="acl" style="margin-top:10px">' +
    acParams(true).map((x, i) => '<div class="row acpr" data-i="' + i + '"><span class="asa" aria-label="Mover">' + ic('asas', 22) + '</span><b style="flex:1">' + esc(x.n) + ' <small class="un2">' + esc(x.u) + '</small></b>' + (AC_DEF.some(d => d[0] === x.k) ? '' : '<button class="mini" data-a="acParQuitar" data-i="' + i + '">Quitar</button>') + swi(x.on !== false, 'acParTog', 'data-i="' + i + '"') + '</div>').join('') + '</div>' +
    '<div class="fld fldr" style="margin-top:12px"><div class="f"><small>Añadir parámetro</small><input id="apN" placeholder="CO₂, cobre…" maxlength="20"></div><div style="width:84px"><small style="color:var(--mu);font-weight:700;font-size:12.5px">Unidad</small><input id="apU" placeholder="mg/l" maxlength="8" style="width:100%;border:0;outline:0;background:none;font:700 17px Nunito;color:inherit"></div><button class="mini" data-a="acParNuevo">Añadir</button></div>',
  tras(el) {
    const cont = $('[data-r="acl"]', el); if (!cont) return;
    let d = null;
    cont.addEventListener('pointerdown', ev => { const a = ev.target.closest('.asa'); if (!a) return; ev.preventDefault(); const r = a.closest('.acpr'); d = { r: r, y0: ev.clientY }; r.classList.add('drag'); });
    const mover = ev => { if (!d) return; ev.preventDefault(); const filas = $$('.acpr', cont).filter(x => x !== d.r); const sig = filas.find(x => { const b = x.getBoundingClientRect(); return ev.clientY < b.top + b.height / 2; }); cont.insertBefore(d.r, sig || null); };
    const soltar = () => { if (!d) return; d.r.classList.remove('drag'); const ant = acParams(true), nuevo = $$('.acpr', cont).map(x => ant[+x.dataset.i]); d = null; cambiar('ajustes', 'acuario', { params: nuevo }); Nav.refrescar(true); };
    cont.addEventListener('pointermove', mover); document.addEventListener('pointerup', soltar, { once: false });
    cont.addEventListener('touchmove', ev => { if (d) ev.preventDefault(); }, { passive: false });
  },
  montar(el) { P.acParams.tras(el); }
};
ACC.acParTog = el => { const l = acParams(true).map(x => Object.assign({}, x)); const x = l[+el.dataset.i]; x.on = x.on === false; cambiar('ajustes', 'acuario', { params: l }); Nav.refrescar(true); };
ACC.acParQuitar = el => { const l = acParams(true).filter((x, i) => i !== +el.dataset.i); cambiar('ajustes', 'acuario', { params: l }); Nav.refrescar(true); };
ACC.acParNuevo = () => { const n = cap(val('apN')); if (!n) return toast('Escribe el nombre del parámetro.'); const l = acParams(true).concat([{ k: 'x' + uid().slice(-6), n: n, u: val('apU'), on: true }]); cambiar('ajustes', 'acuario', { params: l }); Nav.refrescar(true); };

/* Calendario del mes: días con algo en pastel, con una gota (medidas) y una cámara (fotos) */
function htmlCalAcuario(p) {
  const base = p.mes ? deISO(p.mes) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  p.mes = isoDia(base);
  const ini = new Date(base.getFullYear(), base.getMonth(), 1), dias = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const conM = {}, conF = {};
  medidasOrden().forEach(m => { conM[m.fecha] = 1; }); lista('acfotos').forEach(f => { conF[f.fecha] = 1; });
  let h = '<div class="dnav"><button class="icb" data-a="acMes" data-v="-1" aria-label="Mes anterior">' + ic('atras', 22) + '</button><b>' + cap(MESES[base.getMonth()]) + ' ' + base.getFullYear() + '</b><button class="icb fl" data-a="acMes" data-v="1" aria-label="Mes siguiente">' + ic('atras', 22) + '</button></div><div class="calg">' + LETRAS.map(x => '<b class="wd">' + x + '</b>').join('');
  for (let i = 1; i < diaSemana(ini); i++) h += '<span></span>';
  for (let d = 1; d <= dias; d++) {
    const iso = isoDia(new Date(base.getFullYear(), base.getMonth(), d)), m = conM[iso], f = conF[iso];
    h += '<button class="acd' + (iso === hoyISO() ? ' hoy' : '') + (m || f ? ' reg' : '') + '" data-a="ir" data-id="acDia" data-dia="' + iso + '"><b>' + d + '</b><i>' + (m ? ic('gota-test', 13, 4) : '') + (f ? ic('camara', 13, 0) : '') + '</i></button>';
  }
  return h + '</div><div class="lgd"><span>' + ic('gota-test', 16, 4) + ' Medidas</span><span>' + ic('camara', 16, 0) + ' Fotos</span></div>';
}
ACC.acMes = el => { const p = Nav.actual().params, b = deISO(p.mes); b.setMonth(b.getMonth() + Number(el.dataset.v)); p.mes = isoDia(b); Nav.refrescar(true); };
P.acDia = {
  html: p => {
    const m = medidaDe(p.dia), fs = fotosDe(p.dia), ps = acParams();
    let h = tope(cap(fechaCorta(deISO(p.dia))));
    h += '<div class="fst big">' + fs.map(f => { const img = imagen(f.fid); return '<button class="fto" data-a="acFotoVer" data-id="' + f.id + '" style="' + (img ? 'background-image:url(\'' + img + '\')' : '') + '"></button>'; }).join('') + '<label class="fadd">' + ic('camara', 24) + '<small>' + (p.subiendo ? 'Subiendo…' : 'Foto') + '</small><input type="file" accept="image/*" class="arch" data-r="acFoto2"></label></div>';
    if (fs.length) h += '<p class="cap" style="text-align:left">' + fs.length + (fs.length === 1 ? ' foto' : ' fotos') + ' · en vuestra carpeta de Drive</p>';
    h += '<h3>Medidas</h3>' + (m && ps.some(x => valorDe(m, x.k) !== null) ? '<div class="card grp">' + ps.filter(x => valorDe(m, x.k) !== null).map(x => '<div class="row"><b style="flex:1">' + esc(x.n) + '</b><b>' + numTxt(valorDe(m, x.k)) + ' ' + esc(x.u) + '</b></div>').join('') + '</div>' : '<p class="texto">Sin medidas este día.</p>');
    return h + '<button class="btn sec" data-a="acDiaEditar" style="margin-top:14px">' + (m ? 'Cambiar las medidas' : 'Apuntar medidas') + '</button>';
  },
  tras(el, p) { const f = $('[data-r="acFoto2"]', el); if (f) f.addEventListener('change', () => subirFotoAcuario(f, p)); },
  montar(el, p) { P.acDia.tras(el, p); }
};
ACC.acDiaEditar = () => { const dia = Nav.actual().params.dia; Nav.atras(); const e = Nav.actual(); if (e && e.id === 'acuario') { e.params.tab = 'medidas'; e.params.dia = dia; Nav.refrescar(true); } };

/* Tarjetas de inicio del acuario */
wd('acMedicion', 'Última medición', 'Acuario', 'L', cTU, 'Los parámetros, con flecha verde si suben y gris si bajan', () => {
  const ms = medidasOrden(), u = ms[ms.length - 1], a = ms[ms.length - 2];
  if (!u) return { vacio: true, h: lab('Última medición') + '<p class="mu2">Sin medidas todavía</p>' };
  const ps = acParams().filter(x => valorDe(u, x.k) !== null).slice(0, 4);
  return { vacio: false, h: lab('Última medición', '<span class="wa">' + fechaCortaTxt(u.fecha) + '</span>') + '<div class="pg3">' + ps.map(x => { const v = valorDe(u, x.k), w = valorDe(a, x.k), d = w === null ? null : v - w; return '<div><small>' + esc(x.n) + '</small><b>' + numTxt(v) + '</b>' + (d === null ? '' : '<i class="' + (d > 0 ? 'up' : 'dn') + '">' + (d > 0 ? '▲' : d < 0 ? '▼' : '=') + '</i>') + '</div>'; }).join('') + '</div>' };
});
wd('acParam', 'Un parámetro', 'Acuario', 'S', cTU, 'Una mini gráfica del parámetro que elijas', () => {
  const k = cfgInicio().acParam || 'nitrato', x = acParams(true).find(y => y.k === k) || acParams()[0];
  const pts = medidasOrden().filter(m => valorDe(m, x.k) !== null);
  if (!pts.length) return { vacio: true, h: lab(esc(x.n)) + '<p class="mu2">Sin medidas</p>' };
  const u = pts[pts.length - 1];
  return { vacio: false, h: lab(esc(x.n)) + big(numTxt(valorDe(u, x.k)), esc(x.u)) + '<div class="spk">' + grafica(pts.slice(-8).map(m => valorDe(m, x.k)), [], COL[5], 160, 56).replace(/<text[^>]*>[^<]*<\/text>/g, '').replace(/<line[^>]*\/>/g, '') + '</div><small class="mu2">' + fechaCortaTxt(u.fecha) + '</small>' };
});
W.acParam.opciones = 'acParamOpc';
ACC.acParamOpc = () => abrirHoja('<h3>¿Qué parámetro?</h3><div class="card grp">' + acParams().map(x => '<button class="row" data-a="acParamSi" data-k="' + x.k + '"><b style="flex:1">' + esc(x.n) + '</b><span class="rad' + ((cfgInicio().acParam || 'nitrato') === x.k ? ' on' : '') + '"></span></button>').join('') + '</div>');
ACC.acParamSi = el => { fijarCfg({ acParam: el.dataset.k }); cerrarHoja(); Nav.refrescar(true); };
wd('acFoto', 'Última foto', 'Acuario', 'S', cTU, 'La última foto del acuario', () => {
  const f = lista('acfotos').sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.creado || 0) - (a.creado || 0))[0];
  if (!f) return { vacio: true, h: lab('Acuario') + '<p class="mu2">Sin fotos todavía</p>' };
  const img = imagen(f.fid);
  return { vacio: false, h: lab('Acuario', '<span class="wa">' + fechaCortaTxt(f.fecha) + '</span>') + '<div class="wfoto" style="' + (img ? 'background-image:url(\'' + img + '\')' : '') + '"></div>' };
});
W.acMedicion.ir = 'wAcMedidas'; W.acParam.ir = 'wAcMedidas'; W.acFoto.ir = 'wAcCal';
ACC.wAcMedidas = () => { ACC.abrirMod({ dataset: { id: 'acuario' } }); setTimeout(() => { const e = Nav.actual(); if (e && e.id === 'acuario') { e.params.tab = 'medidas'; Nav.refrescar(true); } }, 40); };
ACC.wAcCal = () => { ACC.abrirMod({ dataset: { id: 'acuario' } }); setTimeout(() => { const e = Nav.actual(); if (e && e.id === 'acuario') { e.params.tab = 'calendario'; Nav.refrescar(true); } }, 40); };
