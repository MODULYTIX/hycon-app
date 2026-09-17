import type { InputHTMLAttributes } from 'react';
import CabeceraCampo from '@/shared/ui/atomos/CabeceraCampo';
import MensajeCampo from '@/shared/ui/atomos/MensajeCampo';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  opcional?: boolean;
  // Texto fijo delante del valor, por ejemplo "S/"
  prefijo?: string;
}

// Campo de texto del panel de configuracion
export default function CampoTexto({
  id,
  etiqueta,
  error,
  ayuda,
  opcional,
  prefijo,
  className = '',
  ...props
}: Props) {
  const idMensaje = `${id}-mensaje`;

  return (
    <div className={className}>
      <CabeceraCampo htmlFor={id} etiqueta={etiqueta} opcional={opcional} />

      <div
        className={`flex h-11 items-center rounded-lg border bg-white transition-colors focus-within:ring-3 ${
          error
            ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/15'
            : 'border-hy-20 hover:border-hy-30 focus-within:border-hy-60 focus-within:ring-hy-60/15'
        }`}
      >
        {prefijo && (
          <span aria-hidden className="pl-3 text-[14px] font-semibold text-hy-50">
            {prefijo}
          </span>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || ayuda ? idMensaje : undefined}
          className="h-full w-full min-w-0 rounded-lg bg-transparent px-3 text-[15px] text-hy-tinta outline-none placeholder:text-g-40"
          {...props}
        />
      </div>

      <MensajeCampo id={idMensaje} error={error} ayuda={ayuda} />
    </div>
  );
}
