/* ===================== DISEÑO NUEVO · Tareas =====================
   La lógica de la 1.8.0: grupos por día (Atrasadas, Hoy, Mañana, el día de la semana, Sin fecha) y «Hechas» en una sola lista.
   Todo pasa por lista('tareas'), que ya quita las «Solo para mí» de otra persona (F18). */
const rnCandado = x => x && x.solo ? '<span class="rn-cand" title="Solo la ves tú" aria-label="Solo la ves tú">' + rnIc('candado', 14, 2.2) + '</span>' : '';
const DIAS_CAP = DIAS.map(cap);
/* «el lunes», «mañana», «el 23 de noviembre» */
function rnDiaTexto(iso, conArt) {
  const d = deISO(iso); if (!d) return '';
  const dif = Math.round((d - hoy0()) / 86400000);
  if (dif === 0) return 'hoy'; if (dif === 1) return 'mañana'; if (dif === -1) return 'ayer';
  if (dif > 1 && dif < 7) return (conArt ? 'el ' : '') + DIAS[d.getDay()];
  if (dif < 0 && dif > -7) return (conArt ? 'el ' : '') + DIAS[d.getDay()] + ' ' + d.getDate();
  return (conArt ? 'el ' : '') + d.getDate() + ' de ' + MESES[d.getMonth()];
}
/* Título de cada grupo */
function rnGrupoDe(x) {
  const h = hoyISO();
  if (!x.fecha) return ['z', 'Sin fecha'];
  if (x.fecha < h) return ['a', 'Atrasadas'];
  const d = deISO(x.fecha), dif = Math.round((d - hoy0()) / 86400000);
  /* 0.3.0: con la fecha entera */
  const larga = DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];
  if (dif === 0) return [x.fecha, 'Hoy, ' + larga];
  if (dif === 1) return [x.fecha, 'Mañana, ' + larga];
  return [x.fecha, cap(larga)];
}
/* La nota gris debajo del título */
function rnNotaTarea(x, f) {
  const h = hoyISO();
  if (x.hecho) return 'Hecha por ' + esc(nombreDe(x.hechoPor) || 'alguien') + (x.hechoEn ? ', ' + rnDiaTexto(isoDia(new Date(x.hechoEn)), true) : '');
  if (x.fecha && x.fecha < h) { const d = deISO(x.fecha); return 'Era ' + (Math.round((hoy0() - d) / 86400000) < 7 ? 'el ' + DIAS[d.getDay()] + ' ' + d.getDate() : 'el ' + d.getDate() + ' de ' + MESES[d.getMonth()]); }
  const p = [];
  /* 0.3.0: de quién es va a la derecha (su foto, o «Todos») */
  if (x.repite && x.repite.cada) p.push(textoRepe(x.repite));
  if (x.limite) p.push('Límite: ' + rnDiaTexto(x.limite, true));
  return p.join(' · ');
}
function rnFilaTarea(x, f) {
  const atras = !x.hecho && x.fecha && x.fecha < hoyISO(), nota = rnNotaTarea(x, f);
  return '<div class="rn-rw rn-it' + (x.hecho ? ' rn-dn' : '') + '" data-id="' + x.id + '" data-lp="rnMenuTarea">' + rnCk(x.hecho, atras, 'rnHacer', x.id) +
    '<button class="rn-rwt" data-a="rnVerTarea" data-id="' + x.id + '"><span class="rn-t">' + esc(x.titulo) + rnCandado(x) + '</span>' + (nota ? '<span class="rn-n' + (atras ? ' rn-rojo' : '') + '">' + nota + '</span>' : '') + '</button>' +
    (x.hora && !x.hecho ? '<span class="rn-hr">' + esc(x.hora) + '</span>' : '') + rnDeQuien(x) + '</div>';
}
/* A la derecha: la foto de quién es la tarea, o «Todos» */
function rnDeQuien(x) {
  if (x.para === 'todos' || !x.para) return '<span class="rn-q rn-todos">Todos</span>';
  const p = dato('personas', x.para); return p ? '<span class="rn-dq" title="' + esc(p.nombre) + '">' + rnAvFoto(p, 26) + '</span>' : '';
}
/* Filtro: por a quién está asignada. Las de «Todos» salen en todos los filtros. */
function rnFiltrar(l, f) {
  const yoId = S.cfg.persona;
  if (f === 'hechas') return l.filter(x => x.hecho);
  if (f === 'mias') return l.filter(x => !x.hecho && (x.para === yoId || x.para === 'todos'));
  if (f !== 'todas') return l.filter(x => !x.hecho && (x.para === f || x.para === 'todos'));
  return l.filter(x => !x.hecho);
}

