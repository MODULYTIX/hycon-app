import { useCallback } from 'react';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import RejillaCursos from '@/features/cursos/componentes/organismos/RejillaCursos';
import { listarCursosApi } from '@/features/cursos/servicios/cursos.api';
import { useListaRemota } from '@/shared/hooks/useListaRemota';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

export default function PaginaCursos() {
  const cargar = useCallback((senal: AbortSignal) => listarCursosApi('active', senal), []);
  const { datos, cargando, error } = useListaRemota<Curso>(
    cargar,
    'No se pudieron cargar los cursos'
  );

  return (
    <PlantillaSeccion
      titulo="Cursos"
      descripcion="Formacion en logistica de ultima milla, atencion al cliente y ergonomia laboral."
    >
      <RejillaCursos cursos={datos} cargando={cargando} error={error} />
    </PlantillaSeccion>
  );
}
