import Selector from '@/shared/ui/moleculas/Selector';
import EntradaBase from '@/shared/ui/atomos/EntradaBase';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import { obtenerEmpresaErgo, obtenerFichasErgo, obtenerFichaErgo, type EmpresaErgo, type FichaErgo } from '../servicios/ergo.api';
import { DialogoErgo } from '../componentes/ErgoUI';
import { fechaErgo, mensajeError } from '../utilidades/presentacion';
import ModalRegistroFicha from '../componentes/organismos/fichas/ModalRegistroFicha';
import { normalizarFicha, resumenFicha, type SeccionFicha } from '../utilidades/ficha';
import '../ergonomia.css';
import AccesoErgonomia from '../componentes/AccesoErgonomia';

function AbrirFicha({ empresa, seleccion, onCerrar, onGuardado }: { empresa: EmpresaErgo; seleccion: { id?: string; inicial: SeccionFicha }; onCerrar: () => void; onGuardado: (f: FichaErgo) => void }) {
  const [ficha, setFicha] = useState<FichaErgo>();
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!seleccion.id) return;
    const c = new AbortController(); setError('');
    obtenerFichaErgo(empresa.id, seleccion.id, c.signal).then(setFicha).catch(e => { if (!c.signal.aborted) setError(mensajeError(e)); });
    return () => c.abort();
  }, [empresa.id, seleccion.id, revision]);
  if (seleccion.id && !ficha) return <DialogoErgo titulo="Abrir ficha" onCerrar={onCerrar}>{cerrar => <div className="er-modal-body">
    <h2>Abrir ficha</h2>{error ? <p role="alert" className="er-notice er-notice-error">{error}</p> : <p role="status" className="er-muted">Cargando la última versión…</p>}
    <div className="er-actions er-modal-actions"><button className="er-button" onClick={cerrar}>Cerrar</button>{error && <button className="er-button er-button-primary" onClick={() => setRevision(v => v + 1)}>Reintentar</button>}</div>
  </div>}</DialogoErgo>;
  return <ModalRegistroFicha empresa={empresa} ficha={ficha} inicial={seleccion.inicial} onCerrar={onCerrar} onGuardado={onGuardado} />;
}
function EspacioEmpresa({ id }: { id: string }) {
  const [empresa, setEmpresa] = useState<EmpresaErgo>();
  const [fichas, setFichas] = useState<FichaErgo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [seleccion, setSeleccion] = useState<{ id?: string; inicial: SeccionFicha }>();
  const [aviso, setAviso] = useState('');
  useEffect(() => {
    const c = new AbortController(); setCargando(true); setError('');
    Promise.all([obtenerEmpresaErgo(id, c.signal), obtenerFichasErgo(id, c.signal)])
      .then(([e, f]) => { setEmpresa(e); setFichas(f); })
      .catch(e => { if (!c.signal.aborted) setError(mensajeError(e)); })
      .finally(() => { if (!c.signal.aborted) setCargando(false); });
    return () => c.abort();
  }, [id, revision]);
  const filas = fichas.map(f => ({ ...f, datos: normalizarFicha(f.payload), resumen: resumenFicha(normalizarFicha(f.payload)) }));
  const visibles = filas.filter(f => (!estado || estado === f.resumen.estado) && [f.nombre, f.datos.paso1.puesto, f.datos.paso1.area].join(' ').toLocaleLowerCase().includes(busqueda.trim().toLocaleLowerCase()));
  return <div className="ergo"><div className="er-page">
    <Link className="er-back" to={RUTAS.softwareErgonomico}>← Todas las empresas</Link>
    <header className="er-page-heading"><div><p className="er-eyebrow">Ergonomía / Espacio de empresa</p><h1>{empresa?.nombre || 'Fichas ergonómicas'}</h1><p className="er-muted">Registra, revisa y completa las evaluaciones de cada puesto.</p></div>
      <button className="er-button er-button-primary" disabled={!empresa || cargando || !!error} onClick={() => setSeleccion({ inicial: 'datos' })}>＋ Nueva ficha</button>
    </header>
    {aviso && <p role="status" className="er-notice" style={{ marginBottom: 20 }}>{aviso}</p>}
    {!cargando && !error && <div className="er-stats">
      <div className="er-stat"><strong>{fichas.length}</strong><span>Fichas registradas</span></div>
      <div className="er-stat"><strong>{filas.filter(f => f.resumen.estado !== 'Registro completo').length}</strong><span>Con información pendiente</span></div>
      <div className="er-stat"><strong>{filas.reduce((s, f) => s + f.resumen.evaluar.length, 0)}</strong><span>Factores a evaluar</span></div>
    </div>}
    <section className="er-surface" aria-label="Fichas de la empresa">
      <div className="er-toolbar"><h2 style={{ fontSize: 16 }}>Fichas ergonómicas</h2><div className="er-actions">
        <label><span className="sr-only">Buscar ficha</span><EntradaBase type="search"  placeholder="Buscar ficha, puesto o área…" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label>
        <label><span className="sr-only">Filtrar estado</span><Selector aria-label="Filtrar estado" value={estado} onChange={setEstado} opciones={[{ valor: '', etiqueta: 'Todos los estados' }, ...['En registro', 'Evaluación pendiente', 'Registro completo'].map(valor => ({ valor, etiqueta: valor }))]} /></label>
      </div></div>
      {cargando ? <p className="er-empty er-muted" role="status">Cargando fichas…</p>
        : error ? <div className="er-empty"><p role="alert" className="er-notice er-notice-error">{error}</p><button className="er-button" onClick={() => setRevision(v => v + 1)}>Reintentar</button></div>
        : !visibles.length ? <div className="er-empty"><h3>{fichas.length ? 'No hay coincidencias' : 'Empieza por un puesto de trabajo'}</h3><p className="er-muted">{fichas.length ? 'Ajusta la búsqueda o el filtro para ver más fichas.' : 'Crea una ficha y completa sus secciones a tu ritmo. Puedes guardar el avance en cualquier momento.'}</p><button className="er-button" onClick={() => { if (fichas.length) { setBusqueda(''); setEstado(''); } else setSeleccion({ inicial: 'datos' }); }}>{fichas.length ? 'Limpiar filtros' : 'Crear primera ficha'}</button></div>
        : <><div className="er-row er-table-head" aria-hidden><span>Ficha / puesto</span><span>Estado</span><span>Última actualización</span><span>Acciones</span></div>
          <ul>{visibles.map(f => <li className="er-row" key={f.id}>
            <div><h3>{f.nombre}</h3><p className="er-muted">{f.datos.paso1.area || 'Área por definir'} · {f.resumen.evaluar.length} factores a evaluar</p></div>
            <span className={`er-tag ${f.resumen.estado === 'Registro completo' ? 'er-tag-ok' : 'er-tag-pending'}`}>{f.resumen.estado}</span>
            <time className="er-muted" dateTime={f.actualizada}>{fechaErgo(f.actualizada)}</time>
            <div className="er-actions"><button className="er-link" onClick={() => setSeleccion({ id: f.id, inicial: 'resumen' })}>Resumen<span className="sr-only"> de {f.nombre}</span></button><button className="er-button" onClick={() => setSeleccion({ id: f.id, inicial: 'datos' })}>Editar<span className="sr-only"> {f.nombre}</span></button></div>
          </li>)}</ul></>}
    </section>
    {empresa && seleccion && <AbrirFicha empresa={empresa} seleccion={seleccion} onCerrar={() => setSeleccion(undefined)} onGuardado={f => {
      setFichas(prev => [f, ...prev.filter(x => x.id !== f.id)]); setSeleccion(undefined); setAviso(`Ficha «${f.nombre}» guardada. Puedes retomar sus secciones cuando lo necesites.`);
    }} />}
  </div></div>;
}
export default function PaginaEmpresaErgo() { const { empresaId = '' } = useParams(); return <AccesoErgonomia><EspacioEmpresa key={empresaId} id={empresaId} /></AccesoErgonomia>; }
