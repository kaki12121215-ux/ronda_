/* ============================ PIEZAS COMUNES DE LOS MÓDULOS ============================ */
const hoyISO = () => isoDia(new Date());
const isoDia = d => d.getFullYear() + '-' + dosd(d.getMonth() + 1) + '-' + dosd(d.getDate());
const deISO = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const sumaDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const DIASC = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const LETRAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];   /* lunes = 1 … domingo = 7 en todas partes */
const diaSemana = d => d.getDay() === 0 ? 7 : d.getDay();
const euros = n => (Math.round((Number(n) || 0) * 100) / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const numero = t => { const n = parseFloat(String(t || '').replace(/\s|€/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return isNaN(n) ? 0 : Math.round(n * 100) / 100; };

/* «Hoy», «Mañana», «Jueves», «12 de noviembre» */
function cuando(fecha, horaTxt) {
  const d = deISO(fecha);
  if (!d) return horaTxt ? 'A las ' + horaTxt : 'Sin fecha';
  const h = new Date(); h.setHours(0, 0, 0, 0);
  const dif = Math.round((d - h) / 86400000);
  let t = dif === 0 ? 'Hoy' : dif === 1 ? 'Mañana' : dif === -1 ? 'Ayer' : (dif > 1 && dif < 7) ? cap(DIAS[d.getDay()]) : d.getDate() + ' de ' + MESES[d.getMonth()];
  if (dif < -1) t = 'Atrasada · ' + t;
  return t + (horaTxt ? ' · ' + horaTxt : '');
}

/* Repeticiones: { cada: 'dia'|'semana'|'mes'|'anio'|'ndias', n, dias: [1..7] } */
const REPES = [['', 'No se repite'], ['dia', 'Cada día'], ['semana', 'Cada semana'], ['ndias', 'Cada pocos días'], ['mes', 'Cada mes'], ['anio', 'Cada año'], ['p', 'Personalizado']];
function textoRepe(r) {
  if (!r || !r.cada) return 'No se repite';
  if (r.cada === 'ndias') return 'Cada ' + (r.n || 2) + ' días';
  if (r.cada === 'p') return textoU(r.n || 1, r.u || 'd');
  if (r.cada === 'semana' && r.dias && r.dias.length) return 'Cada ' + r.dias.slice().sort().map(x => ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'][x]).join(', ');
  return (REPES.find(x => x[0] === r.cada) || [, 'No se repite'])[1];
}
function siguienteFecha(fecha, r) {
  let d = deISO(fecha) || new Date();
  d.setHours(0, 0, 0, 0);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const base = d < hoy ? hoy : d;
  if (r.cada === 'dia') return isoDia(sumaDias(base, 1));
  if (r.cada === 'ndias') return isoDia(sumaDias(base, Math.max(1, r.n || 2)));
  if (r.cada === 'p') { let x = new Date(d); do { x = sumarU(x, r.n || 1, r.u || 'd'); } while (x <= base); return isoDia(x); }
  if (r.cada === 'semana') {
    const ds = (r.dias && r.dias.length) ? r.dias : [diaSemana(d)];
    for (let i = 1; i <= 7; i++) { const x = sumaDias(base, i); if (ds.indexOf(diaSemana(x)) >= 0) return isoDia(x); }
  }
  if (r.cada === 'mes') { const x = new Date(d); do { x.setMonth(x.getMonth() + 1); } while (x <= base); return isoDia(x); }
  if (r.cada === 'anio') { const x = new Date(d); do { x.setFullYear(x.getFullYear() + 1); } while (x <= base); return isoDia(x); }
  return null;
}

/* Campos de formulario */
const fldTxt = (id, et, val, ph, extra) => '<label class="fld"><small>' + et + '</small><input id="' + id + '" value="' + esc(val || '') + '" placeholder="' + esc(ph || '') + '" autocomplete="off" ' + (extra || '') + '></label>';
const fldArea = (id, et, val, ph) => '<label class="fld"><small>' + et + '</small><textarea id="' + id + '" rows="3" placeholder="' + esc(ph || '') + '">' + esc(val || '') + '</textarea></label>';
const swi = (on, a, extra) => '<button class="sw' + (on ? ' on' : '') + '" data-a="' + a + '" ' + (extra || '') + ' role="switch" aria-checked="' + (on ? 'true' : 'false') + '"><i></i></button>';
const val = id => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };
const chipsPersonas = (sel, a, todos) => '<div class="chips">' + personas().map(p => '<button class="chip' + (sel === p.id ? ' on' : '') + '" data-a="' + a + '" data-v="' + p.id + '" style="' + (sel === p.id ? 'background:' + p.color + ';border-color:' + p.color + ';color:#fff' : '') + '">' + esc(p.nombre) + '</button>').join('') + (todos ? '<button class="chip' + (sel === 'todos' ? ' on' : '') + '" data-a="' + a + '" data-v="todos">Todos</button>' : '') + '</div>';
const nombreDe = id => id === 'todos' ? 'Todos' : ((dato('personas', id) || {}).nombre || '');
const colorDe = id => (dato('personas', id) || {}).color || '#9FB0B8';
const vacio = (ilus, titulo, texto) => '<div class="ill big" style="margin-top:24px">' + ilu(ilus) + '</div><h2 class="lg" style="font-size:26px">' + titulo + '</h2><p class="mu">' + texto + '</p>';
/* Formularios: un cambio de parámetro repinta sin perder lo escrito. */
function guardarCampos(e) { $$('input[id],textarea[id]', e.el).forEach(i => { if (i.type !== 'file' && i.type !== 'checkbox') e.params['_' + i.id] = i.value; }); }
const pv = (p, id, def) => p['_' + id] !== undefined ? p['_' + id] : def;
function repintar() { const e = Nav.actual(); guardarCampos(e); Nav.refrescar(true); }
ACC.pSet = el => { const e = Nav.actual(); e.params[el.dataset.k] = el.dataset.v; repintar(); };
ACC.pTog = el => { const e = Nav.actual(); e.params[el.dataset.k] = !e.params[el.dataset.k]; repintar(); };

/* Avisos: cuánto antes suena la alarma del calendario */
const AVISOS = [['', 'Sin aviso'], ['0', 'A la hora'], ['10', '10 minutos antes'], ['30', '30 minutos antes'], ['60', '1 hora antes'], ['1440', '1 día antes']];
const textoAviso = v => (AVISOS.find(x => x[0] === String(v == null ? '' : v)) || AVISOS[0])[1];
function hojaOpciones(titulo, opciones, actual, fn) {
  abrirHoja('<h3>' + esc(titulo) + '</h3><div class="list">' + opciones.map(o => '<button class="row card' + (String(actual) === String(o[0]) ? ' sel' : '') + '" data-a="hojaOpc" data-v="' + esc(o[0]) + '"><b style="flex:1">' + esc(o[1]) + '</b><span class="rad' + (String(actual) === String(o[0]) ? ' on' : '') + '"></span></button>').join('') + '</div>');
  ACC.hojaOpc = el => { cerrarHoja(); fn(el.dataset.v); };
}

/* ============================ AVISOS AL CALENDARIO (interruptor por elemento) ============================
   Cada elemento con «Añadir al calendario» guarda calPend con quién tiene que mandarlo.
   Solo ese móvil lo envía (así no se duplica) y, al terminar, apunta el id del evento. */
const CON_CAL = {
  tareas: x => x.fecha && !x.hecho ? { titulo: x.titulo, dia: x.fecha, hora: x.hora, aviso: x.aviso, tipo: 'tarea', notas: x.notas } : null,
  fijos: x => x.proximo ? { titulo: 'Pagar ' + x.nombre + (x.importe ? ' · ' + euros(x.importe) : ''), dia: x.proximo, aviso: x.aviso, tipo: 'gasto' } : null,
  plantas: x => x.proximo ? { titulo: 'Regar ' + x.nombre, dia: x.proximo, hora: x.hora, aviso: x.aviso, tipo: 'riego' } : null,
  medicacion: x => x.proximo && (x.rec === undefined || x.rec) ? { titulo: x.nombre + (x.dosis ? ' · ' + x.dosis : '') + (x.quien && dato('personas', x.quien) ? ' (' + nombreDe(x.quien) + ')' : x.para ? ' (' + x.para + ')' : ''), dia: x.proximo, hora: x.hora, aviso: x.aviso, tipo: 'medicacion' } : null,
  coche: x => x.fecha ? { titulo: x.nombre + (typeof datoCoche === 'function' && datoCoche(x.coche || 'kprincipal') && coches().length > 1 ? ' · ' + datoCoche(x.coche || 'kprincipal').nombre : ''), dia: x.fecha, aviso: x.aviso === undefined ? 1440 : x.aviso, tipo: 'coche' } : null,
  acuario: x => x.proximo ? { titulo: x.nombre + ' (acuario)', dia: x.proximo, hora: x.hora, aviso: x.aviso, tipo: 'acuario' } : null
};
function marcarCal(col, id) { cambiar(col, id, { calPend: S.cfg.persona }); Cal.pronto(); }
const Cal = {
  t: null, corriendo: false,
  pronto() { clearTimeout(this.t); this.t = setTimeout(() => this.ya(), 1500); },
  async ya() {
    if (this.corriendo || !S.cfg || !S.red.ok) return;
    this.corriendo = true;
    try {
      for (const col of Object.keys(CON_CAL)) for (const x of lista(col).concat(Object.keys(S.recs[col] || {}).filter(id => S.recs[col][id].f._b && S.recs[col][id].f.evId).map(id => Object.assign({ id: id }, S.recs[col][id].f)))) {
        if (x.calPend !== S.cfg.persona) continue;
        const ev = !x._b && x.cal ? CON_CAL[col](x) : null;
        if (ev) {
          const d = deISO(ev.dia), ini = new Date(d);
          let todo = true;
          if (ev.hora && /^\d\d:\d\d$/.test(ev.hora)) { ini.setHours(+ev.hora.slice(0, 2), +ev.hora.slice(3)); todo = false; }
          const r = await api('evento-guardar', { ev: { id: x.evId || '', titulo: ev.titulo, inicio: ini.getTime(), fin: todo ? sumaDias(d, 1).getTime() : ini.getTime() + 30 * 60000, todoDia: todo, aviso: ev.aviso === undefined || ev.aviso === null ? '' : ev.aviso, ronda: col + ':' + x.id, tipo: ev.tipo, notas: ev.notas || '', destino: 'avisos' } });
          cambiar(col, x.id, { evId: r.evento.id, calPend: '' });
        } else {
          if (x.evId) await api('evento-borrar', { id: x.evId });
          cambiar(col, x.id, { evId: '', calPend: '' });
        }
      }
    } catch (e) { anotar('calendario', e); this.t = setTimeout(() => this.ya(), 30000); }
    finally { this.corriendo = false; }
  }
};
const filaCal = (on, a) => '<div class="row card">' + sq('modulo-calendario', 5) + '<div class="f"><b>Añadir al calendario</b><small>' + (on ? 'Irá a «' + esc(((S.cal || {}).avisos || S.cal || {}).nombre || 'vuestro calendario') + '» con su alarma' : 'Solo en Ronda') + '</small></div>' + swi(on, a) + '</div>';
const filaAviso = (v, a) => '<button class="row card" data-a="' + a + '">' + sq('alarma', 1) + '<div class="f"><b>Aviso</b><small>' + textoAviso(v) + '</small></div>' + chev + '</button>';
