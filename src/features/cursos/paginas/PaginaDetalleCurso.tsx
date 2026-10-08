import { useEffect, useState } from 'react';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { Icon } from '@iconify/react';
import { Link, useParams } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import { obtenerCursoApi } from '@/features/cursos/servicios/cursos.api';
import { obtenerTemarioApi } from '@/features/cursos/servicios/lecciones.api';
import TemarioCurso from '@/features/cursos/componentes/organismos/TemarioCurso';
import ReproductorYoutube from '@/shared/ui/organismos/ReproductorYoutube';
import { extraerInicioYoutube, miniaturaYoutube } from '@/shared/utilidades/youtube';
import { agregarAlCarrito } from '@/features/carrito/servicios/carrito.almacen';
import { formatearDuracion, formatearPrecio } from '@/shared/utilidades/formato';
import { esUuid } from '@/shared/utilidades/identificador';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';
import type { Leccion, Temario } from '@/features/cursos/tipos/leccion.tipos';

// Lo que se esta reproduciendo: una leccion del temario o el avance del curso
interface EnPantalla {
  youtubeId: string;
  titulo: string;
  inicio: number;
  limiteSegundos: number | null;
}

export default function PaginaDetalleCurso() {
  const { uuid = '' } = useParams();
  const { usuario, cargando: restaurandoSesion } = useAutenticacion();
  const usuarioId = usuario?.userId;
  const [consultandoAcceso, setConsultandoAcceso] = useState(true);
  const [errorAcceso, setErrorAcceso] = useState(false);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [temario, setTemario] = useState<Temario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [agregado, setAgregado] = useState(false);
  const [imagenFallida, setImagenFallida] = useState(false);
  const [enPantalla, setEnPantalla] = useState<EnPantalla | null>(null);

  useEffect(() => {
    // La consulta opcionalmente autenticada debe esperar el token restaurado.
    if (restaurandoSesion) return;
    setConsultandoAcceso(true);
    setErrorAcceso(false);
    setCurso(null);
    setTemario(null);
    setError(null);
    setAviso(null);
    setAgregado(false);
    setImagenFallida(false);
    setEnPantalla(null);
    if (!esUuid(uuid)) {
      setConsultandoAcceso(false);
      setError('Este curso no existe.');
      setCargando(false);
      return;
    }

    const controlador = new AbortController();
    let vigente = true;
    setCargando(true);

    obtenerCursoApi(uuid, controlador.signal)
      .then((detalle) => {
        if (vigente) setCurso(detalle);
      })
      .catch((fallo: unknown) => {
        if (vigente) setError(fallo instanceof Error ? fallo.message : 'No se pudo cargar el curso.');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    // El temario llega aparte: el servidor decide que videos incluye segun quien pregunte
    obtenerTemarioApi(uuid, controlador.signal)
      .then((contenido) => {
        if (vigente) setTemario(contenido);
      })
      .catch(() => {
        // Sin temario la ficha sigue mostrando el avance del curso
        if (vigente) { setTemario(null); setErrorAcceso(true); }
      })
      .finally(() => { if (vigente) setConsultandoAcceso(false); });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [uuid, restaurandoSesion, usuarioId]);

  if (cargando || restaurandoSesion || consultandoAcceso) {
    return (
      <div role="status" aria-label="Cargando curso" className="mx-auto w-full max-w-[1120px] animate-pulse px-5 py-10 sm:px-7">
        <div className="mb-8 h-10 w-3/4 bg-g-10" />
        <div className="grid gap-8 min-[900px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="aspect-video bg-g-10" />
          <div className="space-y-5"><div className="h-12 w-1/2 bg-g-10" /><div className="h-36 bg-g-10" /></div>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-24 text-center">
        <h1 className="text-2xl font-medium text-g-80">Curso no disponible</h1>
        <p role="alert" className="mt-3 text-g-50">{error || 'No se pudo encontrar este curso.'}</p>
        <Link to={RUTAS.cursos} className="mt-6 inline-block font-medium text-primary hover:underline">Volver a cursos</Link>
      </div>
    );
  }

  const tieneAcceso = temario?.tieneAcceso ?? false;
  const lecciones = temario?.lecciones ?? [];
  const minutosTemario = lecciones.reduce((suma, leccion) => suma + (leccion.duracionMinutos ?? 0), 0);
  const duracionTotal = minutosTemario > 0 ? minutosTemario : curso.durationMinutes;
  const precioFinal = curso.discountPrice ?? curso.price;
  const enOferta = curso.discountPrice !== null && curso.discountPrice < curso.price;
  const consultaUrl = `https://wa.me/51902665565?text=${encodeURIComponent(`Hola, quisiera más información sobre el curso «${curso.name}».`)}`;
  const parrafos = curso.description?.trim().split(/\n\s*\n/).filter(Boolean) ?? [];
  // Sin miniatura propia se usa la del video
  const portada = curso.thumbnailUrl ?? (curso.youtubeId ? miniaturaYoutube(curso.youtubeId) : null);
  const muestra = lecciones.find((leccion) => leccion.esMuestra && !leccion.bloqueada);

  const agregar = () => {
    if (tieneAcceso || (usuarioId !== undefined && errorAcceso)) return;
    // Un curso es una sola inscripcion: si ya esta, no se suma otra
    const guardado = agregarAlCarrito({ tipo: 'curso', uuid: curso.uuid });
    setAviso(guardado ? 'Curso agregado al carrito.' : 'Este curso ya está en tu carrito.');
    setAgregado(guardado);
  };

  const reproducirLeccion = (leccion: Leccion) => {
    if (!leccion.youtubeId) return;
    setEnPantalla({
      youtubeId: leccion.youtubeId,
      titulo: leccion.titulo,
      inicio: extraerInicioYoutube(leccion.videoUrl),
      limiteSegundos: leccion.limiteSegundos,
    });
  };

  // Sin temario cargado se ofrece el avance del curso, como antes
  const reproducirAvance = () => {
    if (!curso.youtubeId) return;
    setEnPantalla({
      youtubeId: curso.youtubeId,
      titulo: curso.name,
      inicio: extraerInicioYoutube(curso.videoUrl),
      limiteSegundos: tieneAcceso ? null : curso.previewSegundos,
    });
  };

  const empezar = () => (muestra ? reproducirLeccion(muestra) : reproducirAvance());
  const hayAlgoQueVer = Boolean(muestra?.youtubeId || curso.youtubeId);

  return (
    <article className="detalle-interior mx-auto w-full max-w-[1120px] px-5 pb-16 pt-6 sm:px-7">
      <nav aria-label="Ruta" className="mb-4 flex items-center gap-1.5 text-[12.5px] text-g-50">
        <Link to={RUTAS.cursos} className="transition-colors hover:text-primary">Cursos</Link>
        <Icon icon="solar:alt-arrow-right-linear" width="13" height="13" aria-hidden />
        <span className="truncate text-g-70">{curso.name}</span>
      </nav>

      <header className="mb-6 flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
        <div className="min-w-0">
          <h1 className="text-[1.5rem] font-semibold leading-tight tracking-tight text-g-90 sm:text-[1.9rem]">
            {curso.name}
          </h1>
          <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-g-50">
            {lecciones.length > 0 && (
              <li className="inline-flex items-center gap-1.5">
                <Icon icon="solar:play-stream-linear" width="15" height="15" aria-hidden />
                {lecciones.length} {lecciones.length === 1 ? 'parte' : 'partes'}
              </li>
            )}
            {duracionTotal !== null && duracionTotal > 0 && (
              <li className="inline-flex items-center gap-1.5">
                <Icon icon="solar:clock-circle-linear" width="15" height="15" aria-hidden />
                {formatearDuracion(duracionTotal)}
              </li>
            )}
            <li className="inline-flex items-center gap-1.5">
              <Icon icon="solar:monitor-smartphone-linear" width="15" height="15" aria-hidden />
              Online, a tu ritmo
            </li>
          </ul>
        </div>

        {tieneAcceso && (
          <Link
            to={RUTAS.panelCursos}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-g-30 px-4 text-[13px] font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
          >
            <Icon icon="solar:diploma-linear" width="16" height="16" aria-hidden />
            Mis cursos
          </Link>
        )}
      </header>

      {aviso && (
        <p role="status" className="mb-5 border-l-2 border-primary pl-4 text-sm text-g-60">
          {aviso}
          {agregado && (
            <Link to={RUTAS.carrito} className="ml-2 font-medium text-primary underline underline-offset-4">
              Ver carrito
            </Link>
          )}
        </p>
      )}

      <div className="grid items-start gap-7 min-[900px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] min-[900px]:gap-8">
        <section aria-label="Contenido del curso" className="min-w-0">
          {enPantalla ? (
            <div className="overflow-hidden rounded-xl">
              <ReproductorYoutube
                key={enPantalla.youtubeId + String(enPantalla.limiteSegundos)}
                id={enPantalla.youtubeId}
                titulo={enPantalla.titulo}
                inicio={enPantalla.inicio}
                limiteSegundos={enPantalla.limiteSegundos}
                alTerminarMuestra={
                  tieneAcceso || (usuarioId !== undefined && errorAcceso) ? null : <>
                    <p className="max-w-[320px] text-[13px] leading-relaxed text-white/70">
                      Compra el curso para ver esta parte completa y las demás.
                    </p>
                    <button
                      type="button"
                      onClick={agregar}
                      className="mt-1 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro"
                    >
                      <Icon icon="solar:cart-large-2-linear" width="16" height="16" aria-hidden />
                      Agregar al carrito
                    </button>
                  </>
                }
              />
            </div>
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-xl bg-hy-5">
              {portada && !imagenFallida ? (
                <img src={portada} alt={`Portada de ${curso.name}`} onError={() => setImagenFallida(true)} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-primary">
                  <Icon icon="solar:diploma-linear" width="56" height="56" aria-hidden />
                  <span className="text-xs uppercase tracking-[0.2em]">Formación Hycon</span>
                </div>
              )}
              {hayAlgoQueVer && (
                <button
                  type="button"
                  onClick={empezar}
                  className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-g-90/25 transition-colors hover:bg-g-90/35 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform group-hover:scale-105">
                    <Icon icon="solar:play-bold" width="26" height="26" aria-hidden className="ml-1" />
                  </span>
                  <span className="rounded-xl bg-white/95 px-3 py-1.5 text-xs font-medium text-primary">
                    {tieneAcceso ? 'Ver el curso' : muestra ? 'Ver la muestra gratis' : 'Ver avance del curso'}
                  </span>
                </button>
              )}
            </div>
          )}

          <section aria-labelledby="titulo-temario" className="mt-7">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="titulo-temario" className="text-[16px] font-semibold tracking-tight text-g-90">
                Contenido del curso
              </h2>
              {!tieneAcceso && lecciones.length > 0 && (
                <p className="text-[12.5px] text-g-50">
                  La muestra se ve gratis; el resto se desbloquea al comprar.
                </p>
              )}
            </div>

            {lecciones.length > 0 ? (
              <TemarioCurso
                lecciones={lecciones}
                activa={
                  lecciones.find((leccion) => leccion.youtubeId === enPantalla?.youtubeId)?.uuid ?? null
                }
                onElegir={reproducirLeccion}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-g-30 px-4 py-6 text-center text-[13.5px] text-g-50">
                Estamos preparando el contenido de este curso. Escríbenos y te contamos qué incluye.
              </p>
            )}
          </section>

          <section aria-labelledby="descripcion-curso" className="mt-7">
            <h2 id="descripcion-curso" className="text-[16px] font-semibold tracking-tight text-g-90">
              Acerca de este curso
            </h2>
            <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-g-60">
              {parrafos.length > 0 ? parrafos.map((parrafo, indice) => (
                <p key={indice} className="whitespace-pre-line">{parrafo}</p>
              )) : <p>Consulta con nuestro equipo para conocer el contenido y los requisitos de este curso.</p>}
            </div>
          </section>
        </section>

        <aside className="min-w-0 rounded-xl border border-g-20 bg-white p-5 min-[900px]:sticky min-[900px]:top-6">
          {tieneAcceso ? (
            <>
              <p className="text-[11px] uppercase tracking-[0.12em] text-g-50">Ya es tuyo</p>
              <p className="mt-2 flex items-center gap-2 text-[1.35rem] font-semibold leading-none text-primary">
                <Icon icon="solar:check-circle-bold" width="24" height="24" aria-hidden />
                Acceso activo
              </p>
              <p className="mt-2 text-xs leading-relaxed text-g-50">
                Ya compraste este curso: puedes verlo cuando quieras.
              </p>
              {hayAlgoQueVer && !enPantalla && (
                <button
                  type="button"
                  onClick={empezar}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-white transition-colors hover:bg-marca-oscuro"
                >
                  <Icon icon="solar:play-circle-linear" width="18" height="18" aria-hidden />
                  Reproducir el curso
                </button>
              )}
            </>
          ) : usuarioId !== undefined && errorAcceso ? (
            <p role="alert" className="rounded-lg bg-g-5 p-4 text-sm leading-relaxed text-g-60">No pudimos comprobar tu acceso. Recarga la página para intentarlo de nuevo.</p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-g-50">
                  {precioFinal === 0 ? 'Acceso gratuito' : 'Un solo pago'}
                </p>
                {enOferta && (
                  <span className="rounded-lg bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-g-90">
                    Oferta
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-[1.9rem] font-semibold leading-none tracking-tight text-primary">
                  {formatearPrecio(precioFinal)}
                </p>
                {enOferta && <p className="text-sm text-g-50 line-through">{formatearPrecio(curso.price)}</p>}
              </div>

              <button
                type="button"
                onClick={agregar}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-white transition-colors hover:bg-marca-oscuro focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <Icon icon="solar:cart-large-2-linear" width="18" height="18" aria-hidden />
                Agregar al carrito
              </button>

              {muestra && (
                <button
                  type="button"
                  onClick={() => reproducirLeccion(muestra)}
                  className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-g-30 text-[13px] font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon icon="solar:play-circle-linear" width="16" height="16" aria-hidden />
                  Ver la muestra gratis
                </button>
              )}
            </>
          )}

          <dl className="mt-5 divide-y divide-g-20 border-t border-g-20 text-[13.5px]">
            {lecciones.length > 0 && (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-g-50">Partes</dt>
                <dd className="text-right text-g-80">{lecciones.length}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-g-50">Duración</dt>
              <dd className="text-right text-g-80">
                {duracionTotal === null || duracionTotal === 0 ? 'Por confirmar' : formatearDuracion(duracionTotal)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-g-50">Acceso</dt>
              <dd className="text-right text-g-80">Sin caducidad</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-g-50">Certificación</dt>
              <dd>
                <a href={consultaUrl} target="_blank" rel="noreferrer" className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
                  Consultar requisitos
                </a>
              </dd>
            </div>
          </dl>

          <a
            href={consultaUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:underline"
          >
            <Icon icon="ic:baseline-whatsapp" width="15" height="15" aria-hidden />
            ¿Tienes dudas? Escríbenos
          </a>
        </aside>
      </div>
    </article>
  );
}
