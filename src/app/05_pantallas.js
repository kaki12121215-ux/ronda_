/* ============================ PIEZAS DE INICIO ============================ */
const PASTEL = ['#F2B824', '#A6C93A', '#EE8AA8', '#2BB5B0', '#9B86E0', '#F0674B'];
function pilaAvatares(max) {
  const ps = personas();
  return '<button class="stk" data-a="ir" data-id="personas" style="border:0;background:none" aria-label="Personas">' + ps.slice(0, max || 4).map(p => av(p, 44)).join('') + '</button>';
}
function resumenCompra() {
  const falta = lista('compra').filter(x => !x.hecho).length;
  return falta ? falta + ' por comprar' : 'Nada por comprar';
}

/* ============================ COMPRA ============================ */
/* Secciones de la compra: el glosario está en 00_glosario.js. */
const SECCIONES = GLOSARIO;
const NOMSEC = id => (SECCIONES.find(s => s[0] === id) || SECCIONES[SECCIONES.length - 1])[1];
/* Singular sencillo, igual para el glosario y para lo que se escribe: «tomates» = «tomate», «limones» = «limon». */
const singular = w => w.length > 3 && /[lnrdj]es$/.test(w) ? w.slice(0, -2) : (w.length > 3 && /ces$/.test(w) ? w.slice(0, -3) + 'z' : (w.length > 3 && /[^s]s$/.test(w) ? w.slice(0, -1) : w));
const normal = t => ' ' + sinAcentos(t).replace(/[^a-z0-9ñ]+/g, ' ').trim().split(' ').map(singular).join(' ') + ' ';
let INDICE = null;
function indice() {
  if (INDICE) return INDICE;
  INDICE = [];
  GLOSARIO.forEach(s => s[2].split(',').map(x => x.trim()).filter(Boolean).forEach(f => INDICE.push([normal(f), s[0]])));
  INDICE.sort((a, b) => b[0].length - a[0].length);
  return INDICE;
}
/* Clave de un producto para recordar correcciones (igual en los dos móviles). */
function claveProducto(nombre) {
  const n = normal(nombre).trim();
  let h = 5381;
  for (let i = 0; i < n.length; i++) h = ((h * 33) ^ n.charCodeAt(i)) >>> 0;
  return 'a' + h.toString(36) + n.length.toString(36);
}
function adivinarSeccion(nombre) {
  const ap = dato('aprendido', claveProducto(nombre));
  if (ap && ap.seccion) return ap.seccion;
  const n = normal(nombre);
  const x = indice().find(e => n.indexOf(e[0]) >= 0);
  return x ? x[1] : 'otros';
}
function partirCantidad(txt) {
  const m = txt.match(/^(\d+(?:[.,]\d+)?\s*(?:kg|g|l|ml|uds?|unidades|paquetes?|botellas?|latas?|docenas?)?)\s+(?:de\s+)?(.+)$/i);
  return m ? { cantidad: m[1].trim(), nombre: m[2].trim() } : { cantidad: '', nombre: txt.trim() };
}

/* ---------- Listas de la compra: Supermercado (por secciones) y las que creéis (Bazar, Ropa…) ---------- */
const LSUPER = 'lsuper';
const ICONOS_LISTA = [['carrito', 2], ['bolsa', 7], ['ropa', 6], ['salud', 1], ['regalo', 0], ['casa', 4], ['mascotas-gasto', 3], ['deporte', 5]];
function listasCompra() {
  const m = S.recs.listas || {}, out = [];
  const sup = m[LSUPER];
  if (!sup || !sup.f._b) out.push(Object.assign({ id: LSUPER, nombre: 'Supermercado', icono: 'carrito', ci: 2, secciones: true, orden: 0 }, sup ? sup.f : {}));
  lista('listas').filter(x => x.id !== LSUPER).forEach(x => out.push(x));
  return out.sort((a, b) => (a.orden || 0) - (b.orden || 0));
}
const listaDe = x => x.lista || LSUPER;
const datoLista = id => listasCompra().find(l => l.id === id) || null;
function ultimaLista() {
  let u = ''; try { u = localStorage.getItem('rondaP-ultlista') || ''; } catch (e) { }
  const ls = listasCompra();
  return (ls.find(l => l.id === u) || ls[0] || { id: LSUPER }).id;
}
function fijarUltima(id) { try { localStorage.setItem('rondaP-ultlista', id); } catch (e) { } }
const pendientesDe = lid => lista('compra').filter(x => !x.hecho && listaDe(x) === lid).length;

P.compra = {
  raiz: true, clase: 'con-barra',
  html: () => {
    const ls = listasCompra(), tot = lista('compra').filter(x => !x.hecho && ls.some(l => l.id === listaDe(x))).length;
    let h = tope('') + '<div data-r="banda">' + banda() + '</div>' + head('Compra', tot ? tot + ' por comprar' + (ls.length > 1 ? ' en ' + ls.length + ' listas' : '') : 'Nada por comprar');
    h += '<div class="list">' + ls.map(l => { const n = pendientesDe(l.id); return '<button class="row card" data-a="abrirLista" data-lp="menuLista" data-id="' + l.id + '">' + emo(l.emoji, sq(l.icono || 'carrito', l.ci || 0), 44) + '<div class="f"><b>' + esc(l.nombre) + '</b><small>' + (n ? n + ' por comprar' : 'Nada por comprar') + (l.secciones ? ' · por secciones' : '') + '</small></div>' + chev + '</button>'; }).join('') +
      '<button class="row card dash" data-a="nuevaLista">' + ic('anadir', 22) + '<b>Nueva lista</b></button></div>';
    return h + '<p class="cap" style="margin-top:16px;font-size:13px">Mantén el dedo en una lista para cambiarla o borrarla.</p>';
  },
  fijo: () => '<button class="fab" data-a="aProducto" aria-label="Añadir producto">' + ic('anadir', 28) + '</button>'
};
ACC.abrirLista = el => { fijarUltima(el.dataset.id); Nav.ir('lista', { lid: el.dataset.id }); };
ACC.nuevaLista = () => Nav.ir('listaEditar', { icono: 'bolsa', ci: 7, secciones: false });
ACC.menuLista = el => {
  const l = datoLista(el.dataset.id); if (!l) return;
  abrirHoja('<h3>' + esc(l.nombre) + '</h3><div class="list"><button class="row card" data-a="editarLista" data-id="' + l.id + '">' + ic('editar', 24) + '<b>Cambiar</b></button><button class="row card" data-a="compartirLista" data-id="' + l.id + '">' + ic('compartir', 24, 5) + '<b>Compartir con alguien de fuera</b></button>' + (listasCompra().length > 1 ? '<button class="row card" data-a="borrarLista" data-id="' + l.id + '">' + ic('borrar', 24, 0) + '<b>Borrar lista</b></button>' : '') + '</div>');
};
ACC.editarLista = el => { cerrarHoja(); const l = datoLista(el.dataset.id); Nav.ir('listaEditar', Object.assign({ lid: l.id }, l)); };
ACC.borrarLista = async el => {
  cerrarHoja();
  const l = datoLista(el.dataset.id); if (!l) return;
  const n = lista('compra').filter(x => listaDe(x) === l.id).length;
  if (!await preguntar('¿Borrar «' + l.nombre + '»?', n ? 'Se borran también sus ' + n + ' productos.' : '', 'Borrar lista', true)) return;
  lista('compra').filter(x => listaDe(x) === l.id).forEach(x => cambiar('compra', x.id, { _b: 1 }));
  cambiar('listas', l.id, { _b: 1 });
  if (Nav.actual().id !== 'compra') Nav.atras(); else Nav.refrescar(true);
  toast('Lista borrada');
};

