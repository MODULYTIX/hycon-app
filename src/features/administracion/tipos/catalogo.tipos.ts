// Espejo de lo que devuelve el backend en /api/v1/catalog.
// Los precios llegan como number: el mapper del backend ya convierte los Decimal.
export interface Producto {
  productId: number;
  name: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  status: string;
  imageUrl: string | null;
  createdAt: string;
}

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

// Lo que escribe el administrador en el formulario: todo texto,
// el backend se encarga de convertir y validar
export interface FormularioProducto {
  name: string;
  brand: string;
  model: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  imageUrl: string;
  status: 'active' | 'inactive';
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

export const PRODUCTO_VACIO: FormularioProducto = {
  name: '',
  brand: '',
  model: '',
  description: '',
  price: '',
  discountPrice: '',
  stock: '',
  imageUrl: '',
  status: 'active',
};

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
