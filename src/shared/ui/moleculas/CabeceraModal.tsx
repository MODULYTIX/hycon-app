import { Icon } from '@iconify/react';

// Cabecera fija de los modales de formulario del panel
export default function CabeceraModal({
  id,
  icono,
  titulo,
  descripcion,
}: {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <header className="flex items-center gap-3.5 border-b border-hy-10 px-5 py-4 pr-14 sm:px-7 sm:py-5">
      <span
        aria-hidden
        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-hy-10 text-hy-60 sm:flex"
      >
        <Icon icon={icono} width="22" height="22" />
      </span>
      <div className="min-w-0">
        <h2 id={id} className="text-[19px] font-semibold leading-tight text-hy-tinta sm:text-[21px]">
          {titulo}
        </h2>
        <p className="mt-0.5 text-[13.5px] text-g-50">{descripcion}</p>
      </div>
    </header>
  );
}
