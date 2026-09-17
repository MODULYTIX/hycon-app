import { Icon } from '@iconify/react';

// Debajo del campo: el error si lo hay, si no la ayuda
export default function MensajeCampo({
  id,
  error,
  ayuda,
}: {
  id: string;
  error?: string;
  ayuda?: string;
}) {
  if (error) {
    return (
      <p id={id} role="alert" className="mt-1.5 flex items-center gap-1 text-[12.5px] text-red-600">
        <Icon icon="solar:danger-circle-bold" width="14" height="14" aria-hidden />
        {error}
      </p>
    );
  }
  if (ayuda) {
    return (
      <p id={id} className="mt-1.5 text-[12.5px] text-g-50">
        {ayuda}
      </p>
    );
  }
  return null;
}
