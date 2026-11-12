/* ============================ ENTRADA: crear o unirse ============================ */
const TIPOS = [
  ['hogar', 'hogar-espacio', 'Hogar', 'Casa, familia y todo lo de cada día', 0],
  ['pareja', 'pareja', 'Pareja', 'Dos personas, planes y gastos a medias', 1],
  ['familia', 'familia-extensa', 'Familia extensa', 'Abuelos, tíos, primos y quedadas', 2],
  ['cuidar', 'cuidar-a-alguien', 'Cuidar a alguien', 'Citas, medicación y turnos', 7],
  ['piso', 'piso-compartido', 'Piso compartido', 'Turnos, compra y cuentas claras', 4],
  ['solo', 'solo-yo-espacio', 'Solo yo', 'Tu organización personal', 6]
];

const PORTADA = { hogar: 'hogar-portada', pareja: 'pareja-portada', familia: 'familia-extensa-portada', cuidar: 'cuidar-a-alguien-portada', piso: 'piso-compartido-portada', solo: 'solo-yo-portada' };

/* ---------- 01 Bienvenida: el logo y, deslizando, lo que hace Ronda (10 pantallas). Los botones quedan fijos. */
const FUNCIONES = [
  ['todo-en-un-sitio', 'Todo en un sitio', 'Tareas, compra, agenda, gastos, documentos y notas. Para los dos, en el mismo espacio.'],
  ['lista-completa', 'La compra, a la vez', 'Lo que uno añade, el otro lo ve al momento. Cada cosa va sola a su sección.'],
  ['hogar-al-dia', 'Tareas y rutinas', 'Para quién, cuándo y cada cuánto. Sacar la basura, regar, cambiar las sábanas.'],
  ['mes-sin-olvidos', 'Agenda compartida', 'Es vuestro calendario de Google: lo que apuntéis en Ronda o en vuestro calendario se ve en los dos sitios.'],
  ['presupuesto-cumplido', 'Gastos sin líos', 'Los fijos de casa y, si queréis, cuentas a medias para viajes y cenas.'],
  ['hogar-1', 'La casa al día', 'Menú de la semana, riego de las plantas, el coche, la medicación y el acuario.'],
  ['tus-datos-tuyos', 'Documentos a salvo', 'DNI, seguros, garantías… cifrados en tu móvil. Se abren con tu código de 4 cifras.'],
  ['microfono-grande', 'Dilo o escríbelo', 'Di lo que tienes en la cabeza y Ronda lo ordena: compra, tareas, citas o gastos.'],
  ['avisos-a-tiempo', 'Avisos a tiempo', 'Lo que quieras llega a vuestro calendario de Google, con su alarma.'],
  ['invita-a-los-tuyos', 'Invita a los tuyos', 'Cada persona entra con su propio código. Sin contraseñas.']
];
P.bienvenida = {
  fija: true, clase: 'bvp',
  html: () => '',
  fijo: p => (enIcono() ? '' : '<div class="aviso instalar">' + ic('informacion', 22, 5) + '<span>Antes de empezar, instálala: toca Compartir y «Añadir a pantalla de inicio». Después ábrela desde el icono.</span></div>') +
    '<div class="carrusel" data-r="car"><section class="slide"><div class="bv" data-r="logo"></div><p class="bv-sub" data-r="sub">Todo lo de casa, en el mismo sitio y con los tuyos.</p></section>' +
    FUNCIONES.map(f => '<section class="slide fun"><div class="ill big">' + ilu(f[0]) + '</div><h2 class="lg">' + f[1] + '</h2><p class="mu">' + f[2] + '</p></section>').join('') + '</div>' +
    '<div class="dots" data-r="dots" style="position:absolute;left:0;right:0">' + [0].concat(FUNCIONES).map((x, i) => '<i class="' + (i ? '' : 'a') + '"></i>').join('') + '</div>' +
    '<div class="btns" data-r="btns" style="bottom:calc(28px + var(--sb))">' + btn('Empezar', 'empezar') + btn('Ya tengo un código', 'tengoCodigo', 'sec') + '</div>',
  montar(el, p) {
    const H = innerHeight, W = innerWidth;
    const fs = Math.round(88 * Math.min(1, W / 390));
    logoQuieto($('[data-r="logo"]', el), Math.round(H * 318 / 844), fs);
    $('[data-r="sub"]', el).style.top = Math.round(H * 446 / 844) + 'px';
    const dots = $('[data-r="dots"]', el);
    dots.style.top = Math.round(H * 520 / 844) + 'px';
    $$('.slide.fun', el).forEach(s => { s.style.paddingTop = Math.max(20, Math.round(H * 70 / 844)) + 'px'; });
    const car = $('[data-r="car"]', el);
    car.addEventListener('scroll', () => {
      const i = Math.round(car.scrollLeft / car.clientWidth);
      $$('i', dots).forEach((d, j) => d.classList.toggle('a', j === i));
      dots.style.top = (i ? Math.round(H * 590 / 844) : Math.round(H * 520 / 844)) + 'px';
    }, { passive: true });
    if (p.animar) ['sub', 'dots', 'btns'].forEach((r, i) => { const x = $('[data-r="' + r + '"]', el); x.classList.add('sube'); x.style.animationDelay = (i * 0.2) + 's'; });
  }
};
P.funciones = Object.assign({}, P.bienvenida, { fijo: p => P.bienvenida.fijo(p).replace(/<div class="btns"[\s\S]*$/, '<div class="btns" style="bottom:calc(28px + var(--sb))">' + btn('Cerrar', 'atras', 'sec') + '</div>') });
ACC.empezar = () => { S.alta = { modo: 'crear', tipo: 'hogar', nombreEsp: '', colorEsp: COL[4] }; Nav.ir('tipo'); };
ACC.tengoCodigo = () => { S.alta = { modo: 'unirse' }; Nav.ir('unirse'); };

