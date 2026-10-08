// Espejo de lo que devuelve el backend en /api/v1/orders
export type MetodoPago = 'tarjeta' | 'yape' | 'whatsapp';

export interface LineaPedido {
  tipo: 'producto' | 'curso';
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
}

export interface Pedido {
  uuid: string;
  // Codigo corto que ve el cliente, por ejemplo PED-0192F0
  codigo: string;
  estadoPago: 'pagado' | 'pendiente';
  metodoPago: MetodoPago;
  subtotal: number;
  descuento: number;
  total: number;
  createdAt: string;
  items: LineaPedido[];
}

// Lo unico que se envia al comprar: el precio lo calcula el servidor
export interface ItemPedido {
  tipo: 'producto' | 'curso';
  uuid: string;
  cantidad: number;
}
