import { useCallback, useEffect, useRef, useState } from 'react';
import { PAGINACION_INICIAL, type Pagina, type Paginacion } from '@/shared/utilidades/paginacion';

export type CargarPagina<T> = (pagina: number, senal: AbortSignal) => Promise<Pagina<T>>;

interface Resultado<T> {
  elementos: T[];
  paginacion: Paginacion;
  cargando: boolean;
  error: string | null;
  irAPagina: (pagina: number) => void;
  // Vuelve a pedir la pagina actual, o la primera si se indica (tras crear algo nuevo)
  recargar: (opciones?: { aLaPrimera?: boolean }) => void;
  // Sustituye un elemento ya cargado sin volver a consultar (tras editarlo)
  reemplazar: (esElMismo: (elemento: T) => boolean, nuevo: T) => void;
}

/**
 * Lista paginada por el backend. Cancela la peticion anterior al cambiar de pagina
 * o al desmontar, asi una respuesta lenta nunca pisa a una mas reciente.
 */
export function useListadoPaginado<T>(cargar: CargarPagina<T>, mensajeError: string): Resultado<T> {
  const [pagina, setPagina] = useState(1);
  const [version, setVersion] = useState(0);
  const [elementos, setElementos] = useState<T[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion>(PAGINACION_INICIAL);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // La funcion de carga puede cambiar de identidad entre renders sin disparar otra peticion
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  useEffect(() => {
    const controlador = new AbortController();
    let vigente = true;

    setCargando(true);
    setError(null);

    cargarRef
      .current(pagina, controlador.signal)
      .then((resultado) => {
        if (!vigente) return;
        // Si se borro lo ultimo de la ultima pagina, se retrocede a la que ahora existe
        if (pagina > resultado.paginacion.totalPaginas) {
          setPagina(resultado.paginacion.totalPaginas);
          return;
        }
        setElementos(resultado.elementos);
        setPaginacion(resultado.paginacion);
      })
      .catch((fallo: unknown) => {
        if (!vigente) return;
        setError(fallo instanceof Error ? fallo.message : mensajeError);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [pagina, version, mensajeError]);

  const irAPagina = useCallback((destino: number) => {
    setPagina(Math.max(1, destino));
  }, []);

  const recargar = useCallback((opciones: { aLaPrimera?: boolean } = {}) => {
    if (opciones.aLaPrimera) setPagina(1);
    setVersion((previa) => previa + 1);
  }, []);

  const reemplazar = useCallback((esElMismo: (elemento: T) => boolean, nuevo: T) => {
    setElementos((previos) => previos.map((elemento) => (esElMismo(elemento) ? nuevo : elemento)));
  }, []);

  return { elementos, paginacion, cargando, error, irAPagina, recargar, reemplazar };
}
