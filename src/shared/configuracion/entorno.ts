// Configuracion que llega desde las variables de entorno.
//
// Vite solo expone al navegador las variables cuyo nombre empieza por alguno de
// los prefijos declarados en `envPrefix` (vite.config.ts): VITE_ y HYCON_.
// Una variable sin ese prefijo nunca llega al bundle, aunque este en el .env.

const URL_POR_DEFECTO = 'http://localhost:4000';

// Solo interesan las dos claves de la URL, no el resto de ImportMetaEnv
type EntornoApi = Pick<ImportMetaEnv, 'HYCON_API_URL' | 'VITE_API_URL'>;

// Al configurar el despliegue es facil pegar la linea entera ("HYCON_API_URL=https://...")
// en la casilla del valor. Se limpia para no acabar pidiendo una direccion relativa.
const limpiar = (valor: string): string =>
  valor.trim().replace(/^(?:HYCON_API_URL|VITE_API_URL)\s*=\s*/i, '').replace(/^['"]|['"]$/g, '');

// Se acepta VITE_API_URL como respaldo para no romper despliegues que ya la tengan
export const resolverUrlApi = (entorno: EntornoApi): string => {
  const configurada = limpiar(entorno.HYCON_API_URL || entorno.VITE_API_URL || '');

  // Una direccion sin http(s) daria una URL relativa y el navegador pediria los
  // datos al propio sitio; antes que fallar sin explicacion, se avisa y se usa la local
  if (configurada && !/^https?:\/\//i.test(configurada)) {
    console.error(
      `[configuracion] HYCON_API_URL no es una direccion valida: "${configurada}". Debe empezar por http:// o https://. Se usa ${URL_POR_DEFECTO}.`
    );
    return URL_POR_DEFECTO;
  }

  // Se quita la barra final para que las rutas se concatenen sin duplicarla
  return (configurada || URL_POR_DEFECTO).replace(/\/+$/, '');
};

export const URL_API = resolverUrlApi(import.meta.env);
