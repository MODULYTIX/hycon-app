import type { LineaCarrito, TipoItem } from '@/features/carrito/tipos/carrito.tipos';

const CLAVE = 'hycon.carrito';
const EVENTO = 'hycon:carrito';

// Un curso se compra una sola vez; de un producto se pueden llevar varias unidades
const MAXIMO = 99;

const esLinea = (valor: unknown): valor is LineaCarrito => {
  const linea = valor as LineaCarrito | null;
  return Boolean(
    linea &&
      (linea.tipo === 'producto' || linea.tipo === 'curso') &&
      typeof linea.uuid === 'string' &&
      linea.uuid.length > 0 &&
      Number.isSafeInteger(linea.cantidad) &&
      linea.cantidad > 0
  );
};

/** Lo guardado en el navegador. Si esta corrupto o es de una version vieja, se ignora. */
export const leerCarrito = (): LineaCarrito[] => {
  try {
    const guardado: unknown = JSON.parse(window.localStorage.getItem(CLAVE) || '[]');
    return Array.isArray(guardado) ? guardado.filter(esLinea) : [];
  } catch {
    return [];
  }
};

// Cada cambio avisa a toda la interfaz: el contador del encabezado se entera sin recargar
const guardar = (lineas: LineaCarrito[]) => {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(lineas));
  } catch {
    // Si el navegador no deja escribir (modo privado lleno), el carrito sigue en pantalla
  }
  window.dispatchEvent(new CustomEvent(EVENTO));
  return lineas;
};

const topeDe = (tipo: TipoItem, stock?: number | null) =>
  tipo === 'curso' ? 1 : Math.min(stock ?? MAXIMO, MAXIMO);

/**
 * Suma unidades de un producto o agrega el curso. Devuelve false si no cabe mas,
 * para que la pagina avise en lugar de guardar una cantidad imposible.
 */
export const agregarAlCarrito = (
  { tipo, uuid, cantidad = 1 }: { tipo: TipoItem; uuid: string; cantidad?: number },
  stock?: number | null
): boolean => {
  const lineas = leerCarrito();
  const existente = lineas.find((linea) => linea.uuid === uuid);
  const tope = topeDe(tipo, stock);
  const total = (existente?.cantidad ?? 0) + cantidad;

  if (cantidad < 1 || total > tope) return false;

  if (existente) existente.cantidad = total;
  else lineas.push({ tipo, uuid, cantidad });

  guardar(lineas);
  return true;
};

export const cambiarCantidad = (uuid: string, cantidad: number): LineaCarrito[] => {
  if (cantidad < 1) return quitarDelCarrito(uuid);
  return guardar(
    leerCarrito().map((linea) =>
      linea.uuid === uuid ? { ...linea, cantidad: Math.min(cantidad, MAXIMO) } : linea
    )
  );
};

export const quitarDelCarrito = (uuid: string): LineaCarrito[] =>
  guardar(leerCarrito().filter((linea) => linea.uuid !== uuid));

export const vaciarCarrito = (): LineaCarrito[] => guardar([]);

// Unidades totales, que es lo que se pinta en el globo del encabezado
export const contarItems = (lineas = leerCarrito()): number =>
  lineas.reduce((suma, linea) => suma + linea.cantidad, 0);

/** Avisa de cualquier cambio del carrito, tambien si viene de otra pestaña. */
export const suscribirseAlCarrito = (alCambiar: () => void): (() => void) => {
  window.addEventListener(EVENTO, alCambiar);
  window.addEventListener('storage', alCambiar);
  return () => {
    window.removeEventListener(EVENTO, alCambiar);
    window.removeEventListener('storage', alCambiar);
  };
};
