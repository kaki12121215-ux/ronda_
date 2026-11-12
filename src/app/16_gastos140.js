/* ============================ 1.4.0 · GASTOS ============================
   Cuentas archivadas, abrir la última cuenta, pagos con tarjeta (automáticos o por confirmar) y tarjetas conectadas. */

const CAT_COMERCIO = [
  ['supermercado', /mercadona|carrefour|eroski|lidl|\bdia\b|aldi|alcampo|caprabo|simply|hipercor|consum|ahorramas|supermerc|super\b|bm\b|froiz|gadis|condis|spar|uvesco|frutas|panader|carnicer/i],
  ['restaurantes', /\bbar\b|restaur|cafe|cafeter|burger|mcdonald|telepizza|kfc|vips|starbucks|taberna|pizzer|sushi|kebab|asador|sidrer|txoko|cervecer|goiko|foster|domino|glovo|just eat|uber eats/i],
  ['transporte', /repsol|cepsa|\bbp\b|galp|shell|gasolin|petrol|renfe|alsa|uber|cabify|taxi|parking|aparcam|\bbus\b|metro|autopista|peaje|bolt|ryanair|vueling|iberia/i],
  ['salud', /farmac|clinic|dental|optic|hospital|medic|fisio|veterin/i],
  ['compras', /amazon|zara|decathlon|ikea|primark|leroy|media ?markt|fnac|corte ingl|h&m|mango|pull|bershka|action|bazar|tiger|apple|aliexpress/i],
  ['entretenimiento', /cine|netflix|spotify|teatro|museo|hbo|disney|prime video|steam|playstation|nintendo|concierto|entradas/i],
  ['alojamiento', /hotel|airbnb|booking|hostal|apartament|parador/i]
];
const categoriaComercio = n => (CAT_COMERCIO.find(x => x[1].test(String(n || ''))) || ['otro'])[0];
const cuentasAbiertas = () => lista('cuentas').filter(c => !c.archivada).sort((a, b) => (b.creada || 0) - (a.creada || 0));
const ultimaCuenta = () => { let id = ''; try { id = localStorage.getItem('rondaP-ultcuenta') || ''; } catch (e) { } const c = dato('cuentas', id); return c && !c.archivada ? c : null; };
const pagosPend = () => lista('pagos').filter(x => x.estado !== 'ok').sort((a, b) => (b.creado || 0) - (a.creado || 0));
const sqCuenta = c => emo(c.emoji, sq('dividir-cuentas', COL.indexOf(c.color) >= 0 ? COL.indexOf(c.color) : 4), 44);

/* ---------- Lista de cuentas: por confirmar arriba, abiertas, archivadas plegadas ---------- */
htmlCuentas = function () {
  const l = cuentasAbiertas(), arch = lista('cuentas').filter(c => c.archivada), pend = pagosPend(), ult = ultimaCuenta();
  let h = '';
  if (pend.length) h += '<button class="pend" data-a="ir" data-id="pagos">' + ic('tarjeta', 26, 7) + '<div class="f"><b>Pagos por confirmar</b><small>' + pend.length + (pend.length === 1 ? ' pago con tarjeta esperando' : ' pagos con tarjeta esperando') + '</small></div><span class="bdg">' + pend.length + '</span></button>';
  if (!l.length && !arch.length) return h + vacio('primer-gasto-compartido', 'Sin cuentas', 'Crea una para un viaje o una cena con el botón +.');
  if (l.length) h += '<h3>Abiertas</h3><div class="card grp">' + l.map(c => {
    const tot = lista('movs').filter(m => m.cuenta === c.id && m.tipo !== 'transferencia').reduce((a, m) => a + (Number(m.importe) || 0), 0);
    const s = saldosDe(c.id), mio = (c.participantes || []).find(x => x.persona === S.cfg.persona), sm = mio ? s[mio.id] || 0 : 0;
    return '<button class="row" data-a="ir" data-id="cuenta" data-cid="' + c.id + '" data-lp="cuentaLP">' + sqCuenta(c) + '<div class="f"><b>' + esc(c.nombre) + '</b><small>' + (mio ? (sm > 0.004 ? 'Te deben ' + euros(sm) : sm < -0.004 ? 'Debes ' + euros(-sm) : 'Al día') : (c.participantes || []).length + ' personas') + ' · total ' + euros(tot) + '</small></div>' + (ult && ult.id === c.id ? '<span class="tg">Última</span>' : '') + chev + '</button>';
  }).join('') + '</div>';
  if (arch.length) h += '<button class="row card" data-a="ir" data-id="archivadas" style="margin-top:12px">' + ic('archivar', 22, 6) + '<b style="flex:1">Archivadas</b><small class="k">' + arch.length + '</small>' + chev + '</button>';
  h += '<p class="cap">Mantén el dedo en una cuenta para archivarla.</p>';
  return h;
};
ACC.cuentaLP = el => { const c = dato('cuentas', el.dataset.cid); if (!c) return; ACC.menuCuenta({ dataset: { id: c.id } }); };

