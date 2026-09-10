import { Icon } from '@iconify/react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icono?: string;
  invalido?: boolean;
  // Se pinta al final del campo: por ejemplo el boton de ver contrasena
  accesorio?: ReactNode;
}

export default function EntradaTexto({ icono, invalido, accesorio, ...props }: Props) {
  return (
    <div className="relative">
      {icono && (
        <Icon
          icon={icono}
          width="18"
          height="18"
          aria-hidden
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
            invalido ? 'text-red-500' : 'text-g-40'
          }`}
        />
      )}

      <input
        {...props}
        aria-invalid={invalido || undefined}
        className={`w-full rounded-lg border bg-white p-2 text-g-80 outline-none transition-colors
          placeholder:text-g-40
          ${icono ? 'pl-10' : ''} ${accesorio ? 'pr-11' : ''}
          ${
            invalido
              ? 'border-red-400 focus:border-red-500'
              : 'border-g-40 focus:border-primary'
          }`}
      />

      {accesorio && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">{accesorio}</div>
      )}
    </div>
  );
}
