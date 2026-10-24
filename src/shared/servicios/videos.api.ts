import { peticion } from '@/shared/utilidades/cliente-http';

export type ProveedorVideo = 'youtube' | 'r2' | 'stream';

export interface AlmacenVideos {
  proveedor: ProveedorVideo;
  // false con youtube: ahi solo se pega el enlace
  aceptaSubidas: boolean;
  maximoMb: number;
  extensiones: string[];
}

export interface SubidaFirmada {
  proveedor: ProveedorVideo;
  metodo: 'PUT' | 'POST';
  url: string;
  // Lo que hay que guardar en la leccion cuando termina la subida
  referencia: string;
  // Stream recibe el archivo en un formulario; R2 en el cuerpo del PUT
  campoArchivo: string | null;
}

/** Que almacen tiene el servidor, para saber si se puede subir un archivo. */
export const obtenerAlmacenVideosApi = (senal?: AbortSignal) =>
  peticion<{ almacen: AlmacenVideos }>('/api/v1/media/videos', {
    autenticada: true,
    senal,
  }).then((r) => r.almacen);

const pedirFirmaVideoApi = (cursoUuid: string, nombre: string) =>
  peticion<{ subida: SubidaFirmada }>('/api/v1/media/videos/firma', {
    metodo: 'POST',
    cuerpo: { cursoUuid, nombre },
    autenticada: true,
  }).then((r) => r.subida);

const extensionDe = (nombre: string) => nombre.split('.').pop()?.toLowerCase() ?? '';

export const revisarVideo = (archivo: File, almacen: AlmacenVideos): string | undefined => {
  if (!almacen.extensiones.includes(extensionDe(archivo.name))) {
    return `El video debe ser ${almacen.extensiones.join(', ').toUpperCase()}`;
  }
  if (archivo.size > almacen.maximoMb * 1024 * 1024) {
    return `El video no puede pesar más de ${almacen.maximoMb} MB`;
  }
  return undefined;
};

interface Envio {
  subida: SubidaFirmada;
  archivo: File;
  onProgreso?: (porcentaje: number) => void;
  senal?: AbortSignal;
}

// Se usa XMLHttpRequest porque fetch no informa del avance de una subida
const enviarArchivo = ({ subida, archivo, onProgreso, senal }: Envio) =>
  new Promise<void>((resolver, rechazar) => {
    const envio = new XMLHttpRequest();
    envio.open(subida.metodo, subida.url);

    envio.upload.addEventListener('progress', (evento) => {
      if (evento.lengthComputable) {
        onProgreso?.(Math.round((evento.loaded / evento.total) * 100));
      }
    });
    envio.addEventListener('load', () => {
      if (envio.status >= 200 && envio.status < 300) resolver();
      else rechazar(new Error('El almacén rechazó el video. Vuelve a intentarlo.'));
    });
    envio.addEventListener('error', () => rechazar(new Error('Se cortó la conexión al subir el video')));
    envio.addEventListener('abort', () => rechazar(new Error('Subida cancelada')));

    senal?.addEventListener('abort', () => envio.abort());

    if (subida.campoArchivo) {
      const cuerpo = new FormData();
      cuerpo.append(subida.campoArchivo, archivo);
      envio.send(cuerpo);
    } else {
      envio.send(archivo);
    }
  });

/**
 * Sube el video y devuelve la referencia que se guarda en la leccion. El archivo
 * va del navegador al almacen con un permiso temporal, sin pasar por el servidor.
 */
export const subirVideoApi = async (
  cursoUuid: string,
  archivo: File,
  onProgreso?: (porcentaje: number) => void,
  senal?: AbortSignal
): Promise<string> => {
  const subida = await pedirFirmaVideoApi(cursoUuid, archivo.name);
  await enviarArchivo({ subida, archivo, onProgreso, senal });
  return subida.referencia;
};