/* Una lista */
P.lista = {
  clase: 'con-barra',
  html: (p, e) => {
    const L = datoLista(p.lid) || { id: p.lid, nombre: 'Lista', secciones: false };
    const l = lista('compra').filter(x => listaDe(x) === L.id);
    const falta = l.filter(x => !x.hecho), hechos = l.filter(x => x.hecho);
    let h = tope((L.emoji ? L.emoji + ' ' : '') + L.nombre, '<span style="display:flex;gap:2px"><button class="rt" data-a="ir" data-id="compartir" data-lid="' + esc(L.id) + '" aria-label="Compartir con alguien de fuera">' + ic('compartir', 22) + '</button><button class="rt" data-a="editarLista" data-id="' + esc(L.id) + '" aria-label="Cambiar la lista">' + ic('editar', 22) + '</button></span>') + '<div data-r="banda">' + banda() + '</div>' +
      '<p class="sub2">' + (l.length ? falta.length + ' por comprar · ' + hechos.length + ' en el carrito' : 'Lista vacía') + '</p>';
    if (!l.length) return h + '<div class="ill big" style="margin-top:30px">' + ilu('sin-compras') + '</div><h2 class="lg" style="font-size:26px">Sin compras</h2><p class="mu">Escribe abajo lo que falta.</p>';
    const fila = x => {
      const quien = dato('personas', x.creadoPor);
      const nuevo = e && e.pintado && !e.vistos[x.id];
      if (e) e.vistos[x.id] = 1;
      return '<div class="row it' + (x.hecho ? ' dn' : '') + (nuevo ? ' nuevo' : '') + '" data-a="marcar" data-lp="menuProducto" data-id="' + x.id + '">' +
        '<span class="ck' + (x.hecho ? ' on' : '') + '" style="' + (x.hecho ? 'background:' + ((dato('personas', x.hechoPor) || {}).color || '#2E8B57') + ';border-color:transparent' : '') + '">' + tick(16) + '</span>' +
        '<div class="f"><b>' + esc(x.nombre) + '</b>' + ((x.cantidad || quien || (x.para && !x.hecho)) ? '<small>' + [x.cantidad ? esc(textoCantidad(x.cantidad)) : '', x.para && !x.hecho ? esc(textoPara(x.para)) : '', quien ? '<span class="quien">' + dot(quien.color, 8) + esc(quien.nombre) + '</span>' : ''].filter(Boolean).join(' · ') + '</small>' : '') + '</div></div>';
    };
    const orden = (a, b) => (a.orden || 0) - (b.orden || 0);
    if (L.secciones) SECCIONES.forEach(s => {
      const xs = falta.filter(x => (x.seccion || 'otros') === s[0]).sort(orden);
      if (xs.length) h += '<h3>' + s[1] + '</h3><div class="card grp">' + xs.map(fila).join('') + '</div>';
    });
    else if (falta.length) h += '<div class="card grp" style="margin-top:14px">' + falta.sort(orden).map(fila).join('') + '</div>';
    if (hechos.length) h += '<h3>En el carrito</h3><div class="card grp">' + hechos.sort((a, b) => (b.hechoEn || 0) - (a.hechoEn || 0)).map(fila).join('') + '</div>' +
      '<button class="btn sec" data-a="quitarComprados" style="margin-top:14px">Quitar los comprados (' + hechos.length + ')</button>';
    if (e) e.pintado = true;
    return h + '<p class="cap" style="margin-top:18px;font-size:13px">Mantén el dedo en un producto para cambiarlo o borrarlo.</p>';
  },
  montar(el, p, e) { e.pintado = true; montarSugerencias(el); },
  fijo: () => '<div class="sugs" data-r="sugs"></div><form class="addbar" data-r="add" onsubmit="return false">' + ic('anadir', 22) + '<input id="nuevo" placeholder="Añadir producto" autocomplete="off" enterkeyhint="done" maxlength="60"><button class="mini" data-a="anadirCompra" type="submit">Añadir</button></form>'
};
const listaActual = () => { const e = Nav.actual(); return (e && e.params && e.params.lid) || ultimaLista(); };
/* Sugerencias mientras se escribe: lo que está en el carrito o ya se compró y se quitó. Al tocarla, vuelve a la lista. */
function sugerenciasCompra(txt, lid) {
  const q = normal(txt).trim();
  if (q.length < 2) return [];
  const m = S.recs.compra || {}, vistos = {}, out = [];
  Object.keys(m).forEach(id => {
    const f = m[id].f;
    if (!f.nombre || (!f._b && !f.hecho) || (f.lista || LSUPER) !== lid) return;
    const k = normal(f.nombre).trim();
    if (vistos[k] && (vistos[k].f._b ? 0 : 1) >= (f._b ? 0 : 1)) return;
    const pos = k.indexOf(q);
    if (pos < 0) return;
    vistos[k] = { id: id, f: f, pos: pos === 0 ? 0 : 1 };
  });
  Object.keys(vistos).forEach(k => out.push(vistos[k]));
  out.sort((a, b) => a.pos - b.pos || (b.f.veces || 0) - (a.f.veces || 0) || a.f.nombre.localeCompare(b.f.nombre, 'es'));
  return out.slice(0, 4);
}
function montarSugerencias(el) {
  const i = $('#nuevo', el), cont = $('[data-r="sugs"]', el);
  if (!i || !cont) return;
  const pinta = () => {
    const l = sugerenciasCompra(i.value, listaActual());
    cont.innerHTML = l.map(x => '<button class="sug" data-a="reabrir" data-id="' + x.id + '"><span class="ck on" style="background:#9FB0B8;border-color:transparent">' + tick(14) + '</span><b>' + esc(x.f.nombre) + '</b><small>' + (x.f._b ? 'Comprado antes' : 'En el carrito') + '</small></button>').join('');
    cont.classList.toggle('ver', l.length > 0);
  };
  i.addEventListener('input', pinta);
  i.addEventListener('blur', () => setTimeout(() => cont.classList.remove('ver'), 200));
  i.addEventListener('focus', pinta);
}
ACC.reabrir = el => {
  const r = (S.recs.compra || {})[el.dataset.id]; if (!r) return;
  cambiar('compra', el.dataset.id, { _b: 0, hecho: false, hechoPor: '', orden: Date.now(), veces: (r.f.veces || 1) + 1, creadoPor: S.cfg.persona });
  const i = $('#nuevo'); i.value = ''; $('[data-r="sugs"]').classList.remove('ver');
  Nav.refrescar(true); i.focus();
  toast('«' + r.f.nombre + '» vuelve a la lista');
};
/* Añade un producto a una lista (o lo reabre si ya estaba comprado). Devuelve el texto para el aviso. */
function anadirProducto(txt, lid, extra) {
  const c = partirCantidad(txt);
  const nombre = cap(c.nombre);
  if (!nombre) return '';
  const L = datoLista(lid) || { id: LSUPER };
  const igual = lista('compra').find(x => listaDe(x) === L.id && sinAcentos(x.nombre) === sinAcentos(nombre));
  if (igual && !igual.hecho) return '«' + nombre + '» ya está en la lista.';
  if (igual && igual.hecho) cambiar('compra', igual.id, Object.assign({ hecho: false, hechoPor: '', cantidad: c.cantidad || igual.cantidad || '', orden: Date.now(), para: '' }, extra || {}));
  else cambiar('compra', 'c' + uid(), Object.assign({ nombre: nombre, seccion: adivinarSeccion(nombre), cantidad: c.cantidad, hecho: false, orden: Date.now(), creadoPor: S.cfg.persona, lista: L.id }, extra || {}));
  fijarUltima(L.id);
  return '';
}
ACC.anadirCompra = () => {
  const i = $('#nuevo');
  const v = i.value.trim();
  if (!v) { i.focus(); return; }
  const aviso = anadirProducto(v, listaActual());
  if (aviso) toast(aviso);
  i.value = '';
  Nav.refrescar(true);
  i.focus();
};
/* Producto desde el + o desde Inicio: se elige la lista (por defecto, la última usada). */
ACC.aProducto = () => {
  const ls = listasCompra();
  let lid = ultimaLista();
  const nom = id => esc((ls.find(l => l.id === id) || {}).nombre || '');
  abrirHoja('<h3>Añadir producto</h3><label class="fld"><small>Producto</small><input id="apN" maxlength="60" autocomplete="off" enterkeyhint="done" placeholder="Leche, pilas…"></label>' +
    (ls.length > 1 ? '<p class="lab2">¿A qué lista?</p><div class="chips">' + ls.map(l => '<button class="chip' + (l.id === lid ? ' on' : '') + '" data-a="apLista" data-id="' + l.id + '">' + esc(l.nombre) + '</button>').join('') + '</div>' : '') +
    '<button class="btn pri" data-a="apOk" style="margin-top:16px">Añadir a ' + nom(lid) + '</button>',
    { montar: h => setTimeout(() => { const i = $('#apN', h); if (i) { i.focus(); i.addEventListener('keydown', ev => { if (ev.key === 'Enter') ACC.apOk(); }); } }, 350) });
  ACC.apLista = el => { lid = el.dataset.id; $$('.hoja [data-a="apLista"]').forEach(b => b.classList.toggle('on', b === el)); const b = $('.hoja [data-a="apOk"]'); if (b) b.innerHTML = 'Añadir a ' + nom(lid); };
  ACC.apOk = () => {
    const v = val('apN'); if (!v) { const i = $('#apN'); if (i) i.focus(); return; }
    const aviso = anadirProducto(v, lid);
    cerrarHoja();
    toast(aviso || '«' + cap(partirCantidad(v).nombre) + '» añadido a ' + (ls.find(l => l.id === lid) || {}).nombre);
    Nav.refrescar();
  };
};
ACC.marcar = el => {
  const x = dato('compra', el.dataset.id);
  if (!x) return;
  const h = !x.hecho;
  el.classList.toggle('dn', h);
  const ck = $('.ck', el);
  if (ck) { ck.classList.toggle('on', h); ck.style.background = h ? (yo() || {}).color || '#2E8B57' : ''; ck.style.borderColor = h ? 'transparent' : ''; }
  cambiar('compra', x.id, { hecho: h, hechoPor: h ? S.cfg.persona : '', hechoEn: Date.now() });
  setTimeout(() => Nav.refrescar(), 650);
};
ACC.menuProducto = el => {
  const x = dato('compra', el.dataset.id);
  if (!x) return;
  abrirHoja('<h3>' + esc(x.nombre) + '</h3><div class="list"><button class="row card" data-a="editarProducto" data-id="' + x.id + '">' + ic('editar', 24) + '<b>Cambiar</b></button><button class="row card" data-a="borrarProducto" data-id="' + x.id + '">' + ic('borrar', 24, 0) + '<b>Borrar</b></button></div>');
};
ACC.editarProducto = el => { cerrarHoja(); Nav.ir('producto', { id: el.dataset.id }); };
ACC.borrarProducto = el => {
  cerrarHoja();
  const id = el.dataset.id, x = dato('compra', id);
  const fila = $('.it[data-id="' + id + '"]', Nav.actual().el);
  if (fila) fila.classList.add('sale');
  setTimeout(() => { cambiar('compra', id, { _b: 1 }); Nav.refrescar(); if (Nav.actual().id === 'producto') Nav.atras(); }, fila ? 280 : 0);
  toast('«' + x.nombre + '» borrado', 'Deshacer', () => { cambiar('compra', id, { _b: 0 }); Nav.refrescar(); });
};
ACC.quitarComprados = () => {
  const lid = listaActual();
  const hs = lista('compra').filter(x => x.hecho && listaDe(x) === lid);
  hs.forEach(x => { const f = $('.it[data-id="' + x.id + '"]', Nav.actual().el); if (f) f.classList.add('sale'); });
  setTimeout(() => { hs.forEach(x => cambiar('compra', x.id, { _b: 1 })); Nav.refrescar(); }, 280);
  toast(hs.length + (hs.length === 1 ? ' producto quitado' : ' productos quitados'), 'Deshacer', () => { hs.forEach(x => cambiar('compra', x.id, { _b: 0 })); Nav.refrescar(); });
};

