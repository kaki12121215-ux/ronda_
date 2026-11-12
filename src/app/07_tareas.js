/* ============================ TAREAS ============================ */
function tareasOrdenadas() {
  return lista('tareas').sort((a, b) => (a.hecho - b.hecho) || ((a.fecha || '9999') + (a.hora || '99')).localeCompare((b.fecha || '9999') + (b.hora || '99')) || (a.orden || 0) - (b.orden || 0));
}
P.tareas = {
  raiz: true, clase: 'con-barra',
  html: (p, e) => {
    const f = p.f || 'todas', yoId = S.cfg.persona;
    const otros = personas().filter(x => x.id !== yoId);
    let l = tareasOrdenadas();
    const pend = l.filter(x => !x.hecho).length, hechas = l.filter(x => x.hecho).length;
    /* Se filtra por a quién está asignada (no por quién la creó). Las de «Todos» salen en todos los filtros. */
    if (f === 'mias') l = l.filter(x => !x.hecho && (x.para === yoId || x.para === 'todos'));
    else if (f === 'hechas') l = l.filter(x => x.hecho);
    else if (f !== 'todas') l = l.filter(x => !x.hecho && (x.para === f || x.para === 'todos'));
    else l = l.filter(x => !x.hecho);
    let h = '<div data-r="banda">' + banda() + '</div>' + head('Tareas', pend + (pend === 1 ? ' pendiente' : ' pendientes') + ' · ' + hechas + (hechas === 1 ? ' hecha' : ' hechas'));
    h += '<div class="chips" style="margin-bottom:14px;flex-wrap:nowrap;overflow-x:auto">' + [['todas', 'Todas'], ['mias', 'Mías']].concat(otros.map(o => [o.id, 'De ' + o.nombre])).concat([['hechas', 'Hechas']]).map(c => '<button class="chip' + (f === c[0] ? ' on' : '') + '" data-a="pSet" data-k="f" data-v="' + c[0] + '" style="flex:none">' + esc(c[1]) + '</button>').join('') + '</div>';
    if (!l.length) return h + vacio(f === 'hechas' ? 'sin-tareas' : 'todo-hecho', f === 'hechas' ? 'Nada hecho aún' : 'Sin tareas', f === 'hechas' ? 'Cuando marquéis tareas, saldrán aquí.' : 'Cuando añadas una, la verás aquí.');
    const fila = x => {
      const c = x.para === 'todos' ? 'var(--ink)' : colorDe(x.para);
      const nuevo = e && e.pintado && !e.vistos[x.id]; if (e) e.vistos[x.id] = 1;
      const atras = !x.hecho && x.fecha && x.fecha < hoyISO();
      return '<div class="row card it' + (x.hecho ? ' dn' : '') + (nuevo ? ' nuevo' : '') + '" data-a="verTarea" data-lp="menuTarea" data-id="' + x.id + '">' +
        '<button class="ck' + (x.hecho ? ' on' : '') + (atras ? ' pas' : '') + '" data-a="hacerTarea" data-id="' + x.id + '" style="' + (x.hecho ? 'background:' + colorDe(x.hechoPor) + ';border-color:transparent' : 'border-color:' + c) + '" aria-label="Hecha">' + tick(16) + '</button>' +
        '<div class="f"><b>' + esc(x.titulo) + candado(x) + '</b>' + (sub => sub ? '<small' + (atras ? ' style="color:#C8402B"' : '') + '>' + sub + '</small>' : '')([x.hecho ? 'Hecha por ' + esc(nombreDe(x.hechoPor)) : atras ? cuando(x.fecha, x.hora) : (x.hora || ''), x.turno ? 'Turno' : '', x.repite && x.repite.cada ? (x.hecho || atras || x.hora || x.turno ? textoRepe(x.repite).toLowerCase() : textoRepe(x.repite)) : '', x.cal ? (x.hecho || atras || x.hora || x.turno || (x.repite && x.repite.cada) ? 'en el calendario' : 'En el calendario') : ''].filter(Boolean).join(' · ')) + (!x.hecho && x.limite ? textoLimite(x.limite) : '') + '</div>' +
        avQuien(x.para, 28) + '</div>';
    };
    /* 1.8.0: el día va en el título del grupo, así que en la ficha solo sale la hora (y turno, repetición, calendario).
       Por días, cada día en su bandeja (Atrasadas, Hoy, Mañana, el día, Sin fecha). Las hechas, en una sola. */
    const l3 = l.slice(0, 300);
    if (f === 'hechas') h += '<div class="list">' + l3.map(fila).join('') + '</div>';
    else {
      const hoy = hoyISO(), gr = [];
      l3.forEach(x => {
        const k = !x.fecha ? 'z' : x.fecha < hoy ? 'a' : x.fecha;
        const t = k === 'z' ? 'Sin fecha' : k === 'a' ? 'Atrasadas' : cuando(x.fecha);
        const g = gr.length && gr[gr.length - 1].k === k ? gr[gr.length - 1] : (gr.push({ k, t, xs: [] }), gr[gr.length - 1]);
        g.xs.push(x);
      });
      h += gr.map(g => '<h3 class="tgr">' + esc(g.t) + '</h3><div class="list">' + g.xs.map(fila).join('') + '</div>').join('');
    }
    if (f === 'hechas' && l.length) h += '<button class="btn sec" data-a="borrarHechas" style="margin-top:14px">Quitar las hechas (' + l.length + ')</button>';
    if (e) e.pintado = true;
    return h + '<p class="cap" style="margin-top:16px;font-size:13px">Toca para ver. Mantén el dedo para cambiarla o borrarla.</p>';
  },
  fijo: () => '<button class="fab" data-a="nuevaTarea" aria-label="Nueva tarea">' + ic('anadir', 28) + '</button>'
};
ACC.nuevaTarea = el => Nav.ir('tarea', { para: (el && el.dataset.para) || S.cfg.persona, fecha: (el && el.dataset.fecha) || '' });
ACC.verTarea = el => Nav.ir('tareaVer', { id: el.dataset.id });
ACC.menuTarea = el => {
  const x = dato('tareas', el.dataset.id); if (!x) return;
  abrirHoja('<h3>' + esc(x.titulo) + candado(x) + '</h3><div class="list"><button class="row card" data-a="editarTarea" data-id="' + x.id + '">' + ic('editar', 24) + '<b>Cambiar</b></button><button class="row card" data-a="borrarTarea" data-id="' + x.id + '">' + ic('borrar', 24, 0) + '<b>Borrar</b></button></div>');
};
ACC.editarTarea = el => { cerrarHoja(); const x = dato('tareas', el.dataset.id); Nav.ir('tarea', Object.assign({ id: x.id }, x, { repite: x.repite || {} })); };
ACC.hacerTarea = (el, ev) => {
  if (ev) ev.stopPropagation();
  const x = dato('tareas', el.dataset.id); if (!x) return;
  const fila = el.closest('.it');
  if (!x.hecho && x.repite && x.repite.cada) {
    /* Repetida: se apunta quién la hizo y pasa a la siguiente fecha. */
    const sig = siguienteFecha(x.fecha || hoyISO(), x.repite);
    el.classList.add('on'); el.style.background = (yo() || {}).color; el.style.borderColor = 'transparent';
    setTimeout(() => {
      cambiar('tareas', x.id, { fecha: sig, ultimaVez: Date.now(), ultimaPor: S.cfg.persona, veces: (x.veces || 0) + 1 });
      if (x.cal) marcarCal('tareas', x.id);
      Nav.refrescar();
      toast('Hecho. Próxima vez: ' + cuando(sig).toLowerCase());
    }, 450);
    return;
  }
  const h = !x.hecho;
  if (fila) fila.classList.toggle('dn', h);
  el.classList.toggle('on', h); el.style.background = h ? (yo() || {}).color : ''; el.style.borderColor = h ? 'transparent' : (x.para === 'todos' ? 'var(--ink)' : colorDe(x.para));
  cambiar('tareas', x.id, { hecho: h, hechoPor: h ? S.cfg.persona : '', hechoEn: Date.now() });
  if (x.cal) marcarCal('tareas', x.id);
  const quedan = lista('tareas').filter(t => !t.hecho && t.fecha === hoyISO()).length;
  setTimeout(() => {
    Nav.refrescar();
    if (h && x.fecha === hoyISO() && quedan === 0) celebrar('tarea-terminada', 'Todo hecho por hoy', x.titulo);
    else if (h) toast('«' + x.titulo + '» hecha', 'Deshacer', () => { cambiar('tareas', x.id, { hecho: false, hechoPor: '' }); if (x.cal) marcarCal('tareas', x.id); Nav.refrescar(); });
  }, 600);
};
ACC.borrarTarea = el => {
  cerrarHoja();
  const id = el.dataset.id, x = dato('tareas', id);
  const fila = $('.it[data-id="' + id + '"]', Nav.actual().el);
  if (fila) fila.classList.add('sale');
  setTimeout(() => { cambiar('tareas', id, { _b: 1 }); if (x.evId) marcarCal('tareas', id); if (Nav.actual().id !== 'tareas') Nav.atras(); else Nav.refrescar(); }, fila ? 280 : 0);
  toast('«' + x.titulo + '» borrada', 'Deshacer', () => { cambiar('tareas', id, { _b: 0 }); if (x.cal) marcarCal('tareas', id); Nav.refrescar(); });
};
ACC.borrarHechas = () => {
  const hs = lista('tareas').filter(x => x.hecho);
  hs.forEach(x => cambiar('tareas', x.id, { _b: 1 }));
  Nav.refrescar();
  toast(hs.length + ' tareas quitadas', 'Deshacer', () => { hs.forEach(x => cambiar('tareas', x.id, { _b: 0 })); Nav.refrescar(); });
};