/* ---------- 02 Tipo de espacio */
P.tipo = {
  clase: 'con-boton',
  html: () => tope('') + head('Crea tu espacio', 'Elige cómo lo vas a usar') + '<div class="list">' + TIPOS.map(t =>
    '<button class="row card' + (S.alta.tipo === t[0] ? ' sel' : '') + '" data-a="elegirTipo" data-id="' + t[0] + '">' + sq(t[1], t[4], false) +
    '<div class="f"><b>' + t[2] + '</b><small>' + t[3] + '</small></div><span class="rad' + (S.alta.tipo === t[0] ? ' on' : '') + '"></span></button>').join('') + '</div>',
  fijo: () => '<div class="btns">' + btn('Continuar', 'irCrear') + '</div>'
};
ACC.elegirTipo = el => { S.alta.tipo = el.dataset.id; Nav.refrescar(); };
ACC.irCrear = () => {
  const t = TIPOS.find(x => x[0] === S.alta.tipo);
  if (!S.alta.nombreEsp) S.alta.nombreEsp = { hogar: 'Nuestra casa', pareja: 'Nosotros', familia: 'Familia', cuidar: 'Cuidados', piso: 'El piso', solo: 'Lo mío' }[t[0]];
  Nav.ir('crear');
};

/* ---------- 03 Nombre y color del espacio */
P.crear = {
  clase: 'con-boton', fija: true,
  html: () => tope('Nuevo espacio') + '<div class="ill mid">' + ilu(PORTADA[S.alta.tipo] || 'hogar-portada') + '</div>' +
    '<label class="fld"><small>Nombre del espacio</small><input id="nEsp" maxlength="40" value="' + esc(S.alta.nombreEsp) + '" autocomplete="off"></label>' +
    '<p class="lab2">Color del espacio</p><div class="cols">' + COL.map((c, i) => '<button class="cdot' + (S.alta.colorEsp === c ? ' on' : '') + '" style="background:' + c + '" data-a="colorEsp" data-c="' + c + '" aria-label="' + NOMCOL[i] + '"></button>').join('') + '</div>' +
    '<p class="lab2">Tipo</p><div class="chips">' + TIPOS.map(t => '<button class="chip' + (S.alta.tipo === t[0] ? ' on' : '') + '" data-a="tipoChip" data-id="' + t[0] + '">' + t[2] + '</button>').join('') + '</div>',
  fijo: () => '<div class="btns">' + btn('Continuar', 'irConectar') + '</div>'
};
ACC.colorEsp = el => { S.alta.colorEsp = el.dataset.c; $$('[data-a="colorEsp"]', Nav.actual().el).forEach(b => b.classList.toggle('on', b === el)); };
ACC.tipoChip = el => { S.alta.tipo = el.dataset.id; const n = $('#nEsp'); if (n) S.alta.nombreEsp = n.value; Nav.refrescar(true); };
ACC.irConectar = () => {
  const n = $('#nEsp').value.trim();
  if (!n) { $('#nEsp').focus(); return toast('Ponle un nombre al espacio.'); }
  S.alta.nombreEsp = n;
  Nav.ir('conectar');
};

