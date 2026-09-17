import type { DatosProducto } from '@/features/productos/tipos/producto.tipos';
import {
  validarEnteroOpcional,
  validarNombre,
  validarPrecioObligatorio,
  validarPrecioOpcional,
  validarTextoOpcional,
  validarUrlOpcional,
} from '@/shared/utilidades/validaciones-comunes';

export type ErroresProducto = Partial<Record<keyof DatosProducto, string>>;

export const validarProducto = (datos: DatosProducto): ErroresProducto => {
  const errores: ErroresProducto = {
    name: validarNombre(datos.name),
    brand: validarTextoOpcional(datos.brand, 100),
    model: validarTextoOpcional(datos.model, 100),
    color: validarTextoOpcional(datos.color, 50),
    price: validarPrecioObligatorio(datos.price),
    discountPrice: validarPrecioOpcional(datos.discountPrice, datos.price),
    stock: validarEnteroOpcional(datos.stock, 0, 'La cantidad'),
    description: validarTextoOpcional(datos.description, 2000),
    imageUrl: validarUrlOpcional(datos.imageUrl),
  };

  // Solo se devuelven las claves con error, para que el objeto vacio signifique "todo bien"
  return Object.fromEntries(
    Object.entries(errores).filter(([, mensaje]) => mensaje)
  ) as ErroresProducto;
};
