import { formatearDuracion, formatearFecha } from '@/shared/utilidades/formato';
import type { Certificado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

// El mismo adorno girado: una esquina dibujada cuatro veces
const ESQUINAS = [
  'left-0 top-0',
  'right-0 top-0 -scale-x-100',
  'left-0 bottom-0 -scale-y-100',
  'right-0 bottom-0 -scale-100',
];

// Picos del sello, como el troquel de un lacre
const picosDelSello = (picos = 28, alto = 46, bajo = 40): string =>
  Array.from({ length: picos * 2 }, (_, indice) => {
    const angulo = (Math.PI * indice) / picos;
    const radio = indice % 2 === 0 ? alto : bajo;
    return `${(50 + radio * Math.cos(angulo)).toFixed(1)},${(50 + radio * Math.sin(angulo)).toFixed(1)}`;
  }).join(' ');

function AdornoEsquina({ posicion }: { posicion: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      fill="none"
      stroke="currentColor"
      className={`pointer-events-none absolute h-14 w-14 text-hy-30 sm:h-20 sm:w-20 ${posicion}`}
    >
      {/* Tallo que abraza la esquina y tres hojas colgando hacia dentro */}
      <path d="M16 104C16 56 56 16 104 16" strokeWidth="1.1" />
      <path d="M30 76c14 2 26-6 30-20-14-2-26 6-30 20z" strokeWidth="0.9" />
      <path d="M52 48c12-4 19-15 18-29-12 4-19 15-18 29z" strokeWidth="0.9" />
      <path d="M76 30c13 2 25-4 31-16-13-2-25 4-31 16z" strokeWidth="0.9" />
      <circle cx="16" cy="104" r="2.8" fill="currentColor" stroke="none" />
      <circle cx="104" cy="16" r="2.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Filete() {
  return (
    <svg
      viewBox="0 0 260 16"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      className="relative mx-auto mt-4 h-4 w-[210px] text-hy-40 sm:w-[280px]"
    >
      <path d="M4 8h86M170 8h86" />
      <path d="M90 8c8-7 21-7 29 0-8 7-21 7-29 0z" />
      <path d="M170 8c-8-7-21-7-29 0 8 7 21 7 29 0z" />
      <path d="M130 2.5l5.5 5.5-5.5 5.5L124.5 8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Sello() {
  return (
    <span
      aria-hidden
      className="relative flex h-[72px] w-[72px] items-center justify-center sm:h-[88px] sm:w-[88px]"
    >
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full text-primary">
        <polygon points={picosDelSello()} fill="currentColor" opacity="0.14" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle
          cx="50"
          cy="50"
          r="29"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="2 3"
        />
        <text
          x="50"
          y="46"
          textAnchor="middle"
          fill="currentColor"
          fontSize="13"
          fontWeight="600"
          letterSpacing="1.5"
        >
          HYCON
        </text>
        <text x="50" y="60" textAnchor="middle" fill="currentColor" fontSize="7" letterSpacing="0.8">
          CERTIFICA
        </text>
      </svg>
    </span>
  );
}

/**
 * El certificado tal como se ve y como se imprime. Se queda en una hoja
 * apaisada: al guardarlo como PDF sale igual que en pantalla.
 */
export default function LaminaCertificado({ certificado }: { certificado: Certificado }) {
  return (
    <article
      aria-label={`Certificado ${certificado.codigo}`}
      className="lamina-certificado mx-auto w-full max-w-[980px] bg-certificado-papel p-3 ring-1 ring-g-20 sm:p-5"
    >
      <div className="relative border-2 border-primary px-6 py-9 text-center sm:px-14 sm:py-12">
        {/* Doble filete: la linea fina corre por dentro del marco */}
        <span aria-hidden className="pointer-events-none absolute inset-[7px] border border-hy-30" />

        {ESQUINAS.map((posicion) => (
          <AdornoEsquina key={posicion} posicion={posicion} />
        ))}

        <p className="relative text-[10px] font-semibold uppercase tracking-[0.3em] text-hy-70 sm:text-[11px]">
          Hycon · Formación en ergonomía
        </p>

        <h1 className="relative mt-5 font-serif text-[23px] font-semibold uppercase tracking-[0.14em] text-hy-90 sm:text-[46px] sm:tracking-[0.2em]">
          Certificado
        </h1>

        <Filete />

        <p className="relative mt-6 text-[13px] text-g-60 sm:text-[14.5px]">
          Se otorga el presente certificado a
        </p>

        <p className="relative mx-auto mt-3 max-w-[640px] border-b border-hy-30 pb-2 font-serif text-[25px] font-semibold text-primary sm:text-[38px]">
          {certificado.nombre}
        </p>

        <p className="relative mx-auto mt-6 max-w-[580px] text-[13.5px] leading-relaxed text-g-60 sm:text-[15px]">
          por haber completado satisfactoriamente todas las partes del curso
        </p>

        <p className="relative mt-2 font-serif text-[17px] font-semibold text-hy-90 sm:text-[22px]">
          {certificado.curso}
        </p>

        {certificado.duracionMinutos !== null && certificado.duracionMinutos > 0 && (
          <p className="relative mt-2 text-[12.5px] text-g-50">
            Duración: {formatearDuracion(certificado.duracionMinutos)}
          </p>
        )}

        <div className="relative mt-9 grid grid-cols-1 items-end gap-6 sm:mt-12 sm:grid-cols-3">
          <div className="order-2 mx-auto w-full max-w-[220px] sm:order-1">
            <p className="border-t border-g-30 pt-2 text-[12.5px] font-medium text-g-70">
              {formatearFecha(certificado.emitidoEl)}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-g-50">
              Fecha de emisión
            </p>
          </div>

          <div className="order-1 flex justify-center sm:order-2">
            <Sello />
          </div>

          <div className="order-3 mx-auto w-full max-w-[220px]">
            <p className="border-t border-g-30 pt-2 font-mono text-[12.5px] font-medium text-g-70">
              {certificado.codigo}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-g-50">
              Código de verificación
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
