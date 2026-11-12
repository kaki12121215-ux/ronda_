/* ============================ SINCRONIZACIÓN ============================
   - Todo cambio se hace al momento en el móvil y entra en la cola.
   - La cola se envía a Google en orden; si falla, se reintenta más tarde.
   - Al traer cambios se juntan campo a campo: nunca se pisa algo que todavía no se ha enviado.
   - Mientras la app está abierta, pregunta cada pocos segundos (más a menudo en pantallas compartidas). */
const Sync = {
  t: null, corriendo: false, otra: false, fallos: 0, ultimoOk: 0, pendT: null,
  pendientes() { return Object.keys(S.cola).length; },
  intervalo() {
    if (document.hidden) return 0;
    const p = Nav.actual();
    /* Pantallas que se usan a la vez (la compra en el súper): cada 4 s. El resto: cada 15 s. */
    const vivo = p && ['compra', 'lista', 'tareas', 'inicio', 'nota'].indexOf(p.id) >= 0;
    const base = vivo ? 4000 : 15000;
    return this.fallos ? Math.min(60000, base * Math.pow(2, this.fallos)) : base;
  },
  programar() {
    clearTimeout(this.t);
    const ms = this.intervalo();
    if (ms && S.cfg) this.t = setTimeout(() => this.ya(), ms);
  },
  pronto() { clearTimeout(this.pendT); this.pendT = setTimeout(() => this.ya(), 350); },
  async ya() {
    if (!S.cfg) return;
    if (this.corriendo) { this.otra = true; return; }
    this.corriendo = true;
    clearTimeout(this.t);
    const antes = JSON.stringify([S.red.ok, this.pendientes()]);
    try {
      const ops = Object.keys(S.cola).map(k => S.cola[k]);
      let r;
      if (ops.length) {
        S.red.enviando = true;
        const foto = ops.map(o => [o.col + '|' + o.id, o.v]);
        r = await api('guardar', { ops: ops.slice(0, 200).map(o => ({ id: o.id, col: o.col, f: o.f, t: o.t })), desde: S.seq });
        foto.slice(0, 200).forEach(x => { const o = S.cola[x[0]]; if (o && o.v === x[1]) delete S.cola[x[0]]; });
        if (r.avisos && r.avisos.length) avisosGuardar(r.avisos);
        if (ops.length > 200) this.otra = true;
      } else {
        r = await api('cambios', { desde: S.seq });
      }
      recibir(r);
      if (verNum(S.sv) < verNum(MIN_SCRIPT)) S.red.viejo = true; else S.red.viejo = false;
      S.red.ok = true; S.red.error = null; S.red.ultimo = Date.now(); this.fallos = 0;
    } catch (e) {
      S.red.ok = false; S.red.error = e;
      if (e.code === 'token') { accesoAnulado(); return; }
      /* «Ocupado»: el script atiende a otro móvil. Se reintenta enseguida sin avisar. */
      if (e.code === 'ocupado') { S.red.ok = true; S.red.error = null; this.otra = true; }
      else this.fallos = Math.min(this.fallos + 1, 5);
    } finally {
      this.corriendo = false; S.red.enviando = false;
      guardarLocal();
      if (antes !== JSON.stringify([S.red.ok, this.pendientes()])) Nav.estado();
      if (this.otra) { this.otra = false; setTimeout(() => this.ya(), 30); } else this.programar();
    }
  }
};

function recibir(r) {
  if (r.sid && S.sid && r.sid !== S.sid) {
    /* El espacio del script es otro (se ha vuelto a crear): se descarta la copia local. */
    S.recs = {}; S.seq = 0; S.sid = r.sid; Sync.otra = true;
    anotar('sync', 'El espacio ha cambiado en el script: vuelvo a descargarlo todo.');
    return;
  }
  if (r.sid) S.sid = r.sid;
  let hay = false;
  (r.cambios || []).forEach(c => {
    S.recs[c.col] = S.recs[c.col] || {};
    const n = { f: Object.assign({}, c.f), t: Object.assign({}, c.t), rev: c.rev, por: c.por };
    const op = S.cola[c.col + '|' + c.id];
    if (op) Object.keys(op.f).forEach(k => { if ((op.t[k] || 0) >= (n.t[k] || 0)) { n.f[k] = op.f[k]; n.t[k] = op.t[k]; } });
    const viejo = S.recs[c.col][c.id];
    if (!viejo || JSON.stringify(viejo.f) !== JSON.stringify(n.f)) hay = true;
    S.recs[c.col][c.id] = n;
    if (c.col === 'personas' && c.id === (S.cfg && S.cfg.persona) && n.f._b) { accesoAnulado(); }
  });
  if (r.seq > S.seq) S.seq = r.seq;
  if (hay) Nav.refrescar();
  if (Object.keys(S.recs).some(c => Object.keys(S.recs[c]).some(id => S.recs[c][id].f.calPend === (S.cfg && S.cfg.persona)))) Cal.pronto();
}

