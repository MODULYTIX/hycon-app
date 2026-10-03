import CatalogoConFiltros from '@/shared/ui/plantillas/CatalogoConFiltros';
import FiltrosListado from '@/shared/ui/organismos/FiltrosListado';
import { useFiltrosListado } from '@/shared/hooks/useFiltrosListado';
import { useCallback } from 'react';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import Paginador from '@/shared/ui/moleculas/Paginador';
import RejillaProductos from '@/features/productos/componentes/organismos/RejillaProductos';
import { listarProductosApi } from '@/features/productos/servicios/productos.api';
import { useListadoPaginado } from '@/shared/hooks/useListadoPaginado';

export default function PaginaProductos() {
  const { filtros, clave, aplicar } = useFiltrosListado();
  // El catalogo publico solo pide los activos
  const cargar = useCallback(
    (pagina: number, senal: AbortSignal) => listarProductosApi('active', pagina, senal, 12, filtros),
    [filtros]
  );
  const { elementos, paginacion, cargando, error, irAPagina } = useListadoPaginado(
    cargar,
    'No se pudieron cargar los productos',
    clave
  );

  const cambiarPagina = (pagina: number) => {
    irAPagina(pagina);
    // Al cambiar de pagina se vuelve al inicio de la rejilla, no al pie
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  return (
    <PlantillaSeccion
      compacto
      titulo="Productos"
      descripcion="Insumos y equipamiento para tu operacion logistica, listos para despacho en Arequipa."
    >
      <CatalogoConFiltros filtros={<FiltrosListado modulo="productos" onAplicar={aplicar} />}>
      <RejillaProductos
        filtrado={Boolean(clave)}
        productos={elementos}
        // Al pasar de pagina se mantienen las tarjetas actuales en lugar del esqueleto
        cargando={cargando && elementos.length === 0}
        error={error}
      />

      <div className="mt-8">
        <Paginador
          paginacion={paginacion}
          onCambiar={cambiarPagina}
          entidad="productos"
          deshabilitado={cargando}
        />
      </div>
      </CatalogoConFiltros>
    </PlantillaSeccion>
  );
}
