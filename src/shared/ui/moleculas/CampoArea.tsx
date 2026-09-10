import type { TextareaHTMLAttributes } from 'react';
import Etiqueta from '@/shared/ui/atomos/Etiqueta';
import TextoError from '@/shared/ui/atomos/TextoError';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  etiqueta: string;
  error?: string;
}

export default function CampoArea({ id, etiqueta, error, ...props }: Props) {
  const idError = `${id}-error`;

  return (
    <div>
      <Etiqueta htmlFor={id}>{etiqueta}</Etiqueta>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`w-full resize-y rounded-lg border bg-white p-2 text-g-80 outline-none transition-colors placeholder:text-g-40 ${
          error ? 'border-red-400 focus:border-red-500' : 'border-g-40 focus:border-primary'
        }`}
        {...props}
      />
      <TextoError id={idError} mensaje={error} />
    </div>
  );
}
