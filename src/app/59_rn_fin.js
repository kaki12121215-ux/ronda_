/* ===================== 0.3.0 · lo último: exportar para las pruebas y arrancar ===================== */
window.RONDA = Object.assign(window.RONDA || {}, { rnMedir, S, Nav, ACC, P, DB, VERSION, cambiar, lista, rnSecciones, rnNuevaTarea, PRUEBA, PI, PR, MODO, EN_CASA, RN_PAL, Sync, Cal, rnAurora, W, PLANTILLAS, fijarInicio, ordenInicio, rnBarra, locLeer, actLoc, rnPalabra, apiReal, saldosDe, reembolsos, hoyISO, ordenAgua, nivelAgua, dato, toast });
rnArrancar().catch(e => {
  anotar('arranque', e);
  const a = $('#arranque'); if (a) a.remove();
  $('#app').innerHTML = '<div class="pg rn-pg rn-aj"><div class="pgc"><div class="rn-tit"><h1>No he podido abrir Ronda</h1></div><p class="rn-txt">' + esc(e.message) + '</p><button class="rn-btnp" onclick="location.reload()">Volver a intentarlo</button></div></div>';
});
