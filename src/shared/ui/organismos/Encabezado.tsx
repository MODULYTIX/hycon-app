import { Link, useLocation } from 'react-router-dom';
import HyconLogo from '@/assets/images/home/logo-transparente.png';

import AccesoCuenta from '@/features/autenticacion/componentes/organismos/AccesoCuenta';
import NavegacionPrincipal from '@/shared/ui/organismos/NavegacionPrincipal';
import { RUTAS } from '@/app/rutas/rutas';
import './sitio-publico.css';

// 'publico' lleva la barra de secciones del sitio.
// 'panel' reutiliza la misma cabecera sin esa barra, porque dentro del panel
// la navegacion la aporta la barra lateral.
// 'sin-navegacion' oculta la barra de navegacion principal sin añadir botones extra.
type VarianteEncabezado = 'publico' | 'panel' | 'sin-navegacion';

export default function Encabezado({
  variante = 'publico',
}: {
  variante?: VarianteEncabezado;
}) {
  const esPanel = variante === 'panel';
  const esHome = useLocation().pathname === RUTAS.home && variante === 'publico';

  return (
    <header className={esHome ? 'hy-header hy-header-home' : 'hy-header'}>
      <div className="hy-header-inner">
        <Link to={RUTAS.home} className="hy-header-logo" aria-label="Ir al inicio">
          <img src={HyconLogo} alt="Hycon" draggable="false" />
        </Link>

        {!esPanel && variante !== 'sin-navegacion' && <NavegacionPrincipal />}

        <div className="hy-header-cuenta">
          {esPanel && (
            <Link
              to={RUTAS.home}
              className="hy-header-ver-sitio"
            >
              Ver sitio
            </Link>
          )}

          <AccesoCuenta />
        </div>
      </div>
    </header>
  );
}
