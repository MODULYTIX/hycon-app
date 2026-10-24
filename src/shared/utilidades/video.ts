// Como se guarda un video que esta en nuestro almacen
const PREFIJOS = ['r2:', 'stream:'];

/** true cuando el video es un archivo nuestro y no un enlace de YouTube. */
export const esVideoSubido = (valor: string): boolean =>
  PREFIJOS.some((prefijo) => valor.trim().startsWith(prefijo));

/** Lo que se le muestra al administrador en lugar de la referencia cruda. */
export const nombreDeVideoSubido = (valor: string): string => {
  const limpio = valor.trim();
  if (limpio.startsWith('stream:')) return 'Video subido a Cloudflare Stream';

  const archivo = limpio.slice('r2:'.length).split('/').pop();
  return archivo ? `Video subido (${archivo})` : 'Video subido';
};
