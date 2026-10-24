import { Fragment, useState, type ReactNode } from 'react';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import ModalAcceso from '@/features/autenticacion/componentes/organismos/ModalAcceso';

export default function AccesoErgonomia({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAutenticacion();
  const [acceso, setAcceso] = useState(false);
  if (usuario) return <Fragment key={usuario.userId}>{children}</Fragment>;
  return <div className="ergo"><div className="er-page">
    <p className="er-eyebrow">Hycon / Ergonomía</p>
    <h1>Empresas y evaluaciones</h1>
    <div className="er-surface er-empty" style={{ marginTop: 24 }}>
      {cargando ? <p role="status" className="er-muted">Recuperando tu sesión…</p> : <>
        <h2>Tu espacio de evaluación</h2>
        <p className="er-muted">Inicia sesión para organizar tus empresas y retomar sus fichas ergonómicas.</p>
        <button className="er-button er-button-primary" onClick={() => setAcceso(true)}>Entrar a mi cuenta</button>
      </>}
    </div>
    <ModalAcceso abierto={acceso} onCerrar={() => setAcceso(false)} />
  </div></div>;
}
