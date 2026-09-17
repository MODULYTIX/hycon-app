import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useParams } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import { obtenerCursoApi } from '@/features/cursos/servicios/cursos.api';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';
import { formatearDuracion, formatearPrecio } from '@/shared/utilidades/formato';

const CLAVE_CARRITO = 'hycon.carrito.cursos';

interface CursoEnCarrito {
  courseId: number;
  quantity: number;
}

export default function PaginaDetalleCurso() {
  const { courseId } = useParams();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [imagenFallida, setImagenFallida] = useState(false);

  useEffect(() => {
    setCurso(null);
    setError(null);
    setAviso(null);
    setImagenFallida(false);
    const id = Number(courseId);
    if (!Number.isSafeInteger(id) || id < 1) {
      setError('Este curso no existe.');
      setCargando(false);
      return;
    }

    const controlador = new AbortController();
    let vigente = true;
    setCargando(true);

    obtenerCursoApi(id, controlador.signal)
      .then((detalle) => {
        if (vigente) setCurso(detalle);
      })
      .catch((fallo: unknown) => {
        if (vigente) setError(fallo instanceof Error ? fallo.message : 'No se pudo cargar el curso.');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [courseId]);

  if (cargando) {
    return (
      <div role="status" aria-label="Cargando curso" className="mx-auto w-full max-w-[1120px] animate-pulse px-5 py-10 sm:px-7">
        <div className="mb-8 h-12 w-3/4 bg-g-10" />
        <div className="grid gap-8 min-[700px]:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="aspect-video bg-g-10" />
          <div className="space-y-5"><div className="h-12 w-1/2 bg-g-10" /><div className="h-36 bg-g-10" /></div>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-24 text-center">
        <h1 className="text-3xl font-medium text-g-80">Curso no disponible</h1>
        <p role="alert" className="mt-3 text-g-50">{error || 'No se pudo encontrar este curso.'}</p>
        <Link to={RUTAS.cursos} className="mt-6 inline-block font-medium text-primary hover:underline">Volver a cursos</Link>
      </div>
    );
  }

  const precioFinal = curso.discountPrice ?? curso.price;
  const enOferta = curso.discountPrice !== null && curso.discountPrice < curso.price;
  const consultaUrl = `https://wa.me/51902665565?text=${encodeURIComponent(`Hola, quisiera más información sobre el curso «${curso.name}».`)}`;
  const parrafos = curso.description?.trim().split(/\n\s*\n/).filter(Boolean) ?? [];

  const agregar = () => {
    try {
      const guardado: unknown = JSON.parse(window.localStorage.getItem(CLAVE_CARRITO) || '[]');
      if (!Array.isArray(guardado) || !guardado.every((item) =>
        item && Number.isSafeInteger(item.courseId) && item.courseId > 0 && item.quantity === 1
      )) throw new Error('Carrito inválido');
      const items: CursoEnCarrito[] = guardado;
      if (items.some((item) => item.courseId === curso.courseId)) {
        setAviso('Este curso ya está en tu carrito.');
        return;
      }
      window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify([...items, { courseId: curso.courseId, quantity: 1 }]));
      setAviso('Curso agregado al carrito.');
    } catch {
      setAviso('No se pudo guardar el curso. Inténtalo de nuevo.');
    }
  };

  return (
    <article className="mx-auto w-full max-w-[1120px] px-5 pb-16 pt-8 sm:px-7 min-[700px]:pt-10">
      <header className="mb-8 flex flex-col gap-5 min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between">
        <h1 className="min-w-0 text-[2rem] font-medium leading-[1.15] tracking-tight text-g-80 sm:text-[2.6rem]">{curso.name}</h1>
        <button type="button" onClick={agregar} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-[2px] bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-bc-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary min-[700px]:self-auto">
          <Icon icon="solar:cart-large-2-linear" width="18" height="18" aria-hidden />
          Agregar al carrito
        </button>
      </header>

      {aviso && <p role="status" className="mb-6 border-l-2 border-primary pl-4 text-sm text-g-60">{aviso}</p>}

      <section aria-label="Presentación del curso" className="grid items-start gap-8 min-[700px]:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="relative aspect-video overflow-hidden rounded-[2px] bg-bc-5">
          {curso.thumbnailUrl && !imagenFallida ? (
            <img src={curso.thumbnailUrl} alt={`Portada de ${curso.name}`} onError={() => setImagenFallida(true)} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-primary">
              <Icon icon="solar:diploma-linear" width="64" height="64" aria-hidden />
              <span className="text-xs uppercase tracking-[0.2em]">Formación Hycon</span>
            </div>
          )}
          {curso.videoUrl && (
            <a href={curso.videoUrl} target="_blank" rel="noreferrer" className="absolute bottom-4 left-4 inline-flex items-center gap-3 rounded-[2px] border border-white/70 bg-white/95 px-4 py-2.5 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              Ver avance del curso
              <Icon icon="solar:arrow-right-up-linear" width="17" height="17" aria-hidden />
            </a>
          )}
        </div>

        <div className="min-w-0">
          <div className="border-l-[3px] border-primary pl-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-g-50">{precioFinal === 0 ? 'Acceso gratuito' : 'Un solo pago'}</p>
              {enOferta && <span className="rounded-[2px] bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-g-90">Oferta</span>}
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-[2.25rem] font-medium leading-none tracking-tight text-primary">{formatearPrecio(precioFinal)}</p>
              {enOferta && <p className="text-sm text-g-50 line-through">{formatearPrecio(curso.price)}</p>}
            </div>
          </div>
          <dl className="mt-6 divide-y divide-g-20 border-y border-g-20 text-sm">
            <div className="flex justify-between gap-4 py-3"><dt className="text-g-50">Duración</dt><dd className="text-right text-g-80">{curso.durationMinutes === null ? 'Por confirmar' : formatearDuracion(curso.durationMinutes)}</dd></div>
            <div className="flex justify-between gap-4 py-3"><dt className="text-g-50">Modalidad</dt><dd className="text-right text-g-80">Online</dd></div>
            <div className="flex justify-between gap-4 py-3"><dt className="text-g-50">Certificación</dt><dd><a href={consultaUrl} target="_blank" rel="noreferrer" className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">Consultar requisitos</a></dd></div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-g-50">¿Tienes dudas? Te ayudamos a conocer el curso antes de inscribirte.</p>
        </div>
      </section>

      <section aria-labelledby="descripcion-curso" className="mt-8">
        <h2 id="descripcion-curso" className="text-lg font-medium text-g-80">Acerca de este curso</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-g-60">
          {parrafos.length > 0 ? parrafos.map((parrafo, indice) => (
            <p key={indice} className="whitespace-pre-line">{parrafo}</p>
          )) : <p>Consulta con nuestro equipo para conocer el contenido y los requisitos de este curso.</p>}
        </div>
      </section>

      <section aria-label="Información de inscripción" className="mt-9 grid gap-7 border-t border-g-20 pt-8 sm:grid-cols-3 sm:gap-6">
        <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-bc-5 text-primary"><Icon icon="solar:wallet-linear" width="28" height="28" aria-hidden /></span>
          <div><h2 className="text-base font-medium text-g-80">{precioFinal === 0 ? 'Acceso gratuito' : 'Un solo pago'}</h2><p className="mt-1 max-w-[250px] text-xs leading-relaxed text-g-50">{precioFinal === 0 ? 'Este curso no tiene costo de inscripción.' : 'El precio del curso, en un único pago.'}</p></div>
        </div>
        <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-bc-5 text-primary"><Icon icon="solar:verified-check-linear" width="28" height="28" aria-hidden /></span>
          <div><h2 className="text-base font-medium text-g-80">Obtén tu certificado</h2><p className="mt-1 max-w-[250px] text-xs leading-relaxed text-g-50">Consulta los requisitos de certificación de este curso.</p></div>
        </div>
        <a href={consultaUrl} target="_blank" rel="noreferrer" className="group flex items-start gap-4 rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:flex-col sm:items-center sm:text-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-bc-5 text-primary transition-colors group-hover:bg-bc-10"><Icon icon="ic:baseline-whatsapp" width="28" height="28" aria-hidden /></span>
          <div><h2 className="flex items-center gap-2 text-base font-medium text-g-80 group-hover:text-primary sm:justify-center">Conversemos <Icon icon="solar:arrow-right-up-linear" width="15" height="15" aria-hidden /></h2><p className="mt-1 max-w-[250px] text-xs leading-relaxed text-g-50">Resuelve tus dudas con Hycon por WhatsApp.</p></div>
        </a>
      </section>
    </article>
  );
}
