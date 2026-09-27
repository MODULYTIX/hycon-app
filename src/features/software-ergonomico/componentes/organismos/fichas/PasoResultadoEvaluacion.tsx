import type { Clasificador } from './nivelesExposicion';

interface Campo {
  id: string;
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
}

interface Props {
  titulo: string;
  campos: Campo[];
  /** Si se indica, el input se pinta y muestra el nivel de exposición según el valor */
  clasificar?: Clasificador;
}

// Vista genérica para los pasos de resultados: título y uno o más valores decimales opcionales
export default function PasoResultadoEvaluacion({ titulo, campos, clasificar }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-g-90">{titulo}</h3>
        <p className="text-sm text-g-60">Opcional: puede ingresar el valor ahora o completarlo después.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {campos.map((campo) => {
          const numero = campo.valor === '' ? null : Number(campo.valor);
          const nivel = clasificar && numero !== null && !Number.isNaN(numero) ? clasificar(numero) : null;

          return (
            <div key={campo.id} className="flex flex-col gap-1.5">
              <label htmlFor={campo.id} className="text-sm font-medium text-g-80">{campo.etiqueta}</label>
              <input
                id={campo.id}
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={campo.valor}
                onChange={(e) => campo.onChange(e.target.value)}
                placeholder="0.00"
                className={`rounded-lg border px-3 py-2 text-sm text-g-90 placeholder-g-50 transition-colors focus:outline-none focus:ring-1 ${nivel ? nivel.input : 'border-g-30 focus:border-primary focus:ring-primary'}`}
              />
              {nivel && (
                <span className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${nivel.insignia}`}>
                  {nivel.etiqueta}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
