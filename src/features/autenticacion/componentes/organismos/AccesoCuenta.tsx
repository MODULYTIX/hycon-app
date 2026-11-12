import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import MenuUsuario from '@/features/autenticacion/componentes/organismos/MenuUsuario';
import ModalAcceso from '@/features/autenticacion/componentes/organismos/ModalAcceso';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { useCarrito } from '@/features/carrito/hooks/useCarrito';
import { RUTAS } from '@/app/rutas/rutas';

// Bloque derecho del encabezado: el carrito siempre, y despues el boton de
// acceso o el menu de perfil segun haya sesion.
export default function AccesoCuenta() {
  const { usuario, cargando } = useAutenticacion();
  const { total: articulos } = useCarrito();
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className="hy-cuenta flex items-center gap-2 sm:gap-3">
      <Link
        to={RUTAS.carrito}
        aria-label={articulos > 0 ? `Ver carrito, ${articulos} artículos` : 'Ver carrito'}
        className="hy-cart relative flex h-11 w-11 shrink-0 items-center justify-center"
      >
        <Icon icon="solar:cart-large-2-linear" width="22" height="22" />
        {articulos > 0 && (
          <span
            aria-hidden
            className="hy-cart-cantidad absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums"
          >
            {articulos > 99 ? '99+' : articulos}
          </span>
        )}
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
            className="hy-login flex shrink-0 items-center gap-2"
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