/* ---------- Conectar con Google (solo quien crea el espacio) */
P.conectar = {
  clase: 'con-boton', fija: true,
  html: () => tope('Conectar con tu Google') +
    '<p class="texto">Ronda guarda todo en tu Google, en la hoja donde has pegado el script. Pega aquí lo que te ha dado.</p>' +
    '<div class="fld fldr"><div class="f"><small>Dirección del script</small><textarea id="cUrl" rows="3" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off" autocapitalize="off" spellcheck="false">' + esc(S.alta.url || '') + '</textarea></div><button class="mini" data-a="pegar" data-sel="#cUrl">Pegar</button></div>' +
    '<div class="fld fldr"><div class="f"><small>Código de alta</small><input id="cCod" maxlength="9" placeholder="XXXX-XXXX" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(S.alta.codigo || '') + '"></div><button class="mini" data-a="pegar" data-sel="#cCod">Pegar</button></div>' +
    '<div class="aviso">' + ic('informacion', 22, 5) + '<span>La dirección acaba en <b>/exec</b>: está en Implementar › Gestionar implementaciones. El código de alta sale en el registro al ejecutar «configurar».</span></div>' +
    '<div data-r="err"></div>',
  fijo: () => '<div class="btns">' + btn('Comprobar y seguir', 'comprobarConexion') + '</div>'
};
ACC.pegar = el => pegarEn(el.dataset.sel);
ACC.comprobarConexion = el => conEspera(el, async () => {
  const err = $('[data-r="err"]', Nav.actual().el);
  mostrarError(err, '');
  const u = urlScript($('#cUrl').value);
  if (u.error) return mostrarError(err, u.error);
  const cod = $('#cCod').value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cod.length !== 8) return mostrarError(err, 'El código de alta tiene 8 letras y números (por ejemplo 4K7P-2Q9M).');
  S.alta.url = u.url; S.alta.codigo = cod;
  try {
    const h = await api('hola', {}, { url: u.url, sinToken: true });
    if (!h.configurado) return mostrarError(err, 'El script responde, pero todavía no está configurado. En el editor, ejecuta «configurar».');
    if (h.hayAdmin) return mostrarError(err, 'Este script ya tiene un espacio con administración. Para entrar, pide una invitación desde la app (Personas › Invitar).');
    S.alta.inv = await api('invitacion-ver', { codigo: cod }, { url: u.url, sinToken: true });
    if (!S.alta.inv.alta) return mostrarError(err, 'Ese código es una invitación, no un código de alta. Usa «Ya tengo un código» en la primera pantalla.');
    Nav.ir('perfil');
  } catch (e) { mostrarError(err, e.message); }
});

/* ---------- 04 Unirse con código */
P.unirse = {
  clase: 'con-boton', fija: true,
  html: () => tope('Tengo un código') + '<div class="ill mid">' + ilu('invita-a-los-tuyos') + '</div>' +
    '<p class="mu" style="margin:6px 4px 8px">Pega el código que te ha pasado la otra persona. Empieza por RONDA1.</p>' +
    '<div class="fld fldr"><div class="f"><small>Código de invitación</small><textarea id="uCod" rows="4" placeholder="RONDA1-…" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea></div><button class="mini" data-a="pegar" data-sel="#uCod">Pegar</button></div>' +
    '<div class="aviso">' + ic('informacion', 22, 5) + '<span>Pégalo aquí, dentro de Ronda. Si tocas el código en un mensaje se abriría Safari, que guarda sus datos aparte de la app del icono.</span></div>' +
    '<div data-r="err"></div>',
  fijo: () => '<div class="btns">' + btn('Unirme', 'comprobarInvitacion') + '</div>'
};
ACC.comprobarInvitacion = el => conEspera(el, async () => {
  const err = $('[data-r="err"]', Nav.actual().el);
  mostrarError(err, '');
  const k = leerPaquete($('#uCod').value);
  if (k.error) return mostrarError(err, k.error);
  S.alta = { modo: 'unirse', url: k.url, codigo: k.codigo };
  try {
    const inv = await api('invitacion-ver', { codigo: k.codigo }, { url: k.url, sinToken: true });
    S.alta.inv = inv;
    if (inv.persona) Nav.ir('reconectar');
    else Nav.ir('perfil');
  } catch (e) { mostrarError(err, e.message); }
});

