interface Props {
  cantidad: number;
  maximo: number;
  nombre?: string;
  onCambiar: (cantidad: number) => void;
  onReducirUltima?: () => void;
}

const boton = 'h-full w-10 text-lg text-g-80 hover:bg-g-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:opacity-35';

export default function SelectorCantidad({ cantidad, maximo, nombre, onCambiar, onReducirUltima }: Props) {
  return (
    <div role="group" aria-label={nombre ? `Cantidad de ${nombre}` : 'Cantidad'} className="inline-flex h-11 w-fit items-center overflow-hidden rounded-[2px] border border-g-30">
      <button type="button" className={boton} aria-label={nombre ? `Una unidad menos de ${nombre}` : 'Reducir cantidad'}
        disabled={cantidad <= 1 && !onReducirUltima}
        onClick={() => cantidad > 1 ? onCambiar(cantidad - 1) : onReducirUltima?.()}>−</button>
      <span aria-live="polite" className="min-w-6 text-center text-sm tabular-nums">{cantidad}</span>
      <button type="button" className={boton} aria-label={nombre ? `Una unidad más de ${nombre}` : 'Aumentar cantidad'}
        disabled={cantidad >= maximo} onClick={() => onCambiar(cantidad + 1)}>+</button>
    </div>
  );
}
