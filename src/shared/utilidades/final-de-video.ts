// Con el video en los ultimos segundos la parte ya cuenta como vista, aunque se
// haya saltado hasta ahi: lo que importa es que llego al final, no como llego.
export const SEGUNDOS_PARA_EL_FINAL = 5;

/**
 * true cuando el video esta en su tramo final. En videos muy cortos no basta
 * con los ultimos 5 segundos (serian casi todo el video), asi que ademas se
 * pide haber pasado de la mitad.
 */
export const estaEnElFinal = (actual: number, duracion: number): boolean => {
  if (!Number.isFinite(duracion) || duracion <= 0 || actual <= 0) return false;
  return actual >= Math.max(duracion - SEGUNDOS_PARA_EL_FINAL, duracion / 2);
};