/* Invitación para alguien que ya estaba (móvil nuevo, o Safari frente al icono). */
P.reconectar = {
  clase: 'con-boton', fija: true,
  html: () => { const p = S.alta.inv.persona; return tope('Volver a conectar') + '<div class="bigav" style="margin-top:30px">' + av(p, 140) + '</div><h2 class="lg">Hola, ' + esc(p.nombre) + '</h2><p class="mu">Vas a conectar este móvil a «' + esc((S.alta.inv.espacio || {}).nombre || 'el espacio') + '» con tu perfil de siempre.</p><div data-r="err"></div>'; },
  fijo: () => '<div class="btns">' + btn('Conectar', 'unirseYa') + '</div>'
};

/* ---------- 05 Tu perfil */
P.perfil = {
  clase: 'con-boton', fija: true,
  html: () => {
    const usados = ((S.alta.inv && S.alta.inv.personas) || []).map(p => String(p.color).toUpperCase());
    if (!S.alta.color || usados.indexOf(S.alta.color) >= 0) S.alta.color = COL.find(c => usados.indexOf(c) < 0) || COL[0];
    const pv = { color: S.alta.color };
    const foto = S.alta.fotoUrl ? '<span class="av foto" style="--c:' + S.alta.color + ';--aro:13px;width:150px;height:150px"><b style="background-image:url(\'' + S.alta.fotoUrl + '\')"></b></span>' : av(pv, 150);
    return head('Cuéntanos quién eres', 'Así te verán los tuyos') +
      '<button class="bigav" data-a="fotoAlta" style="border:0;background:none;width:100%" data-r="foto">' + foto + '</button><p class="cap">Toca para poner tu foto</p>' +
      '<label class="fld"><small>Nombre</small><input id="pNom" maxlength="30" value="' + esc(S.alta.nombre || '') + '" placeholder="Cómo te llaman" autocomplete="given-name"></label>' +
      '<p class="lab2">Tu color</p><div class="cols">' + COL.map((c, i) => '<button class="cdot' + (S.alta.color === c ? ' on' : '') + '" style="background:' + c + '" data-a="colorAlta" data-c="' + c + '"' + (usados.indexOf(c) >= 0 ? ' disabled' : '') + ' aria-label="' + NOMCOL[i] + '"></button>').join('') + '</div>' +
      '<p class="cap" data-r="nc" style="text-align:left;margin-top:12px">Tu color es el ' + nomColor(S.alta.color).toLowerCase() + '. Se usa en tu aro y en tus cosas.</p><div data-r="err"></div>';
  },
  fijo: () => '<div class="btns">' + btn('Continuar', 'unirseYa') + '</div>'
};
ACC.colorAlta = el => {
  S.alta.color = el.dataset.c;
  const e = Nav.actual().el;
  $$('[data-a="colorAlta"]', e).forEach(b => b.classList.toggle('on', b === el));
  $('[data-r="nc"]', e).textContent = 'Tu color es el ' + nomColor(S.alta.color).toLowerCase() + '. Se usa en tu aro y en tus cosas.';
  const a = $('[data-r="foto"] .av', e); if (a) a.style.setProperty('--c', S.alta.color);
};
ACC.fotoAlta = () => elegirFoto(!!S.alta.fotoBlob, S.alta.color).then(r => {
  if (r === 'quitar') { S.alta.fotoBlob = null; S.alta.fotoUrl = null; }
  else if (r) { S.alta.fotoBlob = r; S.alta.fotoUrl = URL.createObjectURL(r); }
  else return;
  const n = $('#pNom'); if (n) S.alta.nombre = n.value;
  Nav.refrescar(true);
});
ACC.unirseYa = el => conEspera(el, async () => {
  const pg = Nav.actual();
  const err = $('[data-r="err"]', pg.el);
  mostrarError(err, '');
  const a = S.alta, extra = { codigo: a.codigo };
  if (pg.id === 'perfil') {
    a.nombre = $('#pNom').value.trim();
    if (!a.nombre) { $('#pNom').focus(); return mostrarError(err, 'Escribe tu nombre.'); }
    extra.nombre = a.nombre; extra.color = a.color;
  }
  if (a.modo === 'crear') extra.espacio = { nombre: a.nombreEsp, tipo: a.tipo, color: a.colorEsp };
  try {
    const r = await api('unirse', extra, { url: a.url, sinToken: true });
    S.cfg = { url: a.url, token: r.token, persona: r.persona, rol: r.rol, alta: Date.now() };
    S.recs = {}; S.seq = 0; S.sid = r.sid || ''; S.cola = {};
    await DB.set('cfg', S.cfg);
    guardarLocal(true);
    try { await Sync.ya(); } catch (e) { }
    if (a.fotoBlob) subirMiFoto(a.fotoBlob).catch(e => toast('No he podido subir la foto: ' + e.message));
    const rol = r.rol;
    S.alta = null;
    Nav.pila.forEach(x => setTimeout(() => x.el.remove(), 400));
    Nav.pila = [];
    entrar();
    if (rol === 'admin' && !S.cal) setTimeout(() => toast('Siguiente paso: elige vuestro calendario en Ajustes › Avisos.'), 900);
  } catch (e) {
    if (e.code === 'color') { a.inv = await api('invitacion-ver', { codigo: a.codigo }, { url: a.url, sinToken: true }).catch(() => a.inv); Nav.refrescar(true); }
    mostrarError($('[data-r="err"]', Nav.actual().el), e.message);
  }
});

