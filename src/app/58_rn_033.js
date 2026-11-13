/* ===================== 0.3.3 · arreglos tras probar la 0.3.2 en el iPhone =====================
   1. Arranque: los archivos salen de lo guardado en el móvil (antes se pedían a internet cada vez y la pantalla se quedaba
      en blanco mientras tanto). Cuando hay versión nueva, se descarga por detrás y la app se recarga sola al abrir.
   2. «Más»: la hoja crece de verdad desde la barra también en el iPhone.
   3. El aro del «+» al mantener pulsado: bastante más grueso y más separado, para que se vea alrededor del dedo.
   4. Notas: el menú de una nota desde la lista (mantener pulsada) fijaba mal («Escribe algo primero»). Ahora fija, cambia
      el color, comparte y borra desde la lista. La nota abierta se tiñe de su color. Las fijadas llevan su marca. */

/* ---------- 1. Versión nueva: recargar sola, solo al abrir y si no se está haciendo nada ---------- */
(function () {
  if (!('serviceWorker' in navigator)) return;
  const habia = !!navigator.serviceWorker.controller, t0 = Date.now(); let hecho = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!habia || hecho) return; hecho = true;
    const ae = document.activeElement, escribiendo = ae && (ae.isContentEditable || /INPUT|TEXTAREA/.test(ae.tagName));
    if (Date.now() - t0 < 15000 && !escribiendo && !hojaAbierta && !Dilo.el) location.reload();
    else toast('Hay una versión nueva. Cierra la app y ábrela otra vez.');
  });
})();

/* ---------- 4. Notas: el menú desde la lista ---------- */
const rnEnNota = () => { const a = Nav.actual(); return !!(a && a.id === 'nota'); };
const _notaMenu58 = ACC.notaMenu, _notaFijar58 = ACC.notaFijar, _notaColor58 = ACC.notaColor, _notaBorrar58 = ACC.notaBorrar;
ACC.notaMenu = el => {
  if (!rnEnNota() && el && el.dataset && el.dataset.id) { const p = Nav.actual().params, n = dato('notas', el.dataset.id); if (!n) return; p.id = el.dataset.id; p.color = colorNota(n); }
  return _notaMenu58(el);
};
ACC.notaFijar = el => {
  if (rnEnNota()) return _notaFijar58(el);
  cerrarHoja(); const id = Nav.actual().params.id, n = dato('notas', id); if (!n) return;
  cambiar('notas', id, { fijada: !n.fijada }); Nav.refrescar(true); toast(n.fijada ? 'Ya no está fijada' : 'Fijada', null, null, 'hecho');
};
ACC.notaColor = el => {
  if (rnEnNota()) return _notaColor58(el);
  const p = Nav.actual().params; p.color = el.dataset.c; if (dato('notas', p.id)) cambiar('notas', p.id, { color: el.dataset.c });
  $$('[data-a="notaColor"]').forEach(b => b.classList.toggle('on', b === el));
  setTimeout(() => { cerrarHoja(); Nav.refrescar(true); }, 180);
};
ACC.notaBorrar = el => {
  if (rnEnNota()) return _notaBorrar58(el);
  cerrarHoja(); const id = Nav.actual().params.id; if (!dato('notas', id)) return;
  cambiar('notas', id, { _b: 1 }); Nav.refrescar(true); toast('Nota borrada', 'Deshacer', () => { cambiar('notas', id, { _b: 0 }); Nav.refrescar(true); });
};

/* ===================== 0.3.4 =====================
   1. Notas: por defecto, blancas (la tarjeta y la nota abierta). Solo se tiñen si eliges un color.
   2. La mancha de la barra: cuando tiene que cruzar el «+» (de Inicio a Más y vuelta) ya no pasa por debajo de él
      ni tapa las pestañas de en medio: se apaga donde estaba y aparece donde va.
   3. Dictado: empieza al levantar el dedo (touchend, que es lo que el iPhone acepta como toque); si falla, el aviso dice
      el motivo que da el iPhone; tocar el anillo vuelve a intentarlo. Con el teclado, los botones quedan encima de él. */

/* ---------- 2. La mancha: en la 0.3.5 vuelve a deslizarse como antes (56_rn_031.js) ---------- */

/* ---------- 3. Dictado ---------- */
/* Levantar el dedo tras mantener pulsado el «+»: aquí empieza a escuchar */
document.addEventListener('touchend', () => { if (Dilo.el && Dilo.modo === 'escucha' && !Dilo.rec && hayVoz() && RN_DILO.armado !== null && $('.cap', Dilo.el) && /Suelta/.test($('.cap', Dilo.el).textContent)) Dilo.escuchar(); }, true);
/* El motivo del fallo, tal como lo da el iPhone, para poder arreglarlo */
const _diloEsc58 = Dilo.escuchar, _diloEscr58 = Dilo.escribir;
Dilo.escuchar = function () {
  RN_DILO.err = '';
  const r = _diloEsc58.apply(this, arguments);
  if (this.rec) { const o = this.rec.onerror; this.rec.onerror = ev => { RN_DILO.err = (ev && ev.error) || ''; return o && o(ev); }; }
  return r;
};
Dilo.escribir = function (aviso) {
  if (aviso && RN_DILO.err && !/no-speech|not-allowed/.test(RN_DILO.err)) aviso += ' (motivo: ' + RN_DILO.err + ')';
  RN_DILO.err = '';
  return _diloEscr58.call(this, aviso);
};
/* Con el teclado: el panel ocupa justo lo que se ve (los botones quedan encima del teclado) */
(function () {
  const vv = window.visualViewport; if (!vv) return;
  const f = () => { const p = Dilo.el; if (!p) return; const kb = innerHeight - vv.height; if (kb > 80) { p.style.top = Math.round(vv.offsetTop) + 'px'; p.style.height = Math.round(vv.height) + 'px'; p.style.bottom = 'auto'; } else { p.style.top = ''; p.style.height = ''; p.style.bottom = ''; } };
  vv.addEventListener('resize', f); vv.addEventListener('scroll', f); document.addEventListener('focusin', () => setTimeout(f, 80)); document.addEventListener('focusout', () => setTimeout(f, 80));
})();

