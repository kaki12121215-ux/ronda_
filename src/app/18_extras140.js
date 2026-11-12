/* ============================ 1.4.0 · TURNOS, LISTAS, ACTIVIDAD, RESUMEN, TIEMPO, COPIA Y COMPARTIR ============================ */

/* ---------- Turnos: lo que os vais alternando ----------
   turnos: { nombre, emoji, quienes[], rota: 'vez'|'semana'|'dias', dias {1..7: persona}, toca, semana (lunes en que se fijó),
             tareas (ponerlo en sus tareas), hist [{q, f, por, por2, salto}] }  ·  tarea del turno: tareas/tt<id> con campo turno. */
const ROTA = [['vez', 'Cada vez que se hace'], ['semana', 'Cada semana'], ['dias', 'Días fijos']];
const siguienteDe = (t, q) => { const qs = (t.quienes || []).filter(x => dato('personas', x)); if (!qs.length) return q; const i = qs.indexOf(q); return qs[(i + 1) % qs.length]; };
function tocaTurno(t) {
  if (t.rota === 'dias') return (t.dias || {})[diaSemana(new Date())] || '';
  if (t.rota === 'semana') {
    const lun = isoDia(lunesDe(new Date()));
    if (t.semana && t.semana < lun) { let q = t.toca; const n = Math.round((deISO(lun) - deISO(t.semana)) / (7 * 86400000)); for (let i = 0; i < n; i++) q = siguienteDe(t, q); return q; }
  }
  return t.toca || (t.quienes || [])[0] || '';
}
/* Si ha cambiado la semana, se apunta a quién le toca ahora (y se ajusta su tarea). */
function ponerAlDiaTurnos() {
  lista('turnos').forEach(t => {
    const q = tocaTurno(t), lun = isoDia(lunesDe(new Date()));
    if (t.rota === 'semana' && t.semana !== lun) cambiar('turnos', t.id, { toca: q, semana: lun });
    if (t.tareas) {
      const tt = dato('tareas', 'tt' + t.id);
      if (!tt || tt.para !== q || tt.titulo !== t.nombre) cambiar('tareas', 'tt' + t.id, { titulo: t.nombre, para: q || 'todos', fecha: t.rota === 'dias' ? hoyISO() : '', hora: '', hecho: false, turno: t.id, creadoPor: t.creadoPor || S.cfg.persona });
    } else if (dato('tareas', 'tt' + t.id)) cambiar('tareas', 'tt' + t.id, { _b: 1 });
  });
}
function turnoHecho(id, quien, salto) {
  const t = dato('turnos', id); if (!t) return;
  const toca = tocaTurno(t), hist = (t.hist || []).concat([{ q: quien || toca, f: hoyISO(), por: S.cfg.persona, por2: quien && quien !== toca ? toca : '', salto: !!salto }]).slice(-30);
  const c = { hist: hist };
  if (t.rota !== 'dias') { c.toca = siguienteDe(t, salto ? toca : (quien || toca)); if (t.rota === 'semana') c.semana = isoDia(lunesDe(new Date())); }
  cambiar('turnos', id, c);
  setTimeout(ponerAlDiaTurnos, 50);
  return Object.assign({}, t, c);
}
P.turnos = {
  clase: 'con-barra',
  html: () => {
    const l = lista('turnos').sort((a, b) => (a.creado || 0) - (b.creado || 0));
    let h = tope('') + '<div data-r="banda">' + banda() + '</div>' + head('Turnos', 'Lo que os vais alternando');
    if (!l.length) return h + vacio('sin-tareas', 'Sin turnos', 'Basura, baño, fregar… Ronda decide a quién le toca y lo pasa al otro al hacerlo.') + '<h3>Para empezar</h3><div class="chips">' + [['🗑️', 'Sacar la basura'], ['🛁', 'Limpiar el baño'], ['🍽️', 'Fregar'], ['🍳', 'Hacer la cena']].map(x => '<button class="chip" data-a="turnoSug" data-e="' + x[0] + '" data-n="' + esc(x[1]) + '">' + x[0] + ' ' + esc(x[1]) + '</button>').join('') + '</div>';
    return h + '<div class="card grp">' + l.map(t => { const q = tocaTurno(t); return '<button class="row" data-a="ir" data-id="turno" data-tid="' + t.id + '">' + emo(t.emoji, sq('turno', 2), 44) + '<div class="f"><b>' + esc(t.nombre) + '</b><small>' + (ROTA.find(r => r[0] === t.rota) || ROTA[0])[1] + '</small></div><span class="tk">' + (dato('personas', q) ? av(dato('personas', q), 30) : '') + '<small>' + esc(nombreDe(q)) + '</small></span></button>'; }).join('') + '</div>';
  },
  fijo: () => '<button class="fab" data-a="ir" data-id="turnoEditar" aria-label="Nuevo turno">' + ic('anadir', 28) + '</button>'
};
ACC.turnoSug = el => Nav.ir('turnoEditar', { nombre: el.dataset.n, emoji: el.dataset.e });
P.turno = {
  html: p => {
    const t = dato('turnos', p.tid); if (!t) return tope('') + '<p class="mu">Este turno ya no existe.</p>';
    const q = tocaTurno(t), yoQ = S.cfg.persona;
    return tope((t.emoji ? t.emoji + ' ' : '') + t.nombre, '<button class="rt" data-a="ir" data-id="turnoEditar" data-tid="' + t.id + '" aria-label="Cambiar">' + ic('editar', 22) + '</button>') +
      '<div class="turn"><small>Le toca a</small>' + (dato('personas', q) ? av(dato('personas', q), 72) : '') + '<b>' + esc(nombreDe(q) || 'Nadie') + '</b><span>' + (ROTA.find(r => r[0] === t.rota) || ROTA[0])[1] + '</span></div>' +
      '<button class="btn pri" data-a="turnoHecho" data-tid="' + t.id + '">Hecho' + (q && q !== yoQ ? ' (lo ha hecho ' + esc(nombreDe(q)) + ')' : '') + '</button>' +
      (t.rota !== 'dias' ? '<div class="btns2">' + (q !== yoQ ? '<button class="btn sec" data-a="turnoYo" data-tid="' + t.id + '">Hoy lo hago yo</button>' : '') + '<button class="btn sec" data-a="turnoSaltar" data-tid="' + t.id + '">Saltar esta vez</button></div>' +
        '<p class="lab2">Cambiar a quién le toca</p>' + chipsPersonas(q, 'turnoToca') : '') +
      '<h3>Últimas veces</h3>' + ((t.hist || []).length ? '<div class="card grp">' + t.hist.slice().reverse().slice(0, 10).map(x => '<div class="row">' + (dato('personas', x.q) ? av(dato('personas', x.q), 26) : '') + '<b style="flex:1">' + esc(nombreDe(x.q)) + (x.salto ? ' <small class="k">· saltado</small>' : '') + '</b><small class="k">' + cuando(x.f).replace(/^./, c => c.toUpperCase()) + (x.por2 ? ' · lo hizo por ' + esc(nombreDe(x.por2)) : '') + '</small></div>').join('') + '</div>' : '<p class="texto">Todavía no se ha hecho ninguna vez.</p>');
  }
};
ACC.turnoHecho = el => { const t = turnoHecho(el.dataset.tid, tocaTurno(dato('turnos', el.dataset.tid))); Nav.refrescar(true); toast('Hecho' + (t && t.rota !== 'dias' ? '. Ahora le toca a ' + nombreDe(tocaTurno(t)) : '')); };
ACC.turnoYo = el => { const t = turnoHecho(el.dataset.tid, S.cfg.persona); Nav.refrescar(true); toast('Apuntado como tuyo. Ahora le toca a ' + nombreDe(tocaTurno(t))); };
ACC.turnoSaltar = el => { const t = turnoHecho(el.dataset.tid, '', true); Nav.refrescar(true); toast('Saltado. Ahora le toca a ' + nombreDe(tocaTurno(t))); };
ACC.turnoToca = el => { const id = Nav.actual().params.tid; cambiar('turnos', id, { toca: el.dataset.v, semana: isoDia(lunesDe(new Date())) }); setTimeout(ponerAlDiaTurnos, 50); Nav.refrescar(true); };
P.turnoEditar = {
  clase: 'con-boton', fija: true,
  html: p => {
    if (!p.ini) { p.ini = true; const t = p.tid ? dato('turnos', p.tid) : null; Object.assign(p, t ? { nombre: t.nombre, emoji: t.emoji, quienes: (t.quienes || []).slice(), rota: t.rota, dias: Object.assign({}, t.dias || {}), toca: tocaTurno(t), tareas: t.tareas !== false } : { quienes: personas().map(x => x.id), rota: 'vez', dias: {}, toca: S.cfg.persona, tareas: true }); }
    const ps = personas().filter(x => p.quienes.indexOf(x.id) >= 0);
    let h = tope(p.tid ? 'Cambiar turno' : 'Nuevo turno') + filaNombreEmoji('trEmo', pv(p, 'trEmo', p.emoji), fldTxt('trNom', 'Nombre', pv(p, 'trNom', p.nombre), 'Basura, baño, fregar…', 'maxlength="40"')) +
      '<p class="lab2">Quiénes</p><div class="chips">' + personas().map(x => '<button class="chip' + (p.quienes.indexOf(x.id) >= 0 ? ' on' : '') + '" data-a="trQuien" data-v="' + x.id + '">' + esc(x.nombre) + '</button>').join('') + '</div>' +
      '<p class="lab2">Cómo rota</p><div class="chips">' + ROTA.map(r => '<button class="chip' + (p.rota === r[0] ? ' on' : '') + '" data-a="pSet" data-k="rota" data-v="' + r[0] + '">' + r[1] + '</button>').join('') + '</div>';
    if (p.rota === 'dias') h += '<div class="card grp" style="margin-top:8px">' + [1, 2, 3, 4, 5, 6, 7].map(d => '<div class="row"><b style="width:90px">' + cap(DIAS[d % 7]) + '</b><div class="chips" style="flex:1">' + ps.map(x => '<button class="chip' + (p.dias[d] === x.id ? ' on' : '') + '" data-a="trDia" data-d="' + d + '" data-v="' + x.id + '">' + esc(x.nombre) + '</button>').join('') + '</div></div>').join('') + '</div>';
    else h += '<p class="lab2">' + (p.tid ? 'Le toca ahora' : 'Empieza') + '</p><div class="chips">' + ps.map(x => '<button class="chip' + (p.toca === x.id ? ' on' : '') + '" data-a="pSet" data-k="toca" data-v="' + x.id + '">' + esc(x.nombre) + '</button>').join('') + '</div>';
    h += '<div class="row card" style="margin-top:14px"><div class="f"><b>Ponerlo en sus tareas</b><small>A quien le toque le sale como tarea</small></div>' + swi(!!p.tareas, 'pTog', 'data-k="tareas"') + '</div>';
    if (p.tid) h += '<button class="btn sec peligro" data-a="turnoBorrar" style="margin-top:14px">Borrar turno</button>';
    return h;
  },
  fijo: p => '<div class="btns">' + btn(p.tid ? 'Guardar' : 'Crear turno', 'turnoGuardar') + '</div>'
};
ACC.trQuien = el => { const e = Nav.actual(); guardarCampos(e); const q = e.params.quienes, i = q.indexOf(el.dataset.v); if (i >= 0) { if (q.length <= 1) return toast('Hace falta al menos una persona.'); q.splice(i, 1); } else q.push(el.dataset.v); Nav.refrescar(true); };
ACC.trDia = el => { const e = Nav.actual(); guardarCampos(e); e.params.dias[el.dataset.d] = el.dataset.v; Nav.refrescar(true); };
ACC.turnoGuardar = () => {
  const e = Nav.actual(); guardarCampos(e); const p = e.params, n = cap(val('trNom'));
  if (!n) return toast('Ponle un nombre al turno.');
  const id = p.tid || 'u' + uid();
  const c = { nombre: n, emoji: primerEmoji(val('trEmo')), quienes: p.quienes, rota: p.rota, dias: p.dias, toca: p.quienes.indexOf(p.toca) >= 0 ? p.toca : p.quienes[0], semana: isoDia(lunesDe(new Date())), tareas: !!p.tareas };
  if (!p.tid) { c.creado = Date.now(); c.creadoPor = S.cfg.persona; c.hist = []; }
  cambiar('turnos', id, c);
  setTimeout(ponerAlDiaTurnos, 50);
  Nav.atras(); if (!p.tid) Nav.ir('turno', { tid: id }); toast('Turno guardado');
};
ACC.turnoBorrar = async () => {
  const p = Nav.actual().params;
  if (!await preguntar('¿Borrar el turno «' + (p.nombre || '') + '»?', 'Se borra también su tarea.', 'Borrar', true)) return;
  cambiar('turnos', p.tid, { _b: 1 }); if (dato('tareas', 'tt' + p.tid)) cambiar('tareas', 'tt' + p.tid, { _b: 1 });
  Nav.atras(2); toast('Turno borrado');
};
/* Marcar la tarea de un turno: cuenta como hecho y pasa al siguiente. */
const _hacerTarea140 = ACC.hacerTarea;
ACC.hacerTarea = (el, ev) => {
  const x = dato('tareas', el.dataset.id);
  if (!x || !x.turno || x.hecho) return _hacerTarea140(el, ev);
  if (ev) ev.stopPropagation();
  el.classList.add('on'); el.style.background = (yo() || {}).color; el.style.borderColor = 'transparent';
  setTimeout(() => { const t = turnoHecho(x.turno, S.cfg.persona); Nav.refrescar(true); toast('Hecho' + (t && t.rota !== 'dias' ? '. Ahora le toca a ' + nombreDe(tocaTurno(t)) : '')); }, 450);
};
wd('turnosHoy', 'Turnos de hoy', 'Turnos', 'S', cLA, 'A quién le toca cada turno', () => {
  const l = lista('turnos'); if (!l.length) return { vacio: true, h: lab('Turnos de hoy') + '<p class="mu2">Sin turnos</p>' };
  return { vacio: false, h: lab('Turnos de hoy') + l.slice(0, 4).map(t => { const q = tocaTurno(t); return '<div class="ev2">' + (dato('personas', q) ? av(dato('personas', q), 24) : '') + '<b class="tt2" style="font-size:14px">' + (t.emoji ? esc(t.emoji) + ' ' : '') + esc(t.nombre) + '</b></div>'; }).join('') };
});
W.turnosHoy.ir = 'wTurnos';
ACC.wTurnos = () => ACC.abrirMod({ dataset: { id: 'turnos' } });

