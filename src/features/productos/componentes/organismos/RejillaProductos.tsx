import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import TarjetaProducto from '@/features/productos/componentes/moleculas/TarjetaProducto';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

interface Props {
  productos: Producto[];
  cargando: boolean;
  error: string | null;
}

// Rejilla del catalogo publico
export default function RejillaProductos({ productos, cargando, error }: Props) {
  if (cargando) {
    return (
      <ul aria-label="Cargando productos" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((posicion) => (
          <li
            key={posicion}
            className="h-[340px] animate-pulse rounded-xl border border-g-20 bg-g-5"
          />
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-8 text-center text-[15px] text-red-700">
        {error}
      </p>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-xl border border-g-20 bg-white">
        <EstadoVacio
          icono="solar:box-linear"
          titulo="Todavia no hay productos publicados"
          descripcion="Estamos preparando el catalogo. Vuelve pronto o escribenos por WhatsApp."
        />
      </div>
    );
  }

  return (
    <ul aria-label="Catalogo de productos" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {productos.map((producto) => (
        <TarjetaProducto key={producto.productId} producto={producto} />
      ))}
    </ul>
  );
}