P.tareas = {
  raiz: true, clase: 'con-barra',
  html: p => {
    const f = p.f || 'mias', yoId = S.cfg.persona, h = hoyISO(), H = hoy0();
    const todas = tareasOrdenadas(), l = rnFiltrar(todas, f).slice(0, 300);
    const otros = personas().filter(x => x.id !== yoId);
    /* La semana: puntos con las tareas de cada día (las del filtro, hechas o no) */
    const lun = lunesDe(H), base = f === 'hechas' ? todas : todas.filter(x => f === 'todas' || f === 'mias' ? (f === 'todas' || x.para === yoId || x.para === 'todos') : (x.para === f || x.para === 'todos'));
    const sem = [0, 1, 2, 3, 4, 5, 6].map(i => {
      const d = sumaDias(lun, i), iso = isoDia(d), n = Math.min(4, base.filter(x => x.fecha === iso).length);
      return '<button class="rn-sd' + (iso === h ? ' rn-hoy' : iso < h ? ' rn-pas' : ' rn-fut') + '" data-a="rnIrDia" data-v="' + iso + '" aria-label="' + DIAS_CAP[d.getDay()] + ' ' + d.getDate() + (n ? ', ' + n + (n === 1 ? ' tarea' : ' tareas') : '') + '"><small>' + LETRAS[i] + '</small><b class="rn-num">' + d.getDate() + '</b><span class="rn-pts">' + '<i></i>'.repeat(n) + '</span></button>';
    }).join('');
    let o = rnTitulo('Tareas', { der: rnRb('buscar', 'rnBuscar', 'Buscar') }) +
      rnCd('<div class="rn-sem">' + sem + '</div>', 'rn-semc') +
      '<div class="rn-flw"><div class="rn-fl rn-gl" role="tablist">' + [['todas', 'Todas'], ['mias', 'Mías']].concat(otros.map(x => [x.id, 'De ' + x.nombre])).concat([['hechas', 'Hechas']]).map(c => '<button class="' + (f === c[0] ? 'rn-on' : '') + '" role="tab" aria-selected="' + (f === c[0]) + '" data-a="rnFiltro" data-v="' + c[0] + '">' + esc(c[1]) + '</button>').join('') + '</div></div>';
    if (!l.length) return o + rnVacia(f);
    if (f === 'hechas') return o + rnCd(rnGrupo('Hechas', String(l.length)) + l.map(x => rnFilaTarea(x, f)).join(''), 'rn-gr');
    /* Por días, cada día en su tarjeta */
    const gr = [];
    l.forEach(x => { const g = rnGrupoDe(x); const u = gr.length && gr[gr.length - 1].k === g[0] ? gr[gr.length - 1] : (gr.push({ k: g[0], t: g[1], xs: [] }), gr[gr.length - 1]); u.xs.push(x); });
    gr.sort((a, b) => (a.k === 'a' ? '0' : a.k === 'z' ? '9' : a.k).localeCompare(b.k === 'a' ? '0' : b.k === 'z' ? '9' : b.k));
    const dePer = x => f === 'todas' || x.para === 'todos' || x.para === (f === 'mias' ? yoId : f);
    o += gr.map(g => {
      let cnt = String(g.xs.length);
      if (g.k === h) { const dh = todas.filter(x => x.fecha === h && dePer(x)); cnt = dh.filter(x => x.hecho).length + ' de ' + dh.length; }
      return '<div class="rn-cd rn-gl rn-gr" data-g="' + g.k + '">' + rnGrupo(g.t, cnt, g.k === 'a' ? 'coral' : '') + g.xs.map(x => rnFilaTarea(x, f)).join('') + '</div>';
    }).join('');
    return o;
  },
  rnPlus: () => rnNuevaTarea({})
};
/* Pantalla vacía (tipo 06) */
function rnVacia(f) {
  const hechas = f === 'hechas';
  return '<div class="rn-vac">' + rnIlu(hechas ? 'sin-tareas' : 'todo-hecho') + '<h2>' + (hechas ? 'Nada hecho aún' : 'Todo hecho') + '</h2><p class="rn-txt">' + (hechas ? 'Cuando marquéis tareas, saldrán aquí.' : 'No te queda ninguna tarea. Cuando añadas una, la verás aquí.') + '</p>' +
    (hechas ? '' : '<button class="rn-btnp rn-btnc" data-a="rnPlus">' + rnIc('anadir', 20, 2.2) + 'Añadir tarea</button>') + '</div>';
}
ACC.rnFiltro = el => { const e = Nav.actual(); e.params.f = el.dataset.v; Nav.refrescar(true); };
/* Tocar un día de la semana lleva a su grupo */
ACC.rnIrDia = el => {
  const e = Nav.actual(), iso = el.dataset.v, k = iso < hoyISO() ? 'a' : iso;
  const g = $('.rn-gr[data-g="' + k + '"]', e.el);
  if (g) { const c = $('.pgc', e.el); c.scrollTo({ top: g.offsetTop - 70, behavior: 'smooth' }); g.classList.remove('rn-marca-g'); void g.offsetWidth; g.classList.add('rn-marca-g'); }
  else toast('Nada ' + rnDiaTexto(iso, true) + (e.params.f === 'mias' ? ' en tus tareas' : ''));
};

