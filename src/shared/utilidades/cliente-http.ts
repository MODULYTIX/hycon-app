import { borrarToken, guardarToken, leerToken } from '@/shared/utilidades/almacenamiento-sesion';
import { URL_API } from '@/shared/configuracion/entorno';

// Error con el codigo HTTP para que la interfaz pueda distinguir 401 de 500
export class ErrorHttp extends Error {
  public readonly estado: number;
  // Solo en un 429: segundos que faltan para poder reintentar
  public readonly reintentarEnSegundos?: number;

  constructor(mensaje: string, estado: number, reintentarEnSegundos?: number) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.estado = estado;
    this.reintentarEnSegundos = reintentarEnSegundos;
  }
}

interface OpcionesPeticion {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  // Un FormData se envia tal cual (subida de archivos); cualquier otra cosa como JSON
  cuerpo?: unknown;
  // Adjunta el token de acceso y, si caduco, intenta renovarlo una vez
  autenticada?: boolean;
  senal?: AbortSignal;
}

// Respuesta estandar del backend: { success, data } o { success, error }
interface SobreRespuesta<T> {
  success?: boolean;
  data?: T;
  error?: string;
  reintentarEnSegundos?: number;
}

export interface SesionRenovada<U = unknown> {
  token: string;
  expiraEn: number;
  usuario: U;
}

async function enviar<T>(ruta: string, opciones: OpcionesPeticion): Promise<T> {
  const { metodo = 'GET', cuerpo, autenticada = false, senal } = opciones;
  const esFormulario = cuerpo instanceof FormData;

  const cabeceras: Record<string, string> = {};
  // Con FormData el navegador pone el Content-Type con su boundary; fijarlo a mano lo rompe
  if (cuerpo !== undefined && !esFormulario) cabeceras['Content-Type'] = 'application/json';

  if (autenticada) {
    const token = leerToken();
    if (token) cabeceras.Authorization = `Bearer ${token}`;
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : esFormulario ? cuerpo : JSON.stringify(cuerpo),
      signal: senal,
      // Necesario para que viaje la cookie httpOnly de sesion (solo la aceptan las rutas /auth)
      credentials: 'include',
    });
  } catch (error) {
    // Una cancelacion no es un fallo de red: se relanza para que quien la pidio la ignore
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    // fetch solo rechaza por problemas de red o CORS, nunca por codigo de estado
    throw new ErrorHttp('No se pudo conectar con el servidor. Intentalo de nuevo', 0);
  }

  let sobre: SobreRespuesta<T> = {};
  try {
    sobre = (await respuesta.json()) as SobreRespuesta<T>;
  } catch {
    // Respuesta sin cuerpo JSON valido, por ejemplo un 204 de un borrado
  }

  if (!respuesta.ok) {
    throw new ErrorHttp(
      sobre.error || 'Ocurrio un error inesperado',
      respuesta.status,
      sobre.reintentarEnSegundos
    );
  }

  return sobre.data as T;
}

// ---------------------------------------------------------------------------
// Renovacion de la sesion
// ---------------------------------------------------------------------------

type OyenteSesionExpirada = () => void;
const oyentes = new Set<OyenteSesionExpirada>();

// Avisa a la aplicacion (el proveedor de autenticacion) cuando la sesion ya no se puede renovar
export const alExpirarSesion = (oyente: OyenteSesionExpirada) => {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
};

let renovacionEnCurso: Promise<SesionRenovada> | null = null;

/**
 * Pide un token de acceso nuevo con la cookie de sesion. Si varias peticiones
 * descubren a la vez que el token caduco, todas esperan la misma renovacion:
 * dos renovaciones simultaneas harian que el servidor viera un token reutilizado.
 * Nunca se cancela a mitad, por el mismo motivo.
 */
export const renovarSesion = <U = unknown>(): Promise<SesionRenovada<U>> => {
  if (!renovacionEnCurso) {
    renovacionEnCurso = enviar<SesionRenovada>('/api/v1/auth/refresh', { metodo: 'POST' })
      .then((sesion) => {
        guardarToken(sesion.token);
        return sesion;
      })
      .finally(() => {
        renovacionEnCurso = null;
      });
  }
  return renovacionEnCurso as Promise<SesionRenovada<U>>;
};

export async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  try {
    return await enviar<T>(ruta, opciones);
  } catch (error) {
    const tokenCaducado = opciones.autenticada && error instanceof ErrorHttp && error.estado === 401;
    if (!tokenCaducado) throw error;

    try {
      await renovarSesion();
    } catch {
      borrarToken();
      oyentes.forEach((oyente) => oyente());
      throw new ErrorHttp('Tu sesion termino. Inicia sesion de nuevo', 401);
    }
    // Un solo reintento con el token nuevo
    return enviar<T>(ruta, opciones);
  }
}
