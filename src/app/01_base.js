/* ============================ BASE ============================ */
const VERSION = '0.3.5';  /* prueba del diseño nuevo */
/* 0.3.0: dos modos. «ejemplo» (datos de mentira, como hasta ahora) o «casa» (la hoja de Google de verdad, con el mismo script).
   Cada modo guarda en su propio almacén del móvil: así los datos de ejemplo nunca se mezclan con los de casa. */
const MODO = (() => { try { return localStorage.getItem('rondaP-modo') === 'casa' ? 'casa' : 'ejemplo'; } catch (e) { return 'ejemplo'; } })();
const EN_CASA = MODO === 'casa';
const PREF_LS = EN_CASA ? 'rondaPC:' : 'rondaP:';
const MIN_SCRIPT = '1.4.0';
const COL = ['#F0674B', '#F2B824', '#A6C93A', '#2E8B57', '#2BB5B0', '#3C78C8', '#9B86E0', '#EE8AA8'];
const NOMCOL = ['Coral', 'Limón', 'Lima', 'Verde', 'Turquesa', 'Azul', 'Lavanda', 'Rosa'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const REDUCIR = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const dosd = n => String(n).padStart(2, '0');
const hora = d => dosd(d.getHours()) + ':' + dosd(d.getMinutes());
const fechaLarga = d => cap(DIAS[d.getDay()]) + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];
const fechaCorta = d => d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear();
const sinAcentos = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const espera = ms => new Promise(r => setTimeout(r, ms));
const nomColor = c => NOMCOL[COL.indexOf(String(c || '').toUpperCase())] || 'sin color';
const verNum = v => String(v || '0').split('.').map(Number).reduce((a, x) => a * 1000 + (x || 0), 0);

function haceRato(ts) {
  if (!ts) return 'todavía no';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 20) return 'hace un momento';
  if (s < 90) return 'hace un minuto';
  if (s < 3600) return 'hace ' + Math.round(s / 60) + ' minutos';
  const d = new Date(ts), h = new Date();
  return (d.toDateString() === h.toDateString() ? 'hoy' : d.getDate() + ' de ' + MESES[d.getMonth()]) + ' a las ' + hora(d);
}

/* ---------- registro de errores (para «Comprobaciones») */
const REG = [];
function anotar(donde, e) {
  const m = (e && (e.message || e)) + '';
  REG.unshift(hora(new Date()) + ' · ' + donde + ' · ' + m.slice(0, 300));
  REG.length = Math.min(REG.length, 40);
  try { localStorage.setItem('rondaP-registro', JSON.stringify(REG)); } catch (x) { }
}
try { JSON.parse(localStorage.getItem('rondaP-registro') || '[]').forEach(x => REG.push(x)); } catch (e) { }
window.addEventListener('error', e => anotar('js', e.message + ' (' + (e.filename || '').split('/').pop() + ':' + e.lineno + ')'));
window.addEventListener('unhandledrejection', e => anotar('promesa', e.reason));

