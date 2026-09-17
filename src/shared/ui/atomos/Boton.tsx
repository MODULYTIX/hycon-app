import type { ButtonHTMLAttributes } from 'react';
import { Icon } from '@iconify/react';

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  icono?: string;
  // Muestra un indicador giratorio y bloquea el boton
  cargando?: boolean;
}

const VARIANTES: Record<VarianteBoton, string> = {
  primario: 'bg-hy-60 text-white hover:bg-hy-70 active:bg-hy-80',
  secundario: 'border border-hy-20 bg-white text-hy-80 hover:border-hy-30 hover:bg-hy-5',
  peligro: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  fantasma: 'text-hy-70 hover:bg-hy-10',
};

// Boton del panel de configuracion, en la paleta del logo
export default function Boton({
  variante = 'primario',
  icono,
  cargando = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: Props) {
  const oscuro = variante === 'primario' || variante === 'peligro';

  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hy-60 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {cargando ? (
        <span
          aria-hidden
          className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${
            oscuro ? 'border-white/40 border-t-white' : 'border-hy-20 border-t-hy-60'
          }`}
        />
      ) : (
        icono && <Icon icon={icono} width="18" height="18" aria-hidden />
      )}
      {children}
    </button>
  );
}
