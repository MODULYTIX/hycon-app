// Espejo de lo que devuelve el backend en /api/v1/catalog/courses
export interface Curso {
  // Identificador publico: el correlativo de la base no sale del backend
  uuid: string;
  name: string;
  description: string | null;
  videoUrl: string | null;
  // Id del video calculado por el backend a partir de videoUrl
  youtubeId: string | null;
  thumbnailUrl: string | null;
  durationMinutes: number | null;
  // Segundos de la leccion de muestra que ve quien no ha comprado
  previewSegundos: number;
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
  previewSegundos: string;
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
  previewSegundos: '60',
  price: '',
  discountPrice: '',
  status: 'active',
};

export const cursoAFormulario = (curso: Curso): FormularioCurso => ({
  name: curso.name,
  description: curso.description ?? '',
  videoUrl: curso.videoUrl ?? '',
  durationMinutes: curso.durationMinutes === null ? '' : String(curso.durationMinutes),
  previewSegundos: String(curso.previewSegundos ?? 60),
  price: String(curso.price),
  discountPrice: curso.discountPrice === null ? '' : String(curso.discountPrice),
  status: curso.status === 'inactive' ? 'inactive' : 'active',
});
