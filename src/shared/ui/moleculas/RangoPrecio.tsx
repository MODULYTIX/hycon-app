import { useId, useState, type CSSProperties } from 'react';
import { formatearPrecio } from '@/shared/utilidades/formato';

// The last stop means no upper bound, so the default never hides expensive items.
const LIMITE = 1000;
export default function RangoPrecio() {
  const id = useId();
  const [minimo, setMinimo] = useState(0);
  const [maximo, setMaximo] = useState(LIMITE);
  const estilo = { '--rango-desde': `${minimo / LIMITE * 100}%`, '--rango-hasta': `${maximo / LIMITE * 100}%` } as CSSProperties;
  return (
    <fieldset className="filtro-precio min-w-0">
      <legend className="mb-3 text-[12px] font-semibold text-g-70">Precio de lista</legend>
      <div className="mb-3 flex items-center justify-between gap-2 text-[12px] tabular-nums">
        <span className="rounded-md border border-g-20 bg-g-5 px-2.5 py-1.5 text-g-70">{formatearPrecio(minimo)}</span>
        <span aria-hidden className="text-g-40">—</span>
        <span className="rounded-md border border-g-20 bg-g-5 px-2.5 py-1.5 text-g-70">{maximo === LIMITE ? 'Sin límite' : formatearPrecio(maximo)}</span>
      </div>
      <div className="rango-precio" style={estilo}>
        <div className="rango-precio-pista" aria-hidden />
        <input id={`${id}-min`} type="range" min="0" max={LIMITE} step="1" value={minimo}
          aria-label="Precio mínimo" aria-valuetext={formatearPrecio(minimo)}
          style={{ zIndex: minimo > LIMITE / 2 ? 4 : 2 }}
          onChange={(e) => setMinimo(Math.min(Number(e.target.value), maximo))} />
        <input id={`${id}-max`} type="range" min="0" max={LIMITE} step="1" value={maximo}
          aria-label="Precio máximo" aria-valuetext={maximo === LIMITE ? 'Sin límite' : formatearPrecio(maximo)}
          style={{ zIndex: 3 }} onChange={(e) => setMaximo(Math.max(Number(e.target.value), minimo))} />
      </div>
      {minimo > 0 && <input type="hidden" name="precioMin" value={minimo} />}
      {maximo < LIMITE && <input type="hidden" name="precioMax" value={maximo} />}
      <p className="mt-2 text-[10.5px] leading-relaxed text-g-50">Arrastra los extremos. El último punto deja el máximo sin límite.</p>
    </fieldset>
  );
}

