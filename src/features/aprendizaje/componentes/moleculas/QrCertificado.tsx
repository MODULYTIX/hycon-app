import { QRCodeSVG } from 'qrcode.react';
import { enlaceDeVerificacion } from '@/features/aprendizaje/utilidades/verificacion';

interface Props {
  codigo: string;
  lado?: number;
}

/** Codigo para escanear desde el papel: lleva a comprobar que el titulo existe. */
export default function QrCertificado({ codigo, lado = 72 }: Props) {
  return (
    <QRCodeSVG
      value={enlaceDeVerificacion(codigo)}
      size={lado}
      // Sobre el papel del certificado, no sobre blanco puro
      bgColor="transparent"
      fgColor="#1c3a39"
      // Con correccion media el codigo aguanta un doblez o una mancha
      level="M"
      title={`Codigo para verificar el certificado ${codigo}`}
    />
  );
}
