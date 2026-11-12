/* ============================ MÓDULOS, BARRA DE ABAJO, MÁS, NOTAS Y BUSCAR ============================ */
const MODS = {
  tareas: ['Tareas', 'modulo-tareas', 2, () => { const n = lista('tareas').filter(t => !t.hecho).length; return n ? n + ' pendientes' : 'Nada pendiente'; }],
  compra: ['Compra', 'modulo-compra', 1, () => resumenCompra()],
  agenda: ['Agenda', 'modulo-calendario', 5, () => { const n = eventosDia(hoyISO()).length; return n ? n + ' hoy' : 'Nada hoy'; }],
  gastos: ['Gastos', 'modulo-gastos', 7, () => { const p = lista('fijos').filter(f => f.proximo && f.proximo <= isoDia(sumaDias(new Date(), 7))).length; return p ? p + ' esta semana' : lista('fijos').length + ' fijos'; }],
  documentos: ['Documentos', 'modulo-documentos', 6, () => lista('documentos').length + ' cifrados'],
  notas: ['Notas', 'modulo-notas', 6, () => lista('notas').length + ' notas'],
  menu: ['Menú semanal', 'modulo-menu-semanal', 1, () => { const m = menuDe(new Date()).filter(x => x[1]); return m.length ? m[0][1] : 'Sin menú hoy'; }],
  plantas: ['Plantas', 'modulo-plantas', 3, () => { const n = lista('plantas').filter(x => tocaHoy('plantas', x)).length; return n ? n + ' para regar' : lista('plantas').length + ' plantas'; }],
  medicacion: ['Medicación', 'modulo-medicacion', 3, () => { const n = lista('medicacion').filter(x => tocaHoy('medicacion', x)).length; return n ? n + ' hoy' : lista('medicacion').length + ' en la lista'; }],
  acuario: ['Acuario', 'pez-betta', 4, () => { const n = lista('acuario').filter(x => tocaHoy('acuario', x)).length; return n ? n + ' para hoy' : 'Al día'; }],
  coche: ['Coches', 'modulo-coche', 5, () => { const n = coches().length; return n ? n + (n === 1 ? ' coche' : ' coches') : 'Sin coches'; }],
  turnos: ['Turnos', 'turno', 2, () => { const n = lista('turnos').length; return n ? n + (n === 1 ? ' turno' : ' turnos') : 'Lo que os alternáis'; }],
  listasr: ['Listas', 'lista-repetir', 6, () => { const n = lista('listasr').length; return n ? n + (n === 1 ? ' lista' : ' listas') : 'Maleta, limpieza…'; }],
  personas: ['Personas', 'personas', 4, () => personas().length + ' personas'],
  buscar: ['Buscar', 'buscar', 5, () => 'En todo el espacio']
};
const BARRA_DEF = ['tareas', 'agenda', 'gastos'];
function barraMia() { const b = ((yo() || {}).barra || BARRA_DEF).filter(x => MODS[x]); return b.slice(0, 3); }

/* La barra de abajo: Inicio y Más fijos; en medio, lo que cada persona elija (máximo 3). */
RAICES.length = 0;
function raices() { return [['inicio', 'inicio', 'Inicio', 0]].concat(barraMia().map(k => [k, MODS[k][1], MODS[k][0].split(' ')[0], MODS[k][2]])).concat([['mas', 'menu', 'Más', 6]]); }
ACC.abrirMod = el => { const k = el.dataset.id; if (barraMia().indexOf(k) >= 0) Nav.raiz(k); else Nav.ir(k, {}); };

/* Colores de una rejilla de dos columnas sin repetir al lado, encima ni en diagonal. */
function coloresRejilla(prefs) {
  const out = [];
  prefs.forEach((c, i) => {
    const evitar = [i % 2 ? out[i - 1] : null, out[i - 2], i % 2 ? out[i - 3] : out[i - 1]];
    const libres = [0, 1, 2, 3, 4, 5, 6, 7].map(n => (c + n * 3) % 8).filter(x => evitar.indexOf(x) < 0);
    out.push(libres.find(x => out.indexOf(x) < 0) !== undefined ? libres.find(x => out.indexOf(x) < 0) : libres[0]);
  });
  return out;
}

