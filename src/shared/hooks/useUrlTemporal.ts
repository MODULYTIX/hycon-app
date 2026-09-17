import { useEffect, useState } from 'react';

// La vista previa de un archivo local necesita una URL temporal que hay que liberar
export const useUrlTemporal = (archivo: File | null) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!archivo || typeof URL.createObjectURL !== 'function') {
      setUrl(null);
      return;
    }
    const temporal = URL.createObjectURL(archivo);
    setUrl(temporal);
    return () => URL.revokeObjectURL(temporal);
  }, [archivo]);

  return url;
};
