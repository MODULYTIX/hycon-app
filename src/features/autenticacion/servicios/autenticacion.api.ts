import { peticion, renovarSesion } from '@/shared/utilidades/cliente-http';
import { sinCloudinary, subirACloudinaryApi } from '@/shared/servicios/cloudinary.api';
import type {
  CambioPassword,
  CredencialesLogin,
  DatosPerfil,
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

export const actualizarPerfilApi = (datos: DatosPerfil) =>
  peticion<{ usuario: Usuario }>(`${BASE}/me`, {
    metodo: 'PUT',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.usuario);

// Cambiar la contrasena cierra las demas sesiones en el servidor
export const cambiarPasswordApi = (datos: CambioPassword) =>
  peticion<void>(`${BASE}/me/password`, { metodo: 'PUT', cuerpo: datos, autenticada: true });

/**
 * Cambia la foto de perfil. La imagen va a Cloudinary y aqui solo se guarda su
 * direccion; si el servidor no lo tiene configurado, el archivo viaja al backend.
 */
export const subirAvatarApi = async (archivo: File) => {
  try {
    const avatarUrl = await subirACloudinaryApi(archivo, 'avatar');
    return await peticion<{ usuario: Usuario }>(`${BASE}/me/avatar`, {
      metodo: 'PUT',
      cuerpo: { avatarUrl },
      autenticada: true,
    }).then((r) => r.usuario);
  } catch (error: unknown) {
    if (!sinCloudinary(error)) throw error;

    const cuerpo = new FormData();
    cuerpo.append('imagen', archivo);
    return peticion<{ usuario: Usuario }>(`${BASE}/me/avatar`, {
      metodo: 'POST',
      cuerpo,
      autenticada: true,
    }).then((r) => r.usuario);
  }
};

export const quitarAvatarApi = () =>
  peticion<{ usuario: Usuario }>(`${BASE}/me/avatar`, { metodo: 'DELETE', autenticada: true }).then(
    (r) => r.usuario
  );
