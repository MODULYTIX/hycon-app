import { textoPlano } from '@/shared/utilidades/texto-enriquecido';

// Resumen para las tarjetas: el que escribio el autor o, si falta, el inicio del articulo
export const resumenDe = (publicacion: { excerpt: string | null; content: string }, largo = 180): string => {
  const texto = publicacion.excerpt?.trim() || textoPlano(publicacion.content);
  return texto.length > largo ? `${texto.slice(0, largo).trimEnd()}...` : texto;
};
