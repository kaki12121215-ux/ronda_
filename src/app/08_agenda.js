/* ============================ AGENDA: vuestro calendario de Google ============================
   Se lee del calendario al abrirla (lo creado fuera de Ronda también sale) y se guarda una copia para verla sin conexión. */
const TIPOS_EV = [['cena', 'Cena', 4], ['cumpleanos', 'Cumpleaños', 7], ['viaje', 'Viaje', 5], ['medico', 'Médico', 3], ['reunion', 'Reunión', 6], ['fiesta', 'Fiesta', 1], ['recordatorio', 'Otro', 0]];
const AG = { cache: {}, cargando: {}, error: '' };
const claveMes = d => d.getFullYear() + '-' + dosd(d.getMonth() + 1);
function rangoMes(d) {
  const ini = new Date(d.getFullYear(), d.getMonth(), 1);
  const desde = sumaDias(ini, -(diaSemana(ini) - 1));
  return { desde: desde, hasta: sumaDias(desde, 42) };
}
async function cargarMes(d, forzar) {
  const k = claveMes(d);
  if (AG.cargando[k] || (!forzar && AG.cache[k] && Date.now() - AG.cache[k].t < 30000)) return;
  AG.cargando[k] = true;
  try {
    const r = rangoMes(d);
    const j = await api('agenda', { desde: r.desde.getTime(), hasta: r.hasta.getTime() });
    AG.cache[k] = { t: Date.now(), ev: j.eventos };
    if (j.cal) { S.cal = j.cal; DB.set('cal', S.cal); }
    AG.error = '';
    DB.set('agenda', AG.cache);
  } catch (e) { AG.error = e.message; }
  finally { AG.cargando[k] = false; const p = Nav.actual(); if (p && /agenda|evento/.test(p.id)) Nav.refrescar(); }
}
function eventosDia(iso) {
  const d0 = deISO(iso).getTime(), d1 = d0 + 86400000;
  const k = iso.slice(0, 7), out = [];
  const vistos = {};
  Object.keys(AG.cache).forEach(m => (AG.cache[m].ev || []).forEach(e => {
    if (vistos[e.id]) return;
    if (e.inicio < d1 && e.fin > d0) { vistos[e.id] = 1; out.push(e); }
  }));
  return out.sort((a, b) => (b.todoDia - a.todoDia) || a.inicio - b.inicio);
}
const tareasDia = iso => lista('tareas').filter(t => !t.hecho && t.fecha === iso);
function colorEv(e) {
  const q = String(e.quien || '').split(',')[0];
  if (q && dato('personas', q)) return colorDe(q);
  const t = TIPOS_EV.find(x => x[0] === e.tipo);
  return t ? COL[t[2]] : COL[5];
}
const horaEv = e => e.todoDia ? 'Todo el día' : hora(new Date(e.inicio)) + ' – ' + hora(new Date(e.fin));
function filaEv(e) {
  const ip = TIPOS_EV.find(x => x[0] === e.tipo);
  const quien = String(e.quien || '').split(',').filter(x => dato('personas', x)).map(nombreDe).join(', ');
  return '<button class="row card" data-a="verEvento" data-id="' + esc(e.id) + '"><span class="sq sm" style="background:' + colorEv(e) + '22">' + ic(ip ? ip[0] : 'calendario', 26, ip ? ip[2] : 5) + '</span><div class="f"><b>' + esc(e.titulo) + '</b><small>' + horaEv(e) + (quien ? ' · ' + esc(quien) : '') + (e.lugar ? ' · ' + esc(e.lugar) : '') + '</small></div></button>';
}
const filaTareaAg = t => '<button class="row card" data-a="verTarea" data-id="' + t.id + '">' + sq('modulo-tareas', 1) + '<div class="f"><b>' + esc(t.titulo) + candado(t) + '</b><small>Tarea' + (t.hora ? ' · ' + t.hora : '') + ' · ' + esc(nombreDe(t.para)) + '</small></div></button>';

