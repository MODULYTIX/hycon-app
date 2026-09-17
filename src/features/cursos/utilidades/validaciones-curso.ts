import type { DatosCurso } from '@/features/cursos/tipos/curso.tipos';
import {
  validarEnteroOpcional,
  validarNombre,
  validarPrecioObligatorio,
  validarPrecioOpcional,
  validarTextoOpcional,
  validarUrlOpcional,
} from '@/shared/utilidades/validaciones-comunes';
import { extraerIdYoutube } from '@/shared/utilidades/youtube';

// El video se reproduce dentro de la web, por eso solo vale un link de YouTube
export const validarYoutubeOpcional = (valor: string): string | undefined => {
  if (!valor.trim()) return undefined;
  if (valor.trim().length > 500) return 'La URL es demasiado larga';
  return extraerIdYoutube(valor) ? undefined : 'Debe ser un link de YouTube valido';
};

export type ErroresCurso = Partial<Record<keyof DatosCurso, string>>;

export const validarCurso = (datos: DatosCurso): ErroresCurso => {
  const errores: ErroresCurso = {
    name: validarNombre(datos.name),
    description: validarTextoOpcional(datos.description, 2000),
    price: validarPrecioObligatorio(datos.price),
    discountPrice: validarPrecioOpcional(datos.discountPrice, datos.price),
    durationMinutes: validarEnteroOpcional(datos.durationMinutes, 1, 'La duracion'),
    videoUrl: validarYoutubeOpcional(datos.videoUrl),
    thumbnailUrl: validarUrlOpcional(datos.thumbnailUrl),
  };

  return Object.fromEntries(
    Object.entries(errores).filter(([, mensaje]) => mensaje)
  ) as ErroresCurso;
};
