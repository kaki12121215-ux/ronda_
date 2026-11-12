/* ===================== DISEÑO NUEVO · Ajustes =====================
   Fondo claro liso, «La casa» y «La app» fuera de la tarjeta, la versión abajo.
   0.2.0: cada fila abre su pantalla. Debajo de la versión, las medidas de la pantalla (para la barra blanca de abajo). */
P.ajustes = {
  raiz: true, clase: 'con-barra', sinPlus: true, rn: true,
  html: () => {
    const x = yo() || {}, e = espacio(), ps = personas();
    let tema = 'auto'; try { tema = localStorage.getItem('rondaP-tema') || 'auto'; } catch (er) { }
    const fila = (id, t, s, ir) => '<button class="rn-rw rn-fa" data-a="rnAjIr" data-ir="' + ir + '">' + '<span class="rn-chip">' + rnIc(id, 26, 2) + '</span><span class="rn-fat"><span class="rn-t">' + t + '</span>' + (s ? '<span class="rn-n">' + s + '</span>' : '') + '</span>' + rnFle + '</button>';
    return rnTitulo('Ajustes') +
      '<button class="rn-cd rn-perfil" data-a="rnAjIr" data-ir="miperfil">' + rnAv(x, 50) + '<span class="rn-fat"><b>' + esc(x.nombre || '') + '</b><span class="rn-n">' + (esAdmin() ? 'Administrador' : 'Miembro') + ' de ' + esc(e.nombre) + '</span></span>' + rnFle + '</button>' +
      '<h2 class="rn-gt">La casa</h2><div class="rn-cd">' + fila('hogar-espacio', 'Nombre y emoji del hogar', esc(e.nombre), 'hogarAj') + fila('personas', 'Personas', ps.map(p => esc(p.nombre)).join(' y '), 'personas') + fila('reloj', 'Actividad', 'Quién ha cambiado qué. Se puede deshacer', 'actividad') + fila('modulo-calendario', 'Avisos en tu calendario', 'Calendario «' + esc((S.cal || {}).nombre || 'Casa') + '» (de ejemplo)', 'avisos') + '</div>' +
      '<h2 class="rn-gt">La app</h2><div class="rn-cd">' + fila('sol', 'Apariencia', { claro: 'Claro', oscuro: 'Oscuro', auto: 'Automático: como el iPhone' }[tema], 'apariencia') + fila('ordenar', 'Barra de abajo', rnBarra().map(k => rnCorto(k)).join(', '), 'barra') + fila('nube-sincronizada', 'Sincronización', 'Sin conexión: los datos son de ejemplo', 'sincronizacion') + fila('descargar', 'Copia de seguridad', 'No hay en la prueba', 'copia') + fila('escudo', 'Comprobaciones', 'Errores y datos del móvil', 'comprobaciones') + fila('informacion', 'Acerca de Ronda', '', 'acerca') + '</div>' +
      '<p class="rn-version">Ronda · prueba ' + VERSION + ' · datos de ejemplo</p>' +
      '<p class="rn-version rn-medidas">' + esc(rnMedidas()) + '</p>' +
      '<button class="rn-version rn-verbv" data-a="rnVerBienvenida">Ver otra vez la animación de la primera vez</button>';
  }
};
ACC.rnAjIr = el => { const d = el.dataset.ir; if (P[d]) Nav.ir(d, {}); };
/* Medidas de la pantalla: con esto se ve qué hace el iPhone con la franja de abajo */
function rnMedidas() {
  let st = '?', sb = '?';
  try { const p = document.createElement('div'); p.style.cssText = 'position:fixed;top:0;left:0;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);visibility:hidden'; document.body.appendChild(p); const cs = getComputedStyle(p); st = parseInt(cs.paddingTop); sb = parseInt(cs.paddingBottom); p.remove(); } catch (e) { }
  const vv = window.visualViewport;
  return 'Pantalla ' + screen.width + '×' + screen.height + ' · ventana ' + innerWidth + '×' + innerHeight + (vv ? ' · visible ' + Math.round(vv.height) : '') + ' · html ' + document.documentElement.clientHeight + ' · arriba ' + st + ' · abajo ' + sb + ' · icono ' + (enIcono() ? 'sí' : 'no') + ' · falta ' + ((getComputedStyle(document.documentElement).getPropertyValue('--abajo') || '0').trim() || '0');
}
