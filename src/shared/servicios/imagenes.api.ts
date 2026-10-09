import { peticion } from '@/shared/utilidades/cliente-http';
import {
  sinCloudinary,
  subirACloudinaryApi,
  type DestinoImagen,
} from '@/shared/servicios/cloudinary.api';

interface ImagenSubida {
  url: string;
  tipo: string;
  bytes: number;
}

// Reserva: el archivo viaja al backend y se guarda en su disco
const subirAlServidorApi = (archivo: File): Promise<string> => {
  const formulario = new FormData();
  formulario.append('imagen', archivo);

  return peticion<{ imagen: ImagenSubida }>('/api/v1/uploads/imagenes', {
    metodo: 'POST',
    cuerpo: formulario,
    autenticada: true,
  }).then((respuesta) => respuesta.imagen.url);
};

/**
 * Sube la imagen y devuelve la URL con la que se guarda el registro.
 * Primero intenta Cloudinary; si el servidor no lo tiene configurado,
 * cae al almacenamiento en disco del backend.
 */
export const subirImagenApi = async (
  archivo: File,
  destino: DestinoImagen = 'catalogo'
): Promise<string> => {
  try {
    return await subirACloudinaryApi(archivo, destino);
  } catch (error: unknown) {
    if (!sinCloudinary(error)) throw error;
    return subirAlServidorApi(archivo);
  }
};