P.agenda = {
  raiz: true, clase: 'con-barra',
  html: p => {
    const hoy = new Date();
    p.mes = p.mes || isoDia(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    p.dia = p.dia || hoyISO();
    p.vista = p.vista || 'mes';
    const m = deISO(p.mes);
    cargarMes(m);
    const flechas = '<div style="display:flex;gap:4px"><button class="bk" data-a="agMes" data-v="-1" style="border:0;background:none;width:40px;height:40px" aria-label="Anterior">' + ic('atras', 24) + '</button><button class="bk" data-a="agMes" data-v="1" style="border:0;background:none;width:40px;height:40px;transform:scaleX(-1)" aria-label="Siguiente">' + ic('atras', 24) + '</button></div>';
    let h = '<div data-r="banda">' + banda() + '</div>';
    if (!S.cal || !S.cal.id) h += '<div class="aviso">' + ic('informacion', 22, 5) + '<span>' + (esAdmin() ? 'Elige vuestro calendario en Ajustes › Avisos en tu calendario.' : 'Falta que quien administra elija el calendario.') + '</span></div>';
    if (p.vista === 'mes') {
      h += head(cap(MESES[m.getMonth()]), String(m.getFullYear()), flechas) + '<div class="seg"><button class="on">Mes</button><button data-a="pSet" data-k="vista" data-v="semana">Semana</button></div>';
      const r = rangoMes(m);
      let celdas = '';
      for (let i = 0; i < 42; i++) {
        const d = sumaDias(r.desde, i), iso = isoDia(d);
        if (i === 35 && d.getMonth() !== m.getMonth()) break;
        const evs = eventosDia(iso), ts = tareasDia(iso);
        const puntos = evs.slice(0, 3).map(e => dot(colorEv(e), 5)).join('') + (ts.length ? dot('#F2B824', 5) : '');
        celdas += '<button class="dia' + (iso === hoyISO() ? ' hoy' : '') + (iso === p.dia ? ' sel' : '') + (d.getMonth() !== m.getMonth() ? ' fuera' : '') + '" data-a="agDia" data-v="' + iso + '">' + d.getDate() + '<em>' + puntos + '</em></button>';
      }
      h += '<div class="card cal"><div class="wk">' + LETRAS.map(d => '<span>' + d + '</span>').join('') + '</div><div class="dg">' + celdas + '</div></div>';
      const d = deISO(p.dia), evs = eventosDia(p.dia), ts = tareasDia(p.dia);
      h += '<h3>' + (p.dia === hoyISO() ? 'Hoy, ' : '') + d.getDate() + ' de ' + MESES[d.getMonth()] + '</h3>';
      h += (evs.length || ts.length) ? '<div class="list">' + evs.map(filaEv).join('') + ts.map(filaTareaAg).join('') + '</div>' : '<p class="texto">Nada este día.</p>';
    } else {
      const d0 = deISO(p.dia), lunes = sumaDias(d0, -(diaSemana(d0) - 1));
      const fin = sumaDias(lunes, 6);
      cargarMes(lunes); cargarMes(fin);
      const flechasS = flechas.replace(/agMes/g, 'agSem');
      h += head('Semana', lunes.getDate() + ' – ' + fin.getDate() + ' de ' + MESES[fin.getMonth()], flechasS) + '<div class="seg"><button data-a="pSet" data-k="vista" data-v="mes">Mes</button><button class="on">Semana</button></div>';
      h += '<div class="wkrow">' + LETRAS.map((l, i) => { const x = sumaDias(lunes, i), iso = isoDia(x); return '<button class="' + (iso === hoyISO() ? 't' : '') + (iso === p.dia ? ' s' : '') + '" data-a="agDia" data-v="' + iso + '"><small>' + l + '</small><b>' + x.getDate() + '</b></button>'; }).join('') + '</div>';
      for (let i = 0; i < 7; i++) {
        const x = sumaDias(lunes, i), iso = isoDia(x), evs = eventosDia(iso), ts = tareasDia(iso);
        if (!evs.length && !ts.length) continue;
        h += '<h3>' + cap(DIAS[x.getDay()]) + ' ' + x.getDate() + '</h3><div class="list">' + evs.map(filaEv).join('') + ts.map(filaTareaAg).join('') + '</div>';
      }
    }
    if (AG.error) h += '<div class="aviso mal">' + ic('error', 22, 0) + '<span>No he podido leer el calendario: ' + esc(AG.error) + ' Enseño lo último guardado.</span></div>';
    return h;
  },
  /* Al abrir la agenda se vuelve a leer el calendario: así sale lo que se haya creado en Google Calendar. */
  montar: (el, p) => { const d = p.mes ? deISO(p.mes) : new Date(); cargarMes(d, true); },
  fijo: () => '<button class="fab" data-a="nuevoEvento" aria-label="Nuevo evento">' + ic('anadir', 28) + '</button>'
};
ACC.agMes = el => { const p = Nav.actual().params, m = deISO(p.mes); m.setMonth(m.getMonth() + Number(el.dataset.v)); p.mes = isoDia(m); p.dia = m.getMonth() === new Date().getMonth() && m.getFullYear() === new Date().getFullYear() ? hoyISO() : p.mes; Nav.refrescar(true); };
ACC.agSem = el => { const p = Nav.actual().params; p.dia = isoDia(sumaDias(deISO(p.dia), 7 * Number(el.dataset.v))); const d = deISO(p.dia); p.mes = isoDia(new Date(d.getFullYear(), d.getMonth(), 1)); Nav.refrescar(true); };
ACC.agDia = el => { const p = Nav.actual().params; p.dia = el.dataset.v; Nav.refrescar(true); };
ACC.nuevoEvento = () => { const p = Nav.actual().params; Nav.ir('evento', { fecha: p.dia || hoyISO(), quien: [S.cfg.persona], tipo: 'recordatorio', aviso: '' }); };
function buscaEv(id) { let x = null; Object.keys(AG.cache).forEach(m => (AG.cache[m].ev || []).forEach(e => { if (e.id === id) x = e; })); return x; }
ACC.verEvento = el => Nav.ir('eventoVer', { id: el.dataset.id });

/* 32 · Nuevo evento / cambiar */
P.evento = {
  clase: 'con-boton', fija: true,
  html: p => {
    const conAvisos = S.cal && S.cal.avisos && S.cal.avisos.id !== S.cal.id;
    return tope(p.id ? 'Cambiar evento' : 'Nuevo evento') +
      fldTxt('eTit', 'Título', pv(p, 'eTit', p.titulo), 'Cena de cumpleaños', 'maxlength="150"') +
      '<label class="fld"><small>Fecha</small><input type="date" id="eFec" value="' + esc(pv(p, 'eFec', p.fecha)) + '"></label>' +
      (p.todoDia ? '' : '<div style="display:flex;gap:10px"><label class="fld" style="flex:1"><small>Empieza</small><input type="time" id="eIni" value="' + esc(pv(p, 'eIni', p.ini || '20:00')) + '"></label><label class="fld" style="flex:1"><small>Acaba</small><input type="time" id="eFin" value="' + esc(pv(p, 'eFin', p.fin || '21:00')) + '"></label></div>') +
      '<div class="row card" style="margin-top:4px"><b style="flex:1">Todo el día</b>' + swi(p.todoDia, 'pTog', 'data-k="todoDia"') + '</div>' +
      '<p class="lab2">Tipo</p><div class="chips">' + TIPOS_EV.map(t => '<button class="chip' + (p.tipo === t[0] ? ' on' : '') + '" data-a="pSet" data-k="tipo" data-v="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' +
      '<p class="lab2">Quién va</p><div class="chips">' + personas().map(x => { const on = (p.quien || []).indexOf(x.id) >= 0; return '<button class="chip' + (on ? ' on' : '') + '" data-a="evQuien" data-v="' + x.id + '" style="' + (on ? 'background:' + x.color + ';border-color:' + x.color + ';color:#fff' : '') + '">' + esc(x.nombre) + '</button>'; }).join('') + '</div>' +
      fldTxt('eLug', 'Lugar', pv(p, 'eLug', p.lugar), 'Opcional', 'maxlength="200"') +
      '<div class="list" style="margin-top:6px">' + filaAviso(p.aviso, 'evAviso') + (conAvisos && p.aviso !== '' && p.aviso !== undefined ? '<div class="row card"><div class="f"><b>Avisar también en «' + esc(S.cal.avisos.nombre) + '»</b><small>Para que suene a quien solo tiene avisos en ese calendario</small></div>' + swi(p.copia, 'pTog', 'data-k="copia"') + '</div>' : '') + '</div>' +
      fldArea('eNot', 'Notas', pv(p, 'eNot', p.notas), 'Opcional') +
      '<p class="texto" style="font-size:13px;margin-top:6px">Se guarda en «' + esc((S.cal || {}).nombre || 'tu calendario principal') + '».</p>' +
      (p.id ? '<button class="btn sec peligro" data-a="borrarEvento" data-id="' + esc(p.id) + '" style="margin-top:12px">Borrar evento</button>' : '');
  },
  fijo: p => '<div class="btns">' + btn(p.id ? 'Guardar cambios' : 'Guardar evento', 'guardarEvento') + '</div>'
};
ACC.evQuien = el => { const p = Nav.actual().params; p.quien = p.quien || []; const i = p.quien.indexOf(el.dataset.v); if (i >= 0) p.quien.splice(i, 1); else p.quien.push(el.dataset.v); repintar(); };
ACC.evAviso = () => { const e = Nav.actual(); guardarCampos(e); hojaOpciones('Aviso', AVISOS, e.params.aviso, v => { e.params.aviso = v; Nav.refrescar(true); }); };
ACC.guardarEvento = el => conEspera(el, async () => {
  const e = Nav.actual(); guardarCampos(e);
  const p = e.params, titulo = cap(val('eTit')), fecha = val('eFec');
  if (!titulo) return toast('Ponle un título.');
  if (!fecha) return toast('Elige la fecha.');
  const d = deISO(fecha);
  let ini, fin;
  if (p.todoDia) { ini = d; fin = sumaDias(d, 1); }
  else {
    const a = val('eIni') || '20:00', b = val('eFin') || a;
    ini = new Date(d); ini.setHours(+a.slice(0, 2), +a.slice(3));
    fin = new Date(d); fin.setHours(+b.slice(0, 2), +b.slice(3));
    if (fin <= ini) fin = new Date(ini.getTime() + 3600000);
  }
  try {
    await api('evento-guardar', { ev: { id: p.id || '', titulo: titulo, inicio: ini.getTime(), fin: fin.getTime(), todoDia: !!p.todoDia, lugar: val('eLug'), notas: val('eNot'), tipo: p.tipo, quien: (p.quien || []).join(','), aviso: p.aviso === undefined ? '' : p.aviso, copia: !!p.copia } });
    await cargarMes(d, true);
    Nav.atras(p.id ? 2 : 1);
    toast(p.id ? 'Evento cambiado' : 'Evento guardado en el calendario');
  } catch (x) { toast(x.code === 'sinred' ? 'Sin conexión: los eventos se guardan directamente en el calendario, prueba al volver la red.' : x.message); }
});
ACC.borrarEvento = async el => {
  const e = buscaEv(el.dataset.id);
  if (!await preguntar('¿Borrar «' + (e ? e.titulo : 'el evento') + '»?', 'Se borra también de vuestro calendario de Google.', 'Borrar', true)) return;
  try { await api('evento-borrar', { id: el.dataset.id }); Object.keys(AG.cache).forEach(m => { AG.cache[m].ev = (AG.cache[m].ev || []).filter(x => x.id !== el.dataset.id); }); Nav.atras(Nav.actual().id === 'evento' ? 2 : 1); toast('Evento borrado'); }
  catch (x) { toast(x.message); }
};

/* 33 · Detalle de evento */
P.eventoVer = {
  clase: 'con-boton',
  html: p => {
    const e = buscaEv(p.id);
    if (!e) return tope('Evento') + '<p class="mu">Este evento ya no está.</p>';
    const d = new Date(e.inicio);
    const quien = String(e.quien || '').split(',').map(x => dato('personas', x)).filter(Boolean);
    return tope('Evento', '<button class="rt" data-a="editarEvento" data-id="' + esc(e.id) + '" style="border:0;background:none">' + ic('editar', 24) + '</button>') +
      '<div class="card" style="padding:18px;background:color-mix(in srgb,' + colorEv(e) + ' 26%,var(--sf))"><p class="eye">' + cap(DIAS[d.getDay()]) + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' · ' + horaEv(e) + '</p><h1 style="font-size:26px;margin:4px 0 ' + (e.lugar ? '12px' : '0') + '">' + esc(e.titulo) + '</h1>' + (e.lugar ? '<div style="display:flex;gap:10px;align-items:center">' + ic('ubicacion', 22, 4) + '<b>' + esc(e.lugar) + '</b></div>' : '') + '</div>' +
      (quien.length ? '<h3>Quién va</h3><div class="list">' + quien.map(x => '<div class="row card">' + av(x, 40) + '<b>' + esc(x.nombre) + '</b></div>').join('') + '</div>' : '') +
      '<div class="card" style="padding:4px 16px;margin-top:14px"><div class="kv"><small>Aviso</small><b>' + (e.aviso === undefined || e.aviso === null ? 'Sin aviso de Ronda' : textoAviso(e.aviso)) + '</b></div>' + (e.copia ? '<div class="kv"><small>También en</small><b>' + esc(((S.cal || {}).avisos || {}).nombre || '') + '</b></div>' : '') + '</div>' +
      (e.notas ? '<h3>Notas</h3><div class="card" style="padding:14px 16px;font-weight:600;white-space:pre-wrap">' + esc(e.notas) + '</div>' : '');
  },
  fijo: p => '<div class="btns"><a class="btn pri" href="https://calendar.google.com/calendar/r/day/' + (buscaEv(p.id) ? (d => d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate())(new Date(buscaEv(p.id).inicio)) : '') + '" target="_blank" rel="noopener" style="text-decoration:none">Abrir en el calendario</a><button class="btn sec" data-a="borrarEvento" data-id="' + esc(p.id) + '">Borrar evento</button></div>'
};
ACC.editarEvento = el => {
  const e = buscaEv(el.dataset.id); if (!e) return;
  const a = new Date(e.inicio), b = new Date(e.fin);
  Nav.ir('evento', { id: e.id, titulo: e.titulo, fecha: isoDia(a), ini: hora(a), fin: hora(b), todoDia: e.todoDia, lugar: e.lugar, notas: e.notas, tipo: e.tipo || 'recordatorio', quien: String(e.quien || '').split(',').filter(Boolean), aviso: e.aviso === undefined || e.aviso === null ? '' : String(e.aviso), copia: e.copia });
};

document.addEventListener('visibilitychange', () => { if (document.hidden || !S.cfg) return; const p = Nav.actual(); if (p && p.id === 'agenda') cargarMes(p.params.mes ? deISO(p.params.mes) : new Date(), true); });
