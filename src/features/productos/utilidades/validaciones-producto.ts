import type { FormularioProducto } from '@/features/productos/tipos/producto.tipos';
import {
  validarEnteroOpcional,
  validarNombre,
  validarPrecioObligatorio,
  validarPrecioOpcional,
  validarUrlOpcional,
} from '@/shared/utilidades/validaciones-comunes';

export type ErroresProducto = Partial<Record<keyof FormularioProducto, string>>;

export const validarProducto = (datos: FormularioProducto): ErroresProducto => {
  const errores: ErroresProducto = {};

  const name = validarNombre(datos.name);
  const price = validarPrecioObligatorio(datos.price);
  const discountPrice = validarPrecioOpcional(datos.discountPrice, datos.price);
  const stock = validarEnteroOpcional(datos.stock, 0, 'El stock');
  const imageUrl = validarUrlOpcional(datos.imageUrl);

  if (name) errores.name = name;
  if (price) errores.price = price;
  if (discountPrice) errores.discountPrice = discountPrice;
  if (stock) errores.stock = stock;
  if (imageUrl) errores.imageUrl = imageUrl;

  return errores;
};
