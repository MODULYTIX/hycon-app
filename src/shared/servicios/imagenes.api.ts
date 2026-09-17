import { peticion } from '@/shared/utilidades/cliente-http';

interface ImagenSubida {
  url: string;
  tipo: string;
  bytes: number;
}

// Sube la imagen al backend y devuelve la URL publica con la que se guarda el registro
export const subirImagenApi = (archivo: File): Promise<string> => {
  const formulario = new FormData();
  formulario.append('imagen', archivo);

  return peticion<{ imagen: ImagenSubida }>('/api/v1/uploads/imagenes', {
    metodo: 'POST',
    cuerpo: formulario,
    autenticada: true,
  }).then((respuesta) => respuesta.imagen.url);
};
