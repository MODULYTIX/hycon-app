import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import CampoTextoLargo from '@/shared/ui/moleculas/CampoTextoLargo';
import {
  listarEvaluacionesApi,
  solicitarCotizacionApi,
} from '@/features/contacto/servicios/cotizaciones.api';
import { formatearPrecio } from '@/shared/utilidades/formato';
import type {
  Cotizacion,
  EvaluacionErgonomica,
} from '@/features/contacto/tipos/cotizacion.tipos';

const WHATSAPP = '51902665565';

export const EVALUACIONES_BASE: EvaluacionErgonomica[] = [
  {
    codigo: 'movimientos-repetitivos',
    nombre: 'Movimientos repetitivos de miembros superiores',
    norma: 'ISO 11228-3:2026',
    precio: 250,
  },
  {
    codigo: 'levantamiento-cargas',
    nombre: 'Levantamiento de cargas',
    norma: 'ISO 11228-1:2021',
    precio: 200,
  },
  {
    codigo: 'empuje-traccion',
    nombre: 'Empuje y tracción',
    norma: 'ISO 11228-2:2007',
    precio: 250,
  },
  {
    codigo: 'posturas-forzadas',
    nombre: 'Posturas forzadas',
    norma: 'ISO 11226:2000',
    precio: 200,
  },
];

interface Campos {
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
}

const VACIO: Campos = { name: '', company: '', phone: '', email: '', message: '' };

type Errores = Partial<Record<keyof Campos, string>>;

// Validación de campos de contacto del formulario
const revisar = (campos: Campos): Errores => {
  const errores: Errores = {};
  if (campos.name.trim().length < 2) errores.name = 'Escribe tu nombre';
  if (!/^[\d+()\s-]{6,30}$/.test(campos.phone.trim())) errores.phone = 'Escribe un número de celular válido';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(campos.email.trim())) errores.email = 'Escribe un correo válido';
  return errores;
};

const mensajeWhatsapp = (cotizacion: Cotizacion) =>
  `Hola Hycon, solicité la cotización ${cotizacion.codigo}:\n` +
  cotizacion.evaluaciones.map((e) => `- ${e.nombre} (${e.norma}): ${formatearPrecio(e.precio)}`).join('\n') +
  `\n\nTotal: ${formatearPrecio(cotizacion.total)}`;

