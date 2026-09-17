import { useCallback } from 'react';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import Paginador from '@/shared/ui/moleculas/Paginador';
import RejillaCursos from '@/features/cursos/componentes/organismos/RejillaCursos';
import { listarCursosApi } from '@/features/cursos/servicios/cursos.api';
import { useListadoPaginado } from '@/shared/hooks/useListadoPaginado';

export default function PaginaCursos() {
  const cargar = useCallback(
    (pagina: number, senal: AbortSignal) => listarCursosApi('active', pagina, senal),
    []
  );
  const { elementos, paginacion, cargando, error, irAPagina } = useListadoPaginado(
    cargar,
    'No se pudieron cargar los cursos'
  );

  const cambiarPagina = (pagina: number) => {
    irAPagina(pagina);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  return (
    <PlantillaSeccion
      titulo="Cursos"
      descripcion="Formacion en logistica de ultima milla, atencion al cliente y ergonomia laboral."
    >
      <RejillaCursos cursos={elementos} cargando={cargando && elementos.length === 0} error={error} />

      <div className="mt-8">
        <Paginador
          paginacion={paginacion}
          onCambiar={cambiarPagina}
          entidad="cursos"
          deshabilitado={cargando}
        />
      </div>
    </PlantillaSeccion>
  );
}
