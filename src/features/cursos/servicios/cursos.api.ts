import { peticion } from '@/shared/utilidades/cliente-http';
import type { Curso, FormularioCurso } from '@/features/cursos/tipos/curso.tipos';
import type { EstadoListado } from '@/features/productos/servicios/productos.api';

const BASE = '/api/v1/catalog/courses';

export const listarCursosApi = (estado: EstadoListado = 'active', senal?: AbortSignal) =>
  peticion<{ cursos: Curso[] }>(`${BASE}?estado=${estado}`, { senal }).then((r) => r.cursos);

export const obtenerCursoApi = (courseId: number, senal?: AbortSignal) =>
  peticion<{ curso: Curso }>(`${BASE}/${courseId}`, { senal }).then((r) => r.curso);

export const crearCursoApi = (datos: FormularioCurso) =>
  peticion<{ curso: Curso }>(BASE, {
    metodo: 'POST',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.curso);
