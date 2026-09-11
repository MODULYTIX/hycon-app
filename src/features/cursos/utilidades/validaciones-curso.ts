import type { FormularioCurso } from '@/features/cursos/tipos/curso.tipos';
import {
  validarEnteroOpcional,
  validarNombre,
  validarPrecioObligatorio,
  validarPrecioOpcional,
  validarUrlOpcional,
} from '@/shared/utilidades/validaciones-comunes';

export type ErroresCurso = Partial<Record<keyof FormularioCurso, string>>;

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
