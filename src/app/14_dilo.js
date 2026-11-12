/* ============================ DILO O ESCRÍBELO ============================
   Botón con el isologo encima del + de Inicio. Al tocarlo se abre un panel: escucha (el anillo se mueve con lo que
   reconoce), ordena (los colores giran) y enseña lo entendido para añadirlo. */
const TIPOS_DILO = [['compra', 'Compra', 'modulo-compra', 2], ['tarea', 'Tarea', 'modulo-tareas', 1], ['evento', 'Evento', 'modulo-calendario', 5], ['gasto', 'Gasto', 'modulo-gastos', 7], ['nota', 'Nota', 'modulo-notas', 0]];
const DIASN = { lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 7 };
const anilloSvg = cls => '<svg class="' + cls + '" viewBox="0 0 100 100">' + COL.map((c, i) => { const a = i * Math.PI / 4; return '<circle cx="' + (50 + 36 * Math.sin(a)).toFixed(2) + '" cy="' + (50 - 36 * Math.cos(a)).toFixed(2) + '" r="10" fill="' + c + '"/>'; }).join('') + '</svg>';
/* 1.4.0: el botón lleva solo los 8 puntos, más juntos (sin micrófono). */
const puntosDilo = cls => '<svg class="' + (cls || '') + '" viewBox="0 0 100 100">' + COL.map((c, i) => { const a = i * Math.PI / 4; return '<circle cx="' + (50 + 30 * Math.sin(a)).toFixed(2) + '" cy="' + (50 - 30 * Math.cos(a)).toFixed(2) + '" r="8.5" fill="' + c + '"/>'; }).join('') + '</svg>';
function botonDilo() { return '<button class="dlb" data-a="abrirDilo" aria-label="Dilo o escríbelo">' + puntosDilo('') + '</button>'; }
const hayVoz = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);

