import { peticion } from '@/shared/utilidades/cliente-http';
import type { Pagina, Paginacion } from '@/shared/utilidades/paginacion';
import { POR_PAGINA, type EstadoListado } from '@/features/productos/servicios/productos.api';
import type {
  DatosPublicacion,
  Publicacion,
} from '@/features/publicaciones/tipos/publicacion.tipos';

const BASE = '/api/v1/posts';

// recientes: lo ultimo publicado. leidos: lo mas leido
export type OrdenPublicaciones = 'recientes' | 'leidos';

interface OpcionesListado {
  pagina?: number;
  porPagina?: number;
  orden?: OrdenPublicaciones;
  senal?: AbortSignal;
}

export const listarPublicacionesApi = (
  estado: EstadoListado,
  { pagina = 1, porPagina = POR_PAGINA, orden = 'recientes', senal }: OpcionesListado = {}
): Promise<Pagina<Publicacion>> =>
  peticion<{ publicaciones: Publicacion[]; paginacion: Paginacion }>(
    `${BASE}?estado=${estado}&pagina=${pagina}&porPagina=${porPagina}&orden=${orden}`,
    { senal }
  ).then((r) => ({ elementos: r.publicaciones, paginacion: r.paginacion }));

// La web publica pide por slug; esa lectura suma al contador del articulo
export const obtenerPublicacionApi = (slug: string, senal?: AbortSignal) =>
  peticion<{ publicacion: Publicacion }>(`${BASE}/${encodeURIComponent(slug)}`, { senal }).then(
    (r) => r.publicacion
  );

export const crearPublicacionApi = (datos: DatosPublicacion) =>
  peticion<{ publicacion: Publicacion }>(BASE, {
    metodo: 'POST',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.publicacion);

export const actualizarPublicacionApi = (uuid: string, datos: DatosPublicacion) =>
  peticion<{ publicacion: Publicacion }>(`${BASE}/${uuid}`, {
    metodo: 'PUT',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.publicacion);

export const eliminarPublicacionApi = (uuid: string) =>
  peticion<void>(`${BASE}/${uuid}`, { metodo: 'DELETE', autenticada: true });
