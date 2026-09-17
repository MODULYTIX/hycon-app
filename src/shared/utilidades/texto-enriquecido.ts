import { esUrlValida } from '@/shared/utilidades/validaciones-comunes';

const ENTIDADES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

// Texto visible de un HTML: para contar palabras, validar el minimo o resumir en el listado.
// Replica textoPlano del backend (posts.contenido.ts).
export const textoPlano = (html: string): string =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (entidad) => ENTIDADES[entidad])
    .replace(/\s+/g, ' ')
    .trim();

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Convierte lo que escribe el usuario en un href seguro:
 * "hycon.lat" -> "https://hycon.lat", "ana@hycon.lat" -> "mailto:ana@hycon.lat".
 * Cualquier otro esquema (javascript:, data:...) devuelve null.
 */
export const normalizarEnlace = (entrada: string): string | null => {
  const valor = entrada.trim();
  if (!valor) return null;

  if (/^mailto:/i.test(valor)) {
    return CORREO.test(valor.slice(7)) ? valor : null;
  }
  if (CORREO.test(valor)) return `mailto:${valor}`;

  // Sin esquema se asume web; con un esquema distinto de http(s) se rechaza
  const tieneEsquema = /^[a-z][a-z0-9+.-]*:/i.test(valor);
  const candidato = tieneEsquema ? valor : `https://${valor}`;
  if (!esUrlValida(candidato)) return null;

  // "https://hola" no es una direccion real: se exige un dominio con punto
  const { hostname } = new URL(candidato);
  return hostname.includes('.') || hostname === 'localhost' ? candidato : null;
};
