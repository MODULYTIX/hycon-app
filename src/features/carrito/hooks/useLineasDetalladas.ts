import { useEffect, useState } from 'react';
import { rutaCursoDetalle, rutaProductoDetalle } from '@/app/rutas/rutas';
import { obtenerProductoApi } from '@/features/productos/servicios/productos.api';
import { obtenerCursoApi } from '@/features/cursos/servicios/cursos.api';
import type { LineaCarrito, LineaDetallada } from '@/features/carrito/tipos/carrito.tipos';

const detallar = async (linea: LineaCarrito, senal: AbortSignal): Promise<LineaDetallada | null> => {
  try {
    if (linea.tipo === 'producto') {
      const producto = await obtenerProductoApi(linea.uuid, senal);
      return {
        ...linea,
        nombre: producto.name,
        precio: producto.discountPrice ?? producto.price,
        precioAnterior: producto.discountPrice === null ? null : producto.price,
        imagen: producto.imageUrl,
        stock: producto.stock,
        ruta: rutaProductoDetalle(producto.uuid),
      };
    }

    const curso = await obtenerCursoApi(linea.uuid, senal);
    return {
      ...linea,
      nombre: curso.name,
      precio: curso.discountPrice ?? curso.price,
      precioAnterior: curso.discountPrice === null ? null : curso.price,
      imagen: curso.thumbnailUrl,
      stock: null,
      ruta: rutaCursoDetalle(curso.uuid),
    };
  } catch {
    // Lo que ya no existe en el catalogo simplemente no se muestra
    return null;
  }
};

/**
 * Cruza lo guardado en el navegador con el catalogo: los precios y el stock
 * son siempre los de ahora, no los del dia en que se agrego.
 */
export function useLineasDetalladas(lineas: LineaCarrito[]) {
  const [detalladas, setDetalladas] = useState<LineaDetallada[]>([]);
  const [cargando, setCargando] = useState(lineas.length > 0);
  // Las referencias son lo unico que dispara una nueva consulta; la cantidad no
  const referencias = lineas.map((linea) => `${linea.tipo}:${linea.uuid}`).join('|');

  useEffect(() => {
    if (lineas.length === 0) {
      setDetalladas([]);
      setCargando(false);
      return;
    }

    const controlador = new AbortController();
    let vigente = true;
    setCargando(true);

    Promise.all(lineas.map((linea) => detallar(linea, controlador.signal)))
      .then((resultados) => {
        if (!vigente) return;
        setDetalladas(resultados.filter((linea): linea is LineaDetallada => linea !== null));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referencias]);

  // La cantidad se lee siempre de lo guardado, sin esperar al backend
  const cantidades = new Map(lineas.map((linea) => [linea.uuid, linea.cantidad]));
  return {
    lineas: detalladas.map((linea) => ({ ...linea, cantidad: cantidades.get(linea.uuid) ?? linea.cantidad })),
    cargando,
  };
}