P.archivadas = {
  html: () => {
    const l = lista('cuentas').filter(c => c.archivada).sort((a, b) => (b.creada || 0) - (a.creada || 0));
    if (!l.length) return tope('Archivadas') + '<p class="texto">No hay cuentas archivadas.</p>';
    return tope('Archivadas') + '<p class="texto">Se pueden abrir para consultar. «Recuperar» la devuelve a las abiertas.</p><div class="card grp" style="margin-top:10px">' + l.map(c => {
      const tot = lista('movs').filter(m => m.cuenta === c.id && m.tipo !== 'transferencia').reduce((a, m) => a + (Number(m.importe) || 0), 0);
      const pz = !reembolsos(saldosDe(c.id)).length;
      return '<div class="row"><button class="f rowb" data-a="ir" data-id="cuenta" data-cid="' + c.id + '">' + sqCuenta(c) + '<span class="f"><b>' + esc(c.nombre) + '</b><small>' + (pz ? 'Saldada' : 'Con saldos pendientes') + ' · ' + euros(tot) + '</small></span></button><button class="mini" data-a="recuperarCuenta" data-id="' + c.id + '">Recuperar</button></div>';
    }).join('') + '</div>';
  }
};
ACC.recuperarCuenta = el => { cambiar('cuentas', el.dataset.id, { archivada: false }); Nav.refrescar(true); toast('Cuenta recuperada'); };

/* ---------- Al tocar Gastos se abre la última cuenta usada ---------- */
function abrirUltimaCuenta() {
  if (!ajGastos().cuentas) return;
  const c = ultimaCuenta() || null; if (!c) return;
  const e = Nav.pila[0]; if (!e || e.id !== 'gastos') return;
  e.params.modo = 'cuentas';
  Nav.refrescar(true);
  Nav.ir('cuenta', { cid: c.id });
}
const _raiz140 = ACC.raiz;
ACC.raiz = el => { const ya = Nav.pila.length === 1 && Nav.actual() && Nav.actual().id === el.dataset.id; _raiz140(el); if (!ya && el.dataset.id === 'gastos') setTimeout(abrirUltimaCuenta, 30); };
const _abrirMod140 = ACC.abrirMod;
ACC.abrirMod = el => { _abrirMod140(el); if (el.dataset.id === 'gastos' && barraMia().indexOf('gastos') >= 0) setTimeout(abrirUltimaCuenta, 30); };

