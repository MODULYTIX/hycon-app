/**
 * El token de acceso vive solo en memoria: no se guarda en localStorage porque
 * cualquier script inyectado en la pagina podria leerlo de ahi. Al recargar se
 * pierde a proposito y se recupera con la cookie httpOnly de sesion.
 */
let tokenActual: string | null = null;

export const leerToken = (): string | null => tokenActual;

export const guardarToken = (token: string): void => {
  tokenActual = token;
};

export const borrarToken = (): void => {
  tokenActual = null;
};

// Marca sin datos sensibles: solo indica que vale la pena intentar recuperar la sesion
// al cargar. Evita una peticion (y un 401) en cada visita de alguien sin cuenta.
const CLAVE_HAY_SESION = 'hycon.haySesion';
// Donde las versiones anteriores guardaban el token; se borra al arrancar
const CLAVE_TOKEN_ANTIGUO = 'hycon.token';

const almacen = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    // En modo incognito estricto o con almacenamiento bloqueado puede lanzar
    return null;
  }
};

export const marcarSesionActiva = (activa: boolean): void => {
  try {
    if (activa) almacen()?.setItem(CLAVE_HAY_SESION, '1');
    else almacen()?.removeItem(CLAVE_HAY_SESION);
  } catch {
    // Sin almacenamiento simplemente se intentara recuperar la sesion siempre
  }
};

export const haySesionMarcada = (): boolean => {
  try {
    return almacen()?.getItem(CLAVE_HAY_SESION) === '1';
  } catch {
    return false;
  }
};

export const limpiarTokenAntiguo = (): void => {
  try {
    almacen()?.removeItem(CLAVE_TOKEN_ANTIGUO);
  } catch {
    // Nada que limpiar
  }
};
