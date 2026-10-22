import { FICHA_VACIA, type FormularioFichaErgonomica, type FactorPostura } from '../tipos/ficha.tipos';
import { NOMBRES_POSTURAS, FACTORES_CARGAS, FACTORES_ESFUERZO, FACTORES_MOVIMIENTO } from '../componentes/organismos/fichas/catalogoFactores';
import { clasificarNiosh, clasificarOcra, clasificarPostura } from '../componentes/organismos/fichas/nivelesExposicion';

export type SeccionFicha = 'datos' | 'tarea' | 'posturas' | 'cargas' | 'repetitivos' | 'resumen';
export type GrupoFactor = 'posturas' | 'cargas' | 'repetitivos';
export const SECCIONES: { id: SeccionFicha; titulo: string; descripcion: string }[] = [
  { id: 'datos', titulo: 'Datos administrativos', descripcion: 'Identifica el puesto y el contexto de la evaluación.' },
  { id: 'tarea', titulo: 'Representatividad', descripcion: 'Registra la duración y frecuencia de la tarea observada.' },
  { id: 'posturas', titulo: 'Posturas forzadas', descripcion: 'Indica las posturas presentes y su duración diaria aproximada.' },
  { id: 'cargas', titulo: 'Manipulación de cargas', descripcion: 'Revisa las condiciones de levantamiento durante la jornada.' },
  { id: 'repetitivos', titulo: 'Movimientos repetitivos', descripcion: 'Identifica esfuerzos de manos, muñecas y movimientos frecuentes.' },
  { id: 'resumen', titulo: 'Resumen', descripcion: 'Revisa lo registrado, los criterios activados y lo que queda pendiente.' },
];
export interface FactorFicha {
  id: string; grupo: GrupoFactor; titulo: string; detalle?: string;
  valor: FactorPostura; umbral: number; estricto: boolean; soloSiNo: boolean;
}
export const GRUPOS: Record<GrupoFactor, string> = { posturas: 'Posturas forzadas', cargas: 'Manipulación de cargas', repetitivos: 'Movimientos repetitivos' };
export function factoresFicha(d: FormularioFichaErgonomica): FactorFicha[] {
  const crear = (id: string, grupo: GrupoFactor, titulo: string, valor: FactorPostura): FactorFicha => ({
    id, grupo, titulo, valor, umbral: id === 'vibracionBrazoMano' ? 30 : 120,
    estricto: ['impactoRepetido', 'vibracionBrazoMano'].includes(id), soloSiNo: id === 'levantamiento40kg',
  });
  return [
    ...Object.entries(NOMBRES_POSTURAS).map(([id, titulo]) => crear(id, 'posturas', titulo, d.paso3[id as keyof typeof d.paso3])),
    ...FACTORES_CARGAS.map(f => crear(f.llave, 'cargas', f.titulo, d.paso4[f.llave])),
    ...FACTORES_ESFUERZO.map(f => crear(f.llave, 'repetitivos', f.titulo, d.paso5.esfuerzoManos[f.llave])),
    crear('impactoRepetido', 'repetitivos', 'Impacto repetido', d.paso5.esfuerzoManos.impactoRepetido),
    crear('vibracionBrazoMano', 'repetitivos', 'Vibración de brazo-mano de moderada a alta', d.paso5.esfuerzoManos.vibracionBrazoMano),
    ...FACTORES_MOVIMIENTO.map(f => crear(f.llave, 'repetitivos', f.titulo, d.paso5.movimientosAltaFrecuencia[f.llave])),
  ].map(f => ({
    ...f,
    detalle: f.id === 'impactoRepetido' ? 'Usa manos o rodillas como martillo más de 10 veces por hora.'
      : f.id === 'vibracionBrazoMano' ? 'Referencia de duración: moderada, más de 30 min/día; alta, más de 120 min/día.' : undefined,
  }));
}
export const numeroValido = (s: string, max = Number.MAX_SAFE_INTEGER) => s.trim() !== '' && Number.isFinite(Number(s)) && Number(s) >= 0 && Number(s) <= max;
export function estadoFactor(f: FactorFicha): 'pendiente' | 'no' | 'registrado' | 'evaluar' {
  if (f.valor.aplica === null || f.valor.aplica === undefined) return 'pendiente';
  if (!f.valor.aplica) return 'no';
  if (f.soloSiNo) return 'evaluar';
  if (!numeroValido(f.valor.duracionDiaria, 1440)) return 'pendiente';
  return (f.estricto ? Number(f.valor.duracionDiaria) > f.umbral : Number(f.valor.duracionDiaria) >= f.umbral) ? 'evaluar' : 'registrado';
}
export const criterioFactor = (f: FactorFicha) => f.soloSiNo ? 'Se evalúa al responder Sí; no requiere minutos.' : `Se evalúa con ${f.estricto ? 'más de' : ''} ${f.umbral}${f.estricto ? '' : ' o más'} min/día.`.replace('con  ', 'con ');
export const motivoFactor = (f: FactorFicha) => f.soloSiNo ? 'Condición confirmada: 40 kg o más, al menos una vez al día.' : `${f.valor.duracionDiaria} min/día · criterio ${f.estricto ? '>' : '≥'} ${f.umbral} min.`;

