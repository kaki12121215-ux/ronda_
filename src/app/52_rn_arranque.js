/* ===================== 0.3.0 · ARRANQUE · opción A: «R◯nda» =====================
   La palabra «Ronda» en Inter Display con el anillo de puntos en el sitio de la «o».
   - Las letras van como trazos sacados de la fuente (medidas fijas, sin canvas y sin medir texto: error A4).
     Así no depende de que la fuente haya cargado y la palabra queda siempre en el centro de la pantalla física.
   - La primera vez, la larga: las bolas salen girando en el centro, laten, y el anillo se encoge hasta su sitio en la «o»
     mientras aparecen R, n, d, a. Termina en «R◯nda». Las demás veces, la corta de 0,75 s.
   - Con «Reducir movimiento», solo fundidos. */
const RN_PAL_TRAZOS = ["<path transform=\"translate(0 0)\" d=\"M111 0H419V521H689C690 521 691 521 692 521L956 0H1286L987 579C1154 656 1253 804 1253 1001C1253 1301 1043 1490 707 1490H111ZM419 768V1234H688C851 1234 952 1143 952 1001C952 859 851 768 689 768Z\"/>","<path transform=\"translate(2770 0)\" d=\"M399 587C399 751 484 824 606 824C729 824 800 749 800 607V0H1094V661C1094 928 949 1078 724 1078C572 1078 465 1010 394 890V1056H104V0H399Z\"/>","<path transform=\"translate(3969 0)\" d=\"M515 -22C654 -22 767 39 828 162H829V0H1119V1490H825V910H824C756 1024 650 1078 513 1078C243 1078 58 853 58 529C58 198 239 -22 515 -22ZM591 218C448 218 355 331 355 529C355 727 448 840 591 840C740 840 839 717 839 529C839 340 740 218 591 218Z\"/>","<path transform=\"translate(5193 0)\" d=\"M427 -18C589 -18 680 46 736 149H740V0H1028V716C1028 942 862 1078 573 1078C283 1078 111 940 98 722H375C382 803 454 859 564 859C672 859 737 805 737 727V720C737 652 669 643 476 624C256 604 64 536 64 298C64 87 216 -18 427 -18ZM509 187C410 187 346 231 346 306C346 390 426 429 527 444C622 459 705 473 739 492V386C739 272 651 187 509 187Z\"/>"];
/* 0.3.5: el anillo, más grande (casi como la «R»); las letras n, d, a se apartan para hacerle sitio */
const RN_PAL = { vx: 96, vy: -1505, vw: 6140, vh: 1550, ox: 2080, oy: -628, cx: 3166, cy: -733, rc: 490, rd: 150 };
const RN_PAL_PX = 76;                                  /* tamaño de letra en pantalla */
const rnPalAncho = () => (RN_PAL.vw / 2048 * RN_PAL_PX), rnPalAlto = () => (RN_PAL.vh / 2048 * RN_PAL_PX);
const eCl = x => Math.max(0, Math.min(1, x)), eOC = x => 1 - Math.pow(1 - x, 3), eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eOB = x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
/* 0.3.5 · Las bolas en un momento t, como en la app de siempre: salen de una en una, en el sentido del reloj, desde arriba,
   cada una creciendo en su sitio; al cerrarse el anillo, un latido que lo recorre. */