function avisosGuardar(av) {
  if (av.some(x => x.indexOf('color:') === 0)) toast('Ese color ya lo tiene otra persona. Elige otro.');
  if (av.some(x => x.indexOf('permiso:') === 0)) toast('Hay un cambio que solo puede hacer quien administra el espacio.');
}

document.addEventListener('visibilitychange', () => { if (!document.hidden) Sync.ya(); else { clearTimeout(Sync.t); guardarLocal(true); } });
window.addEventListener('online', () => { Sync.fallos = 0; Sync.ya(); });
window.addEventListener('offline', () => { S.red.ok = false; S.red.error = ErrR('sinred', 'Sin conexión'); Nav.estado(); });
window.addEventListener('pagehide', () => guardarLocal(true));

/* ---------- archivos (fotos): se reducen en el móvil y se suben por trozos */
function blobA64(blob) {
  return new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = () => ko(r.error); r.readAsDataURL(blob); });
}

/* 1.4.0: se suben varias partes a la vez (y más grandes). Cada parte vuelve con su identificador en Drive y al final
   el script las junta por identificador (antes las buscaba por nombre y a veces Drive todavía no las «veía»).
   Si una parte falla, se repite solo esa. */
async function subirArchivo(blob, nombre, opts) {
  opts = opts || {};
  const b64 = await blobA64(blob);
  const tipo = blob.type || 'application/octet-stream';
  const T = opts.trozo || 1048576;         /* múltiplo de 4: cada trozo son bytes enteros */
  const total = Math.max(1, Math.ceil(b64.length / T));
  const sid = uid().replace(/[^a-z0-9]/g, '');
  if (total === 1) { const r = await conReintentos(() => api('archivo-subir', { sid: sid, n: 0, total: 1, nombre: nombre, tipo: tipo, data: b64 }, { ms: 90000 })); if (opts.progreso) opts.progreso(1); return { fid: r.fid, trozos: 1, bytes: blob.size }; }
  const ids = new Array(total); let hechos = 0, sig = 0;
  const trabajador = async () => {
    while (sig < total) {
      const n = sig++;
      const r = await conReintentos(() => api('archivo-subir', { sid: sid, n: n, total: total, nombre: nombre, tipo: tipo, data: b64.slice(n * T, (n + 1) * T), parte: true }, { ms: 90000 }));
      ids[n] = r.tid; hechos++;
      if (opts.progreso) opts.progreso(hechos / (total + 1));
    }
  };
  await Promise.all([0, 1, 2, 3].slice(0, Math.min(4, total)).map(trabajador));
  const r = await conReintentos(() => api('archivo-unir', { sid: sid, ids: ids, total: total, nombre: nombre, tipo: tipo }, { ms: 120000 }));
  if (opts.progreso) opts.progreso(1);
  return { fid: r.fid, trozos: total, bytes: blob.size };
}
async function conReintentos(f) {
  for (let intento = 0; ; intento++) {
    try { return await f(); }
    catch (e) { if (intento >= 3 || e.code === 'token' || e.code === 'archivo') throw e; await espera(1200 * (intento + 1)); }
  }
}

async function bajarArchivo(fid, opts) {
  opts = opts || {};
  const partes = [];
  let desde = 0, total = 1, tipo = '';
  while (desde < total) {
    /* Si Google devuelve una página o tarda, se reintenta con trozos más pequeños. */
    let r, largo = opts.largo || 1572864;
    for (let intento = 0; ; intento++) {
      try { r = await api('archivo-leer', { fid: fid, desde: desde, largo: largo }, { ms: 60000 }); break; }
      catch (e) { if (intento >= 2 || e.code === 'token' || e.code === 'archivo' || e.code === 'sinred') throw e; largo = Math.max(196608, Math.floor(largo / 2 / 3) * 3); await espera(1200 * (intento + 1)); }
    }
    const bin = atob(r.data), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    partes.push(u); desde += u.length; total = r.total; tipo = r.tipo;
    if (!u.length) break;
  }
  return new Blob(partes, { type: tipo });
}

const bajando = {};
function imagen(fid) {
  if (!fid) return null;
  if (S.imgs[fid]) return S.imgs[fid];
  if (!bajando[fid]) {
    bajando[fid] = (async () => {
      try {
        let d = await DB.get('img:' + fid);
        if (!d) {
          const b = await bajarArchivo(fid);
          d = await new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(b); });
          DB.set('img:' + fid, d);
        }
        S.imgs[fid] = d;
        Nav.refrescar();
      } catch (e) { anotar('foto', e); setTimeout(() => { delete bajando[fid]; }, 30000); }
    })();
  }
  return null;
}

/* Reduce una imagen en el móvil: lado mayor como mucho «max» píxeles. */
function cargarImagen(file) {
  return new Promise((ok, ko) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => ok({ img: img, url: url });
    img.onerror = () => { URL.revokeObjectURL(url); ko(new Error('No puedo abrir esa imagen.')); };
    img.src = url;
  });
}
async function reducir(file, max, calidad) {
  const { img, url } = await cargarImagen(file);
  const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return new Promise(ok => c.toBlob(ok, 'image/jpeg', calidad || 0.85));
}
