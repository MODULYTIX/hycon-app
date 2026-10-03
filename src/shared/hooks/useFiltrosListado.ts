import { useState } from 'react';
import type { FiltrosListado } from '@/shared/utilidades/filtros-listado';
export function useFiltrosListado() {
  const [filtros, setFiltros] = useState<FiltrosListado>({});
  const clave = Object.keys(filtros).length ? JSON.stringify(filtros) : '';
  return { filtros, clave, aplicar: setFiltros };
}
