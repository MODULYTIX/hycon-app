import { fechaParaCampo, hoyParaCampo } from '@/features/publicaciones/utilidades/lectura';

// Espejo de lo que devuelve el backend en /api/v1/posts
export interface Publicacion {
  postId: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  // active: publicado; inactive: borrador
  status: string;
  views: number;
  readingMinutes: number;
  authorName: string;
  publishedAt: string;
  createdAt: string;
}

// La portada no esta aqui: la gestiona la zona de imagen del formulario
export interface FormularioPublicacion {
  title: string;
  excerpt: string;
  content: string;
  // YYYY-MM-DD, el formato del campo de fecha
  publishedAt: string;
  status: 'active' | 'inactive';
}

export interface DatosPublicacion extends FormularioPublicacion {
  coverUrl: string;
}

// Funcion y no constante: la fecha por defecto es la del dia en que se abre el formulario
export const publicacionVacia = (): FormularioPublicacion => ({
  title: '',
  excerpt: '',
  content: '',
  publishedAt: hoyParaCampo(),
  status: 'active',
});

export const publicacionAFormulario = (publicacion: Publicacion): FormularioPublicacion => ({
  title: publicacion.title,
  excerpt: publicacion.excerpt ?? '',
  content: publicacion.content,
  publishedAt: fechaParaCampo(publicacion.publishedAt),
  status: publicacion.status === 'inactive' ? 'inactive' : 'active',
});

export const TEXTOS_ESTADO_PUBLICACION = { activo: 'Publicado', inactivo: 'Borrador' };
