import AreaTextoBase from '@/shared/ui/atomos/AreaTextoBase';
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
      <AreaTextoBase
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? idMensaje : undefined}
        {...props}
      />
      <MensajeCampo id={idMensaje} error={error} ayuda={ayuda} />
    </div>
  );
}
