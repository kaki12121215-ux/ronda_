/* RONDA · prueba del diseño nuevo · service worker: abre sin conexión y recibe versiones nuevas.
   OJO: la app real está en el mismo dominio y comparte la caché del navegador. Esta prueba usa nombres que
   empiezan por «prueba_ronda_» y solo borra los suyos: nunca toca las cachés «ronda-…» de la app real. */
const VERSION = 'prueba_ronda_0.2.1';
const ARCHIVOS = ['./', 'index.html', 'ronda.css', 'app.js', 'manifest.webmanifest',
  'fonts/inter-400.woff', 'fonts/inter-500.woff', 'fonts/inter-600.woff', 'fonts/inter-700.woff', 'fonts/inter-display-600.woff', 'fonts/inter-display-700.woff',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-32.png'];
/* Cada archivo por separado: si falta uno, la actualización sigue con los demás */
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION)
  .then(c => Promise.all(ARCHIVOS.map(a => fetch(a, { cache: 'no-cache' }).then(r => r.ok ? c.put(a, r) : null).catch(() => null))))
  .then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k.indexOf('prueba_ronda_') === 0 && k !== VERSION).map(k => caches.delete(k))))
  .then(() => self.clients.claim())));
/* Primero la red (para ver siempre lo último) y, sin conexión, lo guardado */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || e.request.headers.has('range')) return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' })
    .then(r => { if (r.ok && r.status === 200) { const c = r.clone(); caches.open(VERSION).then(k => k.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })
      .then(r => r || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined))
      .then(r => r || new Response('', { status: 504 }))));
});
