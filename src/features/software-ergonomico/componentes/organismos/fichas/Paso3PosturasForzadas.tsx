import type { PosturasForzadas } from '@/features/software-ergonomico/tipos/ficha.tipos';
import { NOMBRES_POSTURAS as NOMBRES_FACTORES } from './catalogoFactores';

interface Props {
  datos: PosturasForzadas;
  onChange: (datos: PosturasForzadas) => void;
}

export default function Paso3PosturasForzadas({ datos, onChange }: Props) {
  const handleChangeAplica = (llave: keyof PosturasForzadas, valor: boolean) => {
    onChange({
      ...datos,
      [llave]: { ...datos[llave], aplica: valor },
    });
  };

  const handleChangeDuracion = (llave: keyof PosturasForzadas, valor: string) => {
    onChange({
      ...datos,
      [llave]: { ...datos[llave], duracionDiaria: valor },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-g-90">3. Posturas incómodas o forzadas</h3>
        <p className="text-sm text-g-60">Marque las condiciones que aplican e indique su duración diaria aproximada.</p>
      </div>

      <div className="flex flex-col gap-3">
        {(Object.keys(NOMBRES_FACTORES) as Array<keyof PosturasForzadas>).map((llave) => {
          const factor = datos[llave];
          // Alerta de salud (no es error de escritura): 120 min diarios o más en la postura
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
                <span className="text-sm font-medium text-g-90">{NOMBRES_FACTORES[llave]}</span>
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
