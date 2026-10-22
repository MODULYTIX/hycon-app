import EntradaBase from '@/shared/ui/atomos/EntradaBase';
import type { DatosRepresentatividad } from '../../../tipos/ficha.tipos';
import { SiNo } from '../../ErgoUI';
import { numeroValido } from '../../../utilidades/ficha';
export default function Paso2Representatividad({ datos, onChange }: { datos: DatosRepresentatividad; onChange: (d: DatosRepresentatividad) => void }) {
  const actualizar = (c: Partial<DatosRepresentatividad>) => {
    const nuevo = { ...datos, ...c };
    nuevo.duracionMayor120 = numeroValido(nuevo.duracionMinutos, 1440) && Number(nuevo.duracionMinutos) >= 120;
    nuevo.requiereIdentificacion = nuevo.duracionMayor120 && nuevo.cotidiana === true;
    onChange(nuevo);
  };
  const pendiente = !numeroValido(datos.duracionMinutos, 1440) || datos.cotidiana === null;
  return <div>
    <div className="er-grid-fields" style={{ marginBottom: 24 }}>
      <label className="er-field">Duración diaria de la tarea (min)
        <EntradaBase  type="number" min="0" max="1440" step="any" inputMode="decimal" placeholder="Ej. 180" value={datos.duracionMinutos} onChange={e => actualizar({ duracionMinutos: e.target.value })} />
      </label>
      <div className="er-field"><span>¿La actividad es cotidiana?</span><SiNo etiqueta="¿La actividad es cotidiana?" valor={datos.cotidiana} onChange={cotidiana => actualizar({ cotidiana })} /></div>
    </div>
    <div className={`er-notice ${!pendiente && datos.requiereIdentificacion ? 'er-notice-warning' : ''}`}>
      <strong>{pendiente ? 'Representatividad pendiente' : datos.requiereIdentificacion ? 'Corresponde identificar factores' : 'No cumple el criterio general de representatividad'}</strong>
      <p>{pendiente ? 'Completa la duración y la frecuencia para revisar el criterio.' : datos.requiereIdentificacion ? 'La tarea es cotidiana y dura 120 minutos o más al día.' : 'El criterio general requiere una tarea cotidiana con 120 minutos o más al día.'}</p>
    </div>
    <p className="er-muted" style={{ marginTop: 18 }}>Puedes revisar todas las secciones. Los factores con criterios propios, como vibración de mano-brazo o cargas de 40 kg, se evalúan de forma independiente.</p>
  </div>;
}
