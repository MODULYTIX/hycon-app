import { peticion } from '@/shared/utilidades/cliente-http';
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

// Recupera el usuario de la sesion guardada al recargar la pagina
export const obtenerPerfilApi = (senal?: AbortSignal) =>
  peticion<{ usuario: Usuario }>(`${BASE}/me`, { autenticada: true, senal }).then(
    (respuesta) => respuesta.usuario
  );
