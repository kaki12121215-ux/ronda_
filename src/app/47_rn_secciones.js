/* ===================== DISEÑO NUEVO · 0.2.0 · las secciones con JPG propio =====================
   Compra, lista abierta y sus opciones, Listas, Menú, Turnos, Agenda, Gastos, Plantas, Acuario, Medicación, Coches,
   Documentos, Notas, Feedback y la hoja «Añadir» del «+» de Inicio. La lógica (guardar, marcar, borrar…) es la de hoy:
   aquí solo cambia cómo se pinta. Las pestañas que no tienen JPG (Agenda Semana y Lista, Gastos fijos y Resumen,
   Acuario Medidas y Calendario) enseñan su contenido de hoy con el diseño nuevo. */

/* Las pantallas de hoy que se reutilizan en las pestañas sin JPG (se guardan antes de sustituirlas) */
const P_VIEJO = { agenda: P.agenda, gastos: P.gastos, acuario: P.acuario };

/* ---------- Piezas ---------- */
const rnTg = (t, k) => '<span class="rn-tgs' + (k ? ' rn-k-' + k : '') + '">' + t + '</span>';
const rnSeg = (n, t, h) => '<div class="rn-seg">' + Array.from({ length: Math.max(1, t) }, (x, i) => '<i class="' + (i < n ? 'rn-on' : '') + '"' + (h ? ' style="height:' + h + 'px"' : '') + '></i>').join('') + '</div>';
const rnEmo = (e, id, s) => e ? '<span class="rn-emj" style="width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s * .6) + 'px">' + esc(e) + '</span>' : '<span class="rn-emj rn-chip">' + rnIc(id, Math.round(s * .68), 2.1) + '</span>';
const rnFila = (id, t, s, der, a) => '<' + (a ? 'button ' + a : 'div') + ' class="rn-rw rn-fa">' + rnChip(id, 38) + '<span class="rn-fat"><span class="rn-t">' + t + '</span>' + (s ? '<span class="rn-n">' + s + '</span>' : '') + '</span>' + (der === undefined ? rnFle : der) + '</' + (a ? 'button' : 'div') + '>';
const rnFiltros = (xs, sel, a, k) => '<div class="rn-flw"><div class="rn-fl rn-gl" role="tablist">' + xs.map(c => '<button class="' + (sel === c[0] ? 'rn-on' : '') + '" role="tab" aria-selected="' + (sel === c[0]) + '" data-a="' + (a || 'pSet') + '" data-k="' + (k || 'f') + '" data-v="' + c[0] + '">' + esc(c[1]) + '</button>').join('') + '</div></div>';
const rnDiaCorto = iso => { const d = deISO(iso); return d ? cap(DIAS[d.getDay()]) + ' ' + d.getDate() : ''; };
const rnFechaTag = iso => { const n = faltan(iso); if (n === null) return ''; if (n === 0) return 'Hoy'; if (n === 1) return 'Mañana'; const d = deISO(iso); return n < 60 ? d.getDate() + ' ' + MESES[d.getMonth()].slice(0, 3) : cap(MESES[d.getMonth()].slice(0, 3)) + ' ' + d.getFullYear(); };
/* El contenido de una pantalla de hoy, sin su cabecera (para las pestañas sin JPG) */
function rnSinCabecera(h, quitarSeg) {
  const t = document.createElement('template'); t.innerHTML = h;
  let segs = 0;
  [...t.content.children].forEach(x => { if (x.matches('.top, .hd, [data-r="banda"]')) x.remove(); else if (quitarSeg && x.matches('.seg') && !segs++) x.remove(); });
  return '<div class="rn-dentro">' + t.innerHTML + '</div>';
}
const rnPersona = id => dato('personas', id);

/* ===================== COMPRA (JPG 06) ===================== */
P.compra = {
  raiz: true, rn: true,
  html: () => {
    const ls = listasCompra(), tot = lista('compra').filter(x => !x.hecho && ls.some(l => l.id === listaDe(x))).length;
    const conAlgo = ls.filter(l => pendientesDe(l.id)).length;
    const lid = ultimaLista(), L = datoLista(lid) || ls[0];
    return rnTitulo('Compra', { der: rnRb('buscar', 'rnBuscarEn', 'Buscar'), sub: tot ? tot + (tot === 1 ? ' cosa' : ' cosas') + ' por comprar' + (conAlgo > 1 ? ' en ' + conAlgo + ' listas' : '') : 'Nada por comprar' }) +
      '<form class="rn-cd rn-gl rn-qbar" onsubmit="return false"><input id="rnCN" class="rn-qai" placeholder="¿Qué falta?" autocomplete="off" enterkeyhint="done" maxlength="60" data-lid="' + L.id + '" aria-label="¿Qué falta?"><button type="button" class="rn-tg" data-a="rnCLista">' + esc(L.nombre) + '</button><button type="button" class="rn-qmic" data-a="rnDilo" aria-label="Dictar">' + rnIc('microfono', 21, 2) + '</button><button type="button" class="rn-qab" data-a="rnCOk" aria-label="Añadir">' + rnIc('anadir', 22, 2.2) + '</button></form>' +
      rnCd(rnGrupo('Vuestras listas', String(ls.length)) + ls.map(l => {
        const todos = lista('compra').filter(x => listaDe(x) === l.id), n = todos.filter(x => !x.hecho).length, carro = todos.filter(x => x.hecho && x.hechoEn && Date.now() - x.hechoEn < 3 * 86400000).length;
        return '<div class="rn-rw rn-lc" data-a="abrirLista" data-lp="rnMenuLista" data-id="' + l.id + '">' + rnEmo(l.emoji, l.icono || 'carrito', 40) + '<span class="rn-fat"><span class="rn-t rn-b">' + esc(l.nombre) + '</span><span class="rn-n">' + (n ? n + ' por comprar' + (l.secciones ? ', por secciones' : '') : 'Nada por comprar') + '</span>' + (n ? '<span class="rn-lcs">' + rnSeg(carro, n + carro, 5) + '</span>' : '') + '</span><b class="rn-num rn-lcn">' + n + '</b></div>';
      }).join('') + '<button class="rn-rw rn-nueva" data-a="nuevaLista">' + rnIc('anadir', 20, 2) + '<span class="rn-t">Nueva lista</span></button>', 'rn-gr');
  },
  montar(el) { P.compra.tras(el); },
  tras(el) { const i = $('#rnCN', el); if (i) i.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ACC.rnCOk(); } }); },
  rnPlus: () => ACC.aProducto()
};
ACC.rnCLista = () => { const ls = listasCompra(), i = $('#rnCN'), act = i ? i.dataset.lid : ultimaLista(); const sig = ls[(ls.findIndex(l => l.id === act) + 1) % ls.length]; if (!sig) return; const v = i ? i.value : ''; fijarUltima(sig.id); Nav.refrescar(true); const j = $('#rnCN'); if (j) j.value = v; };
ACC.rnCOk = () => { const i = $('#rnCN'); if (!i) return; const v = i.value.trim(); if (!v) return i.focus(); const aviso = anadirProducto(v, i.dataset.lid); toast(aviso || '«' + cap(partirCantidad(v).nombre) + '» añadido a ' + (datoLista(i.dataset.lid) || {}).nombre, null, null, aviso ? null : 'hecho'); i.value = ''; Nav.refrescar(true); };
ACC.rnBuscarEn = () => Nav.ir('buscar', {});
ACC.rnDilo = () => toast('Dilo necesita Google (Gemini): en la prueba no está.');
ACC.rnMenuLista = el => rnOpcionesLista(el.dataset.id);

