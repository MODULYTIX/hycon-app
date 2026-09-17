import { useCallback } from 'react';
import CabeceraSeccion from '@/features/administracion/componentes/moleculas/CabeceraSeccion';
import AvisoPanel from '@/features/administracion/componentes/moleculas/AvisoPanel';
import ModalProducto from '@/features/productos/componentes/organismos/ModalProducto';
import ListaProductos from '@/features/productos/componentes/organismos/ListaProductos';
import DialogoConfirmacion from '@/shared/ui/organismos/DialogoConfirmacion';
import { useGestionCatalogo } from '@/features/administracion/hooks/useGestionCatalogo';
import {
  eliminarProductoApi,
  listarProductosApi,
} from '@/features/productos/servicios/productos.api';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

export default function PaginaPanelProductos() {
  // El panel ve tambien los inactivos, no solo lo que esta publicado
  const cargar = useCallback(
    (pagina: number, senal: AbortSignal) => listarProductosApi('todos', pagina, senal),
    []
  );

  const { listado, modal, borrado, aviso, cerrarAviso } = useGestionCatalogo<Producto>({
    cargar,
    eliminar: eliminarProductoApi,
    obtenerId: (producto) => producto.productId,
    obtenerNombre: (producto) => producto.name,
    etiqueta: 'Producto',
    mensajeError: 'No se pudieron cargar los productos',
  });

  return (
    <>
      <CabeceraSeccion
        titulo="Productos"
        descripcion="Agrega, edita o retira los productos que se muestran en la tienda."
        textoBoton="Agregar producto"
        onAgregar={modal.abrirAlta}
      />

      <div className="space-y-4">
        <AvisoPanel mensaje={aviso} onCerrar={cerrarAviso} />
        <ListaProductos
          productos={listado.elementos}
          paginacion={listado.paginacion}
          cargando={listado.cargando}
          error={listado.error}
          onCambiarPagina={listado.irAPagina}
          onEditar={modal.abrirEdicion}
          onEliminar={borrado.pedir}
        />
      </div>

      <ModalProducto
        abierto={modal.abierto}
        producto={modal.elemento}
        onCerrar={modal.cerrar}
        onGuardado={modal.alGuardar}
      />

      <DialogoConfirmacion
        abierto={borrado.elemento !== null}
        titulo="¿Eliminar este producto?"
        descripcion={`"${borrado.elemento?.name ?? ''}" dejará de aparecer en la tienda y en el panel. Esta acción no se puede deshacer.`}
        textoConfirmar="Sí, eliminar"
        procesando={borrado.procesando}
        error={borrado.error}
        onConfirmar={borrado.confirmar}
        onCancelar={borrado.cancelar}
      />
    </>
  );
}