/* ---------- Listas reutilizables ----------
   listasr: { nombre, emoji, creado }  ·  listasri: { lista, t, s (sección), h (hecha), orden } (un registro por cosa) */
const PLANT_LISTAS = [
  ['🧳', 'Maleta', { Ropa: ['Pijama', 'Ropa interior', 'Calcetines', 'Camisetas', 'Pantalones', 'Jersey', 'Bañador'], Neceser: ['Cepillo de dientes', 'Pasta de dientes', 'Desodorante', 'Champú', 'Peine', 'Pastillas'], Otros: ['Cargador del móvil', 'Auriculares', 'Documentación', 'Gafas de sol'] }],
  ['🚪', 'Antes de irnos', { '': ['Cerrar el gas', 'Bajar la basura', 'Cerrar las ventanas', 'Regar las plantas', 'Comida para los peces', 'Desenchufar aparatos', 'Vaciar la nevera de lo que caduca', 'Llaves'] }],
  ['🧽', 'Limpieza a fondo', { '': ['Cristales', 'Horno', 'Nevera por dentro', 'Campana', 'Debajo de las camas', 'Cortinas', 'Colchones', 'Juntas del baño'] }],
  ['📦', 'Mudanza', { '': ['Cajas', 'Cinta de embalar', 'Cambiar la dirección en el banco', 'Dar de alta la luz', 'Dar de alta el agua', 'Internet', 'Empadronamiento', 'Llaves nuevas'] }],
  ['🍼', 'Bebé de viaje', { '': ['Pañales', 'Toallitas', 'Biberón', 'Leche', 'Chupete', 'Ropa de cambio', 'Crema', 'Termómetro', 'Juguete'] }]
];
const itemsDe = lid => lista('listasri').filter(x => x.lista === lid).sort((a, b) => (a.orden || 0) - (b.orden || 0));
P.listasr = {
  clase: 'con-barra',
  html: () => {
    const l = lista('listasr').sort((a, b) => (a.creado || 0) - (b.creado || 0));
    let h = tope('') + '<div data-r="banda">' + banda() + '</div>' + head('Listas', 'Para repetir cada vez');
    if (l.length) h += '<div class="list">' + l.map(x => { const it = itemsDe(x.id), hechas = it.filter(i => i.h).length; return '<button class="card lr" data-a="ir" data-id="listar" data-lid="' + x.id + '">' + emo(x.emoji, sq('lista-repetir', 4), 44) + '<div class="f"><b>' + esc(x.nombre) + '</b><small>' + (!it.length ? 'Vacía' : hechas === it.length ? it.length + ' de ' + it.length + ' · hecha' : hechas ? hechas + ' de ' + it.length : 'Sin empezar') + '</small><span class="wb"><i style="width:' + (it.length ? Math.round(hechas / it.length * 100) : 0) + '%;background:' + COL[4] + '"></i></span></div>' + chev + '</button>'; }).join('') + '</div>';
    else h += vacio('sin-tareas', 'Sin listas', 'Para lo que se repite: la maleta, antes de irse de viaje, la limpieza a fondo…');
    return h + '<button class="row card dash" data-a="listaRNueva" style="margin-top:12px">' + ic('anadir', 22) + '<b>Nueva lista</b></button><p class="lab2">Para empezar</p><div class="chips">' + PLANT_LISTAS.map((x, i) => '<button class="chip" data-a="listaRPlant" data-i="' + i + '">' + x[0] + ' ' + esc(x[1]) + '</button>').join('') + '</div>';
  }
};
ACC.listaRPlant = el => {
  const x = PLANT_LISTAS[+el.dataset.i], id = 'r' + uid();
  cambiar('listasr', id, { nombre: x[1], emoji: x[0], creado: Date.now(), creadoPor: S.cfg.persona });
  let o = 0; Object.keys(x[2]).forEach(s => x[2][s].forEach(t => cambiar('listasri', 'i' + uid(), { lista: id, t: t, s: s, h: false, orden: o++ })));
  Nav.ir('listar', { lid: id });
};
ACC.listaRNueva = () => abrirHoja('<h3>Nueva lista</h3>' + filaNombreEmoji('lrEmo', '', '<label class="fld"><small>Nombre</small><input id="lrNom" maxlength="40" placeholder="Maleta, camping…"></label>') + '<button class="btn pri" data-a="listaRCrear" style="margin-top:14px">Crear</button>');
ACC.listaRCrear = () => { const n = cap(val('lrNom')); if (!n) return toast('Ponle un nombre.'); const id = 'r' + uid(); cambiar('listasr', id, { nombre: n, emoji: primerEmoji(val('lrEmo')), creado: Date.now(), creadoPor: S.cfg.persona }); cerrarHoja(); Nav.ir('listar', { lid: id }); };
P.listar = {
  clase: 'con-boton',
  html: p => {
    const l = dato('listasr', p.lid); if (!l) return tope('') + '<p class="mu">Esta lista ya no existe.</p>';
    const it = itemsDe(l.id), hechas = it.filter(i => i.h).length, secs = [];
    it.forEach(i => { if (secs.indexOf(i.s || '') < 0) secs.push(i.s || ''); });
    let h = tope((l.emoji ? l.emoji + ' ' : '') + l.nombre, '<button class="rt" data-a="listaRMenu" aria-label="Más">' + ic('menu', 24) + '</button>') + '<div class="prog2" style="margin:2px 0 14px"><i style="width:' + (it.length ? Math.round(hechas / it.length * 100) : 0) + '%;background:' + COL[4] + '"></i></div>';
    h += secs.map(s => (s ? '<h3>' + esc(s) + '</h3>' : '') + '<div class="card grp">' + it.filter(i => (i.s || '') === s).map(i => '<div class="row' + (i.h ? ' dn' : '') + '" data-lp="lrItemLP" data-id="' + i.id + '"><button class="ck' + (i.h ? ' on' : '') + '" data-a="lrTog" data-id="' + i.id + '" style="' + (i.h ? 'background:' + COL[4] + ';border-color:transparent' : 'border-color:' + COL[4]) + '">' + tick(16) + '</button><b>' + esc(i.t) + '</b></div>').join('') + '</div>').join('');
    h += '<div class="fld fldr" style="margin-top:12px"><div class="f"><small>Añadir</small><input id="lrNuevo" maxlength="60" placeholder="Algo más…" enterkeyhint="done"></div><input id="lrSec" maxlength="20" placeholder="Sección (opcional)" style="width:42%;border:0;outline:0;background:none;font:600 14px Nunito;color:inherit"><button class="mini" data-a="lrAnadir">Añadir</button></div>';
    return h;
  },
  tras(el) { const i = $('#lrNuevo', el); if (i) i.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ACC.lrAnadir(); } }); },
  montar(el) { P.listar.tras(el); },
  fijo: () => '<div class="btns">' + btn(ic('repetir', 18) + ' Empezar de nuevo', 'lrReiniciar', 'sec') + '</div>'
};
ACC.lrTog = el => { const x = dato('listasri', el.dataset.id); if (!x) return; cambiar('listasri', x.id, { h: !x.h }); Nav.refrescar(true); };
ACC.lrAnadir = () => { const p = Nav.actual().params, t = cap(val('lrNuevo')); if (!t) return; const it = itemsDe(p.lid); cambiar('listasri', 'i' + uid(), { lista: p.lid, t: t, s: cap(val('lrSec')), h: false, orden: it.length ? (it[it.length - 1].orden || 0) + 1 : 0 }); Nav.refrescar(true); setTimeout(() => { const i = $('#lrNuevo'); if (i) i.focus(); }, 30); };
ACC.lrReiniciar = () => { const p = Nav.actual().params, it = itemsDe(p.lid).filter(i => i.h); if (!it.length) return toast('No hay nada marcado.'); it.forEach(i => cambiar('listasri', i.id, { h: false })); Nav.refrescar(true); toast('Lista desmarcada para la próxima vez', 'Deshacer', () => { it.forEach(i => cambiar('listasri', i.id, { h: true })); Nav.refrescar(); }); };
ACC.lrItemLP = el => { const x = dato('listasri', el.dataset.id); if (!x) return; abrirHoja('<h3>' + esc(x.t) + '</h3><div class="list"><button class="row card" data-a="lrBorrar" data-id="' + x.id + '">' + ic('borrar', 24, 0) + '<b>Quitar de la lista</b></button></div>'); };
ACC.lrBorrar = el => { const id = el.dataset.id; cambiar('listasri', id, { _b: 1 }); cerrarHoja(); Nav.refrescar(true); toast('Quitado', 'Deshacer', () => { cambiar('listasri', id, { _b: 0 }); Nav.refrescar(); }); };
ACC.listaRMenu = () => { const p = Nav.actual().params, l = dato('listasr', p.lid); abrirHoja('<h3>' + esc(l.nombre) + '</h3><div class="list"><button class="row card" data-a="lrRenombrar">' + ic('editar', 24) + '<b>Cambiar nombre y emoji</b></button><button class="row card" data-a="lrBorrarLista">' + ic('borrar', 24, 0) + '<b>Borrar lista</b></button></div>'); };
ACC.lrRenombrar = () => { const p = Nav.actual().params, l = dato('listasr', p.lid); cerrarHoja(); setTimeout(() => abrirHoja('<h3>Cambiar</h3>' + filaNombreEmoji('lrEmo', l.emoji || '', '<label class="fld"><small>Nombre</small><input id="lrNom" maxlength="40" value="' + esc(l.nombre) + '"></label>') + '<button class="btn pri" data-a="lrRenOk" style="margin-top:14px">Guardar</button>'), 350); };
ACC.lrRenOk = () => { const p = Nav.actual().params, n = cap(val('lrNom')); if (!n) return; cambiar('listasr', p.lid, { nombre: n, emoji: primerEmoji(val('lrEmo')) }); cerrarHoja(); Nav.refrescar(true); };
ACC.lrBorrarLista = async () => { cerrarHoja(); const p = Nav.actual().params; if (!await preguntar('¿Borrar la lista?', 'Se borra con todo lo que tiene.', 'Borrar', true)) return; itemsDe(p.lid).forEach(i => cambiar('listasri', i.id, { _b: 1 })); cambiar('listasr', p.lid, { _b: 1 }); Nav.atras(); toast('Lista borrada'); };

