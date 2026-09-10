import { Icon } from '@iconify/react';

export default function TextoError({ id, mensaje }: { id?: string; mensaje?: string }) {
  if (!mensaje) return null;

  return (
    <p id={id} role="alert" className="mt-1 flex items-center gap-1 text-[13px] text-red-600">
      <Icon icon="solar:danger-circle-bold" width="14" height="14" />
      {mensaje}
    </p>
  );
}
