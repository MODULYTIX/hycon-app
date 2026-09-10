import type { InputHTMLAttributes, ReactNode } from 'react';
import Etiqueta from '@/shared/ui/atomos/Etiqueta';
import EntradaTexto from '@/shared/ui/atomos/EntradaTexto';
import TextoError from '@/shared/ui/atomos/TextoError';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  etiqueta: string;
  icono?: string;
  error?: string;
  accesorio?: ReactNode;
  ayuda?: ReactNode;
}

export default function CampoFormulario({
  id,
  etiqueta,
  icono,
  error,
  accesorio,
  ayuda,
  ...props
}: Props) {
  const idError = `${id}-error`;

  return (
    <div>
      <Etiqueta htmlFor={id}>{etiqueta}</Etiqueta>
      <EntradaTexto
        id={id}
        icono={icono}
        invalido={Boolean(error)}
        accesorio={accesorio}
        aria-describedby={error ? idError : undefined}
        {...props}
      />
      <TextoError id={idError} mensaje={error} />
      {!error && ayuda}
    </div>
  );
}
