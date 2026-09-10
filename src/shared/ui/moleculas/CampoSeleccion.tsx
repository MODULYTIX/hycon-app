import type { SelectHTMLAttributes } from 'react';
import Etiqueta from '@/shared/ui/atomos/Etiqueta';
import TextoError from '@/shared/ui/atomos/TextoError';

interface Opcion {
  valor: string;
  etiqueta: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  etiqueta: string;
  opciones: Opcion[];
  error?: string;
}

export default function CampoSeleccion({ id, etiqueta, opciones, error, ...props }: Props) {
  const idError = `${id}-error`;

  return (
    <div>
      <Etiqueta htmlFor={id}>{etiqueta}</Etiqueta>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`w-full rounded-lg border bg-white p-2 text-g-80 outline-none transition-colors ${
          error ? 'border-red-400 focus:border-red-500' : 'border-g-40 focus:border-primary'
        }`}
        {...props}
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      <TextoError id={idError} mensaje={error} />
    </div>
  );
}