/* ---------- Lista abierta (tipo 04) y sus opciones (tipo 05) ---------- */
P.lista = {
  rn: true,
  html: (p, e) => {
    const L = datoLista(p.lid) || { id: p.lid, nombre: 'Lista', secciones: false };
    const l = lista('compra').filter(x => listaDe(x) === L.id), falta = l.filter(x => !x.hecho), hechos = l.filter(x => x.hecho);
    const fila = x => { const quien = rnPersona(x.creadoPor); return '<div class="rn-rw rn-it' + (x.hecho ? ' rn-dn' : '') + '" data-lp="menuProducto" data-id="' + x.id + '"><button class="rn-ck' + (x.hecho ? ' rn-on' : '') + '" data-a="marcar" data-id="' + x.id + '" aria-label="Comprado">' + rnTick + '</button><button class="rn-rwt" data-a="marcar" data-id="' + x.id + '"><span class="rn-t">' + esc(x.nombre) + '</span>' + ((x.cantidad || (x.para && !x.hecho)) ? '<span class="rn-n">' + [x.cantidad ? esc(textoCantidad(x.cantidad)) : '', x.para && !x.hecho ? esc(textoPara(x.para)) : ''].filter(Boolean).join(' · ') + '</span>' : '') + '</button>' + (quien && quien.id !== S.cfg.persona && !x.hecho ? rnAv(quien, 26) : '') + '</div>'; };
    const orden = (a, b) => (a.orden || 0) - (b.orden || 0);
    let h = rnTitulo((L.emoji ? esc(L.emoji) + ' ' : '') + esc(L.nombre), { peq: 1, atras: 'Compra', der: rnRb('compartir', 'rnCompartirLista', 'Compartir', ' data-id="' + esc(L.id) + '"') + rnRb('menu', 'rnOpcLista', 'Opciones', ' data-id="' + esc(L.id) + '"'), sub: l.length ? falta.length + ' por comprar y ' + hechos.length + ' en el carro' : 'Lista vacía' }) +
      '<form class="rn-cd rn-gl rn-qbar" onsubmit="return false"><input id="nuevo" class="rn-qai" placeholder="Añadir a ' + esc(L.nombre) + '" autocomplete="off" enterkeyhint="done" maxlength="60" aria-label="Añadir producto"><button type="button" class="rn-qmic" data-a="rnDilo" aria-label="Dictar">' + rnIc('microfono', 21, 2) + '</button><button type="submit" class="rn-qab" data-a="anadirCompra" aria-label="Añadir">' + rnIc('anadir', 22, 2.2) + '</button></form>';
    if (!l.length) return h + '<div class="rn-vac">' + rnIlu('sin-compras') + '<h2>Sin compras</h2><p class="rn-txt">Escribe arriba lo que falta.</p></div>';
    if (L.secciones) SECCIONES.forEach(s => { const xs = falta.filter(x => (x.seccion || 'otros') === s[0]).sort(orden); if (xs.length) h += rnCd(rnGrupo(s[1], String(xs.length)) + xs.map(fila).join(''), 'rn-gr'); });
    else if (falta.length) h += rnCd(rnGrupo('Por comprar', String(falta.length)) + falta.sort(orden).map(fila).join(''), 'rn-gr');
    if (hechos.length) h += rnCd(rnGrupo('En el carro', String(hechos.length)) + hechos.sort((a, b) => (b.hechoEn || 0) - (a.hechoEn || 0)).map(fila).join(''), 'rn-gr');
    return h;
  },
  montar(el) { const i = $('#nuevo', el); if (i) i.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ACC.anadirCompra(); } }); },
  tras(el) { P.lista.montar(el); },
  rnPlus: () => { const i = $('#nuevo'); if (i) i.focus(); }
};
ACC.rnOpcLista = el => rnOpcionesLista(el.dataset.id);
ACC.rnCompartirLista = el => Nav.ir('compartir', { lid: el.dataset.id });
function rnOpcionesLista(lid) {
  const l = datoLista(lid); if (!l) return;
  const hechos = lista('compra').filter(x => listaDe(x) === l.id && x.hecho).length;
  abrirHoja(rnCabHoja((l.emoji ? esc(l.emoji) + ' ' : '') + esc(l.nombre)) + '<div class="rn-ops">' +
    '<button class="rn-op" data-a="editarLista" data-id="' + l.id + '">' + rnIc('editar', 22, 2) + '<span>Cambiar nombre y emoji</span></button>' +
    '<button class="rn-op" data-a="rnCompartirLista" data-id="' + l.id + '">' + rnIc('compartir', 22, 2) + '<span>Compartir con alguien de fuera</span></button>' +
    '<div class="rn-op">' + rnIc('filtrar', 22, 2) + '<span style="flex:1">Ordenar por secciones</span>' + rnSw(!!l.secciones, 'rnListaSec" data-id="' + l.id) + '</div>' +
    '<button class="rn-op" data-a="rnVaciarLista" data-id="' + l.id + '">' + rnIc('archivar', 22, 2) + '<span>Vaciar lo ya comprado' + (hechos ? ' (' + hechos + ')' : '') + '</span></button>' +
    (listasCompra().length > 1 ? '<button class="rn-op rn-peligro" data-a="borrarLista" data-id="' + l.id + '">' + rnIc('borrar', 22, 2) + '<span>Borrar la lista</span></button>' : '') + '</div>', { clase: 'rn-k-amarillo' });
}
ACC.rnListaSec = el => { const l = datoLista(el.dataset.id); cambiar('listas', l.id, Object.assign({}, l.id === LSUPER && !S.recs.listas ? { nombre: l.nombre } : {}, { secciones: !l.secciones })); el.classList.toggle('rn-on'); Nav.refrescar(true); };
ACC.rnVaciarLista = el => { cerrarHoja(); const hs = lista('compra').filter(x => listaDe(x) === el.dataset.id && x.hecho); if (!hs.length) return toast('No hay nada comprado.'); hs.forEach(x => cambiar('compra', x.id, { _b: 1 })); Nav.refrescar(true); toast(hs.length + ' quitados', 'Deshacer', () => { hs.forEach(x => cambiar('compra', x.id, { _b: 0 })); Nav.refrescar(true); }, 'hecho'); };
ACC.marcar = el => {
  const x = dato('compra', el.dataset.id); if (!x) return;
  const h = !x.hecho; const f = el.closest('.rn-it'); if (f) f.classList.toggle('rn-dn', h);
  cambiar('compra', x.id, { hecho: h, hechoPor: h ? S.cfg.persona : '', hechoEn: Date.now() });
  setTimeout(() => Nav.refrescar(true), 260);
};

