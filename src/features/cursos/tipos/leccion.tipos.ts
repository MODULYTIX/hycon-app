// Espejo de lo que devuelve el backend en /catalog/courses/{uuid}/lecciones
export interface Leccion {
  uuid: string;
  titulo: string;
  descripcion: string | null;
  duracionMinutos: number | null;
  posicion: number;
  esMuestra: boolean;
  // true cuando hay que comprar el curso para verla
  bloqueada: boolean;
  // El backend solo manda el video de lo que este usuario puede ver
  videoUrl: string | null;
  youtubeId: string | null;
  // Segundos que se dejan ver de la muestra; null cuando se puede ver entera
  limiteSegundos: number | null;
}

export interface Temario {
  cursoUuid: string;
  tieneAcceso: boolean;
  previewSegundos: number;
  lecciones: Leccion[];
}

// Lo que escribe el administrador en el formulario de la leccion
export interface FormularioLeccion {
  title: string;
  description: string;
  videoUrl: string;
  durationMinutes: string;
  esMuestra: boolean;
}

export const LECCION_VACIA: FormularioLeccion = {
  title: '',
  description: '',
  videoUrl: '',
  durationMinutes: '',
  esMuestra: false,
};

export const leccionAFormulario = (leccion: Leccion): FormularioLeccion => ({
  title: leccion.titulo,
  description: leccion.descripcion ?? '',
  videoUrl: leccion.videoUrl ?? '',
  durationMinutes: leccion.duracionMinutos === null ? '' : String(leccion.duracionMinutos),
  esMuestra: leccion.esMuestra,
});
