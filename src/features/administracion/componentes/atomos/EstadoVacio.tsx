import { Icon } from '@iconify/react';

interface Props {
  icono: string;
  titulo: string;
  descripcion: string;
}

// Se muestra cuando el listado no tiene ninguna fila todavia
export default function EstadoVacio({ icono, titulo, descripcion }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Icon icon={icono} width="40" height="40" aria-hidden className="text-g-30" />
      <p className="text-[16px] font-semibold text-g-70">{titulo}</p>
      <p className="max-w-[420px] text-[14px] text-g-50">{descripcion}</p>
    </div>
  );
}
