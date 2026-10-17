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

interface Campos {
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
}

const VACIO: Campos = { name: '', company: '', phone: '', email: '', message: '' };

type Errores = Partial<Record<keyof Campos | 'evaluaciones', string>>;

// Las mismas reglas que aplica el backend, para avisar antes de enviar
const revisar = (campos: Campos, elegidas: string[]): Errores => {
  const errores: Errores = {};
  if (campos.name.trim().length < 2) errores.name = 'Escribe tu nombre';
  if (!/^[\d+()\s-]{6,30}$/.test(campos.phone.trim())) errores.phone = 'Escribe un número de celular válido';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(campos.email.trim())) errores.email = 'Escribe un correo válido';
  if (elegidas.length === 0) errores.evaluaciones = 'Elige al menos una evaluación';
  return errores;
};

const mensajeWhatsapp = (cotizacion: Cotizacion) =>
  `Hola Hycon, solicité la cotización ${cotizacion.codigo}:\n` +
  cotizacion.evaluaciones.map((e) => `- ${e.nombre} (${e.norma}): ${formatearPrecio(e.precio)}`).join('\n') +
  `\n\nTotal: ${formatearPrecio(cotizacion.total)}`;

/** Cotización de evaluaciones ergonómicas: se elige, se calcula y se envía. */
export default function FormularioCotizacion() {
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionErgonomica[]>([]);
  const [elegidas, setElegidas] = useState<string[]>([]);
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
        if (vigente) setEvaluaciones(lista);
      })
      .catch(() => {
        if (vigente) setError('No se pudieron cargar las evaluaciones. Recarga la página.');
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, []);

  // El total se muestra con los precios que manda el servidor
  const total = evaluaciones
    .filter((evaluacion) => elegidas.includes(evaluacion.codigo))
    .reduce((suma, evaluacion) => suma + evaluacion.precio, 0);

  const alternar = (codigo: string) => {
    setElegidas((previas) =>
      previas.includes(codigo) ? previas.filter((c) => c !== codigo) : [...previas, codigo]
    );
    setErrores((previo) => ({ ...previo, evaluaciones: undefined }));
  };

  const cambiar = (campo: keyof Campos, valor: string) => {
    setCampos((previo) => ({ ...previo, [campo]: valor }));
    setErrores((previo) => ({ ...previo, [campo]: undefined }));
    setError(null);
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const fallos = revisar(campos, elegidas);
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
        evaluaciones: elegidas,
      });
      setEnviada(cotizacion);
      setCampos(VACIO);
      setElegidas([]);
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
        Elige las evaluaciones que necesitas y déjanos tus datos. Te respondemos con el alcance y las
        fechas disponibles.
      </p>

      <form onSubmit={enviar} noValidate className="mt-6 space-y-5">
        <fieldset disabled={enviando}>
          <legend className="text-[14px] font-semibold text-g-90">¿Qué necesitas evaluar?</legend>

          <ul className="mt-3 space-y-2">
            {evaluaciones.map((evaluacion) => {
              const marcada = elegidas.includes(evaluacion.codigo);

              return (
                <li key={evaluacion.codigo}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      marcada ? 'border-primary bg-hy-5' : 'border-g-20 hover:border-g-30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={marcada}
                      onChange={() => alternar(evaluacion.codigo)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-hy-60"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-g-90">{evaluacion.nombre}</span>
                      <span className="block text-[12.5px] text-g-50">{evaluacion.norma}</span>
                    </span>
                    <span className="shrink-0 text-[14px] font-semibold tabular-nums text-primary">
                      {formatearPrecio(evaluacion.precio)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          {errores.evaluaciones && (
            <p className="mt-2 text-[12.5px] text-red-600">{errores.evaluaciones}</p>
          )}

          {elegidas.length > 0 && (
            <p className="mt-3 flex items-baseline justify-between gap-4 rounded-xl bg-hy-5 px-4 py-3">
              <span className="text-[13px] uppercase tracking-[0.12em] text-g-50">Total estimado</span>
              <span className="text-[20px] font-semibold tabular-nums text-primary">
                {formatearPrecio(total)}
              </span>
            </p>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-medium text-white transition-colors hover:bg-marca-oscuro disabled:opacity-60"
        >
          {enviando ? 'Enviando...' : 'Solicitar cotización'}
        </button>
      </form>
    </section>
  );
}
