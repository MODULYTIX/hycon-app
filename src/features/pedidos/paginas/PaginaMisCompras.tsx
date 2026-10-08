import { useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import Paginador from '@/shared/ui/moleculas/Paginador';
import TarjetaPedido from '@/features/pedidos/componentes/moleculas/TarjetaPedido';
import { listarMisPedidosApi } from '@/features/pedidos/servicios/pedidos.api';
import { useListadoPaginado } from '@/shared/hooks/useListadoPaginado';
import { PAGINACION_INICIAL } from '@/shared/utilidades/paginacion';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { RUTAS } from '@/app/rutas/rutas';

export default function PaginaMisCompras() {
  const { usuario, cargando: cargandoSesion } = useAutenticacion();
  // Sin sesion no se consulta nada; al entrar, la clave cambia y se pide el listado
  const cargar = useCallback(
    (pagina: number, senal: AbortSignal) =>
      usuario
        ? listarMisPedidosApi(pagina, senal)
        : Promise.resolve({ elementos: [], paginacion: PAGINACION_INICIAL }),
    [usuario]
  );
  const { elementos, paginacion, cargando, error, irAPagina } = useListadoPaginado(
    cargar,
    'No se pudieron cargar tus compras',
    String(usuario?.userId ?? 'sin-sesion')
  );

  if (!cargandoSesion && !usuario) {
    return (
      <PlantillaSeccion titulo="Mis compras" descripcion="Aquí queda el detalle de cada pedido.">
        <div className="rounded-2xl bg-white ring-1 ring-g-20">
          <EstadoVacio
            icono="solar:user-circle-linear"
            titulo="Entra a tu cuenta para ver tus compras"
            descripcion="Tus pedidos quedan guardados en tu cuenta, no en este navegador."
          />
        </div>
      </PlantillaSeccion>
    );
  }

  return (
    <PlantillaSeccion titulo="Mis compras" descripcion="Aquí queda el detalle de cada pedido.">
      {cargando && (
        <div aria-label="Cargando compras" className="space-y-4">
          {[0, 1].map((posicion) => (
            <div key={posicion} className="h-32 animate-pulse rounded-2xl bg-g-10" />
          ))}
        </div>
      )}

      {!cargando && error && (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center text-[15px] text-red-700"
        >
          {error}
        </p>
      )}

      {!cargando && !error && elementos.length === 0 && (
        <div className="rounded-2xl bg-white ring-1 ring-g-20">
          <EstadoVacio
            icono="solar:bag-check-linear"
            titulo="Todavía no tienes compras"
            descripcion="Cuando completes un pedido lo verás aquí con su detalle."
          />
          <div className="flex justify-center pb-8">
            <Link
              to={RUTAS.productos}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro"
            >
              Ver el catálogo
              <Icon icon="solar:arrow-right-linear" width="15" height="15" aria-hidden />
            </Link>
          </div>
        </div>
      )}

      {!cargando && !error && elementos.length > 0 && (
        <>
          <ul aria-label="Listado de compras" className="space-y-4">
            {elementos.map((pedido) => (
              <TarjetaPedido key={pedido.uuid} pedido={pedido} />
            ))}
          </ul>

          <div className="mt-8">
            <Paginador
              paginacion={paginacion}
              onCambiar={irAPagina}
              entidad="compras"
              deshabilitado={cargando}
            />
          </div>
        </>
      )}
    </PlantillaSeccion>
  );
}