/* ---------- + de Inicio ---------- */
ACC.anadir = () => abrirHoja('<h3>¿Qué quieres añadir?</h3><div class="grid">' +
  [['modulo-compra', 'Producto', 2, 'aProducto'], ['modulo-tareas', 'Tarea', 1, 'nuevaTarea'], ['modulo-gastos', 'Gasto fijo', 7, 'aGasto'], ['modulo-calendario', 'Evento', 5, 'aEvento'], ['modulo-notas', 'Nota', 0, 'aNota'], ['modulo-documentos', 'Documento', 6, 'docNuevo']].map((x, i) =>
    '<button class="mod" style="--c:' + PASTEL[i] + ';min-height:84px;padding:12px 14px" data-a="hojaY" data-v="' + x[3] + '">' + ic(x[0], 26, x[2]) + '<b style="font-size:15px">' + x[1] + '</b></button>').join('') + '</div>');
ACC.hojaY = el => { cerrarHoja(); const a = el.dataset.v; setTimeout(() => ACC[a](el), 300); };
ACC.aGasto = () => Nav.ir('fijo', { categoria: 'luz', cada: 'mes', quien: 'mitad' });
ACC.aEvento = () => Nav.ir('evento', { fecha: hoyISO(), quien: [S.cfg.persona], tipo: 'recordatorio', aviso: '' });
ACC.aNota = () => Nav.ir('nota', { id: 'n' + uid(), nueva: true });

/* ---------- 18 · Más ---------- */
P.mas = {
  raiz: true, clase: 'con-barra',
  html: () => {
    const b = barraMia();
    const ks = Object.keys(MODS).filter(k => b.indexOf(k) < 0 && k !== 'personas' && k !== 'buscar');
    const cs = coloresRejilla(ks.map(k => MODS[k][2]));
    return '<div data-r="banda">' + banda() + '</div>' + head('Más', 'Todo lo demás de tu espacio', '<button class="lupa" data-a="ir" data-id="buscar" aria-label="Buscar">' + ic('buscar', 26, 5) + '</button>') +
      '<div class="grid">' + ks.map((k, i) => '<button class="mod" style="--c:' + COL[cs[i]] + ';min-height:84px;padding:12px 16px" data-a="ir" data-id="' + k + '">' + ic(MODS[k][1], 28, cs[i]) + '<b style="font-size:16px">' + MODS[k][0] + '</b></button>').join('') + '</div>' +
      '<div class="card grp" style="margin-top:14px">' + [['personas', 'Personas', 4, 'ir" data-id="personas'], ['dilo', 'Dilo o escríbelo', 4, 'abrirDilo'], ['tarjeta', 'Tarjetas conectadas', 7, 'ir" data-id="tarjetasC'], ['reloj', 'Actividad', 5, 'ir" data-id="actividad'], ['ajustes', 'Ajustes', 5, 'ir" data-id="ajustes'], ['ordenar', 'Barra de navegación', 1, 'ir" data-id="barra'], ['inicio', 'Personalizar inicio', 0, 'editarInicio'], ['informacion', 'Acerca de Ronda', 2, 'ir" data-id="acerca']].map(x => '<button class="row" data-a="' + x[3] + '">' + (x[0] === 'dilo' ? '<span class="dlmini">' + puntosDilo('') + '</span>' : ic(x[0], 24, x[2])) + '<b>' + x[1] + '</b>' + chev + '</button>').join('') + '</div>';
  }
};

