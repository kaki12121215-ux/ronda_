/* ============================ DOCUMENTOS CIFRADOS ============================
   - Cada espacio tiene una clave de 32 bytes que solo existe en los móviles (nunca va al script).
   - En cada móvil la clave se guarda cifrada con el PIN de 4 cifras de esa persona.
   - La «clave de rescate» es la misma clave escrita en letras: sirve para recuperarla y para pasarla a otro móvil.
   - Los archivos se cifran en el móvil (AES-GCM) antes de subirlos a Drive. */
const CARPETAS = [['dni', 'DNI y pasaporte', 'dni', 0], ['seguros', 'Seguros', 'seguro', 1], ['vivienda', 'Vivienda', 'contrato-de-alquiler', 4], ['facturas', 'Facturas', 'facturas', 5], ['garantias', 'Garantías', 'garantias', 6], ['salud', 'Salud', 'tarjeta-sanitaria', 7], ['coche', 'Coche', 'coche-itv-y-permiso', 2], ['otros', 'Otros', 'documento', 3]];
const B32 = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DOC = { clave: null, hasta: 0, t: null };
const crip = () => window.crypto && window.crypto.subtle;
function aB32(bytes) { let bits = '', s = ''; bytes.forEach(b => { bits += b.toString(2).padStart(8, '0'); }); for (let i = 0; i < bits.length; i += 5) s += B32[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)]; return s; }
function deB32(s) { s = String(s).toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^RONDADOC/, ''); let bits = ''; for (const c of s) { const i = B32.indexOf(c); if (i < 0) return null; bits += i.toString(2).padStart(5, '0'); } const out = []; for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2)); return new Uint8Array(out.slice(0, 32)); }
const agrupar = s => s.match(/.{1,4}/g).join('-');
const b64 = u => btoa(String.fromCharCode.apply(null, Array.from(u)));
const deb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function claveAES(raw) { return crip().importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']); }
async function cifrar(raw, datos) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = new Uint8Array(await crip().encrypt({ name: 'AES-GCM', iv: iv }, await claveAES(raw), datos)); const o = new Uint8Array(12 + ct.length); o.set(iv); o.set(ct, 12); return o; }
async function descifrar(raw, datos) { return new Uint8Array(await crip().decrypt({ name: 'AES-GCM', iv: datos.slice(0, 12) }, await claveAES(raw), datos.slice(12))); }
async function clavePin(pin, salt) { const k = await crip().importKey('raw', new TextEncoder().encode('ronda:' + pin), 'PBKDF2', false, ['deriveBits']); return new Uint8Array(await crip().deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: 150000 }, k, 256)); }
async function comprobarClave(raw) { const v = (dato('ajustes', 'docs') || {}).verif; if (!v) return true; try { const t = new TextDecoder().decode(await descifrar(raw, deb64(v))); return t === 'ronda'; } catch (e) { return false; } }
async function guardarConPin(raw, pin) { const salt = crypto.getRandomValues(new Uint8Array(16)); const ct = await cifrar(await clavePin(pin, salt), raw); await DB.set('docs:' + S.sid, { salt: b64(salt), ct: b64(ct), intentos: 0, hasta: 0 }); }
function abrirSesionDocs(raw) { DOC.clave = raw; DOC.hasta = Date.now() + 5 * 60000; clearTimeout(DOC.t); DOC.t = setTimeout(cerrarSesionDocs, 5 * 60000); }
function cerrarSesionDocs() { DOC.clave = null; DOC.hasta = 0; const p = Nav.actual(); if (p && /^doc/.test(p.id)) Nav.refrescar(true); }
document.addEventListener('visibilitychange', () => { if (document.hidden && DOC.clave) setTimeout(() => { if (document.hidden) cerrarSesionDocs(); }, 60000); });
const docsActivos = () => !!(dato('ajustes', 'docs') || {}).verif;

