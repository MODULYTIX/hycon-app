import EsqueletoTarjetaProducto from '@/features/productos/componentes/moleculas/EsqueletoTarjetaProducto';


interface Props {
  vista: 'grilla' | 'lista';
  cantidad?: number;
}

export default function EsqueletoRejillaCursos({ cantidad = 8, vista }: Props) {
  return (
    <ul aria-label="Cargando cursos" className="productos-rejilla" data-vista={vista}>
      {Array.from({ length: cantidad }).map((_, posicion) => (
        <EsqueletoTarjetaProducto key={posicion} />
      ))}
    </ul>
  );
}
