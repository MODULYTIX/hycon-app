import { Outlet } from 'react-router-dom';
import Encabezado from '@/shared/ui/organismos/Encabezado';
import BarraLateral from '@/features/administracion/componentes/organismos/BarraLateral';

// Layout del panel. Se monta una sola vez: al cambiar de seccion React solo
// sustituye lo que hay dentro del Outlet, no el encabezado ni la barra lateral.
// El encabezado conserva sus colores; el tema del logo se aplica solo debajo.
export default function PlantillaPanel() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-hy-fondo">
      <Encabezado variante="panel" />

      <div className="tema-panel flex flex-1 flex-col lg:flex-row">
        <BarraLateral />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-10">
          <div className="mx-auto w-full max-w-[1180px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