/* ---------- Pagos por confirmar ---------- */
P.pagos = {
  html: () => {
    const l = pagosPend();
    let h = tope('Pagos por confirmar');
    if (!l.length) return h + vacio('todo-hecho', 'Nada por confirmar', 'Los pagos de las tarjetas en modo «Por confirmar» esperan aquí.');
    return h + '<div class="list">' + l.map(x => {
      const t = dato('tarjetas', x.tarjeta) || {};
      return '<div class="card pc"><div class="cr1">' + emo(t.emoji, sq('tarjeta', 7), 44) + '<div class="f"><b>' + esc(x.comercio || 'Pago con tarjeta') + '</b><small>' + cuando(x.fecha || hoyISO(), x.hora).replace(/^Atrasada · /, '') + ' · ' + esc(t.nombre || x.tarjetaNom || 'Tarjeta') + (t.dueno ? ' · ' + esc(nombreDe(t.dueno)) : '') + '</small></div><b class="amt2">' + euros(x.importe) + '</b></div>' +
        '<div class="btns2"><button class="btn sec" data-a="pagoDescartar" data-id="' + x.id + '">Descartar</button><button class="btn pri" data-a="pagoAnadir" data-id="' + x.id + '" style="flex:1.4">Añadir a una cuenta</button></div></div>';
    }).join('') + '</div>';
  }
};
ACC.pagoDescartar = el => { const id = el.dataset.id; cambiar('pagos', id, { estado: 'ok', descartado: true }); Nav.refrescar(true); toast('Descartado', 'Deshacer', () => { cambiar('pagos', id, { estado: 'pend', descartado: false }); Nav.refrescar(); }); };
ACC.pagoAnadir = el => {
  const x = dato('pagos', el.dataset.id); if (!x) return;
  const t = dato('tarjetas', x.tarjeta) || {}, cs = cuentasAbiertas();
  if (!cs.length) return toast('Primero crea una cuenta compartida.');
  const st = { cid: (ultimaCuenta() || cs[0]).id, paga: t.dueno || S.cfg.persona, rep: 'medias', cat: categoriaComercio(x.comercio) };
  const pinta = () => {
    const c = dato('cuentas', st.cid), ps = c.participantes || [];
    return '<h3 style="display:flex;justify-content:space-between"><span>' + esc(x.comercio || 'Pago') + '</span><b>' + euros(x.importe) + '</b></h3>' +
      '<p class="lab2">Cuenta</p><div class="chips">' + cs.map(k => '<button class="chip' + (k.id === st.cid ? ' on' : '') + '" data-a="pgSet" data-k="cid" data-v="' + k.id + '">' + (k.emoji ? esc(k.emoji) + ' ' : '') + esc(k.nombre) + '</button>').join('') + '</div>' +
      '<p class="lab2">Pagado por</p><div class="chips">' + ps.filter(q => q.persona).map(q => '<button class="chip' + (q.persona === st.paga ? ' on' : '') + '" data-a="pgSet" data-k="paga" data-v="' + q.persona + '">' + esc(q.nombre) + '</button>').join('') + '</div>' +
      '<p class="lab2">Reparto</p><div class="chips"><button class="chip' + (st.rep === 'medias' ? ' on' : '') + '" data-a="pgSet" data-k="rep" data-v="medias">A medias</button>' + ps.filter(q => q.persona).map(q => '<button class="chip' + (st.rep === q.persona ? ' on' : '') + '" data-a="pgSet" data-k="rep" data-v="' + q.persona + '">Solo ' + esc(q.nombre) + '</button>').join('') + '</div>' +
      '<p class="lab2">Categoría</p><div class="chips">' + CAT_MOV.map(k => '<button class="chip' + (k[0] === st.cat ? ' on' : '') + '" data-a="pgSet" data-k="cat" data-v="' + k[0] + '">' + k[1] + '</button>').join('') + '</div>' +
      '<button class="btn pri" data-a="pgOk" style="margin-top:16px">Añadir</button>';
  };
  const h = abrirHoja(pinta());
  ACC.pgSet = b => { st[b.dataset.k] = b.dataset.v; $('.hc', h).innerHTML = pinta(); };
  ACC.pgOk = () => {
    const c = dato('cuentas', st.cid), ps = c.participantes || [];
    const pq = ps.find(q => q.persona === st.paga) || ps[0];
    const quienes = st.rep === 'medias' ? ps.map(q => q.id) : ps.filter(q => q.persona === st.rep).map(q => q.id);
    const mid = 'm' + uid();
    cambiar('movs', mid, { cuenta: c.id, tipo: 'gasto', importe: Number(x.importe) || 0, concepto: cap(x.comercio || 'Pago con tarjeta'), fecha: x.fecha || hoyISO(), pagadoPor: pq.id, categoria: st.cat, reparto: { modo: 'iguales', quienes: quienes, partes: {}, importes: {} }, foto: '', creado: Date.now(), por: S.cfg.persona, tarjeta: x.tarjeta || '', tarjetaNom: t.nombre || x.tarjetaNom || '' });
    cambiar('pagos', x.id, { estado: 'ok', mov: mid });
    cerrarHoja(); Nav.refrescar(true); toast('Añadido a ' + c.nombre);
  };
};

