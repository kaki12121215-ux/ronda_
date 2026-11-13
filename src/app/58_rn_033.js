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