/* ---------- 06-08 Presentación */
const ONB = [
  ['invita-a-los-tuyos', 'Invita a los tuyos', 'Cada persona entra con su propio código. Sin contraseñas.'],
  ['tus-datos-tuyos', 'Tus datos, tuyos', 'Todo se guarda en tu Google. Los documentos importantes irán cifrados en tu móvil, con tu código de 4 cifras.'],
  ['avisos-a-tiempo', 'Avisos a tiempo', 'Los recordatorios llegan a vuestro calendario de Google, con su alarma.']
];
P.onb = {
  fija: true, clase: 'con-boton',
  html: p => { const o = ONB[p.paso]; return '<div class="centro" style="padding-top:20px"><div class="ill big">' + ilu(o[0]) + '</div><h2 class="lg">' + o[1] + '</h2><p class="mu">' + o[2] + '</p><div class="dots">' + ONB.map((x, i) => '<i class="' + (i === p.paso ? 'a' : '') + '"></i>').join('') + '</div></div>'; },
  fijo: p => '<div class="btns">' + (p.paso < 2 ? btn('Siguiente', 'onbSig') + btn('Saltar', 'onbFin', 'sec')
    : (p.rol === 'admin' ? btn('Elegir el calendario', 'onbCal') + btn('Ahora no', 'onbFin', 'sec') : btn('Empezar', 'onbFin'))) + '</div>'
};
ACC.onbSig = () => { const p = Nav.actual().params; Nav.ir('onb', { paso: p.paso + 1, rol: p.rol }); };
ACC.onbFin = () => entrar();
ACC.onbCal = () => { entrar(); setTimeout(() => Nav.ir('avisos'), 380); };
function entrar() {
  const viejas = Nav.pila.slice();
  Nav.pila = [];
  Nav.raiz('inicio');
  viejas.forEach(v => setTimeout(() => v.el.remove(), 360));
}

/* ============================ FOTO: elegir y recortar ============================ */
function elegirFoto(tieneFoto, color) {
  return new Promise(ok => {
    let hecho = false;
    const fin = v => { if (!hecho) { hecho = true; ok(v); } };
    const h = abrirHoja('<h3>Tu foto</h3><div class="list">' +
      '<label class="row card">' + ic('camara', 26, 0) + '<b>Hacer una foto</b><input type="file" accept="image/*" capture="user" class="arch" data-r="cam"></label>' +
      '<label class="row card">' + ic('foto', 26, 5) + '<b>Elegir de la galería</b><input type="file" accept="image/*" class="arch" data-r="gal"></label>' +
      (tieneFoto ? '<button class="row card" data-a="quitarFotoH">' + ic('borrar', 26, 0) + '<b>Quitar foto</b></button>' : '') + '</div>', { alCerrar: () => setTimeout(() => fin(null), 50) });
    ACC.quitarFotoH = () => { fin('quitar'); cerrarHoja(); };
    $$('input[type=file]', h).forEach(inp => inp.addEventListener('change', async () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      hecho = true;
      cerrarHoja();
      try { ok(await recortar(f, color)); } catch (e) { toast(e.message); ok(null); }
    }));
  });
}

