import TablaPanel from '@/shared/ui/organismos/TablaPanel';
import FilaPublicacion, {
  COLUMNAS_PUBLICACION,
} from '@/features/publicaciones/componentes/moleculas/FilaPublicacion';
import type { Paginacion } from '@/shared/utilidades/paginacion';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

interface Props {
  publicaciones: Publicacion[];
  paginacion: Paginacion;
  cargando: boolean;
  error: string | null;
  onCambiarPagina: (pagina: number) => void;
  onEditar: (publicacion: Publicacion) => void;
  onEliminar: (publicacion: Publicacion) => void;
}

export default function ListaPublicaciones({
  publicaciones,
  paginacion,
  cargando,
  error,
  onCambiarPagina,
  onEditar,
  onEliminar,
}: Props) {
  return (
    <TablaPanel
      titulo="Artículos"
      entidad="publicaciones"
      entidadSingular="publicación"
      columnas={['Artículo', 'Publicación', 'Lecturas', 'Estado', 'Acciones']}
      claseColumnas={COLUMNAS_PUBLICACION}
      paginacion={paginacion}
      cargando={cargando}
      error={error}
      onCambiarPagina={onCambiarPagina}
      cantidadFilas={publicaciones.length}
      vacio={{
        icono: 'solar:document-text-linear',
        titulo: 'Todavía no hay publicaciones',
        descripcion: 'Pulsa «Nueva publicación» para escribir el primer artículo.',
      }}
    >
      {publicaciones.map((publicacion) => (
        <FilaPublicacion
          key={publicacion.postId}
          publicacion={publicacion}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </TablaPanel>
  );
}
