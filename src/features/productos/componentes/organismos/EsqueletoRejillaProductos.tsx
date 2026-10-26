import EsqueletoTarjetaProducto from '@/features/productos/componentes/moleculas/EsqueletoTarjetaProducto';

const REJILLA = 'grid gap-4 min-[460px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4';

interface Props {
  cantidad?: number;
}

export default function EsqueletoRejillaProductos({ cantidad = 8 }: Props) {
  return (
    <ul aria-label="Cargando productos" className={REJILLA}>
      {Array.from({ length: cantidad }).map((_, posicion) => (
        <EsqueletoTarjetaProducto key={posicion} />
      ))}
    </ul>
  );
}