/* ===================== 0.3.5 =====================
   1. La mancha de la barra vuelve a deslizarse. Lo que parpadeaba al volver a Inicio era la barra entera (57_rn_032.js).
   2. Dictado: si el iPhone no lo arranca al soltar, o se corta sin haber oído nada, ya no salta a escribir:
      se queda en «Toca el anillo y habla». Ese toque es el mismo que en la app de siempre, que funciona siempre.
   3. Arranque: como la animación de siempre (52_rn_arranque.js). */
function rnDiloToca(motivo) {
  const d = Dilo; if (!d.el) return;
  d.parar(); clearTimeout(RN_DILO.pista); d.modo = 'escucha';
  d.cuerpo('<p class="live" data-r="live">' + esc(d.texto || '') + '</p><p class="cap">Toca el anillo y habla' + (motivo && !/no-speech|aborted/.test(motivo) ? ' (motivo: ' + esc(motivo) + ')' : '') + '</p>',
    '<button class="btn sec" data-a="diloEscribir">' + ic('teclado', 20) + 'Escribir</button>' + (d.texto ? '<button class="btn pri" data-a="diloListo">Listo</button>' : '<button class="btn pri" data-a="diloHablar">' + ic('microfono', 20, 4) + 'Hablar</button>'));
  const r = $('.dring', d.el); if (r) r.classList.add('rn-toca');
}
const _diloEsc59 = Dilo.escuchar;
Dilo.escuchar = function () {
  this.parar(); clearTimeout(RN_DILO.pista);
  const r0 = this.el && $('.dring', this.el); if (r0) r0.classList.remove('rn-toca');
  const r = _diloEsc59.apply(this, arguments), rec = this.rec, yo = this;
  if (!rec) return r;
  rec.onerror = ev => {
    const e = (ev && ev.error) || ''; RN_DILO.err = e;
    if (yo.rec !== rec) return; yo.rec = null; if (!yo.el) return;
    if (e === 'not-allowed' || e === 'service-not-allowed') return yo.escribir('Ronda no puede usar el micrófono aquí. Escríbelo o toca el micrófono del teclado.');
    rnDiloToca(e);
  };
  rec.onend = () => { if (yo.rec !== rec) return; yo.rec = null; if (!yo.el || yo.modo !== 'escucha') return; if (yo.texto) yo.ordenar(); else rnDiloToca(RN_DILO.err); };
  /* Si pasan unos segundos sin que aparezca nada, se dice cómo volver a intentarlo */
  const t0 = this.texto;
  RN_DILO.pista = setTimeout(() => { if (yo.el && yo.rec === rec && yo.texto === t0) { const c = $('.cap', yo.el); if (c) c.textContent = '¿No aparece lo que dices? Toca el anillo y habla'; const g = $('.dring', yo.el); if (g) g.classList.add('rn-toca'); } }, 5000);
  return r;
};
/* Tocar el anillo: volver a escuchar (un toque de verdad, como el botón de la app de siempre) */
document.addEventListener('click', ev => { if (Dilo.el && ev.target.closest && ev.target.closest('.rn-dilo-p .dring') && hayVoz() && Dilo.modo !== 'piensa' && Dilo.modo !== 'res') { const a = $('#dTxt'); if (a) { Dilo.texto = a.value.trim(); a.blur(); } Dilo.escuchar(); } }, true);
/* Si al levantar el dedo el iPhone no ha dejado empezar, se pide el toque */
const rnDiloEsperando = () => Dilo.el && Dilo.modo === 'escucha' && !Dilo.rec && $('.cap', Dilo.el) && /Suelta/.test($('.cap', Dilo.el).textContent);
document.addEventListener('touchcancel', () => { if (rnDiloEsperando()) rnDiloToca(); }, true);
document.addEventListener('pointerup', ev => { if (ev.pointerType === 'touch') setTimeout(() => { if (rnDiloEsperando()) rnDiloToca(); }, 350); }, true);
/* Al abrir Dilo, 57_rn_032.js devolvía «escuchar» al de la 1.7.3 (y se perdía todo lo de arriba): se vuelve a poner */
const rnEscFinal = Dilo.escuchar, _diloAbrir59 = Dilo.abrir;
Dilo.abrir = function () { this.escuchar = rnEscFinal; try { return _diloAbrir59.apply(this, arguments); } finally { this.escuchar = rnEscFinal; } };
