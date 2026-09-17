// Espejo de lo que devuelve el backend en /api/v1/catalog/courses
export interface Curso {
  courseId: number;
  name: string;
  description: string | null;
  videoUrl: string | null;
  // Id del video calculado por el backend a partir de videoUrl
  youtubeId: string | null;
  thumbnailUrl: string | null;
  durationMinutes: number | null;
  price: number;
  discountPrice: number | null;
  status: string;
  createdAt: string;
}

// La miniatura no esta aqui: la gestiona la zona de imagen del formulario
export interface FormularioCurso {
  name: string;
  description: string;
  videoUrl: string;
  durationMinutes: string;
  price: string;
  discountPrice: string;
  status: 'active' | 'inactive';
}

export interface DatosCurso extends FormularioCurso {
  thumbnailUrl: string;
}

export const CURSO_VACIO: FormularioCurso = {
  name: '',
  description: '',
  videoUrl: '',
  durationMinutes: '',
  price: '',
  discountPrice: '',
  status: 'active',
};

export const cursoAFormulario = (curso: Curso): FormularioCurso => ({
  name: curso.name,
  description: curso.description ?? '',
  videoUrl: curso.videoUrl ?? '',
  durationMinutes: curso.durationMinutes === null ? '' : String(curso.durationMinutes),
  price: String(curso.price),
  discountPrice: curso.discountPrice === null ? '' : String(curso.discountPrice),
  status: curso.status === 'inactive' ? 'inactive' : 'active',
});
