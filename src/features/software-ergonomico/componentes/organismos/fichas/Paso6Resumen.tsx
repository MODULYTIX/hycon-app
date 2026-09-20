import type { FormularioFichaErgonomica } from '@/features/software-ergonomico/tipos/ficha.tipos';

interface Props {
  datos: FormularioFichaErgonomica;
}

export default function Paso6Resumen({ datos }: Props) {
  // Calculos simulados basados en las reglas provistas (Mocks temporales)
  
  const tienePosturaForzada = Object.values(datos.paso3).some(factor => factor.aplica);
  
  const tieneCargas = Object.values(datos.paso4).some(factor => factor.aplica);
  
  const tieneMovimientos = Object.values(datos.paso5.esfuerzoManos).some(val => val) || 
                           datos.paso5.movimientosAltaFrecuencia.repiteMovimiento4vecesMinuto2horas;

  const codigos = {
    movimientoRepetitivo: tieneMovimientos ? 'DX / IX' : 'Ninguno',
    posturaForzada: tienePosturaForzada ? 'D / I' : 'Ninguno',
    levantamientoCargas: tieneCargas ? 'NIOSH' : 'Ninguno',
    empujeTraccion: 'Ninguno', // No hay paso para esto aun, por defecto Ninguno
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-g-90">6. Resumen y Clasificación</h3>
        <p className="text-sm text-g-60">Revise la información y los factores detectados antes de guardar la ficha.</p>
      </div>

      {/* Resumen Administrativo */}
      <div className="rounded-xl border border-g-20 bg-white p-5 shadow-sm">
        <h4 className="mb-3 font-semibold text-g-90">Datos Generales</h4>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-g-50">Área</dt>
            <dd className="font-medium text-g-90 capitalize">{datos.paso1.area || '-'}</dd>
          </div>
          <div>
            <dt className="text-g-50">Puesto</dt>
            <dd className="font-medium text-g-90">{datos.paso1.puesto || '-'}</dd>
          </div>
          <div>
            <dt className="text-g-50">Identificación Req.</dt>
            <dd className="font-medium text-g-90">{datos.paso2.requiereIdentificacion ? 'Sí' : 'No'}</dd>
          </div>
        </dl>
      </div>

      {/* Códigos Detectados */}
      <div className="rounded-xl border border-g-20 bg-white p-5 shadow-sm">
        <h4 className="mb-3 font-semibold text-g-90">Factores Ergonómicos Detectados</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          
          <div className="flex items-center justify-between rounded-lg bg-g-5 px-4 py-3 border border-g-20">
            <span className="text-sm font-medium text-g-70">Postura Forzada</span>
            <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${tienePosturaForzada ? 'bg-primary/10 text-primary' : 'bg-g-20 text-g-60'}`}>
              {codigos.posturaForzada}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-g-5 px-4 py-3 border border-g-20">
            <span className="text-sm font-medium text-g-70">Levantamiento de Cargas</span>
            <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${tieneCargas ? 'bg-y-10 text-y-70' : 'bg-g-20 text-g-60'}`}>
              {codigos.levantamientoCargas}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-g-5 px-4 py-3 border border-g-20">
            <span className="text-sm font-medium text-g-70">Movimiento Repetitivo</span>
            <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${tieneMovimientos ? 'bg-red-50 text-red-700' : 'bg-g-20 text-g-60'}`}>
              {codigos.movimientoRepetitivo}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-g-5 px-4 py-3 border border-g-20">
            <span className="text-sm font-medium text-g-70">Empuje y Tracción</span>
            <span className="inline-flex rounded-md bg-g-20 px-2.5 py-1 text-xs font-semibold text-g-60">
              {codigos.empujeTraccion}
            </span>
          </div>

        </div>
        <p className="mt-4 text-xs text-g-50">
          * Estos códigos son generados automáticamente en base a las respuestas de los pasos anteriores.
        </p>
      </div>
    </div>
  );
}
