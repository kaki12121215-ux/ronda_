/* ===================== 1.6.0 · Feedback de la app =====================
   Notas sueltas para mejorar Ronda: texto, sección, quién y cuándo, y capturas o vídeos.
   Colección «feedback»: { texto, sec, por, creado, estado: 'p' | 'h', hechoEn, adj: [{ fid, tipo: 'img' | 'vid', nombre, mini, dur, bytes }] }
   Los archivos van a la carpeta de Drive de Ronda con el mismo sistema que las fotos (el script no cambia; máximo 20 MB por archivo).
   «Exportar» descarga un zip hecho en el propio móvil: feedback.txt y una carpeta por nota con sus archivos. */

const FB_MAX = 100 * 1024 * 1024; /* 1.7.0: con subida directa a Drive; con el script antiguo, 20 MB */
MODS.feedback = ['Feedback', 'comentario', 0, () => { const n = lista('feedback').filter(x => x.estado !== 'h').length; return n ? n + (n === 1 ? ' pendiente' : ' pendientes') : 'Ideas para mejorar'; }];
SECC.feedback = [0, 'comentario'];
COLBARRA.feedback = 0;

/* Secciones para elegir: todas las de la app y «General» */
function fbSecciones() {
  const s = [['general', 'General', '#9FB0B8'], ['inicio', 'Inicio', COL[0]]];
  Object.keys(MODS).filter(k => k !== 'feedback' && k !== 'buscar').forEach(k => { const c = SECC[k] ? (SECC[k][0] < 0 ? TINTA : COL[SECC[k][0]]) : COL[MODS[k][2]]; s.push([k, MODS[k][0], c]); });
  s.push(['gastos', 'Gastos', COL[7]], ['mas', 'Más', TINTA], ['ajustes', 'Ajustes', TINTA]);
  const vistos = {}; return s.filter(x => vistos[x[0]] ? false : (vistos[x[0]] = 1));
}
const fbSec = k => fbSecciones().find(x => x[0] === k) || ['general', 'General', '#9FB0B8'];
function fbCuando(ts) {
  const d = new Date(ts || 0), h = hoyISO(), di = isoDia(d), ay = isoDia(sumaDias(new Date(), -1));
  return (di === h ? 'Hoy' : di === ay ? 'Ayer' : cap(DIAS[d.getDay()]) + ' ' + d.getDate() + (d.getFullYear() !== new Date().getFullYear() ? '/' + (d.getMonth() + 1) + '/' + d.getFullYear() : '')) + ', ' + hora(d);
}
const fbDur = s => { s = Math.round(s || 0); return Math.floor(s / 60) + ':' + dosd(s % 60); };
const fbMB = b => b >= 1048576 ? (b / 1048576).toFixed(b >= 10485760 ? 0 : 1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
function fbNotas(f) {
  const l = lista('feedback').sort((a, b) => (b.creado || 0) - (a.creado || 0));
  return f === 'h' ? l.filter(x => x.estado === 'h') : f === 't' ? l : l.filter(x => x.estado !== 'h');
}
const fbMini = (a, w, h) => '<span class="fbm' + (a.tipo === 'vid' ? ' vd' : '') + '" style="width:' + w + 'px;height:' + h + 'px' + (a.mini ? ';background-image:url(' + a.mini + ')' : '') + '">' + (a.tipo === 'vid' ? '<em><svg width="14" height="14" viewBox="0 0 14 14"><path d="M4 2.5l7 4.5-7 4.5z" fill="#fff"/></svg></em><u>' + fbDur(a.dur) + '</u>' : '') + '</span>';
const fbChipSec = k => { const s = fbSec(k); return '<span class="fbsc"><i style="background:' + s[2] + '"></i>' + esc(s[1]) + '</span>'; };

P.feedback = {
  clase: 'con-barra',
  html: p => {
    const f = p.f || 'p', todas = lista('feedback'), pend = todas.filter(x => x.estado !== 'h').length;
    const l = fbNotas(f);
    let h = tope('', todas.length ? '<button class="fbexp" data-a="fbExportar">' + ic('descargar', 18) + 'Exportar</button>' : '') + '<div data-r="banda">' + banda() + '</div>' +
      head('Feedback', pend + (pend === 1 ? ' pendiente' : ' pendientes') + ' · ' + (todas.length - pend) + (todas.length - pend === 1 ? ' hecha' : ' hechas'));
    h += '<div class="chips fbch">' + [['p', 'Pendientes'], ['h', 'Hechas'], ['t', 'Todas']].map(x => '<button class="chip' + (f === x[0] ? ' on' : '') + '" data-a="pSet" data-k="f" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>';
    if (!l.length) return h + vacio('sin-tareas', f === 'h' ? 'Nada hecho todavía' : 'Sin notas', f === 'h' ? 'Las notas que entren en una versión nueva pasan aquí.' : 'Apunta lo que mejorarías de Ronda: una idea, un fallo, algo que se ve raro. Puedes añadir capturas o un vídeo.');
    return h + '<div class="fbl">' + l.map(x => {
      const per = dato('personas', x.por), adj = x.adj || [];
      return '<button class="fbn card' + (x.estado === 'h' ? ' hecha' : '') + '" data-a="fbVer" data-id="' + x.id + '"><div class="fbh">' + (per ? av(per, 26) : '') + '<b>' + esc(nombreDe(x.por) || '') + '</b><small>' + fbCuando(x.creado) + '</small>' + fbChipSec(x.sec) + '</div>' +
        '<p>' + esc(x.texto || '') + '</p>' + (adj.length ? '<div class="fbad">' + adj.slice(0, 5).map(a => fbMini(a, 58, 92)).join('') + (adj.length > 5 ? '<span class="fbmas">+' + (adj.length - 5) + '</span>' : '') + '</div>' : '') +
        (x.estado === 'h' ? '<small class="fbok">' + ic('hecho', 16) + 'Hecha' + (x.hechoEn ? ' · ' + fechaCortaTxt(isoDia(new Date(x.hechoEn))) : '') + '</small>' : '') + '</button>';
    }).join('') + '</div>';
  },
  fijo: () => '<button class="fab" data-a="fbNueva" aria-label="Nueva nota">' + ic('anadir', 28) + '</button>'
};

/* ---------- Nota nueva o cambiar una nota (hoja) ---------- */
let FB = null; /* { id, texto, sec, adj: [{ ...guardado } | { blob, tipo, mini, dur, bytes, nombre, nuevo: true }], subiendo } */
ACC.fbNueva = () => { FB = { id: 'f' + uid(), texto: '', sec: '', adj: [], nueva: true }; fbHoja(); };
ACC.fbEditar = el => { const x = dato('feedback', el.dataset.id); if (!x) return; FB = { id: x.id, texto: x.texto || '', sec: x.sec || '', adj: (x.adj || []).slice(), nueva: false }; cerrarHoja(true); fbHoja(); };
function fbHojaHtml() {
  const s = FB.sec;
  return '<div class="fbhj"><div class="hjt"><h3>' + (FB.nueva ? 'Nueva nota' : 'Cambiar nota') + '</h3></div>' +
    '<textarea id="fbTxt" class="fbta" rows="4" placeholder="Qué mejorarías, qué falla o qué se ve raro…" maxlength="4000">' + esc(FB.texto) + '</textarea>' +
    '<p class="lab2">Sección</p><div class="fbsecs">' + fbSecciones().map(x => '<button class="' + (s === x[0] ? 'on' : '') + '" data-a="fbSecElegir" data-v="' + x[0] + '"><i style="background:' + x[2] + '"></i>' + esc(x[1]) + '</button>').join('') + '</div>' +
    '<p class="lab2">Capturas y vídeos</p><div class="fbadj">' + FB.adj.map((a, i) => '<span class="fbw">' + fbMini(a, 72, 112) + (FB.subiendo ? '' : '<button class="fbq" data-a="fbQuitar" data-i="' + i + '" aria-label="Quitar">' + ic('cerrar', 12) + '</button>') + '</span>').join('') +
    (FB.subiendo ? '' : '<label class="fbadd">' + ic('camara', 24, 0) + '<small>Foto o vídeo</small><input type="file" id="fbArch" accept="image/*,video/*" multiple hidden></label>') + '</div>' +
    '<p class="cap fbnota">Vídeos de hasta 100 MB (un par de minutos de grabación de pantalla). Se guardan en vuestro Drive, en la carpeta «Ronda · archivos».</p>' +
    (FB.subiendo ? '<div class="fbprog"><div class="bar2"><i style="width:' + Math.round(100 * (FB.prog || 0)) + '%;background:' + COL[0] + '"></i></div><small>' + esc(FB.subiendo) + '</small></div>' : btn('Guardar nota', 'fbGuardar')) + '</div>';
}
function fbHoja() {
  if (hojaAbierta && hojaAbierta.h && $('.fbhj', hojaAbierta.h)) { fbPintar(); return; }
  abrirHoja(fbHojaHtml(), { alCerrar: () => { if (FB && !FB.subiendo) FB = null; } });
  fbMontar();
}
function fbPintar() {
  if (!hojaAbierta || !FB) return;
  const t = $('#fbTxt', hojaAbierta.h); if (t) FB.texto = t.value;
  const hc = $('.hc', hojaAbierta.h), y = hc.scrollTop;
  hc.innerHTML = fbHojaHtml(); hc.scrollTop = y;
  fbMontar();
}
function fbMontar() {
  const h = hojaAbierta && hojaAbierta.h; if (!h) return;
  const t = $('#fbTxt', h); if (t) t.addEventListener('input', () => { FB.texto = t.value; });
  const f = $('#fbArch', h); if (f) f.addEventListener('change', () => fbAnadir(f));
}
ACC.fbSecElegir = el => { if (!FB) return; FB.sec = FB.sec === el.dataset.v ? '' : el.dataset.v; fbPintar(); };
ACC.fbQuitar = el => { if (!FB) return; FB.adj.splice(+el.dataset.i, 1); fbPintar(); };

/* Miniatura (y duración de los vídeos) para la lista: pequeña, va dentro de la nota */
function fbMiniDe(fuente, w, h) {
  const k = Math.min(1, 160 / Math.max(1, w)), c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
  c.getContext('2d').drawImage(fuente, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.6);
}
function fbVideoInfo(file) {
  return new Promise(ok => {
    const v = document.createElement('video'), url = URL.createObjectURL(file);
    let hecho = false; const fin = r => { if (hecho) return; hecho = true; URL.revokeObjectURL(url); ok(r); };
    v.muted = true; v.playsInline = true; v.preload = 'metadata'; v.src = url;
    v.addEventListener('loadedmetadata', () => { try { v.currentTime = Math.min(0.5, (v.duration || 1) / 3); } catch (e) { fin({ dur: v.duration || 0, mini: '' }); } });
    v.addEventListener('seeked', () => { let mini = ''; try { mini = fbMiniDe(v, v.videoWidth || 160, v.videoHeight || 240); } catch (e) { } fin({ dur: v.duration || 0, mini: mini }); });
    v.addEventListener('error', () => fin({ dur: 0, mini: '' }));
    setTimeout(() => fin({ dur: v.duration || 0, mini: '' }), 6000);
  });
}
async function fbAnadir(input) {
  const fs = [].slice.call(input.files || []); input.value = '';
  for (const file of fs) {
    if (!FB) return;
    try {
      if (/^video\//.test(file.type)) {
        if (file.size > FB_MAX) { toast('Ese vídeo pesa ' + fbMB(file.size) + ' y el máximo es 100 MB. Grábalo más corto.'); continue; }
        const inf = await fbVideoInfo(file);
        FB.adj.push({ blob: file, tipo: 'vid', mini: inf.mini, dur: inf.dur, bytes: file.size, nombre: file.name || 'video.mov', nuevo: true });
      } else if (/^image\//.test(file.type)) {
        const b = await reducir(file, 2200, 0.86);
        const { img, url } = await cargarImagen(b); let mini = ''; try { mini = fbMiniDe(img, img.naturalWidth, img.naturalHeight); } catch (e) { } URL.revokeObjectURL(url);
        FB.adj.push({ blob: b, tipo: 'img', mini: mini, bytes: b.size, nombre: 'captura.jpg', nuevo: true });
      } else toast('Solo fotos y vídeos.');
    } catch (e) { toast('No he podido leer ese archivo.'); }
    fbPintar();
  }
}
ACC.fbGuardar = async () => {
  if (!FB || FB.subiendo) return;
  const t = $('#fbTxt', hojaAbierta.h); if (t) FB.texto = t.value;
  const texto = FB.texto.trim();
  if (!texto) { toast('Escribe qué quieres mejorar.'); return; }
  const nuevos = FB.adj.filter(a => a.nuevo);
  if (nuevos.length && !navigator.onLine) { toast('Sin conexión: los archivos se suben cuando vuelva.'); return; }
  try {
    for (let i = 0; i < nuevos.length; i++) {
      const a = nuevos[i];
      FB.subiendo = 'Subiendo ' + (nuevos.length > 1 ? (i + 1) + ' de ' + nuevos.length : (a.tipo === 'vid' ? 'el vídeo' : 'la captura')) + '…'; FB.prog = i / nuevos.length; fbPintar();
      const ext = a.tipo === 'vid' ? ((a.nombre.match(/\.[a-z0-9]{2,4}$/i) || ['.mov'])[0].toLowerCase()) : '.jpg';
      const r = await subirRapido(a.blob, 'feedback-' + FB.id + '-' + (i + 1) + ext, { progreso: q => { FB.prog = (i + q) / nuevos.length; const b = hojaAbierta && $('.fbprog i', hojaAbierta.h); if (b) b.style.width = Math.round(100 * FB.prog) + '%'; } });
      a.fid = r.fid; delete a.blob; delete a.nuevo; a.nombre = a.tipo === 'vid' ? 'video' + ext : 'captura.jpg';
    }
  } catch (e) { FB.subiendo = ''; fbPintar(); toast('No he podido subir un archivo: ' + e.message); return; }
  const prev = dato('feedback', FB.id);
  cambiar('feedback', FB.id, Object.assign({ texto: texto, sec: FB.sec || 'general', adj: FB.adj.map(a => ({ fid: a.fid, tipo: a.tipo, nombre: a.nombre, mini: a.mini || '', dur: a.dur || 0, bytes: a.bytes || 0 })) }, prev ? {} : { por: S.cfg.persona, creado: Date.now(), estado: 'p' }));
  FB.subiendo = ''; FB = null; cerrarHoja(); toast(prev ? 'Nota cambiada' : 'Nota guardada'); Nav.refrescar(true);
};

/* ---------- Ver una nota ---------- */
ACC.fbVer = el => {
  const x = dato('feedback', el.dataset.id); if (!x) return;
  const adj = x.adj || [];
  abrirHoja('<div class="fbver"><div class="fbh">' + (dato('personas', x.por) ? av(dato('personas', x.por), 28) : '') + '<b>' + esc(nombreDe(x.por)) + '</b><small>' + fbCuando(x.creado) + '</small>' + fbChipSec(x.sec) + '</div>' +
    '<p class="fbtx">' + esc(x.texto || '') + '</p>' +
    (adj.length ? '<div class="fbad big">' + adj.map((a, i) => '<button class="fbab" data-a="fbAbrirAdj" data-id="' + x.id + '" data-i="' + i + '">' + fbMini(a, 92, 146) + '</button>').join('') + '</div><div data-r="fbVisor"></div>' : '') +
    '<div class="bts2">' + (x.estado === 'h' ? btn('Pendiente otra vez', 'fbEstado', 'sec', ' data-id="' + x.id + '" data-v="p"') : btn('Marcar como hecha', 'fbEstado', 'pri', ' data-id="' + x.id + '" data-v="h"')) +
    btn('Cambiar', 'fbEditar', 'sec', ' data-id="' + x.id + '"') + '</div>' + btn('Borrar nota', 'fbBorrar', 'sec peligro', ' data-id="' + x.id + '"') + '</div>');
};
ACC.fbAbrirAdj = async el => {
  const x = dato('feedback', el.dataset.id), a = x && (x.adj || [])[+el.dataset.i]; if (!a) return;
  const v = hojaAbierta && $('[data-r="fbVisor"]', hojaAbierta.h); if (!v) return;
  v.innerHTML = '<p class="cap">Abriendo…</p>';
  try {
    const b = await bajarArchivo(a.fid), url = URL.createObjectURL(b);
    if (!hojaAbierta || !v.isConnected) return;
    v.innerHTML = a.tipo === 'vid' ? '<video class="fbvid" src="' + url + '" controls playsinline></video>' : '<img class="fgr" src="' + url + '" alt="">';
  } catch (e) { v.innerHTML = '<p class="cap">No he podido abrirlo: ' + esc(e.message) + '</p>'; }
};
ACC.fbEstado = el => { const id = el.dataset.id, v = el.dataset.v; cambiar('feedback', id, v === 'h' ? { estado: 'h', hechoEn: Date.now() } : { estado: 'p', hechoEn: 0 }); cerrarHoja(); Nav.refrescar(true); toast(v === 'h' ? 'Marcada como hecha' : 'Pendiente otra vez'); };
ACC.fbBorrar = el => { const id = el.dataset.id; cambiar('feedback', id, { _b: 1 }); cerrarHoja(); Nav.refrescar(true); toast('Nota borrada', 'Deshacer', () => { cambiar('feedback', id, { _b: 0 }); Nav.refrescar(); }); };

/* ---------- Exportar ---------- */
let FBX = { q: 'p' };
function fbExpHtml() {
  const l = fbNotas(FBX.q === 't' ? 't' : 'p').slice().reverse();
  const adj = [].concat.apply([], l.map(x => x.adj || [])), caps = adj.filter(a => a.tipo !== 'vid').length, vids = adj.length - caps, bytes = adj.reduce((s, a) => s + (a.bytes || 0), 0) + 4096;
  const conArch = l.map((x, i) => [i, x]).filter(y => (y[1].adj || []).length);
  return '<div class="fbexh"><h3>Exportar feedback</h3>' +
    '<div class="seg">' + [['p', 'Pendientes'], ['t', 'Todas']].map(x => '<button class="' + (FBX.q === x[0] ? 'on' : '') + '" data-a="fbExpQ" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
    '<div class="fbres"><div><b>' + l.length + '</b><small>' + (l.length === 1 ? 'nota' : 'notas') + '</small></div><div><b>' + caps + '</b><small>' + (caps === 1 ? 'captura' : 'capturas') + '</small></div><div><b>' + vids + '</b><small>' + (vids === 1 ? 'vídeo' : 'vídeos') + '</small></div><div><b>' + fbMB(bytes) + '</b><small>en total</small></div></div>' +
    '<p class="lab2">Qué lleva el zip</p><div class="fbarb"><div>' + ic('carpeta', 18, 0) + '<b>' + fbZipNombre() + '</b></div>' +
    '<div class="s1">' + ic('documento', 18, 5) + '<span>feedback.txt<small>' + (l.length === 1 ? 'la nota' : 'las ' + l.length + ' notas') + ': quién, cuándo, sección y texto</small></span></div>' +
    conArch.slice(0, 2).map(y => '<div class="s1">' + ic('carpeta', 18, 1) + '<span>' + fbCarpeta(y[0], y[1]) + '<small>' + (y[1].adj || []).map((a, j) => fbArchNombre(a, j, y[1].adj)).join(' · ') + '</small></span></div>').join('') +
    (conArch.length > 2 ? '<div class="s1 mu">…y una carpeta por cada nota con archivos</div>' : '') + '</div>' +
    '<p class="cap fbnota">Pásame el zip en la conversación con Claude y lo leo todo.</p>' +
    (FBX.bajando ? '<div class="fbprog"><div class="bar2"><i style="width:' + Math.round(100 * (FBX.prog || 0)) + '%;background:' + COL[0] + '"></i></div><small>' + esc(FBX.bajando) + '</small></div>' : l.length ? btn(ic('descargar', 20) + ' Descargar zip', 'fbZip') : '<p class="cap">No hay notas que exportar.</p>') + '</div>';
}
const fbZipNombre = () => 'Ronda_feedback_' + hoyISO();
const fbLimpio = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
const fbCarpeta = (i, x) => dosd(i + 1) + '_' + fbLimpio(fbSec(x.sec)[1]);
function fbArchNombre(a, j, todos) {
  const tipo = a.tipo === 'vid' ? 'video' : 'captura', n = todos.slice(0, j + 1).filter(b => (b.tipo === 'vid') === (a.tipo === 'vid')).length;
  return tipo + '_' + n + (a.tipo === 'vid' ? ((String(a.nombre || '').match(/\.[a-z0-9]{2,4}$/i) || ['.mov'])[0].toLowerCase()) : '.jpg');
}
ACC.fbExportar = () => { FBX = { q: 'p' }; abrirHoja(fbExpHtml()); };
ACC.fbExpQ = el => { if (FBX.bajando) return; FBX.q = el.dataset.v; const hc = hojaAbierta && $('.hc', hojaAbierta.h); if (hc) hc.innerHTML = fbExpHtml(); };
function fbTexto(l) {
  const L = ['FEEDBACK DE RONDA', 'Exportado el ' + fechaCortaTxt(hoyISO()) + ' de ' + new Date().getFullYear() + ' a las ' + hora(new Date()) + ' · versión ' + VERSION, l.length + (l.length === 1 ? ' nota' : ' notas') + (FBX.q === 't' ? ' (todas)' : ' (pendientes)'), ''];
  l.forEach((x, i) => {
    const d = new Date(x.creado || 0), adj = x.adj || [];
    L.push('────────────────────────────────────────');
    L.push('Nota ' + (i + 1) + ' · ' + fbSec(x.sec)[1] + ' · ' + (x.estado === 'h' ? 'Hecha' : 'Pendiente'));
    L.push('De: ' + (nombreDe(x.por) || '—') + ' · ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + hora(d));
    L.push('');
    L.push(String(x.texto || '').trim());
    if (adj.length) { L.push(''); L.push('Archivos (carpeta ' + fbCarpeta(i, x) + '): ' + adj.map((a, j) => fbArchNombre(a, j, adj) + (a.tipo === 'vid' && a.dur ? ' (' + fbDur(a.dur) + ')' : '')).join(', ')); }
    L.push('');
  });
  return L.join('\n');
}
ACC.fbZip = async () => {
  if (FBX.bajando) return;
  const l = fbNotas(FBX.q === 't' ? 't' : 'p').slice().reverse(), raiz = fbZipNombre() + '/';
  const todos = []; l.forEach((x, i) => (x.adj || []).forEach((a, j) => todos.push([i, x, a, j])));
  const pintar = () => { const hc = hojaAbierta && $('.hc', hojaAbierta.h); if (hc && $('.fbexh', hc)) hc.innerHTML = fbExpHtml(); };
  const archivos = [{ nombre: raiz + 'feedback.txt', datos: new TextEncoder().encode(fbTexto(l)) }];
  const fallos = [];
  try {
    for (let k = 0; k < todos.length; k++) {
      const [i, x, a, j] = todos[k];
      FBX.bajando = 'Bajando ' + (k + 1) + ' de ' + todos.length + '…'; FBX.prog = k / Math.max(1, todos.length); pintar();
      try { const b = await bajarArchivo(a.fid); archivos.push({ nombre: raiz + fbCarpeta(i, x) + '/' + fbArchNombre(a, j, x.adj), datos: new Uint8Array(await b.arrayBuffer()) }); }
      catch (e) { if (e.code === 'sinred' || e.code === 'token') throw e; fallos.push('Nota ' + (i + 1) + ': ' + fbArchNombre(a, j, x.adj)); }
    }
    if (fallos.length) archivos[0].datos = new TextEncoder().encode(fbTexto(l) + '\nNo se han podido bajar (ya no están en Drive): ' + fallos.join(', ') + '\n');
    FBX.bajando = 'Preparando el zip…'; FBX.prog = 1; pintar();
    const zip = new File([zipHacer(archivos)], fbZipNombre() + '.zip', { type: 'application/zip' });
    FBX.bajando = ''; pintar();
    await fbEntregar(zip);
  } catch (e) { FBX.bajando = ''; pintar(); toast('No he podido preparar el zip: ' + e.message); }
};
async function fbEntregar(file) {
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: file.name }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  const url = URL.createObjectURL(file), a = document.createElement('a');
  a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* ---------- Zip sin comprimir (fotos y vídeos ya vienen comprimidos), hecho en el móvil ---------- */
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u) { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = CRC_T[(c ^ u[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function zipHacer(archivos) {
  const enc = new TextEncoder(), d = new Date();
  const dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF, dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
  const partes = [], central = []; let pos = 0;
  archivos.forEach(f => {
    const nom = enc.encode(f.nombre), dat = f.datos, crc = crc32(dat);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint16(10, dt, true); h.setUint16(12, dd, true); h.setUint32(14, crc, true); h.setUint32(18, dat.length, true); h.setUint32(22, dat.length, true);
    h.setUint16(26, nom.length, true); h.setUint16(28, 0, true);
    partes.push(new Uint8Array(h.buffer), nom, dat);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
    c.setUint16(12, dt, true); c.setUint16(14, dd, true); c.setUint32(16, crc, true); c.setUint32(20, dat.length, true); c.setUint32(24, dat.length, true);
    c.setUint16(28, nom.length, true); c.setUint16(30, 0, true); c.setUint16(32, 0, true); c.setUint16(34, 0, true); c.setUint16(36, 0, true); c.setUint32(38, 0, true); c.setUint32(42, pos, true);
    central.push(new Uint8Array(c.buffer), nom);
    pos += 30 + nom.length + dat.length;
  });
  const tamC = central.reduce((s, u) => s + u.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, archivos.length, true); e.setUint16(10, archivos.length, true); e.setUint32(12, tamC, true); e.setUint32(16, pos, true);
  return new Blob(partes.concat(central, [new Uint8Array(e.buffer)]), { type: 'application/zip' });
}

/* Para las pruebas */
Object.assign(window.RONDA || (window.RONDA = {}), { zipHacer: zipHacer, crc32: crc32, fbTexto: fbTexto, fbSecciones: fbSecciones, fbArchNombre: fbArchNombre, cerrarHoja: cerrarHoja });