export function resultadosFicha(d: FormularioFichaErgonomica) {
  return [
    { grupo: 'posturas' as const, titulo: 'Posturas · D / I', clasificar: clasificarPostura, campos: [
      { id: 'd', etiqueta: 'Lado derecho (D)', valor: d.evaluacion.posturaForzada.d },
      { id: 'i', etiqueta: 'Lado izquierdo (I)', valor: d.evaluacion.posturaForzada.i },
    ] },
    { grupo: 'cargas' as const, titulo: 'Levantamiento · NIOSH', clasificar: clasificarNiosh, campos: [
      { id: 'niosh', etiqueta: 'Índice de levantamiento', valor: d.evaluacion.levantamientoCargas.niosh },
    ] },
    { grupo: 'repetitivos' as const, titulo: 'Movimientos · OCRA', clasificar: clasificarOcra, campos: [
      { id: 'dx', etiqueta: 'Lado derecho (DX)', valor: d.evaluacion.movimientosRepetitivos.dx },
      { id: 'ix', etiqueta: 'Lado izquierdo (IX)', valor: d.evaluacion.movimientosRepetitivos.ix },
    ] },
  ];
}
export function resumenFicha(d: FormularioFichaErgonomica) {
  const factores = factoresFicha(d);
  const evaluar = factores.filter(f => estadoFactor(f) === 'evaluar');
  const pendientes = factores.filter(f => estadoFactor(f) === 'pendiente');
  const resultadosPendientes = resultadosFicha(d).filter(r => evaluar.some(f => f.grupo === r.grupo)).flatMap(r => r.campos.filter(c => !numeroValido(c.valor)));
  const datosPendientes = !d.paso1.puesto.trim() || !d.paso1.area.trim() || !numeroValido(d.paso2.duracionMinutos, 1440) || d.paso2.cotidiana === null;
  return { factores, evaluar, pendientes, resultadosPendientes,
    estado: datosPendientes || pendientes.length ? 'En registro' : resultadosPendientes.length ? 'Evaluación pendiente' : 'Registro completo' };
}

// Completa campos nuevos sin perder los valores ni extensiones de fichas anteriores.
export function normalizarFicha(payload: unknown): FormularioFichaErgonomica {
  function mezclar(base: unknown, valor: unknown): unknown {
    if (base !== null && typeof base === 'object' && !Array.isArray(base)) {
      const objeto = valor && typeof valor === 'object' && !Array.isArray(valor) ? valor as Record<string, unknown> : {};
      const salida: Record<string, unknown> = { ...objeto };
      for (const [k, v] of Object.entries(base)) salida[k] = mezclar(v, objeto[k]);
      return salida;
    }
    if (base === null) return typeof valor === 'boolean' ? valor : null;
    return typeof valor === typeof base ? valor : base;
  }
  const d = mezclar(FICHA_VACIA, payload) as FormularioFichaErgonomica;
  d.paso2.duracionMayor120 = numeroValido(d.paso2.duracionMinutos, 1440) && Number(d.paso2.duracionMinutos) >= 120;
  d.paso2.requiereIdentificacion = d.paso2.duracionMayor120 && d.paso2.cotidiana === true;
  return d;
}
export function actualizarFactor(d: FormularioFichaErgonomica, f: FactorFicha, valor: FactorPostura): FormularioFichaErgonomica {
  if (f.grupo === 'posturas') return { ...d, paso3: { ...d.paso3, [f.id]: valor } };
  if (f.grupo === 'cargas') return { ...d, paso4: { ...d.paso4, [f.id]: valor } };
  const subgrupo = f.id === 'repiteMovimiento4vecesMinuto2horas' ? 'movimientosAltaFrecuencia' : 'esfuerzoManos';
  return { ...d, paso5: { ...d.paso5, [subgrupo]: { ...d.paso5[subgrupo], [f.id]: valor } } };
}
export function validarFicha(d: FormularioFichaErgonomica): { seccion: SeccionFicha; mensaje: string } | null {
  if (d.paso2.duracionMinutos !== '' && !numeroValido(d.paso2.duracionMinutos, 1440)) return { seccion: 'tarea', mensaje: 'La duración de la tarea debe estar entre 0 y 1440 minutos.' };
  for (const f of factoresFicha(d)) {
    if (!f.soloSiNo && f.valor.duracionDiaria !== '' && !numeroValido(f.valor.duracionDiaria, 1440)) return { seccion: f.grupo, mensaje: `${f.titulo}: ingresa entre 0 y 1440 minutos.` };
  }
  for (const r of resultadosFicha(d)) for (const c of r.campos) {
    if (c.valor !== '' && !numeroValido(c.valor)) return { seccion: r.grupo, mensaje: `${c.etiqueta}: ingresa un número válido mayor o igual a cero.` };
  }
  return null;
}
