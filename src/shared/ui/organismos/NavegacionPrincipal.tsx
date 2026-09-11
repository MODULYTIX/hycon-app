import { NavLink } from 'react-router-dom';
import { NAVEGACION_PRINCIPAL } from '@/app/rutas/rutas';

// Barra de secciones del sitio publico. En movil se desplaza en horizontal.
export default function NavegacionPrincipal() {
  return (
    <nav
      aria-label="Navegacion principal"
      className="w-full border-b border-g-20 bg-white overflow-x-auto whitespace-nowrap"
    >
      <ul className="mx-auto flex w-fit items-center gap-1 px-4 sm:gap-2 lg:gap-6">
        {NAVEGACION_PRINCIPAL.map((enlace) => (
          <li key={enlace.id}>
            <NavLink
              to={enlace.ruta}
              end={enlace.ruta === '/'}
              className={({ isActive }) =>
                `block px-3 py-3 text-[15px] tracking-wide transition-colors lg:px-4 ${
                  isActive
                    ? 'font-bold text-primary'
                    : 'font-semibold text-g-50 hover:text-primary'
                }`
              }
            >
              {enlace.etiqueta}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
