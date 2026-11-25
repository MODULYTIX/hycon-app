import Hero from '@/features/home/componentes/organismos/Hero';
import { Outlet, useLocation } from 'react-router-dom';
import Encabezado from '@/shared/ui/organismos/Encabezado';
import PiePagina from '@/shared/ui/organismos/PiePagina';
import LimiteDeError from '@/app/errores/LimiteDeError';
// import { BotonWhatsapp } from '@/features/contacto/componentes/atomos/BotonWhatsapp';

// Layout del sitio publico. Se monta una vez: al cambiar de seccion solo
// se sustituye lo que hay dentro del Outlet.
export default function PlantillaPublica() {
  const esHome = useLocation().pathname === '/';
  return (
    <div className={`flex min-h-screen w-full flex-col ${esHome ? 'hy-portada' : ''}`}>
      {esHome && <Hero />}
      <Encabezado />

      <main className={esHome ? 'hy-portada-contenido' : 'flex-1'}>
        {/* Si la pantalla se rompe, el menu y el pie siguen aqui */}
        <LimiteDeError>
          <Outlet />
        </LimiteDeError>
      </main>

      <PiePagina />
      {/* Botón flotante oculto temporalmente. <BotonWhatsapp /> */}
    </div>
  );
}
