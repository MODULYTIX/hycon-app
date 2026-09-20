import { Outlet } from 'react-router-dom';
import Encabezado from '@/shared/ui/organismos/Encabezado';
import PiePagina from '@/shared/ui/organismos/PiePagina';
import { BotonWhatsapp } from '@/features/contacto/componentes/atomos/BotonWhatsapp';

// Layout para vistas que no deben mostrar la navegación principal,
// pero sí el encabezado con el logo, el perfil de usuario y el pie de página.
export default function PlantillaSinNavegacion() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Encabezado variante="sin-navegacion" />

      <main className="flex-1 bg-g-10">
        <Outlet />
      </main>

      <PiePagina />
      <BotonWhatsapp />
    </div>
  );
}
