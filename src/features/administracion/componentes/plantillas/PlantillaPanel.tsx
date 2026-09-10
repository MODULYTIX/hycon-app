import { Outlet } from 'react-router-dom';
import Encabezado from '@/shared/ui/organismos/Encabezado';
import BarraLateral from '@/features/administracion/componentes/organismos/BarraLateral';

// Layout del panel. Se monta una sola vez: al cambiar de seccion React solo
// sustituye lo que hay dentro del Outlet, no el encabezado ni la barra lateral.
export default function PlantillaPanel() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-g-10">
      <Encabezado variante="panel" />

      <div className="flex flex-1 flex-col lg:flex-row">
        <BarraLateral />

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
