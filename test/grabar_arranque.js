/* Graba la animación del arranque (la larga de la primera vez y la corta) en claro y en oscuro.
   node test/grabar_arranque.js  → test/capturas3/arranque_*.webm (luego se pasan a MP4 con ffmpeg) */
const { chromium } = require('playwright');
const fs = require('fs');
const { arrancar } = require('./servidor');
const C = __dirname + '/capturas3/';
const espera = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const s = arrancar(8170); const b = await chromium.launch();
  for (const osc of [false, true]) for (const larga of [true, false]) {
    const m = (larga ? 'primera_vez' : 'normal') + '_' + (osc ? 'oscuro' : 'claro');
    const dir = C + 'v_' + m;
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: osc ? 'dark' : 'light', recordVideo: { dir, size: { width: 780, height: 1688 } } });
    const p = await ctx.newPage();
    if (!larga) await ctx.addInitScript(() => { try { localStorage.setItem('rondaP-bienvenida', '1'); } catch (e) { } });
    await p.goto('http://localhost:8170/');
    await espera(larga ? 6800 : 2600);
    await ctx.close();
    const f = fs.readdirSync(dir).find(x => x.endsWith('.webm'));
    fs.renameSync(dir + '/' + f, C + 'arranque_' + m + '.webm'); fs.rmdirSync(dir);
  }
  await b.close(); s.close();
})();
