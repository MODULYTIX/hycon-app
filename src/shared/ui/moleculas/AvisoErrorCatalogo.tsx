import { Icon } from '@iconify/react';

interface Props {
  error: string | null;
  onReintentar?: () => void;
  reintentando?: boolean;
  clase?: string;
}

export default function AvisoErrorCatalogo({
  error,
  onReintentar,
  reintentando = false,
  clase = '',
}: Props) {
  if (!error) return null;

  const esErrorConexion = /conectar con el servidor|conexion|conexión|network|failed to fetch|sincronizar/i.test(error);
  const titulo = esErrorConexion ? 'Sincronizando información' : 'Aviso de carga';
  const descripcion = esErrorConexion
    ? 'No pudimos sincronizar el catálogo en este momento. Puedes volver a intentarlo en unos instantes.'
    : error;

  return (
    <div
      role="alert"
      className={`mb-6 overflow-hidden rounded-2xl border border-hy-20/80 bg-gradient-to-r from-hy-5/80 via-white to-hy-5/40 p-4 shadow-xs ring-1 ring-black/[0.03] sm:p-5 ${clase}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hy-10 text-primary">
            <Icon
              icon="solar:refresh-circle-linear"
              width="24"
              height="24"
              className={reintentando ? 'animate-spin' : ''}
              aria-hidden
            />
          </div>
          <div>
            <h3 className="text-[14.5px] font-semibold text-g-90">{titulo}</h3>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-g-60">{descripcion}</p>
          </div>
        </div>

        {onReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            disabled={reintentando}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-semibold text-white shadow-xs transition-all duration-200 hover:bg-marca-oscuro hover:shadow-sm active:scale-[0.98] disabled:opacity-60"
          >
            <Icon
              icon="solar:restart-linear"
              width="15"
              height="15"
              className={reintentando ? 'animate-spin' : ''}
              aria-hidden
            />
            {reintentando ? 'Reintentando...' : 'Reintentar carga'}
          </button>
        )}
      </div>
    </div>
  );
}
