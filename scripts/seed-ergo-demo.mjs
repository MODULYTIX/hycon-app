// Datos ficticios para probar el listado. No modifica fichas existentes.
// Uso: HYCON_DEMO_EMAIL y HYCON_DEMO_PASSWORD en el entorno, luego node scripts/seed-ergo-demo.mjs.
import fs from 'node:fs';
import vm from 'node:vm';

const api = process.env.HYCON_DEMO_API || 'http://localhost:4000';
const empresaNombre = 'Servicios Industriales del Sur';
const definiciones = [
  ['01', 'Operador de almacén', 'Logística', 'Operaciones', 'Almacenes y distribución', ['2', '3'], '0.8', ['7.5', '6']],
  ['02', 'Técnico de mantenimiento', 'Mantenimiento', 'Operaciones', 'Mantenimiento mecánico', ['9', '8'], null, ['16', '12']],
  ['03', 'Auxiliar de despacho', 'Logística', 'Operaciones', 'Almacenes y distribución', null, '2.9', null],
  ['04', 'Operador de ensamblaje', 'Producción', 'Industrial', 'Línea de ensamblaje', ['5', '4'], null, ['25', '23']],
  ['05', 'Asistente administrativo', 'Administración', 'Administración y finanzas', 'Servicios administrativos', ['1', '2'], null, null],
  ['06', 'Estibador', 'Logística', 'Operaciones', 'Carga y descarga', ['11', '9'], '3.8', ['14', '10']],
  ['07', 'Inspector de calidad', 'Calidad', 'Industrial', 'Control de calidad', null, null, ['8', '7.5']],
  ['08', 'Operador de empaque', 'Producción', 'Industrial', 'Empaque y acabados', ['3', '2'], '1.5', ['11', '9']],
  ['09', 'Técnico de laboratorio', 'Calidad', 'Industrial', 'Laboratorio', ['6', '5'], null, ['12', '']],
  ['10', 'Auxiliar de limpieza', 'Servicios generales', 'Administración y finanzas', 'Servicios de planta', ['8', '7'], '1.2', null],
  ['11', 'Soldador', 'Mantenimiento', 'Operaciones', 'Taller metalmecánico', ['10', '11'], null, ['22.5', '18']],
  ['12', 'Supervisor de operaciones', 'Operaciones', 'Operaciones', 'Supervisión de planta', null, null, null],
];
const fuente = fs.readFileSync(new URL('../src/features/software-ergonomico/tipos/ficha.tipos.ts', import.meta.url), 'utf8');
const objeto = fuente.match(/export const FICHA_VACIA[^=]*= ([\s\S]*);\s*$/)?.[1];
if (!objeto) throw Error('No se encontró la plantilla de ficha.');
const plantilla = vm.runInNewContext(`(${objeto})`, Object.create(null), { timeout: 1000 });
function datosDemo(def) {
  const [codigo, puesto, area, gerencia, superintendencia, posturas, niosh, ocra] = def;
  const d = structuredClone(plantilla);
  const resumen = `DATOS FICTICIOS DE DEMOSTRACIÓN. Ejemplo ${codigo} para visualizar la tabla y probar filtros. Los valores fueron inventados y no corresponden a una evaluación de trabajadores.`;
  Object.assign(d.paso1, { puesto, area, gerencia, superintendencia, actividad: `Actividad ilustrativa de ${puesto.toLocaleLowerCase()}`, resumenPuesto: resumen });
  Object.assign(d.paso2, { duracionMinutos: '240', cotidiana: true, duracionMayor120: true, requiereIdentificacion: true });
  if (codigo !== '12') {
    for (const grupo of [d.paso3, d.paso4, d.paso5.esfuerzoManos, d.paso5.movimientosAltaFrecuencia]) {
      for (const f of Object.values(grupo)) Object.assign(f, { aplica: false, duracionDiaria: '' });
    }
  }
  if (posturas) {
    d.paso3.espaldaInclinadaAdelante = { aplica: true, duracionDiaria: '150' };
    d.evaluacion.posturaForzada = { d: posturas[0], i: posturas[1] };
  }
  if (niosh !== null) {
    d.paso4.levantamiento5kg = { aplica: true, duracionDiaria: '180' };
    d.evaluacion.levantamientoCargas.niosh = niosh;
  }
  if (ocra) {
    d.paso5.movimientosAltaFrecuencia.repiteMovimiento4vecesMinuto2horas = { aplica: true, duracionDiaria: '180' };
    d.evaluacion.movimientosRepetitivos = { dx: ocra[0], ix: ocra[1] };
  }
  return { nombre: puesto, description: resumen, payload: d };
}
let cookie = ''; let token = '';
async function pedir(ruta, metodo = 'GET', cuerpo) {
  const r = await fetch(`${api}/api/v1${ruta}`, { method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(cookie ? { Cookie: cookie } : {}) }, ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {}) });
  const nuevas = r.headers.getSetCookie();
  if (nuevas.length) cookie = nuevas.map(c => c.split(';')[0]).join('; ');
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(`La API rechazó ${metodo} ${ruta}: ${r.status}`);
  return json.data;
}
if (!process.env.HYCON_DEMO_EMAIL || !process.env.HYCON_DEMO_PASSWORD) throw Error('Define HYCON_DEMO_EMAIL y HYCON_DEMO_PASSWORD antes de ejecutar.');
try {
  const sesion = await pedir('/auth/login', 'POST', { email: process.env.HYCON_DEMO_EMAIL, password: process.env.HYCON_DEMO_PASSWORD });
  token = sesion.token;
  if (!token) throw Error('La sesión no devolvió un token de acceso.');
  const empresas = await pedir('/ergo/empresas');
  let empresa = empresas.find(e => e.nombre === empresaNombre);
  if (!empresa) empresa = await pedir('/ergo/empresas', 'POST', { nombre: empresaNombre });
  const existentes = await pedir(`/ergo/empresas/${empresa.id}/fichas`);
  const creadas = []; const omitidas = [];
  for (const def of definiciones) {
    const cuerpo = datosDemo(def);
    if (existentes.some(f => f.nombre === cuerpo.nombre)) { omitidas.push(cuerpo.nombre); continue; }
    const f = await pedir(`/ergo/empresas/${empresa.id}/fichas`, 'POST', cuerpo);
    creadas.push({ id: f.id, nombre: f.nombre });
  }
  const verificadas = await pedir(`/ergo/empresas/${empresa.id}/fichas`);
  for (const def of definiciones) {
    const esperado = datosDemo(def); const f = verificadas.find(f => f.nombre === esperado.nombre);
    if (!f) throw Error(`No se pudo verificar DEMO ${def[0]}.`);
    if (JSON.stringify(f.payload.evaluacion) !== JSON.stringify(esperado.payload.evaluacion)) {
      // JSONB puede reordenar claves: compara cada valor en lugar del orden del objeto.
      for (const [grupo, valores] of Object.entries(esperado.payload.evaluacion)) for (const [k, v] of Object.entries(valores)) {
        if (f.payload.evaluacion[grupo][k] !== v) throw Error(`Valor incorrecto en DEMO ${def[0]}.`);
      }
    }
  }
  console.log(JSON.stringify({ empresa: { id: empresa.id, nombre: empresa.nombre }, creadas, omitidas, totalVerificadas: verificadas.length }, null, 2));
} finally {
  if (cookie) await pedir('/auth/logout', 'POST').catch(() => console.error('No se pudo cerrar la sesión del script.'));
}
