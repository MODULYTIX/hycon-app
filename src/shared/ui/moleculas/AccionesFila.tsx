import { Icon } from '@iconify/react';

// Botones de editar y eliminar de cada fila del panel.
// El nombre del registro va en la etiqueta para que el lector de pantalla sepa cual es.
export default function AccionesFila({
  nombre,
  onEditar,
  onEliminar,
}: {
  nombre: string;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  const base =
    'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hy-60';

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={onEditar}
        aria-label={`Editar ${nombre}`}
        title="Editar"
        className={`${base} border-hy-20 bg-white text-hy-70 hover:border-hy-60 hover:bg-hy-60 hover:text-white`}
      >
        <Icon icon="solar:pen-2-linear" width="17" height="17" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onEliminar}
        aria-label={`Eliminar ${nombre}`}
        title="Eliminar"
        className={`${base} border-hy-20 bg-white text-g-50 hover:border-red-200 hover:bg-red-50 hover:text-red-600`}
      >
        <Icon icon="solar:trash-bin-trash-linear" width="17" height="17" aria-hidden />
      </button>
    </div>
  );
}
