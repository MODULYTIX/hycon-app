import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';

// Lo que se ve cuando una pantalla se rompe: antes aqui quedaba la pagina en blanco
export default function AvisoFalloPantalla({ onReintentar }: { onReintentar: () => void }) {
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-3 px-4 py-24 text-center"
    >
      <Icon
        icon="solar:danger-triangle-linear"
        width="56"
        height="56"
        aria-hidden
        className="text-g-30"
      />
      <h1 className="text-[28px] font-medium text-g-80">Algo salió mal</h1>
      <p className="text-[16px] text-g-50">
        No pudimos mostrar esta pantalla. Vuelve a intentarlo; si sigue igual, escríbenos.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReintentar}
          className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-marca-oscuro"
        >
          Volver a intentar
        </button>
        <Link
          to={RUTAS.home}
          className="rounded-lg border border-g-30 px-6 py-2.5 font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
