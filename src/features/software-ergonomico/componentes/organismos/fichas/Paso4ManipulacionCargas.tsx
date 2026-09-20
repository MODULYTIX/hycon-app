import type { ManipulacionCargas } from '@/features/software-ergonomico/tipos/ficha.tipos';

interface Props {
  datos: ManipulacionCargas;
  onChange: (datos: ManipulacionCargas) => void;
}

const FACTORES = [
  { llave: 'levantamiento40kg' as const, titulo: 'Levantamiento de 40 kg una vez al día' },
  { llave: 'levantamiento25kg' as const, titulo: 'Levantamiento de 25 kg más de 12 veces por hora' },
  { llave: 'levantamiento5kg' as const, titulo: 'Levantamiento de 5 kg más de 2 veces por minuto' },
];

export default function Paso4ManipulacionCargas({ datos, onChange }: Props) {
  const handleChangeAplica = (llave: keyof ManipulacionCargas, valor: boolean) => {
    onChange({
      ...datos,
      [llave]: { ...datos[llave], aplica: valor },
    });
  };

  const handleChangeFrecuencia = (llave: keyof ManipulacionCargas, valor: string) => {
    onChange({
      ...datos,
      [llave]: { ...datos[llave], frecuencia: valor },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-g-90">4. Manipulación manual de cargas</h3>
        <p className="text-sm text-g-60">Sección destinada a registrar levantamiento manual.</p>
      </div>

      <div className="flex flex-col gap-4">
        {FACTORES.map(({ llave, titulo }) => {
          const factor = datos[llave];
          return (
            <div key={llave} className="flex flex-col gap-3 rounded-xl border border-g-20 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-medium text-g-90">{titulo}</span>
                <div className="flex shrink-0 items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={factor.aplica === true}
                      onChange={() => handleChangeAplica(llave, true)}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-g-80">Sí</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={factor.aplica === false}
                      onChange={() => handleChangeAplica(llave, false)}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-g-80">No</span>
                  </label>
                </div>
              </div>

              {factor.aplica && (
                <div className="mt-2 flex flex-col gap-1.5 border-t border-g-10 pt-3">
                  <label className="text-xs font-medium text-g-70">Duración o frecuencia (ej. 3 veces al día)</label>
                  <input
                    type="text"
                    value={factor.frecuencia}
                    onChange={(e) => handleChangeFrecuencia(llave, e.target.value)}
                    placeholder="Especifique..."
                    className="w-full rounded-md border border-g-30 px-3 py-2 text-sm text-g-90 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
