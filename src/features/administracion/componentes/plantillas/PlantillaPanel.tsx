import { Outlet } from 'react-router-dom';
import Encabezado from '@/shared/ui/organismos/Encabezado';
import BarraLateral from '@/features/administracion/componentes/organismos/BarraLateral';
import LimiteDeError from '@/app/errores/LimiteDeError';

// Layout del panel. Se monta una sola vez: al cambiar de seccion React solo
// sustituye lo que hay dentro del Outlet, no el encabezado ni la barra lateral.
// El encabezado conserva sus colores; el tema del logo se aplica solo debajo.
export default function PlantillaPanel() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-hy-fondo">
      <Encabezado variante="panel" />

      <div className="panel-diseno tema-panel flex flex-1 flex-col lg:flex-row">
        <BarraLateral />

        <main className="min-w-0 flex-1 py-6 sm:py-9">
          <div className="hy-contenedor [--hy-ancho-contenedor:1180px]">
            <LimiteDeError>
              <Outlet />
            </LimiteDeError>
          </div>
        </main>
      </div>
    </div>
  );
}
