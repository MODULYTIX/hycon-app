import { formatearPrecio } from '@/shared/utilidades/formato';
import type { LineaDetallada } from '@/features/carrito/tipos/carrito.tipos';

/** Texto del pedido para WhatsApp: una linea por articulo y el total al final. */
export const mensajeDePedido = (lineas: LineaDetallada[], total: number): string => {
  const detalle = lineas
    .map((linea) => `- ${linea.cantidad} x ${linea.nombre} (${formatearPrecio(linea.precio)})`)
    .join('\n');

  return `Hola Hycon, quiero hacer este pedido:\n${detalle}\n\nTotal: ${formatearPrecio(total)}`;
};
