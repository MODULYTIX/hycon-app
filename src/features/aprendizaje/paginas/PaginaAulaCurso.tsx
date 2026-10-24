import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { RUTAS, rutaCursoDetalle } from '@/app/rutas/rutas';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { obtenerCursoApi } from '@/features/cursos/servicios/cursos.api';
import { obtenerTemarioApi } from '@/features/cursos/servicios/lecciones.api';
import ReproductorLeccion from '@/features/cursos/componentes/organismos/ReproductorLeccion';
import BarraLateralAula from '@/features/aprendizaje/componentes/organismos/BarraLateralAula';
import { fuenteDeLeccion, inicioDeLeccion } from '@/features/cursos/utilidades/video-leccion';
import { formatearDuracion } from '@/shared/utilidades/formato';
import { esUuid } from '@/shared/utilidades/identificador';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';
import type { Leccion, Temario } from '@/features/cursos/tipos/leccion.tipos';

// Un curso sin partes se ve igual: su propio video pasa a ser la unica parte
const comoParte = (curso: Curso): Leccion[] =>
  curso.youtubeId
    ? [
        {
          uuid: curso.uuid,
          titulo: curso.name,
          descripcion: curso.description,
          duracionMinutos: curso.durationMinutes,
          posicion: 1,
          esMuestra: false,
          bloqueada: false,
          tipoVideo: 'youtube',
          videoUrl: curso.videoUrl,
          youtubeId: curso.youtubeId,
          limiteSegundos: null,
        },
      ]
    : [];

const BOTON_NAVEGAR =
  'inline-flex h-11 items-center gap-2 rounded-xl px-4 text-[13.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

