import TablaPanel from '@/shared/ui/organismos/TablaPanel';
import FilaCurso, { COLUMNAS_CURSO } from '@/features/cursos/componentes/moleculas/FilaCurso';
import type { Paginacion } from '@/shared/utilidades/paginacion';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

interface Props {
  cursos: Curso[];
  paginacion: Paginacion;
  cargando: boolean;
  error: string | null;
  onCambiarPagina: (pagina: number) => void;
  onEditar: (curso: Curso) => void;
  onEliminar: (curso: Curso) => void;
  onVerVideo: (curso: Curso) => void;
}

export default function ListaCursos({
  cursos,
  paginacion,
  cargando,
  error,
  onCambiarPagina,
  onEditar,
  onEliminar,
  onVerVideo,
}: Props) {
  return (
    <TablaPanel
      titulo="Cursos del catálogo"
      entidad="cursos"
      columnas={['Curso', 'Precio', 'Duración', 'Estado', 'Acciones']}
      claseColumnas={COLUMNAS_CURSO}
      paginacion={paginacion}
      cargando={cargando}
      error={error}
      onCambiarPagina={onCambiarPagina}
      cantidadFilas={cursos.length}
      vacio={{
        icono: 'solar:diploma-linear',
        titulo: 'Todavía no hay cursos',
        descripcion: 'Pulsa «Agregar curso» para publicar el primero en el catálogo.',
      }}
    >
      {cursos.map((curso) => (
        <FilaCurso
          key={curso.courseId}
          curso={curso}
          onEditar={onEditar}
          onEliminar={onEliminar}
          onVerVideo={onVerVideo}
        />
      ))}
    </TablaPanel>
  );
}