/* ---------- almacén local: IndexedDB, y si falla, localStorage, y si falla, memoria */
const DB = {
  db: null, modo: 'memoria', mem: {},
  abrir() {
    return new Promise(ok => {
      let hecho = false;
      const fin = m => { if (!hecho) { hecho = true; this.modo = m; ok(); } };
      setTimeout(() => fin(this.lsOk() ? 'local' : 'memoria'), 2500);
      try {
        const r = indexedDB.open(EN_CASA ? 'ronda_prueba_casa' : 'ronda_prueba', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => { this.db = r.result; fin('idb'); };
        r.onerror = () => fin(this.lsOk() ? 'local' : 'memoria');
      } catch (e) { fin(this.lsOk() ? 'local' : 'memoria'); }
    });
  },
  lsOk() { try { localStorage.setItem('rondaP-x', '1'); localStorage.removeItem('rondaP-x'); return true; } catch (e) { return false; } },
  tx(m, f) {
    return new Promise((ok, ko) => {
      try { const t = this.db.transaction('kv', m); const r = f(t.objectStore('kv')); t.oncomplete = () => ok(r && r.result); t.onerror = () => ko(t.error); t.onabort = () => ko(t.error); } catch (e) { ko(e); }
    });
  },
  async get(k) {
    if (k in this.mem) return this.mem[k];
    try {
      if (this.modo === 'idb') return await this.tx('readonly', s => s.get(k));
      if (this.modo === 'local') { const v = localStorage.getItem(PREF_LS + k); return v ? JSON.parse(v) : undefined; }
    } catch (e) { anotar('leer ' + k, e); }
    return undefined;
  },
  async set(k, v) {
    this.mem[k] = v;
    try {
      if (this.modo === 'idb') await this.tx('readwrite', s => s.put(v, k));
      else if (this.modo === 'local') localStorage.setItem(PREF_LS + k, JSON.stringify(v));
    } catch (e) { anotar('guardar ' + k, e); }
  },
  async del(k) {
    delete this.mem[k];
    try {
      if (this.modo === 'idb') await this.tx('readwrite', s => s.delete(k));
      else if (this.modo === 'local') localStorage.removeItem(PREF_LS + k);
    } catch (e) { anotar('borrar ' + k, e); }
  }
};

/* ---------- estado */
const S = {
  cfg: null,          /* { url, token, persona, rol, sid } */
  recs: {},           /* col › id › { f, t, rev, por } */
  seq: 0, sid: '',
  cola: {},           /* 'col|id' › { id, col, f, t, v } cambios sin enviar */
  sv: '', cal: null,
  red: { ok: true, ultimo: 0, error: null, enviando: false },
  imgs: {},           /* fid › dataURL */
  alta: null          /* datos mientras se crea o se une a un espacio */
};

let guardarT = null;
function guardarLocalReal(ya) {
  clearTimeout(guardarT);
  const f = () => { DB.set('datos', { recs: S.recs, seq: S.seq, sid: S.sid }); DB.set('cola', S.cola); };
  if (ya) f(); else guardarT = setTimeout(f, 250);
}

/* ---------- llamadas al script */
function ErrR(code, msg) { const e = new Error(msg); e.code = code; e.ronda = true; return e; }

async function apiReal(a, extra, opts) {
  opts = opts || {};
  const url = opts.url || (S.cfg && S.cfg.url);
  if (!url) throw ErrR('config', 'Este móvil no está conectado a ningún espacio.');
  const cuerpo = Object.assign({ a: a }, extra || {});
  if (!opts.sinToken && S.cfg && S.cfg.token) cuerpo.t = S.cfg.token;
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), opts.ms || 40000); /* más que lo que espera el script (8 s) y que su trabajo normal */
  let txt = '';
  try {
    /* Sin cabeceras: así el navegador no hace la consulta previa (CORS) que Apps Script no admite. */
    const r = await fetch(url, { method: 'POST', body: JSON.stringify(cuerpo), signal: ctl.signal, redirect: 'follow', cache: 'no-store' });
    txt = await r.text();
    if (!r.ok && !txt) throw ErrR('red', 'Google ha respondido con un error ' + r.status + '.');
  } catch (e) {
    if (e.ronda) { anotar(a, e); throw e; }
    let err;
    if (e.name === 'AbortError') err = ErrR('tiempo', 'El script no ha respondido a tiempo. Vuelve a intentarlo en un momento.');
    else if (navigator.onLine === false) err = ErrR('sinred', 'Sin conexión. Se guardará al volver.');
    else err = ErrR('red', 'No consigo llegar al script. Si tienes conexión, revisa que la implementación tenga «Quién tiene acceso: Cualquier usuario» y que la dirección acabe en /exec.');
    anotar(a, err.message + ' [' + (e.message || e.name) + ']');
    throw err;
  } finally { clearTimeout(to); }
  let j;
  try { j = JSON.parse(txt); } catch (e) {
    const login = /accounts\.google|ServiceLogin|Iniciar sesi|Sign in/i.test(txt);
    const err = ErrR('html', login ? 'Google pide iniciar sesión: la implementación no tiene «Quién tiene acceso: Cualquier usuario».' : 'Google ha devuelto una página en vez de datos. Suele ser que faltan permisos: ejecuta «configurar» en el script, marca «Seleccionar todo» y haz «Nueva versión».');
    anotar(a, err.message + ' [' + txt.slice(0, 80).replace(/\s+/g, ' ') + ']');
    throw err;
  }
  if (j.sv) S.sv = j.sv;
  if (!j.ok) { const err = ErrR(j.code || 'script', j.error || 'El script ha dado un error.'); anotar(a, err.message); throw err; }
  return j;
}

