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
          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${
            invalido ? 'text-red-500' : 'text-g-40'
          }`}
        />
      )}

      <input
        {...props}
        aria-invalid={invalido || undefined}
        className={`h-11 w-full rounded-lg border bg-white px-3.5 text-[15px] text-g-90 outline-none transition-colors placeholder:text-g-40 focus:ring-3 ${
          icono ? 'pl-10' : ''
        } ${accesorio ? 'pr-12' : ''} ${
          invalido
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
            : 'border-g-30 hover:border-g-40 focus:border-primary focus:ring-primary/15'
        }`}
      />

      {accesorio && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{accesorio}</div>}
    </div>
  );
}
