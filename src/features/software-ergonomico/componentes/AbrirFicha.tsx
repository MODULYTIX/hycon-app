import { useEffect, useState } from 'react';
import { obtenerFichaErgo, type EmpresaErgo, type FichaErgo } from '../servicios/ergo.api';
import { DialogoErgo } from './ErgoUI';
import { mensajeError } from '../utilidades/presentacion';
import type { SeccionFicha } from '../utilidades/ficha';
import ModalRegistroFicha from './organismos/fichas/ModalRegistroFicha';

export default function AbrirFicha({ empresa, seleccion, onCerrar, onGuardado }: { empresa: EmpresaErgo; seleccion: { id?: string; inicial: SeccionFicha }; onCerrar: () => void; onGuardado: (f: FichaErgo) => void }) {
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
