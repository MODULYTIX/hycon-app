import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import Modal from '@/shared/ui/organismos/Modal';
import CabeceraModal from '@/shared/ui/moleculas/CabeceraModal';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import CampoTextoLargo from '@/shared/ui/moleculas/CampoTextoLargo';
import AlertaFormulario from '@/shared/ui/moleculas/AlertaFormulario';
import {
  actualizarLeccionApi,
  crearLeccionApi,
  eliminarLeccionApi,
  obtenerTemarioAdminApi,
  reordenarLeccionesApi,
} from '@/features/cursos/servicios/lecciones.api';
import { validarYoutubeOpcional } from '@/features/cursos/utilidades/validaciones-curso';
import { validarEnteroOpcional, validarNombre } from '@/shared/utilidades/validaciones-comunes';
import { formatearDuracion } from '@/shared/utilidades/formato';
import {
  LECCION_VACIA,
  leccionAFormulario,
  type FormularioLeccion,
  type Leccion,
} from '@/features/cursos/tipos/leccion.tipos';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

const ID_TITULO = 'titulo-modal-temario';

type Errores = Partial<Record<keyof FormularioLeccion, string>>;

const revisar = (datos: FormularioLeccion): Errores => {
  const errores: Errores = {
    title: validarNombre(datos.title),
    videoUrl: validarYoutubeOpcional(datos.videoUrl),
    durationMinutes: validarEnteroOpcional(datos.durationMinutes, 1, 'La duracion'),
  };
  return Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje)) as Errores;
};

interface Props {
  abierto: boolean;
  curso: Curso | null;
  onCerrar: () => void;
}