/* ---------- Actividad ---------- */
P.actividad = {
  html: p => {
    p.q = p.q || ''; p.s = p.s || '';
    let l = actividades(30);
    if (p.q) l = l.filter(a => a.q === p.q);
    if (p.s) l = l.filter(a => COLNOM[a.col] === p.s);
    const secs = []; actividades(30).forEach(a => { const s = COLNOM[a.col]; if (s && secs.indexOf(s) < 0) secs.push(s); });
    let h = tope('') + head('Actividad', 'Últimos 30 días') + '<div class="chips" style="flex-wrap:nowrap;overflow-x:auto;margin-bottom:6px"><button class="chip' + (!p.q ? ' on' : '') + '" data-a="pSet" data-k="q" data-v="">Todo</button>' + personas().map(x => '<button class="chip' + (p.q === x.id ? ' on' : '') + '" data-a="pSet" data-k="q" data-v="' + x.id + '" style="flex:none">' + esc(x.nombre) + '</button>').join('') + '</div>' +
      (secs.length > 1 ? '<div class="chips" style="flex-wrap:nowrap;overflow-x:auto;margin-bottom:10px"><button class="chip' + (!p.s ? ' on' : '') + '" data-a="pSet" data-k="s" data-v="" style="flex:none">Todas las secciones</button>' + secs.map(s => '<button class="chip' + (p.s === s ? ' on' : '') + '" data-a="pSet" data-k="s" data-v="' + esc(s) + '" style="flex:none">' + esc(s) + '</button>').join('') + '</div>' : '');
    if (!l.length) return h + vacio('sin-avisos', 'Nada por aquí', 'Cuando alguien añada, cambie o borre algo, saldrá aquí.');
    let dia = '';
    return h + l.slice(0, 200).map(a => {
      const d = isoDia(new Date(a.cuando)); let sep = '';
      if (d !== dia) { sep = (dia ? '</div>' : '') + '<p class="lab2">' + cap(cuando(d)) + '</p><div class="card grp">'; dia = d; }
      const r = S.recs[a.col] && S.recs[a.col][a.ref], borrado = a.acc === 'b' && r && r.f._b;
      return sep + '<div class="row">' + (dato('personas', a.q) ? av(dato('personas', a.q), 30) : sq('tarjeta', 7)) + '<div class="f"><b style="font-size:15px">' + textoActividad(a) + '</b><small>' + esc(COLNOM[a.col] || '') + ' · ' + hora(new Date(a.cuando)) + '</small></div>' + (borrado ? '<button class="mini" data-a="actRecuperar" data-col="' + a.col + '" data-ref="' + esc(a.ref) + '">Recuperar</button>' : '') + '</div>';
    }).join('') + '</div>';
  }
};
ACC.actRecuperar = el => { cambiar(el.dataset.col, el.dataset.ref, { _b: 0 }); Nav.refrescar(true); toast('Recuperado'); };
wd('ultCambios', 'Últimos cambios', 'Varios', 'L', cAZ, 'Lo último que se ha añadido, cambiado o borrado', () => {
  const l = actividades(7).slice(0, 4);
  return { vacio: !l.length, h: lab('Últimos cambios', wlink('Ver todo', 'wActividad')) + (l.length ? l.map(a => '<div class="ucr">' + (dato('personas', a.q) ? av(dato('personas', a.q), 24) : '') + '<div class="f"><b style="font-size:14px">' + textoActividad(a) + '</b></div><small class="mu2" style="margin:0;flex:none">' + (isoDia(new Date(a.cuando)) === hoyISO() ? hora(new Date(a.cuando)) : fechaCortaTxt(isoDia(new Date(a.cuando)))) + '</small></div>').join('') : '<p class="mu2">Nada en los últimos días</p>') };
});
W.ultCambios.ir = 'wActividad';
ACC.wActividad = () => Nav.ir('actividad', {});

