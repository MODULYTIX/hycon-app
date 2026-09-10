import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import type { OpcionCuenta } from '@/features/autenticacion/tipos/autenticacion.tipos';

interface Props {
  opcion: OpcionCuenta;
  onSeleccionar: () => void;
}

// Cada enlace del menu de cuenta. Las opciones destacadas (solo ADMIN)
// se marcan con la etiqueta del rol para dejar claro por que aparecen.
export default function ItemMenuCuenta({ opcion, onSeleccionar }: Props) {
  return (
    <li role="none">
      <Link
        role="menuitem"
        to={opcion.href}
        onClick={onSeleccionar}
        className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-g-70 transition-colors hover:bg-bc-5 hover:text-primary"
      >
        <Icon icon={opcion.icono} width="18" height="18" aria-hidden className="shrink-0 text-g-50" />
        <span className="flex-1">{opcion.etiqueta}</span>
        {opcion.destacada && (
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-primary">
            ADMIN
          </span>
        )}
      </Link>
    </li>
  );
}
