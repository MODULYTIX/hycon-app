import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { esAdministrador } from '@/features/autenticacion/utilidades/opciones-cuenta';

// Guarda de ruta. Esto es comodidad de interfaz, no seguridad:
// quien realmente decide es el backend, que exige rol ADMIN en cada endpoint.
export default function RutaSoloAdmin({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAutenticacion();

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-g-10">
        <p role="status" className="text-[15px] text-g-50">
          Verificando tu sesion...
        </p>
      </div>
    );
  }

  if (!usuario || !esAdministrador(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
