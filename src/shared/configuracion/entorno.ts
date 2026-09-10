// Configuracion que llega desde las variables de entorno.
//
// Vite solo expone al navegador las variables cuyo nombre empieza por alguno de
// los prefijos declarados en `envPrefix` (vite.config.ts): VITE_ y HYCON_.
// Una variable sin ese prefijo nunca llega al bundle, aunque este en el .env.

const URL_POR_DEFECTO = 'http://localhost:4000';

// Solo interesan las dos claves de la URL, no el resto de ImportMetaEnv
type EntornoApi = Pick<ImportMetaEnv, 'HYCON_API_URL' | 'VITE_API_URL'>;

// Se acepta VITE_API_URL como respaldo para no romper despliegues que ya la tengan
export const resolverUrlApi = (entorno: EntornoApi): string => {
  const url = entorno.HYCON_API_URL || entorno.VITE_API_URL || URL_POR_DEFECTO;
  // Se quita la barra final para que las rutas se concatenen sin duplicarla
  return url.replace(/\/+$/, '');
};

export const URL_API = resolverUrlApi(import.meta.env);