/** Las partes del curso: agregar, editar, ordenar y elegir cual es la muestra gratis. */
export default function ModalTemario({ abierto, curso, onCerrar }: Props) {
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<Leccion | null>(null);
  const [valores, setValores] = useState<FormularioLeccion>(LECCION_VACIA);
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto || !curso) return;
    let vigente = true;
    setCargando(true);
    setError(null);
    setEditando(null);
    setValores(LECCION_VACIA);

    obtenerTemarioAdminApi(curso.uuid)
      .then((temario) => {
        if (vigente) setLecciones(temario.lecciones);
      })
      .catch((fallo: unknown) => {
        if (vigente) setError(fallo instanceof Error ? fallo.message : 'No se pudo cargar el temario');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [abierto, curso]);

  if (!curso) return null;

  const cambiar = (campo: keyof FormularioLeccion, valor: string | boolean) => {
    setValores((previo) => ({ ...previo, [campo]: valor }));
    setErrores((previo) => ({ ...previo, [campo]: undefined }));
    setError(null);
  };

  const recargar = async () => {
    const temario = await obtenerTemarioAdminApi(curso.uuid);
    setLecciones(temario.lecciones);
  };

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();
    const fallos = revisar(valores);
    setErrores(fallos);
    if (Object.keys(fallos).length > 0) return;

    setGuardando(true);
    setError(null);
    try {
      if (editando) await actualizarLeccionApi(curso.uuid, editando.uuid, valores);
      else await crearLeccionApi(curso.uuid, valores);
      await recargar();
      setEditando(null);
      setValores(LECCION_VACIA);
    } catch (fallo: unknown) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo guardar la parte');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (leccion: Leccion) => {
    setError(null);
    try {
      await eliminarLeccionApi(curso.uuid, leccion.uuid);
      if (editando?.uuid === leccion.uuid) {
        setEditando(null);
        setValores(LECCION_VACIA);
      }
      await recargar();
    } catch (fallo: unknown) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo eliminar la parte');
    }
  };

  // Subir y bajar: se manda la lista completa en el orden nuevo
  const mover = async (indice: number, destino: number) => {
    if (destino < 0 || destino >= lecciones.length) return;
    const orden = lecciones.map((leccion) => leccion.uuid);
    [orden[indice], orden[destino]] = [orden[destino], orden[indice]];
    setError(null);
    try {
      const temario = await reordenarLeccionesApi(curso.uuid, orden);
      setLecciones(temario.lecciones);
    } catch (fallo: unknown) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo cambiar el orden');
    }
  };

  const editar = (leccion: Leccion) => {
    setEditando(leccion);
    setValores(leccionAFormulario(leccion));
    setErrores({});
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} idTitulo={ID_TITULO} ancho="max-w-[820px]">
      <div className="flex max-h-[calc(100dvh-24px)] flex-col sm:max-h-[90vh]">
        <CabeceraModal
          id={ID_TITULO}
          icono="solar:playlist-2-bold"
          titulo="Contenido del curso"
          descripcion={`Partes de "${curso.name}". Solo la marcada como muestra se ve sin comprar.`}
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {error && <AlertaFormulario mensaje={error} />}

          {cargando ? (
            <div aria-label="Cargando contenido" className="space-y-2">
              {[0, 1].map((posicion) => (
                <div key={posicion} className="h-14 animate-pulse rounded-lg bg-g-10" />
              ))}
            </div>
          ) : lecciones.length === 0 ? (
            <p className="rounded-lg border border-dashed border-hy-20 px-4 py-6 text-center text-[13.5px] text-g-50">
              Este curso todavía no tiene partes. Agrega la primera abajo.
            </p>
          ) : (
            <ol aria-label="Partes del curso" className="divide-y divide-hy-10 rounded-lg border border-hy-20">
              {lecciones.map((leccion, indice) => (
                <li key={leccion.uuid} className="flex items-center gap-3 px-3 py-2.5">
                  <span
                    aria-hidden
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hy-10 text-[12px] font-semibold tabular-nums text-hy-70"
                  >
                    {indice + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-medium text-hy-tinta">{leccion.titulo}</span>
                      {leccion.esMuestra && (
                        <span className="rounded-full bg-hy-10 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-hy-70">
                          Muestra gratis
                        </span>
                      )}
                      {!leccion.videoUrl && (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-y-70">
                          <Icon icon="solar:danger-triangle-linear" width="13" height="13" aria-hidden />
                          Sin video
                        </span>
                      )}
                    </span>
                    {leccion.duracionMinutos !== null && (
                      <span className="block text-[12px] text-g-50">
                        {formatearDuracion(leccion.duracionMinutos)}
                      </span>
                    )}
                  </span>

                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void mover(indice, indice - 1)}
                      disabled={indice === 0}
                      aria-label={`Subir ${leccion.titulo}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-hy-70 transition-colors hover:bg-hy-10 disabled:opacity-30"
                    >
                      <Icon icon="solar:alt-arrow-up-linear" width="16" height="16" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => void mover(indice, indice + 1)}
                      disabled={indice === lecciones.length - 1}
                      aria-label={`Bajar ${leccion.titulo}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-hy-70 transition-colors hover:bg-hy-10 disabled:opacity-30"
                    >
                      <Icon icon="solar:alt-arrow-down-linear" width="16" height="16" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => editar(leccion)}
                      aria-label={`Editar ${leccion.titulo}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-hy-70 transition-colors hover:bg-hy-10"
                    >
                      <Icon icon="solar:pen-new-square-linear" width="16" height="16" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => void eliminar(leccion)}
                      aria-label={`Eliminar ${leccion.titulo}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-g-50 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" width="16" height="16" aria-hidden />
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          )}

          <form onSubmit={guardar} noValidate className="mt-6 space-y-4 border-t border-hy-10 pt-5">
            <h3 className="text-[14px] font-semibold text-hy-tinta">
              {editando ? `Editar "${editando.titulo}"` : 'Agregar una parte'}
            </h3>

            <CampoTexto
              id="leccion-title"
              etiqueta="Título"
              placeholder="Introducción al método"
              maxLength={200}
              value={valores.title}
              error={errores.title}
              onChange={(evento) => cambiar('title', evento.target.value)}
            />

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px]">
              <CampoTexto
                id="leccion-videoUrl"
                etiqueta="URL del video"
                placeholder="https://www.youtube.com/watch?v=..."
                inputMode="url"
                opcional
                value={valores.videoUrl}
                error={errores.videoUrl}
                onChange={(evento) => cambiar('videoUrl', evento.target.value)}
              />
              <CampoTexto
                id="leccion-durationMinutes"
                etiqueta="Duración (min)"
                inputMode="numeric"
                placeholder="8"
                opcional
                value={valores.durationMinutes}
                error={errores.durationMinutes}
                onChange={(evento) => cambiar('durationMinutes', evento.target.value)}
              />
            </div>

            <CampoTextoLargo
              id="leccion-description"
              etiqueta="Descripción"
              placeholder="Qué se ve en esta parte"
              rows={2}
              maxLength={2000}
              opcional
              value={valores.description}
              onChange={(evento) => cambiar('description', evento.target.value)}
            />

            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-hy-20 px-3 py-2.5">
              <input
                type="checkbox"
                checked={valores.esMuestra}
                onChange={(evento) => cambiar('esMuestra', evento.target.checked)}
                className="mt-0.5 h-4 w-4 accent-hy-60"
              />
              <span>
                <span className="block text-[13.5px] font-medium text-hy-tinta">
                  Es la muestra gratis
                </span>
                <span className="block text-[12px] leading-relaxed text-g-50">
                  La única parte que ve quien no ha comprado, y solo durante los segundos
                  configurados en el curso. Al marcar otra, esta deja de serlo.
                </span>
              </span>
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={guardando}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-hy-60 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-hy-70 disabled:opacity-60"
              >
                <Icon icon={editando ? 'solar:diskette-linear' : 'solar:add-circle-linear'} width="16" height="16" aria-hidden />
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Agregar parte'}
              </button>
              {editando && (
                <button
                  type="button"
                  onClick={() => {
                    setEditando(null);
                    setValores(LECCION_VACIA);
                    setErrores({});
                  }}
                  className="inline-flex h-10 items-center rounded-lg border border-hy-20 px-4 text-[13px] font-medium text-hy-70 transition-colors hover:border-hy-60"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