/* ---------- 88 · Barra de navegación ---------- */
P.barra = {
  html: () => {
    const b = barraMia();
    const libres = Object.keys(MODS).filter(k => b.indexOf(k) < 0);
    return tope('Barra de navegación') + '<p class="texto">Inicio va siempre el primero y Más el último. En medio elige hasta 3. Lo que no esté en la barra se abre desde Más.</p>' +
      '<div class="navprev">' + raices().map(x => '<span>' + ic(x[1], 24, x[3]) + '<small>' + x[2] + '</small></span>').join('') + '</div>' +
      '<h3>En la barra</h3><div class="card grp"><div class="row" style="opacity:.6">' + ic('inicio', 24) + '<b style="flex:1">Inicio</b><small style="font-weight:800">Fijo</small></div>' +
      b.map((k, i) => '<div class="row">' + ic(MODS[k][1], 24, MODS[k][2]) + '<b style="flex:1">' + MODS[k][0] + '</b><button class="mini" data-a="barraMover" data-k="' + k + '" data-v="-1"' + (i === 0 ? ' disabled' : '') + ' aria-label="Subir">↑</button><button class="mini" data-a="barraMover" data-k="' + k + '" data-v="1"' + (i === b.length - 1 ? ' disabled' : '') + ' aria-label="Bajar">↓</button><button class="mini" data-a="barraQuitar" data-k="' + k + '">Quitar</button></div>').join('') +
      '<div class="row" style="opacity:.6">' + ic('menu', 24, 6) + '<b style="flex:1">Más</b><small style="font-weight:800">Fijo</small></div></div>' +
      '<h3>Disponibles</h3><div class="card grp">' + libres.map(k => '<div class="row">' + ic(MODS[k][1], 24, MODS[k][2]) + '<b style="flex:1">' + MODS[k][0] + '</b><button class="mini" data-a="barraPoner" data-k="' + k + '"' + (b.length >= 3 ? ' disabled' : '') + '>Añadir</button></div>').join('') + '</div>' +
      (b.length >= 3 ? '<p class="cap" style="text-align:left">Para añadir otra, quita antes una de la barra.</p>' : '');
  }
};
function fijarBarra(b) { cambiar('personas', S.cfg.persona, { barra: b }); Nav.refrescar(true); Nav.barra(); }
ACC.barraMover = el => { const b = barraMia(), i = b.indexOf(el.dataset.k), j = i + Number(el.dataset.v); if (j < 0 || j >= b.length) return; b.splice(j, 0, b.splice(i, 1)[0]); fijarBarra(b); };
ACC.barraQuitar = el => fijarBarra(barraMia().filter(k => k !== el.dataset.k));
ACC.barraPoner = el => { const b = barraMia(); if (b.length < 3) fijarBarra(b.concat([el.dataset.k])); };

