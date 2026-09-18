import { peticion, renovarSesion } from '@/shared/utilidades/cliente-http';
import type {
  CredencialesLogin,
  DatosRegistro,
  Sesion,
  Usuario,
} from '@/features/autenticacion/tipos/autenticacion.tipos';

const BASE = '/api/v1/auth';

export const iniciarSesionApi = (credenciales: CredencialesLogin) =>
  peticion<Sesion>(`${BASE}/login`, { metodo: 'POST', cuerpo: credenciales });

export const registrarApi = (datos: DatosRegistro) =>
  peticion<Sesion>(`${BASE}/register`, { metodo: 'POST', cuerpo: datos });

// Recupera la sesion al recargar la pagina a partir de la cookie httpOnly
export const restaurarSesionApi = () => renovarSesion<Usuario>();

// Revoca la sesion en el servidor; olvidar el token en el navegador no basta
export const cerrarSesionApi = () => peticion<void>(`${BASE}/logout`, { metodo: 'POST' });
