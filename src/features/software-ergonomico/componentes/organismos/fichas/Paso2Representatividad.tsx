import { useEffect } from 'react';
import type { DatosRepresentatividad } from '@/features/software-ergonomico/tipos/ficha.tipos';
import { Icon } from '@iconify/react';

interface Props {
  datos: DatosRepresentatividad;
  onChange: (datos: DatosRepresentatividad) => void;
  frecuenciaPaso1: string;
}

export default function Paso2Representatividad({ datos, onChange, frecuenciaPaso1 }: Props) {
  // Calculo automatico basado en reglas de negocio
  useEffect(() => {
    const requiere = datos.duracionMayor120 && frecuenciaPaso1 === 'cotidiana';
    if (requiere !== datos.requiereIdentificacion) {
      onChange({ ...datos, requiereIdentificacion: requiere });
    }
  }, [datos.duracionMayor120, frecuenciaPaso1, datos.requiereIdentificacion, onChange, datos]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-g-90">2. Representatividad de la evaluación</h3>
        <p className="text-sm text-g-60">Determina si la tarea requiere una evaluación ergonómica detallada.</p>
      </div>

      <div className="rounded-xl border border-g-20 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-g-90">¿La duración es mayor a 120 minutos diarios?</p>
            <p className="mt-1 text-xs text-g-50">Según lo indicado en el paso anterior.</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="duracionMayor120"
                checked={datos.duracionMayor120 === true}
                onChange={() => onChange({ ...datos, duracionMayor120: true })}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-sm text-g-80">Sí</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="duracionMayor120"
                checked={datos.duracionMayor120 === false}
                onChange={() => onChange({ ...datos, duracionMayor120: false })}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-sm text-g-80">No</span>
            </label>
          </div>
        </div>
      </div>

      <div className={`rounded-xl border p-5 transition-colors ${datos.requiereIdentificacion ? 'border-y-30 bg-y-5' : 'border-g-20 bg-g-5'}`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 shrink-0 ${datos.requiereIdentificacion ? 'text-y-60' : 'text-g-40'}`}>
            <Icon icon="solar:info-circle-bold" width="24" height="24" />
          </div>
          <div>
            <p className="font-semibold text-g-90">¿Se requiere identificación ergonómica?</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold ${datos.requiereIdentificacion ? 'bg-y-20 text-y-80' : 'bg-g-20 text-g-70'}`}>
                {datos.requiereIdentificacion ? 'SÍ REQUIERE' : 'NO REQUIERE'}
              </span>
            </div>
            <p className="mt-2 text-xs text-g-60">
              Cálculo automático: requiere duración mayor a 120 minutos y frecuencia cotidiana (Paso 1).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
