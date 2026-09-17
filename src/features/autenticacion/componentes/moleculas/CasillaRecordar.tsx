import { Icon } from '@iconify/react';

// "Mantener la sesion iniciada": por defecto desmarcada, que es lo seguro en equipos compartidos
export default function CasillaRecordar({
  id,
  marcada,
  onCambiar,
}: {
  id: string;
  marcada: boolean;
  onCambiar: (marcada: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={marcada}
          onChange={(evento) => onCambiar(evento.target.checked)}
          aria-describedby={`${id}-ayuda`}
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-g-30 bg-white transition-colors checked:border-marca checked:bg-marca focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
        />
        <Icon
          icon="solar:check-read-linear"
          width="14"
          height="14"
          aria-hidden
          className="pointer-events-none absolute left-[3px] top-[3px] hidden text-white peer-checked:block"
        />
      </span>
      <div>
        <label htmlFor={id} className="cursor-pointer text-[14px] font-medium text-g-80">
          Mantener la sesión iniciada
        </label>
        <p id={`${id}-ayuda`} className="text-[12.5px] text-g-50">
          Durante 30 días. No lo marques en equipos compartidos.
        </p>
      </div>
    </div>
  );
}
