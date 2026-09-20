import type { MovimientosRepetitivos } from '@/features/software-ergonomico/tipos/ficha.tipos';

interface Props {
  datos: MovimientosRepetitivos;
  onChange: (datos: MovimientosRepetitivos) => void;
}

export default function Paso5MovimientosRepetitivos({ datos, onChange }: Props) {
  const handleChangeEsfuerzo = (llave: keyof MovimientosRepetitivos['esfuerzoManos'], valor: boolean) => {
    onChange({
      ...datos,
      esfuerzoManos: { ...datos.esfuerzoManos, [llave]: valor },
    });
  };

  const handleChangeMovimiento = (llave: keyof MovimientosRepetitivos['movimientosAltaFrecuencia'], valor: boolean) => {
    onChange({
      ...datos,
      movimientosAltaFrecuencia: { ...datos.movimientosAltaFrecuencia, [llave]: valor },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-g-90">5. Movimientos repetitivos / esfuerzo</h3>
        <p className="text-sm text-g-60">Indique las condiciones de esfuerzo de manos y movimientos de alta frecuencia.</p>
      </div>

      <div className="flex flex-col gap-4">
        <h4 className="font-semibold text-g-80 border-b border-g-20 pb-2">Esfuerzo de manos y muñecas</h4>
        
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-g-20 bg-white p-4 shadow-sm transition-colors hover:bg-g-5">
          <input
            type="checkbox"
            checked={datos.esfuerzoManos.manipulacionMenor3kg}
            onChange={(e) => handleChangeEsfuerzo('manipulacionMenor3kg', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-g-30 text-primary focus:ring-primary"
          />
          <span className="text-sm text-g-90">Manipulación de objetos menores de 3 kg más de 4 veces/minuto.</span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-g-20 bg-white p-4 shadow-sm transition-colors hover:bg-g-5">
          <input
            type="checkbox"
            checked={datos.esfuerzoManos.manipulacionPinzaMayor1kg}
            onChange={(e) => handleChangeEsfuerzo('manipulacionPinzaMayor1kg', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-g-30 text-primary focus:ring-primary"
          />
          <span className="text-sm text-g-90">Manipulación con pinza de objetos mayores a 1 kg.</span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-g-20 bg-white p-4 shadow-sm transition-colors hover:bg-g-5">
          <input
            type="checkbox"
            checked={datos.esfuerzoManos.munecasFlexionadasAgarre}
            onChange={(e) => handleChangeEsfuerzo('munecasFlexionadasAgarre', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-g-30 text-primary focus:ring-primary"
          />
          <span className="text-sm text-g-90">Muñecas flexionadas, extendidas, giradas o lateralizadas realizando agarre de fuerza.</span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-g-20 bg-white p-4 shadow-sm transition-colors hover:bg-g-5">
          <input
            type="checkbox"
            checked={datos.esfuerzoManos.accionAtornillar}
            onChange={(e) => handleChangeEsfuerzo('accionAtornillar', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-g-30 text-primary focus:ring-primary"
          />
          <span className="text-sm text-g-90">Acción de atornillar de forma intensa.</span>
        </label>
      </div>

      <div className="flex flex-col gap-4">
        <h4 className="font-semibold text-g-80 border-b border-g-20 pb-2">Movimientos repetitivos de alta frecuencia</h4>
        
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-g-20 bg-white p-4 shadow-sm transition-colors hover:bg-g-5">
          <input
            type="checkbox"
            checked={datos.movimientosAltaFrecuencia.repiteMovimiento4vecesMinuto2horas}
            onChange={(e) => handleChangeMovimiento('repiteMovimiento4vecesMinuto2horas', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-g-30 text-primary focus:ring-primary"
          />
          <span className="text-sm text-g-90">El trabajador repite el mismo movimiento muscular más de 4 veces por minuto durante más de 2 horas al día.</span>
        </label>
      </div>
    </div>
  );
}
