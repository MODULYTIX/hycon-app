import { Icon } from '@iconify/react';

interface Props {
  titulo: string;
  descripcion: string;
  textoBoton: string;
  onAgregar: () => void;
}

// Titulo de la seccion con el boton que abre el modal de alta
export default function CabeceraSeccion({ titulo, descripcion, textoBoton, onAgregar }: Props) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-[26px] font-medium text-g-80">{titulo}</h1>
        <p className="text-[15px] text-g-50">{descripcion}</p>
      </div>

      <button
        type="button"
        onClick={onAgregar}
        className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        <Icon icon="solar:add-circle-bold" width="18" height="18" aria-hidden />
        {textoBoton}
      </button>
    </header>
  );
}
