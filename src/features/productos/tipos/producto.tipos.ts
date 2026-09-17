// Espejo de lo que devuelve el backend en /api/v1/catalog/products.
// Los precios llegan como number: el mapper del backend ya convierte los Decimal.
export interface AgenciaEnvio {
  code: string;
  name: string;
}

export interface Producto {
  productId: number;
  name: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  color: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  shippingAgencies: AgenciaEnvio[];
  status: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface ProductoDetalle extends Producto {
  imageUrls: string[];
}

// Lo que escribe el administrador en el formulario: los numeros van como texto
// y el backend se encarga de convertirlos y validarlos otra vez.
export interface FormularioProducto {
  name: string;
  brand: string;
  model: string;
  color: string;
  price: string;
  discountPrice: string;
  stock: string;
  shippingAgencies: string[];
  description: string;
  status: 'active' | 'inactive';
}

// Cuerpo que se envia al guardar: el formulario mas la URL final de la imagen
export interface DatosProducto extends FormularioProducto {
  imageUrl: string;
}

export const PRODUCTO_VACIO: FormularioProducto = {
  name: '',
  brand: '',
  model: '',
  color: '',
  price: '',
  discountPrice: '',
  stock: '',
  shippingAgencies: [],
  description: '',
  status: 'active',
};

// Rellena el formulario de edicion con lo que ya hay guardado
export const productoAFormulario = (producto: Producto): FormularioProducto => ({
  name: producto.name,
  brand: producto.brand ?? '',
  model: producto.model ?? '',
  color: producto.color ?? '',
  price: String(producto.price),
  discountPrice: producto.discountPrice === null ? '' : String(producto.discountPrice),
  stock: String(producto.stock),
  shippingAgencies: producto.shippingAgencies.map((agencia) => agencia.code),
  description: producto.description ?? '',
  status: producto.status === 'inactive' ? 'inactive' : 'active',
});
