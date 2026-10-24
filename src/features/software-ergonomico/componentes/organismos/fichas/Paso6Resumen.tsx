import type { FormularioFichaErgonomica } from '../../../tipos/ficha.tipos';
import { resumenFicha, resultadosFicha, GRUPOS, motivoFactor, numeroValido, type SeccionFicha } from '../../../utilidades/ficha';

export default function Paso6Resumen({ datos, onEditar }: { datos: FormularioFichaErgonomica; onEditar: (s: SeccionFicha) => void }) {
  const resumen = resumenFicha(datos);
  const generales = [
    ['Área', datos.paso1.area], ['Tarea / puesto', datos.paso1.puesto], ['Actividad', datos.paso1.actividad],
    ['Superintendencia', datos.paso1.superintendencia], ['Gerencia', datos.paso1.gerencia],
  ];
  return <>
    <div className="er-stats">
      <div className="er-stat"><strong>{resumen.evaluar.length}</strong><span>Factores a evaluar</span></div>
      <div className="er-stat"><strong>{resumen.pendientes.length}</strong><span>Factores por completar</span></div>
      <div className="er-stat"><strong>{resumen.resultadosPendientes.length}</strong><span>Resultados pendientes</span></div>
    </div>
    <div className="er-notice"><strong>{resumen.estado}</strong><p>Puedes guardar la ficha y continuar después. Este resumen refleja las respuestas registradas, no una conclusión de ausencia de riesgo.</p></div>
    <section className="er-summary-block">
      <header><h4>Datos administrativos</h4><button className="er-link" onClick={() => onEditar('datos')}>Editar datos</button></header>
      <dl className="er-summary-dl">{generales.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v || 'Sin registrar'}</dd></div>)}
        <div className="er-field-wide"><dt>Resumen del puesto</dt><dd>{datos.paso1.resumenPuesto || 'Sin registrar'}</dd></div>
      </dl>
    </section>
    <section className="er-summary-block">
      <header><h4>Representatividad</h4><button className="er-link" onClick={() => onEditar('tarea')}>Editar tarea</button></header>
      <dl className="er-summary-dl">
        <div><dt>Duración diaria</dt><dd>{datos.paso2.duracionMinutos !== '' ? datos.paso2.duracionMinutos + ' min' : 'Sin registrar'}</dd></div>
        <div><dt>Actividad cotidiana</dt><dd>{datos.paso2.cotidiana === null ? 'Sin responder' : datos.paso2.cotidiana ? 'Sí' : 'No'}</dd></div>
        <div><dt>Criterio general</dt><dd>{!numeroValido(datos.paso2.duracionMinutos, 1440) || datos.paso2.cotidiana === null ? 'Pendiente' : datos.paso2.requiereIdentificacion ? 'Cumple' : 'No cumple'}</dd></div>
      </dl>
    </section>
    <section className="er-summary-block">
      <header><h4>Factores que requieren evaluación</h4><span className="er-tag er-tag-risk">{resumen.evaluar.length}</span></header>
      {!resumen.evaluar.length && <p className="er-muted">Ninguna respuesta registrada activa un criterio de evaluación.</p>}
      {resumen.evaluar.map(f => <div className="er-summary-factor" key={f.id}><div><span>{f.titulo}</span><p>{GRUPOS[f.grupo]} · {motivoFactor(f)}</p></div><button className="er-link" aria-label={`Revisar ${f.titulo}`} onClick={() => onEditar(f.grupo)}>Revisar<span className="sr-only"> {f.titulo}</span></button></div>)}
      {!!resumen.pendientes.length && <details><summary>{resumen.pendientes.length} factores pendientes de respuesta o duración</summary>
        {resumen.pendientes.map(f => <div className="er-summary-factor" key={f.id}><span>{f.titulo}</span><button className="er-link" aria-label={`Completar ${f.titulo}`} onClick={() => onEditar(f.grupo)}>Completar<span className="sr-only"> {f.titulo}</span></button></div>)}
      </details>}
      <details><summary>Ver todas las respuestas ({resumen.factores.length})</summary>
        {resumen.factores.map(f => <div className="er-summary-factor" key={f.id}><span>{f.titulo}</span><span>{f.valor.aplica === null ? 'Sin responder' : f.valor.aplica === false ? 'No' : f.soloSiNo ? 'Sí' : f.valor.duracionDiaria === '' ? 'Sí · minutos pendientes' : `Sí · ${f.valor.duracionDiaria} min`}</span></div>)}
      </details>
    </section>
    <section className="er-summary-block">
      <header><h4>Resultados de evaluación</h4><span className="er-tag">Opcionales</span></header>
      {resultadosFicha(datos).map(r => {
        const activa = resumen.evaluar.some(f => f.grupo === r.grupo);
        return <div className="er-summary-factor" key={r.grupo}><div><strong>{r.titulo}</strong>
          {!activa && <p>No activada por las respuestas actuales.</p>}
          {r.campos.map(c => <p key={c.id}>{c.etiqueta}: {c.valor === '' ? 'Pendiente' : `${c.valor} · ${numeroValido(c.valor) ? r.clasificar(Number(c.valor)).etiqueta : 'Valor inválido'}`}</p>)}
        </div><button className="er-link" aria-label={`Revisar ${r.titulo}`} onClick={() => onEditar(r.grupo)}>Revisar<span className="sr-only"> {r.titulo}</span></button></div>;
      })}
    </section>
  </>;
}