/* ---------- Marcar y desmarcar ---------- */
ACC.rnHacer = (el, ev) => {
  if (ev) ev.stopPropagation();
  const x = dato('tareas', el.dataset.id); if (!x) return;
  if (x.turno && !x.hecho) return ACC.hacerTarea(el, ev);   /* las de turnos, con su lógica de hoy */
  if (!x.hecho && x.repite && x.repite.cada) {
    /* Repetida: se apunta quién la hizo y pasa a la siguiente fecha */
    const sig = siguienteFecha(x.fecha || hoyISO(), x.repite), antes = { fecha: x.fecha, ultimaVez: x.ultimaVez, ultimaPor: x.ultimaPor, veces: x.veces };
    el.classList.add('rn-on');
    setTimeout(() => {
      cambiar('tareas', x.id, { fecha: sig, ultimaVez: Date.now(), ultimaPor: S.cfg.persona, veces: (x.veces || 0) + 1 });
      Nav.refrescar(true);
      toast('Hecha. La próxima, ' + rnDiaTexto(sig, true), 'Deshacer', () => { cambiar('tareas', x.id, antes); Nav.refrescar(true); }, 'hecho');
    }, 380);
    return;
  }
  const h = !x.hecho;
  el.classList.toggle('rn-on', h); el.classList.remove('rn-atr');
  const fila = el.closest('.rn-it'); if (fila) fila.classList.toggle('rn-dn', h);
  cambiar('tareas', x.id, { hecho: h, hechoPor: h ? S.cfg.persona : '', hechoEn: Date.now() });
  /* 0.3.0 (ficha 4): 700 ms para ver qué se ha marcado; luego la fila se recoge (340 ms) y se reordena */
  if (h) toast('«' + x.titulo + '» hecha', 'Deshacer', () => { cambiar('tareas', x.id, { hecho: false, hechoPor: '' }); Nav.refrescar(true); }, 'hecho');
  setTimeout(() => { if (h && fila && !REDUCIR) fila.classList.add('rn-recoge'); }, 700);
  setTimeout(() => Nav.refrescar(true), h ? (REDUCIR ? 700 : 1040) : 300);
};

