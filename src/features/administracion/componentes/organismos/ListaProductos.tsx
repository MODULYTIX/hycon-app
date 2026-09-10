import EstadoVacio from '@/features/administracion/componentes/atomos/EstadoVacio';
import FilaProducto from '@/features/administracion/componentes/moleculas/FilaProducto';
import type { Producto } from '@/features/administracion/tipos/catalogo.tipos';

interface Props {
  productos: Producto[];
  cargando: boolean;
  error: string | null;
}

export default function ListaProductos({ productos, cargando, error }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-g-20 bg-white">
      <header className="flex items-center justify-between border-b border-g-20 px-5 py-4">
        <h2 className="text-[18px] font-semibold text-g-80">Productos del catalogo</h2>
        <span className="rounded-full bg-g-10 px-2.5 py-0.5 text-[13px] font-semibold text-g-60">
          {productos.length}
        </span>
      </header>

      {cargando && (
        <p className="px-5 py-10 text-center text-[15px] text-g-50">Cargando productos...</p>
      )}

      {!cargando && error && (
        <p role="alert" className="px-5 py-10 text-center text-[15px] text-red-600">
          {error}
        </p>
      )}

      {!cargando && !error && productos.length === 0 && (
        <EstadoVacio
          icono="solar:box-linear"
          titulo="Todavia no hay productos"
          descripcion="Pulsa Agregar producto para publicar el primero en el catalogo."
        />
      )}

      {!cargando && !error && productos.length > 0 && (
        <ul aria-label="Productos del catalogo" className="divide-y divide-g-20">
          {productos.map((producto) => (
            <FilaProducto key={producto.productId} producto={producto} />
          ))}
        </ul>
      )}
    </section>
  );
}