/* Crear o cambiar una lista */
P.listaEditar = {
  clase: 'con-boton', fija: true,
  html: p => tope(p.lid ? 'Cambiar lista' : 'Nueva lista') + filaNombreEmoji('lEmo', pv(p, 'lEmo', p.emoji), fldTxt('lNom', 'Nombre', pv(p, 'lNom', p.nombre), 'Bazar, Ropa, Farmacia…', 'maxlength="30"')) +
    '<p class="lab2">Icono</p><div class="icos">' + ICONOS_LISTA.map(x => '<button class="' + (p.icono === x[0] ? 'on' : '') + '" data-a="lIcono" data-v="' + x[0] + '" data-c="' + x[1] + '">' + ic(x[0], 28, x[1]) + '</button>').join('') + '</div>' +
    '<div class="row card" style="margin-top:14px"><div class="f"><b>Ordenar por secciones</b><small>Fruta, lácteos, limpieza… como en el súper</small></div>' + swi(!!p.secciones, 'pTog', 'data-k="secciones"') + '</div>' +
    (p.lid && listasCompra().length > 1 ? '<button class="btn sec peligro" data-a="borrarLista" data-id="' + esc(p.lid) + '" style="margin-top:14px">Borrar lista</button>' : ''),
  fijo: p => '<div class="btns">' + btn(p.lid ? 'Guardar' : 'Crear lista', 'guardarLista') + '</div>'
};
ACC.lIcono = el => { const p = Nav.actual().params; p.icono = el.dataset.v; p.ci = +el.dataset.c; repintar(); };
ACC.guardarLista = () => {
  const e = Nav.actual(); guardarCampos(e); const p = e.params, n = cap(val('lNom'));
  if (!n) return toast('Ponle un nombre.');
  const id = p.lid || 'l' + uid();
  const c = { nombre: n, emoji: primerEmoji(val('lEmo')), icono: p.icono || 'bolsa', ci: Number(p.ci) || 0, secciones: !!p.secciones };
  if (!p.lid) c.orden = Date.now();
  if (p.lid === LSUPER) c.orden = 0;
  cambiar('listas', id, c);
  Nav.atras(); toast(p.lid ? 'Lista cambiada' : 'Lista creada');
};

