import { useCallback, useEffect, useState } from 'react';

interface Resultado<T> {
  datos: T[];
  cargando: boolean;
  error: string | null;
  // Antepone un elemento recien creado sin volver a consultar al servidor
  anteponer: (elemento: T) => void;
}

/**
 * Carga una lista desde el backend al montar el componente.
 * Cancela la peticion si el componente se desmonta antes de que llegue,
 * lo que evita avisos de React cuando se cambia de ruta deprisa.
 */
export function useListaRemota<T>(
  cargar: (senal: AbortSignal) => Promise<T[]>,
  mensajeError: string
): Resultado<T> {
  const [datos, setDatos] = useState<T[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controlador = new AbortController();
    let vigente = true;

    cargar(controlador.signal)
      .then((lista) => {
        if (vigente) setDatos(lista);
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
    // cargar se define fuera del render en cada pagina, por eso basta con el montaje
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const anteponer = useCallback((elemento: T) => {
    setDatos((previos) => [elemento, ...previos]);
  }, []);

  return { datos, cargando, error, anteponer };
}
