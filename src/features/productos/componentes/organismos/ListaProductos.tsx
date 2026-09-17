import TablaPanel from '@/shared/ui/organismos/TablaPanel';
import FilaProducto, {
  COLUMNAS_PRODUCTO,
} from '@/features/productos/componentes/moleculas/FilaProducto';
import type { Paginacion } from '@/shared/utilidades/paginacion';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

interface Props {
  productos: Producto[];
  paginacion: Paginacion;
  cargando: boolean;
  error: string | null;
  onCambiarPagina: (pagina: number) => void;
  onEditar: (producto: Producto) => void;
  onEliminar: (producto: Producto) => void;
}

export default function ListaProductos({
  productos,
  paginacion,
  cargando,
  error,
  onCambiarPagina,
  onEditar,
  onEliminar,
}: Props) {
  return (
    <TablaPanel
      titulo="Productos del catálogo"
      entidad="productos"
      columnas={['Producto', 'Precio', 'Cantidad', 'Estado', 'Acciones']}
      claseColumnas={COLUMNAS_PRODUCTO}
      paginacion={paginacion}
      cargando={cargando}
      error={error}
      onCambiarPagina={onCambiarPagina}
      cantidadFilas={productos.length}
      vacio={{
        icono: 'solar:box-linear',
        titulo: 'Todavía no hay productos',
        descripcion: 'Pulsa «Agregar producto» para publicar el primero en el catálogo.',
      }}
    >
      {productos.map((producto) => (
        <FilaProducto
          key={producto.productId}
          producto={producto}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </TablaPanel>
  );
}