/* 51 · Cambiar producto */
P.producto = {
  clase: 'con-boton', fija: true,
  html: p => {
    const x = dato('compra', p.id) || {};
    p.sec = p.sec || x.seccion || 'otros';
    p.lid = p.lid || listaDe(x);
    const L = datoLista(p.lid) || {};
    const ls = listasCompra();
    return tope('Cambiar producto') + '<label class="fld"><small>Producto</small><input id="prNom" maxlength="60" value="' + esc(pv(p, 'prNom', x.nombre)) + '"></label>' +
      (ls.length > 1 ? '<p class="lab2">Lista</p><div class="chips">' + ls.map(l => '<button class="chip' + (p.lid === l.id ? ' on' : '') + '" data-a="pSet" data-k="lid" data-v="' + l.id + '">' + esc(l.nombre) + '</button>').join('') + '</div>' : '') +
      (L.secciones ? '<p class="lab2">Sección</p><div class="chips">' + SECCIONES.map(s => '<button class="chip' + (p.sec === s[0] ? ' on' : '') + '" data-a="secProducto" data-id="' + s[0] + '">' + s[1] + '</button>').join('') + '</div>' : '') +
      '<label class="fld" style="margin-top:16px"><small>Cantidad</small><input id="prCan" maxlength="30" value="' + esc(pv(p, 'prCan', x.cantidad || '')) + '" placeholder="Por ejemplo, 2 botellas"></label>' +
      '<button class="btn sec peligro" data-a="borrarProducto" data-id="' + esc(p.id) + '" style="margin-top:18px">Borrar producto</button>';
  },
  fijo: () => '<div class="btns">' + btn('Guardar', 'guardarProducto') + '</div>'
};
ACC.secProducto = el => { Nav.actual().params.sec = el.dataset.id; $$('[data-a="secProducto"]', Nav.actual().el).forEach(b => b.classList.toggle('on', b === el)); };
ACC.guardarProducto = () => {
  const p = Nav.actual().params, n = $('#prNom').value.trim();
  if (!n) return toast('Escribe el nombre del producto.');
  const antes = dato('compra', p.id) || {};
  cambiar('compra', p.id, { nombre: n, seccion: p.sec, cantidad: $('#prCan').value.trim(), lista: p.lid || LSUPER });
  /* Si se cambia la sección, se recuerda para la próxima vez (en los dos móviles). */
  if ((datoLista(p.lid) || {}).secciones && (p.sec !== antes.seccion || p.sec !== adivinarSeccion(n))) cambiar('aprendido', claveProducto(n), { nombre: n, seccion: p.sec });
  Nav.atras();
};

/* ============================ PERSONAS ============================ */
const NOMROL = r => r === 'admin' ? 'Administrador' : 'Integrante';
P.personas = {
  clase: 'con-barra',
  html: () => {
    const ps = personas();
    let h = tope('') + '<div data-r="banda">' + banda() + '</div>' + head('Personas', esc(espacio().nombre)) + '<div class="list">' + ps.map(p =>
      '<button class="row card" data-a="ir" data-id="persona" data-pid="' + p.id + '">' + av(p, 46) + '<div class="f"><b>' + esc(p.nombre) + (p.id === S.cfg.persona ? ' <span style="color:var(--mu);font-weight:600">· tú</span>' : '') + '</b><small>' + NOMROL(p.rol) + '</small></div>' + dot(p.color, 14) + '</button>').join('') + '</div>';
    if (esAdmin()) h += '<button class="btn pri" data-a="ir" data-id="invitar" style="margin-top:16px">' + ic('invitar', 22) + 'Invitar a alguien</button>';
    if (ps.length < 2) h += '<div class="ill big">' + ilu('sin-personas-aun') + '</div><p class="mu">' + (esAdmin() ? 'Invita a quien quieras: cada persona tendrá su propio código.' : 'Aquí saldrá cada persona del espacio.') + '</p>';
    return h;
  }
};

