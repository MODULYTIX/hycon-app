import EsqueletoTarjetaProducto from '@/features/productos/componentes/moleculas/EsqueletoTarjetaProducto';

interface Props {
  cantidad?: number;
  vista?: 'grilla' | 'lista';
}

export default function EsqueletoRejillaProductos({ cantidad = 6, vista = 'grilla' }: Props) {
  return (
    <ul aria-label="Cargando productos" className="productos-rejilla" data-vista={vista}>
      {Array.from({ length: cantidad }).map((_, posicion) => (
        <EsqueletoTarjetaProducto key={posicion} />
      ))}
    </ul>
  );
}
