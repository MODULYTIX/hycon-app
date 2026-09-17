import type { TextareaHTMLAttributes } from 'react';
import CabeceraCampo from '@/shared/ui/atomos/CabeceraCampo';
import MensajeCampo from '@/shared/ui/atomos/MensajeCampo';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  opcional?: boolean;
}

export default function CampoTextoLargo({
  id,
  etiqueta,
  error,
  ayuda,
  opcional,
  className = '',
  ...props
}: Props) {
  const idMensaje = `${id}-mensaje`;

  return (
    <div className={className}>
      <CabeceraCampo htmlFor={id} etiqueta={etiqueta} opcional={opcional} />
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? idMensaje : undefined}
        className={`block w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-[15px] text-hy-tinta outline-none transition-colors placeholder:text-g-40 focus:ring-3 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
            : 'border-hy-20 hover:border-hy-30 focus:border-hy-60 focus:ring-hy-60/15'
        }`}
        {...props}
      />
      <MensajeCampo id={idMensaje} error={error} ayuda={ayuda} />
    </div>
  );
}
