// Persistencia del token en el navegador. Todo va envuelto en try/catch porque
// en modo incognito o con cookies bloqueadas localStorage puede lanzar excepcion.
const CLAVE_TOKEN = 'hycon.token';

export const leerToken = (): string | null => {
  try {
    return window.localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
};

export const guardarToken = (token: string): void => {
  try {
    window.localStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    // Sin almacenamiento la sesion solo dura lo que dure la pestana
  }
};

export const borrarToken = (): void => {
  try {
    window.localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // Nada que limpiar
  }
};
