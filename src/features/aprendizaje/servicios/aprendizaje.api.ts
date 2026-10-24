import { peticion } from '@/shared/utilidades/cliente-http';
import { parametrosCuenta, type FiltrosCuenta } from '@/shared/utilidades/filtros-listado';
import type { Pagina, Paginacion } from '@/shared/utilidades/paginacion';
import type { CursoComprado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

export const POR_PAGINA = 6;

/** Los cursos comprados: el backend filtra, ordena y pagina. */
export const listarMisCursosApi = (
  pagina = 1,
  senal?: AbortSignal,
  filtros: FiltrosCuenta = {}
): Promise<Pagina<CursoComprado>> =>
  peticion<{ cursos: CursoComprado[]; paginacion: Paginacion }>(
    `/api/v1/lms/mis-cursos?pagina=${pagina}&porPagina=${POR_PAGINA}${parametrosCuenta(filtros)}`,
    { autenticada: true, senal }
  ).then((r) => ({ elementos: r.cursos, paginacion: r.paginacion }));
