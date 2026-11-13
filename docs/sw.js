/* RONDA · prueba del diseño nuevo · service worker: abre sin conexión y recibe versiones nuevas.
   OJO: la app real está en el mismo dominio y comparte la caché del navegador. Esta prueba usa nombres que
   empiezan por «prueba_ronda_» y solo borra los suyos: nunca toca las cachés «ronda-…» de la app real. */
const VERSION = 'prueba_ronda_0.3.7';
const ARCHIVOS = ['./', 'index.html', 'ronda.css', 'app.js', 'manifest.webmanifest',
  'fonts/inter-400.woff', 'fonts/inter-500.woff', 'fonts/inter-600.woff', 'fonts/inter-700.woff', 'fonts/inter-display-600.woff', 'fonts/inter-display-700.woff',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-32.png', 'lista.html'];
/* Cada archivo por separado: si falta uno, la actualización sigue con los demás */
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION)
  .then(c => Promise.all(ARCHIVOS.map(a => fetch(a, { cache: 'no-cache' }).then(r => r.ok ? c.put(a, r) : null).catch(() => null))))
  .then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k.indexOf('prueba_ronda_') === 0 && k !== VERSION).map(k => caches.delete(k))))
  .then(() => self.clients.claim())));
/* 0.3.3: primero lo guardado en el móvil (la app abre al momento, sin esperar a internet). Cada versión se guarda entera
   al instalarse (arriba), con su nombre; al activarse borra la anterior y la app se recarga sola con la nueva.
   Lo que no esté guardado se pide a la red y se guarda. */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || e.request.headers.has('range')) return;
  e.respondWith(caches.open(VERSION).then(c => c.match(e.request, { ignoreSearch: true })
    .then(r => r || (e.request.mode === 'navigate' ? c.match('index.html') : undefined))
    .then(r => r || fetch(e.request, { cache: 'no-cache' }).then(n => { if (n.ok && n.status === 200) c.put(e.request, n.clone()); return n; }))
    .catch(() => new Response('', { status: 504 }))));
});