/* 72 · Invitar */
P.invitar = {
  fija: true,
  html: p => {
    p.para = p.para || 'nueva'; p.rol = p.rol || 'integrante';
    const otros = personas().filter(x => x.id !== S.cfg.persona);
    let h = tope('Invitar a alguien');
    if (p.res) {
      return h + '<div class="ill mid">' + ilu('invita-a-los-tuyos') + '</div><div class="card inv"><p class="eye">' + (p.res.para ? 'Código para ' + esc(p.res.para) : 'Su código') + '</p><div class="code">' + esc(p.res.codigo) + '</div>' +
        '<small>Caduca a las ' + hora(new Date(p.res.caduca)) + (new Date(p.res.caduca).getDate() !== new Date().getDate() ? ' de mañana' : '') + ' · sirve una sola vez</small>' +
        '<p class="codelargo">' + esc(p.res.paquete) + '</p>' +
        '<div class="btns2"><button class="btn pri sm" data-a="compartirInv">' + ic('compartir', 20) + 'Compartir</button><button class="btn sec sm" data-a="copiarInv">Copiar</button></div></div>' +
        '<div class="aviso">' + ic('informacion', 22, 5) + '<span>Tiene que pegarlo <b>dentro de Ronda</b>, abierta desde el icono de la pantalla de inicio, en «Ya tengo un código». Al compartir se envía todo explicado.</span></div>' +
        '<button class="btn sec" data-a="otraInv" style="margin-top:6px">Crear otro código</button>';
    }
    h += '<div class="ill mid">' + ilu('invita-a-los-tuyos') + '</div><p class="lab2">Para quién</p><div class="seg"><button class="' + (p.para === 'nueva' ? 'on' : '') + '" data-a="invPara" data-v="nueva">Persona nueva</button><button class="' + (p.para !== 'nueva' ? 'on' : '') + '" data-a="invPara" data-v="vieja"' + (otros.length || true ? '' : ' disabled') + '>Volver a conectar</button></div>';
    if (p.para === 'nueva') h += '<p class="lab2">Rol</p><div class="seg"><button class="' + (p.rol === 'integrante' ? 'on' : '') + '" data-a="invRol" data-v="integrante">Integrante</button><button class="' + (p.rol === 'admin' ? 'on' : '') + '" data-a="invRol" data-v="admin">Administrador</button></div><p class="texto" style="font-size:14px;margin-top:6px">' + (p.rol === 'admin' ? 'Podrá invitar, quitar personas y elegir el calendario.' : 'Podrá usar todo el espacio, pero no invitar ni quitar personas.') + '</p>';
    else h += '<p class="texto" style="font-size:14px;margin:4px 0 10px">Para un móvil nuevo o si alguien ha perdido el acceso. Entra con su perfil de siempre.</p><div class="list">' + personas().map(x => '<button class="row card' + (p.pid === x.id ? ' sel' : '') + '" data-a="invPid" data-v="' + x.id + '">' + av(x, 40) + '<b>' + esc(x.nombre) + (x.id === S.cfg.persona ? ' · tú' : '') + '</b><span class="rad' + (p.pid === x.id ? ' on' : '') + '"></span></button>').join('') + '</div>';
    return h + '<div data-r="err"></div><button class="btn pri" data-a="crearInv" style="margin-top:18px">Crear código</button>';
  }
};
ACC.invPara = el => { const p = Nav.actual().params; p.para = el.dataset.v; Nav.refrescar(true); };
ACC.invRol = el => { const p = Nav.actual().params; p.rol = el.dataset.v; Nav.refrescar(true); };
ACC.invPid = el => { const p = Nav.actual().params; p.pid = el.dataset.v; Nav.refrescar(true); };
ACC.otraInv = () => { const p = Nav.actual().params; p.res = null; Nav.refrescar(true); };
ACC.crearInv = el => conEspera(el, async () => {
  const p = Nav.actual().params;
  if (p.para !== 'nueva' && !p.pid) return toast('Elige a quién vas a volver a conectar.');
  try {
    const r = await api('invitar', p.para === 'nueva' ? { rol: p.rol } : { persona: p.pid });
    p.res = { codigo: r.codigo, caduca: r.caduca, paquete: crearPaquete(r.codigo), para: p.para === 'nueva' ? '' : (dato('personas', p.pid) || {}).nombre };
    Nav.refrescar(true);
  } catch (e) { mostrarError($('[data-r="err"]', Nav.actual().el), e.message); }
});
function textoInvitacion(res) {
  const app = location.origin + location.pathname.replace(/index\.html$/, '');
  return 'Te invito a «' + espacio().nombre + '» en Ronda.\n\n1. Abre ' + app + ' en Safari, toca Compartir y «Añadir a pantalla de inicio».\n2. Abre Ronda desde el icono y toca «Ya tengo un código».\n3. Pega este código (entero):\n\n' + res.paquete + '\n\nCaduca a las ' + hora(new Date(res.caduca)) + ' y sirve una sola vez.';
}
ACC.compartirInv = async () => {
  const res = Nav.actual().params.res, t = textoInvitacion(res);
  if (navigator.share) { try { await navigator.share({ text: t }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  if (await copiar(t)) toast('Copiado con las instrucciones. Pégalo en un mensaje.');
};
ACC.copiarInv = async () => { if (await copiar(Nav.actual().params.res.paquete)) toast('Código copiado'); else toast('No he podido copiar. Mantén el dedo sobre el código.'); };

/* 73 · Ficha de persona */
P.persona = {
  html: p => {
    const x = dato('personas', p.pid);
    if (!x) return tope('') + '<p class="mu">Esta persona ya no está en el espacio.</p>';
    const soy = x.id === S.cfg.persona;
    let h = tope(x.nombre) + '<div class="bigav">' + av(x, 140) + '</div><h1 style="text-align:center;font-size:28px;margin:12px 0 2px">' + esc(x.nombre) + '</h1><p class="cap" style="margin:0 0 16px">' + NOMROL(x.rol) + (soy ? ' · tú' : '') + '</p>' +
      '<div class="card" style="padding:4px 16px"><div class="kv"><small>Color</small><b class="quien">' + dot(x.color, 12) + nomColor(x.color) + '</b></div><div class="kv"><small>Rol</small><b>' + NOMROL(x.rol) + '</b></div><div class="kv"><small>En el espacio desde</small><b>' + (x.alta ? fechaCorta(new Date(x.alta)) : '—') + '</b></div></div>';
    if (soy) h += '<button class="btn pri" data-a="ir" data-id="miperfil" style="margin-top:18px">Cambiar mi perfil</button>';
    if (esAdmin() && !soy) h += '<div class="list" style="margin-top:18px"><button class="btn sec" data-a="reconectarPersona" data-pid="' + x.id + '">Crear código para volver a conectar</button><button class="btn sec peligro" data-a="quitarPersona" data-pid="' + x.id + '">Quitar del espacio</button></div>';
    return h;
  }
};
ACC.reconectarPersona = el => { const e = Nav.ir('invitar', { para: 'vieja', pid: el.dataset.pid }); };
ACC.quitarPersona = async el => {
  const x = dato('personas', el.dataset.pid);
  if (!await preguntar('¿Quitar a ' + x.nombre + '?', 'Su móvil dejará de tener acceso al espacio. Lo que haya añadido se queda.', 'Quitar del espacio', true)) return;
  try { await api('persona-quitar', { id: x.id }); await Sync.ya(); Nav.atras(); toast(x.nombre + ' ya no está en el espacio'); }
  catch (e) { toast(e.message); }
};

/* 74 · Mi perfil */
P.miperfil = {
  html: () => {
    const x = yo() || {};
    const usados = personas().filter(p => p.id !== S.cfg.persona).map(p => String(p.color).toUpperCase());
    return tope('Mi perfil') + '<button class="bigav" data-a="miFoto" style="border:0;background:none;width:100%">' + av(x, 168) + '</button><p class="cap">Tu color es el ' + nomColor(x.color).toLowerCase() + '</p>' +
      '<label class="fld" style="margin-top:18px"><small>Nombre</small><input id="mpNom" maxlength="30" value="' + esc(x.nombre) + '" enterkeyhint="done"></label>' +
      '<p class="lab2">Tu color</p><div class="cols">' + COL.map((c, i) => '<button class="cdot' + (String(x.color).toUpperCase() === c ? ' on' : '') + '" style="background:' + c + '" data-a="miColor" data-c="' + c + '"' + (usados.indexOf(c) >= 0 ? ' disabled' : '') + ' aria-label="' + NOMCOL[i] + '"></button>').join('') + '</div>' +
      '<p class="texto" style="font-size:14px;margin-top:10px">Se usa en tu aro y en tus cosas. Los colores apagados ya los tiene otra persona.</p>' +
      '<div class="list" style="margin-top:18px"><button class="row card" data-a="miFoto">' + ic('foto', 26, 5) + '<b>' + (x.foto ? 'Cambiar foto' : 'Poner foto') + '</b>' + chev + '</button>' + (x.foto ? '<button class="row card" data-a="quitarMiFoto">' + ic('borrar', 26, 0) + '<b>Quitar foto</b></button>' : '') + '</div>';
  },
  montar(el) {
    const i = $('#mpNom', el);
    const g = () => { const v = i.value.trim(); const x = yo(); if (v && x && v !== x.nombre) { cambiar('personas', S.cfg.persona, { nombre: v }); toast('Nombre guardado'); } };
    i.addEventListener('change', g);
    i.addEventListener('keydown', e => { if (e.key === 'Enter') i.blur(); });
  },
  tras(el) { P.miperfil.montar(el); }
};
ACC.miColor = el => { cambiar('personas', S.cfg.persona, { color: el.dataset.c }); Nav.refrescar(true); };
ACC.miFoto = async () => {
  const x = yo();
  const r = await elegirFoto(!!x.foto, x.color);
  if (r === 'quitar') return ACC.quitarMiFoto();
  if (!r) return;
  toast('Subiendo la foto…');
  try { await subirMiFoto(r); toast('Foto guardada'); } catch (e) { toast('No he podido subir la foto: ' + e.message); }
};
ACC.quitarMiFoto = () => { const fid = (yo() || {}).foto; cambiar('personas', S.cfg.persona, { foto: '' }); Nav.refrescar(true); if (fid) api('archivo-borrar', { fid: fid }).catch(() => { }); };

/* ============================ AJUSTES ============================ */
P.ajustes = {
  html: () => {
    const x = yo() || {};
    const rows = [['perfil', 'Mi perfil', 0, 'miperfil'], ['hogar-espacio', 'Nombre y emoji del hogar', 4, 'hogarAj'], ['personas', 'Personas', 4, 'personas'], ['sol', 'Tiempo', 1, 'tiempoAj'], ['resumen', 'Resumen del domingo', 6, 'resumenAj'], ['nube-sincronizada', 'Copia de seguridad', 3, 'copia'], ['tarjeta', 'Tarjetas conectadas', 7, 'tarjetasC'], ['avisos', 'Avisos en tu calendario', 1, 'avisos'], ['nube-sincronizada', 'Sincronización', 5, 'sincronizacion'], ['luna', 'Apariencia', 6, 'apariencia'], ['escudo', 'Comprobaciones', 3, 'comprobaciones'], ['ordenar', 'Barra de navegación', 1, 'barra'], ['inicio', 'Personalizar inicio', 0, '#inicio'], ['candado', 'Documentos cifrados', 4, 'docClave'], ['informacion', 'Acerca de Ronda', 2, 'acerca']];
    return tope('') + '<div data-r="banda">' + banda() + '</div>' + head('Ajustes', '') + '<button class="card row" data-a="ir" data-id="miperfil" style="margin-bottom:16px;padding:16px">' + av(x, 56) + '<div class="f"><b>' + esc(x.nombre || '') + '</b><small>' + NOMROL(S.cfg.rol) + ' · ' + esc(espacio().nombre) + '</small></div>' + chev + '</button>' +
      '<div class="card grp">' + rows.map(r => '<button class="row" ' + (r[3] === '#inicio' ? 'data-a="editarInicio"' : 'data-a="ir" data-id="' + r[3] + '"') + '>' + ic(r[0], 24, r[2]) + '<b>' + r[1] + '</b>' + chev + '</button>').join('') + '</div>' +
      '<p class="ver">Ronda · versión ' + VERSION + ' · script ' + esc(S.sv || '…') + '</p>';
  }
};

/* 34 · Avisos en el calendario: dos calendarios, «agenda» y «avisos» */
P.avisos = {
  html: p => {
    const c = S.cal || {}, av = c.avisos;
    const tarjeta = (titulo, nom, sub, para) => '<div class="card row" style="margin-top:10px;background:color-mix(in srgb,#3C78C8 14%,var(--sf))">' + ic('modulo-calendario', 28, 5) + '<div class="f"><small style="margin:0 0 2px">' + titulo + '</small><b>' + esc(nom) + '</b><small>' + sub + '</small></div>' + (esAdmin() ? '<button class="mini" data-a="elegirCal" data-para="' + para + '">Cambiar</button>' : '') + '</div>';
    let h = tope('Avisos en tu calendario') +
      tarjeta('Agenda', c.id ? c.nombre : 'Sin elegir', 'Vuestro calendario compartido. Aquí van los eventos de la Agenda.', 'agenda') +
      tarjeta('Avisos de Ronda', av ? av.nombre : (c.id ? 'El mismo que la agenda' : 'Sin elegir'), 'Aquí van las tareas, el riego, la medicación… que tengan «Añadir al calendario».', 'avisos');
    if (esAdmin() && !av) h += '<button class="btn sec" data-a="crearCalAvisos" style="margin-top:12px">Crear el calendario «Ronda · avisos»</button>';
    if (!esAdmin()) h += '<p class="texto" style="font-size:14px;margin-top:10px">Los calendarios los elige quien administra el espacio.</p>';
    h += '<h3>Para que a cada uno le suene solo lo de Ronda</h3><div class="card" style="padding:4px 16px">' +
      '<div class="kv" style="display:block"><b style="text-align:left;display:block">1 · Compartir «Ronda · avisos»</b><small style="display:block;margin-top:4px;font-weight:600;line-height:1.4">Quien administra, en calendar.google.com: «Ronda · avisos» › Configuración y uso compartido › Compartir con determinadas personas › el correo de cada uno, con «Ver todos los detalles de los eventos».</small></div>' +
      '<div class="kv" style="display:block"><b style="text-align:left;display:block">2 · Notificaciones solo en «Ronda · avisos»</b><small style="display:block;margin-top:4px;font-weight:600;line-height:1.4">Cada persona, en su Google Calendar: ajustes de «Ronda · avisos» › Notificaciones de eventos › 0 minutos (y lo mismo en los de todo el día). En la agenda compartida, cada uno pone las que quiera o ninguna.</small></div>' +
      '<div class="kv" style="display:block"><b style="text-align:left;display:block">A quien tiene el script</b><small style="display:block;margin-top:4px;font-weight:600;line-height:1.4">Le suenan siempre, porque Ronda pone la alarma en el propio evento.</small></div></div>';
    h += '<h3>Probar un aviso</h3><p class="texto">Crea un evento en el calendario de avisos dentro de 2 minutos, con alarma a esa hora. Si suena en los dos móviles, todo está bien.</p>' +
      '<button class="btn pri" data-a="probarAviso" style="margin-top:14px">Probar un aviso</button><div data-r="res">' + (p.res || '') + '</div>';
    return h;
  },
  montar() { api('estado').then(r => { S.cal = r.cal; DB.set('cal', S.cal); Nav.refrescar(); }).catch(() => { }); }
};
ACC.elegirCal = el => {
  const para = el.dataset.para || 'agenda';
  const h = abrirHoja('<h3>' + (para === 'avisos' ? 'Calendario de avisos' : 'Calendario de la agenda') + '</h3><p class="texto" style="font-size:14px;margin-bottom:12px">Son los calendarios de la cuenta de Google donde está el script.</p><div data-r="lista"><p class="cap">Cargando…</p></div>' +
    '<p class="lab2">O pega el ID de un calendario</p><div class="fld fldr"><div class="f"><small>ID del calendario</small><input id="calId" placeholder="…@group.calendar.google.com" autocapitalize="off" spellcheck="false"></div><button class="mini" data-a="calPegado" data-para="' + para + '">Usar</button></div><div data-r="err"></div>');
  const act = para === 'avisos' ? ((S.cal || {}).avisos || {}).id : (S.cal || {}).id;
  api('calendarios').then(r => {
    $('[data-r="lista"]', h).innerHTML = '<div class="list">' + r.lista.map(c => '<button class="row card' + (act === c.id ? ' sel' : '') + '" data-a="calElegido" data-para="' + para + '" data-id="' + esc(c.id) + '">' + dot(c.color || '#3C78C8', 14) + '<div class="f"><b>' + esc(c.nombre) + '</b><small>' + (c.propio ? 'Tuyo' : 'Compartido contigo') + '</small></div><span class="rad' + (act === c.id ? ' on' : '') + '"></span></button>').join('') + '</div>';
  }).catch(e => mostrarError($('[data-r="lista"]', h), e.message));
};
async function fijarCal(id, para) {
  const r = await api('calendario-elegir', { id: id, para: para });
  S.cal = r.cal; DB.set('cal', S.cal);
  cerrarHoja(); Nav.refrescar(true);
  toast(para === 'avisos' ? 'Los avisos irán a «' + r.cal.avisos.nombre + '»' : 'La agenda es «' + r.cal.nombre + '»');
}
ACC.calElegido = el => fijarCal(el.dataset.id, el.dataset.para).catch(e => toast(e.message));
ACC.calPegado = el => conEspera(el, () => fijarCal($('#calId').value.trim(), el.dataset.para).catch(e => mostrarError($('.hoja [data-r="err"]'), e.message)));
ACC.crearCalAvisos = el => conEspera(el, async () => {
  try { const r = await api('calendario-crear'); S.cal = r.cal; DB.set('cal', S.cal); Nav.refrescar(true); toast('Creado «Ronda · avisos». Ahora compártelo (paso 1).'); }
  catch (e) { toast(e.message); }
});
ACC.probarAviso = el => conEspera(el, async () => {
  const p = Nav.actual().params;
  try {
    const r = await api('aviso-prueba', { min: 2 });
    p.res = '<div class="aviso">' + ic('hecho', 22, 3) + '<span>Listo: evento «Ronda · aviso de prueba» a las <b>' + r.hora + '</b> en «' + esc(r.calendario) + '». Bloquea el móvil y espera.</span></div>';
  } catch (e) { p.res = '<div class="aviso mal">' + ic('error', 22, 0) + '<span>' + esc(e.message) + '</span></div>'; }
  $('[data-r="res"]', Nav.actual().el).innerHTML = p.res;
});

/* 84 · Sincronización */
P.sincronizacion = {
  html: () => {
    const n = Sync.pendientes();
    const est = !S.red.ok && S.red.error ? (S.red.error.code === 'sinred' ? 'Sin conexión' : 'No se ha podido sincronizar') : n ? n + (n === 1 ? ' cambio por enviar' : ' cambios por enviar') : 'Todo sincronizado';
    return tope('Sincronización') + '<div class="card row" style="background:color-mix(in srgb,#A6C93A 22%,var(--sf))">' + ic(S.red.ok ? 'nube-sincronizada' : 'sin-conexion', 28, S.red.ok ? 2 : 7) + '<div class="f"><b>' + est + '</b><small>Última vez: ' + haceRato(S.red.ultimo) + '</small></div></div>' +
      (S.red.error && !S.red.ok ? '<div class="aviso mal">' + ic('error', 22, 0) + '<span>' + esc(S.red.error.message) + '</span></div>' : '') +
      '<button class="btn pri" data-a="sincAhora" style="margin-top:14px">Sincronizar ahora</button>' +
      '<p class="texto" style="font-size:14px;margin-top:12px">Ronda se sincroniza sola: al abrirla, al volver a ella y cada pocos segundos mientras está abierta. Si no hay conexión, guarda los cambios en el móvil y los envía al volver.</p>' +
      '<div class="card" style="padding:4px 16px;margin-top:14px"><div class="kv"><small>Cambios por enviar</small><b>' + n + '</b></div><div class="kv"><small>Último cambio recibido</small><b>n.º ' + S.seq + '</b></div><div class="kv"><small>Guardado en el móvil</small><b>' + ({ idb: 'IndexedDB', local: 'Almacén local', memoria: 'Solo memoria' }[DB.modo]) + '</b></div><div class="kv"><small>Script</small><b>' + esc(S.sv || '…') + '</b></div></div>' +
      '<div class="list" style="margin-top:16px"><button class="btn sec" data-a="redescargar">Volver a descargar todo</button><button class="btn sec peligro" data-a="desconectar">Desconectar este móvil</button></div>';
  }
};
ACC.sincAhora = el => conEspera(el, async () => { Sync.fallos = 0; await Sync.ya(); Nav.refrescar(true); toast(S.red.ok ? 'Sincronizado' : 'No se ha podido: ' + (S.red.error ? S.red.error.message : '')); });
ACC.redescargar = async el => {
  if (!await preguntar('¿Volver a descargar todo?', 'Se borra la copia de este móvil y se baja otra vez del script. Los cambios sin enviar se mantienen.', 'Volver a descargar')) return;
  S.recs = {}; S.seq = 0; guardarLocal(true); await Sync.ya(); Nav.refrescar(true); toast('Descargado de nuevo');
};
ACC.desconectar = async () => {
  const n = Sync.pendientes();
  if (!await preguntar('¿Desconectar este móvil?', (n ? 'Hay ' + n + ' cambios sin enviar y se perderán. ' : '') + 'Para volver a entrar necesitarás un código nuevo de quien administra el espacio.', 'Desconectar', true)) return;
  await borrarTodoLocal();
  location.reload();
};
async function borrarTodoLocal() {
  S.cfg = null; S.recs = {}; S.cola = {}; S.seq = 0; S.sid = '';
  await DB.del('cfg'); await DB.del('datos'); await DB.del('cola'); await DB.del('cal');
}

/* 85 · Apariencia */
P.apariencia = {
  html: () => {
    let t = 'auto'; try { t = localStorage.getItem('rondaP-tema') || 'auto'; } catch (e) { }
    return tope('Apariencia') + '<div class="seg">' + [['claro', 'Claro'], ['oscuro', 'Oscuro'], ['auto', 'Automático']].map(x => '<button class="' + (t === x[0] ? 'on' : '') + '" data-a="tema" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
      '<p class="texto" style="font-size:14px;margin-top:10px">En automático sigue el modo claro u oscuro del iPhone. Se guarda en este móvil.</p>';
  }
};
ACC.tema = el => { try { localStorage.setItem('rondaP-tema', el.dataset.v); } catch (e) { } aplicarTema(); Nav.refrescar(true); };

/* Comprobaciones: para encontrar fallos con Google y el iPhone */
P.comprobaciones = {
  html: p => tope('Comprobaciones') +
    '<div class="card" style="padding:4px 16px"><div class="kv"><small>App</small><b>' + VERSION + '</b></div><div class="kv"><small>Script</small><b>' + esc(S.sv || '…') + '</b></div><div class="kv"><small>Abierta desde</small><b>' + (enIcono() ? 'El icono' : 'El navegador') + '</b></div><div class="kv"><small>Almacén</small><b>' + DB.modo + '</b></div></div>' +
    '<div class="list" style="margin-top:14px"><button class="btn sec" data-a="probarConexion">Probar la conexión</button>' +
    '<label class="btn sec" style="position:relative">Probar con una foto grande<input type="file" accept="image/*" class="arch" data-r="fg"></label></div>' +
    '<div data-r="res">' + (p.res || '') + '</div>' +
    '<h3>Últimos errores</h3><pre class="log">' + (REG.length ? esc(REG.join('\n')) : 'Ninguno') + '</pre>' +
    '<div class="btns2"><button class="btn sec sm" data-a="copiarInforme">Copiar informe</button><button class="btn sec sm" data-a="borrarRegistro">Vaciar</button></div>',
  montar(el) { P.comprobaciones.tras(el); },
  tras(el) { const i = $('[data-r="fg"]', el); if (i) i.addEventListener('change', () => { if (i.files[0]) fotoGrande(i.files[0]); }); }
};
function resultado(html) { const e = Nav.actual(); e.params.res = html; const r = $('[data-r="res"]', e.el); if (r) r.innerHTML = html; }
ACC.probarConexion = el => conEspera(el, async () => {
  const t0 = performance.now();
  try { await api('cambios', { desde: S.seq }); const ms = Math.round(performance.now() - t0); resultado('<div class="aviso">' + ic('hecho', 22, 3) + '<span>El script responde en ' + ms + ' ms.</span></div>'); }
  catch (e) { resultado('<div class="aviso mal">' + ic('error', 22, 0) + '<span>' + esc(e.message) + '</span></div>'); }
});
async function fotoGrande(file) {
  resultado('<div class="aviso">' + ic('reloj', 22, 1) + '<span data-r="prog">Reduciendo la foto…</span></div>');
  const prog = t => { const x = $('[data-r="prog"]'); if (x) x.textContent = t; };
  try {
    const t0 = performance.now();
    const b = await reducir(file, 1600, 0.85);
    const t1 = performance.now();
    const r = await subirArchivo(b, 'prueba-foto.jpg', { trozo: 262144, progreso: f => prog('Subiendo… ' + Math.round(f * 100) + ' %') });
    const t2 = performance.now();
    prog('Bajándola otra vez…');
    const vuelta = await bajarArchivo(r.fid, { largo: 393216 });
    const t3 = performance.now();
    const a1 = new Uint8Array(await b.arrayBuffer()), a2 = new Uint8Array(await vuelta.arrayBuffer());
    let igual = a1.length === a2.length;
    for (let i = 0; igual && i < a1.length; i += 997) if (a1[i] !== a2[i]) igual = false;
    api('archivo-borrar', { fid: r.fid }).catch(() => { });
    const kb = Math.round(b.size / 1024);
    resultado('<div class="aviso' + (igual ? '' : ' mal') + '">' + ic(igual ? 'hecho' : 'error', 22, igual ? 3 : 0) + '<span>' + (igual ? 'Correcto.' : 'La foto ha vuelto distinta.') + ' Foto de ' + Math.round(file.size / 1024) + ' KB reducida a ' + kb + ' KB en ' + ((t1 - t0) / 1000).toFixed(1) + ' s; subida en ' + r.trozos + ' trozos en ' + ((t2 - t1) / 1000).toFixed(1) + ' s; bajada en ' + ((t3 - t2) / 1000).toFixed(1) + ' s.</span></div>');
  } catch (e) { resultado('<div class="aviso mal">' + ic('error', 22, 0) + '<span>' + esc(e.message) + '</span></div>'); }
}
ACC.copiarInforme = async () => {
  const t = 'Ronda ' + VERSION + ' · script ' + (S.sv || '?') + ' · ' + navigator.userAgent + '\nAlmacén: ' + DB.modo + ' · cambios pendientes: ' + Sync.pendientes() + ' · n.º ' + S.seq + '\n\n' + REG.join('\n');
  toast(await copiar(t) ? 'Informe copiado' : 'No he podido copiar');
};
ACC.borrarRegistro = () => { REG.length = 0; try { localStorage.removeItem('rondaP-registro'); } catch (e) { } Nav.refrescar(true); };

/* 87 · Acerca de */
P.acerca = {
  html: () => tope('Acerca de') + '<div data-r="logo" style="position:relative;height:150px;margin-top:10px"></div><p class="ver" style="margin-top:0">Versión ' + VERSION + ' · script ' + esc(S.sv || '…') + '</p><p class="mu">Hecha en Pamplona para organizar la casa, la familia y la pareja.</p><p class="cap" style="margin-top:22px;font-size:17px">Ru&amp;Iña</p>',
  montar(el) { setTimeout(() => logoQuieto($('[data-r="logo"]', el), 30, 64), 30); },
  fijo: () => '<div class="btns">' + btn('Ver la bienvenida otra vez', 'verFunciones', 'sec') + '</div>',
  tras(el) { logoQuieto($('[data-r="logo"]', el), 30, 64); }
};

/* Acceso anulado */
let anulado = false;
function accesoAnulado() {
  if (anulado) return;
  anulado = true;
  borrarTodoLocal().then(() => {
    const viejas = Nav.pila.slice(); Nav.pila = [];
    Nav.ir('anulado');
    viejas.forEach(v => setTimeout(() => v.el.remove(), 400));
    Nav.barra();
  });
}
P.anulado = {
  fija: true, clase: 'con-boton',
  html: () => '<div class="centro" style="padding-top:40px"><div class="ill big">' + ilu('algo-ha-fallado') + '</div><h2 class="lg">Este móvil ya no está conectado</h2><p class="mu">Quien administra el espacio te ha quitado o ha anulado este acceso. Si es un error, pídele un código nuevo.</p></div>',
  fijo: () => '<div class="btns">' + btn('Tengo un código', 'deNuevo') + '</div>'
};
ACC.deNuevo = () => { location.reload(); };
ACC.verFunciones = () => Nav.ir('funciones', {});

/* ============================ ARRANQUE ============================ */
async function iniciar() {
  aplicarTema();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(e => anotar('sw', e));
  await DB.abrir();
  S.cfg = (await DB.get('cfg')) || null;
  if (S.cfg) {
    const d = (await DB.get('datos')) || {};
    S.recs = d.recs || {}; S.seq = d.seq || 0; S.sid = d.sid || '';
    S.cola = (await DB.get('cola')) || {};
    S.cal = (await DB.get('cal')) || null;
    try { Object.assign(AG.cache, (await DB.get('agenda')) || {}); } catch (e) { }
  }
  const modo = S.cfg ? 'l' : 'b';
  const anim = animarArranque(modo);
  if (S.cfg) Sync.ya();
  await anim;
  if (S.cfg) Nav.raiz('inicio'); else Nav.ir('bienvenida', { animar: true });
  quitarArranque();
}
window.RONDA = { S, Sync, Nav, api, DB, VERSION, cambiar, lista };
/* Prueba del diseño nuevo: el arranque está en 49_rn_arranque.js */

