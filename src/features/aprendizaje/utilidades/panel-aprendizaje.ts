import type { CursoComprado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

export type EstadoCurso = 'sin-empezar' | 'en-curso' | 'terminado';

/** Lo que lleva visto del curso, de 0 a 100. */
export const porcentajeVisto = (curso: CursoComprado): number =>
  curso.partes > 0 ? Math.round((curso.vistas / curso.partes) * 100) : 0;

export const estadoDe = (curso: CursoComprado): EstadoCurso => {
  if (curso.completado) return 'terminado';
  return curso.vistas > 0 ? 'en-curso' : 'sin-empezar';
};

// Lo que dice el boton segun por donde va
export const ACCION: Record<EstadoCurso, string> = {
  'sin-empezar': 'Empezar curso',
  'en-curso': 'Reanudar',
  terminado: 'Repasar',
};

export interface Resumen {
  porTerminar: number;
  terminados: number;
  certificados: number;
}

export const resumir = (cursos: CursoComprado[]): Resumen => ({
  porTerminar: cursos.filter((curso) => !curso.completado).length,
  terminados: cursos.filter((curso) => curso.completado).length,
  certificados: cursos.filter((curso) => curso.certificado !== null).length,
});

export type Pestana = 'en-curso' | 'terminados' | 'todos';

export const filtrarPorPestana = (cursos: CursoComprado[], pestana: Pestana): CursoComprado[] => {
  if (pestana === 'terminados') return cursos.filter((curso) => curso.completado);
  if (pestana === 'en-curso') return cursos.filter((curso) => !curso.completado);
  return cursos;
};

/** Saluda segun la hora del dispositivo de quien mira. */
export const saludoPorHora = (fecha: Date): string => {
  const hora = fecha.getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
};