/* 21 · Nueva tarea / cambiar */
P.tarea = {
  clase: 'con-boton', fija: true,
  html: p => {
    p.repite = p.repite || {};
    return tope(p.id ? 'Cambiar tarea' : 'Nueva tarea') +
      fldTxt('tTit', 'Qué hay que hacer', pv(p, 'tTit', p.titulo), 'Por ejemplo, cambiar la bombilla', 'maxlength="120"') +
      filaSolo(!!p.solo) + (p.solo ? '' : '<p class="lab2">Para quién</p>' + chipsPersonas(p.para, 'tPara', true)) +
      '<div style="display:flex;gap:10px"><label class="fld" style="flex:1.4"><small>Cuándo</small><input type="date" id="tFec" value="' + esc(pv(p, 'tFec', p.fecha || '')) + '"></label><label class="fld" style="flex:1"><small>Hora</small><input type="time" id="tHor" value="' + esc(pv(p, 'tHor', p.hora || '')) + '"></label></div>' +
      '<label class="fld"><small>Fecha límite (opcional)</small><input type="date" id="tLim" value="' + esc(pv(p, 'tLim', p.limite || '')) + '"></label>' +
      '<div class="list" style="margin-top:6px"><button class="row card" data-a="tRepe">' + sq('repetir', 4) + '<div class="f"><b>Repetir</b><small>' + esc(textoRepe(p.repite)) + '</small></div>' + chev + '</button>' +
      (p.solo ? '' : filaCal(!!p.cal, 'tCal') + (p.cal ? filaAviso(p.aviso, 'tAviso') : '')) + '</div>' +
      fldArea('tNot', 'Notas', pv(p, 'tNot', p.notas), 'Opcional') +
      (p.id ? '<button class="btn sec peligro" data-a="borrarTarea" data-id="' + esc(p.id) + '" style="margin-top:12px">Borrar tarea</button>' : '');
  },
  fijo: p => '<div class="btns">' + btn(p.id ? 'Guardar cambios' : 'Guardar tarea', 'guardarTarea') + '</div>'
};
ACC.tPara = el => { Nav.actual().params.para = el.dataset.v; repintar(); };
ACC.tCal = () => { const p = Nav.actual().params; p.cal = !p.cal; if (p.cal && p.aviso === undefined) p.aviso = '0'; repintar(); };
ACC.tAviso = () => { const e = Nav.actual(); guardarCampos(e); hojaOpciones('Aviso', AVISOS, e.params.aviso, v => { e.params.aviso = v; Nav.refrescar(true); }); };
ACC.tRepe = () => { const e = Nav.actual(); guardarCampos(e); Nav.ir('repetir', { de: e }); };
ACC.guardarTarea = () => {
  const e = Nav.actual(); guardarCampos(e);
  const p = e.params, titulo = cap(val('tTit'));
  if (!titulo) { $('#tTit').focus(); return toast('Escribe qué hay que hacer.'); }
  const fecha = val('tFec'), hora = val('tHor');
  if (p.cal && !fecha) return toast('Para añadirla al calendario, ponle fecha.');
  if (p.repite && p.repite.cada && !fecha) return toast('Para repetirla, ponle la primera fecha.');
  const id = p.id || 't' + uid();
  const campos = { titulo: titulo, para: p.para || S.cfg.persona, fecha: fecha, hora: hora, repite: p.repite && p.repite.cada ? p.repite : null, cal: !!p.cal, aviso: p.cal ? (p.aviso === undefined ? '0' : p.aviso) : '', notas: val('tNot'), limite: val('tLim') };
  /* 1.7.1: «Solo para mí»: siempre tuya, sin calendario compartido; el otro no la ve */
  campos.solo = p.solo ? S.cfg.persona : '';
  if (p.solo) Object.assign(campos, { para: S.cfg.persona, cal: false, aviso: '' });
  if (!p.id) Object.assign(campos, { hecho: false, creadoPor: S.cfg.persona, orden: Date.now() });
  cambiar('tareas', id, campos);
  const antes = p.id ? dato('tareas', id) : null;
  if (campos.cal || (p.evId)) marcarCal('tareas', id);
  Nav.atras();
  toast(p.id ? 'Tarea cambiada' : 'Tarea guardada');
};

