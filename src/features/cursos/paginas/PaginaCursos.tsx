import { useCallback, useState } from 'react';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import Paginador from '@/shared/ui/moleculas/Paginador';
import RejillaCursos from '@/features/cursos/componentes/organismos/RejillaCursos';
import ModalVideoCurso from '@/features/cursos/componentes/organismos/ModalVideoCurso';
import { listarCursosApi } from '@/features/cursos/servicios/cursos.api';
import { useListadoPaginado } from '@/shared/hooks/useListadoPaginado';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

export default function PaginaCursos() {
  const cargar = useCallback(
    (pagina: number, senal: AbortSignal) => listarCursosApi('active', pagina, senal),
    []
  );
  const { elementos, paginacion, cargando, error, irAPagina } = useListadoPaginado(
    cargar,
    'No se pudieron cargar los cursos'
  );

  const [enReproduccion, setEnReproduccion] = useState<Curso | null>(null);

  const cambiarPagina = (pagina: number) => {
    irAPagina(pagina);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  return (
    <PlantillaSeccion
      titulo="Cursos"
      descripcion="Formacion en logistica de ultima milla, atencion al cliente y ergonomia laboral."
    >
      <RejillaCursos
        cursos={elementos}
        cargando={cargando && elementos.length === 0}
        error={error}
        onVerAvance={setEnReproduccion}
      />

      <div className="mt-8">
        <Paginador
          paginacion={paginacion}
          onCambiar={cambiarPagina}
          entidad="cursos"
          deshabilitado={cargando}
        />
      </div>

      <ModalVideoCurso curso={enReproduccion} onCerrar={() => setEnReproduccion(null)} />
    </PlantillaSeccion>
  );
}
