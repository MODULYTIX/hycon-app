import EntradaBase from './EntradaBase';
import { Icon } from '@iconify/react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icono?: string;
  invalido?: boolean;
  // Se pinta al final del campo: por ejemplo el boton de ver contrasena
  accesorio?: ReactNode;
}

// Variante del campo compartido para iconos y acciones de autenticación.
export default function EntradaTexto({ icono, invalido, accesorio, style, ...props }: Props) {
  return (
    <div className="relative">
      {icono && (
        <Icon
          icon={icono}
          width="18"
          height="18"
          aria-hidden
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
            invalido ? 'text-red-500' : 'text-g-40'
          }`}
        />
      )}

      <EntradaBase
        {...props}
        aria-invalid={invalido || undefined}
        style={{ height: 46, ...(icono ? { paddingLeft: 44 } : {}), ...(accesorio ? { paddingRight: 48 } : {}), ...style }}
      />

      {accesorio && <div className="absolute right-2 top-1/2 -translate-y-1/2">{accesorio}</div>}
    </div>
  );
}