/* 23 · Repetir */
P.repetir = {
  clase: 'con-boton',
  html: p => {
    const r = p.de.params.repite || {};
    let h = tope('Repetir') + '<div class="list">' + REPES.map(x => '<button class="row card' + ((r.cada || '') === x[0] ? ' sel' : '') + '" data-a="repeCada" data-v="' + x[0] + '"><b style="flex:1">' + x[1] + '</b><span class="rad' + ((r.cada || '') === x[0] ? ' on' : '') + '"></span></button>').join('') + '</div>';
    if (r.cada === 'semana') h += '<h3>Días de la semana</h3><div class="chips">' + LETRAS.map((d, i) => '<button class="chip' + ((r.dias || []).indexOf(i + 1) >= 0 ? ' on' : '') + '" data-a="repeDia" data-v="' + (i + 1) + '" style="width:42px;padding:8px 0;text-align:center">' + d + '</button>').join('') + '</div>';
    if (r.cada === 'p') h += '<h3>Cada cuánto</h3>' + bloqueFrecuencia({ fqN: r.n || 1, fqU: r.u || 'd' }, p.de.params._tFec || p.de.params.fecha || hoyISO());
    if (r.cada === 'ndias') h += '<h3>Cada cuántos días</h3><div class="chips">' + [2, 3, 4, 5, 7, 10, 14, 15, 21, 30].map(n => '<button class="chip' + ((r.n || 2) === n ? ' on' : '') + '" data-a="repeN" data-v="' + n + '">' + n + '</button>').join('') + '</div>';
    return h;
  },
  fijo: () => '<div class="btns">' + btn('Listo', 'atras') + '</div>'
};
ACC.repeCada = el => { const de = Nav.actual().params.de; de.params.repite = el.dataset.v ? Object.assign({}, de.params.repite, { cada: el.dataset.v }) : {}; if (el.dataset.v === 'ndias' && !de.params.repite.n) de.params.repite.n = 3; if (el.dataset.v === 'p') { de.params.repite.n = de.params.repite.n || 1; de.params.repite.u = de.params.repite.u || 'd'; } Nav.refrescar(true); };
ACC.repeDia = el => { const r = Nav.actual().params.de.params.repite; const d = +el.dataset.v; r.dias = r.dias || []; const i = r.dias.indexOf(d); if (i >= 0) r.dias.splice(i, 1); else r.dias.push(d); Nav.refrescar(true); };
/* En «Repetir», los botones del personalizado escriben en la repetición de la tarea. */
const _fqMas07 = ACC.fqMas, _fqU07 = ACC.fqU;
ACC.fqMas = el => { const e = Nav.actual(); if (e.id !== 'repetir') return _fqMas07(el); const r = e.params.de.params.repite; r.n = Math.max(1, Math.min(99, (r.n || 1) + Number(el.dataset.v))); Nav.refrescar(true); };
ACC.fqU = el => { const e = Nav.actual(); if (e.id !== 'repetir') return _fqU07(el); e.params.de.params.repite.u = el.dataset.v; Nav.refrescar(true); };
ACC.repeN = el => { Nav.actual().params.de.params.repite.n = +el.dataset.v; Nav.refrescar(true); };

