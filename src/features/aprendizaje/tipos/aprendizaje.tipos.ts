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
}