/* Orden rápido en el propio móvil: sale al momento, aunque no haya conexión. Gemini lo afina después. */
function ordenarAqui(texto) {
  const items = [];
  const t = texto.replace(/\s+/g, ' ').trim();
  if (!t) return items;
  const frases = t.split(/[.;\n]+|,\s*(?:y\s+)?(?=(?:pon|apunta|recuerda|llamar|llama|pagar|paga|comprar|compra|cita|cena|reservar|hay que|tengo que|tenemos que)\b)/i).map(x => x.trim()).filter(Boolean);
  frases.forEach(f => {
    const s = sinAcentos(f);
    let fecha = '', horaT = '';
    const h0 = new Date(); h0.setHours(0, 0, 0, 0);
    if (/\bpasado manana\b/.test(s)) fecha = isoDia(sumaDias(h0, 2)); else if (/\bmanana\b/.test(s)) fecha = isoDia(sumaDias(h0, 1)); else if (/\bhoy\b|esta tarde|esta noche/.test(s)) fecha = isoDia(h0);
    const dm = s.match(/\b(el |este |el proximo )?(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/);
    if (dm) { const obj = DIASN[dm[2]]; let n = (obj - diaSemana(h0) + 7) % 7; if (n === 0) n = 7; fecha = isoDia(sumaDias(h0, n)); }
    const dd = s.match(/\bel (dia )?(\d{1,2})\b(?! de la)/);
    if (!fecha && dd) { const d = new Date(h0); d.setDate(+dd[2]); if (d < h0) d.setMonth(d.getMonth() + 1); fecha = isoDia(d); }
    const hm = s.match(/\ba las? (\d{1,2})(?:[:.](\d{2})| y (media|cuarto))?\s*(de la (manana|tarde|noche))?/);
    if (hm) { let H = +hm[1]; const M = hm[2] ? +hm[2] : hm[3] === 'media' ? 30 : hm[3] === 'cuarto' ? 15 : 0; if (hm[5] && hm[5] !== 'manana' && H < 12) H += 12; else if (!hm[5] && H >= 1 && H <= 7) H += 12; horaT = dosd(H) + ':' + dosd(M); }
    const dinero = s.match(/(\d+(?:[.,]\d{1,2})?)\s*(€|euros?)\b/);
    const limpia = x => cap(x.replace(/\b(el |este |el proximo )?(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/gi, '').replace(/\b(pasado mañana|mañana|hoy)\b/gi, '').replace(/\ba las? \d{1,2}([:.]\d{2})?( y (media|cuarto))?( de la (mañana|tarde|noche))?/gi, '').replace(/\b(recuérdame|recuerdame|apunta|pon|tengo que|tenemos que|hay que)\b/gi, '').replace(/\s+/g, ' ').replace(/^(que|de|a|el|la)\s+/i, '').trim().replace(/[,.]$/, ''));
    const mc = f.match(/^(?:compra[r]?|comprad|falta[n]?|necesitamos|a la compra|añade a la compra|añadir a la compra)\s*:?\s*(.+)$/i);
    if (mc) { mc[1].split(/,\s*|\s+y\s+/).map(x => x.trim()).filter(Boolean).forEach(x => { const c = partirCantidad(x.replace(/^(un|una|unos|unas|el|la|los|las)\s+/i, '')); items.push({ tipo: 'compra', titulo: cap(c.nombre), cantidad: c.cantidad }); }); return; }
    if (dinero) { items.push({ tipo: 'gasto', titulo: limpia(f.replace(dinero[0], '').replace(/\b(he pagado|pagué|pague|gastado|gasté|gaste|me he gastado|en)\b/gi, '')) || 'Gasto', importe: numero(dinero[1]), fecha: fecha }); return; }
    if (horaT && /\b(cita|cena|comida|reunion|medico|dentista|cumple|cumpleanos|fiesta|quedada|quedamos|cine|teatro|partido|concierto|viaje|vuelo|tren)\b/.test(s)) { items.push({ tipo: 'evento', titulo: limpia(f), fecha: fecha || isoDia(h0), hora: horaT }); return; }
    if (/^(nota|apunta que|el wifi|la clave|el telefono|el numero)\b/.test(s)) { items.push({ tipo: 'nota', titulo: limpia(f.replace(/^nota:?\s*/i, '')) }); return; }
    if (f.split(' ').length <= 2 && !fecha && adivinarSeccion(f) !== 'otros') { const c = partirCantidad(f); items.push({ tipo: 'compra', titulo: cap(c.nombre), cantidad: c.cantidad }); return; }
    const para = personas().find(x => new RegExp('\\b(para |que |a )?' + sinAcentos(x.nombre) + '\\b').test(s));
    items.push({ tipo: 'tarea', titulo: limpia(f), fecha: fecha, hora: horaT, para: para ? para.nombre : '' });
  });
  return items.filter(x => x.titulo);
}

const Dilo = {
  el: null, velo: null, modo: '', rec: null, env: 0, raf: 0, texto: '', base: '', items: [], afinado: false, t0: 0,
  abrir(modo) {
    if (this.el) return;
    const capa = $('#capa');
    this.velo = document.createElement('div'); this.velo.className = 'velo';
    this.el = document.createElement('div'); this.el.className = 'dpanel';
    this.el.innerHTML = '<i class="grab"></i><button class="dx" data-a="diloCerrar" aria-label="Cerrar">' + ic('cerrar', 22) + '</button><div class="dring">' + anilloSvg('') + '</div><div class="dcuerpo"></div><div class="dbtns"></div>';
    capa.appendChild(this.velo); capa.appendChild(this.el);
    this.velo.addEventListener('click', () => this.cerrar());
    this.texto = ''; this.items = []; this.afinado = false;
    requestAnimationFrame(() => requestAnimationFrame(() => { this.velo.classList.add('ver'); this.el.classList.add('ver'); }));
    this.t0 = performance.now();
    const paso = () => { if (!this.el) return; this.dibujar((performance.now() - this.t0) / 1000); this.raf = requestAnimationFrame(paso); };
    this.raf = requestAnimationFrame(paso);
    if (modo !== 'escribe' && hayVoz()) this.escuchar(); else this.escribir();
  },
  cerrar() {
    if (!this.el) return;
    this.parar();
    cancelAnimationFrame(this.raf);
    const el = this.el, velo = this.velo; this.el = null; this.velo = null;
    el.classList.remove('ver'); velo.classList.remove('ver');
    setTimeout(() => { el.remove(); velo.remove(); }, 340);
  },
  parar() { if (this.rec) { const r = this.rec; this.rec = null; try { r.onend = null; r.stop(); } catch (e) { } } },
  /* El anillo: respira, ondea con la voz o gira mientras ordena. */
  dibujar(t) {
    if (!this.el) return;
    const cs = $$('.dring circle', this.el), g = $('.dring svg', this.el);
    this.env = Math.max(0, this.env - 0.012);
    if (this.modo === 'piensa') {
      g.style.transform = 'rotate(' + ((t * 240) % 360) + 'deg)';
      cs.forEach((c, i) => { c.setAttribute('r', 10); c.setAttribute('opacity', [1, .85, .7, .55, .42, .3, .2, .12][(8 - i) % 8]); });
      return;
    }
    g.style.transform = '';
    const amp = this.modo === 'escucha' || this.modo === 'escribe' ? 0.12 + 0.38 * this.env : 0.05;
    cs.forEach((c, i) => { c.setAttribute('opacity', 1); c.setAttribute('r', (10 * (1 + amp * Math.sin(2 * Math.PI * 1.3 * t - i * Math.PI / 4))).toFixed(2)); });
  },
  cuerpo(h, botones) { $('.dcuerpo', this.el).innerHTML = h; $('.dbtns', this.el).innerHTML = botones; prepararCampos(this.el); },
  escuchar() {
    this.modo = 'escucha';
    this.cuerpo('<p class="live" data-r="live">' + esc(this.texto) + '</p><p class="cap">Te escucho… habla con normalidad</p>', '<button class="btn sec" data-a="diloEscribir">' + ic('teclado', 20) + 'Escribir</button><button class="btn pri" data-a="diloListo">Listo</button>');
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    let rec;
    try { rec = new R(); } catch (e) { return this.escribir('El dictado no está disponible. Escríbelo o usa el micrófono del teclado.'); }
    rec.lang = 'es-ES'; rec.interimResults = true; rec.continuous = true;
    this.base = this.texto;
    rec.onresult = ev => { let t = ''; for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript; this.texto = ((this.base ? this.base + ' ' : '') + t).trim(); this.env = 1; const l = this.el && $('[data-r="live"]', this.el); if (l) l.textContent = this.texto; };
    rec.onerror = ev => { this.rec = null; if (!this.el) return; this.escribir(ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? 'Ronda no puede usar el micrófono aquí. Escríbelo o toca el micrófono del teclado.' : ev.error === 'no-speech' ? 'No te he oído. Prueba otra vez o escríbelo.' : 'El dictado se ha cortado. Puedes escribirlo.'); };
    rec.onend = () => { if (this.rec !== rec) return; this.rec = null; if (this.el && this.modo === 'escucha') { if (this.texto) this.ordenar(); else this.escribir(); } };
    this.rec = rec;
    try { rec.start(); } catch (e) { this.rec = null; this.escribir(); }
  },
  escribir(aviso) {
    this.parar();
    this.modo = 'escribe';
    this.cuerpo((aviso ? '<div class="aviso">' + ic('informacion', 22, 5) + '<span>' + esc(aviso) + '</span></div>' : '') + '<label class="fld"><small>Lo que tienes en la cabeza</small><textarea id="dTxt" rows="4" placeholder="Compra leche y pilas, y el jueves a las 10 la ITV del coche">' + esc(this.texto) + '</textarea></label><p class="cap" style="font-size:13px">Puedes dictar con el micrófono del teclado.</p>',
      (hayVoz() ? '<button class="btn sec" data-a="diloHablar">' + ic('microfono', 20, 4) + 'Hablar</button>' : '<button class="btn sec" data-a="diloCerrar">Cancelar</button>') + '<button class="btn pri" data-a="diloListo">Ordenar</button>');
    const a = $('#dTxt', this.el);
    a.addEventListener('input', () => { this.texto = a.value; this.env = Math.min(1, this.env + 0.35); });
    setTimeout(() => a.focus(), 300);
  },
  async ordenar() {
    this.parar();
    const a = this.el && $('#dTxt', this.el); if (a) this.texto = a.value.trim();
    if (!this.texto) return toast('Di o escribe algo primero.');
    this.modo = 'piensa';
    this.cuerpo('<p class="live" style="text-align:center">Ordenando…</p><p class="cap">' + esc(this.texto) + '</p>', '');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    let items = ordenarAqui(this.texto), aviso = '', afinado = false;
    const t0 = Date.now();
    try {
      const r = await api('ordenar', { texto: this.texto, personas: personas().map(x => x.nombre), listas: listasCompra().map(l => l.nombre), hoy: hoyISO() + ' (' + DIAS[new Date().getDay()] + ')' }, { ms: 30000 });
      if (r.items && r.items.length) { items = r.items; afinado = true; }
    } catch (x) { aviso = x.code === 'gemini' && /GEMINI_API_KEY/.test(x.message) ? 'Falta la clave de Gemini en el script: lo ha ordenado el móvil solo.' : x.code === 'sinred' ? 'Sin conexión: lo ha ordenado el móvil solo.' : 'Gemini no ha respondido: lo ha ordenado el móvil solo.'; }
    if (Date.now() - t0 < 900) await espera(900 - (Date.now() - t0));
    if (!this.el) return;
    this.items = items; this.afinado = afinado; this.aviso = aviso;
    this.resultado();
  },
  resultado() {
    this.modo = 'res';
    const L = listasCompra();
    const lin = (x, i) => { const t = TIPOS_DILO.find(y => y[0] === x.tipo) || TIPOS_DILO[1]; const lst = x.tipo === 'compra' ? (L.find(l => l.nombre === x.lista) || L[0] || {}).nombre : ''; return '<div class="row">' + '<button class="sq sm" data-a="diloTipo" data-i="' + i + '" style="background:' + COL[t[3]] + '22;border:0" aria-label="Cambiar tipo">' + ic(t[2], 24, t[3]) + '</button><div class="f"><b>' + esc(x.titulo) + '</b><small>' + t[1] + (lst ? ' · ' + esc(lst) : '') + (x.fecha || x.hora ? ' · ' + cuando(x.fecha, x.hora) : '') + (x.importe ? ' · ' + euros(x.importe) : '') + (x.cantidad ? ' · ' + esc(x.cantidad) : '') + (x.para ? ' · ' + esc(x.para) : '') + '</small></div><button class="mini" data-a="diloQuitar" data-i="' + i + '">Quitar</button></div>'; };
    this.cuerpo('<h3 style="margin-top:0">Esto he entendido</h3>' + (this.items.length ? '<div class="card grp">' + this.items.map(lin).join('') + '</div><p class="cap" style="text-align:left;font-size:13px">Toca el icono para cambiar el tipo' + (L.length > 1 ? ' o la lista' : '') + '.</p>' : '<p class="mu2">No he sacado nada. Prueba a decirlo de otra forma.</p>') + (this.aviso ? '<div class="aviso">' + ic('informacion', 22, 5) + '<span>' + esc(this.aviso) + '</span></div>' : ''),
      '<button class="btn sec" data-a="diloOtra">Volver a decirlo</button>' + (this.items.length ? '<button class="btn pri" data-a="diloAnadir">Añadir ' + this.items.length + '</button>' : ''));
    $('.dring', this.el).classList.add('peq');
  }
};
ACC.abrirDilo = () => Dilo.abrir();
ACC.aDilo = () => Dilo.abrir();
ACC.diloCerrar = () => Dilo.cerrar();
ACC.diloEscribir = () => Dilo.escribir();
ACC.diloHablar = () => { const a = $('#dTxt'); if (a) Dilo.texto = a.value.trim(); Dilo.escuchar(); };
ACC.diloListo = () => Dilo.ordenar();
ACC.diloOtra = () => { $('.dring', Dilo.el).classList.remove('peq'); Dilo.texto = ''; Dilo.items = []; if (hayVoz()) Dilo.escuchar(); else Dilo.escribir(); };
ACC.diloQuitar = el => { Dilo.items.splice(+el.dataset.i, 1); Dilo.resultado(); };
ACC.diloTipo = el => {
  const x = Dilo.items[+el.dataset.i], L = listasCompra();
  const ops = TIPOS_DILO.filter(t => t[0] !== 'compra').map(t => [t[0], t[1]]);
  const opsC = L.map(l => ['compra|' + l.nombre, 'Compra · ' + l.nombre]);
  const act = x.tipo === 'compra' ? 'compra|' + ((L.find(l => l.nombre === x.lista) || L[0] || {}).nombre) : x.tipo;
  abrirHoja('<h3>Es…</h3><div class="list">' + opsC.concat(ops).map(o => '<button class="row card' + (act === o[0] ? ' sel' : '') + '" data-a="diloTipoSi" data-v="' + esc(o[0]) + '"><b style="flex:1">' + esc(o[1]) + '</b><span class="rad' + (act === o[0] ? ' on' : '') + '"></span></button>').join('') + '</div>');
  ACC.diloTipoSi = b => { const v = b.dataset.v; if (v.indexOf('compra|') === 0) { x.tipo = 'compra'; x.lista = v.slice(7); } else x.tipo = v; cerrarHoja(); Dilo.resultado(); };
};
/* La capa de Dilo está por encima de las hojas: las hojas de elegir tipo se abren encima. */
ACC.diloAnadir = el => conEspera(el, async () => {
  if (!Dilo.items.length) return;
  const res = { compra: 0, tarea: 0, evento: 0, gasto: 0, nota: 0 }, fallos = [];
  const cuenta = lista('cuentas').filter(c => !c.archivada).sort((a, b) => (b.creada || 0) - (a.creada || 0))[0];
  const L = listasCompra();
  for (const x of Dilo.items) {
    try {
      if (x.tipo === 'compra') { const l = L.find(y => y.nombre === x.lista) || L.find(y => y.id === LSUPER) || L[0]; anadirProducto((x.cantidad ? x.cantidad + ' ' : '') + x.titulo, l ? l.id : LSUPER); }
      else if (x.tipo === 'tarea') { const pa = personas().find(y => sinAcentos(y.nombre) === sinAcentos(x.para || '')); cambiar('tareas', 't' + uid(), { titulo: cap(x.titulo), para: pa ? pa.id : S.cfg.persona, fecha: x.fecha || '', hora: x.hora || '', hecho: false, creadoPor: S.cfg.persona, orden: Date.now(), cal: false }); }
      else if (x.tipo === 'evento') { const d = deISO(x.fecha) || new Date(); const ini = new Date(d); let todo = true; if (x.hora) { ini.setHours(+x.hora.slice(0, 2), +x.hora.slice(3)); todo = false; } await api('evento-guardar', { ev: { titulo: cap(x.titulo), inicio: ini.getTime(), fin: todo ? sumaDias(d, 1).getTime() : ini.getTime() + 3600000, todoDia: todo, quien: S.cfg.persona } }); }
      else if (x.tipo === 'gasto' && cuenta) { const yoP = (cuenta.participantes || []).find(y => y.persona === S.cfg.persona) || cuenta.participantes[0]; cambiar('movs', 'm' + uid(), { cuenta: cuenta.id, tipo: 'gasto', importe: Number(x.importe) || 0, concepto: cap(x.titulo), fecha: x.fecha || hoyISO(), pagadoPor: yoP.id, categoria: 'otro', reparto: { modo: 'iguales', quienes: cuenta.participantes.map(y => y.id) }, creado: Date.now(), por: S.cfg.persona }); }
      else { const t = x.tipo === 'gasto' ? 'Gasto: ' + cap(x.titulo) + (x.importe ? ' · ' + euros(x.importe) : '') : cap(x.titulo); cambiar('notas', 'n' + uid(), { titulo: t, texto: '', html: '', color: '', editada: Date.now(), por: S.cfg.persona }); x.tipo = 'nota'; }
      res[x.tipo]++;
    } catch (er) { fallos.push(x.titulo); }
  }
  Dilo.cerrar();
  Nav.refrescar(true);
  const partes = [['compra', 'a la compra'], ['tarea', 'tareas'], ['evento', 'eventos'], ['gasto', 'gastos'], ['nota', 'notas']].filter(k => res[k[0]]).map(k => res[k[0]] + ' ' + k[1]);
  toast(fallos.length ? 'No he podido añadir: ' + fallos.join(', ') : 'Añadido: ' + partes.join(', '));
  if (cuenta && res.gasto) setTimeout(() => toast('Los gastos van a la cuenta «' + cuenta.nombre + '»'), 3400);
});
