/* ===================== 0.3.6 · ARRANQUE: la animación de la app de siempre =====================
   Copiada tal cual de la 1.7.3 (03_ui.js y 05_pantallas.js): los mismos tiempos, el mismo movimiento de las bolas, la misma
   espera a que esté la letra (que es justo lo que tarda el iPhone en enseñar la pantalla) y el mismo fundido al irse.
   Solo cambia:
   - la letra: Inter Display (la de la app nueva) en vez de Nunito, con la «R» mayúscula de la marca nueva;
   - los colores de las bolas: los del logo nuevo, con un brillo muy suave arriba a la izquierda;
   - el fondo: el de Inicio. */

/* Medidas fijas de la «o» de Inter Display 600 (por cada px de letra), sacadas de la fuente */
function medirLogo(cont, topPx, fs) {
  const mo = { width: 0.570 * fs, actualBoundingBoxLeft: -0.031 * fs, actualBoundingBoxRight: 0.540 * fs, actualBoundingBoxAscent: 0.527 * fs, actualBoundingBoxDescent: 0.012 * fs };
  const oW = mo.actualBoundingBoxLeft + mo.actualBoundingBoxRight, oH = mo.actualBoundingBoxAscent + mo.actualBoundingBoxDescent;
  const sb = (mo.width - oW) / 2, D = oH * 1.15, padL = sb + 0.06 * fs, padR = sb + 0.01 * fs;
  cont.innerHTML = '<div class="rn-logo36" style="top:' + topPx + 'px;font-size:' + fs + 'px"><span style="position:relative;display:inline-block"><span class="l">R</span><span class="ph" style="display:inline-block;height:1px;width:' + (padL + D + padR) + 'px"></span><i class="bl" style="display:inline-block;width:0;height:0"></i><span class="l">n</span><span class="l">d</span><span class="l">a</span></span></div><svg class="anillo"></svg>';
  const cr = cont.getBoundingClientRect(), p = $('.ph', cont).getBoundingClientRect(), bl = $('.bl', cont).getBoundingClientRect();
  const FAC = (37.5 + 10.4) * 2 / 100;
  return { cx: p.left - cr.left + padL + D / 2, cy: bl.bottom - cr.top - (mo.actualBoundingBoxAscent - mo.actualBoundingBoxDescent) / 2, S: D / FAC };
}
/* El brillo: un toque de luz suave en cada bola */
const RN_BRILLO_DEF = '<defs><radialGradient id="rn-br36" cx=".34" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>';
const rnBola36 = (x, y, r, i) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + RN_LOGO[i] + '"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#rn-br36)"/>';
function dibujarAnillo(svg, t, T, START) {
  const m = io(cl((t - T0) / TM));
  const cx = START.cx + (T.cx - START.cx) * m, cy = START.cy + (T.cy - START.cy) * m, Sx = START.S + (T.S - START.S) * m, k = Sx / 100;
  let o = '';
  const rot = -110 * (1 - oC(cl((t - 0.2) / 1.6)));
  for (let i = 0; i < 8; i++) {
    const t0 = 0.35 + i * 0.12, p = cl((t - t0) / 0.55), e = oB(p), R = 37.5 * e, a = (i * 45 + rot) * Math.PI / 180;
    let s = cl(p * 2.2) * (0.55 + 0.45 * Math.min(1.25, e));
    const wv = cl((t - 1.9 - i * 0.07) / 0.5); s *= 1 + 0.16 * Math.sin(wv * Math.PI) * (1 - m);
    const q = cl((t - t0 - 0.28) / 0.6);
    if (q > 0 && q < 1 && m === 0) o += '<circle cx="' + (37.5 * Math.sin(a)).toFixed(2) + '" cy="' + (-37.5 * Math.cos(a)).toFixed(2) + '" r="' + (10.4 + 16 * oC(q)).toFixed(2) + '" fill="' + RN_LOGO[i] + '" opacity="' + (0.28 * (1 - q)).toFixed(3) + '"/>';
    if (p > 0) o += rnBola36((R * Math.sin(a)).toFixed(2), (-R * Math.cos(a)).toFixed(2), (10.4 * Math.max(s, 0)).toFixed(3), i);
  }
  svg.innerHTML = RN_BRILLO_DEF + '<g transform="translate(' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ') scale(' + k.toFixed(4) + ')">' + o + '</g>';
}
function dibujarAnilloRapido(svg, t, T) {
  const k = T.S / 100, rot = -90 * (1 - oC(cl(t / 0.95)));
  let o = '';
  for (let i = 0; i < 8; i++) {
    const t0 = 0.05 + i * 0.065, p = cl((t - t0) / 0.38), e = oB(p), R = 37.5 * e, a = (i * 45 + rot) * Math.PI / 180;
    const s = cl(p * 2.4) * (0.6 + 0.4 * Math.min(1.25, e));
    const q = cl((t - t0 - 0.2) / 0.45);
    if (q > 0 && q < 1) o += '<circle cx="' + (37.5 * Math.sin(a)).toFixed(2) + '" cy="' + (-37.5 * Math.cos(a)).toFixed(2) + '" r="' + (10.4 + 12 * oC(q)).toFixed(2) + '" fill="' + RN_LOGO[i] + '" opacity="' + (0.3 * (1 - q)).toFixed(3) + '"/>';
    if (p > 0) o += rnBola36((R * Math.sin(a)).toFixed(2), (-R * Math.cos(a)).toFixed(2), (10.4 * Math.max(s, 0)).toFixed(3), i);
  }
  svg.innerHTML = RN_BRILLO_DEF + '<g transform="translate(' + T.cx.toFixed(2) + ' ' + T.cy.toFixed(2) + ') scale(' + k.toFixed(4) + ')">' + o + '</g>';
}
/* Igual que en la 1.7.3; solo cambia la letra que se espera */
function animarArranque(modo) {
  return new Promise(async ok => {
    const ar = $('#arranque');
    try { await Promise.race([document.fonts.load('600 88px "Inter Display"').then(() => document.fonts.ready), espera(3000)]); } catch (e) { }
    let W, H, fs, T, svg, letras, CY;
    const montar = () => {
      W = innerWidth; H = innerHeight;
      fs = Math.round(88 * Math.min(1, W / 390));
      CY = centroPantalla(H);
      if (modo === 'b') T = medirLogo(ar, Math.round(H * 318 / 844), fs);
      else { const t0 = medirLogo(ar, 0, fs); T = medirLogo(ar, Math.round(CY - t0.cy), fs); }
      svg = $('svg.anillo', ar);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      letras = $$('.l', ar);
    };
    montar();
    let remedido = false;
    const START = { cx: W / 2, cy: modo === 'b' ? H * 422 / 844 : CY, S: 200 * Math.min(1, W / 390) };
    const K = modo === 'b' ? 1 : 2;
    const FIN = T0 + 0.3 + 3 * 0.1 + 0.55 + 0.25;
    if (REDUCIR) { dibujarAnillo(svg, 10, T, T); letras.forEach(l => { l.style.opacity = 1; }); await espera(500); return ok(); }
    const t0 = performance.now();
    if (modo !== 'b') {
      const rapido = now => {
        const t = (now - t0) / 1000 * 1.333;
        if (now - t0 < 450) { try { const h0 = H; W = innerWidth; H = innerHeight; if (H !== h0) montar(); } catch (e) { } }
        dibujarAnilloRapido(svg, t, T);
        letras.forEach((l, i) => { const p = oC(cl((t - i * 0.05) / 0.4)); l.style.opacity = p; l.style.transform = 'translateY(' + (10 * (1 - p)) + 'px)'; });
        if (t < 1.0) requestAnimationFrame(rapido); else { dibujarAnilloRapido(svg, 2, T); letras.forEach(l => { l.style.opacity = 1; l.style.transform = ''; }); window.RN_ARR_MS = Math.round(performance.now() - t0); ok(); }
      };
      requestAnimationFrame(rapido);
      return;
    }
    const paso = now => {
      const t = (now - t0) / 1000 * K;
      if (!remedido && t >= T0 - 0.2) { remedido = true; try { if (document.fonts.check('600 88px "Inter Display"')) montar(); } catch (e) { } }
      dibujarAnillo(svg, t, T, START);
      letras.forEach((l, i) => { const p = oC(cl((t - (T0 + 0.3 + i * 0.1)) / 0.55)); l.style.opacity = p; l.style.transform = 'translateY(' + (18 * (1 - p)) + 'px)'; });
      if (t < FIN) requestAnimationFrame(paso); else { window.RN_ARR_MS = Math.round(performance.now() - t0); ok(); }
    };
    requestAnimationFrame(paso);
  });
}
/* Igual que en la 1.7.3: la app se funde suavemente mientras se va la animación */
function quitarArranque() {
  const ar = $('#arranque'); if (!ar) return;
  const capas = [$('#app'), $('#nav')].filter(Boolean);
  if (!REDUCIR) capas.forEach(c => c.classList.add('rn-entra'));
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ar.classList.add('rn-fuera36');
    capas.forEach(c => c.classList.add('rn-ya'));
    setTimeout(() => { capas.forEach(c => c.classList.remove('rn-entra', 'rn-ya')); }, 850);
  }));
  setTimeout(() => ar.remove(), 750);
}
/* El arranque de la app nueva (ejemplo o casa), con la animación de siempre */
async function rnArrancar() {
  aplicarTema();
  try { localStorage.setItem('rondaP-bienvenida', '1'); } catch (e) { }
  const modo = (!EN_CASA && !rnModoElegido()) ? 'b' : 'l';
  const anim = $('#arranque') ? animarArranque(modo) : Promise.resolve();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(e => anotar('sw', e));
  let destino = 'inicio';
  if (EN_CASA) {
    const ok = await cargarCasa();
    if (!ok) { try { localStorage.removeItem('rondaP-modo'); localStorage.removeItem('rondaP-casa'); } catch (e) { } location.reload(); return; }
    let onb = ''; try { onb = localStorage.getItem('rondaP-onb-pend') || ''; } catch (e) { }
    if (onb) destino = 'onb';
  } else {
    await cargarPrueba();
    if (!rnModoElegido()) destino = 'bienvenida';
  }
  await anim;
  Nav.raiz(destino, destino === 'onb' ? { paso: 0 } : {});
  RN_ARRANCANDO = false;
  quitarArranque();
}
