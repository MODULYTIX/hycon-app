import type { DatosPublicacion } from '@/features/publicaciones/tipos/publicacion.tipos';
import { validarTextoOpcional, validarUrlOpcional } from '@/shared/utilidades/validaciones-comunes';
import { textoPlano } from '@/shared/utilidades/texto-enriquecido';

// Replican publicacionSchema del backend para avisar antes de enviar
export const MAXIMO_TITULO = 200;
export const MAXIMO_RESUMEN = 300;
export const MINIMO_CONTENIDO = 20;

export type ErroresPublicacion = Partial<Record<keyof DatosPublicacion, string>>;

const validarTitulo = (valor: string) => {
  const limpio = valor.trim();
  if (!limpio) return 'El título es obligatorio';
  if (limpio.length < 3) return 'Debe tener al menos 3 caracteres';
  if (limpio.length > MAXIMO_TITULO) return `No puede superar los ${MAXIMO_TITULO} caracteres`;
  return undefined;
};

// El minimo se mide sobre el texto visible: un titulo vacio o una lista sin texto no cuentan
const validarContenido = (valor: string) => {
  const limpio = textoPlano(valor);
  if (!limpio) return 'El contenido es obligatorio';
  if (limpio.length < MINIMO_CONTENIDO) return `Escribe al menos ${MINIMO_CONTENIDO} caracteres`;
  return undefined;
};

const validarFecha = (valor: string) => {
  if (!valor) return 'Elige la fecha de publicación';
  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  const valida =
    /^\d{4}-\d{2}-\d{2}$/.test(valor) && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
  return valida ? undefined : 'La fecha no es válida';
};

export const validarPublicacion = (datos: DatosPublicacion): ErroresPublicacion => {
  const errores: ErroresPublicacion = {
    title: validarTitulo(datos.title),
    excerpt: validarTextoOpcional(datos.excerpt, MAXIMO_RESUMEN),
    content: validarContenido(datos.content),
    publishedAt: validarFecha(datos.publishedAt),
    coverUrl: validarUrlOpcional(datos.coverUrl),
  };

  return Object.fromEntries(
    Object.entries(errores).filter(([, mensaje]) => mensaje)
  ) as ErroresPublicacion;
};
