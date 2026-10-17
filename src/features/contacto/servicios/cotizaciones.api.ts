import { peticion } from '@/shared/utilidades/cliente-http';
import type {
  Cotizacion,
  DatosCotizacion,
  EvaluacionErgonomica,
} from '@/features/contacto/tipos/cotizacion.tipos';

const BASE = '/api/v1/cotizaciones';

/** Las evaluaciones que se cotizan, con su norma y su precio. */
export const listarEvaluacionesApi = (senal?: AbortSignal) =>
  peticion<{ evaluaciones: EvaluacionErgonomica[] }>(`${BASE}/evaluaciones`, { senal }).then(
    (r) => r.evaluaciones
  );

export const solicitarCotizacionApi = (datos: DatosCotizacion) =>
  peticion<{ cotizacion: Cotizacion }>(BASE, { metodo: 'POST', cuerpo: datos }).then(
    (r) => r.cotizacion
  );