function rnPalBolas(t) {
  const P0 = RN_PAL; let o = '';
  for (let i = 0; i < 8; i++) {
    const a = i * 45 * Math.PI / 180, p = eCl((t - 0.14 - i * 0.06) / 0.3);
    if (p <= 0) continue;
    const w = eCl((t - 0.88 - i * 0.025) / 0.26), s = eOB(p) * (1 + 0.1 * Math.sin(w * Math.PI));
    o += '<circle cx="' + (P0.rc * Math.sin(a)).toFixed(1) + '" cy="' + (-P0.rc * Math.cos(a)).toFixed(1) + '" r="' + (P0.rd * s).toFixed(1) + '" fill="' + RN_LOGO[i] + '" opacity="' + eCl(p * 3).toFixed(3) + '"/>';
  }
  return { g: '<g transform="translate(' + P0.ox + ' ' + P0.oy + ')">' + o + '</g>', m: 1 };
}
/* La palabra entera, quieta (sirve también para la bienvenida y la captura) */
function rnPalabra(px, cls) {
  const P0 = RN_PAL, w = (P0.vw / 2048 * px).toFixed(1), h = (P0.vh / 2048 * px).toFixed(1);
  return '<svg class="' + (cls || 'rn-pal') + '" width="' + w + '" height="' + h + '" viewBox="' + P0.vx + ' ' + P0.vy + ' ' + P0.vw + ' ' + P0.vh + '" role="img" aria-label="Ronda"><g class="rn-pal-l" transform="scale(1 -1)">' + RN_PAL_TRAZOS.map(x => '<g>' + x + '</g>').join('') + '</g><g class="rn-pal-b">' + rnPalBolas(9).g + '</g></svg>';
}
function rnAnimarArranque(ar) {
  return new Promise(ok => {
    try { localStorage.setItem('rondaP-bienvenida', '1'); } catch (e) { }
    ar.classList.add('rn-anim', 'rn-anim5');
    ar.innerHTML = rnAurora() + '<div class="rn-arr5">' + rnPalabra(RN_PAL_PX) + '</div>';
    const svg = $('.rn-pal', ar), bolas = $('.rn-pal-b', ar), letras = $$('.rn-pal-l > g', ar);
    let tA = 0;
    const fin = () => { svg.style.opacity = 1; window.RN_ARR_MS = tA ? Math.round(performance.now() - tA) : 0; bolas.innerHTML = rnPalBolas(9).g; letras.forEach(l => { l.style.opacity = 1; }); ok(); };
    if (REDUCIR) { svg.style.opacity = 0; requestAnimationFrame(() => { svg.style.transition = 'opacity .4s'; svg.style.opacity = 1; }); setTimeout(fin, 420); return; }
    /* Como la de siempre: la «R», y luego n, d, a de una en una mientras las bolas van cerrando el anillo */
    const FIN = 1.34;
    letras.forEach(l => { l.style.opacity = 0; }); bolas.innerHTML = '';
    /* 0.3.6: el reloj de la animación es propio. En el iPhone, al abrir desde el icono, la pantalla sigue en blanco un rato
       aunque la app ya esté en marcha: con el reloj de verdad, cuando por fin se veía, la animación ya había terminado.
       Ahora empieza en el primer fotograma que se pinta, espera unos fotogramas quieta y nunca se salta trozos
       (si el móvil se para, la animación se para con él). */
    let t = 0, prev = 0, n = 0;
    const paso = now => {
      if (!n) { prev = now; tA = now; }
      n++;
      const dt = Math.min((now - prev) / 1000, 1 / 30); prev = now;
      if (n > 4) t += dt;
      bolas.innerHTML = rnPalBolas(t).g;
      letras.forEach((l, i) => { l.style.opacity = (i ? eCl((t - 0.12 - (i - 1) * 0.1) / 0.22) : eCl(t / 0.16)).toFixed(3); });
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
  RN_ARRANCANDO = false;
  const capas = [$('#app'), $('#nav')].filter(Boolean);
  capas.forEach(c => c.classList.add('rn-entra')); requestAnimationFrame(() => requestAnimationFrame(() => capas.forEach(c => c.classList.add('rn-ya'))));
  setTimeout(() => capas.forEach(c => c.classList.remove('rn-entra', 'rn-ya')), 900);
  if (ar) { ar.classList.add('rn-fuera'); setTimeout(() => ar.remove(), 260); }  /* ficha 1: se va en 190 ms (opacidad y escala 1,04) */
}
