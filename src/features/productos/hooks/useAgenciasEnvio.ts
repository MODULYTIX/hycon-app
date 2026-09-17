import { useEffect, useState } from 'react';
import { listarAgenciasApi } from '@/features/productos/servicios/productos.api';
import type { AgenciaEnvio } from '@/features/productos/tipos/producto.tipos';

// Las agencias validas las decide el backend: el formulario solo ofrece las que devuelve
export function useAgenciasEnvio() {
  const [agencias, setAgencias] = useState<AgenciaEnvio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controlador = new AbortController();

    listarAgenciasApi(controlador.signal)
      .then(setAgencias)
      .catch((fallo: unknown) => {
        if (controlador.signal.aborted) return;
        setError(
          fallo instanceof Error ? fallo.message : 'No se pudieron cargar las agencias de envio'
        );
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
  }, []);

  return { agencias, cargando, error };
}
