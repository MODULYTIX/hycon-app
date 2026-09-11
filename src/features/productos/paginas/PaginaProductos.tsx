import { useCallback } from 'react';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import RejillaProductos from '@/features/productos/componentes/organismos/RejillaProductos';
import { listarProductosApi } from '@/features/productos/servicios/productos.api';
import { useListaRemota } from '@/shared/hooks/useListaRemota';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

export default function PaginaProductos() {
  // El backend solo devuelve los activos si no se pide otra cosa
  const cargar = useCallback((senal: AbortSignal) => listarProductosApi('active', senal), []);
  const { datos, cargando, error } = useListaRemota<Producto>(
    cargar,
    'No se pudieron cargar los productos'
  );

  return (
    <PlantillaSeccion
      titulo="Productos"
      descripcion="Insumos y equipamiento para tu operacion logistica, listos para despacho en Arequipa."
    >
      <RejillaProductos productos={datos} cargando={cargando} error={error} />
    </PlantillaSeccion>
  );
}
