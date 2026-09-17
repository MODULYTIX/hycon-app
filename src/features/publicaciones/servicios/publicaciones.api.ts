import { peticion } from '@/shared/utilidades/cliente-http';
import type { Pagina, Paginacion } from '@/shared/utilidades/paginacion';
import { POR_PAGINA, type EstadoListado } from '@/features/productos/servicios/productos.api';
import type {
  DatosPublicacion,
  Publicacion,
} from '@/features/publicaciones/tipos/publicacion.tipos';

const BASE = '/api/v1/posts';

export const listarPublicacionesApi = (
  estado: EstadoListado,
  pagina: number,
  senal?: AbortSignal
): Promise<Pagina<Publicacion>> =>
  peticion<{ publicaciones: Publicacion[]; paginacion: Paginacion }>(
    `${BASE}?estado=${estado}&pagina=${pagina}&porPagina=${POR_PAGINA}`,
    { senal }
  ).then((r) => ({ elementos: r.publicaciones, paginacion: r.paginacion }));

export const crearPublicacionApi = (datos: DatosPublicacion) =>
  peticion<{ publicacion: Publicacion }>(BASE, {
    metodo: 'POST',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.publicacion);

export const actualizarPublicacionApi = (id: number, datos: DatosPublicacion) =>
  peticion<{ publicacion: Publicacion }>(`${BASE}/${id}`, {
    metodo: 'PUT',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.publicacion);

export const eliminarPublicacionApi = (id: number) =>
  peticion<void>(`${BASE}/${id}`, { metodo: 'DELETE', autenticada: true });
