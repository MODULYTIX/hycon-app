// Espejo de lo que devuelve el backend en /api/v1/catalog/products.
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

export interface ProductoDetalle extends Producto {
  imageUrls: string[];
}

// Lo que escribe el administrador en el formulario: todo texto.
// El backend se encarga de convertir y validar.
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
