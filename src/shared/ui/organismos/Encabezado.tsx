import { Link } from 'react-router-dom';
import HyconLogo from '@/assets/images/logo_hycon.webp';
import AccesoCuenta from '@/features/autenticacion/componentes/organismos/AccesoCuenta';
import NavegacionPrincipal from '@/shared/ui/organismos/NavegacionPrincipal';
import { RUTAS } from '@/app/rutas/rutas';

// 'publico' lleva la barra de secciones del sitio.
// 'panel' reutiliza la misma cabecera sin esa barra, porque dentro del panel
// la navegacion la aporta la barra lateral.
type VarianteEncabezado = 'publico' | 'panel';

export default function Encabezado({
  variante = 'publico',
}: {
  variante?: VarianteEncabezado;
}) {
  const esPanel = variante === 'panel';

  return (
    <header className="flex w-full flex-col">
      <div className="flex h-[74px] items-center justify-between bg-primary px-4 sm:px-10">
        <Link to={RUTAS.home} className="shrink-0 outline-2 outline-white" aria-label="Ir al inicio">
          <img src={HyconLogo} alt="Hycon" className="w-22 p-2" draggable="false" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {esPanel && (
            <Link
              to={RUTAS.home}
              className="hidden rounded-full bg-g-70 px-6 py-2 text-[15px] font-medium text-white transition-colors hover:bg-g-80 sm:block"
            >
              Ver sitio
            </Link>
          )}

          <AccesoCuenta />
        </div>
      </div>

      {!esPanel && <NavegacionPrincipal />}
    </header>
  );
}
