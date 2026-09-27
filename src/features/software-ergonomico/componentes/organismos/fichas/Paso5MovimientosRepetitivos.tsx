import type { FactorPostura, MovimientosRepetitivos } from '@/features/software-ergonomico/tipos/ficha.tipos';
import { FACTORES_ESFUERZO, FACTORES_MOVIMIENTO } from './catalogoFactores';

interface Props {
  datos: MovimientosRepetitivos;
  onChange: (datos: MovimientosRepetitivos) => void;
}

type LlaveEsfuerzo = keyof MovimientosRepetitivos['esfuerzoManos'];
type LlaveMovimiento = keyof MovimientosRepetitivos['movimientosAltaFrecuencia'];

interface FilaProps {
  titulo: string;
  factor: FactorPostura;
  onChange: (factor: FactorPostura) => void;
}

function FilaFactor({ titulo, factor, onChange }: FilaProps) {
  // Alerta de salud (no es error de escritura): 120 min diarios o más
  const alerta = factor.aplica && Number(factor.duracionDiaria) >= 120;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between ${alerta ? 'border-red-500 bg-red-50' : 'border-g-20 bg-white'}`}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={factor.aplica}
          onChange={(e) => onChange({ ...factor, aplica: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-g-30 text-primary focus:ring-primary"
        />
        <span className="text-sm font-medium text-g-90">{titulo}</span>
      </label>

      {factor.aplica && (
        <div className="flex items-center gap-2 sm:ml-4">
          <span className="shrink-0 text-xs text-g-50">Duración:</span>
          <input
            type="number"
            min="0"
            placeholder="Minutos"
            value={factor.duracionDiaria}
            onChange={(e) => onChange({ ...factor, duracionDiaria: e.target.value })}
            className={`w-24 rounded-md border bg-white px-2 py-1.5 text-sm text-g-90 focus:outline-none focus:ring-1 ${alerta ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-g-30 focus:border-primary focus:ring-primary'}`}
          />
        </div>
      )}
    </div>
  );
}

export default function Paso5MovimientosRepetitivos({ datos, onChange }: Props) {
  const handleChangeEsfuerzo = (llave: LlaveEsfuerzo, factor: FactorPostura) => {
    onChange({
      ...datos,
      esfuerzoManos: { ...datos.esfuerzoManos, [llave]: factor },
    });
  };

  const handleChangeMovimiento = (llave: LlaveMovimiento, factor: FactorPostura) => {
    onChange({
      ...datos,
      movimientosAltaFrecuencia: { ...datos.movimientosAltaFrecuencia, [llave]: factor },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-g-90">5. Movimientos repetitivos / esfuerzo</h3>
        <p className="text-sm text-g-60">
          Marque las condiciones que correspondan e indique en minutos su duración diaria aproximada.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-semibold text-g-80 border-b border-g-20 pb-2">Esfuerzo de manos y muñecas / Más de 2 horas al día</h4>
        {FACTORES_ESFUERZO.map(({ llave, titulo }) => (
          <FilaFactor
            key={llave}
            titulo={titulo}
            factor={datos.esfuerzoManos[llave]}
            onChange={(factor) => handleChangeEsfuerzo(llave, factor)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-semibold text-g-80 border-b border-g-20 pb-2">Movimientos repetitivos con alta frecuencia</h4>
        {FACTORES_MOVIMIENTO.map(({ llave, titulo }) => (
          <FilaFactor
            key={llave}
            titulo={titulo}
            factor={datos.movimientosAltaFrecuencia[llave]}
            onChange={(factor) => handleChangeMovimiento(llave, factor)}
          />
        ))}
      </div>
    </div>
  );
}