/* ---------- Tarjetas conectadas ---------- */
const tarjetas = () => lista('tarjetas').sort((a, b) => (a.creada || 0) - (b.creada || 0));
const codigoLocal = id => { try { return localStorage.getItem('rondaP-tar-' + id) || ''; } catch (e) { return ''; } };
function textoModo(t) {
  if (t.modo !== 'auto') return 'Cada pago espera en «Pagos por confirmar».';
  const c = t.cuenta && t.cuenta !== 'ultima' ? dato('cuentas', t.cuenta) : cuentasAbiertas()[0];
  const dest = t.cuenta && t.cuenta !== 'ultima' ? (c ? '«' + esc(c.nombre) + '»' : 'una cuenta que ya no existe') : '<b>la última cuenta abierta o creada</b>' + (c ? ' (ahora ' + (c.emoji ? esc(c.emoji) + ' ' : '') + esc(c.nombre) + ')' : '');
  return 'Va a ' + dest + ' · paga ' + esc(nombreDe(t.paga || t.dueno)) + ' · ' + (t.reparto === 'medias' || !t.reparto ? 'a medias' : 'solo ' + esc(nombreDe(t.reparto)));
}
P.tarjetasC = {
  html: () => {
    const l = tarjetas();
    return tope('Tarjetas conectadas') + '<p class="texto">Los pagos con el móvil o el reloj entran solos en Ronda. Las compras por internet no.</p>' +
      '<div class="list" style="margin-top:12px">' + l.map(t => '<button class="crd" data-a="ir" data-id="tarjeta" data-tid="' + t.id + '" style="--c:' + colorDe(t.dueno) + '"><div class="cr1">' + emo(t.emoji, sq('tarjeta', 7), 44) + '<div class="f"><b>' + esc(t.nombre) + '</b><small>De ' + esc(nombreDe(t.dueno)) + (t.conectada ? '' : ' · sin conectar') + '</small></div><span class="tg' + (t.modo === 'auto' ? '' : ' tgp') + '">' + (t.modo === 'auto' ? 'Automático' : 'Por confirmar') + '</span></div><p>' + textoModo(t) + '</p></button>').join('') +
      '<button class="row card dash" data-a="ir" data-id="tarjeta">' + ic('anadir', 22) + '<b>Conectar tarjeta</b></button></div>';
  }
};
P.tarjeta = {
  clase: 'con-boton', fija: true,
  html: p => {
    if (!p.ini) {
      p.ini = true;
      const t = p.tid ? dato('tarjetas', p.tid) : null;
      Object.assign(p, t ? { nombre: t.nombre, emoji: t.emoji, dueno: t.dueno, modo: t.modo, cuenta: t.cuenta || 'ultima', paga: t.paga || t.dueno, reparto: t.reparto || 'medias' } : { dueno: S.cfg.persona, modo: 'auto', cuenta: 'ultima', paga: S.cfg.persona, reparto: 'medias' });
    }
    const cs = cuentasAbiertas();
    let h = tope(p.tid ? (p.nombre || 'Tarjeta') : 'Nueva tarjeta') + filaNombreEmoji('tEmo', pv(p, 'tEmo', p.emoji), fldTxt('tNom', 'Nombre', pv(p, 'tNom', p.nombre), 'bunq, Visa…', 'maxlength="30"')) +
      '<p class="lab2">De quién es</p>' + chipsPersonas(p.dueno, 'tDueno') +
      '<p class="lab2">Qué hacer con cada pago</p><div class="seg"><button class="' + (p.modo === 'auto' ? 'on' : '') + '" data-a="pSet" data-k="modo" data-v="auto">Automático</button><button class="' + (p.modo !== 'auto' ? 'on' : '') + '" data-a="pSet" data-k="modo" data-v="conf">Por confirmar</button></div>';
    if (p.modo === 'auto') {
      h += '<p class="lab2">A qué cuenta</p><div class="chips"><button class="chip' + (p.cuenta === 'ultima' ? ' on' : '') + '" data-a="pSet" data-k="cuenta" data-v="ultima">La última abierta o creada</button>' + cs.map(c => '<button class="chip' + (p.cuenta === c.id ? ' on' : '') + '" data-a="pSet" data-k="cuenta" data-v="' + c.id + '">' + (c.emoji ? esc(c.emoji) + ' ' : '') + esc(c.nombre) + '</button>').join('') + '</div>' +
        '<p class="lab2">Pagado por</p>' + chipsPersonas(p.paga, 'tPaga') +
        '<p class="lab2">Reparto</p><div class="chips"><button class="chip' + (p.reparto === 'medias' ? ' on' : '') + '" data-a="pSet" data-k="reparto" data-v="medias">A medias</button>' + personas().map(x => '<button class="chip' + (p.reparto === x.id ? ' on' : '') + '" data-a="pSet" data-k="reparto" data-v="' + x.id + '">Solo ' + esc(x.nombre) + '</button>').join('') + '</div>' +
        '<p class="cap" style="text-align:left">La categoría se pone sola según el comercio (Mercadona → Supermercado, Repsol → Transporte…).</p>';
    } else h += '<p class="cap" style="text-align:left">Cada pago espera en «Pagos por confirmar» y ahí elegís la cuenta, quién paga y el reparto.</p>';
    if (p.tid) h += '<button class="btn sec peligro" data-a="tarjetaBorrar" style="margin-top:14px">Desconectar y borrar</button>';
    return h;
  },
  fijo: p => '<div class="btns">' + btn(p.tid ? 'Guardar' : 'Siguiente: conectar en el iPhone', 'tarjetaGuardar') + (p.tid ? btn('Conectar en el iPhone', 'tarjetaConectarYa', 'sec') : '') + '</div>'
};
ACC.tDueno = el => { const e = Nav.actual(); guardarCampos(e); e.params.dueno = el.dataset.v; if (!e.params.tid) e.params.paga = el.dataset.v; Nav.refrescar(true); };
ACC.tPaga = el => { const e = Nav.actual(); guardarCampos(e); e.params.paga = el.dataset.v; Nav.refrescar(true); };
ACC.tarjetaGuardar = () => {
  const e = Nav.actual(); guardarCampos(e); const p = e.params, n = val('tNom');
  if (!n) return toast('Ponle un nombre a la tarjeta.');
  const id = p.tid || 't' + uid();
  const c = { nombre: n, emoji: primerEmoji(val('tEmo')), dueno: p.dueno || S.cfg.persona, modo: p.modo === 'auto' ? 'auto' : 'conf', cuenta: p.cuenta || 'ultima', paga: p.paga || p.dueno, reparto: p.reparto || 'medias' };
  if (!p.tid) c.creada = Date.now();
  cambiar('tarjetas', id, c);
  if (p.tid) { Nav.atras(); toast('Tarjeta guardada'); }
  else { Nav.atras(); Nav.ir('tarjetaConectar', { tid: id }); }
};
ACC.tarjetaConectarYa = () => { const p = Nav.actual().params; Nav.ir('tarjetaConectar', { tid: p.tid }); };
ACC.tarjetaBorrar = async () => {
  const p = Nav.actual().params;
  if (!await preguntar('¿Desconectar «' + (p.nombre || 'la tarjeta') + '»?', 'Su código deja de valer al momento. Los gastos que ya entraron se quedan.', 'Desconectar', true)) return;
  try { await api('tarjeta-quitar', { id: p.tid }); } catch (e) { if (e.code !== 'sinred') return toast(e.message); }
  cambiar('tarjetas', p.tid, { _b: 1 }); try { localStorage.removeItem('rondaP-tar-' + p.tid); } catch (e) { }
  Nav.atras(); toast('Tarjeta desconectada');
};
P.tarjetaConectar = {
  clase: 'con-boton',
  html: p => {
    const t = dato('tarjetas', p.tid) || {}, cod = codigoLocal(p.tid);
    const dir = (S.cfg && S.cfg.url) || '';
    return tope('Conectar en el iPhone') + '<p class="texto">Una sola vez, en el iPhone de ' + esc(nombreDe(t.dueno) || 'quien tiene la tarjeta') + '. Unos 3 minutos.</p>' +
      '<div class="card grp" style="margin-top:12px">' + [
        'Abre <b>Atajos</b> › pestaña <b>Automatización</b> › <b>+</b> › <b>Cartera</b> (en versiones antiguas, <b>Transacción</b>).',
        'Elige la tarjeta de Wallet que es <b>' + esc(t.nombre || '') + '</b>. Si lo pregunta, marca <b>Ejecutar inmediatamente</b>. Arriba saldrá «Al usar …».',
        'En el buscador de abajo escribe <b>URL</b> y elige <b>Obtener contenido de URL</b>. Toca «URL» y pega la <b>dirección</b> (botón de abajo).',
        'Toca la flecha de la acción: Método <b>POST</b>, Cuerpo de la solicitud <b>JSON</b>. <b>Añadir nuevo campo › Texto</b> cuatro veces. A la izquierda (Clave) y a la derecha (valor): <b>a</b> = pago · <b>k</b> = el <b>código</b> · <b>importe</b> = Entrada de atajo › Tipo <i>Transacción</i> › <i>Importe</i> · <b>comercio</b> = igual, <i>Comercio</i>.',
        'Sal con la flecha para guardar (no pulses el triángulo de abajo). Toca <b>Probar conexión</b> y luego haz un pago pequeño con el móvil o el reloj.'
      ].map((x, i) => '<div class="row"><span class="nm">' + (i + 1) + '</span><span style="flex:1;min-width:0;display:block;font-weight:600;font-size:15px;line-height:1.4">' + x + '</span></div>').join('') + '</div>' +
      '<div class="codex">' + ic('enlace', 20, 5) + '<span>Dirección del script</span><button class="mini" data-a="tCopiar" data-v="' + esc(dir) + '">Copiar</button></div>' +
      '<div class="codex">' + ic('candado', 20, 4) + '<span>' + (cod ? 'Código de esta tarjeta' : 'Código: todavía no creado') + '</span>' + (cod ? '<button class="mini" data-a="tCopiar" data-v="' + esc(cod) + '">Copiar</button>' : '<button class="mini" data-a="tCodigo">Crear</button>') + '</div>' +
      '<p class="cap" style="text-align:left">El código solo sirve para añadir pagos de esta tarjeta: no deja ver ni borrar nada. No lo pegues en ningún otro sitio.' + (cod ? ' Si lo has perdido o enseñado, <button class="lnk" data-a="tCodigo">crea otro</button> y el anterior deja de valer.' : '') + '</p>' +
      (p.prueba ? '<div class="aviso' + (p.prueba === 'ok' ? '' : ' mal') + '" style="margin-top:12px">' + ic(p.prueba === 'ok' ? 'hecho' : 'error', 22, p.prueba === 'ok' ? 3 : 0) + '<span>' + esc(p.pruebaTxt) + '</span></div>' : '');
  },
  fijo: () => '<div class="btns">' + btn('Probar conexión', 'tProbar') + '</div>'
};
ACC.tCopiar = async el => { toast(await copiar(el.dataset.v) ? 'Copiado' : 'No se ha podido copiar'); };
ACC.tCodigo = el => conEspera(el, async () => {
  const p = Nav.actual().params;
  try { const r = await api('tarjeta-codigo', { id: p.tid }); try { localStorage.setItem('rondaP-tar-' + p.tid, r.codigo); } catch (e) { } cambiar('tarjetas', p.tid, { conectada: Date.now() }); Nav.refrescar(true); toast('Código creado'); }
  catch (e) { toast(e.message); }
});
ACC.tProbar = el => conEspera(el, async () => {
  const p = Nav.actual().params, cod = codigoLocal(p.tid);
  if (!cod) { p.prueba = 'mal'; p.pruebaTxt = 'Primero crea el código.'; return Nav.refrescar(true); }
  try { await api('pago', { k: cod, prueba: true }, { sinToken: true }); p.prueba = 'ok'; p.pruebaTxt = 'Conexión correcta: el script reconoce el código. Ahora prueba un pago de verdad.'; }
  catch (e) { p.prueba = 'mal'; p.pruebaTxt = e.message; }
  Nav.refrescar(true);
});