/* ===================== LISTAS QUE SE REPITEN (JPG 07) ===================== */
P.listasr = {
  raiz: true, rn: true,
  html: () => {
    const l = lista('listasr').sort((a, b) => (a.creado || 0) - (b.creado || 0));
    let h = rnTitulo('Listas', { sub: 'Listas que se repiten: se usan, se vacían y vuelven' });
    if (!l.length) return h + '<div class="rn-vac">' + rnIlu('il-listas') + '<h2>Sin listas</h2><p class="rn-txt">La maleta, la limpieza del sábado, lo de antes de salir…</p></div>';
    return h + '<div style="height:8px"></div>' + l.map(x => {
      const it = itemsDe(x.id), n = it.filter(i => i.h).length, tot = it.length;
      const sub = tot && n === tot ? 'Completa: tocar para empezar otra vez' : x.veces ? 'Usada ' + x.veces + (x.veces === 1 ? ' vez' : ' veces') : it.filter(i => !i.h).slice(0, 3).map(i => i.t).join(', ').toLowerCase().replace(/^./, c => c.toUpperCase()) + (tot > 3 ? '…' : '');
      return '<button class="rn-cd rn-gl rn-lr" data-a="ir" data-id="listar" data-lid="' + x.id + '" data-lp="listaRMenu"><span class="rn-lrt">' + rnEmo(x.emoji, 'lista-repetir', 40) + '<span class="rn-fat"><span class="rn-t rn-b">' + esc(x.nombre) + '</span><span class="rn-n">' + esc(sub || 'Vacía') + '</span></span><b class="rn-lrn">' + n + ' de ' + tot + '</b></span>' + rnSeg(n, tot, 5) + '</button>';
    }).join('');
  },
  rnPlus: () => ACC.listaRNueva()
};

/* ===================== MENÚ SEMANAL (JPG 08) ===================== */
P.menu = {
  raiz: true, rn: true, sinPlus: true,
  html: p => {
    const lun = p.semana ? deISO(p.semana) : lunesDe(new Date()); p.semana = isoDia(lun);
    const esta = isoDia(lunesDe(new Date())) === p.semana, fin = sumaDias(lun, 6), cs = comidasOn();
    const sub = 'Semana del ' + lun.getDate() + (lun.getMonth() !== fin.getMonth() ? ' de ' + MESES[lun.getMonth()] : '') + ' al ' + fin.getDate() + ' de ' + MESES[fin.getMonth()];
    const botones = rnRb('atras', 'menuSem', 'Semana anterior', ' data-v="-1"') + (esta ? '' : '<button class="rn-rb rn-gl rn-girar" data-a="menuSem" data-v="1" aria-label="Semana siguiente">' + rnIc('atras', 21, 2) + '</button>') + rnRb('ajustes', 'ir', 'Ajustes del menú', ' data-id="menuAjustes"');
    let h = rnTitulo('Menú', { der: botones, sub: sub }) + '<button class="rn-btnp rn-tinte" data-a="menuACompra">' + rnIc('modulo-compra', 20, 2) + 'Añadir lo que falta a la compra</button>';
    const m = dato('menu', idSemana(lun)) || {};
    [0, 1, 2, 3, 4, 5, 6].forEach(i => {
      const d = sumaDias(lun, i), hoy = isoDia(d) === hoyISO();
      if (esta && d < hoy0()) return;
      h += '<button class="rn-cd rn-gl rn-md2" data-a="rnMenuDia" data-d="' + (i + 1) + '" data-s="' + p.semana + '">' + rnGrupo(cap(DIAS[d.getDay()]) + ' ' + d.getDate(), hoy ? 'Hoy' : '') +
        cs.map(c => { const t = m['d' + (i + 1) + c[0]]; return '<span class="rn-rw rn-plato"><span class="rn-pic2">' + rnIc(ICOMIDA[c[0]] || 'cubiertos', 18, 2) + '</span><span class="rn-s rn-pl2">' + c[1] + '</span><span class="rn-pt2' + (t ? '' : ' rn-mv') + '">' + (t ? esc(t) : 'Sin poner') + '</span></span>'; }).join('') + '</button>';
    });
    return h;
  }
};
ACC.rnMenuDia = el => Nav.ir('menuDia', { semana: el.dataset.s, d: +el.dataset.d });

/* ===================== TURNOS (JPG 05) ===================== */
P.turnos = {
  raiz: true, rn: true,
  html: () => {
    const l = lista('turnos').sort((a, b) => (a.creado || 0) - (b.creado || 0));
    let h = rnTitulo('Turnos', { sub: l.length ? l.length + (l.length === 1 ? ' turno en marcha' : ' turnos en marcha') : 'Lo que os vais alternando' });
    if (!l.length) return h + '<div class="rn-vac">' + rnIlu('hogar-al-dia') + '<h2>Sin turnos</h2><p class="rn-txt">Sacar la basura, limpiar el baño, cocinar el domingo…</p></div>';
    const ds = diaSemana(new Date());
    return h + '<div style="height:8px"></div>' + l.map(t => {
      const q = tocaTurno(t), p = rnPersona(q), qs = (t.quienes || []).filter(x => x !== q), sig = qs[0] ? nombreDe(qs[0]) : '';
      const sub = t.rota === 'semana' ? 'Cambia cada semana, los lunes' : t.rota === 'dias' ? 'Cada día le toca a alguien' : 'Cambia cada vez que se hace';
      const queda = t.rota === 'semana' ? (8 - ds === 1 ? 'Queda 1 día' : 'Quedan ' + (8 - ds) + ' días') : t.rota === 'dias' ? 'Hoy' : 'Cuando se haga';
      return '<button class="rn-cd rn-gl rn-tr" data-a="ir" data-id="turno" data-tid="' + t.id + '"><span class="rn-trt">' + rnChip('turno', 38) + '<span class="rn-fat"><span class="rn-t rn-b">' + esc(t.nombre) + '</span><span class="rn-n">' + sub + '</span></span>' + rnAv(p, 34) + '</span><span class="rn-trp"><span class="rn-s">Le toca a <b>' + esc(nombreDe(q) || '—') + '</b>' + (sig ? ' · después, ' + esc(sig) : '') + '</span>' + rnTg(queda) + '</span></button>';
    }).join('');
  },
  rnPlus: () => Nav.ir('turnoEditar', { quienes: personas().map(p => p.id), rota: 'semana' })
};

