import { NavLink } from 'react-router-dom';
import { NAVEGACION_PRINCIPAL } from '@/app/rutas/rutas';

export default function NavegacionPrincipal() {
  return (
    <nav
      aria-label="Navegacion principal"
      className="hy-nav"
    >
      <ul>
        {NAVEGACION_PRINCIPAL.map((enlace) => (
          <li key={enlace.id}>
            <NavLink
              to={enlace.ruta}
              end={enlace.ruta === '/'}
              className={({ isActive }) => `hy-nav-link ${isActive ? 'hy-nav-link-activo' : ''}`}
            >
              {enlace.etiqueta}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
