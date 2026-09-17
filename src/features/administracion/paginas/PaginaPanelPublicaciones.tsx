import { useCallback } from 'react';
import CabeceraSeccion from '@/features/administracion/componentes/moleculas/CabeceraSeccion';
import AvisoPanel from '@/features/administracion/componentes/moleculas/AvisoPanel';
import ModalPublicacion from '@/features/publicaciones/componentes/organismos/ModalPublicacion';
import ListaPublicaciones from '@/features/publicaciones/componentes/organismos/ListaPublicaciones';
import DialogoConfirmacion from '@/shared/ui/organismos/DialogoConfirmacion';
import { useGestionCatalogo } from '@/features/administracion/hooks/useGestionCatalogo';
import {
  eliminarPublicacionApi,
  listarPublicacionesApi,
} from '@/features/publicaciones/servicios/publicaciones.api';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

export default function PaginaPanelPublicaciones() {
  // El panel ve tambien los borradores
  const cargar = useCallback(
    (pagina: number, senal: AbortSignal) => listarPublicacionesApi('todos', pagina, senal),
    []
  );

  const { listado, modal, borrado, aviso, cerrarAviso } = useGestionCatalogo<Publicacion>({
    cargar,
    eliminar: eliminarPublicacionApi,
    obtenerId: (publicacion) => publicacion.postId,
    obtenerNombre: (publicacion) => publicacion.title,
    etiqueta: 'Artículo',
    mensajeError: 'No se pudieron cargar las publicaciones',
    mensajeCreado: (titulo) => `Artículo "${titulo}" creado`,
  });

  return (
    <>
      <CabeceraSeccion
        titulo="Publicaciones"
        descripcion="Escribe, edita o retira los artículos del blog de Hycon."
        textoBoton="Nueva publicación"
        onAgregar={modal.abrirAlta}
      />

      <div className="space-y-4">
        <AvisoPanel mensaje={aviso} onCerrar={cerrarAviso} />
        <ListaPublicaciones
          publicaciones={listado.elementos}
          paginacion={listado.paginacion}
          cargando={listado.cargando}
          error={listado.error}
          onCambiarPagina={listado.irAPagina}
          onEditar={modal.abrirEdicion}
          onEliminar={borrado.pedir}
        />
      </div>

      <ModalPublicacion
        abierto={modal.abierto}
        publicacion={modal.elemento}
        onCerrar={modal.cerrar}
        onGuardado={modal.alGuardar}
      />

      <DialogoConfirmacion
        abierto={borrado.elemento !== null}
        titulo="¿Eliminar esta publicación?"
        descripcion={`"${borrado.elemento?.title ?? ''}" dejará de aparecer en la web y en el panel. Esta acción no se puede deshacer.`}
        textoConfirmar="Sí, eliminar"
        procesando={borrado.procesando}
        error={borrado.error}
        onConfirmar={borrado.confirmar}
        onCancelar={borrado.cancelar}
      />
    </>
  );
}
