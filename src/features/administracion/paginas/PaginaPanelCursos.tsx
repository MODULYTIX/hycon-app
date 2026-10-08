import FiltrosListado from '@/shared/ui/organismos/FiltrosListado';
import { useFiltrosListado } from '@/shared/hooks/useFiltrosListado';
import { useCallback, useState } from 'react';
import CabeceraSeccion from '@/features/administracion/componentes/moleculas/CabeceraSeccion';
import AvisoPanel from '@/features/administracion/componentes/moleculas/AvisoPanel';
import ModalCurso from '@/features/cursos/componentes/organismos/ModalCurso';
import ListaCursos from '@/features/cursos/componentes/organismos/ListaCursos';
import ModalVideoCurso from '@/features/cursos/componentes/organismos/ModalVideoCurso';
import ModalTemario from '@/features/cursos/componentes/organismos/ModalTemario';
import DialogoConfirmacion from '@/shared/ui/organismos/DialogoConfirmacion';
import { useGestionCatalogo } from '@/features/administracion/hooks/useGestionCatalogo';
import { eliminarCursoApi, listarCursosApi } from '@/features/cursos/servicios/cursos.api';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

export default function PaginaPanelCursos() {
  const { filtros, clave, aplicar } = useFiltrosListado();
  const cargar = useCallback(
    (pagina: number, senal: AbortSignal) => listarCursosApi(filtros.estado ?? 'todos', pagina, senal, undefined, filtros),
    [filtros]
  );

  const { listado, modal, borrado, aviso, cerrarAviso } = useGestionCatalogo<Curso>({
    cargar,
    claveListado: clave,
    eliminar: eliminarCursoApi,
    obtenerId: (curso) => curso.uuid,
    obtenerNombre: (curso) => curso.name,
    etiqueta: 'Curso',
    mensajeError: 'No se pudieron cargar los cursos',
  });

  const [enReproduccion, setEnReproduccion] = useState<Curso | null>(null);
  // Curso cuyo temario se esta administrando
  const [conTemario, setConTemario] = useState<Curso | null>(null);

  return (
    <>
      <CabeceraSeccion
        titulo="Cursos"
        descripcion="Agrega, edita o retira los cursos del catálogo de formación."
        textoBoton="Agregar curso"
        onAgregar={modal.abrirAlta}
      />

      <FiltrosListado modulo="cursos" admin onAplicar={aplicar} />
      <div className="space-y-4">
        <AvisoPanel mensaje={aviso} onCerrar={cerrarAviso} />
        <ListaCursos
          cursos={listado.elementos}
          paginacion={listado.paginacion}
          cargando={listado.cargando}
          error={listado.error}
          onCambiarPagina={listado.irAPagina}
          onEditar={modal.abrirEdicion}
          onEliminar={borrado.pedir}
          onVerVideo={setEnReproduccion}
          onVerTemario={setConTemario}
        />
      </div>

      <ModalCurso
        abierto={modal.abierto}
        curso={modal.elemento}
        onCerrar={modal.cerrar}
        onGuardado={modal.alGuardar}
      />

      <ModalVideoCurso curso={enReproduccion} onCerrar={() => setEnReproduccion(null)} />

      <ModalTemario
        abierto={conTemario !== null}
        curso={conTemario}
        onCerrar={() => setConTemario(null)}
      />

      <DialogoConfirmacion
        abierto={borrado.elemento !== null}
        titulo="¿Eliminar este curso?"
        descripcion={`"${borrado.elemento?.name ?? ''}" dejará de aparecer en la web y en el panel. Esta acción no se puede deshacer.`}
        textoConfirmar="Sí, eliminar"
        procesando={borrado.procesando}
        error={borrado.error}
        onConfirmar={borrado.confirmar}
        onCancelar={borrado.cancelar}
      />
    </>
  );
}
