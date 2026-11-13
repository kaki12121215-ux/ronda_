/* ===================== 0.3.0 · ARRANQUE · opción A: «R◯nda» =====================
   La palabra «Ronda» en Inter Display con el anillo de puntos en el sitio de la «o».
   - Las letras van como trazos sacados de la fuente (medidas fijas, sin canvas y sin medir texto: error A4).
     Así no depende de que la fuente haya cargado y la palabra queda siempre en el centro de la pantalla física.
   - La primera vez, la larga: las bolas salen girando en el centro, laten, y el anillo se encoge hasta su sitio en la «o»
     mientras aparecen R, n, d, a. Termina en «R◯nda». Las demás veces, la corta de 0,75 s.
   - Con «Reducir movimiento», solo fundidos. */
const RN_PAL_TRAZOS = ["<path transform=\"translate(0 0)\" d=\"M111 0H419V521H689C690 521 691 521 692 521L956 0H1286L987 579C1154 656 1253 804 1253 1001C1253 1301 1043 1490 707 1490H111ZM419 768V1234H688C851 1234 952 1143 952 1001C952 859 851 768 689 768Z\"/>","<path transform=\"translate(2470 0)\" d=\"M399 587C399 751 484 824 606 824C729 824 800 749 800 607V0H1094V661C1094 928 949 1078 724 1078C572 1078 465 1010 394 890V1056H104V0H399Z\"/>","<path transform=\"translate(3669 0)\" d=\"M515 -22C654 -22 767 39 828 162H829V0H1119V1490H825V910H824C756 1024 650 1078 513 1078C243 1078 58 853 58 529C58 198 239 -22 515 -22ZM591 218C448 218 355 331 355 529C355 727 448 840 591 840C740 840 839 717 839 529C839 340 740 218 591 218Z\"/>","<path transform=\"translate(4893 0)\" d=\"M427 -18C589 -18 680 46 736 149H740V0H1028V716C1028 942 862 1078 573 1078C283 1078 111 940 98 722H375C382 803 454 859 564 859C672 859 737 805 737 727V720C737 652 669 643 476 624C256 604 64 536 64 298C64 87 216 -18 427 -18ZM509 187C410 187 346 231 346 306C346 390 426 429 527 444C622 459 705 473 739 492V386C739 272 651 187 509 187Z\"/>"];
const RN_PAL = { vx: 96, vy: -1505, vw: 5840, vh: 1550, ox: 1875.5, oy: -528, cx: 3016, cy: -733, rc: 431, rd: 105 };
const RN_PAL_PX = 76;                                  /* tamaño de letra en pantalla */
const rnPalAncho = () => (RN_PAL.vw / 2048 * RN_PAL_PX), rnPalAlto = () => (RN_PAL.vh / 2048 * RN_PAL_PX);
const eCl = x => Math.max(0, Math.min(1, x)), eOC = x => 1 - Math.pow(1 - x, 3), eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eOB = x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
/* Las bolas en un momento t. Devuelve también m (0: en el centro y grande; 1: en la «o») */
function rnPalBolas(t, larga) {
  const P0 = RN_PAL; let o = '', m = 1, rot;
  if (larga) { m = eIO(eCl((t - 1.45) / 0.75)); rot = -110 * (1 - eOC(eCl((t - 0.15) / 1.5))); }
  else rot = -90 * (1 - eOC(eCl(t / 0.52)));                     /* ficha 1: un cuarto de vuelta, 520 ms */
  const k = (larga ? 2.3 : 1) + (1 - (larga ? 2.3 : 1)) * m;
  const x = P0.cx + (P0.ox - P0.cx) * m, y = P0.cy + (P0.oy - P0.cy) * m;
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 + rot) * Math.PI / 180;
    if (larga) {
      const t0 = 0.25 + i * 0.1, p = eCl((t - t0) / 0.55), e = eOB(p);
      let s = eCl(p * 2.2) * (0.55 + 0.45 * Math.min(1.2, e));
      const w = eCl((t - 1.15 - i * 0.04) / 0.4); s *= 1 + 0.18 * Math.sin(w * Math.PI) * (1 - m);
      if (p > 0) o += '<circle cx="' + (P0.rc * e * Math.sin(a)).toFixed(1) + '" cy="' + (-P0.rc * e * Math.cos(a)).toFixed(1) + '" r="' + (P0.rd * Math.max(s, 0)).toFixed(1) + '" fill="' + RN_LOGO[i] + '"/>';
    } else {
      o += '<circle cx="' + (P0.rc * Math.sin(a)).toFixed(1) + '" cy="' + (-P0.rc * Math.cos(a)).toFixed(1) + '" r="' + P0.rd + '" fill="' + RN_LOGO[i] + '"/>';
    }
  }
  return { g: '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + k.toFixed(4) + ')">' + o + '</g>', m: m };
}
/* La palabra entera, quieta (sirve también para la bienvenida y la captura) */
function rnPalabra(px, cls) {
  const P0 = RN_PAL, w = (P0.vw / 2048 * px).toFixed(1), h = (P0.vh / 2048 * px).toFixed(1);
  return '<svg class="' + (cls || 'rn-pal') + '" width="' + w + '" height="' + h + '" viewBox="' + P0.vx + ' ' + P0.vy + ' ' + P0.vw + ' ' + P0.vh + '" role="img" aria-label="Ronda"><g class="rn-pal-l" transform="scale(1 -1)">' + RN_PAL_TRAZOS.join('') + '</g><g class="rn-pal-b">' + rnPalBolas(9, false).g + '</g></svg>';
}
function rnAnimarArranque(ar) {
  return new Promise(ok => {
    const larga = rnPrimeraVez();
    try { localStorage.setItem('rondaP-bienvenida', '1'); } catch (e) { }
    ar.classList.add('rn-anim', 'rn-anim5');
    ar.innerHTML = rnAurora() + '<div class="rn-arr5">' + rnPalabra(RN_PAL_PX) + '</div>';
    const svg = $('.rn-pal', ar), bolas = $('.rn-pal-b', ar), letras = $$('.rn-pal-l path', ar);
    let tA = 0;
    const fin = () => { svg.style.opacity = 1; window.RN_ARR_MS = tA ? Math.round(performance.now() - tA) : 0; bolas.innerHTML = rnPalBolas(9, false).g; letras.forEach(l => { l.style.opacity = 1; l.style.transform = ''; }); ok(); };
    if (REDUCIR) { svg.style.opacity = 0; requestAnimationFrame(() => { svg.style.transition = 'opacity .4s'; svg.style.opacity = 1; }); setTimeout(fin, 420); return; }
    const FIN = larga ? 2.75 : 0.56;
    letras.forEach(l => { l.style.opacity = 0; });
    if (!larga) { svg.style.opacity = 0; }
    const t0 = tA = performance.now();
    const paso = now => {
      const t = (now - t0) / 1000;
      const b = rnPalBolas(t, larga); bolas.innerHTML = b.g;
      if (larga) letras.forEach((l, i) => {
        const d = 1.7 + (i ? 0.1 + i * 0.07 : 0), p = eOC(eCl((t - d) / 0.5));
        l.style.opacity = p.toFixed(3); l.style.transform = 'translateY(' + (-400 * (1 - p)).toFixed(1) + 'px)';
      });
      else { const p = eCl(t / 0.11); svg.style.opacity = p.toFixed(3); if (t > 0.11) letras.forEach(l => { l.style.opacity = 1; }); else letras.forEach(l => { l.style.opacity = p.toFixed(3); }); }  /* ficha 1: aparece en 110 ms */
      if (t < FIN) requestAnimationFrame(paso); else fin();
    };
    requestAnimationFrame(paso);
  });
}
/* La bienvenida, con la misma palabra y el anillo en la «o» */
P.bienvenida.html = () => '<div class="rn-bienv">' + rnPalabra(64, 'rn-pal rn-pal-bienv') + '<p class="rn-bienv-s">La casa, al día.</p></div>';
/* Con el fondo de Inicio, como en el JPG */
const _bfijo52 = P.bienvenida.fijo;
P.bienvenida.fijo = p => rnAurora() + _bfijo52(p);
P.anulado.fijo = (f => p => rnAurora() + f(p))(P.anulado.fijo);
P.onb.fijo = (f => p => rnAurora() + f(p))(P.onb.fijo);

/* ---------- Arranque de la app: ejemplo o casa ---------- */
async function rnArrancar() {
  const ar = $('#arranque');
  aplicarTema();
  const anim = ar ? rnAnimarArranque(ar) : Promise.resolve();
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
  const capas = [$('#app'), $('#nav')].filter(Boolean);
  capas.forEach(c => c.classList.add('rn-entra')); requestAnimationFrame(() => requestAnimationFrame(() => capas.forEach(c => c.classList.add('rn-ya'))));
  setTimeout(() => capas.forEach(c => c.classList.remove('rn-entra', 'rn-ya')), 900);
  if (ar) { ar.classList.add('rn-fuera'); setTimeout(() => ar.remove(), 260); }  /* ficha 1: se va en 190 ms (opacidad y escala 1,04) */
}
