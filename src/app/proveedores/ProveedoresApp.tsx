import type { ReactNode } from 'react';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';

// Punto unico donde se envuelve la app con sus proveedores de contexto
export default function ProveedoresApp({ children }: { children: ReactNode }) {
  return <AutenticacionProveedor>{children}</AutenticacionProveedor>;
}
