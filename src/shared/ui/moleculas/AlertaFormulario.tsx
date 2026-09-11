import { Icon } from '@iconify/react';

interface Props {
  mensaje?: string | null;
  tono?: 'error' | 'exito';
}

// Banner de resultado del formulario: el mensaje viene del backend
export default function AlertaFormulario({ mensaje, tono = 'error' }: Props) {
  if (!mensaje) return null;

  const esError = tono === 'error';

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-[14px] ${
        esError
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-green-200 bg-green-50 text-green-700'
      }`}
    >
      <Icon
        icon={esError ? 'solar:danger-triangle-bold' : 'solar:check-circle-bold'}
        width="18"
        height="18"
        className="mt-[2px] shrink-0"
        aria-hidden
      />
      <span>{mensaje}</span>
    </div>
  );
}
