import { useCallback, useEffect, useState } from 'react';
import CabeceraSeccion from '@/features/administracion/componentes/moleculas/CabeceraSeccion';
import ModalProducto from '@/features/administracion/componentes/organismos/ModalProducto';
import ListaProductos from '@/features/administracion/componentes/organismos/ListaProductos';
import AlertaFormulario from '@/features/autenticacion/componentes/atomos/AlertaFormulario';
import { listarProductosApi } from '@/features/administracion/servicios/catalogo.api';
import type { Producto } from '@/features/administracion/tipos/catalogo.tipos';

export default function PaginaProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    const controlador = new AbortController();
    let vigente = true;

    listarProductosApi(controlador.signal)
      .then((lista) => {
        if (vigente) setProductos(lista);
      })
      .catch((fallo: unknown) => {
        if (!vigente) return;
        setError(fallo instanceof Error ? fallo.message : 'No se pudieron cargar los productos');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, []);

  // El producto recien creado se antepone sin volver a pedir la lista al servidor
  const agregar = useCallback((producto: Producto) => {
    setProductos((previos) => [producto, ...previos]);
    setAviso(`Producto "${producto.name}" agregado al catalogo`);
  }, []);

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
        <ListaProductos productos={productos} cargando={cargando} error={error} />
      </div>

      <ModalProducto
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onCreado={agregar}
      />
    </>
  );
}
