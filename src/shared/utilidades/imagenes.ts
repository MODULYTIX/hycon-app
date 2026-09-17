// Mismas reglas que aplica el backend en POST /uploads/imagenes
export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024;

export const validarArchivoImagen = (archivo: File): string | undefined => {
  if (!TIPOS_IMAGEN.includes(archivo.type)) {
    return 'Formato no permitido. Usa JPG, PNG, WEBP o GIF';
  }
  if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
    return 'La imagen supera el maximo de 5 MB';
  }
  if (archivo.size === 0) {
    return 'El archivo esta vacio';
  }
  return undefined;
};

export const formatearTamano = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
