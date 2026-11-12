/* ===================== DISEÑO NUEVO · Ajustes =====================
   Fondo claro liso, «La casa» y «La app» fuera de la tarjeta, la versión abajo.
   Las pantallas de dentro llegan en la tanda 6. */
P.ajustes = {
  raiz: true, clase: 'con-barra', sinPlus: true,
  html: () => {
    const x = yo() || {}, e = espacio(), ps = personas();
    let tema = 'auto'; try { tema = localStorage.getItem('rondaP-tema') || 'auto'; } catch (er) { }
    const fila = (id, t, s, a) => '<button class="rn-rw rn-fa" data-a="' + (a || 'rnAjPend') + '">' + '<span class="rn-chip">' + rnIc(id, 26, 2) + '</span><span class="rn-fat"><span class="rn-t">' + t + '</span>' + (s ? '<span class="rn-n">' + s + '</span>' : '') + '</span>' + rnFle + '</button>';
    return rnTitulo('Ajustes') +
      '<button class="rn-cd rn-perfil" data-a="rnAjPend">' + rnAv(x, 50) + '<span class="rn-fat"><b>' + esc(x.nombre || '') + '</b><span class="rn-n">' + (esAdmin() ? 'Administrador' : 'Miembro') + ' de ' + esc(e.nombre) + '</span></span>' + rnFle + '</button>' +
      '<h2 class="rn-gt">La casa</h2><div class="rn-cd">' + fila('hogar-espacio', 'Nombre y emoji del hogar', esc(e.nombre)) + fila('personas', 'Personas', ps.map(p => esc(p.nombre)).join(' y ')) + fila('modulo-calendario', 'Avisos en tu calendario', 'En la prueba no hay calendario') + '</div>' +
      '<h2 class="rn-gt">La app</h2><div class="rn-cd">' + fila('sol', 'Apariencia', { claro: 'Claro', oscuro: 'Oscuro', auto: 'Automático: como el iPhone' }[tema]) + fila('nube-sincronizada', 'Sincronización', 'Sin conexión: los datos son de ejemplo') + fila('descargar', 'Copia de seguridad', 'No hay en la prueba') + '</div>' +
      '<p class="rn-version">Ronda · prueba ' + VERSION + ' · datos de ejemplo</p>';
  }
};
ACC.rnAjPend = () => toast('Las pantallas de Ajustes llegan en la tanda 6.');