/* ===================== AGENDA (JPG 09) ===================== */
P.agenda = {
  raiz: true, rn: true,
  html: (p, e) => {
    const hoy = new Date();
    p.mes = p.mes || isoDia(new Date(hoy.getFullYear(), hoy.getMonth(), 1)); p.dia = p.dia || hoyISO(); p.vista = p.vista || 'mes';
    const m = deISO(p.mes); cargarMes(m);
    const flechasMes = '<span class="rn-mesf"><button class="rn-mesb" data-a="agMes" data-v="-1" aria-label="Mes anterior">' + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>' + '</button><button class="rn-mesb" data-a="agMes" data-v="1" aria-label="Mes siguiente">' + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>' + '</button></span>';
    const cab = rnTitulo(cap(MESES[m.getMonth()]) + flechasMes, { der: rnRb('buscar', 'rnBuscarEn', 'Buscar'), sub: String(m.getFullYear()) }) + rnFiltros([['mes', 'Mes'], ['semana', 'Semana'], ['lista', 'Lista']], p.vista, 'pSet', 'vista');
    if (p.vista !== 'mes') { rnModoViejo(true); try { return cab + rnSinCabecera(P_VIEJO.agenda.html(p, e), true); } catch (x) { return cab; } }
    rnModoViejo(false);
    const ini = new Date(m.getFullYear(), m.getMonth(), 1), n = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(), h0 = hoyISO();
    let cal = LETRAS.map(x => '<span class="rn-cl">' + x + '</span>').join('');
    const antes = diaSemana(ini) - 1, prev = new Date(m.getFullYear(), m.getMonth(), 0).getDate();
    for (let i = antes; i > 0; i--) cal += '<span class="rn-cd2 rn-fuera2">' + (prev - i + 1) + '</span>';
    for (let i = 1; i <= n; i++) {
      const iso = isoDia(new Date(m.getFullYear(), m.getMonth(), i)), hay = eventosDia(iso).length || lista('tareas').some(t => !t.hecho && t.fecha === iso && mias(t));
      cal += '<button class="rn-cd2' + (iso === h0 ? ' rn-hoy' : '') + (iso === p.dia && iso !== h0 ? ' rn-sel' : '') + '" data-a="rnAgDia" data-v="' + iso + '">' + i + (hay ? '<i></i>' : '') + '</button>';
    }
    let o = cab + '<div class="rn-cd rn-gl rn-cal" data-r="cal">' + cal + '</div>';
    const ev = iso => {
      const es = eventosDia(iso).map(x => ({ h: x.todoDia ? 'Todo el día' : hora(new Date(x.inicio)), t: x.titulo, s: [x.lugar, String(x.quien || '').split(',').filter(q => rnPersona(q)).length > 1 ? 'Los dos' : String(x.quien || '').split(',').filter(q => rnPersona(q)).map(q => 'solo ' + nombreDe(q)).join('')].filter(Boolean).join(' · '), k: 'azul', a: 'verEvento', id: x.id, o: x.todoDia ? '00' : hora(new Date(x.inicio)) }));
      const ts = lista('tareas').filter(t => !t.hecho && t.fecha === iso && mias(t)).map(t => ({ h: t.hora || '', t: t.titulo, s: 'Tarea · de ' + (t.para === 'todos' ? 'todos' : nombreDe(t.para)), k: 'lima', a: 'rnVerTarea', id: t.id, o: t.hora || '99' }));
      return es.concat(ts).sort((a, b) => a.o.localeCompare(b.o));
    };
    const fila = x => '<button class="rn-rw rn-ev" data-a="' + x.a + '" data-id="' + esc(x.id) + '"><i class="rn-evb rn-k-' + x.k + '"></i><span class="rn-fat"><span class="rn-t">' + esc(x.t) + '</span>' + (x.s ? '<span class="rn-n">' + esc(x.s) + '</span>' : '') + '</span><span class="rn-hr">' + esc(x.h) + '</span></button>';
    const d1 = p.dia, d2 = isoDia(sumaDias(deISO(p.dia), 1));
    [d1, d2].forEach(iso => { const xs = ev(iso), d = deISO(iso), dif = faltan(iso); const t = (dif === 0 ? 'Hoy, ' : dif === 1 ? 'Mañana, ' : '') + (dif === 0 || dif === 1 ? DIAS[d.getDay()] : cap(DIAS[d.getDay()])) + ' ' + d.getDate(); o += rnCd(rnGrupo(t, String(xs.length)) + (xs.length ? xs.map(fila).join('') : '<div class="rn-rw"><span class="rn-n rn-vacio">Nada este día</span></div>'), 'rn-gr'); });
    if (AG.error) o += '<p class="rn-txt" style="margin:10px 4px">' + esc(AG.error) + '</p>';
    return o;
  },
  montar(el, p) { P.agenda.tras(el, p); },
  tras(el, p) {
    /* Deslizar el mes de lado: mes anterior o siguiente */
    const c = $('[data-r="cal"]', el); if (!c) return;
    let x0 = null;
    c.addEventListener('touchstart', ev => { x0 = ev.touches[0].clientX; }, { passive: true });
    c.addEventListener('touchend', ev => { if (x0 === null) return; const dx = ev.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 60) { const m = deISO(p.mes); m.setMonth(m.getMonth() + (dx < 0 ? 1 : -1)); p.mes = isoDia(m); p.dia = m.getMonth() === new Date().getMonth() && m.getFullYear() === new Date().getFullYear() ? hoyISO() : p.mes; Nav.refrescar(true); } });
  },
  rnPlus: () => { const p = Nav.actual().params; Nav.ir('evento', { fecha: p.dia || hoyISO(), quien: [S.cfg.persona], tipo: 'recordatorio', aviso: '' }); }
};
ACC.rnAgDia = el => { const p = Nav.actual().params; p.dia = el.dataset.v; Nav.refrescar(true); };