function recortar(file, color) {
  return new Promise(async (ok, ko) => {
    let im;
    try { im = await cargarImagen(file); } catch (e) { return ko(e); }
    const img = im.img;
    const d = document.createElement('div');
    d.className = 'recorte';
    d.innerHTML = '<div class="hd"><div><h1>Recorta tu foto</h1><p>Mueve y amplía con los dedos</p></div></div>' +
      '<div class="escena" style="--c:' + color + '"><img alt=""><div class="mask"></div><div class="aro"></div></div>' +
      '<div class="zoom">' + ic('foto', 20, 0, '#F4F8F2') + '<input type="range" min="1" max="4" step="0.01" value="1">' + ic('foto', 30, 0, '#F4F8F2') + '</div>' +
      '<p class="cap" style="color:#9FB0B8">Así se verá con tu aro ' + nomColor(color).toLowerCase() + '</p>' +
      '<div class="rbtns"><button class="btn pri" data-r="usar">Usar foto</button><button class="btn sec" data-r="cancelar">Cancelar</button></div>';
    document.body.appendChild(d);
    const esc_ = $('.escena', d), el = $('img', d), rango = $('input', d);
    el.src = im.url;
    const W = esc_.clientWidth, C = W * 0.76, c0 = W * 0.12;
    $('.mask', d).style.background = 'radial-gradient(circle at 50% 50%, transparent ' + (C / 2 - 1) + 'px, rgba(27,38,44,.78) ' + (C / 2) + 'px)';
    const w = img.naturalWidth, h = img.naturalHeight, smin = C / Math.min(w, h);
    let z = 1, x = c0 - (w * smin - C) / 2, y = c0 - (h * smin - C) / 2;
    const pon = () => {
      const s = smin * z;
      x = Math.min(c0, Math.max(c0 + C - w * s, x)); y = Math.min(c0, Math.max(c0 + C - h * s, y));
      el.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
      el.style.width = w + 'px'; el.style.height = h + 'px';
    };
    const zoomEn = (nz, px, py) => { nz = Math.min(4, Math.max(1, nz)); const s0 = smin * z, s1 = smin * nz; x = px - (px - x) * s1 / s0; y = py - (py - y) * s1 / s0; z = nz; rango.value = z; pon(); };
    pon();
    rango.addEventListener('input', () => zoomEn(Number(rango.value), W / 2, W / 2));
    const ptr = {};
    let base = null;
    esc_.addEventListener('pointerdown', e => { esc_.setPointerCapture(e.pointerId); ptr[e.pointerId] = { x: e.clientX, y: e.clientY }; base = null; });
    esc_.addEventListener('pointermove', e => {
      if (!ptr[e.pointerId]) return;
      const ant = ptr[e.pointerId];
      const ids = Object.keys(ptr);
      if (ids.length === 1) { x += e.clientX - ant.x; y += e.clientY - ant.y; ptr[e.pointerId] = { x: e.clientX, y: e.clientY }; pon(); return; }
      ptr[e.pointerId] = { x: e.clientX, y: e.clientY };
      const a = ptr[ids[0]], b = ptr[ids[1]], r = esc_.getBoundingClientRect();
      const dist = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      if (!base) { base = { d: dist, z: z }; return; }
      zoomEn(base.z * dist / base.d, mx, my);
    });
    const suelta = e => { delete ptr[e.pointerId]; base = null; };
    esc_.addEventListener('pointerup', suelta); esc_.addEventListener('pointercancel', suelta);
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('ver')));
    const cerrar = v => { d.classList.remove('ver'); setTimeout(() => { d.remove(); URL.revokeObjectURL(im.url); }, 360); ok(v); };
    $('[data-r="cancelar"]', d).addEventListener('click', () => cerrar(null));
    $('[data-r="usar"]', d).addEventListener('click', () => {
      const s = smin * z, cv = document.createElement('canvas');
      cv.width = cv.height = 512;
      const g = cv.getContext('2d');
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 512, 512);
      g.drawImage(img, (c0 - x) / s, (c0 - y) / s, C / s, C / s, 0, 0, 512, 512);
      cv.toBlob(b => cerrar(b), 'image/jpeg', 0.86);
    });
  });
}

async function subirMiFoto(blob) {
  const r = await subirArchivo(blob, 'foto-' + S.cfg.persona + '.jpg');
  const d = await new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(blob); });
  S.imgs[r.fid] = d; DB.set('img:' + r.fid, d);
  cambiar('personas', S.cfg.persona, { foto: r.fid, fotoV: Date.now() });
  Nav.refrescar();
}
