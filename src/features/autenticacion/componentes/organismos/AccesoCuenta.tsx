import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import MenuUsuario from '@/features/autenticacion/componentes/organismos/MenuUsuario';
import ModalAcceso from '@/features/autenticacion/componentes/organismos/ModalAcceso';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { RUTAS } from '@/app/rutas/rutas';

// Bloque derecho del encabezado: el carrito siempre, y despues el boton de
// acceso o el menu de perfil segun haya sesion.
export default function AccesoCuenta() {
  const { usuario, cargando } = useAutenticacion();
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link
        to={RUTAS.carrito}
        aria-label="Ver carrito"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-encabezado-texto text-encabezado-texto transition-colors hover:bg-encabezado-texto/10"
      >
        <Icon icon="solar:cart-large-2-linear" width="22" height="22" />
      </Link>

      {cargando ? (
        // Reserva el mismo alto para que el encabezado no salte al restaurar la sesion
        <div className="h-11 w-[130px] animate-pulse rounded-full bg-white/20" />
      ) : usuario ? (
        <MenuUsuario usuario={usuario} />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            aria-label="Iniciar sesion"
            className="flex shrink-0 items-center gap-2 rounded-full bg-g-70 px-4 py-2.5 text-[15px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-g-80 sm:px-7"
          >
            <Icon icon="solar:login-3-bold" width="18" height="18" aria-hidden className="sm:hidden" />
            {/* En movil el boton se reduce al icono, pero conserva su nombre accesible */}
            <span className="sr-only sm:not-sr-only">Iniciar sesion</span>
          </button>

          <ModalAcceso abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} />
        </>
      )}
    </div>
  );
}
