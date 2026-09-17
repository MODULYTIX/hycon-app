import { leerToken } from '@/shared/utilidades/almacenamiento-sesion';
import { URL_API } from '@/shared/configuracion/entorno';

// Error con el codigo HTTP para que la interfaz pueda distinguir 401 de 500
export class ErrorHttp extends Error {
  public readonly estado: number;

  constructor(mensaje: string, estado: number) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.estado = estado;
  }
}

interface OpcionesPeticion {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  // Un FormData se envia tal cual (subida de archivos); cualquier otra cosa como JSON
  cuerpo?: unknown;
  // Adjunta el token guardado en la cabecera Authorization
  autenticada?: boolean;
  senal?: AbortSignal;
}

// Respuesta estandar del backend: { success, data } o { success, error }
interface SobreRespuesta<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

export async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
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
    throw new ErrorHttp(sobre.error || 'Ocurrio un error inesperado', respuesta.status);
  }

  return sobre.data as T;
}
