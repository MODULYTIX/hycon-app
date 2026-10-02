import { peticion } from '@/shared/utilidades/cliente-http';
import type { Pagina, Paginacion } from '@/shared/utilidades/paginacion';
import type { Curso, DatosCurso } from '@/features/cursos/tipos/curso.tipos';
import { POR_PAGINA, type EstadoListado } from '@/features/productos/servicios/productos.api';

const BASE = '/api/v1/catalog/courses';

export const listarCursosApi = (
  estado: EstadoListado,
  pagina: number,
  senal?: AbortSignal,
  porPagina = POR_PAGINA
): Promise<Pagina<Curso>> =>
  peticion<{ cursos: Curso[]; paginacion: Paginacion }>(
    `${BASE}?estado=${estado}&pagina=${pagina}&porPagina=${porPagina}`,
    { senal }
  ).then((r) => ({ elementos: r.cursos, paginacion: r.paginacion }));

export const obtenerCursoApi = (uuid: string, senal?: AbortSignal) =>
  peticion<{ curso: Curso }>(`${BASE}/${uuid}`, { senal }).then((r) => r.curso);

export const crearCursoApi = (datos: DatosCurso) =>
  peticion<{ curso: Curso }>(BASE, {
    metodo: 'POST',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.curso);

export const actualizarCursoApi = (uuid: string, datos: DatosCurso) =>
  peticion<{ curso: Curso }>(`${BASE}/${uuid}`, {
    metodo: 'PUT',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.curso);

export const eliminarCursoApi = (uuid: string) =>
  peticion<void>(`${BASE}/${uuid}`, { metodo: 'DELETE', autenticada: true });
