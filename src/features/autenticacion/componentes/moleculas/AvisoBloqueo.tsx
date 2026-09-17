import { Icon } from '@iconify/react';
import { formatearCuentaAtras } from '@/features/autenticacion/hooks/useCuentaAtras';

// Se muestra cuando el servidor bloqueo el acceso por demasiados intentos fallidos
export default function AvisoBloqueo({ segundos }: { segundos: number }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-y-30 bg-y-5 px-4 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-y-10 text-y-70">
        <Icon icon="solar:shield-warning-bold" width="18" height="18" aria-hidden />
      </span>
      <div className="text-[13.5px] text-y-90">
        <p className="font-semibold">Acceso bloqueado temporalmente</p>
        <p className="mt-0.5">
          Hubo demasiados intentos fallidos. Por tu seguridad podrás intentarlo de nuevo en{' '}
          <span className="font-semibold tabular-nums">{formatearCuentaAtras(segundos)}</span>.
        </p>
      </div>
    </div>
  );
}