P.documentos = {
  clase: 'con-barra',
  html: p => {
    let h = tope('') + '<div data-r="banda">' + banda() + '</div>' + head('Documentos', lista('documentos').length + ' archivos', docsActivos() ? '<button class="mini" data-a="ir" data-id="docClave">Clave</button>' : '');
    if (!crip()) return h + '<div class="aviso mal">' + ic('error', 22, 0) + '<span>Este navegador no permite cifrar. Abre Ronda desde el icono de la pantalla de inicio.</span></div>';
    h += '<div class="card row" style="background:color-mix(in srgb,#E4EE9A 30%,var(--sf))">' + ic('candado', 28, 4) + '<div class="f"><b>Cifrados en el móvil</b><small>' + (DOC.clave ? 'Abiertos · se cierran solos a los 5 minutos' : 'Se abren con tu código de 4 cifras') + '</small></div>' + (DOC.clave ? '<button class="mini" data-a="cerrarDocs">Cerrar</button>' : '') + '</div>';
    if (!docsActivos()) return h + vacio('sin-documentos', 'Documentos a salvo', 'DNI, seguros, garantías… cifrados antes de salir del móvil. Nadie sin la clave puede abrirlos, ni siquiera desde Drive.') + '<button class="btn pri" data-a="ir" data-id="docClave" style="margin-top:18px">Activar documentos cifrados</button>';
    h += '<div class="grid" style="margin-top:14px">' + CARPETAS.map(c => { const n = lista('documentos').filter(d => d.carpeta === c[0]).length; return '<button class="mod" style="--c:' + COL[c[3]] + '" data-a="docCarpeta" data-v="' + c[0] + '">' + ic(c[2], 30, c[3]) + '<b>' + c[1] + '</b><small>' + n + (n === 1 ? ' archivo' : ' archivos') + '</small></button>'; }).join('') + '</div>';
    const vencen = lista('documentos').filter(d => d.vence && d.vence <= isoDia(sumaDias(new Date(), 60))).sort((a, b) => a.vence.localeCompare(b.vence));
    if (vencen.length) h += '<h3>Caducan pronto</h3><div class="list">' + vencen.map(d => '<button class="row card" data-a="docAbrir" data-id="' + d.id + '">' + sq('reloj', 1) + '<div class="f"><b>' + esc(d.nombre) + '</b><small' + (d.vence < hoyISO() ? ' style="color:#C8402B"' : '') + '>Vence ' + cuando(d.vence).toLowerCase() + '</small></div></button>').join('') + '</div>';
    return h;
  },
  fijo: () => '<button class="fab" data-a="docNuevo" aria-label="Añadir documento">' + ic('anadir', 28) + '</button>'
};
ACC.cerrarDocs = () => cerrarSesionDocs();
ACC.docCarpeta = el => Nav.ir('docCarpeta', { c: el.dataset.v });
ACC.docNuevo = () => !docsActivos() ? Nav.ir('docClave', {}) : pedirClave(() => Nav.ir('docNuevo', { carpeta: (Nav.actual().params || {}).c || 'otros' }));
ACC.docAbrir = el => pedirClave(() => Nav.ir('docVer', { did: el.dataset.id }));

P.docCarpeta = {
  clase: 'con-barra',
  html: p => {
    const c = CARPETAS.find(x => x[0] === p.c) || CARPETAS[7];
    const l = lista('documentos').filter(d => d.carpeta === c[0]).sort((a, b) => (b.creado || 0) - (a.creado || 0));
    return tope(c[1]) + (l.length ? '<div class="list">' + l.map(d => '<button class="row card" data-a="docAbrir" data-lp="docMenu" data-id="' + d.id + '">' + sq(c[2], c[3]) + '<div class="f"><b>' + esc(d.nombre) + '</b><small>' + (d.tipo === 'application/pdf' ? 'PDF' : 'Imagen') + ' · ' + Math.max(1, Math.round((d.tam || 0) / 1024)) + ' KB' + (d.vence ? ' · vence ' + fechaCorta(deISO(d.vence)) : '') + '</small></div>' + ic('candado', 20, 4) + '</button>').join('') + '</div>' : vacio('sin-documentos', 'Carpeta vacía', 'Añade el primero con el botón +.'));
  },
  fijo: () => '<button class="fab" data-a="docNuevo" aria-label="Añadir documento">' + ic('anadir', 28) + '</button>'
};
ACC.docMenu = el => { const d = dato('documentos', el.dataset.id); abrirHoja('<h3>' + esc(d.nombre) + '</h3><div class="list"><button class="row card" data-a="docBorrar" data-id="' + d.id + '">' + ic('borrar', 24, 0) + '<b>Borrar documento</b></button></div>'); };
ACC.docBorrar = async el => {
  cerrarHoja(); const d = dato('documentos', el.dataset.id);
  if (!await preguntar('¿Borrar «' + d.nombre + '»?', 'Se borra también el archivo cifrado de Drive.', 'Borrar', true)) return;
  cambiar('documentos', d.id, { _b: 1 }); paginasDe(d).forEach(x => api('archivo-borrar', { fid: x.fid }).catch(() => { }));
  if (Nav.actual().id === 'docVer') Nav.atras(); else Nav.refrescar(true);
  toast('Documento borrado');
};

