import { useEffect, useRef, useState, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const bloqueosScroll = new Set<symbol>();
let overflowAnterior = '';

export function DialogoErgo({ titulo, children, onCerrar, sucio = false, bloqueado = false, amplio = false }: {
  titulo: string; children: (cerrar: () => void) => ReactNode; onCerrar: () => void; sucio?: boolean; bloqueado?: boolean; amplio?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [confirmar, setConfirmar] = useState(false);
  const cerrar = () => { if (bloqueado) return; if (sucio) setConfirmar(true); else onCerrar(); };
  useEffect(() => {
    const dialogo = ref.current!;
    const previo = document.activeElement as HTMLElement | null;
    const bloqueo = Symbol('dialogo-ergonomia');
    if (bloqueosScroll.size === 0) overflowAnterior = document.body.style.overflow;
    bloqueosScroll.add(bloqueo);
    document.body.style.overflow = 'hidden';
    dialogo.showModal();
    return () => {
      dialogo.close();
      bloqueosScroll.delete(bloqueo);
      if (bloqueosScroll.size === 0) document.body.style.overflow = overflowAnterior;
      previo?.focus();
    };
  }, []);
  useEffect(() => {
    if (!sucio && !bloqueado) return;
    const proteger = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', proteger);
    return () => window.removeEventListener('beforeunload', proteger);
  }, [sucio, bloqueado]);
  return createPortal(<>
    <dialog ref={ref} aria-labelledby={id} className={`ergo er-dialog ${amplio ? 'er-dialog-wide' : ''}`}
      onCancel={e => { e.preventDefault(); cerrar(); }}
      onClick={e => { if (e.target === e.currentTarget) cerrar(); }}>
      <div className="er-dialog-inner">
        <span id={id} className="sr-only">{titulo}</span>
        {children(cerrar)}
      </div>
    </dialog>
    {confirmar && <DialogoErgo titulo="Cambios sin guardar" onCerrar={() => setConfirmar(false)}>
      {seguir => <div className="er-modal-body">
        <p className="er-eyebrow">Antes de salir</p><h2>Cambios sin guardar</h2>
        <p className="er-muted">Si sales ahora, se perderán los cambios de esta sesión.</p>
        <div className="er-actions er-modal-actions">
          <button className="er-button er-button-danger" onClick={onCerrar}>Descartar y salir</button>
          <button className="er-button er-button-primary" autoFocus onClick={seguir}>Seguir editando</button>
        </div>
      </div>}
    </DialogoErgo>}
  </>, document.body);
}
export function SiNo({ valor, onChange, etiqueta }: { valor: boolean | null; onChange: (v: boolean | null) => void; etiqueta: string }) {
  const id = useId();
  return <fieldset className="er-choice"><legend className="sr-only">{etiqueta}</legend>
    <div className="er-choice-options">{[true, false].map(v => <label key={String(v)} className={valor === v ? 'is-selected' : ''}>
      <input type="radio" name={id} value={String(v)} checked={valor === v} onChange={() => onChange(v)} />{v ? 'Sí' : 'No'}
    </label>)}</div>
    {valor === null ? <span className="er-choice-help">Sin responder</span> : <button type="button" className="er-choice-help" onClick={() => onChange(null)}>Quitar respuesta</button>}
  </fieldset>;
}
export function CabeceraSeccion({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return <div className="er-section-heading"><h3>{titulo}</h3><p className="er-muted">{descripcion}</p></div>;
}
