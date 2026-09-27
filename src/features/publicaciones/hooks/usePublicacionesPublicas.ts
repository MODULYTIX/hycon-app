import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listarPublicacionesApi,
  type OrdenPublicaciones,
} from '@/features/publicaciones/servicios/publicaciones.api';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

interface Opciones {
  orden?: OrdenPublicaciones;
  porPagina?: number;
}

/**
 * Listado publico de articulos que crece con "Ver mas": cada pagina se anade
 * a la anterior en lugar de sustituirla.
 */
export function usePublicacionesPublicas({ orden = 'recientes', porPagina = 6 }: Opciones = {}) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const vigente = useRef(true);

  useEffect(() => {
    vigente.current = true;
    return () => {
      vigente.current = false;
    };
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    setCargando(true);
    setError(null);

    listarPublicacionesApi('active', { pagina, porPagina, orden, senal: controlador.signal })
      .then(({ elementos, paginacion }) => {
        if (!vigente.current) return;
        // La primera pagina reemplaza; las siguientes se suman al final
        setPublicaciones((previas) => (pagina === 1 ? elementos : [...previas, ...elementos]));
        setTotalPaginas(paginacion.totalPaginas);
      })
      .catch((fallo: unknown) => {
        if (!vigente.current || controlador.signal.aborted) return;
        setError(fallo instanceof Error ? fallo.message : 'No se pudieron cargar las publicaciones');
      })
      .finally(() => {
        if (vigente.current) setCargando(false);
      });

    return () => controlador.abort();
  }, [pagina, porPagina, orden]);

  const verMas = useCallback(() => setPagina((actual) => actual + 1), []);

  return {
    publicaciones,
    cargando,
    error,
    hayMas: pagina < totalPaginas,
    verMas,
    // true solo mientras llega la primera pagina, para no tapar lo ya mostrado
    cargandoPrimera: cargando && publicaciones.length === 0,
  };
}