/* 65 · Añadir documento */
P.docNuevo = {
  clase: 'con-boton', fija: true,
  html: p => {
    p.archivos = p.archivos || [];
    const nuevo = !p.did, d = p.did ? dato('documentos', p.did) : null;
    let h = tope(nuevo ? 'Añadir documento' : 'Añadir imágenes') + (d ? '<p class="texto">A «' + esc(d.nombre) + '». Se añaden después de las que ya tiene.</p>' : '');
    if (p.archivos.length) h += '<div class="thr" data-r="thr">' + p.archivos.map((f, i) => '<div class="th1" data-i="' + i + '">' + (f.url ? '<span class="thimg" style="background-image:url(\'' + f.url + '\')"></span>' : '<span class="thimg pdf">' + ic('documento', 30, 5) + '</span>') + '<small>' + (i === 0 && nuevo ? 'Primera' : (i + 1) + 'ª') + '</small><button class="xx" data-a="docQuitarArch" data-i="' + i + '" aria-label="Quitar">' + ic('cerrar', 11) + '</button></div>').join('') +
      '<label class="th1 add">' + ic('camara', 26) + '<small>Añadir</small><input type="file" accept="image/*,application/pdf" multiple class="arch" data-r="dfC"></label></div>' + (p.archivos.length > 1 ? '<p class="cap" style="text-align:left;margin-top:6px">Mantén el dedo en una imagen y arrástrala para cambiar el orden.</p>' : '');
    else h += '<div class="list">' +
      '<label class="row card">' + sq('camara', 0) + '<div class="f"><b>Hacer una foto</b><small>Del DNI, un ticket, una garantía…</small></div><input type="file" accept="image/*" capture="environment" class="arch" data-r="dfA"></label>' +
      '<label class="row card">' + sq('adjunto', 6) + '<div class="f"><b>Elegir fotos o un PDF</b><small>Las que quieras en el mismo documento · hasta 20 MB cada una</small></div><input type="file" accept="image/*,application/pdf" multiple class="arch" data-r="dfB"></label></div>';
    if (nuevo) h += filaNombreEmoji('dEmo', pv(p, 'dEmo', p.emoji), fldTxt('dNom', 'Nombre', pv(p, 'dNom', p.nombre), 'Contrato de alquiler', 'maxlength="80"')) +
      '<p class="lab2">Carpeta</p><div class="chips">' + CARPETAS.map(c => '<button class="chip' + (p.carpeta === c[0] ? ' on' : '') + '" data-a="pSet" data-k="carpeta" data-v="' + c[0] + '">' + c[1] + '</button>').join('') + '</div>' +
      '<label class="fld" style="margin-top:14px"><small>Caduca (opcional)</small><input type="date" id="dVen" value="' + esc(pv(p, 'dVen', '')) + '"></label>';
    return h + '<div data-r="prog"></div>';
  },
  montar(el, p) { P.docNuevo.tras(el, p); },
  tras(el, p) {
    $$('input[type=file]', el).forEach(i => i.addEventListener('change', () => {
      const fs = Array.from(i.files || []); if (!fs.length) return;
      guardarCampos(Nav.actual());
      fs.forEach(f => p.archivos.push({ f: f, url: /^image\//.test(f.type) ? URL.createObjectURL(f) : '' }));
      if (!p._dNom && !p.did) p._dNom = cap(fs[0].name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
      Nav.refrescar(true);
    }));
    /* Ordenar arrastrando */
    const cont = $('[data-r="thr"]', el); if (!cont) return;
    let d = null, t = null;
    cont.addEventListener('pointerdown', ev => { const th = ev.target.closest('.th1:not(.add)'); if (!th || ev.target.closest('.xx')) return; t = setTimeout(() => { d = th; th.classList.add('drag'); try { navigator.vibrate && navigator.vibrate(8); } catch (e) { } }, 280); });
    cont.addEventListener('pointermove', ev => { if (!d) { clearTimeout(t); return; } ev.preventDefault(); const o = $$('.th1:not(.add)', cont).find(x => { const r = x.getBoundingClientRect(); return x !== d && ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; }); if (o) { const r = o.getBoundingClientRect(); cont.insertBefore(d, ev.clientX < r.left + r.width / 2 ? o : o.nextSibling); } });
    const fin = () => { clearTimeout(t); if (!d) return; d.classList.remove('drag'); const orden = $$('.th1:not(.add)', cont).map(x => p.archivos[+x.dataset.i]); p.archivos = orden; d = null; LP.cancelarClick = true; setTimeout(() => { LP.cancelarClick = false; }, 300); guardarCampos(Nav.actual()); Nav.refrescar(true); };
    cont.addEventListener('pointerup', fin); cont.addEventListener('pointercancel', fin);
    cont.addEventListener('touchmove', ev => { if (d) ev.preventDefault(); }, { passive: false });
  },
  alSalir(e) { (e.params.archivos || []).forEach(a => { if (a.url) setTimeout(() => URL.revokeObjectURL(a.url), 1000); }); },
  fijo: p => '<div class="btns">' + btn(p.did ? 'Cifrar y añadir' : 'Cifrar y guardar', 'docGuardar') + '</div>'
};
ACC.docQuitarArch = (el, ev) => { if (ev) ev.stopPropagation(); const e = Nav.actual(); guardarCampos(e); const a = e.params.archivos.splice(+el.dataset.i, 1)[0]; if (a && a.url) URL.revokeObjectURL(a.url); Nav.refrescar(true); };
ACC.docGuardar = el => conEspera(el, async () => {
  const e = Nav.actual(); guardarCampos(e); const p = e.params;
  if (!p.archivos.length) return toast('Elige un archivo o haz una foto.');
  const nombre = p.did ? '' : cap(val('dNom')); if (!p.did && !nombre) return toast('Ponle un nombre.');
  if (!DOC.clave) return pedirClave(() => ACC.docGuardar(el));
  if (p.archivos.some(a => a.f.size > 20 * 1024 * 1024)) return toast('Hay un archivo que pasa de 20 MB.');
  const prog = t => { const x = $('[data-r="prog"]', e.el); if (x) x.innerHTML = t ? '<div class="aviso">' + ic('subir', 22, 5) + '<span>' + t + '</span></div>' : ''; };
  try {
    const pags = [], N = p.archivos.length;
    for (let i = 0; i < N; i++) {
      const a = p.archivos[i], pre = N > 1 ? (i + 1) + ' de ' + N + ' · ' : '';
      let blob = a.f, tipo = a.f.type || 'application/octet-stream';
      if (/^image\//.test(tipo)) { prog(pre + 'Reduciendo la foto…'); blob = await reducir(a.f, 2000, 0.85); tipo = 'image/jpeg'; }
      prog(pre + 'Cifrando en el móvil…');
      const datos = new Uint8Array(await blob.arrayBuffer());
      const cif = await cifrar(DOC.clave, datos);
      const r = await subirArchivo(new Blob([cif], { type: 'application/octet-stream' }), 'documento.cifrado', { progreso: f => prog(pre + 'Subiendo… ' + Math.round(f * 100) + ' %') });
      pags.push({ fid: r.fid, tipo: tipo, tam: datos.length });
    }
    if (p.did) {
      const d = dato('documentos', p.did), ya = paginasDe(d);
      cambiar('documentos', p.did, { paginas: ya.concat(pags) });
      Nav.atras(); toast(pags.length === 1 ? 'Imagen añadida' : pags.length + ' imágenes añadidas');
    } else {
      cambiar('documentos', 'd' + uid(), { nombre: nombre, emoji: primerEmoji(val('dEmo')), carpeta: p.carpeta, tipo: pags[0].tipo, tam: pags[0].tam, fid: pags[0].fid, paginas: pags, vence: val('dVen'), creadoPor: S.cfg.persona, creado: Date.now() });
      Nav.atras(); toast('Documento cifrado y guardado');
    }
  } catch (x) { prog(''); toast('No se ha podido guardar: ' + x.message); }
});
/* Las páginas de un documento (los de antes tienen solo una). */
const paginasDe = d => d ? (Array.isArray(d.paginas) && d.paginas.length ? d.paginas : [{ fid: d.fid, tipo: d.tipo, tam: d.tam }]) : [];

/* 64 · Documento abierto (se descifra en el móvil, no se guarda descifrado).
   Fotos y PDF se ajustan al ancho de la pantalla y se amplían con dos dedos (o con doble toque). */
P.docVer = {
  fija: true,
  html: p => {
    const d = dato('documentos', p.did);
    if (!d) return tope('') + '<p class="mu">Ya no existe.</p>';
    let h = tope(d.nombre, '<button class="rt" data-a="docCompartir" aria-label="Compartir o abrir fuera">' + ic('compartir', 24) + '</button>');
    if (!DOC.clave) return h + '<p class="mu">Documentos cerrados.</p><button class="btn pri" data-a="docAbrir" data-id="' + d.id + '">Abrir con mi código</button>';
    const pg = paginasDe(d);
    h += p.url ? (pg.length > 1 ? '<div class="pager" data-r="pager">' + pg.map((x, i) => '<div class="slide"><div class="zoombox" data-r="zb' + i + '"><div class="zin">' + (!p.urls[i] ? '<div class="aviso">' + ic('reloj', 22, 1) + '<span>Descifrando…</span></div>' : x.tipo === 'application/pdf' ? '<div data-r="pdf' + i + '"><div class="aviso">' + ic('reloj', 22, 1) + '<span>Preparando el PDF…</span></div></div>' : '<img class="docimg" src="' + p.urls[i] + '" alt="">') + '</div></div></div>').join('') + '</div><div class="pgn" data-r="pgn">' + ((p.i || 0) + 1) + ' de ' + pg.length + '</div><div class="dots2">' + pg.map((x, i) => '<i class="' + (i === (p.i || 0) ? 'a' : '') + '"></i>').join('') + '</div>'
      : '<div class="zoombox" data-r="zb"><div class="zin">' + (d.tipo === 'application/pdf' ? '<div data-r="pdf"><div class="aviso">' + ic('reloj', 22, 1) + '<span>Preparando el PDF…</span></div></div>' : '<img class="docimg" src="' + p.url + '" alt="">') + '</div></div>') + '<p class="cap" style="font-size:13px;margin-top:8px">' + (pg.length > 1 ? 'Desliza para pasar de página. ' : '') + 'Pellizca o toca dos veces para ampliar</p>'
      : '<div class="aviso' + (p.err ? ' mal' : '') + '">' + ic(p.err ? 'error' : 'reloj', 22, p.err ? 0 : 1) + '<span>' + (p.err ? esc(p.err) : 'Descargando y descifrando…') + '</span></div>' + (p.err ? '<button class="btn sec" data-a="docReintentar" style="margin-bottom:10px">Volver a intentarlo</button>' : '');
    return h + '<div class="card" style="padding:4px 16px;margin-top:14px"><div class="kv"><small>Carpeta</small><b>' + (CARPETAS.find(c => c[0] === d.carpeta) || CARPETAS[7])[1] + '</b></div>' + (d.vence ? '<div class="kv"><small>Vence</small><b>' + fechaCorta(deISO(d.vence)) + '</b></div>' : '') + '<div class="kv"><small>Añadido por</small><b>' + esc(nombreDe(d.creadoPor)) + '</b></div><div class="kv"><small>Cifrado</small><b>Solo se abre en vuestros móviles</b></div></div>' +
      '<button class="btn sec" data-a="docMasImg" data-id="' + d.id + '" style="margin-top:14px">' + ic('camara', 20) + ' Añadir imágenes</button>' +
      '<button class="btn sec peligro" data-a="docBorrar" data-id="' + d.id + '" style="margin-top:10px">Borrar documento</button>';
  },
  async montar(el, p) {
    const d = dato('documentos', p.did); if (!d || !DOC.clave) return;
    p.err = '';
    try {
      const pg = paginasDe(d); p.urls = []; p.blobs = [];
      for (let i = 0; i < pg.length; i++) {
        const b = await bajarArchivo(pg[i].fid); const plano = await descifrar(DOC.clave, new Uint8Array(await b.arrayBuffer()));
        p.blobs[i] = new Blob([plano], { type: pg[i].tipo || d.tipo }); p.urls[i] = URL.createObjectURL(p.blobs[i]);
        if (i === 0) { p.blob = p.blobs[0]; p.url = p.urls[0]; }
        if (Nav.actual().params === p && pg.length > 1) Nav.refrescar(true);
      }
    }
    catch (x) { p.err = x.name === 'OperationError' ? 'No se puede descifrar: la clave de este móvil no es la del espacio.' : 'No se ha podido descargar: ' + x.message; }
    if (Nav.actual().params === p) Nav.refrescar(true);
  },
  tras(el, p) {
    const pager = $('[data-r="pager"]', el);
    if (pager) {
      const pg = paginasDe(dato('documentos', p.did));
      $$('.zoombox', pager).forEach((z, i) => { hacerZoom(z); const c = $('[data-r="pdf' + i + '"]', z); if (c && p.blobs && p.blobs[i]) pintarPdf(c, p.blobs[i], z.clientWidth).catch(e => anotar('pdf', e)); });
      if (p.i) pager.scrollLeft = p.i * pager.clientWidth;
      pager.addEventListener('scroll', () => { const i = Math.round(pager.scrollLeft / pager.clientWidth); if (i !== p.i) { p.i = i; const n = $('[data-r="pgn"]', el); if (n) n.textContent = (i + 1) + ' de ' + pg.length; $$('.dots2 i', el).forEach((x, k) => x.classList.toggle('a', k === i)); } }, { passive: true });
      return;
    }
    const zb = $('[data-r="zb"]', el); if (!zb) return;
    hacerZoom(zb);
    const caja = $('[data-r="pdf"]', el);
    if (caja && p.blob) pintarPdf(caja, p.blob, zb.clientWidth).catch(e => { anotar('pdf', e); caja.innerHTML = '<iframe class="docpdf" src="' + p.url + '"></iframe><div class="aviso">' + ic('informacion', 22, 5) + '<span>Si no se ve bien, toca Compartir (arriba) para abrirlo fuera.</span></div>'; });
  },
  alSalir(e) { (e.params.urls || [e.params.url]).forEach(u => { if (u) setTimeout(() => URL.revokeObjectURL(u), 1000); }); }
};
ACC.docMasImg = el => { Nav.ir('docNuevo', { did: el.dataset.id }); };
ACC.docReintentar = () => { const e = Nav.actual(); e.params.err = ''; Nav.refrescar(true); P.docVer.montar(e.el, e.params); };
/* PDF: se dibuja cada página ajustada al ancho con pdf.js (se carga solo la primera vez que hace falta). */
let PDFJS = null;
function cargarPdfJs() {
  if (PDFJS) return PDFJS;
  PDFJS = new Promise((ok, ko) => {
    const v = '3.11.174', base = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + v + '/';
    const sc = document.createElement('script'); sc.src = base + 'pdf.min.js';
    sc.onload = () => { try { window.pdfjsLib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.js'; ok(window.pdfjsLib); } catch (e) { ko(e); } };
    sc.onerror = () => { PDFJS = null; ko(new Error('No se ha podido cargar el lector de PDF')); };
    document.head.appendChild(sc);
  });
  return PDFJS;
}
async function pintarPdf(caja, blob, ancho) {
  const lib = await cargarPdfJs();
  const pdf = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
  caja.innerHTML = '';
  const dpr = Math.min(3, window.devicePixelRatio || 2);
  for (let n = 1; n <= Math.min(pdf.numPages, 20); n++) {
    const pg = await pdf.getPage(n), v1 = pg.getViewport({ scale: 1 }), esc2 = ancho / v1.width, vp = pg.getViewport({ scale: esc2 * dpr * 1.5 });
    const cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height; cv.className = 'docpag'; cv.style.width = ancho + 'px'; cv.style.height = (v1.height * esc2) + 'px';
    caja.appendChild(cv);
    await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
  }
  if (pdf.numPages > 20) caja.insertAdjacentHTML('beforeend', '<p class="cap">Se ven las 20 primeras páginas. Para el resto, Compartir.</p>');
}
/* Ampliar con dos dedos, mover con uno cuando está ampliado y doble toque para ampliar o volver. */
function hacerZoom(box) {
  const inner = box.firstElementChild; if (!inner) return;
  let s = 1, tx = 0, ty = 0, st = null, ultimo = 0;
  const lim = () => { const w = box.clientWidth, h = inner.offsetHeight; tx = Math.min(0, Math.max(w - w * s, tx)); ty = Math.min(0, Math.max(h - h * s, ty)); };
  const poner = (anim) => { lim(); inner.style.transition = anim ? 'transform .25s ease' : 'none'; inner.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')'; box.classList.toggle('ampliado', s > 1.01); };
  box.addEventListener('touchstart', e => {
    const r = box.getBoundingClientRect();
    if (e.touches.length === 2) { const a = e.touches[0], b = e.touches[1]; st = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), s: s, tx: tx, ty: ty, cx: (a.clientX + b.clientX) / 2 - r.left, cy: (a.clientY + b.clientY) / 2 - r.top }; }
    else if (e.touches.length === 1) {
      const t = e.touches[0], ahora = Date.now();
      if (ahora - ultimo < 300) { const cx = t.clientX - r.left, cy = t.clientY - r.top; if (s > 1.01) { s = 1; tx = 0; ty = 0; } else { s = 2.5; tx = cx - cx * s; ty = cy - cy * s; } poner(true); ultimo = 0; st = null; return; }
      ultimo = ahora;
      st = s > 1.01 ? { pan: true, x: t.clientX, y: t.clientY, tx: tx, ty: ty } : null;
    }
  }, { passive: true });
  box.addEventListener('touchmove', e => {
    if (!st) return;
    if (e.touches.length === 2 && st.d) {
      e.preventDefault();
      const a = e.touches[0], b = e.touches[1], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ns = Math.min(5, Math.max(1, st.s * d / st.d));
      tx = st.cx - (st.cx - st.tx) * (ns / st.s); ty = st.cy - (st.cy - st.ty) * (ns / st.s); s = ns; poner(false);
    } else if (st.pan && e.touches.length === 1) {
      e.preventDefault();
      tx = st.tx + e.touches[0].clientX - st.x; ty = st.ty + e.touches[0].clientY - st.y; poner(false);
    }
  }, { passive: false });
  box.addEventListener('touchend', e => { if (!e.touches.length) { st = null; if (s < 1.05) { s = 1; tx = 0; ty = 0; poner(true); } } });
}
ACC.docCompartir = async () => {
  const p = Nav.actual().params, d = dato('documentos', p.did);
  const i = p.i || 0, blob = (p.blobs || [])[i] || p.blob, url = (p.urls || [])[i] || p.url;
  if (!blob) return toast('Todavía se está abriendo.');
  const tipo = blob.type || d.tipo, nP = paginasDe(d).length;
  const f = new File([blob], d.nombre + (nP > 1 ? ' ' + (i + 1) : '') + (tipo === 'application/pdf' ? '.pdf' : '.jpg'), { type: tipo });
  try { if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: d.nombre }); else window.open(url, '_blank'); } catch (e) { }
};

/* 63 · Desbloqueo con PIN */
async function pedirClave(seguir) {
  if (DOC.clave) return seguir();
  const g = await DB.get('docs:' + S.sid);
  if (!g) return Nav.ir('docClave', { seguir: seguir });
  Nav.ir('pin', { seguir: seguir });
}
P.pin = {
  clase: 'con-boton', fija: true,
  html: p => {
    p.v = p.v || '';
    return tope('') + '<div class="centro" style="padding-top:10px"><div class="lk" style="margin:0 auto">' + ic('candado', 56, 4) + '</div><h2 class="lg" style="font-size:26px">' + (p.nuevo ? (p.primero ? 'Repite el código' : 'Elige tu código') : 'Documentos cifrados') + '</h2><p class="mu">' + (p.nuevo ? 'Cuatro cifras. Es solo tuyo y solo vale en este móvil.' : 'Escribe tu código de 4 cifras.') + '</p>' +
      '<div class="pin">' + [0, 1, 2, 3].map(i => '<i class="' + (i < p.v.length ? 'on' : '') + '"></i>').join('') + '</div><p class="cap" data-r="msg" style="min-height:22px">' + esc(p.msg || '') + '</p>' +
      '<div class="pinpad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : '<button data-a="pinTecla" data-k="' + k + '">' + k + '</button>').join('') + '</div>' +
      (p.nuevo ? '' : '<button class="btn sec" data-a="ir" data-id="docClave" style="margin-top:16px">He olvidado el código</button>') + '</div>';
  }
};
ACC.pinTecla = async el => {
  const e = Nav.actual(), p = e.params, k = el.dataset.k;
  if (k === '⌫') p.v = p.v.slice(0, -1); else if (p.v.length < 4) p.v += k;
  p.msg = ''; Nav.refrescar(true);
  if (p.v.length < 4) return;
  const pin = p.v;
  if (p.nuevo) {
    if (!p.primero) { p.primero = pin; p.v = ''; return Nav.refrescar(true); }
    if (p.primero !== pin) { p.primero = ''; p.v = ''; p.msg = 'No coinciden. Vuelve a empezar.'; return Nav.refrescar(true); }
    await guardarConPin(p.clave, pin);
    abrirSesionDocs(p.clave);
    const seguir = p.seguir;
    Nav.atras(p.pasos || 1);
    toast('Código guardado');
    if (seguir) setTimeout(seguir, 380);
    return;
  }
  const g = await DB.get('docs:' + S.sid);
  if (g.hasta > Date.now()) { p.v = ''; p.msg = 'Demasiados intentos. Espera ' + Math.ceil((g.hasta - Date.now()) / 60000) + ' min.'; return Nav.refrescar(true); }
  try {
    const raw = await descifrar(await clavePin(pin, deb64(g.salt)), deb64(g.ct));
    g.intentos = 0; await DB.set('docs:' + S.sid, g);
    abrirSesionDocs(raw);
    const seguir = p.seguir;
    Nav.atras();
    if (seguir) setTimeout(seguir, 380);
  } catch (x) {
    g.intentos = (g.intentos || 0) + 1;
    if (g.intentos >= 5) { g.hasta = Date.now() + 5 * 60000 * Math.pow(2, g.intentos - 5); }
    await DB.set('docs:' + S.sid, g);
    p.v = ''; p.msg = g.intentos >= 5 ? 'Código incorrecto. Bloqueado unos minutos.' : 'Código incorrecto. Te quedan ' + (5 - g.intentos) + ' intentos.';
    Nav.refrescar(true);
  }
};

/* 83 · Clave de los documentos: activar, recuperar con la clave de rescate o pasarla al otro móvil */
P.docClave = {
  clase: 'con-boton', fija: true,
  html: p => {
    let h = tope('Clave de los documentos');
    if (!docsActivos()) {
      if (!p.nueva) p.nueva = crypto.getRandomValues(new Uint8Array(32));
      return h + '<p class="texto">Ronda crea una clave para cifrar los documentos de este espacio. Esta es tu <b>clave de rescate</b>: guárdala en un gestor de contraseñas o en un sitio seguro. Sin ella, si se pierden los móviles, nadie podrá abrir los documentos.</p>' +
        '<div class="card inv" style="margin-top:14px"><p class="eye">Clave de rescate</p><div class="clave">' + agrupar(aB32(p.nueva)) + '</div><div class="btns2"><button class="btn sec sm" data-a="copiarClave">Copiar</button></div></div>' +
        '<div class="row card" style="margin-top:12px"><b style="flex:1">La he guardado</b>' + swi(p.guardada, 'pTog', 'data-k="guardada"') + '</div>';
    }
    if (DOC.clave) return h + '<p class="texto">Para abrir los documentos en el móvil de otra persona del espacio, pásale esta clave (por ejemplo, por WhatsApp, y luego bórrala del chat). Esa persona la pega en Documentos › Clave y elige su código.</p>' +
      '<div class="card inv" style="margin-top:14px"><p class="eye">Clave del espacio</p><div class="clave">' + agrupar(aB32(DOC.clave)) + '</div><div class="btns2"><button class="btn sec sm" data-a="copiarClave">Copiar</button></div></div>' +
      '<button class="btn sec" data-a="cambiarPin" style="margin-top:14px">Cambiar mi código de 4 cifras</button>';
    return h + '<p class="texto">Pega la clave de rescate o la clave que te ha pasado la otra persona. Después elegirás tu código de 4 cifras para este móvil.</p>' +
      '<div class="fld fldr" style="margin-top:12px"><div class="f"><small>Clave</small><textarea id="dkC" rows="3" placeholder="XXXX-XXXX-…" autocapitalize="characters" spellcheck="false"></textarea></div><button class="mini" data-a="pegar" data-sel="#dkC">Pegar</button></div><div data-r="err"></div>';
  },
  fijo: p => '<div class="btns">' + (!docsActivos() ? btn('Seguir', 'activarDocs') : DOC.clave ? btn('Listo', 'atras', 'sec') : btn('Usar esta clave', 'usarClave')) + '</div>'
};
ACC.copiarClave = async () => { const p = Nav.actual().params; const k = p.nueva && !docsActivos() ? p.nueva : DOC.clave; toast(await copiar(agrupar(aB32(k))) ? 'Clave copiada' : 'No he podido copiar'); };
ACC.activarDocs = async () => {
  const p = Nav.actual().params;
  if (!p.guardada) return toast('Primero guarda la clave de rescate y marca «La he guardado».');
  const verif = await cifrar(p.nueva, new TextEncoder().encode('ronda'));
  cambiar('ajustes', 'docs', { verif: b64(verif), activado: Date.now(), por: S.cfg.persona });
  Nav.ir('pin', { nuevo: true, clave: p.nueva, pasos: 2, seguir: p.seguir });
};
ACC.usarClave = async () => {
  const p = Nav.actual().params, raw = deB32(val('dkC'));
  const err = $('[data-r="err"]', Nav.actual().el);
  if (!raw || raw.length !== 32) return mostrarError(err, 'La clave no está completa. Son 13 grupos de letras y números.');
  if (!await comprobarClave(raw)) return mostrarError(err, 'Esa no es la clave de este espacio.');
  Nav.ir('pin', { nuevo: true, clave: raw, pasos: 2, seguir: p.seguir });
};
ACC.cambiarPin = () => Nav.ir('pin', { nuevo: true, clave: DOC.clave, pasos: 1 });