/* Dirección del script: acepta la /exec entera o solo el identificador. */
function urlScript(txt) {
  const s = String(txt || '').trim();
  if (/\/dev(\?|$)/.test(s)) return { error: 'Esa es la dirección de pruebas (acaba en /dev). Copia la de la implementación, que acaba en /exec.' };
  const m = s.match(/script\.google\.com\/(?:a\/[^/]+\/)?macros\/s\/([A-Za-z0-9_-]{20,})\/exec/);
  if (m) return { url: s.split('?')[0].split('#')[0], id: m[1] };
  if (/^[A-Za-z0-9_-]{40,}$/.test(s)) return { url: 'https://script.google.com/macros/s/' + s + '/exec', id: s };
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(s)) return { url: s, id: s }; /* solo para las pruebas */
  return { error: 'No parece la dirección del script. Tiene que empezar por https://script.google.com/macros/s/ y acabar en /exec.' };
}

/* Invitación: RONDA1-<base64 de {u, c, n}> */
function crearPaquete(codigo) {
  const d = { u: S.cfg.url, c: codigo.replace('-', ''), n: (dato('espacio', 'espacio') || {}).nombre || '' };
  const m = d.u.match(/macros\/s\/([^/]+)\/exec/);
  if (m) d.u = m[1];
  return 'RONDA1-' + btoa(unescape(encodeURIComponent(JSON.stringify(d)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function leerPaquete(txt) {
  const m = String(txt || '').replace(/\s+/g, '').match(/RONDA1-([A-Za-z0-9_-]+)/);
  if (!m) return { error: 'No encuentro el código. Tiene que empezar por RONDA1-. Cópialo entero y pégalo otra vez.' };
  try {
    let b = m[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) b += '=';
    const d = JSON.parse(decodeURIComponent(escape(atob(b))));
    const u = /^https?:/.test(d.u) ? d.u : 'https://script.google.com/macros/s/' + d.u + '/exec';
    return { url: u, codigo: String(d.c || ''), espacio: d.n || '' };
  } catch (e) { return { error: 'El código está incompleto. Cópialo entero (es largo) y pégalo otra vez.' }; }
}

/* ---------- datos */
function dato(col, id) { const r = S.recs[col] && S.recs[col][id]; return r && !r.f._b ? Object.assign({ id: id }, r.f) : null; }
function lista(col) {
  const m = S.recs[col] || {};
  const l = Object.keys(m).filter(id => !m[id].f._b).map(id => Object.assign({ id: id, _rev: m[id].rev, _por: m[id].por }, m[id].f));
  /* 1.7.1: las tareas «Solo para mí» de otro no salen en ningún sitio */
  if (col === 'tareas') { const yo = S.cfg && S.cfg.persona; return l.filter(x => !x.solo || x.solo === yo); }
  return l;
}
function personas() { return lista('personas').sort((a, b) => (a.alta || 0) - (b.alta || 0)); }
function yo() { return S.cfg ? dato('personas', S.cfg.persona) : null; }
function esAdmin() { return S.cfg && S.cfg.rol === 'admin'; }
function espacio() { return dato('espacio', 'espacio') || { nombre: 'Nuestra casa', tipo: 'hogar', color: COL[4] }; }

/* Cambio hecho en este móvil: se aplica al momento y entra en la cola de envío. */
function cambiar(col, id, campos) {
  const ahora = Date.now();
  S.recs[col] = S.recs[col] || {};
  const r = S.recs[col][id] || (S.recs[col][id] = { f: {}, t: {}, rev: 0, por: S.cfg && S.cfg.persona });
  const k = col + '|' + id;
  const op = S.cola[k] || (S.cola[k] = { id: id, col: col, f: {}, t: {}, v: 0 });
  Object.keys(campos).forEach(c => { r.f[c] = campos[c]; r.t[c] = ahora; op.f[c] = campos[c]; op.t[c] = ahora; });
  op.v++;
  guardarLocal();
  Sync.pronto();
}
