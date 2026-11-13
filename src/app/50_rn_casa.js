/* ===================== 0.3.0 · CONECTAR CON MI CASA =====================
   - Dos modos: «ejemplo» (datos de mentira, en el almacén ronda_prueba) y «casa» (la hoja de Google de verdad, en ronda_prueba_casa).
   - En «casa» los datos se leen y se guardan EXACTAMENTE como en la app de hoy: mismo script, mismas colecciones, mismos campos.
     La sincronización es la de 02_sync.js, sin tocar. El script no cambia.
   - No hay en el código ninguna dirección de script, ni claves, ni códigos: llegan con el código RONDA1 que se pega al conectar.
   - Lo que solo tiene sentido en este móvil mientras conviven las dos apps se guarda SOLO en el móvil, nunca en la hoja:
     el orden y las tarjetas de Inicio, la barra de abajo y el «Deshacer» de Actividad. Al conectar, se parte de lo que ya tenías. */

/* ---------- 1. Inicio y barra: en el móvil, partiendo de lo de la hoja ---------- */
const LOC_PRE = 'rondaP-loc-' + MODO + '-';
let LOC_CACHE = null, LOC_DE = '';
function locLeer() {
  const k = LOC_PRE + ((S.cfg && S.cfg.persona) || '');
  if (LOC_DE !== k || !LOC_CACHE) { LOC_DE = k; try { LOC_CACHE = JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { LOC_CACHE = {}; } }
  return LOC_CACHE;
}
function locPoner(o) {
  const l = Object.assign({}, locLeer(), o); LOC_CACHE = l;
  try { localStorage.setItem(LOC_DE, JSON.stringify(l)); } catch (e) { anotar('guardar en el móvil', e); }
}
/* La persona de este móvil, con lo suyo del móvil encima (una copia: nunca se cambia el dato de la hoja) */
function yo() {
  const p = S.cfg ? dato('personas', S.cfg.persona) : null;
  return p ? Object.assign({}, p, locLeer()) : p;
}
function fijarInicio(orden, ocultas) { locPoner({ inicio: orden, inicioOcultas: ocultas }); }
function fijarCfg(o) { locPoner({ inicioCfg: Object.assign({}, cfgInicio(), o) }); }
function fijarBarra(b) { locPoner({ barra: b }); Nav.refrescar(true); Nav.barra(); }

/* ---------- 2. Arranque en «casa»: como el iniciar() de la app de hoy ---------- */
async function cargarCasa() {
  await DB.abrir();
  S.cfg = (await DB.get('cfg')) || null;
  if (!S.cfg || !S.cfg.url || !S.cfg.token) { S.cfg = null; return false; }
  const d = (await DB.get('datos')) || {};
  S.recs = d.recs || {}; S.seq = d.seq || 0; S.sid = d.sid || '';
  S.cola = (await DB.get('cola')) || {};
  S.cal = (await DB.get('cal')) || null;
  try { Object.assign(AG.cache, (await DB.get('agenda')) || {}); } catch (e) { }
  RN_CARGADO = true;
  Sync.ya().catch(e => anotar('sincronizar', e));
  return true;
}
const rnModoElegido = () => { try { return !!localStorage.getItem('rondaP-modo'); } catch (e) { return true; } };
const rnHayCasa = () => { try { return localStorage.getItem('rondaP-casa') === '1'; } catch (e) { return false; } };
const rnNombreCasa = () => { try { return localStorage.getItem('rondaP-casa-nombre') || 'vuestra casa'; } catch (e) { return 'vuestra casa'; } };
function rnCambiarModo(m) { try { localStorage.setItem('rondaP-modo', m); } catch (e) { } guardarLocal(true); setTimeout(() => location.reload(), 120); }

/* Guardar la conexión en el almacén de «casa» (también desde el modo ejemplo) */
function rnGuardarEnCasa(kv) {
  const ls = () => { try { Object.keys(kv).forEach(k => localStorage.setItem('rondaPC:' + k, JSON.stringify(kv[k]))); return true; } catch (e) { return false; } };
  return new Promise(ok => {
    let hecho = false; const fin = v => { if (!hecho) { hecho = true; ok(v); } };
    setTimeout(() => fin(ls()), 3000);
    try {
      const r = indexedDB.open('ronda_prueba_casa', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => {
        try { const t = r.result.transaction('kv', 'readwrite'), s = t.objectStore('kv'); Object.keys(kv).forEach(k => s.put(kv[k], k)); t.oncomplete = () => { r.result.close(); fin(true); }; t.onerror = () => fin(ls()); }
        catch (e) { fin(ls()); }
      };
      r.onerror = () => fin(ls());
    } catch (e) { fin(ls()); }
  });
}
function rnBorrarCasa() {
  return new Promise(ok => {
    try { Object.keys(localStorage).filter(k => /^rondaPC:|^rondaP-loc-casa-|^rondaP-act-casa$/.test(k)).forEach(k => localStorage.removeItem(k)); ['rondaP-casa', 'rondaP-casa-nombre'].forEach(k => localStorage.removeItem(k)); } catch (e) { }
    try { if (DB.db && EN_CASA) DB.db.close(); const r = indexedDB.deleteDatabase('ronda_prueba_casa'); r.onsuccess = r.onerror = r.onblocked = () => ok(); setTimeout(ok, 1500); } catch (e) { ok(); }
  });
}

/* ---------- 3. Piezas de las pantallas de entrada ---------- */
const rnIluSolo = id => (rnOscuro() ? ILUS_OSC[id] : ILUS[id]) || ILUS[id] || '';
const rnLogoGrande = s => '<span class="rn-logo rn-logo-g" style="width:' + s + 'px;height:' + s + 'px;min-width:' + s + 'px">' + rnPuntos(Math.round(s * 0.72), 0.085) + '</span>';
const rnErr = (pg, msg) => { const e = $('[data-r="err"]', pg || (Nav.actual() || {}).el); if (e) e.innerHTML = msg ? '<div class="rn-cd rn-error" role="alert">' + rnChip('aviso', 30) + '<span class="rn-txt">' + esc(msg) + '</span></div>' : ''; else if (msg) toastError(msg); };
const rnBtnO = (t, a, extra) => '<button class="rn-btnp rn-btno" data-a="' + a + '"' + (extra || '') + '>' + t + '</button>';
const rnBtnG = (t, a, extra) => '<button class="rn-btnp rn-btng rn-gl" data-a="' + a + '"' + (extra || '') + '>' + t + '</button>';
const rnInfo = (id, t) => '<div class="rn-cd rn-info">' + rnChip(id, 30) + '<span class="rn-txt">' + t + '</span></div>';
async function rnEspera(el, f) { if (!el || el.classList.contains('rn-cargando')) return; el.classList.add('rn-cargando'); el.disabled = true; try { return await f(); } finally { el.classList.remove('rn-cargando'); el.disabled = false; } }

/* Bienvenida: sin «Crear una casa». Solo «Tengo un código» y «Probar con datos de ejemplo». */
P.bienvenida = {
  rn: true, raiz: true, sinBarra: true, fija: true,
  html: () => '<div class="rn-bienv">' + rnLogoGrande(132) + '<div class="rn-bienv-t">Ronda</div><p class="rn-bienv-s">La casa, al día.</p></div>',
  fijo: () => '<div class="rn-pie-btns">' + rnBtnO('Tengo un código', 'rnTengoCodigo') + rnBtnG('Probar con datos de ejemplo', 'rnProbarEjemplo') +
    '<p class="rn-pie-nota">Con el código entras en vuestra casa de verdad. Los datos de ejemplo no se mezclan con los vuestros.</p></div>'
};
ACC.rnTengoCodigo = () => { S.alta = { modo: 'unirse' }; Nav.ir('unirse', {}); };
ACC.tengoCodigo = ACC.rnTengoCodigo;
ACC.rnProbarEjemplo = () => {
  if (EN_CASA) return rnCambiarModo('ejemplo');
  try { localStorage.setItem('rondaP-modo', 'ejemplo'); } catch (e) { }
  const viejas = Nav.pila.slice(); Nav.pila = [];
  Nav.raiz('inicio'); viejas.forEach(v => setTimeout(() => v.el.remove(), 400));
};

/* Tengo un código */
P.unirse = {
  rn: true, sinBarra: true,
  html: () => rnTitulo('Tengo un código', { atras: 'Atrás' }) + '<div class="rn-ilu rn-ilu-m">' + rnIluSolo('invita-a-los-tuyos') + '</div>' +
    '<p class="rn-txt" style="margin:10px 4px 0">Pega el código que te ha pasado la otra persona. Empieza por RONDA1.</p>' +
    '<label class="rn-fld rn-fld-alto" style="margin-top:12px"><small>Código de invitación</small><textarea id="uCod" rows="4" placeholder="RONDA1-…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea></label>' +
    '<div class="rn-dcha"><button class="rn-qc" data-a="rnPegar" data-sel="#uCod">' + rnIc('pegar', 18, 2) + '<span>Pegar</span></button></div>' +
    rnInfo('informacion', 'Pégalo aquí, dentro de Ronda. Si tocas el código en un mensaje se abre Safari, que guarda sus datos aparte de la app del icono.') +
    '<div data-r="err"></div>' + '<button class="rn-btnp rn-btno" data-a="rnComprobarCodigo" style="margin-top:18px">Entrar</button>'
};
ACC.rnPegar = async el => { const t = $(el.dataset.sel); if (!t) return; try { const v = await navigator.clipboard.readText(); if (v) { t.value = v; return; } } catch (e) { } t.focus(); toast('Mantén pulsado en el recuadro y elige «Pegar».'); };
ACC.rnComprobarCodigo = el => rnEspera(el, async () => {
  const pg = Nav.actual().el; rnErr(pg, '');
  const k = leerPaquete(($('#uCod') || {}).value);
  if (k.error) return rnErr(pg, k.error);
  S.alta = { modo: 'unirse', url: k.url, codigo: k.codigo };
  try {
    const inv = await apiReal('invitacion-ver', { codigo: k.codigo }, { url: k.url, sinToken: true });
    if (inv.alta) return rnErr(pg, 'Ese código es para crear una casa nueva. En esta prueba solo se entra en una casa que ya existe: pide en la app de hoy un código en Personas.');
    S.alta.inv = inv;
    Nav.ir(inv.persona ? 'reconectar' : 'perfil', {});
  } catch (e) { rnErr(pg, e.message); }
});

/* Volver a conectar (alguien que ya estaba: no se crea una persona nueva) */
P.reconectar = {
  rn: true, sinBarra: true,
  html: () => { const p = (S.alta && S.alta.inv && S.alta.inv.persona) || {}; return rnTitulo('', { atras: 'Atrás' }) + '<div class="rn-centro">' + rnAv(p, 140) + '<div class="rn-hola">Hola, ' + esc(p.nombre || '') + '</div><p class="rn-txt">Vas a conectar este móvil a «' + esc(((S.alta.inv || {}).espacio || {}).nombre || 'vuestra casa') + '» con tu perfil de siempre.</p></div><div data-r="err"></div>' + '<button class="rn-btnp rn-btno" data-a="rnUnirseYa" style="margin-top:26px">Conectar</button>'; }
};
/* Quién eres (persona nueva) */
P.perfil = {
  rn: true, sinBarra: true,
  html: () => {
    const usados = ((S.alta.inv && S.alta.inv.personas) || []).map(p => String(p.color).toUpperCase());
    if (!S.alta.color || usados.indexOf(S.alta.color) >= 0) S.alta.color = COL.find(c => usados.indexOf(c) < 0) || COL[0];
    return rnTitulo('Quién eres', { atras: 'Atrás', sub: 'Así te verán los tuyos' }) +
      '<div class="rn-centro" style="padding-top:12px">' + rnAv({ nombre: S.alta.nombre || '?', color: S.alta.color }, 110) + '</div>' +
      '<label class="rn-fld" style="margin-top:18px"><small>Nombre</small><input id="pNom" maxlength="30" value="' + esc(S.alta.nombre || '') + '" placeholder="Cómo te llaman" autocomplete="given-name"></label>' +
      '<p class="rn-et">Tu color</p><div class="rn-cols">' + COL.map((c, i) => '<button class="rn-cdot' + (S.alta.color === c ? ' rn-on' : '') + '" style="background:' + c + '" data-a="rnColorAlta" data-c="' + c + '"' + (usados.indexOf(c) >= 0 ? ' disabled' : '') + ' aria-label="' + NOMCOL[i] + '"></button>').join('') + '</div>' +
      '<p class="rn-txt" style="margin:12px 4px 0">La foto la puedes poner luego en Ajustes › Mi perfil.</p><div data-r="err"></div>' +
      '<button class="rn-btnp rn-btno" data-a="rnUnirseYa" style="margin-top:20px">Continuar</button>';
  }
};
ACC.rnColorAlta = el => { const n = $('#pNom'); if (n) S.alta.nombre = n.value; S.alta.color = el.dataset.c; Nav.refrescar(true); };
ACC.rnUnirseYa = el => rnEspera(el, async () => {
  const pg = Nav.actual(), a = S.alta; rnErr(pg.el, '');
  const extra = { codigo: a.codigo }, nueva = pg.id === 'perfil';
  if (nueva) {
    a.nombre = ($('#pNom').value || '').trim();
    if (!a.nombre) { $('#pNom').focus(); return rnErr(pg.el, 'Escribe tu nombre.'); }
    extra.nombre = a.nombre; extra.color = a.color;
  }
  try {
    const r = await apiReal('unirse', extra, { url: a.url, sinToken: true });
    const cfg = { url: a.url, token: r.token, persona: r.persona, rol: r.rol, alta: Date.now() };
    const ok = await rnGuardarEnCasa({ cfg: cfg, datos: { recs: {}, seq: 0, sid: r.sid || '' }, cola: {} });
    if (!ok) return rnErr(pg.el, 'No he podido guardar la conexión en este móvil. Vuelve a intentarlo.');
    try {
      localStorage.setItem('rondaP-casa', '1');
      localStorage.setItem('rondaP-casa-nombre', ((a.inv || {}).espacio || {}).nombre || '');
      localStorage.setItem('rondaP-bienvenida', '1');
      if (nueva) localStorage.setItem('rondaP-onb-pend', r.rol || 'miembro'); else localStorage.setItem('rondaP-inicio-elegido', '1');
    } catch (e) { }
    rnCambiarModo('casa');
  } catch (e) {
    if (e.code === 'color' && nueva) { a.inv = await apiReal('invitacion-ver', { codigo: a.codigo }, { url: a.url, sinToken: true }).catch(() => a.inv); Nav.refrescar(true); }
    rnErr(Nav.actual().el, e.message);
  }
});

/* Presentación: solo para personas NUEVAS en la casa */
const RN_ONB = () => [
  ['invita-a-los-tuyos', 'Ya estás en ' + (espacio().nombre || 'vuestra casa'), personas().map(p => p.nombre).sort((a, b) => a.localeCompare(b, 'es')).join(' y ') + (personas().length > 1 ? ' ya estáis aquí.' : ' ya estás aquí.') + ' Lo que añada uno, lo ve el otro al momento.'],
  ['tus-datos-tuyos', 'Tus datos, tuyos', 'Todo se guarda en vuestro Google. Los documentos importantes van cifrados en tu móvil, con tu código de 4 cifras.'],
  ['avisos-a-tiempo', 'Avisos a tiempo', 'Los recordatorios llegan a vuestro calendario de Google, con su alarma.']
].concat(FUNCIONES.slice(1).map(f => [f[0], f[1], f[2]]));
P.onb = {
  rn: true, sinBarra: true, raiz: true,
  html: p => { const L = RN_ONB(), i = Math.min(p.paso || 0, L.length - 1), o = L[i]; return '<div class="rn-onb"><div class="rn-dcha"><button class="rn-saltar" data-a="rnOnbFin">Saltar</button></div><div class="rn-ilu rn-ilu-g">' + rnIluSolo(o[0]) + '</div><h1 class="rn-onb-t">' + esc(o[1]) + '</h1><p class="rn-txt rn-onb-s">' + esc(o[2]) + '</p><div class="rn-dots">' + L.map((x, j) => '<i' + (j === i ? ' class="rn-on"' : '') + '></i>').join('') + '</div></div>'; },
  fijo: p => { const ult = (p.paso || 0) >= RN_ONB().length - 1; return '<div class="rn-pie-btns">' + (!ult ? rnBtnO('Siguiente', 'rnOnbSig') : esAdmin() && !S.cal ? rnBtnO('Elegir el calendario', 'rnOnbCal') + rnBtnG('Empezar', 'rnOnbFin') : rnBtnO('Empezar', 'rnOnbFin')) + '</div>'; }
};
ACC.rnOnbSig = () => { const p = Nav.actual().params; Nav.raiz('onb', { paso: (p.paso || 0) + 1 }); };
ACC.rnOnbFin = () => { try { localStorage.removeItem('rondaP-onb-pend'); } catch (e) { } Nav.raiz('inicio'); };
ACC.rnOnbCal = () => { ACC.rnOnbFin(); setTimeout(() => Nav.ir('avisos', {}), 380); };
P.funciones = Object.assign({}, P.onb, { raiz: false, html: p => P.onb.html(Object.assign({ paso: 3 }, p)) });

/* Este móvil ya no está conectado */
P.anulado = {
  rn: true, sinBarra: true, raiz: true,
  html: () => '<div class="rn-centro" style="padding-top:90px">' + '<div class="rn-ilu rn-ilu-g">' + rnIluSolo('algo-ha-fallado') + '</div><div class="rn-hola" style="font-size:28px">Este móvil ya no está conectado</div><p class="rn-txt">Quien administra la casa ha quitado este acceso. Si es un error, pídele un código nuevo.</p></div>',
  fijo: () => '<div class="rn-pie-btns">' + rnBtnO('Tengo un código', 'rnTengoCodigo') + rnBtnG('Probar con datos de ejemplo', 'rnProbarEjemplo') + '</div>'
};
const _anulado50 = accesoAnulado;
accesoAnulado = function () { try { localStorage.removeItem('rondaP-casa'); localStorage.removeItem('rondaP-modo'); } catch (e) { } return _anulado50(); };

/* ---------- 4. Ajustes › Tus datos (82) ---------- */
P.conexion = {
  rn: true,
  html: () => {
    const e = espacio(), x = yo() || {};
    const cab = EN_CASA
      ? '<div class="rn-cd rn-fila-g">' + rnLogoGrande(46) + '<span class="rn-fat"><b>' + esc(e.nombre || 'Vuestra casa') + '</b><span class="rn-n">Conectada a vuestro Google · ' + esc(x.nombre || '') + '</span></span><span class="rn-tg rn-k-verde">' + (S.red.ok ? 'Conectada' : 'Sin conexión') + '</span></div>'
      : '<div class="rn-cd rn-fila-g">' + rnLogoGrande(46) + '<span class="rn-fat"><b>Datos de ejemplo</b><span class="rn-n">Iña y Ru, inventados. No van a ningún sitio.</span></span><span class="rn-tg">Ejemplo</span></div>';
    const op = (id, t, a, peligro) => '<button class="rn-rw rn-fa' + (peligro ? ' rn-rojo' : '') + '" data-a="' + a + '"><span class="rn-chip">' + rnIc(id, 26, 2) + '</span><span class="rn-fat"><span class="rn-t">' + t + '</span></span>' + (peligro ? '' : rnFle) + '</button>';
    return rnTitulo('Tus datos', { atras: 'Ajustes' }) + cab +
      (EN_CASA ? '<p class="rn-txt rn-pie-txt">La app vieja y esta usan la misma hoja: lo que apuntes aquí lo ves allí, y al revés. El orden de Inicio, la barra y el «Deshacer» de Actividad se guardan solo en este móvil.</p>'
        : '<p class="rn-txt rn-pie-txt">' + (rnHayCasa() ? 'Este móvil también está conectado a «' + esc(rnNombreCasa()) + '». Lo vuestro sigue guardado aparte.' : 'Para ver vuestra casa de verdad, pide en la app de hoy un código: Personas › tu persona › «Crear código para volver a conectar».') + '</p>') +
      '<h2 class="rn-gt">Cambiar</h2><div class="rn-cd">' +
      (EN_CASA ? op('modulo-documentos', 'Ver los datos de ejemplo', 'rnIrEjemplo') + op('cerrar-sesion', 'Desconectar este móvil', 'rnDesconectar', 1)
        : (rnHayCasa() ? op('casa', 'Volver a ' + esc(rnNombreCasa()), 'rnIrCasa') + op('cerrar-sesion', 'Desconectar este móvil de vuestra casa', 'rnDesconectar', 1) : op('casa', 'Conectar con mi casa', 'rnTengoCodigo'))) +
      '</div>' + (EN_CASA ? '<p class="rn-txt rn-pie-txt" style="font-size:13px">Al volver a los datos de ejemplo, lo vuestro no se borra: se queda guardado aparte.</p>' : '');
  }
};
ACC.rnIrEjemplo = () => rnCambiarModo('ejemplo');
ACC.rnIrCasa = () => rnCambiarModo('casa');
ACC.rnDesconectar = async () => {
  if (!(await preguntar('¿Desconectar este móvil?', 'Para volver a entrar en vuestra casa necesitarás un código nuevo. Los datos de ejemplo siguen aquí.', 'Desconectar', true))) return;
  await rnBorrarCasa();
  try { localStorage.setItem('rondaP-modo', 'ejemplo'); } catch (e) { }
  setTimeout(() => location.reload(), 120);
};

/* ---------- 5. Ajustes (81): con «Tus datos» y las filas nuevas ---------- */
P.ajustes.html = () => {
  const x = yo() || {}, e = espacio(), ps = personas().slice().sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  let tema = 'auto'; try { tema = localStorage.getItem('rondaP-tema') || 'auto'; } catch (er) { }
  const fila = (id, t, s, ir) => '<button class="rn-rw rn-fa" data-a="rnAjIr" data-ir="' + ir + '"><span class="rn-chip">' + rnIc(id, 26, 2) + '</span><span class="rn-fat"><span class="rn-t">' + t + '</span>' + (s ? '<span class="rn-n">' + s + '</span>' : '') + '</span>' + rnFle + '</button>';
  const nt = typeof tarjetas === 'function' ? tarjetas().length : 0;
  const sync = !EN_CASA ? 'Sin conexión: los datos son de ejemplo' : S.red.ok ? (S.red.ultimo ? 'Al día, ' + rnHace(S.red.ultimo) : 'Conectando…') : 'Sin conexión. Se guardará al volver';
  const res = x.resumenOff ? 'Desactivado' : 'Activado';
  let ciudad = ''; try { ciudad = (espacio().tiempo || {}).nombre || (espacio().ciudad || ''); } catch (er) { }
  return rnTitulo('Ajustes') +
    '<button class="rn-cd rn-perfil" data-a="rnAjIr" data-ir="miperfil">' + rnAv(x, 50) + '<span class="rn-fat"><b>' + esc(x.nombre || '') + '</b><span class="rn-n">' + (esAdmin() ? 'Administrador' : 'Miembro') + ' de ' + esc(e.nombre || '') + '</span></span>' + rnFle + '</button>' +
    '<h2 class="rn-gt">La casa</h2><div class="rn-cd">' +
    fila('nube-sincronizada', 'Tus datos', EN_CASA ? esc(e.nombre || 'Vuestra casa') + ' · conectada' : 'Datos de ejemplo', 'conexion') +
    fila('casa', 'Nombre y emoji del hogar', esc(e.nombre || ''), 'hogarAj') +
    fila('personas', 'Personas', ps.map(p => esc(p.nombre)).join(' y '), 'personas') +
    fila('modulo-calendario', 'Avisos en tu calendario', S.cal ? 'Calendario «' + esc(S.cal.nombre || 'Casa') + '»' : 'Sin elegir', 'avisos') +
    fila('tarjeta', 'Tarjetas conectadas', nt ? nt + (nt === 1 ? ' tarjeta' : ' tarjetas') : 'Ninguna', 'tarjetasC') +
    fila('reloj', 'Actividad', 'Quién ha cambiado qué', 'actividad') + '</div>' +
    '<h2 class="rn-gt">La app</h2><div class="rn-cd">' +
    fila('sol', 'Apariencia', { claro: 'Claro', oscuro: 'Oscuro', auto: 'Automático' }[tema], 'apariencia') +
    fila('ordenar', 'Barra de abajo', rnBarra().map(k => rnCorto(k)).join(' y '), 'barra') +
    fila('paraguas', 'El tiempo', esc(ciudad), 'tiempoAj') +
    fila('nota', 'Resumen del domingo', res, 'resumenAj') +
    fila('sincronizar', 'Sincronización', sync, 'sincronizacion') +
    fila('descargar', 'Copia de seguridad', EN_CASA ? 'En vuestro Google' : 'No hay en la prueba', 'copia') +
    fila('escudo', 'Comprobaciones', 'Errores y datos del móvil', 'comprobaciones') +
    fila('informacion', 'Acerca de Ronda', '', 'acerca') + '</div>' +
    '<p class="rn-version">Ronda · prueba ' + VERSION + ' · ' + (EN_CASA ? 'conectada a ' + esc(e.nombre || 'vuestra casa') : 'datos de ejemplo') + '</p>' +
    '<p class="rn-version rn-medidas">' + esc(rnMedidas()) + '</p>' +
    '<button class="rn-version rn-verbv" data-a="rnVerBienvenida">Ver otra vez la animación de la primera vez</button>';
};
function rnHace(t) { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'ahora mismo' : m < 60 ? 'hace ' + m + ' min' : 'a las ' + hora(new Date(t)); }

/* ---------- 6. Dilo: en «casa» funciona (el script usa su clave de Gemini, guardada en Propiedades del script) ---------- */
ACC.rnDilo = el => { if (EN_CASA) return Dilo.abrir(); toast('Dilo necesita vuestra casa (usa Google). Con los datos de ejemplo no funciona: conéctate en Ajustes › Tus datos.'); };
