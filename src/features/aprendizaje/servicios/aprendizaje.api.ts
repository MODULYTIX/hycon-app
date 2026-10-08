import { peticion } from '@/shared/utilidades/cliente-http';
import type { CursoComprado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

export const listarMisCursosApi = (senal?: AbortSignal) =>
  peticion<{ cursos: CursoComprado[] }>('/api/v1/lms/mis-cursos', {
    autenticada: true,
    senal,
  }).then((r) => r.cursos);
