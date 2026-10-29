import AbrirFicha from '../componentes/AbrirFicha';
import TablaEvaluaciones from '../componentes/TablaEvaluaciones';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import { obtenerEmpresaErgo, obtenerFichasErgo, type EmpresaErgo, type FichaErgo } from '../servicios/ergo.api';
import { mensajeError } from '../utilidades/presentacion';
import { normalizarFicha, resumenFicha, type SeccionFicha } from '../utilidades/ficha';
import '../ergonomia.css';
import AccesoErgonomia from '../componentes/AccesoErgonomia';

function EspacioEmpresa({ id }: { id: string }) {
  const [empresa, setEmpresa] = useState<EmpresaErgo>();
  const [fichas, setFichas] = useState<FichaErgo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
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
    {cargando ? <p className="er-empty er-muted" role="status">Cargando fichas…</p>
      : error ? <div className="er-surface er-empty"><p role="alert" className="er-notice er-notice-error">{error}</p><button className="er-button" onClick={() => setRevision(v => v + 1)}>Reintentar</button></div>
      : <TablaEvaluaciones filas={fichas.map(ficha => ({ ficha, empresa }))} onAbrir={(f, editar) => setSeleccion({ id: f.id, inicial: editar ? 'datos' : 'resumen' })} />}
    {empresa && seleccion && <AbrirFicha empresa={empresa} seleccion={seleccion} onCerrar={() => { setSeleccion(undefined); }} onGuardado={f => {
      setFichas(prev => [f, ...prev.filter(x => x.id !== f.id)]); setSeleccion(undefined); setAviso(`Ficha «${f.nombre}» guardada. Puedes retomar sus secciones cuando lo necesites.`);
    }} />}
  </div></div>;
}
export default function PaginaEmpresaErgo() { const { empresaId = '' } = useParams(); return <AccesoErgonomia><EspacioEmpresa key={empresaId} id={empresaId} /></AccesoErgonomia>; }
