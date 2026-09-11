import { useCallback, useState } from 'react';
import CabeceraSeccion from '@/features/administracion/componentes/moleculas/CabeceraSeccion';
import ModalProducto from '@/features/productos/componentes/organismos/ModalProducto';
import ListaProductos from '@/features/productos/componentes/organismos/ListaProductos';
import AlertaFormulario from '@/shared/ui/moleculas/AlertaFormulario';
import { listarProductosApi } from '@/features/productos/servicios/productos.api';
import { useListaRemota } from '@/shared/hooks/useListaRemota';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

export default function PaginaPanelProductos() {
  // El panel ve tambien los inactivos, no solo lo que esta publicado
  const cargar = useCallback((senal: AbortSignal) => listarProductosApi('todos', senal), []);
  const { datos, cargando, error, anteponer } = useListaRemota<Producto>(
    cargar,
    'No se pudieron cargar los productos'
  );

  const [modalAbierto, setModalAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const agregar = useCallback(
    (producto: Producto) => {
      anteponer(producto);
      setAviso(`Producto "${producto.name}" agregado al catalogo`);
    },
    [anteponer]
  );

  return (
    <>
      <CabeceraSeccion
        titulo="Productos"
        descripcion="Agrega productos al catalogo y revisa los que ya estan publicados."
        textoBoton="Agregar producto"
        onAgregar={() => {
          setAviso(null);
          setModalAbierto(true);
        }}
      />

      <div className="space-y-4">
        <AlertaFormulario mensaje={aviso} tono="exito" />
        <ListaProductos productos={datos} cargando={cargando} error={error} />
      </div>

      <ModalProducto
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onCreado={agregar}
      />
    </>
  );
}
