import { useEffect } from 'react';
import type { DatosRepresentatividad } from '@/features/software-ergonomico/tipos/ficha.tipos';

interface Props {
  datos: DatosRepresentatividad;
  onChange: (datos: DatosRepresentatividad) => void;
}

export default function Paso2Representatividad({ datos, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...datos, [name]: value });
  };

  // Calculo automatico basado en reglas de negocio
  useEffect(() => {
    const mayor120 = Number(datos.duracionMinutos) > 120;
    const requiere = mayor120 && datos.cotidiana;
    if (mayor120 !== datos.duracionMayor120 || requiere !== datos.requiereIdentificacion) {
      onChange({ ...datos, duracionMayor120: mayor120, requiereIdentificacion: requiere });
    }
  }, [datos, onChange]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-g-90">2. Representatividad de la evaluación</h3>
        <p className="text-sm text-g-60">Determina si la tarea requiere una evaluación ergonómica detallada.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="duracionMinutos" className="text-sm font-medium text-g-80">Duración diaria (minutos)</label>
          <input
            id="duracionMinutos"
            name="duracionMinutos"
            type="number"
            min="0"
            value={datos.duracionMinutos}
            onChange={handleChange}
            className="rounded-lg border border-g-30 px-3 py-2 text-sm text-g-90 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span id="cotidiana-label" className="text-sm font-medium text-g-80">Cotidiana / diaria</span>
          <div className="flex items-center gap-3 py-2">
            <button
              id="cotidiana"
              type="button"
              role="switch"
              aria-checked={datos.cotidiana}
              aria-labelledby="cotidiana-label"
              onClick={() => onChange({ ...datos, cotidiana: !datos.cotidiana })}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${datos.cotidiana ? 'bg-primary' : 'bg-g-30'}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${datos.cotidiana ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
            <span className="text-sm font-medium text-g-80">{datos.cotidiana ? 'Sí' : 'No'}</span>
          </div>
        </div>
      </div>

      {datos.requiereIdentificacion && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="identificacionErgonomica" className="text-sm font-medium text-g-80">
            Se requiere identificación ergonómica
          </label>
          <textarea
            id="identificacionErgonomica"
            name="identificacionErgonomica"
            value={datos.identificacionErgonomica}
            onChange={handleChange}
            rows={3}
            placeholder="Describe la identificación ergonómica requerida..."
            className="rounded-lg border border-g-30 px-3 py-2 text-sm text-g-90 placeholder-g-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-xs text-g-50">Aplica porque la duración es mayor a 120 minutos y la frecuencia es cotidiana.</p>
        </div>
      )}
    </div>
  );
}