/* ---------- Resumen del domingo (lo escribe Gemini en el script) ---------- */
const resumenOn = () => ((dato('ajustes', 'resumen') || {}).on !== false) && !(yo() || {}).resumenOff;
function resumenActual() {
  const d = new Date(), ds = diaSemana(d); if (ds !== 7 && ds !== 1) return null;
  const dom = ds === 7 ? hoyISO() : isoDia(sumaDias(d, -1));
  const r = dato('resumen', 'r' + dom.replace(/-/g, ''));
  return r && (yo() || {}).resumenVisto !== r.id ? r : null;
}
wd('resumen', 'Resumen del domingo', 'Varios', 'L', cLV, 'Vuestra semana en tres líneas. Sale el domingo y se queda hasta el lunes', () => {
  const r = resumenOn() ? resumenActual() : null;
  if (!r) return { vacio: true, h: lab('Vuestra semana') + '<p class="mu2">' + (resumenOn() ? 'Sale el domingo por la mañana' : 'Apagado en Ajustes') + '</p>' };
  return { vacio: false, h: lab('Vuestra semana', '<button class="wa" data-a="resumenCerrar" data-id="' + r.id + '" aria-label="Quitar">' + ic('cerrar', 16) + '</button>') + '<p class="rsm">' + esc(r.texto || '') + '</p>' +
    '<div class="rsn">' + [[r.gastado !== undefined ? euros(r.gastado).replace(',00', '') : '—', 'gastado'], [r.tareas !== undefined ? r.tareas : '—', 'tareas'], [r.cuidados !== undefined ? r.cuidados : '—', 'cuidados']].map(x => '<div><b>' + x[0] + '</b><small>' + x[1] + '</small></div>').join('') + '</div>' + (r.proximo ? '<p class="rsm2"><b>Esta semana:</b> ' + esc(r.proximo) + '</p>' : '') };
});
W.resumen.ir = '';
ACC.resumenCerrar = (el, ev) => { if (ev) ev.stopPropagation(); cambiar('personas', S.cfg.persona, { resumenVisto: el.dataset.id }); Nav.refrescar(true); };
P.resumenAj = {
  html: () => {
    const a = dato('ajustes', 'resumen') || {}, inc = Object.assign({ gastos: true, tareas: true, acuario: true, viene: true, menu: false }, a.incl || {});
    return tope('Resumen del domingo') + '<div class="card grp"><div class="row"><div class="f"><b>Resumen del domingo</b><small>En tu inicio, el domingo por la mañana</small></div>' + swi(!(yo() || {}).resumenOff, 'resTog') + '</div></div>' +
      '<p class="lab2">Qué incluye (para los dos)</p><div class="card grp">' + [['gastos', 'Gastos'], ['tareas', 'Tareas de cada uno'], ['acuario', 'Acuario'], ['viene', 'Lo que viene la semana'], ['menu', 'Menú']].map(x => '<div class="row"><b style="flex:1">' + x[1] + '</b>' + swi(!!inc[x[0]], 'resInc', 'data-k="' + x[0] + '"') + '</div>').join('') + '</div>' +
      '<p class="cap" style="text-align:left">Lo escribe Gemini en el script con los datos de la semana. Para que se haga solo, el script necesita tener activadas sus tareas automáticas (lo explica el paso a paso).</p>' +
      (esAdmin() ? '<div class="row card" style="margin-top:12px"><div class="f"><b>Generarlo para los dos</b><small>Si lo apagas aquí, no se escribe ninguno</small></div>' + swi(a.on !== false, 'resGlobal') + '</div><button class="btn sec" data-a="resumenAhora" style="margin-top:12px">Probar ahora</button>' : '');
  }
};
ACC.resTog = () => { cambiar('personas', S.cfg.persona, { resumenOff: !(yo() || {}).resumenOff }); Nav.refrescar(true); };
ACC.resInc = el => { const a = dato('ajustes', 'resumen') || {}, inc = Object.assign({ gastos: true, tareas: true, acuario: true, viene: true, menu: false }, a.incl || {}); inc[el.dataset.k] = !inc[el.dataset.k]; cambiar('ajustes', 'resumen', { incl: inc }); Nav.refrescar(true); };
ACC.resGlobal = () => { const a = dato('ajustes', 'resumen') || {}; cambiar('ajustes', 'resumen', { on: a.on === false }); Nav.refrescar(true); };
ACC.resumenAhora = el => conEspera(el, async () => { try { await Sync.ya(); const r = await api('resumen-ahora', {}, { ms: 60000 }); await Sync.ya(); toast(r.texto ? 'Resumen escrito' : 'Hecho'); } catch (e) { toast(e.message); } });

