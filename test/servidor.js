/* Servidor de pruebas: sirve docs/ en un puerto. node test/servidor.js 8130 */
const http = require('http'), fs = require('fs'), path = require('path');
const WEB = path.resolve(__dirname, '../docs');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff': 'font/woff', '.txt': 'text/plain' };
function arrancar(puerto) {
  return http.createServer((q, r) => {
    let f = decodeURIComponent(q.url.split('?')[0]);
    if (f.endsWith('/')) f += 'index.html';
    const ruta = path.join(WEB, f);
    if (!ruta.startsWith(WEB) || !fs.existsSync(ruta)) { r.writeHead(404); return r.end('no'); }
    r.writeHead(200, { 'Content-Type': TIPOS[path.extname(ruta)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(ruta).pipe(r);
  }).listen(puerto);
}
module.exports = { arrancar };
if (require.main === module) arrancar(+process.argv[2] || 8130);
