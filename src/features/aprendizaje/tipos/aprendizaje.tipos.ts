// Espejo de lo que devuelve el backend en /api/v1/lms/mis-cursos
export interface CursoComprado {
  uuid: string;
  name: string;
  description: string | null;
  videoUrl: string | null;
  youtubeId: string | null;
  thumbnailUrl: string | null;
  durationMinutes: number | null;
  // Fecha del pedido con el que se obtuvo el acceso
  compradoEl: string;
  partes: number;
  vistas: number;
  // true cuando vio todas las partes y ya puede pedir el certificado
  completado: boolean;
  // Codigo del certificado si ya lo emitio
  certificado: string | null;
}

export interface ParteProgreso {
  uuid: string;
  titulo: string;
  posicion: number;
  vista: boolean;
}

export interface Certificado {
  codigo: string;
  // Nombre confirmado al emitirlo; ya no cambia
  nombre: string;
  curso: string;
  duracionMinutos: number | null;
  emitidoEl: string;
}

export interface ProgresoCurso {
  cursoUuid: string;
  curso: string;
  partes: ParteProgreso[];
  vistas: number;
  total: number;
  completado: boolean;
  certificado: Certificado | null;
}