/* 22 · Detalle de tarea */
P.tareaVer = {
  clase: 'con-boton',
  html: p => {
    const x = dato('tareas', p.id);
    if (!x) return tope('Tarea') + '<p class="mu">Esta tarea ya no existe.</p>';
    const kv = [['Para', nombreDe(x.para)], ['Cuándo', cuando(x.fecha, x.hora)]].concat(x.limite ? [['Fecha límite', textoLimite(x.limite, true)]] : []).concat([ ['Repite', textoRepe(x.repite)], ['Calendario', x.cal ? 'Sí · ' + textoAviso(x.aviso).toLowerCase() : 'No']]);
    if (x.veces) kv.push(['Hecha', x.veces + (x.veces === 1 ? ' vez' : ' veces') + ' · la última ' + esc(nombreDe(x.ultimaPor))]);
    kv.push(['Añadida por', nombreDe(x.creadoPor)]);
    return tope('Tarea', '<button class="rt" data-a="editarTarea" data-id="' + x.id + '" style="border:0;background:none">' + ic('editar', 24) + '</button>') +
      '<h1 style="font-size:28px;margin:6px 0 14px">' + esc(x.titulo) + candado(x) + '</h1><div class="card" style="padding:4px 16px">' + kv.map(k => '<div class="kv"><small>' + k[0] + '</small><b>' + esc(k[1]) + '</b></div>').join('') + '</div>' +
      (x.notas ? '<h3>Notas</h3><div class="card" style="padding:14px 16px;font-weight:600;white-space:pre-wrap">' + esc(x.notas) + '</div>' : '');
  },
  fijo: p => { const x = dato('tareas', p.id) || {}; return '<div class="btns"><button class="btn pri" data-a="hacerTareaVer" data-id="' + esc(p.id) + '">' + (x.hecho ? 'Marcar como pendiente' : 'Marcar como hecha') + '</button><button class="btn sec" data-a="borrarTarea" data-id="' + esc(p.id) + '">Borrar tarea</button></div>'; }
};
ACC.hacerTareaVer = el => { ACC.hacerTarea(el); setTimeout(() => Nav.atras(), 500); };

/* 25 · Celebración */
function celebrar(ilus, titulo, texto) {
  const d = document.createElement('div');
  d.className = 'celebra';
  d.innerHTML = '<div class="ill big">' + ilu(ilus) + '</div><h2 class="lg">' + esc(titulo) + '</h2><p class="mu">' + esc(texto) + '</p><button class="btn pri" style="margin-top:28px">Seguir</button>';
  document.body.appendChild(d);
  requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('ver')));
  const fuera = () => { d.classList.remove('ver'); setTimeout(() => d.remove(), 400); };
  $('button', d).addEventListener('click', fuera);
  setTimeout(fuera, 4000);
}
