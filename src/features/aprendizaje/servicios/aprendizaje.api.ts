import { peticion } from '@/shared/utilidades/cliente-http';
import { parametrosCuenta, type FiltrosCuenta } from '@/shared/utilidades/filtros-listado';
import { paginaDe, type Pagina, type Paginacion } from '@/shared/utilidades/paginacion';
import type {
  Certificado,
  CursoComprado,
  ProgresoCurso,
} from '@/features/aprendizaje/tipos/aprendizaje.tipos';

// Los cursos de una cuenta son unas decenas: caben en una pagina y asi las
// pestanas cuentan sobre todos, no sobre un trozo
export const POR_PAGINA = 50;

/** Los cursos comprados: el backend filtra, ordena y pagina. */
export const listarMisCursosApi = (
  pagina = 1,
  senal?: AbortSignal,
  filtros: FiltrosCuenta = {}
): Promise<Pagina<CursoComprado>> =>
  peticion<{ cursos: CursoComprado[]; paginacion: Paginacion }>(
    `/api/v1/lms/mis-cursos?pagina=${pagina}&porPagina=${POR_PAGINA}${parametrosCuenta(filtros)}`,
    { autenticada: true, senal }
  ).then((r) => paginaDe(r.cursos, r.paginacion));

/** Comprueba un certificado por su codigo. Publica: no hace falta sesion. */
export const verificarCertificadoApi = (codigo: string, senal?: AbortSignal) =>
  peticion<{ certificado: Certificado }>(
    `/api/v1/lms/certificados/${encodeURIComponent(codigo)}`,
    { senal }
  ).then((r) => r.certificado);

const BASE_CURSO = (cursoUuid: string) => `/api/v1/lms/cursos/${cursoUuid}`;

/** Partes vistas del curso y, si ya esta, el certificado. */
export const obtenerProgresoApi = (cursoUuid: string, senal?: AbortSignal) =>
  peticion<{ progreso: ProgresoCurso }>(`${BASE_CURSO(cursoUuid)}/progreso`, {
    autenticada: true,
    senal,
  }).then((r) => r.progreso);

/** Marca una parte como vista. Repetirlo no cambia nada. */
export const marcarParteVistaApi = (cursoUuid: string, leccionUuid: string) =>
  peticion<{ progreso: ProgresoCurso }>(
    `${BASE_CURSO(cursoUuid)}/partes/${leccionUuid}/vista`,
    { metodo: 'POST', autenticada: true }
  ).then((r) => r.progreso);

/** Emite el certificado con el nombre confirmado. El servidor solo lo permite una vez. */
export const emitirCertificadoApi = (cursoUuid: string, nombre: string) =>
  peticion<{ certificado: Certificado }>(`${BASE_CURSO(cursoUuid)}/certificado`, {
    metodo: 'POST',
    cuerpo: { nombre },
    autenticada: true,
  }).then((r) => r.certificado);
