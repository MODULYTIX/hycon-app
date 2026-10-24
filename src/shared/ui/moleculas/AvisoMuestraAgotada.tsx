import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';

interface Props {
  // Que ofrecer a continuacion: normalmente el boton de comprar
  children?: ReactNode;
}

// Tapa el video cuando se acaba la muestra gratuita
export default function AvisoMuestraAgotada({ children }: Props) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-g-90/95 px-6 text-center text-white">
      <Icon
        icon="solar:lock-keyhole-minimalistic-bold"
        width="34"
        height="34"
        aria-hidden
        className="text-white/70"
      />
      <p className="text-[15px] font-medium">Terminó la vista previa</p>
      {children}
    </div>
  );
}
