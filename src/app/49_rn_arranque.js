/* ===================== DISEÑO NUEVO · arranque (pieza 05) =====================
   El círculo con los puntos y «Ronda», centrado con CSS en la pantalla física (sin medir texto: A4).
   Dura como mucho 0,75 s y se va con un fundido (A5). La animación propia del arranque llega en la tanda 8. */
async function rnArrancar() {
  const t0 = performance.now();
  const ar = $('#arranque');
  if (ar) ar.innerHTML = rnAurora() + '<div class="rn-arr"><span class="rn-arr-c">' + rnPuntos(96, .125) + '</span><b>Ronda</b></div>';
  aplicarTema();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(e => anotar('sw', e));
  await cargarPrueba();
  Nav.raiz('inicio');
  /* Que se vea el logo un momento, sin pasar de 0,75 s en total */
  const resto = Math.max(0, 450 - (performance.now() - t0));
  await espera(resto);
  if (ar) { ar.classList.add('rn-fuera'); setTimeout(() => ar.remove(), 300); }
}
/* Sin menú del iPhone al mantener pulsado (A2) */
document.addEventListener('contextmenu', ev => { if (ev.target.closest('.rn-barra,.rn-it,[data-lp]')) ev.preventDefault(); });
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aplicarTema); } catch (e) { }
document.addEventListener('visibilitychange', () => { if (!document.hidden) { aplicarTema(); if (Nav.actual() && !hojaAbierta) Nav.refrescar(); } });
window.RONDA = Object.assign(window.RONDA || {}, { S, Nav, ACC, P, DB, VERSION, cambiar, lista, rnSecciones, rnNuevaTarea, PRUEBA, PI, PR, saldosDe, reembolsos, hoyISO, ordenAgua, nivelAgua, dato, toast });
rnArrancar().catch(e => {
  anotar('arranque', e);
  const a = $('#arranque'); if (a) a.remove();
  $('#app').innerHTML = '<div class="pg rn-pg rn-aj"><div class="pgc"><div class="rn-tit"><h1>No he podido abrir Ronda</h1></div><p class="rn-txt">' + esc(e.message) + '</p><button class="rn-btnp" onclick="location.reload()">Volver a intentarlo</button></div></div>';
});
