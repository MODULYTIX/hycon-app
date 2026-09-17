import { useState } from 'react';
import { subirImagenApi } from '@/shared/servicios/imagenes.api';
import type { ValorImagen } from '@/shared/ui/organismos/ZonaImagen';

/**
 * Estado de la imagen de un formulario del catalogo.
 * El archivo elegido no se sube hasta guardar: asi cancelar no deja archivos huerfanos.
 */
export function useImagenFormulario(urlInicial: string) {
  const [imagen, setImagen] = useState<ValorImagen>({ archivo: null, url: urlInicial });

  const cambio = imagen.archivo !== null || imagen.url !== urlInicial;

  // Devuelve la URL definitiva. Si habia archivo lo sube y lo sustituye por su URL,
  // para que un segundo intento de guardado (tras un error) no lo suba otra vez.
  const resolverUrl = async (): Promise<string> => {
    if (!imagen.archivo) return imagen.url.trim();
    const url = await subirImagenApi(imagen.archivo);
    setImagen({ archivo: null, url });
    return url;
  };

  return { imagen, setImagen, cambio, resolverUrl };
}