/* ===================== GASTOS (JPG 10) ===================== */
P.gastos = {
  raiz: true, rn: true,
  html: (p, e) => {
    p.t = p.t || 'cuentas';
    const cab = rnTitulo('Gastos', { der: rnRb('grafico-de-barras', 'rnEstad', 'Estadísticas') }) + rnFiltros([['cuentas', 'Cuentas'], ['fijos', 'Gastos fijos'], ['resumen', 'Resumen']], p.t, 'pSet', 't');
    if (p.t === 'fijos') { rnModoViejo(true); const q = Object.assign({}, p, { modo: 'fijos' }); return cab + rnSinCabecera(P_VIEJO.gastos.html(q, e), true); }
    if (p.t === 'resumen') { rnModoViejo(true); return cab + rnSinCabecera(P.resumenFijos.html(p, e), true); }
    rnModoViejo(false);
    const cs = cuentasAbiertas();
    if (!cs.length) return cab + '<div class="rn-vac">' + rnIlu('sin-gastos') + '<h2>Sin cuentas</h2><p class="rn-txt">Una cuenta para el mes, un viaje o las cenas: quién paga y quién debe.</p></div>';
    const c = cs.find(x => !x.saldada) || cs[0], ps = c.participantes || [];
    const movs = lista('movs').filter(m => m.cuenta === c.id && m.tipo !== 'transferencia');
    const tot = movs.reduce((a, m) => a + (Number(m.importe) || 0), 0);
    const pag = ps.map((x, i) => [x, movs.filter(m => m.pagadoPor === x.id).reduce((a, m) => a + (Number(m.importe) || 0), 0), i]);
    const r = reembolsos(saldosDe(c.id))[0];
    const kp = x => { const pp = x && x.persona && rnPersona(x.persona); return pp ? rnKPer(pp) : 'azul'; };
    let o = cab + rnCd('<div class="rn-gc"><span class="rn-gct">' + (c.emoji ? esc(c.emoji) + ' ' : '') + esc(c.nombre) + '</span>' + rnTg(c.saldada ? 'Saldada' : 'Abierta', 'rosa') + '</div><div class="rn-num rn-gtot">' + euros(tot) + '</div><p class="rn-s rn-gsub">en ' + movs.length + (movs.length === 1 ? ' gasto' : ' gastos') + ' este mes</p>' +
      '<div class="rn-b2">' + pag.map(x => '<i class="rn-k-' + kp(x[0]) + '" style="flex:' + Math.max(0.5, x[1]) + '"></i>').join('') + '</div><div class="rn-s rn-gpg">' + pag.map((x, i) => '<span>' + (i === 0 ? esc(x[0].nombre) + ' ha pagado ' : esc(x[0].nombre) + ' ') + euros(x[1]) + '</span>').join('') + '</div>' +
      (r ? '<button class="rn-saldo" data-a="ir" data-id="cuenta" data-cid="' + c.id + '">' + rnAv(rnPersona((ps.find(q => q.id === r.de) || {}).persona), 28) + '<span class="rn-t rn-b" style="flex:1">' + esc(partNombre(c, r.de)) + ' le debe a ' + esc(partNombre(c, r.a)) + ' ' + euros(r.importe) + '</span><b class="rn-sal">Saldar</b></button>' : '<p class="rn-s" style="margin:12px 2px 4px">Estáis en paz</p>') + '<div style="height:12px"></div>', 'rn-k-rosa');
    const ult = movs.slice().sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.creado || 0) - (a.creado || 0)).slice(0, 5);
    o += rnCd(rnGrupo('Últimos gastos', String(movs.length)) + (ult.length ? ult.map(m => { const pp = ps.find(x => x.id === m.pagadoPor) || {}; const rep = m.reparto && m.reparto.quienes && m.reparto.quienes.length === 1 ? 'solo ' + partNombre(c, m.reparto.quienes[0]) : 'a medias'; return '<button class="rn-rw" data-a="verMov" data-id="' + m.id + '">' + (rnPersona(pp.persona) ? rnAv(rnPersona(pp.persona), 30) : '') + '<span class="rn-fat"><span class="rn-t">' + esc(m.concepto || 'Gasto') + '</span><span class="rn-n">' + rnDiaCorto(m.fecha) + ' · ' + rep + '</span></span><span class="rn-hr">' + euros(m.importe) + '</span></button>'; }).join('') : '<div class="rn-rw"><span class="rn-n rn-vacio">Sin gastos todavía</span></div>'), 'rn-gr rn-k-rosa');
    const otras = lista('cuentas').filter(x => x.id !== c.id);
    if (otras.length) o += rnCd(rnGrupo('Otras cuentas', String(otras.length)) + otras.map(x => { const t = lista('movs').filter(m => m.cuenta === x.id && m.tipo !== 'transferencia').reduce((a, m) => a + (Number(m.importe) || 0), 0); return '<button class="rn-rw" data-a="ir" data-id="cuenta" data-cid="' + x.id + '"><span class="rn-fat"><span class="rn-t">' + (x.emoji ? esc(x.emoji) + ' ' : '') + esc(x.nombre) + '</span><span class="rn-n">' + (x.archivada ? 'Archivada' : x.saldada ? 'Saldada' : 'Abierta') + ' · ' + euros(t) + '</span></span>' + rnFle + '</button>'; }).join(''), 'rn-gr rn-k-rosa');
    return o;
  },
  rnPlus: () => { const p = Nav.actual().params; if (p.t === 'fijos' || p.t === 'resumen') return Nav.ir('fijo', { categoria: 'luz', cada: 'mes', quien: 'mitad' }); const c = cuentasAbiertas()[0]; if (!c) return Nav.ir('cuentaEditar', {}); const yoP = (c.participantes || []).find(x => x.persona === S.cfg.persona); Nav.ir('mov', { cid: c.id, pagadoPor: yoP ? yoP.id : (c.participantes || [])[0].id }); }
};
ACC.rnEstad = () => { const c = cuentasAbiertas()[0]; Nav.ir('estadisticas', c ? { cid: c.id } : {}); };

