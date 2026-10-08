import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import FotoPerfil from '@/features/perfil/componentes/organismos/FotoPerfil';
import DatosPersonales from '@/features/perfil/componentes/organismos/DatosPersonales';
import CambiarPassword from '@/features/perfil/componentes/organismos/CambiarPassword';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { RUTAS } from '@/app/rutas/rutas';

export default function PaginaPerfil() {
  const { usuario, cargando, cerrarSesion } = useAutenticacion();

  if (cargando) {
    return (
      <PlantillaSeccion titulo="Mi cuenta" descripcion="Tus datos y la seguridad de tu cuenta.">
        <div aria-label="Cargando perfil" className="space-y-4">
          {[0, 1].map((posicion) => (
            <div key={posicion} className="h-40 animate-pulse rounded-2xl bg-g-10" />
          ))}
        </div>
      </PlantillaSeccion>
    );
  }

  if (!usuario) {
    return (
      <PlantillaSeccion titulo="Mi cuenta" descripcion="Tus datos y la seguridad de tu cuenta.">
        <div className="rounded-2xl bg-white ring-1 ring-g-20">
          <EstadoVacio
            icono="solar:user-circle-linear"
            titulo="Entra a tu cuenta para ver tu perfil"
            descripcion="Desde aquí cambias tus datos, tu foto y tu contraseña."
          />
        </div>
      </PlantillaSeccion>
    );
  }

  return (
    <PlantillaSeccion titulo="Mi cuenta" descripcion="Tus datos y la seguridad de tu cuenta.">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
        <div className="min-w-0 space-y-5">
          <FotoPerfil usuario={usuario} />
          <DatosPersonales usuario={usuario} />
          <CambiarPassword usuario={usuario} />
        </div>

        <aside aria-labelledby="titulo-cuenta" className="min-w-0 h-fit space-y-5 lg:sticky lg:top-6">
          <section className="min-w-0 rounded-xl border border-g-20 bg-white p-5 shadow-sm">
            <h2 id="titulo-cuenta" className="text-[16px] font-semibold tracking-tight text-g-90">
              Tu cuenta
            </h2>
            <dl className="mt-4 space-y-3 text-[13.5px]">
              <div>
                <dt className="text-g-50">Nombre</dt>
                <dd className="text-g-80">
                  {usuario.name} {usuario.lastname}
                </dd>
              </div>
              <div>
                <dt className="text-g-50">Correo</dt>
                <dd className="break-all text-g-80">{usuario.email}</dd>
              </div>
              <div>
                <dt className="text-g-50">Tipo de cuenta</dt>
                <dd className="text-g-80">{usuario.rol === 'ADMIN' ? 'Administrador' : 'Cliente'}</dd>
              </div>
            </dl>

            <Link
              to={RUTAS.historial}
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-g-30 text-[13px] font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
            >
              <Icon icon="solar:bag-check-linear" width="16" height="16" aria-hidden />
              Ver mis compras
            </Link>
          </section>

          <section className="min-w-0 rounded-xl border border-g-20 bg-white p-5 shadow-sm">
            <h2 className="text-[16px] font-semibold tracking-tight text-g-90">Sesión</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-g-50">
              Cierra la sesión en este dispositivo cuando termines.
            </p>
            <button
              type="button"
              onClick={() => void cerrarSesion()}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-g-20 text-[13px] text-g-50 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Icon icon="solar:logout-3-linear" width="16" height="16" aria-hidden />
              Cerrar sesión
            </button>
          </section>
        </aside>
      </div>
    </PlantillaSeccion>
  );
}
