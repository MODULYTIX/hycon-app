import EntradaBase from '@/shared/ui/atomos/EntradaBase';
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
        className="hy-input-grupo" data-invalido={error ? true : undefined}
      >
        {prefijo && (
          <span aria-hidden className="pl-3 text-[14px] font-semibold text-hy-50">
            {prefijo}
          </span>
        )}
        <EntradaBase
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || ayuda ? idMensaje : undefined}
          {...props}
        />
      </div>

      <MensajeCampo id={idMensaje} error={error} ayuda={ayuda} />
    </div>
  );
}
