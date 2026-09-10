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

  const cabeceras: Record<string, string> = {};
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';

  if (autenticada) {
    const token = leerToken();
    if (token) cabeceras.Authorization = `Bearer ${token}`;
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: senal,
    });
  } catch {
    // fetch solo rechaza por problemas de red o CORS, nunca por codigo de estado
    throw new ErrorHttp('No se pudo conectar con el servidor. Intentalo de nuevo', 0);
  }

  let sobre: SobreRespuesta<T> = {};
  try {
    sobre = (await respuesta.json()) as SobreRespuesta<T>;
  } catch {
    // Respuesta sin cuerpo JSON valido
  }

  if (!respuesta.ok) {
    throw new ErrorHttp(sobre.error || 'Ocurrio un error inesperado', respuesta.status);
  }

  return sobre.data as T;
}
