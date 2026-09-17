import { Icon } from '@iconify/react';
import { NavLink } from 'react-router-dom';
import type { SeccionPanel } from '@/features/administracion/utilidades/opciones-panel';

const BASE =
  'relative flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-[14px] font-semibold tracking-wide transition-colors';

// Entrada de la barra lateral. Las secciones sin respaldo en el backend
// se pintan apagadas y no navegan a ningun sitio.
export default function ItemSeccion({ seccion }: { seccion: SeccionPanel }) {
  if (!seccion.disponible) {
    return (
      <li>
        <span
          aria-disabled="true"
          title="Todavía no disponible"
          className={`${BASE} cursor-not-allowed text-g-30`}
        >
          <Icon icon={seccion.icono} width="19" height="19" aria-hidden className="shrink-0" />
          {seccion.etiqueta}
        </span>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={seccion.ruta}
        className={({ isActive }) =>
          `${BASE} ${
            isActive
              ? 'bg-hy-60 text-white'
              : 'text-hy-80 hover:bg-hy-10'
          }`
        }
      >
        <Icon icon={seccion.icono} width="19" height="19" aria-hidden className="shrink-0" />
        {seccion.etiqueta}
      </NavLink>
    </li>
  );
}
