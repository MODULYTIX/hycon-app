import { ErrorHttp, peticion } from '@/shared/utilidades/cliente-http';

export interface FirmaSubida {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

export type DestinoImagen = 'catalogo' | 'avatar';

/** Cloudinary rechaza cualquier otra cosa; conviene avisar antes de subir. */
export const FORMATOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024;

export const revisarImagen = (archivo: File): string | undefined => {
  if (!FORMATOS_IMAGEN.includes(archivo.type)) return 'La imagen debe ser JPG, PNG, WEBP o GIF';
  if (archivo.size > TAMANO_MAXIMO_IMAGEN) return 'La imagen no puede pesar más de 5 MB';
  return undefined;
};

/** El backend firma la subida; el archivo va directo a Cloudinary, sin pasar por él. */
export const pedirFirmaApi = (destino: DestinoImagen) =>
  peticion<{ firma: FirmaSubida }>(`/api/v1/uploads/firma/${destino}`, {
    metodo: 'POST',
    autenticada: true,
  }).then((r) => r.firma);

const subirACloudinary = async (archivo: File, firma: FirmaSubida): Promise<string> => {
  const cuerpo = new FormData();
  cuerpo.append('file', archivo);
  cuerpo.append('api_key', firma.apiKey);
  cuerpo.append('timestamp', String(firma.timestamp));
  cuerpo.append('folder', firma.folder);
  cuerpo.append('signature', firma.signature);

  const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${firma.cloudName}/image/upload`, {
    method: 'POST',
    body: cuerpo,
  });
  const datos = (await respuesta.json().catch(() => ({}))) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!respuesta.ok || !datos.secure_url) {
    throw new Error(datos.error?.message ?? 'No se pudo subir la imagen');
  }
  return datos.secure_url;
};

/**
 * Sube la imagen y devuelve su URL. Si el servidor todavia no tiene Cloudinary
 * configurado responde 503 y quien llama decide que hacer.
 */
export const subirACloudinaryApi = async (
  archivo: File,
  destino: DestinoImagen
): Promise<string> => {
  const problema = revisarImagen(archivo);
  if (problema) throw new Error(problema);

  return subirACloudinary(archivo, await pedirFirmaApi(destino));
};

/** true cuando el fallo es porque el servidor no tiene Cloudinary configurado. */
export const sinCloudinary = (error: unknown): boolean =>
  error instanceof ErrorHttp && error.estado === 503;
