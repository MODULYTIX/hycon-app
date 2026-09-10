import type {
  FormularioCurso,
  FormularioProducto,
} from '@/features/administracion/tipos/catalogo.tipos';

// Estas reglas replican las del backend (catalog.schema.ts) para dar respuesta
// inmediata. El backend sigue siendo la autoridad: valida otra vez lo que llega.

export type ErroresProducto = Partial<Record<keyof FormularioProducto, string>>;
export type ErroresCurso = Partial<Record<keyof FormularioCurso, string>>;

const esUrlValida = (valor: string): boolean => {
  try {
    const url = new URL(valor);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const validarNombre = (valor: string): string | undefined => {
  const limpio = valor.trim();
  if (!limpio) return 'El nombre es obligatorio';
  if (limpio.length < 2) return 'Debe tener al menos 2 caracteres';
  if (limpio.length > 200) return 'No puede superar los 200 caracteres';
  return undefined;
};

const validarPrecioObligatorio = (valor: string): string | undefined => {
  if (!valor.trim()) return 'El precio es obligatorio';
  const numero = Number(valor);
  if (Number.isNaN(numero)) return 'Debe ser un numero';
  if (numero <= 0) return 'Debe ser mayor que cero';
  if (numero > 999999.99) return 'Supera el maximo permitido';
  return undefined;
};

// Los campos opcionales vacios se consideran ausentes, no cero
const validarPrecioOpcional = (valor: string, precio: string): string | undefined => {
  if (!valor.trim()) return undefined;
  const numero = Number(valor);
  if (Number.isNaN(numero)) return 'Debe ser un numero';
  if (numero <= 0) return 'Debe ser mayor que cero';
  const base = Number(precio);
  if (!Number.isNaN(base) && base > 0 && numero >= base) {
    return 'Debe ser menor que el precio';
  }
  return undefined;
};

const validarEnteroOpcional = (
  valor: string,
  minimo: number,
  etiqueta: string
): string | undefined => {
  if (!valor.trim()) return undefined;
  const numero = Number(valor);
  if (Number.isNaN(numero)) return 'Debe ser un numero';
  if (!Number.isInteger(numero)) return 'Debe ser un numero entero';
  if (numero < minimo) return `${etiqueta} minimo es ${minimo}`;
  return undefined;
};

const validarUrlOpcional = (valor: string): string | undefined => {
  if (!valor.trim()) return undefined;
  if (!esUrlValida(valor.trim())) return 'Debe ser una URL valida (http o https)';
  if (valor.trim().length > 500) return 'La URL es demasiado larga';
  return undefined;
};

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

export const validarCurso = (datos: FormularioCurso): ErroresCurso => {
  const errores: ErroresCurso = {};

  const name = validarNombre(datos.name);
  const price = validarPrecioObligatorio(datos.price);
  const discountPrice = validarPrecioOpcional(datos.discountPrice, datos.price);
  const durationMinutes = validarEnteroOpcional(datos.durationMinutes, 1, 'La duracion');
  const videoUrl = validarUrlOpcional(datos.videoUrl);
  const thumbnailUrl = validarUrlOpcional(datos.thumbnailUrl);

  if (name) errores.name = name;
  if (price) errores.price = price;
  if (discountPrice) errores.discountPrice = discountPrice;
  if (durationMinutes) errores.durationMinutes = durationMinutes;
  if (videoUrl) errores.videoUrl = videoUrl;
  if (thumbnailUrl) errores.thumbnailUrl = thumbnailUrl;

  return errores;
};

export const sinErroresCatalogo = (errores: Record<string, string | undefined>): boolean =>
  Object.values(errores).every((error) => !error);