/* ---------- Ver tarea (tipo 03) ---------- */
ACC.rnVerTarea = el => Nav.ir('tareaVer', { id: el.dataset.id });
ACC.verTarea = ACC.rnVerTarea;
P.tareaVer = {
  html: p => {
    const x = dato('tareas', p.id);
    if (!x) return rnTitulo('Tarea', { peq: 1, atras: 'Tareas' }) + rnCd('<p class="rn-txt" style="padding:6px 0 12px">Esta tarea ya no existe.</p>');
    const sub = [x.fecha ? 'Para ' + rnDiaTexto(x.fecha, true) + (deISO(x.fecha) && Math.round((deISO(x.fecha) - hoy0()) / 86400000) > 1 && Math.round((deISO(x.fecha) - hoy0()) / 86400000) < 7 ? ' ' + deISO(x.fecha).getDate() : '') : 'Sin fecha', x.limite ? 'con límite ' + rnDiaTexto(x.limite, true) : ''].filter(Boolean).join(', ');
    const per = x.para === 'todos' ? null : dato('personas', x.para);
    const linea = (t, v, der, a) => '<' + (a ? 'button data-a="' + a + '" data-id="' + x.id + '"' : 'div') + ' class="rn-rw rn-li"><span class="rn-t">' + t + '</span><span class="rn-lv">' + v + '</span>' + (der === undefined ? rnFle : der) + '</' + (a ? 'button' : 'div') + '>';
    const fecha = x.fecha ? cap(DIAS[deISO(x.fecha).getDay()]) + ' ' + deISO(x.fecha).getDate() + ' de ' + MESES[deISO(x.fecha).getMonth()] + (x.hora ? ', ' + x.hora : '') : 'Sin fecha';
    let o = rnTitulo(esc(x.titulo), { peq: 1, atras: 'Tareas', sub: sub, der: rnRb('editar', 'rnEditarTarea', 'Cambiar', ' data-id="' + x.id + '"') + rnRb('borrar', 'rnBorrarTarea', 'Borrar', ' data-id="' + x.id + '"') }) +
      rnCd(linea('Para', esc(x.para === 'todos' ? 'Todos' : nombreDe(x.para)), per ? rnAv(per, 26) : '', null) + linea('Cuándo', fecha, undefined, 'rnEditarTarea') +
        (x.limite ? linea('Límite', cap(DIAS[deISO(x.limite).getDay()]) + ' ' + deISO(x.limite).getDate(), undefined, 'rnEditarTarea') : '') +
        linea('Repetir', esc(textoRepe(x.repite)), undefined, 'rnEditarTarea') + linea('Solo para mí', x.solo ? 'Sí' : 'No', x.solo ? '<span class="rn-fle">' + rnIc('candado', 18, 2) + '</span>' : '', null), 'rn-k-lima rn-cdv') +
      '<button class="rn-btnp" data-a="rnHacerVer" data-id="' + x.id + '">' + rnIc('hecho', 20, 2.2) + (x.hecho ? 'Marcar como pendiente' : 'Marcar como hecha') + '</button>';
    if (x.veces) o += rnCd(rnGrupo('Hecha', x.veces + (x.veces === 1 ? ' vez' : ' veces')) + '<p class="rn-txt rn-nota">La última vez, ' + esc(nombreDe(x.ultimaPor)) + ' ' + rnDiaTexto(isoDia(new Date(x.ultimaVez)), true) + '.</p>');
    if (x.notas) o += rnCd(rnGrupo('Nota') + '<p class="rn-txt rn-nota">' + esc(x.notas) + '</p>');
    return o;
  },
  rnPlus: () => rnNuevaTarea({})
};
ACC.rnHacerVer = el => {
  const x = dato('tareas', el.dataset.id); if (!x) return;
  if (!x.hecho && x.repite && x.repite.cada) { ACC.rnHacer(el); setTimeout(() => Nav.atras(), 450); return; }
  const h = !x.hecho;
  cambiar('tareas', x.id, { hecho: h, hechoPor: h ? S.cfg.persona : '', hechoEn: Date.now() });
  Nav.atras();
  toast('«' + x.titulo + '» ' + (h ? 'hecha' : 'pendiente otra vez'), 'Deshacer', () => { cambiar('tareas', x.id, { hecho: !h, hechoPor: !h ? S.cfg.persona : '', hechoEn: Date.now() }); Nav.refrescar(true); }, 'hecho');
};

