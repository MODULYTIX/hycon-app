import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { RUTAS, rutaAulaCurso, rutaCursoDetalle } from '@/app/rutas/rutas';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import AlertaFormulario from '@/shared/ui/moleculas/AlertaFormulario';
import LaminaCertificado from '@/features/aprendizaje/componentes/organismos/LaminaCertificado';
import {
  emitirCertificadoApi,
  obtenerProgresoApi,
} from '@/features/aprendizaje/servicios/aprendizaje.api';
import { esUuid } from '@/shared/utilidades/identificador';
import type { Certificado, ProgresoCurso } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

// Las mismas reglas que aplica el servidor, para avisar antes de enviar
const revisarNombre = (valor: string): string | undefined => {
  const nombre = valor.trim();
  if (nombre.length < 3) return 'Escribe tu nombre completo';
  if (nombre.length > 120) return 'El nombre es demasiado largo';
  if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(nombre)) {
    return 'El nombre solo admite letras, espacios y los signos . - \'';
  }
  return undefined;
};

export default function PaginaCertificado() {
  const { uuid = '' } = useParams();
  const { usuario, cargando: restaurandoSesion } = useAutenticacion();
  const [progreso, setProgreso] = useState<ProgresoCurso | null>(null);
  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [errorNombre, setErrorNombre] = useState<string>();
  const [confirmado, setConfirmado] = useState(false);
  const [emitiendo, setEmitiendo] = useState(false);

  useEffect(() => {
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

    obtenerProgresoApi(uuid, controlador.signal)
      .then((datos) => {
        if (!vigente) return;
        setProgreso(datos);
        setCertificado(datos.certificado);
        // El nombre de la cuenta es la primera propuesta; se puede corregir
        setNombre(`${usuario.name} ${usuario.lastname}`.trim());
      })
      .catch((fallo: unknown) => {
        if (!vigente || controlador.signal.aborted) return;
        setError(fallo instanceof Error ? fallo.message : 'No se pudo abrir el certificado.');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [uuid, usuario, restaurandoSesion]);

  if (!restaurandoSesion && !usuario) return <Navigate to={rutaCursoDetalle(uuid)} replace />;

  if (cargando || restaurandoSesion) {
    return (
      <div role="status" aria-label="Abriendo el certificado" className="mx-auto w-full max-w-[920px] animate-pulse px-5 py-10">
        <div className="h-[420px] w-full rounded-2xl bg-g-20" />
      </div>
    );
  }

  if (error || !progreso) {
    return (
      <div className="mx-auto max-w-[640px] px-5 py-24 text-center">
        <h1 className="text-2xl font-medium text-g-80">No pudimos abrir el certificado</h1>
        <p role="alert" className="mt-3 text-g-50">
          {error ?? 'Vuelve a intentarlo en un momento.'}
        </p>
        <Link to={RUTAS.panelCursos} className="mt-6 inline-block font-medium text-primary hover:underline">
          Volver a mis cursos
        </Link>
      </div>
    );
  }

  const emitir = async (evento: FormEvent) => {
    evento.preventDefault();
    const problema = revisarNombre(nombre);
    setErrorNombre(problema);
    if (problema || !confirmado) {
      if (!problema && !confirmado) setError('Confirma que el nombre es correcto.');
      return;
    }

    setEmitiendo(true);
    setError(null);
    try {
      setCertificado(await emitirCertificadoApi(uuid, nombre.trim()));
    } catch (fallo: unknown) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo emitir el certificado');
    } finally {
      setEmitiendo(false);
    }
  };

  // Ya emitido: solo queda verlo y descargarlo
  if (certificado) {
    return (
      <div className="mx-auto w-full max-w-[920px] px-4 py-8 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sin-imprimir">
          <Link
            to={RUTAS.panelCursos}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-g-60 transition-colors hover:text-primary"
          >
            <Icon icon="solar:alt-arrow-left-linear" width="16" height="16" aria-hidden />
            Mis cursos
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[13.5px] font-medium text-white transition-colors hover:bg-marca-oscuro"
          >
            <Icon icon="solar:download-minimalistic-linear" width="17" height="17" aria-hidden />
            Descargar
          </button>
        </div>

        <LaminaCertificado certificado={certificado} />

        <p className="mt-4 text-center text-[12.5px] text-g-50 sin-imprimir">
          Al descargar se abre el diálogo de impresión: elige "Guardar como PDF".
        </p>
      </div>
    );
  }

  // Todavia no termino el curso
  if (!progreso.completado) {
    const faltan = progreso.total - progreso.vistas;

    return (
      <div className="mx-auto max-w-[620px] px-5 py-16 text-center">
        <span
          aria-hidden
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-hy-5 text-primary"
        >
          <Icon icon="solar:diploma-linear" width="28" height="28" />
        </span>
        <h1 className="mt-4 text-[22px] font-semibold text-g-90">Te falta terminar el curso</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-g-60">
          {progreso.total === 0
            ? 'Este curso todavía no tiene partes publicadas.'
            : `Llevas ${progreso.vistas} de ${progreso.total} partes. Te ${
                faltan === 1 ? 'falta 1 parte' : `faltan ${faltan} partes`
              } para pedir tu certificado.`}
        </p>
        <Link
          to={rutaAulaCurso(uuid)}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-marca-oscuro"
        >
          <Icon icon="solar:play-circle-linear" width="18" height="18" aria-hidden />
          Seguir el curso
        </Link>
      </div>
    );
  }

  // Terminado y sin emitir: se confirma el nombre, una sola vez
  return (
    <div className="mx-auto w-full max-w-[620px] px-5 py-12">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-g-20 sm:p-8">
        <span
          aria-hidden
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-hy-5 text-primary"
        >
          <Icon icon="solar:diploma-verified-linear" width="24" height="24" />
        </span>

        <h1 className="mt-4 text-[21px] font-semibold tracking-tight text-g-90">
          Terminaste "{progreso.curso}"
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-g-60">
          Confirma con qué nombre quieres tu certificado. Se emite una sola vez y después no se
          puede cambiar, así que revísalo bien.
        </p>

        {error && <AlertaFormulario mensaje={error} />}

        <form onSubmit={emitir} noValidate className="mt-5 space-y-4">
          <CampoTexto
            id="certificado-nombre"
            etiqueta="Nombre completo"
            maxLength={120}
            autoComplete="name"
            value={nombre}
            error={errorNombre}
            onChange={(evento) => {
              setNombre(evento.target.value);
              setErrorNombre(undefined);
              setError(null);
            }}
          />

          <p className="rounded-xl bg-hy-5 px-4 py-3 text-[13px] leading-relaxed text-g-70">
            Así aparecerá en el documento:{' '}
            <span className="font-semibold text-primary">{nombre.trim() || '...'}</span>
          </p>

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={confirmado}
              onChange={(evento) => {
                setConfirmado(evento.target.checked);
                setError(null);
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-hy-60"
            />
            <span className="text-[13px] leading-relaxed text-g-70">
              Confirmo que el nombre está bien escrito y entiendo que el certificado se emite una
              sola vez.
            </span>
          </label>

          <button
            type="submit"
            disabled={emitiendo || !confirmado}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-white transition-colors hover:bg-marca-oscuro disabled:opacity-50"
          >
            <Icon icon="solar:diploma-linear" width="18" height="18" aria-hidden />
            {emitiendo ? 'Emitiendo...' : 'Emitir mi certificado'}
          </button>
        </form>
      </div>
    </div>
  );
}
