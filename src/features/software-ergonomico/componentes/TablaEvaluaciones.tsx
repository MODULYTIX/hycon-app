import { useMemo, useState } from 'react';
import EntradaBase from '@/shared/ui/atomos/EntradaBase';
import Selector from '@/shared/ui/moleculas/Selector';
import type { EmpresaErgo, FichaErgo } from '../servicios/ergo.api';
import { normalizarFicha, numeroValido, resultadosFicha, resumenFicha, type GrupoFactor } from '../utilidades/ficha';
import { fechaErgo } from '../utilidades/presentacion';

export interface FilaEvaluacion { ficha: FichaErgo; empresa?: EmpresaErgo }
const texto = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
const nombres: Record<GrupoFactor, string> = { posturas: 'Posturas forzadas', cargas: 'Levantamiento de cargas', repetitivos: 'Movimientos repetitivos' };
const abreviaturas: Record<string, string> = { d: 'D', i: 'I', niosh: 'NIOSH', dx: 'DX', ix: 'IX' };

export default function TablaEvaluaciones({ filas, todasEmpresas = false, onAbrir }: {
  filas: FilaEvaluacion[]; todasEmpresas?: boolean; onAbrir: (f: FichaErgo, editar: boolean) => void;
}) {
  const [buscar, setBuscar] = useState('');
  const [area, setArea] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [estado, setEstado] = useState('');
  const [evaluacion, setEvaluacion] = useState('');
  const [organizacion, setOrganizacion] = useState(false);
  const [orden, setOrden] = useState('recientes');
  const datos = useMemo(() => filas.map(f => {
    const d = normalizarFicha(f.ficha.payload);
    return { ...f, datos: d, resumen: resumenFicha(d), resultados: resultadosFicha(d) };
  }), [filas]);
  const areas = [...new Set(datos.filter(f => !empresa || f.ficha.empresaId === empresa).map(f => f.datos.paso1.area.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  const empresas = [...new Map(datos.filter(f => f.empresa).map(f => [f.empresa!.id, f.empresa!])).values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const visibles = datos.filter(f => {
    const p = f.datos.paso1;
    return (!empresa || f.ficha.empresaId === empresa) && (!area || p.area.trim() === area)
      && (!estado || f.resumen.estado === estado)
      && (!evaluacion || f.resumen.evaluar.some(r => r.grupo === evaluacion) || f.resultados.some(r => r.grupo === evaluacion && r.campos.some(c => numeroValido(c.valor))))
      && texto([f.ficha.nombre, f.empresa?.nombre, p.puesto, p.area, p.gerencia, p.superintendencia, p.actividad].join(' ')).includes(texto(buscar));
  }).sort((a, b) => orden === 'puesto' ? (a.datos.paso1.puesto || a.ficha.nombre).localeCompare(b.datos.paso1.puesto || b.ficha.nombre, 'es') : b.ficha.actualizada.localeCompare(a.ficha.actualizada));
  const limpiar = () => { setBuscar(''); setArea(''); setEmpresa(''); setEstado(''); setEvaluacion(''); };
  const filtrado = !!(buscar || area || empresa || estado || evaluacion);
  return <section className="er-surface er-evaluaciones" aria-label="Listado de evaluaciones">
    <div className="er-toolbar"><div><h2>Evaluaciones por puesto</h2><p className="er-muted">Una fila por ficha. Compara los resultados sin abrir cada evaluación.</p></div>
      <label className="er-column-toggle"><input type="checkbox" checked={organizacion} onChange={e => setOrganizacion(e.target.checked)} /> Mostrar superintendencia</label>
    </div>
    <div className="er-filtros-tabla">
      <label className="er-field er-buscar-tabla">Buscar<EntradaBase type="search" placeholder="Puesto, ficha, gerencia…" value={buscar} onChange={e => setBuscar(e.target.value)} /></label>
      {todasEmpresas && <label className="er-field">Empresa<Selector aria-label="Empresa" value={empresa} onChange={v => { setEmpresa(v); setArea(''); }} opciones={[{ valor: '', etiqueta: 'Todas las empresas' }, ...empresas.map(e => ({ valor: e.id, etiqueta: e.nombre }))]} /></label>}
      <label className="er-field">Área<Selector aria-label="Área" value={area} onChange={setArea} opciones={[{ valor: '', etiqueta: 'Todas las áreas' }, ...areas.map(a => ({ valor: a, etiqueta: a }))]} /></label>
      <label className="er-field">Evaluación<Selector aria-label="Evaluación" value={evaluacion} onChange={setEvaluacion} opciones={[{ valor: '', etiqueta: 'Todas las evaluaciones' }, ...Object.entries(nombres).map(([valor, etiqueta]) => ({ valor, etiqueta }))]} /></label>
      <label className="er-field">Estado<Selector aria-label="Estado" value={estado} onChange={setEstado} opciones={[{ valor: '', etiqueta: 'Todos los estados' }, ...['En registro', 'Evaluación pendiente', 'Registro completo'].map(v => ({ valor: v, etiqueta: v }))]} /></label>
    </div>
    <div className="er-tabla-meta"><span role="status">{visibles.length} de {filas.length} fichas{filtrado ? ' · Filtros aplicados' : ''}</span><div className="er-actions">{filtrado && <button className="er-link" onClick={limpiar}>Limpiar filtros</button>}<Selector aria-label="Ordenar fichas" value={orden} onChange={setOrden} opciones={[{ valor: 'recientes', etiqueta: 'Última actualización' }, { valor: 'puesto', etiqueta: 'Puesto: A a Z' }]} /></div></div>
    <p className="er-tabla-ayuda" id="ayuda-tabla-evaluaciones">Los colores indican el nivel de cada resultado registrado. «Pendiente» y «Sin criterio activado» no equivalen a riesgo bajo. En pantallas pequeñas, desliza la tabla para ver las columnas.</p>
    {visibles.length ? <div className="er-tabla-scroll" role="region" aria-label="Tabla comparativa de evaluaciones" tabIndex={0} aria-describedby="ayuda-tabla-evaluaciones">
      <table className="er-tabla-evaluaciones"><caption className="sr-only">Datos generales y resultados por ficha ergonómica</caption>
        <thead><tr><th scope="col">Tarea / puesto</th><th scope="col">Área / gerencia</th>{organizacion && <th scope="col">Superintendencia</th>}<th scope="col">Posturas forzadas<small>D / I</small></th><th scope="col">Levantamiento<small>NIOSH</small></th><th scope="col">Movimientos repetitivos<small>OCRA · DX / IX</small></th><th scope="col" className="er-col-estado">Estado</th><th scope="col" className="er-col-acciones">Acciones</th></tr></thead>
        <tbody>{visibles.map(f => <tr key={`${f.ficha.empresaId}-${f.ficha.id}`}>
          <th scope="row"><button className="er-puesto-link" onClick={() => onAbrir(f.ficha, false)}>{f.datos.paso1.puesto || f.ficha.nombre}</button>{todasEmpresas && <small>{f.empresa?.nombre || 'Empresa'}</small>}{f.ficha.nombre !== f.datos.paso1.puesto && <small>{f.ficha.nombre}</small>}<time dateTime={f.ficha.actualizada}>Actualizada {fechaErgo(f.ficha.actualizada)}</time></th>
          <td><strong>{f.datos.paso1.area || 'Sin área'}</strong><small>{f.datos.paso1.gerencia || 'Gerencia sin registrar'}</small></td>
          {organizacion && <td>{f.datos.paso1.superintendencia || 'Sin registrar'}</td>}
          {f.resultados.map(r => {
            const activo = f.resumen.evaluar.some(x => x.grupo === r.grupo);
            const tieneValor = r.campos.some(c => numeroValido(c.valor));
            return <td key={r.grupo}>{activo || tieneValor ? <div className="er-resultados-celda">{r.campos.map(c => {
              const nivel = numeroValido(c.valor) ? r.clasificar(Number(c.valor)) : null;
              return <span key={c.id} className={`er-valor-tabla ${nivel ? nivel.insignia : 'er-valor-pendiente'}`}><b>{abreviaturas[c.id]}</b><span>{nivel ? c.valor : 'Pendiente'}{nivel && <small>{nivel.etiqueta}</small>}</span></span>;
            })}{!activo && tieneValor && <small>Valor previo · sin criterio activado</small>}</div> : <span className="er-sin-resultado">{f.resumen.pendientes.some(x => x.grupo === r.grupo) ? 'Por identificar' : 'Sin criterio activado'}</span>}</td>;
          })}
          <td className="er-col-estado"><span className={`er-tag ${f.resumen.estado === 'Registro completo' ? 'er-tag-ok' : 'er-tag-pending'}`}>{f.resumen.estado}</span></td>
          <td className="er-col-acciones"><div className="er-tabla-acciones"><button type="button" className="er-tabla-icono" title="Ver resumen" onClick={() => onAbrir(f.ficha, false)} aria-label={`Ver resumen de ${f.ficha.nombre}`}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg></button><button type="button" className="er-tabla-icono" title="Editar ficha" onClick={() => onAbrir(f.ficha, true)} aria-label={`Editar ${f.ficha.nombre}`}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 4 4M4 20l4-1 12-12a2.8 2.8 0 0 0-4-4L4 15l-1 6Z" /></svg></button></div></td>
        </tr>)}</tbody>
      </table>
    </div> : <div className="er-empty"><h3>{filas.length ? 'No hay coincidencias' : 'Aún no hay fichas registradas'}</h3><p className="er-muted">{filas.length ? 'Prueba con otra búsqueda o ajusta los filtros.' : 'Abre una empresa y crea una ficha para ver aquí sus resultados.'}</p>{filtrado && <button className="er-button" onClick={limpiar}>Limpiar filtros</button>}</div>}
  </section>;
}
