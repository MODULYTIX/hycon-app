import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import TarjetaProducto from '@/features/productos/componentes/moleculas/TarjetaProducto';
import EsqueletoRejillaProductos from '@/features/productos/componentes/organismos/EsqueletoRejillaProductos';
import AvisoErrorCatalogo from '@/shared/ui/moleculas/AvisoErrorCatalogo';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

interface Props {
  productos: Producto[];
  vista?: 'grilla' | 'lista';
  cargando: boolean;
  error: string | null;
  filtrado?: boolean;
  onReintentar?: () => void;
}

// Rejilla del catalogo publico
export default function RejillaProductos({ productos, vista = 'grilla', cargando, error, filtrado = false, onReintentar }: Props) {
  if (cargando) {
    return <EsqueletoRejillaProductos vista={vista} />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AvisoErrorCatalogo error={error} onReintentar={onReintentar} />
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-xl bg-white ring-1 ring-g-20">
        <EstadoVacio
          icono="solar:box-linear"
          titulo={filtrado ? "No encontramos productos" : "Todavia no hay productos publicados"}
          descripcion={filtrado ? "Prueba otros filtros o pulsa Quitar filtros para ver todo el catálogo." : "Estamos preparando el catalogo. Vuelve pronto o escribenos por WhatsApp."}
        />
      </div>
    );
  }

  return (
    <ul aria-label="Catalogo de productos" className="productos-rejilla" data-vista={vista}>
      {productos.map((producto) => (
        <TarjetaProducto key={producto.uuid} producto={producto} />
      ))}
    </ul>
  );
}
