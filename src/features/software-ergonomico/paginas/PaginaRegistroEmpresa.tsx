import EvaluacionesEmpresas from '../componentes/EvaluacionesEmpresas';
import EntradaBase from '@/shared/ui/atomos/EntradaBase';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerEmpresasErgo, crearEmpresaErgo, type EmpresaErgo } from '../servicios/ergo.api';
import { DialogoErgo } from '../componentes/ErgoUI';
import { fechaErgo, mensajeError } from '../utilidades/presentacion';
import { rutaEmpresaErgo } from '@/app/rutas/rutas';
import '../ergonomia.css';
import AccesoErgonomia from '../componentes/AccesoErgonomia';

function NuevaEmpresa({ onCerrar, onCreada }: { onCerrar: () => void; onCreada: (e: EmpresaErgo) => void }) {
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const enviando = useRef(false);
  return <DialogoErgo titulo="Registrar empresa" sucio={nombre.length > 0} bloqueado={guardando} onCerrar={onCerrar}>
    {cerrar => <form className="er-modal-body" onSubmit={async e => {
      e.preventDefault();
      if (enviando.current) return;
      if (nombre.trim().length < 2) { setError('Escribe al menos 2 caracteres para el nombre.'); return; }
      enviando.current = true; setGuardando(true); setError('');
      try { onCreada(await crearEmpresaErgo(nombre.trim())); }
      catch (fallo) { setError(mensajeError(fallo)); }
      finally { enviando.current = false; setGuardando(false); }
    }}>
      <p className="er-eyebrow">Organización del trabajo</p><h2>Registrar empresa</h2>
      <p className="er-muted">Cada empresa tiene su propio espacio para organizar las fichas de sus puestos de trabajo.</p>
      <label className="er-field">Nombre de la empresa
        <EntradaBase autoFocus  placeholder="Ej. Industrias del Sur S.A.C." maxLength={150} value={nombre} disabled={guardando} onChange={e => setNombre(e.target.value)} required />
      </label>
      {error && <p className="er-notice er-notice-error" role="alert" style={{ marginTop: 16 }}>{error}</p>}
      <div className="er-actions er-modal-actions"><button type="button" className="er-button" disabled={guardando} onClick={cerrar}>Cancelar</button><button className="er-button er-button-primary" disabled={guardando}>{guardando ? 'Registrando…' : 'Registrar empresa'}</button></div>
    </form>}
  </DialogoErgo>;
}

function RegistroEmpresas() {
  const [vista, setVista] = useState<'evaluaciones' | 'empresas'>('evaluaciones');
  const [empresas, setEmpresas] = useState<EmpresaErgo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [nueva, setNueva] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [aviso, setAviso] = useState('');
  useEffect(() => {
    const controller = new AbortController(); setCargando(true); setError('');
    obtenerEmpresasErgo(controller.signal).then(setEmpresas).catch(e => { if (!controller.signal.aborted) setError(mensajeError(e)); }).finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [revision]);
  const visibles = empresas.filter(e => e.nombre.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase().trim()));
  return <div className="ergo"><div className="er-page">
    <header className="er-page-heading">
      <div><p className="er-eyebrow">Hycon / Ergonomía</p><h1>Empresas y evaluaciones</h1><p className="er-muted">Consulta y filtra los resultados por empresa, área y puesto de trabajo.</p></div>
      <button className="er-button er-button-primary" onClick={() => setNueva(true)}><span aria-hidden>＋</span> Registrar empresa</button>
    </header>
    {aviso && <p className="er-notice" role="status" style={{ marginBottom: 20 }}>{aviso}</p>}
    {!cargando && !error && <div className="er-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <div className="er-stat"><strong>{empresas.length}</strong><span>Empresas registradas</span></div>
      <div className="er-stat"><strong>{empresas.reduce((s, e) => s + e.totalFichas, 0)}</strong><span>Fichas ergonómicas</span></div>
    </div>}
    <div className="er-vistas" role="group" aria-label="Vista del listado">
      <button type="button" aria-pressed={vista === 'evaluaciones'} onClick={() => setVista('evaluaciones')}>Evaluaciones</button>
      <button type="button" aria-pressed={vista === 'empresas'} onClick={() => setVista('empresas')}>Empresas</button>
    </div>
    {vista === 'evaluaciones' && !cargando && !error && <EvaluacionesEmpresas empresas={empresas} />}
    {(vista === 'empresas' || cargando || !!error) && <section className="er-surface" aria-label="Mis empresas">
      <div className="er-toolbar"><h2 style={{ fontSize: 16 }}>Mis empresas</h2><label className="er-search"><span className="sr-only">Buscar empresa</span><EntradaBase  type="search" placeholder="Buscar por nombre de empresa…" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label></div>
      {cargando ? <p className="er-empty er-muted" role="status">Cargando empresas…</p>
        : error ? <div className="er-empty"><p role="alert" className="er-notice er-notice-error">{error}</p><button className="er-button" onClick={() => setRevision(v => v + 1)}>Reintentar</button></div>
        : !visibles.length ? <div className="er-empty"><h3>{empresas.length ? 'No encontramos esa empresa' : 'Tu primera empresa, en un solo paso'}</h3><p className="er-muted">{empresas.length ? 'Prueba con otro nombre o limpia la búsqueda.' : 'Solo necesitas su nombre. Después podrás crear y retomar las fichas de cada puesto.'}</p><button className="er-button" onClick={() => empresas.length ? setBusqueda('') : setNueva(true)}>{empresas.length ? 'Limpiar búsqueda' : 'Registrar empresa'}</button></div>
        : <>
          <div className="er-row er-table-head" aria-hidden><span>Empresa</span><span>Fichas</span><span>Fecha de registro</span><span>Acceso</span></div>
          <ul>{visibles.map(e => <li key={e.id} className="er-row">
            <div className="er-company-title"><span className="er-company-mark" aria-hidden>{e.nombre.slice(0,2).toUpperCase()}</span><div><h3>{e.nombre}</h3><p className="er-muted">Espacio de evaluación</p></div></div>
            <span className="er-tag">{e.totalFichas} {e.totalFichas === 1 ? 'ficha' : 'fichas'}</span>
            <time className="er-muted" dateTime={e.fecha}>{fechaErgo(e.fecha)}</time>
            <Link className="er-button" to={rutaEmpresaErgo(e.id)} aria-label={`Abrir empresa ${e.nombre}`}>Abrir empresa <span aria-hidden>→</span></Link>
          </li>)}</ul>
        </>}
    </section>}
    {nueva && <NuevaEmpresa onCerrar={() => setNueva(false)} onCreada={e => { setEmpresas(prev => [e, ...prev]); setNueva(false); setVista('empresas'); setAviso(`Empresa «${e.nombre}» registrada. Abre su espacio para crear una ficha.`); }} />}
  </div></div>;
}

export default function PaginaRegistroEmpresa() {
  return <AccesoErgonomia><RegistroEmpresas /></AccesoErgonomia>;
}
