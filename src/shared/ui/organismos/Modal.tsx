import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@iconify/react';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  // Id del elemento que titula el dialogo, para lectores de pantalla
  idTitulo: string;
  // Con una funcion, el contenido recibe la forma protegida de cerrar (para su boton Cancelar)
  children: ReactNode | ((solicitarCierre: () => void) => ReactNode);
  // Si hay datos sin guardar, cerrar pide confirmacion antes de descartarlos
  protegido?: boolean;
  // Clase de ancho maximo del panel
  ancho?: string;
}

export default function Modal({
  abierto,
  onCerrar,
  idTitulo,
  children,
  protegido = false,
  ancho = 'max-w-[880px]',
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const botonSeguirRef = useRef<HTMLButtonElement>(null);
  const [confirmando, setConfirmando] = useState(false);

  // Se guardan en refs para que el efecto no se reinicie en cada render del padre:
  // si se reiniciara, volveria a mover el foco al panel mientras el usuario escribe.
  const onCerrarRef = useRef(onCerrar);
  const protegidoRef = useRef(protegido);
  const confirmandoRef = useRef(confirmando);
  onCerrarRef.current = onCerrar;
  protegidoRef.current = protegido;
  confirmandoRef.current = confirmando;

  const solicitarCierre = () => {
    if (protegidoRef.current) {
      setConfirmando(true);
    } else {
      onCerrarRef.current();
    }
  };
  const solicitarCierreRef = useRef(solicitarCierre);
  solicitarCierreRef.current = solicitarCierre;

  // Cerrar con Escape y bloquear el scroll del fondo mientras el modal esta abierto
  useEffect(() => {
    if (!abierto) {
      setConfirmando(false);
      return;
    }

    const alPulsarTecla = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return;
      // Con la confirmacion a la vista, Escape equivale a seguir editando
      if (confirmandoRef.current) {
        setConfirmando(false);
      } else {
        solicitarCierreRef.current();
      }
    };

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', alPulsarTecla);

    // Se mueve el foco al panel para que el teclado entre en el dialogo
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener('keydown', alPulsarTecla);
    };
  }, [abierto]);

  useEffect(() => {
    if (confirmando) botonSeguirRef.current?.focus();
  }, [confirmando]);

  if (!abierto) return null;

  const idConfirmacion = `${idTitulo}-confirmar`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-g-90/60 p-3 backdrop-blur-sm animate-fadeIn sm:p-4"
      onMouseDown={(evento) => {
        // Solo cierra si el clic empezo en el fondo, no al arrastrar desde dentro
        if (evento.target === evento.currentTarget) solicitarCierre();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className={`relative w-full ${ancho} overflow-hidden rounded-2xl bg-white shadow-2xl outline-none animate-modalIn`}
      >
        <button
          type="button"
          onClick={solicitarCierre}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-g-50 transition-colors hover:bg-g-10 hover:text-g-80"
        >
          <Icon icon="solar:close-circle-linear" width="22" height="22" />
        </button>

        {typeof children === 'function' ? children(solicitarCierre) : children}

        {confirmando && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 p-4 animate-fadeIn">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={idConfirmacion}
              aria-describedby={`${idConfirmacion}-detalle`}
              className="w-full max-w-[380px] rounded-xl border border-g-20 bg-white p-6 shadow-xl animate-modalIn"
            >
              <span
                aria-hidden
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-y-5 text-y-60"
              >
                <Icon icon="solar:danger-triangle-bold" width="22" height="22" />
              </span>
              <h3 id={idConfirmacion} className="text-[18px] font-semibold text-g-90">
                Tienes cambios sin guardar
              </h3>
              <p id={`${idConfirmacion}-detalle`} className="mt-1 text-[14px] text-g-60">
                Si sales ahora se perderá lo que escribiste en el formulario.
              </p>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmando(false);
                    onCerrarRef.current();
                  }}
                  className="h-10 rounded-lg px-4 text-[14px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  Descartar y salir
                </button>
                <button
                  ref={botonSeguirRef}
                  type="button"
                  onClick={() => setConfirmando(false)}
                  className="h-10 rounded-lg bg-primary px-4 text-[14px] font-semibold text-white transition-colors hover:opacity-90"
                >
                  Seguir editando
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