/** El curso ya comprado: el temario a un lado y la parte que se esta viendo al otro. */
export default function PaginaAulaCurso() {
  const { uuid = '' } = useParams();
  const { usuario, cargando: restaurandoSesion } = useAutenticacion();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [temario, setTemario] = useState<Temario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activaUuid, setActivaUuid] = useState<string | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(true);

  useEffect(() => {
    // La consulta va autenticada: primero hay que tener el token restaurado
    if (restaurandoSesion || !usuario) return;
    if (!esUuid(uuid)) {
      setError('Este curso no existe.');
      setCargando(false);
      return;
    }

    const controlador = new AbortController();
    let vigente = true;
    setCargando(true);
    setError(null);

    Promise.all([
      obtenerCursoApi(uuid, controlador.signal),
      obtenerTemarioApi(uuid, controlador.signal),
    ])
      .then(([detalle, contenido]) => {
        if (!vigente) return;
        setCurso(detalle);
        setTemario(contenido);
        setActivaUuid(contenido.lecciones[0]?.uuid ?? detalle.uuid);
      })
      .catch((fallo: unknown) => {
        if (!vigente || controlador.signal.aborted) return;
        setError(fallo instanceof Error ? fallo.message : 'No se pudo abrir el curso.');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [uuid, usuario, restaurandoSesion]);

  if (!restaurandoSesion && !usuario) {
    return <Navigate to={rutaCursoDetalle(uuid)} replace />;
  }

  if (cargando || restaurandoSesion) {
    return (
      <div
        role="status"
        aria-label="Abriendo el curso"
        className="mx-auto w-full max-w-[1040px] animate-pulse px-5 py-8"
      >
        <div className="aspect-video w-full rounded-2xl bg-g-20" />
        <div className="mt-6 h-7 w-2/3 rounded bg-g-20" />
        <div className="mt-3 h-4 w-1/3 rounded bg-g-20" />
      </div>
    );
  }

  if (error || !curso || !temario) {
    return (
      <div className="mx-auto max-w-[640px] px-5 py-24 text-center">
        <h1 className="text-2xl font-medium text-g-80">No pudimos abrir el curso</h1>
        <p role="alert" className="mt-3 text-g-50">
          {error ?? 'Vuelve a intentarlo en un momento.'}
        </p>
        <Link
          to={RUTAS.panelCursos}
          className="mt-6 inline-block font-medium text-primary hover:underline"
        >
          Volver a mis cursos
        </Link>
      </div>
    );
  }

  // Sin acceso no hay aula: se vuelve a la ficha, que es donde se compra
  if (!temario.tieneAcceso) return <Navigate to={rutaCursoDetalle(uuid)} replace />;

  const partes = temario.lecciones.length > 0 ? temario.lecciones : comoParte(curso);
  const indice = Math.max(
    0,
    partes.findIndex((parte) => parte.uuid === activaUuid)
  );
  const actual: Leccion | undefined = partes[indice];
  const fuente = fuenteDeLeccion(actual);

  const irA = (destino: number) => {
    const parte = partes[destino];
    if (parte) setActivaUuid(parte.uuid);
  };

  return (
    <div className="flex min-h-[70vh] flex-col bg-g-5 lg:flex-row">
      {panelAbierto && (
        <BarraLateralAula
          cursoNombre={curso.name}
          partes={partes}
          activaUuid={actual?.uuid ?? null}
          onElegir={(parte) => setActivaUuid(parte.uuid)}
          onCerrar={() => setPanelAbierto(false)}
        />
      )}

      <main className="order-1 min-w-0 flex-1 lg:order-2">
        <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-g-20 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-5">
          <button
            type="button"
            onClick={() => setPanelAbierto((previo) => !previo)}
            aria-expanded={panelAbierto}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium text-g-70 transition-colors hover:bg-g-5 hover:text-primary"
          >
            <Icon
              icon={panelAbierto ? 'solar:siderbar-linear' : 'solar:hamburger-menu-linear'}
              width="18"
              height="18"
              aria-hidden
            />
            Contenido
          </button>

          <span aria-hidden className="h-5 w-px shrink-0 bg-g-20" />

          <Link
            to={rutaCursoDetalle(curso.uuid)}
            className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-g-80 transition-colors hover:text-primary"
          >
            {curso.name}
          </Link>

          <Link
            to={RUTAS.panelCursos}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-g-20 px-3 text-[13px] font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
          >
            <Icon icon="solar:diploma-linear" width="16" height="16" aria-hidden />
            <span className="hidden sm:inline">Mis cursos</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[1040px] px-0 pb-12 sm:px-6 sm:py-6">
          {actual && fuente ? (
            <div className="overflow-hidden bg-black shadow-[0_18px_50px_rgba(28,58,57,0.18)] sm:rounded-2xl">
              <ReproductorLeccion
                key={fuente}
                tipo={actual.tipoVideo ?? 'youtube'}
                fuente={fuente}
                titulo={actual.titulo}
                inicio={inicioDeLeccion(actual)}
              />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-g-90 px-6 text-center text-white sm:rounded-2xl">
              <Icon
                icon="solar:videocamera-record-broken"
                width="38"
                height="38"
                aria-hidden
                className="text-white/60"
              />
              <p className="text-[15px]">
                {partes.length === 0
                  ? 'Estamos preparando el contenido de este curso.'
                  : 'Esta parte todavía no tiene video.'}
              </p>
            </div>
          )}

          <section className="mt-5 bg-white px-5 py-5 ring-1 ring-g-20 sm:rounded-2xl sm:px-7 sm:py-6">
            {partes.length > 0 && (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-hy-5 px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-primary">
                <Icon icon="solar:play-stream-linear" width="13" height="13" aria-hidden />
                Parte {indice + 1} de {partes.length}
              </p>
            )}

            <h1 className="mt-3 text-[20px] font-semibold leading-snug tracking-tight text-g-90 sm:text-[23px]">
              {actual?.titulo ?? curso.name}
            </h1>

            {actual?.duracionMinutos !== null && actual?.duracionMinutos !== undefined && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-g-50">
                <Icon icon="solar:clock-circle-linear" width="14" height="14" aria-hidden />
                {formatearDuracion(actual.duracionMinutos)}
              </p>
            )}

            {actual?.descripcion && (
              <p className="mt-4 max-w-[70ch] whitespace-pre-line text-[14.5px] leading-relaxed text-g-60">
                {actual.descripcion}
              </p>
            )}
          </section>

          <nav
            aria-label="Ir a otra parte"
            className="mt-4 flex items-center justify-between gap-3 px-5 sm:px-0"
          >
            <button
              type="button"
              onClick={() => irA(indice - 1)}
              disabled={indice === 0}
              className={`${BOTON_NAVEGAR} border border-g-20 bg-white text-g-70 hover:border-primary hover:text-primary disabled:hover:border-g-20 disabled:hover:text-g-70`}
            >
              <Icon icon="solar:alt-arrow-left-linear" width="16" height="16" aria-hidden />
              Anterior
            </button>

            <button
              type="button"
              onClick={() => irA(indice + 1)}
              disabled={indice >= partes.length - 1}
              className={`${BOTON_NAVEGAR} bg-primary text-white hover:bg-marca-oscuro`}
            >
              Siguiente parte
              <Icon icon="solar:alt-arrow-right-linear" width="16" height="16" aria-hidden />
            </button>
          </nav>
        </div>
      </main>
    </div>
  );
}
