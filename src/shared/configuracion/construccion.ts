/**
 * Reglas de lo que se publica. Viven aqui, y no dentro de vite.config, para
 * poder comprobarlas con una prueba: si alguna se cae sin querer, el codigo
 * fuente y los mensajes internos quedarian a la vista de cualquiera que abra
 * las herramientas del navegador.
 */

// Variables del .env que se exponen al navegador. Cualquier variable con estos
// prefijos acaba en el bundle publico: no poner secretos con ellos.
export const PREFIJOS_ENTORNO = ['VITE_', 'HYCON_'] as const;

export interface OpcionesConstruccion {
  sourcemap: boolean;
  minify: 'esbuild';
  target: string;
}

export const CONSTRUCCION: OpcionesConstruccion = {
  // Sin mapas de codigo: publicarlos equivale a publicar el codigo fuente
  sourcemap: false,
  minify: 'esbuild',
  target: 'es2022',
};

export interface LimpiezaDeCodigo {
  drop?: ('console' | 'debugger')[];
  legalComments?: 'none';
}

/** En produccion no viaja ningun mensaje de depuracion ni ningun debugger. */
export const limpiezaDeCodigo = (produccion: boolean): LimpiezaDeCodigo =>
  produccion ? { drop: ['console', 'debugger'], legalComments: 'none' } : {};