/* ---------- Tiempo (Open-Meteo: gratis y sin clave) ---------- */
const TIEMPO_ILUS = (() => {
  const sol = (x, y, r) => '<g transform="translate(' + x + ' ' + y + ')">' + [0, 1, 2, 3, 4, 5, 6, 7].map(i => '<rect x="-2.5" y="' + (-r - 11) + '" width="5" height="8" rx="2.5" fill="#F2B824" transform="rotate(' + i * 45 + ')"/>').join('') + '<circle r="' + r + '" fill="#F2B824"/></g>';
  const nube = (x, y, s, c) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-30 14h60a16 16 0 0 0 0-32 22 22 0 0 0-42-6A15 15 0 0 0-30 14z" fill="' + (c || '#fff') + '" stroke="#C9D8E3" stroke-width="2"/></g>';
  const gotas = (x, y, c) => [0, 1, 2].map(i => '<path d="M' + (x + i * 16) + ' ' + (y + i % 2 * 6) + 'l-4 9a4.5 4.5 0 1 0 8 0z" fill="' + (c || '#3C78C8') + '"/>').join('');
  const luna = '<path transform="translate(46 40)" d="M8-18a20 20 0 1 0 14 30A16 16 0 0 1 8-18z" fill="#F2B824"/><circle cx="74" cy="22" r="2.5" fill="#F2B824"/><circle cx="80" cy="46" r="2" fill="#F2B824"/>';
  const v = c => '<svg viewBox="0 0 100 80">' + c + '</svg>';
  return { sol: v(sol(50, 40, 18)), nubes: v(sol(36, 30, 13) + nube(56, 46, 1)), cubierto: v(nube(42, 34, 0.85, '#E3EDF3') + nube(60, 48, 1)), lluvia: v(nube(50, 32, 1.05, '#E3EDF3') + gotas(34, 56)), nieve: v(nube(50, 32, 1.05, '#fff') + gotas(34, 56, '#9FB0B8')), tormenta: v(nube(50, 32, 1.05, '#C9D8E3') + '<path d="M50 44l-8 14h7l-4 12 12-16h-7l5-10z" fill="#F2B824"/>'), noche: v(luna) };
})();
function tipoTiempo(code, dia) {
  const c = Number(code);
  if (c <= 1) return dia === 0 ? 'noche' : 'sol';
  if (c === 2) return dia === 0 ? 'noche' : 'nubes';
  if (c === 3 || c === 45 || c === 48) return 'cubierto';
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'nieve';
  if (c >= 95) return 'tormenta';
  return 'lluvia';
}
const TXT_TIEMPO = { sol: 'Despejado', nubes: 'Nubes y claros', cubierto: 'Nublado', lluvia: 'Lluvia', nieve: 'Nieve', tormenta: 'Tormenta', noche: 'Despejado' };
const COL_TIEMPO = { sol: cLI, nubes: cLI, cubierto: cAZ, lluvia: cAZ, nieve: cAZ, tormenta: cLV, noche: cLV };
const sitioTiempo = () => dato('ajustes', 'tiempo') || null;
let TIEMPO = null, TIEMPO_T = 0;
try { const c = JSON.parse(localStorage.getItem('rondaP-tiempo') || 'null'); if (c) { TIEMPO = c.d; TIEMPO_T = c.t; } } catch (e) { }
async function cargarTiempo(forzar) {
  const s = sitioTiempo(); if (!s || !s.lat) return;
  if (!forzar && TIEMPO && TIEMPO.k === s.lat + ',' + s.lon && Date.now() - TIEMPO_T < 30 * 60000) return;
  if (cargarTiempo.yendo) return; cargarTiempo.yendo = true;
  try {
    const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + s.lat + '&longitude=' + s.lon + '&current=temperature_2m,weather_code,is_day&hourly=temperature_2m,weather_code,precipitation_probability,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4';
    const r = await fetch(u, { cache: 'no-store' }); if (!r.ok) throw new Error('Open-Meteo ' + r.status);
    const j = await r.json(); j.k = s.lat + ',' + s.lon;
    TIEMPO = j; TIEMPO_T = Date.now();
    try { localStorage.setItem('rondaP-tiempo', JSON.stringify({ d: j, t: TIEMPO_T })); } catch (e) { }
    const a = Nav.actual(); if (a && a.id === 'inicio') Nav.refrescar();
  } catch (e) { anotar('tiempo', e); } finally { cargarTiempo.yendo = false; }
}
function datosTiempo() {
  const j = TIEMPO; if (!j || !j.current || !j.daily) return null;
  const ahora = j.current, tipo = tipoTiempo(ahora.weather_code, ahora.is_day);
  const hs = (j.hourly && j.hourly.time) || [], hIni = hs.findIndex(t => t >= String(ahora.time).slice(0, 13));
  const horas = []; for (let i = Math.max(0, hIni); i < hs.length && horas.length < 6; i += horas.length ? 2 : 2) horas.push({ h: horas.length ? hs[i].slice(11, 13) : 'Ahora', t: Math.round(j.hourly.temperature_2m[i]), k: tipoTiempo(j.hourly.weather_code[i], j.hourly.is_day[i]), p: j.hourly.precipitation_probability ? j.hourly.precipitation_probability[i] : 0 });
  const lluvia = hIni >= 0 ? hs.slice(hIni, hIni + 14).findIndex((t, i) => (j.hourly.precipitation_probability || [])[hIni + i] >= 50) : -1;
  let frase = TXT_TIEMPO[tipo];
  if (lluvia > 0) frase = 'Lluvia a partir de las ' + hs[hIni + lluvia].slice(11, 16);
  else if (lluvia === 0 && tipo !== 'lluvia' && tipo !== 'tormenta') frase = 'Puede llover ahora';
  else if (tipo === 'sol' && lluvia < 0) frase = 'Buen día para tender';
  const dias = j.daily.time.slice(1, 4).map((t, i) => ({ d: cap(DIAS[deISO(t).getDay()].slice(0, 3)), k: tipoTiempo(j.daily.weather_code[i + 1], 1), mx: Math.round(j.daily.temperature_2m_max[i + 1]), mn: Math.round(j.daily.temperature_2m_min[i + 1]) }));
  return { tipo: tipo, t: Math.round(ahora.temperature_2m), mx: Math.round(j.daily.temperature_2m_max[0]), mn: Math.round(j.daily.temperature_2m_min[0]), frase: frase, horas: horas, dias: dias };
}
function wTiempo(tam) {
  const s = sitioTiempo();
  if (!s) return { vacio: true, h: lab('Tiempo') + '<p class="mu2">Elige el sitio en Ajustes › Tiempo</p>' };
  cargarTiempo();
  const d = datosTiempo();
  if (!d) return { vacio: true, h: lab(ic('ubicacion', 14) + ' ' + esc(s.nombre)) + '<p class="mu2">Cargando el tiempo…</p>' };
  const cab = lab(ic('ubicacion', 14) + ' ' + esc(s.nombre) + (tam === 'S' ? '' : ' · ahora'), tam === 'S' ? '' : '<span class="wa">' + d.mx + '° / ' + d.mn + '°</span>');
  if (tam === 'S') return { vacio: false, col: COL_TIEMPO[d.tipo], h: cab + '<div class="twi">' + TIEMPO_ILUS[d.tipo] + '</div><div class="bign"><b>' + d.t + '°</b><span>' + d.mx + '° / ' + d.mn + '°</span></div><small class="mu2">' + esc(d.frase) + '</small>' };
  let h = cab + '<div class="twl"><div class="twi g">' + TIEMPO_ILUS[d.tipo] + '</div><div><b class="twg">' + d.t + '°</b><b class="twt">' + esc(d.frase) + '</b></div></div>' +
    '<div class="twh">' + d.horas.map(x => '<div><small>' + x.h + '</small><span>' + TIEMPO_ILUS[x.k] + '</span><b>' + x.t + '°</b></div>').join('') + '</div>';
  if (tam === 'L') h += '<div class="twd">' + d.dias.map(x => '<div><b>' + x.d + '</b><span>' + TIEMPO_ILUS[x.k] + '</span><em>' + x.mx + '° / ' + x.mn + '°</em></div>').join('') + '</div>';
  return { vacio: false, col: COL_TIEMPO[d.tipo], h: h };
}
wd('tiempoS', 'Tiempo · pequeña', 'Tiempo', 'S', cLI, 'Temperatura y una frase, con dibujo según el tiempo', () => wTiempo('S'));
wd('tiempoM', 'Tiempo · mediana', 'Tiempo', 'L', cLI, 'Ahora y las próximas horas', () => wTiempo('M'));
wd('tiempoL', 'Tiempo · grande', 'Tiempo', 'L', cLI, 'Ahora, las próximas horas y los próximos 3 días', () => wTiempo('L'));
['tiempoS', 'tiempoM', 'tiempoL'].forEach(k => { W[k].ir = 'wTiempo'; });
ACC.wTiempo = () => { if (!sitioTiempo()) Nav.ir('tiempoAj', {}); else { cargarTiempo(true); toast('Actualizando el tiempo…'); } };
P.tiempoAj = {
  html: p => {
    const s = sitioTiempo();
    return tope('Tiempo') + '<p class="texto">El sitio de las tarjetas del tiempo. Vale para los dos. Los datos son de Open-Meteo: gratis y sin ninguna clave.</p>' +
      (s ? '<div class="row card" style="margin-top:12px">' + ic('ubicacion', 24, 0) + '<div class="f"><b>' + esc(s.nombre) + '</b><small>' + esc(s.zona || '') + '</small></div></div>' : '') +
      '<div class="fld fldr" style="margin-top:12px"><div class="f"><small>Buscar un sitio</small><input id="tiQ" placeholder="Pamplona, Madrid…" maxlength="60" enterkeyhint="search"></div><button class="mini" data-a="tiBuscar">Buscar</button></div>' +
      (p.res ? (p.res.length ? '<div class="card grp">' + p.res.map((r, i) => '<button class="row" data-a="tiElegir" data-i="' + i + '"><div class="f"><b>' + esc(r.name) + '</b><small>' + esc([r.admin1, r.country].filter(Boolean).join(', ')) + '</small></div>' + chev + '</button>').join('') + '</div>' : '<p class="texto">No encuentro ese sitio. Prueba con otro nombre.</p>') : '');
  },
  tras(el) { const i = $('#tiQ', el); if (i) i.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ACC.tiBuscar($('[data-a="tiBuscar"]', el)); } }); },
  montar(el) { P.tiempoAj.tras(el); }
};
ACC.tiBuscar = el => conEspera(el, async () => {
  const q = val('tiQ'); if (!q) return;
  const e = Nav.actual();
  try { const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=6&language=es&name=' + encodeURIComponent(q), { cache: 'no-store' }); const j = await r.json(); e.params.res = j.results || []; }
  catch (x) { toast('No he podido buscar. ¿Hay conexión?'); return; }
  e.params._tiQ = q; Nav.refrescar(true);
});
ACC.tiElegir = el => { const r = Nav.actual().params.res[+el.dataset.i]; cambiar('ajustes', 'tiempo', { nombre: r.name, zona: [r.admin1, r.country].filter(Boolean).join(', '), lat: Math.round(r.latitude * 1000) / 1000, lon: Math.round(r.longitude * 1000) / 1000 }); TIEMPO = null; cargarTiempo(true); Nav.atras(); toast('Tiempo de ' + r.name); };

/* ---------- La semana de un vistazo, nota rápida y documento a mano ---------- */
wd('semanaVista', 'La semana de un vistazo', 'Agenda', 'L', cAZ, '7 días con puntos: eventos, tareas y si hay menú', () => {
  const lun = lunesDe(new Date());
  const dias = [0, 1, 2, 3, 4, 5, 6].map(i => { const d = sumaDias(lun, i), iso = isoDia(d); return { d: d, iso: iso, ev: eventosDia(iso).length, ta: lista('tareas').filter(t => !t.hecho && t.fecha === iso).length, me: menuDe(d).some(x => x[1]) }; });
  return { vacio: false, h: lab('Esta semana') + '<div class="wkv">' + dias.map(x => '<button class="' + (x.iso === hoyISO() ? 'on' : '') + '" data-a="wSemDia" data-d="' + x.iso + '"><small>' + LETRAS[diaSemana(x.d) - 1] + '</small><b>' + x.d.getDate() + '</b><span>' + (x.ev ? '<i style="background:' + cAZ + '"></i>' : '') + (x.ta ? '<i style="background:' + cLA + '"></i>' : '') + (x.me ? '<i style="background:' + cRO + '"></i>' : '') + '</span></button>').join('') + '</div><div class="lgd2"><span><i style="background:' + cAZ + '"></i>Evento</span><span><i style="background:' + cLA + '"></i>Tarea</span><span><i style="background:' + cRO + '"></i>Menú</span></div>' };
});
ACC.wSemDia = el => { ACC.abrirMod({ dataset: { id: 'agenda' } }); };
wd('notaRapida', 'Nota rápida', 'Notas', 'S', cLV, 'Escribes y se guarda como nota nueva', () => ({ vacio: false, h: lab('Nota rápida') + '<textarea id="nrT" class="nrt" rows="3" maxlength="400" placeholder="Apunta algo…"></textarea><button class="qb" data-a="nrOk" style="--a:' + cLV + '">' + ic('anadir', 16) + ' Guardar</button>' }));
W.notaRapida.ir = '';
ACC.nrOk = () => { const t = val('nrT'); if (!t) return; const tit = t.split('\n')[0].slice(0, 60), html = esc(t).replace(/\n/g, '<br>'); cambiar('notas', 'n' + uid(), { titulo: tit, html: html, texto: t, color: '', editada: Date.now(), por: S.cfg.persona, creadoPor: S.cfg.persona }); $('#nrT').value = ''; toast('Nota guardada'); };
wd('docMano', 'Documento a mano', 'Documentos', 'S', cLV, 'Un documento fijado que se abre con el código', () => {
  const d = dato('documentos', cfgInicio().docMano || '') || lista('documentos')[0];
  if (!d) return { vacio: true, h: lab('A mano') + '<p class="mu2">Sin documentos</p>' };
  return { vacio: false, h: lab('A mano') + '<button class="wbody" data-a="docAbrir" data-id="' + d.id + '"><b class="tt">' + (d.emoji ? esc(d.emoji) + ' ' : '') + esc(d.nombre || 'Documento') + '</b><small class="mu2">' + ic('candado', 12) + ' Con código</small></button>' };
});
W.docMano.opciones = 'docManoOpc'; W.docMano.ir = '';
ACC.docManoOpc = () => abrirHoja('<h3>¿Qué documento?</h3><div class="card grp">' + lista('documentos').map(d => '<button class="row" data-a="docManoSi" data-id="' + d.id + '"><b style="flex:1">' + esc(d.nombre || 'Documento') + '</b><span class="rad' + (cfgInicio().docMano === d.id ? ' on' : '') + '"></span></button>').join('') + '</div>');
ACC.docManoSi = el => { fijarCfg({ docMano: el.dataset.id }); cerrarHoja(); Nav.refrescar(true); };
['Tiempo', 'Turnos'].forEach(s => { if (SECS.indexOf(s) < 0) SECS.push(s); });
SECCOL.Tiempo = 1; SECCOL.Turnos = 2;

/* ---------- Nombre y emoji del hogar ---------- */
P.hogarAj = {
  clase: 'con-boton', fija: true,
  html: () => { const e = espacio(); return tope('El hogar') + (esAdmin() ? '' : '<p class="texto">Solo lo puede cambiar quien administra el espacio.</p>') + filaNombreEmoji('hoEmo', e.emoji || '', fldTxt('hoNom', 'Nombre', e.nombre, 'Ru&Iña, Casa…', 'maxlength="30"' + (esAdmin() ? '' : ' disabled'))); },
  fijo: () => esAdmin() ? '<div class="btns">' + btn('Guardar', 'hogarOk') + '</div>' : ''
};
ACC.hogarOk = () => { const n = val('hoNom'); if (!n) return toast('Escribe el nombre.'); cambiar('espacio', 'espacio', { nombre: n, emoji: primerEmoji(val('hoEmo')) }); Nav.atras(); toast('Guardado'); };

/* ---------- Copia de seguridad (cada noche, en el script) ---------- */
P.copia = {
  html: p => {
    if (!p.cargado && !p.cargando) { p.cargando = true; api('copias', {}).then(r => { p.r = r; }).catch(e => { p.err = e.message; }).then(() => { p.cargando = false; p.cargado = true; if (Nav.actual() && Nav.actual().params === p) Nav.refrescar(true); }); }
    let h = tope('Copia de seguridad');
    if (p.err) return h + '<div class="aviso mal">' + ic('error', 22, 0) + '<span>' + esc(p.err) + '</span></div><button class="btn sec" data-a="copiaRe" style="margin-top:12px">Volver a intentarlo</button>';
    if (!p.r) return h + '<p class="texto">Mirando las copias…</p>';
    const l = p.r.lista || [];
    h += '<div class="okb">' + ic('nube-sincronizada', 30, 4) + '<div class="f"><b>' + (l.length ? 'Última copia: ' + haceRato(l[0].ts) : 'Todavía no hay copias') + '</b><small>' + (p.r.auto ? 'Cada noche entre las 23:00 y las 00:00' : 'La copia de cada noche no está activada en el script') + '</small></div></div>' +
      '<button class="btn sec" data-a="copiaHacer" style="margin-top:12px">' + ic('subir', 20) + ' Hacer copia ahora</button>';
    if (l.length) h += '<p class="lab2">Copias guardadas · Drive › Copias de Ronda</p><div class="card grp">' + l.map(c => '<div class="row"><b style="flex:1">' + cap(haceRato(c.ts)) + '</b>' + (esAdmin() ? '<button class="mini" data-a="copiaRest" data-id="' + c.id + '" data-n="' + esc(haceRato(c.ts)) + '">Restaurar</button>' : '') + '</div>').join('') + '</div>';
    return h + '<p class="cap" style="text-align:left">Se guardan las últimas 30. Los documentos no se copian otra vez: ya están en Drive, cifrados.' + (esAdmin() ? '' : ' Restaurar solo lo puede hacer quien administra el espacio.') + '</p>';
  }
};
ACC.copiaRe = () => { const p = Nav.actual().params; p.cargado = false; p.err = ''; Nav.refrescar(true); };
ACC.copiaHacer = el => conEspera(el, async () => { try { await Sync.ya(); await api('copia-hacer', {}, { ms: 90000 }); toast('Copia hecha'); ACC.copiaRe(); } catch (e) { toast(e.message); } });
ACC.copiaRest = el => {
  const id = el.dataset.id, n = el.dataset.n;
  abrirHoja('<div class="pinic" style="background:color-mix(in srgb,#F0674B 18%,var(--sf));margin:6px auto 0">' + ic('aviso', 36, 0) + '</div><h3 style="text-align:center;margin-top:10px">¿Volver a la copia de ' + esc(n) + '?</h3><p class="texto" style="text-align:center">Todo volverá a como estaba entonces, en todos los móviles. Antes se guarda una copia de cómo está ahora, por si acaso.</p>' +
    '<label class="fld" style="margin-top:14px"><small>Escribe RESTAURAR para seguir</small><input id="crOk" autocapitalize="characters" autocomplete="off" placeholder="RESTAURAR"></label><button class="btn pri" data-a="copiaRestOk" data-id="' + id + '" style="margin-top:12px;background:#C8402B;color:#fff">Restaurar</button><button class="btn sec" data-a="cerrarHoja" style="margin-top:10px">Cancelar</button>');
};
ACC.copiaRestOk = el => {
  if (val('crOk').toUpperCase() !== 'RESTAURAR') return toast('Escribe RESTAURAR para confirmar.');
  return conEspera(el, async () => { try { await Sync.ya(); await api('copia-restaurar', { id: el.dataset.id, confirmar: 'RESTAURAR' }, { ms: 120000 }); cerrarHoja(); toast('Restaurado. Descargando…'); await Sync.ya(); Nav.atras(); } catch (e) { toast(e.message); } });
};

/* ---------- Compartir una lista de la compra con alguien de fuera ---------- */
ACC.compartirLista = el => { cerrarHoja(); setTimeout(() => Nav.ir('compartir', { lid: el.dataset.id }), 300); };
const compartidaDe = lid => lista('compartidas').find(x => x.lista === lid && x.activo && (x.caduca || 0) > Date.now()) || null;
function enlaceLista(cod) {
  const m = String((S.cfg && S.cfg.url) || '').match(/macros\/s\/([^/]+)\/exec/);
  const base = location.href.split('#')[0].split('?')[0].replace(/[^/]*$/, '');
  return base + 'lista.html#u=' + encodeURIComponent(m ? m[1] : (S.cfg || {}).url || '') + '&c=' + encodeURIComponent(cod);
}
P.compartir = {
  html: p => {
    const L = datoLista(p.lid) || {}, c = compartidaDe(p.lid);
    if (p.marcar === undefined) p.marcar = c ? !!c.marcar : true;
    if (p.dias === undefined) p.dias = 7;
    let h = tope('Compartir ' + (L.nombre || 'lista')) + '<p class="texto">Quien tenga el enlace ve lo que falta, sin entrar en Ronda ni tener cuenta. Se actualiza solo.</p>';
    if (c) {
      h += '<div class="codex">' + ic('enlace', 20, 5) + '<span>Enlace de ' + esc(L.nombre || '') + '</span><button class="mini" data-a="cmCopiar">Copiar</button></div>' +
        '<div class="card grp" style="margin-top:10px"><div class="row"><b style="flex:1">Puede marcar lo que compra</b><small class="k">' + (c.marcar ? 'Sí' : 'No') + '</small></div><div class="row"><b style="flex:1">Caduca</b><small class="k">' + cuando(isoDia(new Date(c.caduca))) + '</small></div></div>' +
        '<button class="btn pri" data-a="cmEnviar" style="margin-top:14px">' + ic('compartir', 20) + ' Enviar…</button><button class="btn sec peligro" data-a="cmQuitar" style="margin-top:10px">Dejar de compartir</button>';
    } else {
      h += '<div class="card grp" style="margin-top:12px"><div class="row"><div class="f"><b>Puede marcar lo que compra</b><small>Lo veis en directo</small></div>' + swi(!!p.marcar, 'pTog', 'data-k="marcar"') + '</div></div>' +
        '<p class="lab2">Caduca en</p><div class="chips">' + [[1, '1 día'], [7, '7 días'], [30, '30 días']].map(x => '<button class="chip' + (Number(p.dias) === x[0] ? ' on' : '') + '" data-a="pSet" data-k="dias" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
        '<button class="btn pri" data-a="cmCrear" style="margin-top:16px">Crear enlace</button>';
    }
    return h;
  }
};
ACC.cmCrear = el => conEspera(el, async () => {
  const p = Nav.actual().params;
  try { const r = await api('compartir-crear', { lista: p.lid, marcar: !!p.marcar, dias: Number(p.dias) || 7 }); cambiar('compartidas', 'sh' + uid(), { lista: p.lid, codigo: r.codigo, marcar: !!p.marcar, caduca: r.caduca, activo: true, creado: Date.now(), por: S.cfg.persona }); Nav.refrescar(true); }
  catch (e) { toast(e.message); }
});
ACC.cmCopiar = async () => { const c = compartidaDe(Nav.actual().params.lid); if (c) toast(await copiar(enlaceLista(c.codigo)) ? 'Enlace copiado' : 'No se ha podido copiar'); };
ACC.cmEnviar = async () => { const c = compartidaDe(Nav.actual().params.lid); if (!c) return; const u = enlaceLista(c.codigo); try { if (navigator.share) await navigator.share({ title: 'Lista de la compra', text: 'Lo que falta:', url: u }); else toast(await copiar(u) ? 'Enlace copiado' : 'No se ha podido copiar'); } catch (e) { } };
ACC.cmQuitar = el => conEspera(el, async () => {
  const c = compartidaDe(Nav.actual().params.lid); if (!c) return;
  try { await api('compartir-quitar', { codigo: c.codigo }); } catch (e) { if (e.code !== 'sinred') return toast(e.message); }
  cambiar('compartidas', c.id, { activo: false }); Nav.refrescar(true); toast('Ya no se comparte');
});

/* ---------- Puesta al día al abrir y cada pocos minutos ---------- */
setInterval(() => { if (S.cfg && !document.hidden) { try { ponerAlDiaTurnos(); } catch (e) { anotar('turnos', e); } } }, 5 * 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.cfg) setTimeout(() => { try { ponerAlDiaTurnos(); limpiarActividad(); } catch (e) { anotar('al día', e); } }, 4000); });
setTimeout(() => { if (S.cfg) { try { ponerAlDiaTurnos(); limpiarActividad(); } catch (e) { anotar('al día', e); } } }, 6000);
Object.assign(window.RONDA, { ACC: ACC, W: W, P: P, dato: dato, cambiar: cambiar, lista: lista });
