import emblemaHycon from '@/assets/images/certificado/emblema-hycon.png';
import { formatearDuracion, formatearFecha } from '@/shared/utilidades/formato';
import type { Certificado, ParteProgreso } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

interface Props {
  certificado: Certificado;
  partes: ParteProgreso[];
}

/**
 * El reverso del certificado: que se estudio. Va en su propia hoja, detras del
 * diploma, como el programa academico de cualquier titulo.
 */
// A partir de aqui una sola columna alargaria la hoja de mas
const PARTES_POR_COLUMNA = 6;

export default function LaminaPrograma({ certificado, partes }: Props) {
  const ordenadas = [...partes].sort((una, otra) => una.posicion - otra.posicion);
  const aDosColumnas = ordenadas.length > PARTES_POR_COLUMNA;

  return (
    <article
      aria-label={`Programa del curso ${certificado.codigo}`}
      className="lamina-certificado mx-auto w-full max-w-[980px] bg-certificado-papel p-3 ring-1 ring-g-20 sm:p-5"
    >
      <div className="relative flex min-h-[460px] flex-col border border-hy-30 px-6 py-9 sm:px-14 sm:py-12">
        <header className="flex items-center justify-between gap-6 border-b border-hy-30 pb-5">
          <div className="min-w-0">
            <h1 className="font-serif text-[20px] font-semibold tracking-tight text-hy-90 sm:text-[27px]">
              Programa del curso
            </h1>
            <p className="mt-1 text-[13px] text-g-60 sm:text-[15px]">{certificado.curso}</p>
          </div>

          <img src={emblemaHycon} alt="" aria-hidden className="h-[26px] w-auto sm:h-[34px]" />
        </header>

        {ordenadas.length > 0 ? (
          <ol className={`mt-7 space-y-3.5 ${aDosColumnas ? 'sm:columns-2 sm:gap-10' : ''}`}>
            {ordenadas.map((parte, indice) => (
              <li key={parte.uuid} className="flex gap-3.5 break-inside-avoid">
                <span
                  aria-hidden
                  className="mt-[3px] w-[22px] shrink-0 text-right font-serif text-[13px] text-hy-60"
                >
                  {indice + 1}.
                </span>
                <span className="text-[13.5px] leading-relaxed text-g-80 sm:text-[15px]">
                  {parte.titulo}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-7 text-[13.5px] text-g-50">
            Este curso no tiene el temario desglosado.
          </p>
        )}

        {certificado.duracionMinutos !== null && certificado.duracionMinutos > 0 && (
          <p className="mt-7 border-t border-g-20 pt-4 text-[12.5px] text-g-50">
            Duración total: {formatearDuracion(certificado.duracionMinutos)}
          </p>
        )}

        {/* Al pie, como en el reverso de cualquier diploma: de quien es y cual es */}
        <footer className="mt-auto pt-10 text-right text-[11.5px] leading-relaxed text-g-60">
          <p className="font-semibold text-g-80">{certificado.nombre}</p>
          <p>{certificado.curso}</p>
          <p>Hycon · Formación en ergonomía</p>
          <p>Emitido el {formatearFecha(certificado.emitidoEl)}</p>
          <p className="font-mono">Código de verificación: {certificado.codigo}</p>
        </footer>
      </div>
    </article>
  );
}
