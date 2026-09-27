import type { ManipulacionCargas } from '@/features/software-ergonomico/tipos/ficha.tipos';
import { FACTORES_CARGAS } from './catalogoFactores';

interface Props {
  datos: ManipulacionCargas;
  onChange: (datos: ManipulacionCargas) => void;
}

export default function Paso4ManipulacionCargas({ datos, onChange }: Props) {
  const handleChangeAplica = (llave: keyof ManipulacionCargas, valor: boolean) => {
    onChange({
      ...datos,
      [llave]: { ...datos[llave], aplica: valor },
    });
  };

  const handleChangeDuracion = (llave: keyof ManipulacionCargas, valor: string) => {
    onChange({
      ...datos,
      [llave]: { ...datos[llave], duracionDiaria: valor },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-g-90">4. Manipulación manual de cargas</h3>
        <p className="text-sm text-g-60">Sección destinada a registrar levantamiento manual.</p>
      </div>

      <div className="flex flex-col gap-3">
        {FACTORES_CARGAS.map(({ llave, titulo }) => {
          const factor = datos[llave];
          // Alerta de salud (no es error de escritura): 120 min diarios o más
          const alerta = factor.aplica && Number(factor.duracionDiaria) >= 120;
          return (
            <div
              key={llave}
              className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between ${alerta ? 'border-red-500 bg-red-50' : 'border-g-20 bg-white'}`}
            >
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={factor.aplica}
                  onChange={(e) => handleChangeAplica(llave, e.target.checked)}
                  className="h-4 w-4 rounded border-g-30 text-primary focus:ring-primary"
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
                    onChange={(e) => handleChangeDuracion(llave, e.target.value)}
                    className={`w-24 rounded-md border bg-white px-2 py-1.5 text-sm text-g-90 focus:outline-none focus:ring-1 ${alerta ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-g-30 focus:border-primary focus:ring-primary'}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