/** Cotización de evaluaciones ergonómicas con detalle informativo de normativas */
export default function FormularioCotizacion() {
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionErgonomica[]>(EVALUACIONES_BASE);
  const [campos, setCampos] = useState<Campos>(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviada, setEnviada] = useState<Cotizacion | null>(null);

  useEffect(() => {
    const controlador = new AbortController();
    let vigente = true;

    listarEvaluacionesApi(controlador.signal)
      .then((lista) => {
        if (vigente && Array.isArray(lista) && lista.length > 0) {
          setEvaluaciones(lista);
        }
      })
      .catch(() => {
        // En caso de que el backend no responda, se conservan las evaluaciones informativas base
        // sin interrumpir la experiencia ni mostrar una alerta bloqueante de servidor.
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, []);

  const cambiar = (campo: keyof Campos, valor: string) => {
    setCampos((previo) => ({ ...previo, [campo]: valor }));
    setErrores((previo) => ({ ...previo, [campo]: undefined }));
    setError(null);
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const fallos = revisar(campos);
    setErrores(fallos);
    if (Object.keys(fallos).length > 0) return;

    setEnviando(true);
    setError(null);
    try {
      const cotizacion = await solicitarCotizacionApi({
        name: campos.name.trim(),
        company: campos.company.trim() || undefined,
        phone: campos.phone.trim(),
        email: campos.email.trim(),
        message: campos.message.trim() || undefined,
        evaluaciones: evaluaciones.map((e) => e.codigo),
      });
      setEnviada(cotizacion);
      setCampos(VACIO);
    } catch (fallo: unknown) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  if (enviada) {
    return (
      <section
        aria-labelledby="titulo-cotizacion"
        className="mx-auto w-full max-w-[760px] rounded-2xl border border-g-20 bg-white p-6 text-center shadow-sm sm:p-8"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-hy-10 text-primary">
          <Icon icon="solar:check-circle-bold" width="32" height="32" aria-hidden />
        </span>
        <h2 id="titulo-cotizacion" className="mt-4 text-[20px] font-semibold text-g-90">
          Solicitud enviada
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-g-50">
          Guardamos tu pedido con el código <strong className="text-g-90">{enviada.codigo}</strong>. Te
          escribimos al {enviada.telefono} para coordinar la evaluación.
        </p>

        <dl className="mt-5 divide-y divide-g-20 border-y border-g-20 text-left text-[13.5px]">
          {enviada.evaluaciones.map((evaluacion) => (
            <div key={evaluacion.codigo} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="min-w-0 text-g-70">
                {evaluacion.nombre}
                <span className="block text-[12px] text-g-50">{evaluacion.norma}</span>
              </dt>
              <dd className="shrink-0 tabular-nums text-g-80">{formatearPrecio(evaluacion.precio)}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 flex items-baseline justify-between gap-4">
          <span className="text-[13px] uppercase tracking-[0.12em] text-g-50">Total</span>
          <span className="text-[22px] font-semibold tabular-nums text-primary">
            {formatearPrecio(enviada.total)}
          </span>
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensajeWhatsapp(enviada))}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-marca-oscuro"
          >
            <Icon icon="ic:baseline-whatsapp" width="18" height="18" aria-hidden />
            Adelantar por WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setEnviada(null)}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-g-30 px-5 text-sm font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
          >
            Pedir otra cotización
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="titulo-cotizacion"
      className="mx-auto w-full max-w-[760px] rounded-2xl border border-g-20 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 id="titulo-cotizacion" className="text-[20px] font-semibold tracking-tight text-g-90">
        Cotización de evaluaciones ergonómicas
      </h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-g-50">
        Evaluaciones de riesgo ergonómico para puestos administrativos y operativos. Déjanos tus datos
        y te responderemos con el alcance y las fechas disponibles.
      </p>

      {/* Bloque informativo de evaluaciones ergonómicas (no seleccionables) */}
      <div className="mt-5 rounded-2xl border border-hy-20/80 bg-gradient-to-br from-hy-5/60 via-white to-hy-5/30 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-g-90">
            <Icon icon="solar:shield-check-linear" width="20" height="20" className="text-primary" aria-hidden />
            <span>Evaluaciones ergonómicas que realizamos</span>
          </div>

        </div>

        <p className="mt-1.5 text-[12.5px] leading-relaxed text-g-60">
          Nuestras evaluaciones técnicas se aplican según la R.M. 375-2008-TR y metodologías ISO internacionales:
        </p>

        <ul aria-label="Evaluaciones informativas" className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {evaluaciones.map((evaluacion) => (
            <li
              key={evaluacion.codigo}
              className="flex items-start gap-2.5 rounded-xl border border-g-20/80 bg-white p-3 shadow-xs transition-shadow hover:shadow-sm"
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-hy-10 text-primary">
                <Icon icon="solar:check-read-linear" width="13" height="13" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium leading-snug text-g-90">
                  {evaluacion.nombre}
                </span>
                <span className="block mt-0.5 text-[11.5px] font-mono text-primary font-medium">
                  {evaluacion.norma}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={enviar} noValidate className="mt-6 space-y-5">
        <fieldset disabled={enviando}>
          <legend className="text-[14.5px] font-semibold text-g-90">
            Datos de contacto y requerimiento
          </legend>

          <div className="mt-3.5 grid gap-4 sm:grid-cols-2">
            <CampoTexto
              id="cotizacion-nombre"
              etiqueta="Nombre y apellido"
              autoComplete="name"
              value={campos.name}
              error={errores.name}
              onChange={(evento) => cambiar('name', evento.target.value)}
            />
            <CampoTexto
              id="cotizacion-empresa"
              etiqueta="Empresa"
              opcional
              autoComplete="organization"
              value={campos.company}
              onChange={(evento) => cambiar('company', evento.target.value)}
            />
            <CampoTexto
              id="cotizacion-celular"
              etiqueta="Celular"
              inputMode="tel"
              autoComplete="tel"
              placeholder="902 665 565"
              value={campos.phone}
              error={errores.phone}
              onChange={(evento) => cambiar('phone', evento.target.value)}
            />
            <CampoTexto
              id="cotizacion-correo"
              etiqueta="Correo"
              type="email"
              autoComplete="email"
              placeholder="tucorreo@empresa.com"
              value={campos.email}
              error={errores.email}
              onChange={(evento) => cambiar('email', evento.target.value)}
            />
          </div>

          <CampoTextoLargo
            id="cotizacion-mensaje"
            etiqueta="Cuéntanos tu requerimiento"
            opcional
            rows={3}
            maxLength={1000}
            className="mt-4"
            placeholder="Cantidad de puestos, sede, fechas tentativas..."
            value={campos.message}
            onChange={(evento) => cambiar('message', evento.target.value)}
          />
        </fieldset>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-[13px] text-red-800"
          >
            <Icon icon="solar:danger-triangle-linear" width="18" height="18" className="mt-0.5 shrink-0 text-red-600" aria-hidden />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-medium text-white shadow-xs transition-colors hover:bg-marca-oscuro disabled:opacity-60"
        >
          {enviando ? 'Enviando...' : 'Solicitar cotización'}
        </button>
      </form>
    </section>
  );
}