/* ===================== PLANTAS (JPG 11) y MEDICACIÓN (JPG 13) ===================== */
P.plantas = {
  raiz: true, rn: true,
  html: () => {
    const l = ordenAgua(lista('plantas')), hoy = l.filter(x => tocaHoy('plantas', x)), resto = l.filter(x => !tocaHoy('plantas', x));
    let h = rnTitulo('Plantas', { sub: l.length + (l.length === 1 ? ' planta' : ' plantas') + ' · ' + hoy.length + ' para hoy' });
    if (!l.length) return h + '<div class="rn-vac">' + rnIlu('il-plantas') + '<h2>Sin plantas</h2><p class="rn-txt">Apunta cada cuánto se riegan y Ronda os avisa.</p></div>';
    const col = x => { const n = faltan(x.proximo), t = tocaHoy('plantas', x); return '<button class="rn-plc" data-a="rutVer" data-col="plantas" data-id="' + x.id + '">' + rnEmo(x.emoji, 'modulo-plantas', 40) + '<span class="rn-pn">' + esc(x.nombre) + '</span><span class="rn-agua rn-agua2' + (t ? ' rn-toca' : '') + '"><i style="height:' + Math.round(100 * nivelAgua(x)) + '%"></i></span><span class="rn-s' + (t ? ' rn-rojo' : '') + '">' + (t ? 'Hoy' : n === 1 ? 'Mañana' : n + ' días') + '</span></button>'; };
    const fila = (x, boton) => '<div class="rn-rw rn-plr">' + rnEmo(x.emoji, 'modulo-plantas', 40) + '<button class="rn-rwt" data-a="rutVer" data-col="plantas" data-id="' + x.id + '"><span class="rn-t rn-b">' + esc(x.nombre) + '</span><span class="rn-n">' + (boton ? textoCada(x.cada || 1, x) + (x.ultimaPor ? ' · la última, ' + esc(nombreDe(x.ultimaPor)) : '') : cap(rnDiaTexto(x.proximo, true)) + ' · ' + textoCada(x.cada || 1, x).toLowerCase()) + '</span></button>' + (boton ? '<button class="rn-tgb" data-a="rutHecho" data-col="plantas" data-id="' + x.id + '">Regada</button>' : '') + '</div>';
    h += rnCd(rnGrupo('Cuánta agua les queda', '') .replace('</div>', (hoy.length ? '<span class="rn-chd rn-rojo">' + hoy.length + ' toca' + (hoy.length > 1 ? 'n' : '') + ' hoy</span>' : '') + '</div>') + '<div class="rn-plw">' + l.slice(0, 5).map(col).join('') + '</div>', 'rn-k-verde rn-pltop');
    if (hoy.length) h += rnCd(rnGrupo('Hoy', String(hoy.length)) + hoy.map(x => fila(x, 1)).join(''), 'rn-gr rn-k-verde');
    if (resto.length) h += rnCd(rnGrupo('Próximos días', String(resto.length)) + resto.map(x => fila(x)).join(''), 'rn-gr rn-k-verde');
    return h;
  },
  rnPlus: () => ACC.rutNueva({ dataset: { col: 'plantas' } })
};
P.medicacion = {
  raiz: true, rn: true,
  html: () => {
    const l = lista('medicacion'), con = l.filter(x => conRecuerdo('medicacion', x));
    const hoyL = con.filter(x => tocaHoy('medicacion', x) || (x.ultima && isoDia(new Date(x.ultima)) === hoyISO())).sort((a, b) => (a.hora || '99').localeCompare(b.hora || '99'));
    const hechas = hoyL.filter(x => !tocaHoy('medicacion', x)).length;
    let h = rnTitulo('Medicación', { sub: hoyL.length + (hoyL.length === 1 ? ' toma hoy' : ' tomas hoy') + ' · ' + hechas + (hechas === 1 ? ' hecha' : ' hechas') });
    if (!l.length) return h + '<div class="rn-vac">' + rnIlu('il-medicacion') + '<h2>Sin medicación</h2><p class="rn-txt">Las tomas de cada día y lo que queda en casa.</p></div>';
    h += rnCd('<div class="rn-wtop">' + rnAro(hechas, hoyL.length, 56, 8) + '<div class="rn-wnum" style="flex:1"><b class="rn-num">' + hechas + ' de ' + hoyL.length + '</b><span>tomas de hoy</span></div>' + rnChip('modulo-medicacion', 34) + '</div>' +
      hoyL.map(x => { const ya = !tocaHoy('medicacion', x); return '<div class="rn-rw rn-it' + (ya ? ' rn-dn' : '') + '"><button class="rn-ck' + (ya ? ' rn-on' : '') + '" data-a="' + (ya ? 'rnYaTomada' : 'rutHecho') + '" data-col="medicacion" data-id="' + x.id + '">' + rnTick + '</button><button class="rn-rwt" data-a="rutVer" data-col="medicacion" data-id="' + x.id + '"><span class="rn-t">' + esc(x.nombre) + '</span>' + (x.dosis ? '<span class="rn-n">' + esc(x.dosis) + '</span>' : '') + '</button><span class="rn-hr">' + esc(x.hora || '') + '</span></div>'; }).join(''), 'rn-k-verde');
    h += rnCd(rnGrupo('Lo que hay en casa', String(l.length)) + l.map(x => { const st = x.stock; const sub = [st !== undefined && st !== '' ? 'Quedan ' + st + (conRecuerdo('medicacion', x) && x.cada ? ' · para ' + Math.floor(st / (1 / (x.cada || 1))) + ' días' : '') : '', !conRecuerdo('medicacion', x) && x.dosis ? x.dosis : ''].filter(Boolean).join(' · '); return rnFila('modulo-medicacion', esc(x.nombre), esc(sub), st !== undefined && st !== '' ? rnTg(st < 10 ? 'Pocas' : 'Bien', st < 10 ? 'coral' : 'verde') : rnFle, 'data-a="rutVer" data-col="medicacion" data-id="' + x.id + '"'); }).join(''), 'rn-gr rn-k-verde');
    return h;
  },
  rnPlus: () => ACC.rutNueva({ dataset: { col: 'medicacion' } })
};
ACC.rnYaTomada = () => toast('Ya está marcada como tomada hoy.');

