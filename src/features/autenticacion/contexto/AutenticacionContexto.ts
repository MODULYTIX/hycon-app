import { createContext } from 'react';
import type {
  CredencialesLogin,
  DatosRegistro,
  Usuario,
} from '@/features/autenticacion/tipos/autenticacion.tipos';

export interface ValorAutenticacion {
  usuario: Usuario | null;
  // true mientras se restaura la sesion al cargar la pagina
  cargando: boolean;
  autenticado: boolean;
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<Usuario>;
  registrar: (datos: DatosRegistro) => Promise<Usuario>;
  cerrarSesion: () => Promise<void>;
}

export const AutenticacionContexto = createContext<ValorAutenticacion | null>(null);
