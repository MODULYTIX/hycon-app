import { peticion } from '@/shared/utilidades/cliente-http';
import type { FormularioLeccion, Leccion, Temario } from '@/features/cursos/tipos/leccion.tipos';

const base = (cursoUuid: string) => `/api/v1/catalog/courses/${cursoUuid}/lecciones`;

// Lo que se envia al guardar: los numeros van como texto en el formulario
const aCuerpo = (datos: FormularioLeccion) => ({
  title: datos.title.trim(),
  description: datos.description.trim(),
  videoUrl: datos.videoUrl.trim(),
  durationMinutes: datos.durationMinutes.trim() === '' ? undefined : Number(datos.durationMinutes),
  esMuestra: datos.esMuestra,
});

/** Temario publico: el backend decide que videos incluye segun quien pregunte. */
export const obtenerTemarioApi = (cursoUuid: string, senal?: AbortSignal) =>
  peticion<{ temario: Temario }>(base(cursoUuid), { autenticada: true, senal }).then((r) => r.temario);

export const obtenerTemarioAdminApi = (cursoUuid: string, senal?: AbortSignal) =>
  peticion<{ temario: Temario }>(`${base(cursoUuid)}/admin`, { autenticada: true, senal }).then(
    (r) => r.temario
  );

export const crearLeccionApi = (cursoUuid: string, datos: FormularioLeccion) =>
  peticion<{ leccion: Leccion }>(base(cursoUuid), {
    metodo: 'POST',
    cuerpo: aCuerpo(datos),
    autenticada: true,
  }).then((r) => r.leccion);

export const actualizarLeccionApi = (cursoUuid: string, leccionUuid: string, datos: FormularioLeccion) =>
  peticion<{ leccion: Leccion }>(`${base(cursoUuid)}/${leccionUuid}`, {
    metodo: 'PUT',
    cuerpo: aCuerpo(datos),
    autenticada: true,
  }).then((r) => r.leccion);

export const eliminarLeccionApi = (cursoUuid: string, leccionUuid: string) =>
  peticion<void>(`${base(cursoUuid)}/${leccionUuid}`, { metodo: 'DELETE', autenticada: true });

export const reordenarLeccionesApi = (cursoUuid: string, orden: string[]) =>
  peticion<{ temario: Temario }>(`${base(cursoUuid)}/orden`, {
    metodo: 'PUT',
    cuerpo: { orden },
    autenticada: true,
  }).then((r) => r.temario);
