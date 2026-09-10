import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from '@iconify/react';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  // Id del elemento que titula el dialogo, para lectores de pantalla
  idTitulo: string;
  children: ReactNode;
}

export default function Modal({ abierto, onCerrar, idTitulo, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape y bloquear el scroll del fondo mientras el modal esta abierto
  useEffect(() => {
    if (!abierto) return;

    const alPulsarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar();
    };

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', alPulsarTecla);

    // Se mueve el foco al panel para que el teclado entre en el dialogo
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener('keydown', alPulsarTecla);
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-g-90/60 p-4 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(evento) => {
        // Solo cierra si el clic empezo en el fondo, no al arrastrar desde dentro
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="relative w-full max-w-[880px] overflow-hidden rounded-2xl bg-white shadow-2xl outline-none animate-modalIn"
      >
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-g-50 transition-colors hover:bg-g-10 hover:text-g-80"
        >
          <Icon icon="solar:close-circle-linear" width="22" height="22" />
        </button>

        {children}
      </div>
    </div>
  );
}
