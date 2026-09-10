import { peticion } from '@/shared/utilidades/cliente-http';
import type {
  Curso,
  FormularioCurso,
  FormularioProducto,
  Producto,
} from '@/features/administracion/tipos/catalogo.tipos';

const BASE = '/api/v1/catalog';

export const listarProductosApi = (senal?: AbortSignal) =>
  peticion<{ productos: Producto[] }>(`${BASE}/products`, { senal }).then((r) => r.productos);

export const crearProductoApi = (datos: FormularioProducto) =>
  peticion<{ producto: Producto }>(`${BASE}/products`, {
    metodo: 'POST',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.producto);

export const listarCursosApi = (senal?: AbortSignal) =>
  peticion<{ cursos: Curso[] }>(`${BASE}/courses`, { senal }).then((r) => r.cursos);

export const crearCursoApi = (datos: FormularioCurso) =>
  peticion<{ curso: Curso }>(`${BASE}/courses`, {
    metodo: 'POST',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.curso);
