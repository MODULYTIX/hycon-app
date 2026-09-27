import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import TarjetaProducto from '@/features/productos/componentes/moleculas/TarjetaProducto';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

interface Props {
  productos: Producto[];
  cargando: boolean;
  error: string | null;
}

const REJILLA = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3';

// Rejilla del catalogo publico
export default function RejillaProductos({ productos, cargando, error }: Props) {
  if (cargando) {
    return (
      <ul aria-label="Cargando productos" className={REJILLA}>
        {[0, 1, 2, 3, 4, 5].map((posicion) => (
          <li key={posicion} className="bg-white ring-1 ring-g-20">
            <div className="aspect-[4/3] animate-pulse bg-g-10" />
            <div className="space-y-3 border-t border-g-20 p-5">
              <div className="h-3 w-1/3 animate-pulse rounded bg-g-10" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-g-10" />
              <div className="h-7 w-24 animate-pulse rounded bg-g-10" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-[3px] border border-red-200 bg-red-50 px-5 py-8 text-center text-[15px] text-red-700">
        {error}
      </p>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-[3px] bg-white ring-1 ring-g-20">
        <EstadoVacio
          icono="solar:box-linear"
          titulo="Todavia no hay productos publicados"
          descripcion="Estamos preparando el catalogo. Vuelve pronto o escribenos por WhatsApp."
        />
      </div>
    );
  }

  return (
    <ul aria-label="Catalogo de productos" className={REJILLA}>
      {productos.map((producto) => (
        <TarjetaProducto key={producto.uuid} producto={producto} />
      ))}
    </ul>
  );
}
