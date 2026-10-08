import { Icon } from '@iconify/react';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import {
  formatearNumeroTarjeta,
  formatearVencimiento,
  marcaDeTarjeta,
  soloDigitos,
  type DatosTarjeta,
  type ErroresTarjeta,
} from '@/features/carrito/utilidades/validaciones-pago';

interface Props {
  datos: DatosTarjeta;
  errores: ErroresTarjeta;
  deshabilitado: boolean;
  onCambiar: (campo: keyof DatosTarjeta, valor: string) => void;
}

const LOGOS: Record<string, string> = {
  visa: 'logos:visa',
  mastercard: 'logos:mastercard',
  amex: 'logos:amex',
  diners: 'simple-icons:dinersclub',
};

// Datos de la tarjeta. Se validan en el navegador y no se guardan en ningun sitio.
export default function FormularioTarjeta({ datos, errores, deshabilitado, onCambiar }: Props) {
  const marca = marcaDeTarjeta(datos.numero);
  const logo = LOGOS[marca];

  return (
    <div className="space-y-4">
      <div className="relative">
        <CampoTexto
          id="pago-numero"
          etiqueta="Número de tarjeta"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={datos.numero}
          disabled={deshabilitado}
          error={errores.numero}
          onChange={(evento) => onCambiar('numero', formatearNumeroTarjeta(evento.target.value))}
        />
        {logo && (
          <span aria-label={marca} className="pointer-events-none absolute right-3 top-[38px]">
            <Icon icon={logo} width="30" height="20" />
          </span>
        )}
      </div>

      <CampoTexto
        id="pago-titular"
        etiqueta="Titular de la tarjeta"
        autoComplete="cc-name"
        placeholder="Como figura en la tarjeta"
        value={datos.titular}
        disabled={deshabilitado}
        error={errores.titular}
        onChange={(evento) => onCambiar('titular', evento.target.value.toUpperCase())}
      />

      <div className="grid grid-cols-2 gap-4">
        <CampoTexto
          id="pago-vencimiento"
          etiqueta="Vencimiento"
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/AA"
          value={datos.vencimiento}
          disabled={deshabilitado}
          error={errores.vencimiento}
          onChange={(evento) => onCambiar('vencimiento', formatearVencimiento(evento.target.value))}
        />
        <CampoTexto
          id="pago-cvv"
          etiqueta="CVV"
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder="123"
          maxLength={4}
          value={datos.cvv}
          disabled={deshabilitado}
          error={errores.cvv}
          ayuda="Los dígitos del reverso"
          onChange={(evento) => onCambiar('cvv', soloDigitos(evento.target.value).slice(0, 4))}
        />
      </div>
    </div>
  );
}
