import { useCallback, useEffect, useState } from 'react';
import { listarPublicacionesApi, type OrdenPublicaciones } from '@/features/publicaciones/servicios/publicaciones.api';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';
import type { FiltrosListado } from '@/shared/utilidades/filtros-listado';
interface Opciones { orden?: OrdenPublicaciones; porPagina?: number; filtros?: FiltrosListado; }
export function usePublicacionesPublicas({ orden = 'recientes', porPagina = 6, filtros }: Opciones = {}) {
  const clave = JSON.stringify({ orden, porPagina, filtros });
  const [seleccion, setSeleccion] = useState({ pagina: 1, clave });
  const pagina = seleccion.clave === clave ? seleccion.pagina : 1;
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controlador = new AbortController();
    let vigente = true;
    const opciones = JSON.parse(clave) as Opciones;
    setSeleccion({ pagina, clave });
    if (pagina === 1) setPublicaciones([]);
    setCargando(true); setError(null);
    listarPublicacionesApi('active', { ...opciones, pagina, senal: controlador.signal })
      .then(({ elementos, paginacion }) => {
        if (!vigente) return;
        setPublicaciones((previas) => pagina === 1 ? elementos : [...previas, ...elementos]);
        setTotalPaginas(paginacion.totalPaginas);
      })
      .catch((fallo: unknown) => {
        if (!vigente) return;
        setError(fallo instanceof Error ? fallo.message : 'No se pudieron cargar las publicaciones');
      })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; controlador.abort(); };
  }, [pagina, clave, version]);
  const verMas = useCallback(() => {
    if (cargando) return;
    if (error) setVersion((v) => v + 1);
    else if (pagina < totalPaginas) setSeleccion({ pagina: pagina + 1, clave });
  }, [cargando, error, pagina, totalPaginas, clave]);
  return { publicaciones, cargando, error, hayMas: Boolean(error) || pagina < totalPaginas, verMas, cargandoPrimera: cargando && publicaciones.length === 0 };
}
