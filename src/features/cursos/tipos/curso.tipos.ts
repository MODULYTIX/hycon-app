// Espejo de lo que devuelve el backend en /api/v1/catalog/courses
export interface Curso {
  courseId: number;
  name: string;
  description: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  durationMinutes: number | null;
  price: number;
  discountPrice: number | null;
  status: string;
  createdAt: string;
}

export interface FormularioCurso {
  name: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationMinutes: string;
  price: string;
  discountPrice: string;
  status: 'active' | 'inactive';
}

export const CURSO_VACIO: FormularioCurso = {
  name: '',
  description: '',
  videoUrl: '',
  thumbnailUrl: '',
  durationMinutes: '',
  price: '',
  discountPrice: '',
  status: 'active',
};
