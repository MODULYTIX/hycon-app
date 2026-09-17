import { useCallback, useState } from 'react';
import { useListadoPaginado, type CargarPagina } from '@/shared/hooks/useListadoPaginado';

interface Opciones<T> {
  cargar: CargarPagina<T>;
  eliminar: (id: number) => Promise<unknown>;
  obtenerId: (elemento: T) => number;
  obtenerNombre: (elemento: T) => string;
  // Como se nombra en los avisos: "Producto", "Curso"
  etiqueta: string;
  mensajeError: string;
  // Aviso tras crear; por defecto: Producto "X" agregado al catalogo
  mensajeCreado?: (nombre: string) => string;
}

/**
 * Todo lo que comparten las secciones del panel: listado paginado,
 * modal de alta y edicion, confirmacion de borrado y aviso de resultado.
 */
export function useGestionCatalogo<T>({
  cargar,
  eliminar,
  obtenerId,
  obtenerNombre,
  etiqueta,
  mensajeError,
  mensajeCreado,
}: Opciones<T>) {
  const listado = useListadoPaginado(cargar, mensajeError);
  const { recargar, reemplazar } = listado;

  // undefined: modal cerrado; null: creando; un elemento: editandolo
  const [enEdicion, setEnEdicion] = useState<T | null | undefined>(undefined);
  const [aEliminar, setAEliminar] = useState<T | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const abrirAlta = useCallback(() => {
    setAviso(null);
    setEnEdicion(null);
  }, []);

  const abrirEdicion = useCallback((elemento: T) => {
    setAviso(null);
    setEnEdicion(elemento);
  }, []);

  const cerrarModal = useCallback(() => setEnEdicion(undefined), []);

  const alGuardar = (guardado: T) => {
    const nombre = obtenerNombre(guardado);
    if (enEdicion) {
      // Editar no cambia el orden: basta con sustituir la fila
      reemplazar((elemento) => obtenerId(elemento) === obtenerId(guardado), guardado);
      setAviso(`Cambios guardados en "${nombre}"`);
    } else {
      // Lo nuevo aparece primero: se vuelve a la primera pagina ordenada por el backend
      recargar({ aLaPrimera: true });
      setAviso(mensajeCreado ? mensajeCreado(nombre) : `${etiqueta} "${nombre}" agregado al catálogo`);
    }
  };

  const pedirEliminacion = useCallback((elemento: T) => {
    setAviso(null);
    setErrorEliminar(null);
    setAEliminar(elemento);
  }, []);

  const cancelarEliminacion = useCallback(() => {
    setAEliminar(null);
    setErrorEliminar(null);
  }, []);

  const confirmarEliminacion = async () => {
    if (!aEliminar || eliminando) return;
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await eliminar(obtenerId(aEliminar));
      setAviso(`${etiqueta} "${obtenerNombre(aEliminar)}" eliminado`);
      setAEliminar(null);
      // Se pide otra vez la pagina: si quedo vacia, el listado retrocede solo
      recargar();
    } catch (error) {
      setErrorEliminar(error instanceof Error ? error.message : 'No se pudo eliminar');
    } finally {
      setEliminando(false);
    }
  };

  return {
    listado,
    modal: {
      abierto: enEdicion !== undefined,
      elemento: enEdicion ?? null,
      abrirAlta,
      abrirEdicion,
      cerrar: cerrarModal,
      alGuardar,
    },
    borrado: {
      elemento: aEliminar,
      procesando: eliminando,
      error: errorEliminar,
      pedir: pedirEliminacion,
      cancelar: cancelarEliminacion,
      confirmar: confirmarEliminacion,
    },
    aviso,
    cerrarAviso: () => setAviso(null),
  };
}
