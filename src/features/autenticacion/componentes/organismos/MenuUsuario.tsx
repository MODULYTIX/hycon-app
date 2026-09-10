import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import AvatarUsuario from '@/features/autenticacion/componentes/atomos/AvatarUsuario';
import ItemMenuCuenta from '@/features/autenticacion/componentes/moleculas/ItemMenuCuenta';
import { filtrarOpcionesPorRol } from '@/features/autenticacion/utilidades/opciones-cuenta';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import type { Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

export default function MenuUsuario({ usuario }: { usuario: Usuario }) {
  const { cerrarSesion } = useAutenticacion();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const idMenu = useId();

  // El rol viene del token que emite el backend: el menu solo refleja ese dato
  const opciones = filtrarOpcionesPorRol(usuario.rol);

  // Cierra al hacer clic fuera o al pulsar Escape
  useEffect(() => {
    if (!abierto) return;

    const alClicFuera = (evento: MouseEvent) => {
      if (!contenedorRef.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alPulsarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false);
    };

    document.addEventListener('mousedown', alClicFuera);
    document.addEventListener('keydown', alPulsarTecla);
    return () => {
      document.removeEventListener('mousedown', alClicFuera);
      document.removeEventListener('keydown', alPulsarTecla);
    };
  }, [abierto]);

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((previo) => !previo)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={idMenu}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/10"
      >
        <AvatarUsuario usuario={usuario} />
        <span className="hidden max-w-[160px] truncate text-[16px] font-bold text-white sm:inline">
          {usuario.name} {usuario.lastname}
        </span>
        <Icon
          icon="solar:alt-arrow-down-linear"
          width="18"
          height="18"
          aria-hidden
          className={`text-white transition-transform ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {abierto && (
        <div
          id={idMenu}
          role="menu"
          aria-label="Opciones de la cuenta"
          className="absolute right-0 top-[calc(100%+10px)] z-30 w-[288px] overflow-hidden rounded-xl border border-g-20 bg-white shadow-2xl animate-menuIn"
        >
          <div className="border-b border-g-20 bg-g-5 px-4 py-3">
            <p className="truncate text-[15px] font-semibold text-g-80">
              {usuario.name} {usuario.lastname}
            </p>
            <p className="truncate text-[13px] text-g-50">{usuario.email}</p>
          </div>

          <ul role="none" className="py-1">
            {opciones.map((opcion) => (
              <ItemMenuCuenta
                key={opcion.id}
                opcion={opcion}
                onSeleccionar={() => setAbierto(false)}
              />
            ))}
          </ul>

          <div className="border-t border-g-20">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setAbierto(false);
                cerrarSesion();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-red-600 transition-colors hover:bg-red-50"
            >
              <Icon icon="solar:logout-3-bold" width="18" height="18" aria-hidden className="shrink-0" />
              Cerrar sesion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