/* ---------- Mantener pulsada una tarea: sus opciones (tipo 05) ---------- */
ACC.rnMenuTarea = el => {
  const x = dato('tareas', el.dataset.id); if (!x) return;
  abrirHoja(rnCabHoja(esc(x.titulo) + rnCandado(x)) + '<div class="rn-ops">' +
    '<button class="rn-op" data-a="rnEditarTarea" data-id="' + x.id + '">' + rnIc('editar', 22, 2) + '<span>Cambiar</span></button>' +
    '<button class="rn-op" data-a="rnHacerMenu" data-id="' + x.id + '">' + rnIc('hecho', 22, 2) + '<span>' + (x.hecho ? 'Marcar como pendiente' : 'Marcar como hecha') + '</span></button>' +
    '<button class="rn-op rn-peligro" data-a="rnBorrarTarea" data-id="' + x.id + '">' + rnIc('borrar', 22, 2) + '<span>Borrar la tarea</span></button></div>', { clase: 'rn-k-lima' });
};
ACC.rnHacerMenu = el => { cerrarHoja(); const c = $('.rn-ck[data-id="' + el.dataset.id + '"]', Nav.actual().el); ACC.rnHacer(c || el); };
ACC.rnBorrarTarea = el => {
  cerrarHoja();
  const id = el.dataset.id, x = dato('tareas', id); if (!x) return;
  cambiar('tareas', id, { _b: 1 });
  if (Nav.actual().id === 'tareaVer') Nav.atras(); else Nav.refrescar(true);
  toast('«' + x.titulo + '» borrada', 'Deshacer', () => { cambiar('tareas', id, { _b: 0 }); Nav.refrescar(true); });
};
ACC.rnEditarTarea = el => { cerrarHoja(true); const x = dato('tareas', el.dataset.id); if (x) rnNuevaTarea(Object.assign({}, x, { repite: x.repite || {} })); };
ACC.nuevaTarea = () => rnNuevaTarea({});

