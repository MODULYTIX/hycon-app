import { Icon } from '@iconify/react';

// Confirmacion discreta de la ultima accion (alta, edicion o borrado)
export default function AvisoPanel({
  mensaje,
  onCerrar,
}: {
  mensaje: string | null;
  onCerrar: () => void;
}) {
  if (!mensaje) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-xl border border-hy-verde/25 bg-white px-4 py-3 animate-menuIn"
    >
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hy-verde/10 text-hy-verde"
      >
        <Icon icon="solar:check-circle-bold" width="18" height="18" />
      </span>
      <p className="min-w-0 flex-1 text-[14px] font-medium text-hy-tinta">{mensaje}</p>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Ocultar aviso"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-g-40 transition-colors hover:bg-hy-5 hover:text-g-70"
      >
        <Icon icon="solar:close-circle-linear" width="18" height="18" aria-hidden />
      </button>
    </div>
  );
}