/* ---------- 66-67 · Notas: color en toda la nota y formato sencillo ---------- */
const COLNOTA = [''].concat(COL);
const NOMNOTA = ['Neutro'].concat(NOMCOL);
/* Solo se guardan estas etiquetas: lo demás se queda en texto. */
const ETIQ = { B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', H1: 'h1', H2: 'h2', H3: 'h3', P: 'div', DIV: 'div', BR: 'br', UL: 'ul', OL: 'ol', LI: 'li' };
function limpiarHtml(html) {
  let doc;
  try { doc = new DOMParser().parseFromString('<body>' + String(html || '') + '</body>', 'text/html'); } catch (e) { return esc(html); }
  const pasa = n => {
    let s = '';
    n.childNodes.forEach(x => {
      if (x.nodeType === 3) { s += esc(x.nodeValue); return; }
      if (x.nodeType !== 1) return;
      const t = ETIQ[x.tagName], dentro = pasa(x);
      if (!t) { s += dentro; return; }
      if (t === 'br') { s += '<br>'; return; }
      const cl = (t === 'ul' && x.classList.contains('todo')) ? ' class="todo"' : (t === 'li' && x.classList.contains('hecho')) ? ' class="hecho"' : '';
      s += '<' + t + cl + '>' + dentro + '</' + t + '>';
    });
    return s;
  };
  return pasa(doc.body).slice(0, 60000);
}
const htmlNota = n => n.html ? limpiarHtml(n.html) : String(n.texto || '').split('\n').map(l => '<div>' + (esc(l) || '<br>') + '</div>').join('');
const textoPlano = html => { try { return new DOMParser().parseFromString('<body>' + html.replace(/<\/(div|li|h\d|p)>/g, '$&\n').replace(/<br>/g, '\n') + '</body>', 'text/html').body.textContent.replace(/\n{3,}/g, '\n\n').trim(); } catch (e) { return ''; } };
const colorNota = n => (n && n.color !== undefined && n.color !== null) ? n.color : COLNOTA[2];
const fondoNota = c => c ? 'color-mix(in srgb,' + c + ' var(--ntint),var(--bg))' : 'var(--sf)';
function tarjetaNota(n) {
  return '<button class="nc" style="background:' + fondoNota(colorNota(n)) + '" data-a="verNota" data-id="' + n.id + '">' + (n.fijada ? '<span class="pin">' + ic('etiqueta', 16) + '</span>' : '') +
    '<b>' + (n.emoji ? esc(n.emoji) + ' ' : '') + esc(n.titulo || 'Sin título') + '</b><div class="pv">' + htmlNota(n) + '</div></button>';
}
P.notas = {
  clase: 'con-barra',
  html: () => {
    const l = lista('notas').filter(n => (n.titulo || n.texto || n.html)).sort((a, b) => (b.fijada ? 1 : 0) - (a.fijada ? 1 : 0) || (b.editada || 0) - (a.editada || 0));
    const c1 = l.filter((x, i) => i % 2 === 0), c2 = l.filter((x, i) => i % 2 === 1);
    return tope('') + '<div data-r="banda">' + banda() + '</div>' + head('Notas', l.length + (l.length === 1 ? ' nota' : ' notas')) +
      (l.length ? '<div class="ngrid"><div>' + c1.map(tarjetaNota).join('') + '</div><div>' + c2.map(tarjetaNota).join('') + '</div></div>' : vacio('sin-documentos', 'Sin notas', 'El wifi, el teléfono del fontanero, ideas para el viaje…'));
  },
  fijo: () => '<button class="fab" data-a="aNota" aria-label="Nueva nota">' + ic('anadir', 28) + '</button>'
};
ACC.verNota = el => Nav.ir('nota', { id: el.dataset.id });
const BARRA_NOTA = '<div class="tbar" data-r="tbar"><div class="hrow" data-r="hrow" hidden>' + [['h1', 'Título'], ['h2', 'Subtítulo'], ['h3', 'Encabezado'], ['div', 'Texto']].map(x => '<button tabindex="-1" data-a="fmt" data-v="' + x[0] + '" class="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
  '<div class="trow">' + [['aa', 'Aa', 'Títulos'], ['bold', '<b>B</b>', 'Negrita'], ['italic', '<i>I</i>', 'Cursiva'], ['underline', '<u>U</u>', 'Subrayado'], ['todo', '', 'Casillas'], ['ol', '1.', 'Lista numerada'], ['ul', '•', 'Viñetas'], ['color', '', 'Color']].map(x => '<button tabindex="-1" data-a="fmt" data-v="' + x[0] + '" aria-label="' + x[2] + '">' + (x[0] === 'todo' ? '<span class="cbx"></span>' : x[0] === 'color' ? '<span class="cd"></span>' : x[1]) + '</button>').join('') + '</div></div>';
P.nota = {
  fija: true, clase: 'notapg', sinBarra: true,
  html: p => {
    const n = dato('notas', p.id) || { color: p.nueva ? '' : COLNOTA[2] };
    if (p.color === undefined) p.color = colorNota(n);
    return tope('', '<span style="display:flex;gap:4px"><button class="rt" data-a="notaFijar" aria-label="Fijar">' + ic('etiqueta', 22, n.fijada ? 1 : 0) + '</button><button class="rt" data-a="notaMenu" aria-label="Más">' + ic('menu', 24) + '</button></span>') +
      '<div class="notarow">' + campoEmoji('nEmo', n.emoji || '') + '<input id="nTit" class="notatit" placeholder="Título" maxlength="80" value="' + esc(n.titulo || '') + '"></div>' +
      '<div id="nTxt" class="notaed" contenteditable="true" data-ph="Escribe aquí…">' + htmlNota(n) + '</div>';
  },
  fijo: () => BARRA_NOTA,
  montar(el, p) {
    const ed = $('#nTxt', el), tit = $('#nTit', el);
    el.style.setProperty('--nc', p.color || 'transparent');
    el.classList.toggle('tinta', !!p.color);
    $('.cd', el).style.background = p.color || 'var(--sf)';
    const g = () => {
      const html = limpiarHtml(ed.innerHTML), t = tit.value.trim(), n = dato('notas', p.id) || {}, em = primerEmoji(($('#nEmo', el) || {}).value);
      if (t === (n.titulo || '') && html === (n.html || htmlNota(n)) && em === (n.emoji || '')) return;
      if (!t && !textoPlano(html) && !n.titulo) return;
      cambiar('notas', p.id, Object.assign({ titulo: t, emoji: em, html: html, texto: textoPlano(html), editada: Date.now(), por: S.cfg.persona }, dato('notas', p.id) ? {} : { color: p.color || '' }));
    };
    let t = null;
    const pronto = () => { clearTimeout(t); t = setTimeout(g, 600); };
    tit.addEventListener('input', pronto);
    if ($('#nEmo', el)) $('#nEmo', el).addEventListener('input', () => setTimeout(g, 50));
    ed.addEventListener('input', ev => {
      /* Al pulsar Intro en una casilla tachada, la nueva sale sin tachar. */
      if (ev.inputType === 'insertParagraph') { const li = liCursor(); if (li && li.classList.contains('hecho') && !li.textContent.trim()) li.classList.remove('hecho'); }
      ed.classList.toggle('vacia', !ed.textContent.trim() && !$('li', ed));
      pronto();
    });
    ed.classList.toggle('vacia', !ed.textContent.trim() && !$('li', ed));
    /* Tocar la casilla la marca y la tacha. */
    ed.addEventListener('click', ev => {
      const li = ev.target.closest && ev.target.closest('ul.todo > li');
      if (!li) return;
      const r = li.getBoundingClientRect();
      if (ev.clientX - r.left < 34) { ev.preventDefault(); li.classList.toggle('hecho'); pronto(); }
    });
    /* Los botones de formato no quitan el cursor del texto. */
    const tb = $('[data-r="tbar"]', el);
    ['pointerdown', 'mousedown'].forEach(x => tb.addEventListener(x, ev => ev.preventDefault()));
    document.addEventListener('selectionchange', p.sel = () => { const s = getSelection(); if (s.rangeCount && ed.contains(s.anchorNode)) p.rango = s.getRangeAt(0).cloneRange(); });
    p.guardar = g;
    if (p.nueva) setTimeout(() => tit.focus(), 400);
  },
  alSalir(e) { if (e.params.guardar) e.params.guardar(); if (e.params.sel) document.removeEventListener('selectionchange', e.params.sel); }
};
function liCursor() { const s = getSelection(); if (!s.rangeCount) return null; let n = s.anchorNode; while (n && n.nodeName !== 'LI' && n.id !== 'nTxt') n = n.parentNode; return n && n.nodeName === 'LI' ? n : null; }
function enEditor() {
  const ed = $('#nTxt', Nav.actual().el), s = getSelection();
  if (!ed) return null;
  if (!(s.rangeCount && ed.contains(s.anchorNode))) {
    ed.focus();
    const r = Nav.actual().params.rango;
    if (r) { s.removeAllRanges(); s.addRange(r); } else { const rr = document.createRange(); rr.selectNodeContents(ed); rr.collapse(false); s.removeAllRanges(); s.addRange(rr); }
  }
  return ed;
}
ACC.fmt = el => {
  const v = el.dataset.v, e = Nav.actual();
  if (v === 'color') return ACC.notaColores();
  if (v === 'aa') { const h = $('[data-r="hrow"]', e.el); h.hidden = !h.hidden; el.classList.toggle('on', !h.hidden); return; }
  const ed = enEditor(); if (!ed) return;
  try {
    if (v === 'bold' || v === 'italic' || v === 'underline') document.execCommand(v);
    else if (/^(h1|h2|h3|div)$/.test(v)) { document.execCommand('formatBlock', false, '<' + v + '>'); const h = $('[data-r="hrow"]', e.el); h.hidden = true; $('[data-v="aa"]', e.el).classList.remove('on'); }
    else if (v === 'ol') document.execCommand('insertOrderedList');
    else if (v === 'ul' || v === 'todo') {
      const li = liCursor(), ul = li && li.parentNode;
      if (v === 'todo' && ul && ul.nodeName === 'UL' && !ul.classList.contains('todo')) ul.classList.add('todo');
      else if (v === 'ul' && ul && ul.nodeName === 'UL' && ul.classList.contains('todo')) ul.classList.remove('todo');
      else {
        document.execCommand('insertUnorderedList');
        const li2 = liCursor();
        if (v === 'todo' && li2 && li2.parentNode.nodeName === 'UL') li2.parentNode.classList.add('todo');
      }
    }
  } catch (x) { anotar('formato', x); }
  ed.dispatchEvent(new Event('input'));
};
ACC.notaColores = () => {
  const p = Nav.actual().params;
  abrirHoja('<h3>Color</h3><div class="colsn">' + COLNOTA.map((c, i) => '<button data-a="notaColor" data-c="' + c + '" class="' + (p.color === c ? 'on' : '') + '"><span style="background:' + (c || 'var(--sf)') + '"></span><small>' + NOMNOTA[i] + '</small></button>').join('') + '</div>');
};
ACC.notaColor = el => {
  const e = Nav.actual(), p = e.params; const c = el.dataset.c;
  if (p.guardar) p.guardar();
  p.color = c;
  if (dato('notas', p.id)) cambiar('notas', p.id, { color: c });
  e.el.style.setProperty('--nc', c || 'transparent'); e.el.classList.toggle('tinta', !!c);
  const cd = $('.cd', e.el); if (cd) cd.style.background = c || 'var(--sf)';
  $$('[data-a="notaColor"]').forEach(b => b.classList.toggle('on', b === el));
  setTimeout(cerrarHoja, 180);
};
ACC.notaMenu = () => { const p = Nav.actual().params, n = dato('notas', p.id) || {}; abrirHoja('<div class="list"><button class="row card" data-a="notaFijar">' + ic('etiqueta', 24, 1) + '<b>' + (n.fijada ? 'Quitar de fijadas' : 'Fijar (arriba y en Inicio)') + '</b></button><button class="row card" data-a="notaColores">' + sq('foto', 6) + '<b>Color</b></button><button class="row card" data-a="notaCompartir">' + ic('compartir', 24) + '<b>Compartir</b></button><button class="row card" data-a="notaBorrar">' + ic('borrar', 24, 0) + '<b>Borrar nota</b></button></div>'); };
ACC.notaFijar = () => { cerrarHoja(); const p = Nav.actual().params; if (p.guardar) p.guardar(); if (!dato('notas', p.id)) return toast('Escribe algo primero.'); const f = !(dato('notas', p.id) || {}).fijada; cambiar('notas', p.id, { fijada: f }); const b = $('[data-a="notaFijar"]', Nav.actual().el); if (b) b.innerHTML = ic('etiqueta', 22, f ? 1 : 0); toast(f ? 'Fijada' : 'Ya no está fijada'); };
ACC.notaCompartir = async () => { cerrarHoja(); const p = Nav.actual().params; if (p.guardar) p.guardar(); const n = dato('notas', p.id) || {}; const t = (n.titulo ? n.titulo + '\n\n' : '') + (n.texto || ''); try { if (navigator.share) await navigator.share({ text: t }); else if (await copiar(t)) toast('Copiada'); } catch (e) { } };
ACC.notaBorrar = () => { cerrarHoja(); const p = Nav.actual().params; p.guardar = null; cambiar('notas', p.id, { _b: 1 }); Nav.atras(); toast('Nota borrada', 'Deshacer', () => { cambiar('notas', p.id, { _b: 0 }); Nav.refrescar(); }); };

/* ---------- 17 · Buscar (en todo el espacio) ---------- */
P.buscar = {
  fija: true, clase: 'con-barra',
  html: p => tope('Buscar') + '<label class="srch">' + ic('buscar', 24, 5) + '<input id="bQ" placeholder="Busca en todo el espacio" autocomplete="off" enterkeyhint="search" value="' + esc(p.q || '') + '"></label><div data-r="res">' + resultados(p.q || '') + '</div>',
  montar(el, p) { const i = $('#bQ', el); let t = null; i.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { p.q = i.value; $('[data-r="res"]', el).innerHTML = resultados(p.q); }, 200); }); setTimeout(() => i.focus(), 400); }
};
function resultados(q) {
  const n = normal(q).trim();
  if (n.length < 2) return '<p class="texto" style="margin-top:14px">Tareas, compra, notas, gastos, documentos, eventos, menú, plantas, medicación, acuario y coches.</p>';
  const ok = t => normal(t).indexOf(n) >= 0;
  const g = {};
  const add = (grupo, x) => { (g[grupo] = g[grupo] || []).push(x); };
  lista('tareas').filter(x => ok(x.titulo + ' ' + (x.notas || ''))).forEach(x => add('Tareas', ['modulo-tareas', 1, x.titulo, x.hecho ? 'Hecha' : cuando(x.fecha, x.hora), 'verTarea', x.id]));
  lista('compra').filter(x => ok(x.nombre)).forEach(x => { const L = datoLista(listaDe(x)); if (L) add('Compra', ['modulo-compra', 2, x.nombre, L.nombre + ' · ' + (x.hecho ? 'en el carrito' : L.secciones ? NOMSEC(x.seccion) : 'por comprar'), 'abrirLista', L.id]); });
  lista('notas').filter(x => ok((x.titulo || '') + ' ' + (x.texto || ''))).forEach(x => add('Notas', ['modulo-notas', 0, x.titulo || 'Nota', String(x.texto || '').replace(/\s+/g, ' ').slice(0, 50), 'verNota', x.id]));
  lista('fijos').filter(x => ok(x.nombre)).forEach(x => add('Gastos', ['modulo-gastos', 7, x.nombre, 'Gasto fijo · ' + euros(x.importe), 'verFijo', x.id]));
  lista('movs').filter(x => ok(x.concepto || '')).forEach(x => add('Gastos', ['modulo-gastos', 7, x.concepto, 'Cuenta · ' + euros(x.importe), 'verMov', x.id]));
  lista('documentos').filter(x => ok(x.nombre)).forEach(x => add('Documentos', ['modulo-documentos', 6, x.nombre, 'Documento cifrado', 'docAbrir', x.id]));
  const ev = {}; Object.keys(AG.cache).forEach(m => (AG.cache[m].ev || []).forEach(e => { if (!ev[e.id] && ok(e.titulo + ' ' + (e.lugar || ''))) { ev[e.id] = 1; add('Agenda', ['modulo-calendario', 5, e.titulo, cuando(isoDia(new Date(e.inicio))), 'verEvento', e.id]); } }));
  lista('menu').forEach(m => { const lun = deISO(m.id.slice(1, 5) + '-' + m.id.slice(5, 7) + '-' + m.id.slice(7, 9)); if (!lun) return; Object.keys(m).forEach(k => { const mm = k.match(/^d([1-7])([yacmn])$/); if (mm && m[k] && ok(m[k])) { const d = sumaDias(lun, +mm[1] - 1); add('Menú', ['modulo-menu-semanal', 1, m[k], cap(DIAS[d.getDay()]) + ' ' + d.getDate() + ' · ' + (COMIDAS.find(c => c[0] === mm[2]) || [, ''])[1].toLowerCase(), 'abrirMenuBus', isoDia(lun)]); } }); });
  ['plantas', 'medicacion', 'acuario'].forEach(c => lista(c).filter(x => ok((x.nombre || '') + ' ' + (x.dosis || ''))).forEach(x => add(MODS[c][0], [MODS[c][1], MODS[c][2], x.nombre, x.dosis || MODS[c][0], 'rutVer" data-col="' + c, x.id])));
  coches().filter(c => ok(c.nombre + ' ' + (c.matricula || ''))).forEach(c => add('Coches', ['modulo-coche', 5, c.nombre, c.matricula || 'Coche', 'verCoche', c.id]));
  lista('coche').filter(x => ok(x.nombre)).forEach(x => add('Coches', ['modulo-coche', 5, x.nombre, ((datoCoche(cocheDe(x)) || {}).nombre || 'Coche') + (x.fecha ? ' · ' + fechaCorta(deISO(x.fecha)) : ''), 'cocheFechaVer', x.id]));
  const ks = Object.keys(g);
  if (!ks.length) return '<div class="ill big" style="margin-top:30px">' + ilu('sin-resultados') + '</div><h2 class="lg" style="font-size:24px">Sin resultados</h2><p class="mu">Prueba con otra palabra.</p>';
  return ks.map(k => '<h3>' + k + '</h3><div class="card grp">' + g[k].slice(0, 30).map(x => '<button class="row" data-a="' + x[4] + '" data-id="' + esc(x[5]) + '">' + sq(x[0], x[1]) + '<div class="f"><b>' + esc(x[2]) + '</b><small>' + esc(x[3]) + '</small></div></button>').join('') + '</div>').join('');
}
ACC.abrirMenuBus = el => Nav.ir('menu', { semana: el.dataset.id });
ACC.verFijo = el => Nav.ir('fijoVer', { fid: el.dataset.id });
