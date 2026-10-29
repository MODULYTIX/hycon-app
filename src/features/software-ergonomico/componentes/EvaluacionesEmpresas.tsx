import { useEffect, useState } from 'react';
import { obtenerFichasErgo, type EmpresaErgo } from '../servicios/ergo.api';
import { mensajeError } from '../utilidades/presentacion';
import AbrirFicha from './AbrirFicha';
import type { SeccionFicha } from '../utilidades/ficha';
import TablaEvaluaciones, { type FilaEvaluacion } from './TablaEvaluaciones';

export default function EvaluacionesEmpresas({ empresas }: { empresas: EmpresaErgo[] }) {
  const [filas, setFilas] = useState<FilaEvaluacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [seleccion, setSeleccion] = useState<{ id: string; empresa: EmpresaErgo; inicial: SeccionFicha }>();
  const [aviso, setAviso] = useState('');
  useEffect(() => {
    const c = new AbortController(); setCargando(true); setError('');
    Promise.all(empresas.map(async empresa => (await obtenerFichasErgo(empresa.id, c.signal)).map(ficha => ({ ficha, empresa }))))
      .then(resultados => { if (!c.signal.aborted) setFilas(resultados.flat()); })
      .catch(e => { if (!c.signal.aborted) setError(mensajeError(e)); })
      .finally(() => { if (!c.signal.aborted) setCargando(false); });
    return () => c.abort();
  }, [empresas, revision]);
  if (cargando) return <div className="er-surface er-empty"><p role="status">Cargando las evaluaciones de tus empresas…</p></div>;
  if (error) return <div className="er-surface er-empty"><p role="alert" className="er-notice er-notice-error">{error}</p><button className="er-button" onClick={() => setRevision(v => v + 1)}>Reintentar</button></div>;
  return <>
    {aviso && <p className="er-notice" role="status" style={{ marginBottom: 16 }}>{aviso}</p>}
    <TablaEvaluaciones filas={filas} todasEmpresas onAbrir={(f, editar) => {
      const empresa = empresas.find(e => e.id === f.empresaId);
      if (empresa) setSeleccion({ id: f.id, empresa, inicial: editar ? 'datos' : 'resumen' });
    }} />
    {seleccion && <AbrirFicha empresa={seleccion.empresa} seleccion={seleccion} onCerrar={() => setSeleccion(undefined)} onGuardado={f => {
      setFilas(prev => prev.map(fila => fila.ficha.id === f.id && fila.ficha.empresaId === f.empresaId ? { ...fila, ficha: f } : fila));
      setSeleccion(undefined); setAviso(`Ficha «${f.nombre}» actualizada.`);
    }} />}
  </>;
}
