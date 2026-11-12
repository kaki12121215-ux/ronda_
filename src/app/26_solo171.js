/* ===================== 1.7.1 · Tareas «Solo para mí» =====================
   No son secretas: es para que cada uno pueda apuntar cosas suyas sin llenar las tareas del otro.
   La tarea lleva solo = persona; en la app de los demás no aparece en ningún sitio (listas, tarjetas, contadores, búsqueda).
   El script no cambia: se guarda en la hoja como las demás. */
function candado(x) { return x && x.solo ? '<span class="solo" title="Solo la ves tú" aria-label="Solo la ves tú">' + ic('candado', 13) + '</span>' : ''; }
function filaSolo(on) { return '<div class="row card">' + sq('candado', 4) + '<div class="f"><b>Solo para mí</b><small>' + (on ? 'Solo la ves tú. No va al calendario compartido.' : 'La ven todos') + '</small></div>' + swi(on, 'tSolo') + '</div>'; }
ACC.tSolo = () => { const e = Nav.actual(); guardarCampos(e); const p = e.params; p.solo = !p.solo; if (p.solo) { p.para = S.cfg.persona; p.cal = false; } Nav.refrescar(true); };
Object.assign(window.RONDA || (window.RONDA = {}), { candado: candado });
Object.assign(window.RONDA || (window.RONDA = {}), { animarArranque: animarArranque });
