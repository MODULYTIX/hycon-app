// Preferencia de quien mira, no del curso: vive en este navegador y no viaja al servidor
const CLAVE_AUTOAVANCE = 'hycon.aula.autoavance';

export const leerAutoavance = (): boolean => {
  try {
    return window.localStorage.getItem(CLAVE_AUTOAVANCE) === '1';
  } catch {
    // Navegacion privada o almacenamiento bloqueado: se queda apagado
    return false;
  }
};

export const guardarAutoavance = (activo: boolean): void => {
  try {
    window.localStorage.setItem(CLAVE_AUTOAVANCE, activo ? '1' : '0');
  } catch {
    // Sin almacenamiento la preferencia vale solo para esta visita
  }
};