/* ---------- Nueva tarea (tipo 01): formulario en hoja ---------- */
/* Tercer atajo de «Cuándo»: el sábado que viene (si el sábado es hoy o mañana, el lunes) */
function rnAtajoFinde() {
  const H = hoy0(), ds = diaSemana(H);
  let n = 6 - ds; if (n <= 1) n += 7;
  if (ds === 7) n = 6;
  const d = sumaDias(H, n);
  if (Math.round((d - H) / 86400000) <= 1) return [isoDia(sumaDias(H, 8 - ds)), 'Lunes'];
  return [isoDia(d), DIAS_CAP[d.getDay()]];
}
let RN_T = null;   /* lo que se va escribiendo en la hoja */
function rnNuevaTarea(x) {
  RN_T = Object.assign({ para: S.cfg.persona, fecha: hoyISO(), hora: '', repite: {}, aviso: '', solo: '', titulo: '', notas: '', limite: '' }, x || {});
  if (!x || !x.id) RN_T.fecha = hoyISO();
  rnPintarTarea(true);
}
function rnPintarTarea(abrir) {
  const t = RN_T, h = hoyISO(), man = isoDia(sumaDias(hoy0(), 1)), fd = rnAtajoFinde();
  const atajo = t.fecha === h ? 'hoy' : t.fecha === man ? 'man' : t.fecha === fd[0] ? 'fd' : t.fecha ? 'otro' : 'sin';
  /* «Elegir día» es una etiqueta con el selector de fecha del iPhone encima (no un botón: dentro de un botón no puede ir un campo) */
  const chips = (xs, sel, a) => '<div class="rn-qcs">' + xs.map(c => c[0] === 'otro' ? '<label class="rn-qc rn-qcf' + (sel === c[0] ? ' rn-on' : '') + '">' + c[1] + '</label>' : '<button class="rn-qc' + (sel === c[0] ? ' rn-on' : '') + '" data-a="' + a + '" data-v="' + c[0] + '">' + c[1] + '</button>').join('') + '</div>';
  const ps = personas();
  const otroDia = atajo === 'otro' ? cap(rnDiaTexto(t.fecha, false)) + (Math.round((deISO(t.fecha) - hoy0()) / 86400000) >= 7 || t.fecha < h ? '' : ' ' + deISO(t.fecha).getDate()) : 'Elegir día';
  const linea = (lab, v, der, a, campo) => '<label class="rn-rw rn-li"' + (a ? ' data-a="' + a + '"' : '') + '><span class="rn-t">' + lab + '</span><span class="rn-lv">' + v + '</span>' + (der === undefined ? rnFle : der) + (campo || '') + '</label>';
  const html = rnCabHoja(t.id ? 'Cambiar tarea' : 'Nueva tarea') +
    '<label class="rn-fld"><small>Qué hay que hacer</small><input id="rnTit" value="' + esc(t.titulo) + '" placeholder="Por ejemplo, cambiar la bombilla" maxlength="120" autocomplete="off" enterkeyhint="done"></label>' +
    (t.solo ? '' : '<p class="rn-et">Para quién</p>' + chips(ps.map(p => [p.id, esc(p.nombre)]).concat([['todos', 'Todos']]), t.para, 'rnTPara')) +
    '<p class="rn-et">Cuándo</p>' + chips([['hoy', 'Hoy'], ['man', 'Mañana'], ['fd', fd[1]], ['otro', otroDia + '<input type="date" id="rnFec" class="rn-oc" value="' + esc(atajo === 'otro' ? t.fecha : '') + '" aria-label="Elegir día">']], atajo, 'rnTCuando') +
    '<div class="rn-lis">' +
    linea('Hora', t.hora || 'Sin hora', undefined, null, '<input type="time" id="rnHor" class="rn-oc" value="' + esc(t.hora) + '" aria-label="Hora">') +
    linea('Repetir', esc(textoRepe(t.repite)), undefined, 'rnTRepe') +
    linea('Aviso', esc(textoAviso(t.aviso)), undefined, 'rnTAviso') +
    '<div class="rn-rw rn-li"><span class="rn-t">Solo para mí</span><span class="rn-lv">' + (t.solo ? 'Solo la ves tú' : '') + '</span>' + rnSw(!!t.solo, 'rnTSolo') + '</div></div>' +
    '<button class="rn-btnp" data-a="rnGuardarTarea">' + (t.id ? 'Guardar cambios' : 'Guardar tarea') + '</button>';
  if (abrir) {
    abrirHoja(html, { clase: 'rn-k-lima rn-hj-form', montar: rnMontarTarea });
    /* Tarea nueva: el teclado sale enseguida para escribir */
    if (!t.id) setTimeout(() => { const i = $('#rnTit'); if (i && hojaAbierta) i.focus(); }, 380);
  } else if (hojaAbierta) {
    const y = $('.rn-hjc', hojaAbierta.h).scrollTop;
    $('.rn-hjc', hojaAbierta.h).innerHTML = html;
    $('.rn-hjc', hojaAbierta.h).scrollTop = y;
    rnMontarTarea(hojaAbierta.h);
  }
}
function rnMontarTarea(h) {
  const i = $('#rnTit', h);
  if (i) { i.addEventListener('input', () => { RN_T.titulo = i.value; }); i.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); i.blur(); } }); }
  const f = $('#rnFec', h); if (f) f.addEventListener('change', () => { if (f.value) { RN_T.fecha = f.value; rnPintarTarea(); } });
  const hr = $('#rnHor', h); if (hr) hr.addEventListener('change', () => { RN_T.hora = hr.value; rnPintarTarea(); });
}
const rnLeerTit = () => { const i = $('#rnTit'); if (i) RN_T.titulo = i.value; };
ACC.rnTPara = el => { rnLeerTit(); RN_T.para = el.dataset.v; rnPintarTarea(); };
ACC.rnTCuando = el => {
  rnLeerTit();
  const v = el.dataset.v;
  if (v === 'hoy') RN_T.fecha = hoyISO(); else if (v === 'man') RN_T.fecha = isoDia(sumaDias(hoy0(), 1)); else if (v === 'fd') RN_T.fecha = rnAtajoFinde()[0];
  rnPintarTarea();
};
ACC.rnTSolo = () => { rnLeerTit(); RN_T.solo = RN_T.solo ? '' : S.cfg.persona; if (RN_T.solo) RN_T.para = S.cfg.persona; rnPintarTarea(); };
/* Repetir y Aviso: lista de opciones dentro de la misma hoja (el selector propio no está dibujado) */
function rnOpcionesEn(titulo, ops, act, fn) {
  rnLeerTit();
  const hc = $('.rn-hjc', hojaAbierta.h);
  hc.innerHTML = rnCabHoja(titulo, '<button class="rn-x" data-a="rnVolverTarea" aria-label="Volver">' + rnIc('atras', 22, 2) + '</button>') + '<div class="rn-ops">' + ops.map(o => '<button class="rn-op" data-a="rnOpElegir" data-v="' + esc(o[0]) + '"><span>' + esc(o[1]) + '</span>' + (String(act) === String(o[0]) ? '<span class="rn-opok">' + rnTick + '</span>' : '') + '</button>').join('') + '</div>';
  hc.scrollTop = 0;
  ACC.rnOpElegir = el => { fn(el.dataset.v); rnPintarTarea(); };
}
ACC.rnVolverTarea = () => rnPintarTarea();
ACC.rnTRepe = ev => {
  const dsH = diaSemana(deISO(RN_T.fecha) || hoy0());
  const ops = [['', 'No se repite'], ['dia', 'Cada día'], ['semana', 'Cada semana, los ' + ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados', 'domingos'][dsH]], ['ndias2', 'Cada 2 días'], ['ndias3', 'Cada 3 días'], ['mes', 'Cada mes'], ['anio', 'Cada año']];
  const r = RN_T.repite || {}, act = !r.cada ? '' : r.cada === 'ndias' ? 'ndias' + (r.n || 2) : r.cada;
  rnOpcionesEn('Repetir', ops, act, v => { RN_T.repite = !v ? {} : v.indexOf('ndias') === 0 ? { cada: 'ndias', n: +v.slice(5) } : v === 'semana' ? { cada: 'semana', dias: [dsH] } : { cada: v }; if (RN_T.repite.cada && !RN_T.fecha) RN_T.fecha = hoyISO(); });
};
ACC.rnTAviso = () => rnOpcionesEn('Aviso', AVISOS, RN_T.aviso, v => { RN_T.aviso = v; });
ACC.rnGuardarTarea = () => {
  rnLeerTit();
  const t = RN_T, titulo = cap(String(t.titulo || '').trim());
  if (!titulo) { const i = $('#rnTit'); if (i) i.focus(); return toast('Escribe qué hay que hacer.'); }
  const id = t.id || 'tarea-' + uid();
  const campos = { titulo: titulo, para: t.solo ? S.cfg.persona : (t.para || S.cfg.persona), fecha: t.fecha || '', hora: t.hora || '', repite: t.repite && t.repite.cada ? t.repite : null, aviso: '', cal: false, solo: t.solo ? S.cfg.persona : '', limite: t.limite || '', notas: t.notas || '' };
  /* 0.3.0: igual que la app de hoy. Con aviso va al calendario de la casa (necesita fecha); «Solo para mí», nunca. */
  const conAviso = !t.solo && t.aviso !== '' && t.aviso != null;
  if (conAviso && !campos.fecha) return toast('Para avisarte, ponle fecha.');
  campos.cal = conAviso; campos.aviso = conAviso ? String(t.aviso) : '';
  const antesCal = t.id ? (dato('tareas', t.id) || {}).cal : false;
  if (!t.id) Object.assign(campos, { hecho: false, creadoPor: S.cfg.persona, orden: Date.now() });
  cambiar('tareas', id, campos);
  if (campos.cal || antesCal) { try { marcarCal('tareas', id); } catch (e) { anotar('calendario', e); } }
  cerrarHoja();
  Nav.refrescar(true);
  toast(t.id ? 'Tarea cambiada' : 'Tarea guardada', t.id ? null : 'Deshacer', () => { cambiar('tareas', id, { _b: 1 }); Nav.refrescar(true); }, 'hecho');
};
