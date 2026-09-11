// Reglas compartidas por los formularios del catalogo. Replican las del backend
// (catalog.schema.ts) para dar respuesta inmediata; el backend valida otra vez.

export const esUrlValida = (valor: string): boolean => {
  try {
    const url = new URL(valor);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validarNombre = (valor: string): string | undefined => {
  const limpio = valor.trim();
  if (!limpio) return 'El nombre es obligatorio';
  if (limpio.length < 2) return 'Debe tener al menos 2 caracteres';
  if (limpio.length > 200) return 'No puede superar los 200 caracteres';
  return undefined;
};

export const validarPrecioObligatorio = (valor: string): string | undefined => {
  if (!valor.trim()) return 'El precio es obligatorio';
  const numero = Number(valor);
  if (Number.isNaN(numero)) return 'Debe ser un numero';
  if (numero <= 0) return 'Debe ser mayor que cero';
  if (numero > 999999.99) return 'Supera el maximo permitido';
  return undefined;
};

// Los campos opcionales vacios se consideran ausentes, no cero
export const validarPrecioOpcional = (valor: string, precio: string): string | undefined => {
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

export const validarEnteroOpcional = (
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

export const validarUrlOpcional = (valor: string): string | undefined => {
  if (!valor.trim()) return undefined;
  if (!esUrlValida(valor.trim())) return 'Debe ser una URL valida (http o https)';
  if (valor.trim().length > 500) return 'La URL es demasiado larga';
  return undefined;
};

export const sinErroresCatalogo = (errores: Record<string, string | undefined>): boolean =>
  Object.values(errores).every((error) => !error);
