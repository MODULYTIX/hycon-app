// Lo que se guarda en el navegador: solo la referencia, no el precio ni el nombre.
// Los datos se piden al backend al abrir el carrito, asi nunca se muestra un precio viejo.
export type TipoItem = 'producto' | 'curso';

export interface LineaCarrito {
  tipo: TipoItem;
  uuid: string;
  cantidad: number;
}

// La linea ya resuelta con lo que responde el catalogo
export interface LineaDetallada extends LineaCarrito {
  nombre: string;
  precio: number;
  precioAnterior: number | null;
  imagen: string | null;
  // Solo los productos tienen tope de unidades; los cursos se compran una vez
  stock: number | null;
  ruta: string;
}