/* ===================== ACUARIO (JPG 12) ===================== */
P.acuario = {
  raiz: true, rn: true,
  html: (p, e) => {
    p.tab = p.tab || 'cuidados';
    const aj = dato('ajustes', 'acuario') || {};
    const cab = rnTitulo('Acuario', { der: rnRb('grafica-linea', 'ir', 'Gráficas', ' data-id="acGraficas"'), sub: [aj.litros ? aj.litros + ' litros' : '', aj.tipo || ''].filter(Boolean).join(' · ') || 'Cuidados y medidas' }) + rnFiltros([['cuidados', 'Cuidados'], ['medidas', 'Medidas'], ['calendario', 'Calendario']], p.tab, 'pSet', 'tab');
    if (p.tab !== 'cuidados') { rnModoViejo(true); return cab + rnSinCabecera(P_VIEJO.acuario.html(p, e), true); }
    rnModoViejo(false);
    const ms = medidasOrden(), ult = ms[ms.length - 1];
    const par = (k, n, u) => { const vs = ms.map(m => valorDe(m, k)).filter(v => v !== null).slice(-7); if (!vs.length) return ''; const mx = Math.max(...vs), mn = Math.min(...vs), r = mx - mn || 1; const pts = vs.map((v, i) => (vs.length === 1 ? 45 : i * 90 / (vs.length - 1)).toFixed(1) + ',' + (19 - (v - mn) / r * 16).toFixed(1)).join(' '); return '<button class="rn-par" data-a="ir" data-id="acGraficas"><span class="rn-s" style="margin:0">' + n + '</span><b class="rn-num">' + String(vs[vs.length - 1]).replace('.', ',') + (u ? '<small> ' + u + '</small>' : '') + '</b><svg viewBox="0 0 90 22" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + pts + '" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'; };
    let h = cab + (ult ? '<div class="rn-pars">' + par('temp', 'Temperatura', '°C') + par('ph', 'pH', '') + par('nitrato', 'Nitratos', 'mg/l') + '</div>' : '');
    const l = lista('acuario').sort((a, b) => (a.proximo || '9').localeCompare(b.proximo || '9') || (a.hora || '99').localeCompare(b.hora || '99'));
    const hoyL = l.filter(x => tocaHoy('acuario', x) || (x.ultima && isoDia(new Date(x.ultima)) === hoyISO()));
    const sem = l.filter(x => hoyL.indexOf(x) < 0 && x.proximo && faltan(x.proximo) < 7);
    const fila = x => { const ya = !tocaHoy('acuario', x) && x.ultima && isoDia(new Date(x.ultima)) === hoyISO(); return '<div class="rn-rw rn-it' + (ya ? ' rn-dn' : '') + '"><button class="rn-ck' + (ya ? ' rn-on' : '') + '" data-a="' + (ya ? 'rnYaTomada' : 'rutHecho') + '" data-col="acuario" data-id="' + x.id + '">' + rnTick + '</button><button class="rn-rwt" data-a="rutVer" data-col="acuario" data-id="' + x.id + '"><span class="rn-t">' + esc(x.nombre) + '</span><span class="rn-n">' + (ya && x.ultimaPor ? 'Hecho · ' + esc(nombreDe(x.ultimaPor)) : cap(rnDiaTexto(x.proximo, true))) + '</span></button><span class="rn-hr">' + esc(x.hora || '') + '</span></div>'; };
    if (hoyL.length) h += rnCd(rnGrupo('Hoy', hoyL.filter(x => !tocaHoy('acuario', x)).length + ' de ' + hoyL.length) + hoyL.map(fila).join(''), 'rn-gr rn-k-turquesa');
    if (sem.length) h += rnCd(rnGrupo('Esta semana', String(sem.length)) + sem.map(fila).join(''), 'rn-gr rn-k-turquesa');
    if (!l.length) h += '<div class="rn-vac">' + rnIlu('il-acuario') + '<h2>Sin cuidados</h2><p class="rn-txt">Dar de comer, cambiar el agua, limpiar el filtro…</p></div>';
    return h;
  },
  rnPlus: () => { const p = Nav.actual().params; if (p.tab === 'medidas' || p.tab === 'calendario') { const f = $('.fab', Nav.actual().el); if (f) return f.click(); } ACC.rutNueva({ dataset: { col: 'acuario' } }); }
};

/* ===================== COCHES (JPG 14) ===================== */
P.coche = {
  raiz: true, rn: true,
  html: () => {
    const cs = coches(), fs = lista('coche').filter(x => x.fecha).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const esteMes = fs.filter(x => x.fecha.slice(0, 7) === hoyISO().slice(0, 7)).length;
    let h = rnTitulo('Coches', { sub: cs.length + (cs.length === 1 ? ' coche' : ' coches') + ' · ' + esteMes + (esteMes === 1 ? ' fecha este mes' : ' fechas este mes') });
    if (!cs.length) return h + '<div class="rn-vac">' + rnIlu('il-coches') + '<h2>Sin coches</h2><p class="rn-txt">La ITV, el seguro y el impuesto, con aviso.</p></div>';
    cs.forEach(c => {
      h += rnCd('<button class="rn-cch" data-a="verCoche" data-id="' + c.id + '">' + rnChip('modulo-coche', 44) + '<span class="rn-fat"><span class="rn-t rn-b rn-g">' + esc(c.nombre) + '</span><span class="rn-n">' + [c.matricula, c.combustible, c.anio].filter(Boolean).map(esc).join(' · ') + '</span></span></button>' +
        '<div class="rn-gq rn-gq2"><div class="rn-fld"><small>Kilómetros</small><b>' + esc(c.km || '—') + '</b></div><div class="rn-fld"><small>Último repostaje</small><b>' + esc(c.repostaje || 'Hace 9 días') + '</b></div></div>', 'rn-k-azul');
      const vs = vencimientos(c.id).filter(x => x.fecha);
      if (vs.length) h += rnCd(rnGrupo('Próximas fechas', String(vs.length)) + vs.map(x => { const n = faltan(x.fecha); return rnFila(icoVenc(x.nombre), esc(x.nombre), [n === 1 ? 'Mañana' : '', x.anios ? 'Cada ' + (x.anios === 1 ? 'año' : x.anios + ' años') : '', x.notas].filter(Boolean).map(esc).join(' · ') || (n === null ? '' : cap(textoFaltan(n))), rnTg(rnFechaTag(x.fecha), n !== null && n <= 7 ? 'coral' : 'azul'), 'data-a="cocheFechaVer" data-id="' + x.id + '"'); }).join(''), 'rn-gr rn-k-azul');
    });
    const docs = lista('documentos').filter(d => d.carpeta === 'coche');
    h += rnCd(rnGrupo(cs.length > 1 ? 'Papeles de los coches' : 'Papeles del coche', String(docs.length)) + '<button class="rn-rw" data-a="docCarpeta" data-v="coche"><span class="rn-t" style="flex:1">' + (docs.length ? docs.slice(0, 3).map(d => esc(d.nombre)).join(', ') + (docs.length > 3 ? '…' : '') : 'Permiso de circulación, ficha técnica, póliza…') + '</span>' + rnFle + '</button>', 'rn-gr rn-k-azul');
    return h;
  },
  rnPlus: () => { const c = coches()[0]; if (!c) return ACC.nuevoCoche(); Nav.ir('cocheFecha', { coche: c.id }); }
};

/* ===================== DOCUMENTOS (JPG 15) ===================== */
P.documentos = {
  raiz: true, rn: true,
  html: () => {
    const ds = lista('documentos'), cs = CARPETAS.map(c => [c, ds.filter(d => d.carpeta === c[0]).length]);
    const conDocs = cs.filter(x => x[1]);
    let h = rnTitulo('Documentos', { der: rnRb('buscar', 'rnBuscarEn', 'Buscar'), sub: ds.length + (ds.length === 1 ? ' archivo' : ' archivos') + (conDocs.length ? ' en ' + conDocs.length + (conDocs.length === 1 ? ' carpeta' : ' carpetas') : '') });
    h += '<button class="rn-cd rn-gl rn-lock" data-a="' + (docsActivos() ? (DOC.clave ? 'cerrarDocs' : 'rnDocsAbrir') : 'ir" data-id="docClave') + '">' + rnChip('candado', 34) + '<span class="rn-fat"><span class="rn-t rn-b">Cifrados en el móvil</span><span class="rn-n">' + (!docsActivos() ? 'Toca para activarlos con vuestro código de 4 cifras' : DOC.clave ? 'Abiertos · se cierran solos a los 5 minutos' : 'Se abren con vuestro código de 4 cifras') + '</span></span></button>';
    if (!docsActivos()) return h + '<div class="rn-vac">' + rnIlu('sin-documentos') + '<h2>Documentos a salvo</h2><p class="rn-txt">DNI, seguros, garantías… cifrados antes de salir del móvil.</p><button class="rn-btnp rn-btnc" data-a="ir" data-id="docClave">Activar los documentos</button></div>';
    const vis = (conDocs.length ? conDocs : cs).slice(0, conDocs.length > 4 ? conDocs.length : 4);
    h += '<div class="rn-fold">' + vis.map(x => '<button class="rn-cd rn-gl rn-fd" data-a="docCarpeta" data-v="' + x[0][0] + '"><span class="rn-fdt">' + rnChip('carpeta', 30) + '<b class="rn-num">' + x[1] + '</b></span><span class="rn-t rn-b">' + esc(x[0][1]) + '</span></button>').join('') + '</div>';
    const ult = ds.slice().sort((a, b) => (b.creado || 0) - (a.creado || 0)).slice(0, 5);
    if (ult.length) h += rnCd(rnGrupo('Últimos añadidos', String(ult.length)) + ult.map(d => { const c = CARPETAS.find(x => x[0] === d.carpeta) || CARPETAS[0]; return rnFila('documento', esc(d.nombre), esc(c[1]) + (d.vence ? ' · caduca ' + rnDiaTexto(d.vence, true) : ''), undefined, 'data-a="docAbrir" data-id="' + d.id + '"'); }).join(''), 'rn-gr rn-k-lavanda');
    return h;
  },
  rnPlus: () => ACC.docNuevo({ dataset: {} })
};

/* ===================== NOTAS (JPG 16) ===================== */
const RN_NOTACOL = { '#F0674B': 'coral', '#F2B824': 'amarillo', '#A6C93A': 'lima', '#2E8B57': 'verde', '#2BB5B0': 'turquesa', '#3C78C8': 'azul', '#9B86E0': 'lavanda', '#EE8AA8': 'rosa' };
P.notas = {
  raiz: true, rn: true,
  html: p => {
    const f = p.f || 'todas', yoId = S.cfg.persona, otros = personas().filter(x => x.id !== yoId);
    let l = lista('notas').filter(n => n.titulo || n.texto || n.html).sort((a, b) => (b.fijada ? 1 : 0) - (a.fijada ? 1 : 0) || (b.editada || 0) - (a.editada || 0));
    const total = l.length;
    if (f === 'mias') l = l.filter(n => n.por === yoId); else if (f === 'fijadas') l = l.filter(n => n.fijada); else if (f !== 'todas') l = l.filter(n => n.por === f);
    const tarjeta = n => { const k = RN_NOTACOL[String(colorNota(n) || '').toUpperCase()] || 'lavanda'; const d = n.editada ? isoDia(new Date(n.editada)) : ''; const cuando2 = d === hoyISO() ? 'Hoy' : d === isoDia(sumaDias(hoy0(), -1)) ? 'Ayer' : d ? deISO(d).getDate() + ' ' + MESES[deISO(d).getMonth()].slice(0, 3) : ''; return '<button class="rn-nt rn-k-' + k + (colorNota(n) ? '' : ' rn-nt-blanca') + '" data-a="verNota" data-lp="notaMenu" data-id="' + n.id + '"><b>' + (n.fijada ? '<i class="rn-fij" aria-label="Fijada">' + rnIc('etiqueta', 13, 2.3) + '</i>' : '') + (n.emoji ? esc(n.emoji) + ' ' : '') + esc(n.titulo || 'Nota') + '</b><span class="rn-ntx">' + esc((n.texto || '').slice(0, 160)) + '</span><span class="rn-s rn-ntp">' + [cuando2, nombreDe(n.por)].filter(Boolean).map(esc).join(' · ') + '</span></button>'; };
    const c1 = l.filter((x, i) => i % 2 === 0), c2 = l.filter((x, i) => i % 2 === 1);
    return rnTitulo('Notas', { der: rnRb('buscar', 'rnBuscarEn', 'Buscar'), sub: total + (total === 1 ? ' nota' : ' notas') }) +
      rnFiltros([['todas', 'Todas'], ['mias', 'Mías']].concat(otros.map(o => [o.id, 'De ' + o.nombre])).concat([['fijadas', 'Fijadas']]), f) +
      (l.length ? '<div class="rn-ng"><div>' + c1.map(tarjeta).join('') + '</div><div>' + c2.map(tarjeta).join('') + '</div></div>' : '<div class="rn-vac">' + rnIlu('sin-documentos') + '<h2>Sin notas</h2><p class="rn-txt">El wifi, el teléfono del fontanero, ideas para el viaje…</p></div>');
  },
  rnPlus: () => ACC.aNota()
};

/* ===================== FEEDBACK (JPG 18) ===================== */
P.feedback = {
  raiz: true, rn: true,
  html: p => {
    const f = p.f || 'p', todas = lista('feedback'), pend = todas.filter(x => x.estado !== 'h').length;
    const l = todas.filter(x => f === 't' || (f === 'h' ? x.estado === 'h' : x.estado !== 'h')).sort((a, b) => (b.creado || 0) - (a.creado || 0));
    const secK = s => (RN_SEC[s] || RN_SEC[s === 'coches' ? 'coche' : s === 'listas' ? 'listasr' : ''] || [cap(s || 'General'), '', 'neutro'])[2];
    const secN = s => (RN_SEC[s] ? RN_SEC[s][0].split(' ')[0] : cap(s || 'General'));
    return rnTitulo('Feedback', { der: todas.length ? rnRb('descargar', 'fbExportar', 'Exportar') : '', sub: pend + (pend === 1 ? ' pendiente' : ' pendientes') + ' · ' + (todas.length - pend) + (todas.length - pend === 1 ? ' hecha' : ' hechas') }) +
      rnFiltros([['p', 'Pendientes'], ['h', 'Hechas'], ['t', 'Todas']], f) +
      (l.length ? l.map(x => { const d = x.creado ? isoDia(new Date(x.creado)) : ''; const fe = d === hoyISO() ? 'Hoy' : d === isoDia(sumaDias(hoy0(), -1)) ? 'Ayer' : d ? deISO(d).getDate() + ' ' + MESES[deISO(d).getMonth()].slice(0, 3) : ''; const adj = (x.adj || []); const nf = adj.filter(a => /image/.test(a.tipo || '')).length, nv = adj.filter(a => /video/.test(a.tipo || '')).length; return '<button class="rn-cd rn-gl rn-fb' + (x.estado === 'h' ? ' rn-dn' : '') + '" data-a="fbVer" data-id="' + x.id + '"><span class="rn-fbt">' + esc(x.texto || '') + '</span><span class="rn-fbp">' + rnTg(secN(x.sec), secK(x.sec)) + (nf ? rnTg(nf + (nf === 1 ? ' captura' : ' capturas')) : '') + (nv ? rnTg(nv + (nv === 1 ? ' vídeo' : ' vídeos')) : '') + '<span class="rn-s" style="margin:0 0 0 auto">' + fe + '</span>' + rnAv(rnPersona(x.por), 24) + '</span></button>'; }).join('')
        : '<div class="rn-vac">' + rnIlu('todo-hecho') + '<h2>' + (f === 'h' ? 'Nada hecho aún' : 'Nada pendiente') + '</h2><p class="rn-txt">Lo que veáis que falla o falta en Ronda.</p></div>');
  },
  rnPlus: () => ACC.fbNueva()
};


/* ===================== «+» de Inicio: hoja «Añadir» (aprobada en JPG) ===================== */
const RN_ANADIR = [['Tarea', 'modulo-tareas', 'lima', () => rnNuevaTarea({})], ['Producto', 'modulo-compra', 'amarillo', () => ACC.aProducto()], ['Gasto', 'modulo-gastos', 'rosa', () => P.gastos.rnPlus.call(null)], ['Evento', 'modulo-calendario', 'azul', () => ACC.aEvento()], ['Nota', 'modulo-notas', 'lavanda', () => ACC.aNota()], ['Documento', 'modulo-documentos', 'lavanda', () => ACC.docNuevo({ dataset: {} })]];
P.inicio.rnPlus = () => abrirHoja(rnCabHoja('Añadir') + '<div class="rn-secs rn-secs3">' + RN_ANADIR.map((x, i) => '<button class="rn-sc rn-k-' + x[2] + '" data-a="rnAnadirY" data-i="' + i + '">' + rnChip(x[1], 44) + '<span>' + x[0] + '</span></button>').join('') + '</div>', { clase: 'rn-hj-sec' });
ACC.rnAnadirY = el => { const f = RN_ANADIR[+el.dataset.i][3]; cerrarHoja(); setTimeout(() => { if (Nav.pila[0].id === 'gastos' || RN_ANADIR[+el.dataset.i][0] !== 'Gasto') f(); else { const c = cuentasAbiertas()[0]; if (!c) return Nav.ir('cuentaEditar', {}); const yoP = (c.participantes || []).find(x => x.persona === S.cfg.persona); Nav.ir('mov', { cid: c.id, pagadoPor: yoP ? yoP.id : (c.participantes || [])[0].id }); } }, 320); };
