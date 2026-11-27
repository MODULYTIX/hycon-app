import { rutaVerificarCertificado } from '@/app/rutas/rutas';

/**
 * La direccion que guarda el QR de un certificado. Sale del sitio donde este
 * publicada la web, asi que al mudar de dominio apunta sola al bueno.
 */
export const enlaceDeVerificacion = (codigo: string): string => {
  const origen = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origen}${rutaVerificarCertificado(codigo)}`;
};
