import { Icon } from '@iconify/react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icono?: string;
  invalido?: boolean;
  // Se pinta al final del campo: por ejemplo el boton de ver contrasena
  accesorio?: ReactNode;
}

// Campo relleno: descansa sobre un gris muy suave y se vuelve blanco al escribir,
// asi el formulario se lee como un bloque tranquilo y el foco queda evidente.
export default function EntradaTexto({ icono, invalido, accesorio, ...props }: Props) {
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

      <input
        {...props}
        aria-invalid={invalido || undefined}
        className={`h-12 w-full rounded-xl border bg-g-5 px-4 text-[15px] text-g-90 outline-none transition-colors placeholder:text-g-40 focus:bg-white focus:ring-3 ${
          icono ? 'pl-11' : ''
        } ${accesorio ? 'pr-12' : ''} ${
          invalido
            ? 'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-red-500/15'
            : 'border-transparent hover:border-g-30 focus:border-primary focus:ring-primary/15'
        }`}
      />

      {accesorio && <div className="absolute right-2 top-1/2 -translate-y-1/2">{accesorio}</div>}
    </div>
  );
}
