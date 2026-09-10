import { Icon } from '@iconify/react';
import { NavLink } from 'react-router-dom';
import type { SeccionPanel } from '@/features/administracion/utilidades/opciones-panel';

// Entrada de la barra lateral. Las secciones sin respaldo en el backend
// se pintan apagadas y no navegan a ningun sitio.
export default function ItemSeccion({ seccion }: { seccion: SeccionPanel }) {
  if (!seccion.disponible) {
    return (
      <li>
        <span
          aria-disabled="true"
          title="Todavia no disponible"
          className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-[17px] font-semibold tracking-wide text-g-30"
        >
          <Icon icon={seccion.icono} width="18" height="18" aria-hidden className="shrink-0" />
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
          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[17px] font-semibold tracking-wide transition-colors ${
            isActive ? 'bg-bc-5 text-primary' : 'text-g-70 hover:bg-g-5 hover:text-primary'
          }`
        }
      >
        <Icon icon={seccion.icono} width="18" height="18" aria-hidden className="shrink-0" />
        {seccion.etiqueta}
      </NavLink>
    </li>
  );
}
