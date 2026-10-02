import { useCallback, useEffect, useState } from 'react';
import {
  cambiarCantidad,
  contarItems,
  leerCarrito,
  quitarDelCarrito,
  suscribirseAlCarrito,
  vaciarCarrito,
} from '@/features/carrito/servicios/carrito.almacen';
import type { LineaCarrito } from '@/features/carrito/tipos/carrito.tipos';

/** El carrito guardado en el navegador, al dia en cualquier parte de la web. */
export function useCarrito() {
  const [lineas, setLineas] = useState<LineaCarrito[]>(() => leerCarrito());

  useEffect(() => {
    const refrescar = () => setLineas(leerCarrito());
    refrescar();
    return suscribirseAlCarrito(refrescar);
  }, []);

  return {
    lineas,
    total: contarItems(lineas),
    cambiarCantidad: useCallback((uuid: string, cantidad: number) => {
      setLineas(cambiarCantidad(uuid, cantidad));
    }, []),
    quitar: useCallback((uuid: string) => setLineas(quitarDelCarrito(uuid)), []),
    vaciar: useCallback(() => setLineas(vaciarCarrito()), []),
  };
}
