import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useParams } from 'react-router-dom';
import emblemaHycon from '@/assets/images/certificado/emblema-hycon.png';
import { RUTAS } from '@/app/rutas/rutas';
import { verificarCertificadoApi } from '@/features/aprendizaje/servicios/aprendizaje.api';
import { formatearDuracion, formatearFecha } from '@/shared/utilidades/formato';
import type { Certificado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="border-t border-g-20 py-3">
      <dt className="text-[11px] uppercase tracking-[0.16em] text-g-50">{etiqueta}</dt>
      <dd className="mt-1 text-[15px] text-g-90">{valor}</dd>
    </div>
  );
}

/**
 * Lo que ve quien escanea el QR del certificado. Es publica: no hace falta
 * cuenta, y solo se muestra lo que ya esta impreso en el papel.
 */
export default function PaginaVerificarCertificado() {
  const { codigo = '' } = useParams();
  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controlador = new AbortController();
    let vigente = true;
    setCargando(true);
    setError(null);

    verificarCertificadoApi(codigo, controlador.signal)
      .then((datos) => {
        if (vigente) setCertificado(datos);
      })
      .catch((fallo: unknown) => {
        if (!vigente || controlador.signal.aborted) return;
        setError(
          fallo instanceof Error ? fallo.message : 'No pudimos comprobar este certificado.'
        );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [codigo]);

  return (
    <div className="hy-contenedor [--hy-ancho-contenedor:620px] py-12 sm:py-16">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-g-20 sm:p-9">
        <img src={emblemaHycon} alt="" aria-hidden className="h-[30px] w-auto" />

        {cargando && (
          <p role="status" className="mt-6 text-[15px] text-g-50">
            Comprobando el certificado...
          </p>
        )}

        {!cargando && error && (
          <>
            <h1 className="mt-6 text-[22px] font-semibold tracking-tight text-g-90">
              No encontramos este certificado
            </h1>
            <p role="alert" className="mt-2 text-[14.5px] leading-relaxed text-g-60">
              {error} Revisa que el código esté bien copiado; es el que aparece al pie del
              documento.
            </p>
            <p className="mt-4 rounded-xl bg-g-5 px-4 py-3 font-mono text-[13px] text-g-70">
              {codigo || 'sin código'}
            </p>
          </>
        )}

        {!cargando && certificado && (
          <>
            <p className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-hy-5 px-3 py-1.5 text-[12.5px] font-medium text-primary">
              <Icon icon="solar:check-circle-bold" width="16" height="16" aria-hidden />
              Certificado válido
            </p>

            <h1 className="mt-4 text-[22px] font-semibold tracking-tight text-g-90 sm:text-[26px]">
              {certificado.nombre}
            </h1>
            <p className="mt-1 text-[14.5px] text-g-60">
              completó el curso «{certificado.curso}» en Hycon.
            </p>

            <dl className="mt-7">
              <Dato etiqueta="Curso" valor={certificado.curso} />
              {certificado.duracionMinutos !== null && certificado.duracionMinutos > 0 && (
                <Dato etiqueta="Duración" valor={formatearDuracion(certificado.duracionMinutos)} />
              )}
              <Dato etiqueta="Fecha de emisión" valor={formatearFecha(certificado.emitidoEl)} />
              <Dato etiqueta="Código de verificación" valor={certificado.codigo} />
            </dl>
          </>
        )}

        <Link
          to={RUTAS.home}
          className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-primary hover:underline"
        >
          Conocer Hycon
          <Icon icon="solar:arrow-right-linear" width="15" height="15" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
