import type { ComponentPropsWithoutRef } from 'react';

type Props = Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'children'>;

export default function BotonCerrarModal({ className = '', 'aria-label': etiqueta = 'Cerrar', ...props }: Props) {
  return (
    <button
      {...props}
      type="button"
      aria-label={etiqueta}
      className={`inline-grid size-9 shrink-0 place-items-center rounded-sm text-g-60 transition-colors hover:bg-g-10 hover:text-g-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 ${className}`}
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}
