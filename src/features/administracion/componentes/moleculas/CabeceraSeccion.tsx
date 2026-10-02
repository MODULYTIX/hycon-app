import Boton from '@/shared/ui/atomos/Boton';

interface Props {
  titulo: string;
  descripcion: string;
  textoBoton: string;
  onAgregar: () => void;
}

// Titulo de la seccion con el boton que abre el modal de alta
export default function CabeceraSeccion({ titulo, descripcion, textoBoton, onAgregar }: Props) {
  return (
    <header className="mb-7 flex flex-col gap-5 rounded-2xl border border-hy-20/70 bg-white p-5 sm:mb-8 sm:p-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-hy-50">
          Panel de configuración
        </p>
        <h1 className="mt-1 text-[30px] font-semibold leading-tight text-hy-tinta sm:text-[36px]">
          {titulo}
        </h1>
        <p className="mt-1 max-w-[560px] text-[14.5px] text-g-50">{descripcion}</p>
      </div>

      <Boton onClick={onAgregar} icono="solar:add-circle-bold" className="h-11 px-5 sm:shrink-0">
        {textoBoton}
      </Boton>
    </header>
  );
}
