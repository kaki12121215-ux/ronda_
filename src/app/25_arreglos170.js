/* ===================== 1.7.0 · Arreglos del feedback ===================== */

/* ---------- Subida directa a Drive (feedback): rápida y sin juntar trozos ----------
   El script (1.7.0) pide a Google un enlace de subida de un solo uso para este archivo y el móvil lo sube ahí.
   Si el script es antiguo o la subida directa falla, se usa la de siempre (hasta 20 MB). */
function subirDirecto(blob, url, progreso) {
  return new Promise((ok, mal) => {
    const x = new XMLHttpRequest();
    x.open('PUT', url);
    x.setRequestHeader('Content-Type', blob.type || 'application/octet-stream');
    x.timeout = 15 * 60 * 1000;
    if (progreso) x.upload.onprogress = e => { if (e.lengthComputable) progreso(e.loaded / e.total); };
    x.onload = () => {
      if (x.status !== 200 && x.status !== 201) return mal(Object.assign(new Error('Google ha contestado ' + x.status), { code: 'directa' }));
      let id = ''; try { id = JSON.parse(x.responseText).id; } catch (e) { }
      id ? ok(id) : mal(Object.assign(new Error('Google no ha devuelto el archivo'), { code: 'directa' }));
    };
    x.onerror = () => mal(Object.assign(new Error('Sin conexión con Google'), { code: 'directa' }));
    x.ontimeout = () => mal(Object.assign(new Error('La subida ha tardado demasiado'), { code: 'directa' }));
    x.send(blob);
  });
}
async function subirRapido(blob, nombre, opts) {
  opts = opts || {};
  let ses = null;
  try { ses = await api('archivo-sesion', { nombre: nombre, tipo: blob.type || 'application/octet-stream', bytes: blob.size, origen: location.origin }, { ms: 30000 }); }
  catch (e) { if (e.code === 'token' || e.code === 'sinred') throw e; ses = null; }
  if (ses && ses.url) {
    try { const fid = await subirDirecto(blob, ses.url, opts.progreso); if (opts.progreso) opts.progreso(1); return { fid: fid, bytes: blob.size, directa: true }; }
    catch (e) { if (blob.size > 20 * 1024 * 1024) throw e; }
  }
  if (blob.size > 20 * 1024 * 1024) throw Object.assign(new Error('Para archivos de más de 20 MB hay que actualizar el script de Google a la 1.7.0.'), { code: 'archivo' });
  return subirArchivo(blob, nombre, opts);
}

/* ---------- Mantener pulsado «Más»: sin el menú del iPhone y, al soltar sin elegir, se cierra ---------- */
mrSoltarFuera = () => mrCerrar();

/* ---------- Plantas: de menos agua a más (panel de Plantas y tarjeta de Inicio) ---------- */
function ordenAgua(l) { return l.slice().sort((a, b) => nivelAgua(a) - nivelAgua(b) || (a.proximo || '9').localeCompare(b.proximo || '9') || String(a.nombre).localeCompare(String(b.nombre), 'es')); }

/* ---------- Iconos de Menú: solo líneas, como los demás ---------- */
ICONOS['modulo-menu-semanal'] = ['<circle cx="12.5" cy="12.5" r="5.8"/><path d="M2.5 3.5v4.5a1.6 1.6 0 0 0 1.6 1.6V20.5"/><path d="M5.7 3.5v4.5a1.6 1.6 0 0 1-1.6 1.6"/><path d="M21.5 20.5V3.5c-1.7 1.4-2.3 3.8-2.3 6.6"/>', [[12.5, 12.5, 'c']]];
ICONOS['menu-comida'] = ['<circle cx="15" cy="12.5" r="7.5"/><path d="M2.5 4v5.5a1.8 1.8 0 0 0 1.8 1.8V20.5"/><path d="M6 4v5.5a1.8 1.8 0 0 1-1.7 1.8"/>', [[15, 12.5, 'c']]];

Object.assign(window.RONDA || (window.RONDA = {}), { subirRapido: subirRapido, ordenAgua: ordenAgua, bajarArchivo: bajarArchivo });
