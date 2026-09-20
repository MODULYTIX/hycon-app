import { useState } from 'react';
import Modal from '@/shared/ui/organismos/Modal';
import { type FormularioFichaErgonomica, FICHA_VACIA } from '@/features/software-ergonomico/tipos/ficha.tipos';
import Paso1Administrativo from './Paso1Administrativo';
import Paso2Representatividad from './Paso2Representatividad';
import Paso3PosturasForzadas from './Paso3PosturasForzadas';
import Paso4ManipulacionCargas from './Paso4ManipulacionCargas';
import Paso5MovimientosRepetitivos from './Paso5MovimientosRepetitivos';
import Paso6Resumen from './Paso6Resumen';
import { Icon } from '@iconify/react';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

const NOMBRES_PASOS = [
  'Administrativa',
  'Representatividad',
  'Posturas Forzadas',
  'Manipulación Cargas',
  'Movs. Repetitivos',
  'Resumen',
];

export default function ModalRegistroFicha({ abierto, onCerrar }: Props) {
  const [pasoActual, setPasoActual] = useState(0);
  const [datosFicha, setDatosFicha] = useState<FormularioFichaErgonomica>(FICHA_VACIA);

  const irSiguientePaso = () => {
    if (pasoActual < 5) setPasoActual(pasoActual + 1);
  };

  const irPasoAnterior = () => {
    if (pasoActual > 0) setPasoActual(pasoActual - 1);
  };

  const manejarGuardado = () => {
    // Aquí iría el envío al endpoint
    console.log('Ficha guardada:', datosFicha);
    onCerrar();
    // Reiniciar form
    setTimeout(() => {
      setPasoActual(0);
      setDatosFicha(FICHA_VACIA);
    }, 300);
  };

  const manejarCancelar = (solicitarCierre: () => void) => {
    solicitarCierre();
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      idTitulo="modal-registro-ficha"
      ancho="max-w-[720px]"
      protegido={pasoActual > 0} // protejo si ya avanzaron al menos un paso
    >
      {(solicitarCierre) => (
        <div className="flex max-h-[85vh] flex-col bg-g-5">
          {/* Header del Modal */}
          <div className="border-b border-g-20 bg-white px-6 py-4 shadow-sm">
            <h2 id="modal-registro-ficha" className="text-xl font-bold text-g-90">
              Registrar Ficha Ergonómica
            </h2>
            <div className="mt-4 flex w-full items-center justify-between">
              {NOMBRES_PASOS.map((nombre, i) => (
                <div key={nombre} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full items-center justify-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors
                        ${i < pasoActual ? 'bg-primary text-white' : i === pasoActual ? 'border-2 border-primary text-primary' : 'bg-g-20 text-g-50'}
                      `}
                    >
                      {i < pasoActual ? <Icon icon="solar:check-read-bold" width="20" height="20" /> : i + 1}
                    </div>
                    {i < NOMBRES_PASOS.length - 1 && (
                      <div className={`h-[2px] flex-1 ${i < pasoActual ? 'bg-primary' : 'bg-g-20'}`} />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium sm:text-xs text-center leading-tight ${i <= pasoActual ? 'text-g-90' : 'text-g-50'}`}>
                    {nombre}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cuerpo - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {pasoActual === 0 && (
              <Paso1Administrativo 
                datos={datosFicha.paso1} 
                onChange={(nuevosDatos) => setDatosFicha({ ...datosFicha, paso1: nuevosDatos })} 
              />
            )}
            {pasoActual === 1 && (
              <Paso2Representatividad 
                datos={datosFicha.paso2} 
                onChange={(nuevosDatos) => setDatosFicha({ ...datosFicha, paso2: nuevosDatos })}
                frecuenciaPaso1={datosFicha.paso1.frecuencia}
              />
            )}
            {pasoActual === 2 && (
              <Paso3PosturasForzadas 
                datos={datosFicha.paso3} 
                onChange={(nuevosDatos) => setDatosFicha({ ...datosFicha, paso3: nuevosDatos })} 
              />
            )}
            {pasoActual === 3 && (
              <Paso4ManipulacionCargas 
                datos={datosFicha.paso4} 
                onChange={(nuevosDatos) => setDatosFicha({ ...datosFicha, paso4: nuevosDatos })} 
              />
            )}
            {pasoActual === 4 && (
              <Paso5MovimientosRepetitivos 
                datos={datosFicha.paso5} 
                onChange={(nuevosDatos) => setDatosFicha({ ...datosFicha, paso5: nuevosDatos })} 
              />
            )}
            {pasoActual === 5 && (
              <Paso6Resumen 
                datos={datosFicha} 
              />
            )}
          </div>

          {/* Footer - Fijo */}
          <div className="flex items-center justify-between border-t border-g-20 bg-white px-6 py-4">
            <button
              type="button"
              onClick={pasoActual === 0 ? () => manejarCancelar(solicitarCierre) : irPasoAnterior}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-g-70 transition-colors hover:bg-g-10"
            >
              {pasoActual === 0 ? 'Cancelar' : 'Anterior'}
            </button>
            <div className="flex gap-3">
              {pasoActual === 5 && (
                <button
                  type="button"
                  className="rounded-lg border border-g-30 bg-white px-4 py-2.5 text-sm font-medium text-g-70 transition-colors hover:bg-g-10"
                  onClick={manejarGuardado}
                >
                  Guardar y continuar
                </button>
              )}
              <button
                type="button"
                onClick={pasoActual === 5 ? manejarGuardado : irSiguientePaso}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                {pasoActual === 5 ? 'Guardar ficha' : 'Siguiente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
