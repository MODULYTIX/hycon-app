import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import MenuUsuario from '@/features/autenticacion/componentes/organismos/MenuUsuario';
import ModalAcceso from '@/features/autenticacion/componentes/organismos/ModalAcceso';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';

// Bloque del encabezado que cambia segun haya sesion o no:
// sin sesion muestra el boton que abre el modal, con sesion el carrito y el menu de perfil
export default function AccesoCuenta() {
  const { usuario, cargando } = useAutenticacion();
  const [modalAbierto, setModalAbierto] = useState(false);

  if (cargando) {
    // Reserva el mismo alto para que el encabezado no salte al restaurar la sesion
    return <div className="h-11 w-[120px] animate-pulse rounded-full bg-white/20" />;
  }

  if (usuario) {
    return (
      <div className="flex items-center gap-3">
        <Link
          to="/carrito"
          aria-label="Ver carrito"
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white text-white transition-colors hover:bg-white/10 sm:flex"
        >
          <Icon icon="solar:cart-large-2-linear" width="22" height="22" />
        </Link>

        <MenuUsuario usuario={usuario} />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalAbierto(true)}
        aria-label="Iniciar sesion"
        className="flex shrink-0 items-center gap-2 rounded-full border-2 border-white px-3 py-1.5 text-[16px] font-medium text-white transition-colors hover:bg-white hover:text-primary sm:px-5"
      >
        <Icon icon="solar:login-3-bold" width="18" height="18" aria-hidden />
        {/* En movil el boton se reduce al icono, pero conserva su nombre accesible */}
        <span className="sr-only sm:not-sr-only">Iniciar sesion</span>
      </button>

      <ModalAcceso abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} />
    </>
  );
}