/* ---------- Tarjetas de inicio de gastos ---------- */
wd('gastoRapido', 'Añadir gasto', 'Cuentas compartidas', 'L', cRO, 'Apunta un gasto en la cuenta que elijas sin entrar', () => {
  const cs = cuentasAbiertas(); if (!ajGastos().cuentas || !cs.length) return { vacio: true, h: lab('Añadir gasto') + '<p class="mu2">Activa las cuentas compartidas en Gastos</p>' };
  const cid = cfgInicio().gastoCuenta, c = (cid && cid !== 'ultima' && dato('cuentas', cid) && !dato('cuentas', cid).archivada) ? dato('cuentas', cid) : (ultimaCuenta() || cs[0]);
  const st = P.inicio.gr || (P.inicio.gr = { paga: S.cfg.persona, rep: 'medias' });
  const ps = (c.participantes || []).filter(q => q.persona);
  return { vacio: false, h: '<div class="wl"><span>Añadir gasto</span><button class="acp" data-a="grCuenta">' + (c.emoji ? esc(c.emoji) + ' ' : '') + esc(c.nombre) + ' ' + ic('atras', 12) + '</button></div>' +
    '<div class="qg"><input id="grImp" class="qi" inputmode="decimal" placeholder="0,00 €" autocomplete="off"><input id="grCon" class="qc" placeholder="Concepto" maxlength="60" autocomplete="off"></div>' +
    '<div class="qrow"><span class="ql">Paga</span><div class="sgs">' + ps.map(q => '<button class="' + (st.paga === q.persona ? 'on' : '') + '" data-a="grSet" data-k="paga" data-v="' + q.persona + '">' + esc(q.nombre) + '</button>').join('') + '</div><button class="ql" data-a="grRep">' + (st.rep === 'medias' ? 'A medias' : 'Solo ' + esc(nombreDe(st.rep))) + ' ' + ic('atras', 12) + '</button></div>' +
    '<button class="qb" data-a="grOk" data-cid="' + c.id + '">' + ic('anadir', 18) + ' Añadir</button>' };
});
ACC.grSet = el => { P.inicio.gr[el.dataset.k] = el.dataset.v; const i = $('#grImp'), n = $('#grCon'), a = [i && i.value, n && n.value]; Nav.refrescar(true); if ($('#grImp')) { $('#grImp').value = a[0] || ''; $('#grCon').value = a[1] || ''; } };
ACC.grRep = () => { const st = P.inicio.gr, ps = personas().map(x => x.id), op = ['medias'].concat(ps); st.rep = op[(op.indexOf(st.rep) + 1) % op.length]; ACC.grSet({ dataset: { k: 'rep', v: st.rep } }); };
ACC.grCuenta = () => {
  const cs = cuentasAbiertas(), act = cfgInicio().gastoCuenta || 'ultima';
  abrirHoja('<h3>¿En qué cuenta?</h3><div class="card grp"><button class="row" data-a="grCuentaSi" data-v="ultima"><b style="flex:1">La última que uses</b><span class="rad' + (act === 'ultima' ? ' on' : '') + '"></span></button>' + cs.map(c => '<button class="row" data-a="grCuentaSi" data-v="' + c.id + '">' + sqCuenta(c) + '<b style="flex:1">' + esc(c.nombre) + '</b><span class="rad' + (act === c.id ? ' on' : '') + '"></span></button>').join('') + '</div>');
};
ACC.grCuentaSi = el => { fijarCfg({ gastoCuenta: el.dataset.v }); cerrarHoja(); Nav.refrescar(true); };
ACC.grOk = el => {
  const imp = numero(val('grImp')), con = cap(val('grCon'));
  if (!imp) return toast('Escribe el importe.');
  if (!con) return toast('Escribe el concepto.');
  const c = dato('cuentas', el.dataset.cid), ps = c.participantes || [], st = P.inicio.gr;
  const pq = ps.find(q => q.persona === st.paga) || ps[0];
  const quienes = st.rep === 'medias' ? ps.map(q => q.id) : ps.filter(q => q.persona === st.rep).map(q => q.id);
  cambiar('movs', 'm' + uid(), { cuenta: c.id, tipo: 'gasto', importe: imp, concepto: con, fecha: hoyISO(), pagadoPor: pq.id, categoria: categoriaComercio(con), reparto: { modo: 'iguales', quienes: quienes.length ? quienes : ps.map(q => q.id), partes: {}, importes: {} }, foto: '', creado: Date.now(), por: S.cfg.persona });
  Nav.refrescar(true); toast(euros(imp) + ' añadido a ' + c.nombre);
};
wd('porConfirmar', 'Pagos por confirmar', 'Cuentas compartidas', 'S', cRO, 'Pagos con tarjeta esperando. Solo sale si hay alguno', () => {
  const l = pagosPend(); if (!l.length) return { vacio: true, h: lab('Por confirmar') + '<p class="mu2">Nada esperando</p>' };
  return { vacio: false, h: lab('Por confirmar') + big(l.length, l.length === 1 ? 'pago' : 'pagos') + '<small class="mu2">' + euros(l.reduce((a, x) => a + (Number(x.importe) || 0), 0)) + ' en total</small>' };
});
/* 1.4.1: foto de cada participante; si no está unido a una persona, se busca por el nombre y, si no, su inicial */
const personaPart = x => x.persona ? dato('personas', x.persona) : personas().find(p => (p.nombre || '').trim().toLowerCase() === String(x.nombre || '').trim().toLowerCase()) || null;
const colPart = x => { const p = personaPart(x); return p ? (p.color || colorDe(p.id)) : COL[4]; };
const avPart = (x, s) => { const p = personaPart(x); return p ? av(p, s) : '<span class="av ini" style="--c:' + COL[4] + ';width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s * .45) + 'px">' + esc(String(x.nombre || '?').trim().charAt(0).toUpperCase()) + '</span>'; };
wd('quienPaga', 'Quién ha pagado más', 'Cuentas compartidas', 'S', cLV, 'Lo que ha pagado cada uno en la cuenta (la última que uses)', () => {
  const c = ultimaCuenta() || cuentasAbiertas()[0]; if (!c) return { vacio: true, h: lab('Quién ha pagado') + '<p class="mu2">Sin cuentas</p>' };
  const ms = lista('movs').filter(m => m.cuenta === c.id && m.tipo !== 'transferencia'), ps = (c.participantes || []);
  const tot = ps.map(q => [q, ms.filter(m => m.pagadoPor === q.id).reduce((a, m) => a + (Number(m.importe) || 0), 0)]), mx = Math.max(1, ...tot.map(x => x[1]));
  return { vacio: !ms.length, h: lab(esc(c.nombre)) + '<div class="quien2">' + tot.map(x => '<div>' + avPart(x[0], 26) + '<b>' + euros(x[1]).replace(',00', '') + '</b><span class="wb"><i style="width:' + Math.round(x[1] / mx * 100) + '%;background:' + colPart(x[0]) + '"></i></span></div>').join('') + '</div>' };
});
W.porConfirmar.ir = 'irPagos'; W.gastoRapido.ir = 'wGastos'; W.quienPaga.ir = 'wGastos';
ACC.irPagos = () => Nav.ir('pagos', {});
