import EntradaBase from '@/shared/ui/atomos/EntradaBase';
import type { FormularioFichaErgonomica } from '../../../tipos/ficha.tipos';
import { SiNo } from '../../ErgoUI';
import { actualizarFactor, factoresFicha, estadoFactor, criterioFactor, motivoFactor, resultadosFicha, numeroValido, type GrupoFactor } from '../../../utilidades/ficha';

export default function SeccionFactores({ grupo, datos, onChange }: { grupo: GrupoFactor; datos: FormularioFichaErgonomica; onChange: (d: FormularioFichaErgonomica) => void }) {
  const factores = factoresFicha(datos).filter(f => f.grupo === grupo);
  const activos = factores.filter(f => estadoFactor(f) === 'evaluar');
  const resultado = resultadosFicha(datos).find(r => r.grupo === grupo)!;
  const llave = grupo === 'posturas' ? 'posturaForzada' : grupo === 'cargas' ? 'levantamientoCargas' : 'movimientosRepetitivos';
  return <>
    <div className="er-factor-list">
      {factores.map(f => {
        const estado = estadoFactor(f);
        return <div className={`er-factor ${estado === 'evaluar' ? 'is-risk' : ''}`} key={f.id}>
          <div>
            <h4>{f.titulo}</h4>
            {f.detalle && <p>{f.detalle}</p>}
            <p>{criterioFactor(f)}</p>
            {estado === 'evaluar' && <><span className="er-tag er-tag-risk">Requiere evaluación</span><p>{motivoFactor(f)}</p></>}
            {estado === 'registrado' && <span className="er-tag">No alcanza el criterio</span>}
          </div>
          <SiNo etiqueta={f.titulo} valor={f.valor.aplica} onChange={aplica => onChange(actualizarFactor(datos, f, { ...f.valor, aplica, duracionDiaria: aplica === true ? f.valor.duracionDiaria : '' }))} />
          {!f.soloSiNo ? <label className="er-field">Duración diaria
            <div className="er-factor-minutes"><EntradaBase compacto aria-label={`Minutos: ${f.titulo}`}  type="number" inputMode="decimal" min="0" max="1440" step="any" placeholder={`Ej. ${f.umbral}`} disabled={f.valor.aplica !== true} value={f.valor.duracionDiaria} onChange={e => onChange(actualizarFactor(datos, f, { ...f.valor, duracionDiaria: e.target.value }))} /><span>min</span></div>
          </label> : <span className="er-muted" style={{ fontSize: 11 }}>Solo respuesta<br />Sí / No</span>}
        </div>;
      })}
    </div>
    <section className="er-results" aria-label={`Resultados de ${resultado.titulo}`}>
      <h4>{resultado.titulo} <span className="er-tag">Opcional</span></h4>
      <p className="er-muted" style={{ marginTop: 6 }}>{activos.length ? `${activos.length} ${activos.length === 1 ? 'factor activa' : 'factores activan'} estos resultados. Puedes guardarlos vacíos y completarlos después.` : 'Los resultados se habilitan cuando un factor alcanza su criterio. Las respuestas pendientes no equivalen a ausencia de riesgo.'}</p>
      <fieldset disabled={activos.length === 0} className="er-results-grid">
        <legend className="sr-only">Resultados opcionales</legend>
        {resultado.campos.map(c => {
          const etiqueta = { d: 'D', i: 'I', niosh: 'NIOSH', dx: 'DX', ix: 'IX' }[c.id] ?? c.etiqueta;
          const nivel = numeroValido(c.valor) ? resultado.clasificar(Number(c.valor)) : null;
          return <label className="er-field" key={c.id}>{etiqueta}
            <EntradaBase compacto aria-label={etiqueta}  type="number" min="0" step="any" inputMode="decimal" placeholder="Ej. 2.5" value={c.valor}
              onChange={e => onChange({ ...datos, evaluacion: { ...datos.evaluacion, [llave]: { ...datos.evaluacion[llave], [c.id]: e.target.value } } })} />
            {nivel ? <span className={`er-result-level ${nivel.insignia}`}>{nivel.etiqueta}</span> : <span className="er-muted" style={{ fontSize: 11 }}>Pendiente de registrar</span>}
          </label>;
        })}
      </fieldset>
      {!activos.length && resultado.campos.some(c => c.valor !== '') && <p className="er-muted" style={{ marginTop: 12 }}>Se conservan resultados anteriores. No hay factores que activen esta evaluación con las respuestas actuales.</p>}
    </section>
  </>;
}
