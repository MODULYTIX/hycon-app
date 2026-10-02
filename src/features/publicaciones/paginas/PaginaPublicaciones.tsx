import { Icon } from '@iconify/react';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import TarjetaArticuloDestacado from '@/features/publicaciones/componentes/moleculas/TarjetaArticuloDestacado';
import TarjetaArticulo from '@/features/publicaciones/componentes/moleculas/TarjetaArticulo';
import FilaArticulo from '@/features/publicaciones/componentes/moleculas/FilaArticulo';
import PanelMasLeidos from '@/features/publicaciones/componentes/organismos/PanelMasLeidos';
import { usePublicacionesPublicas } from '@/features/publicaciones/hooks/usePublicacionesPublicas';

export default function PaginaPublicaciones() {
  const { publicaciones, cargando, cargandoPrimera, error, hayMas, verMas } =
    usePublicacionesPublicas({ porPagina: 9 });
  const masLeidos = usePublicacionesPublicas({ orden: 'leidos', porPagina: 3 });

  // El primero encabeza la pagina, los dos siguientes lo acompanan y el resto va al listado
  const [destacado, ...resto] = publicaciones;
  const secundarios = resto.slice(0, 2);
  const listado = resto.slice(2);

  return (
    <PlantillaSeccion
      compacto
      titulo="Publicaciones"
      descripcion="Guías de ergonomía, logística y buenas prácticas para tu operación en Arequipa."
    >
      {cargandoPrimera && (
        <div aria-label="Cargando artículos" className="grid gap-4 md:grid-cols-3">
          <div className="h-[340px] animate-pulse rounded-2xl bg-g-10" />
          <div className="grid gap-4">
            <div className="h-[160px] animate-pulse rounded-2xl bg-g-10" />
            <div className="h-[160px] animate-pulse rounded-2xl bg-g-10" />
          </div>
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

      {!cargando && !error && publicaciones.length === 0 && (
        <div className="rounded-2xl bg-white ring-1 ring-g-20">
          <EstadoVacio
            icono="solar:document-text-linear"
            titulo="Todavía no hay artículos publicados"
            descripcion="Estamos preparando los primeros. Vuelve pronto o escríbenos por WhatsApp."
          />
        </div>
      )}

      {destacado && (
        <>
          {/* Sin articulos de apoyo el destacado ocupa todo el ancho, para no dejar media pagina vacia */}
          <div
            className={`grid gap-4 ${
              secundarios.length > 0 ? 'md:grid-cols-3' : ''
            }`}
          >
            <TarjetaArticuloDestacado publicacion={destacado} horizontal={secundarios.length === 0} />

            {secundarios.length > 0 && (
              <div className="contents">
                {secundarios.map((publicacion) => (
                  <TarjetaArticulo key={publicacion.uuid} publicacion={publicacion} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_252px] lg:gap-10">
            <section aria-labelledby="titulo-todos">
              <h2
                id="titulo-todos"
                className="mb-5 border-l-2 border-primary pl-3 text-[16px] font-semibold tracking-tight text-g-90"
              >
                Todos los artículos
              </h2>

              {listado.length > 0 ? (
                <ul aria-label="Listado de artículos" className="divide-y divide-g-20 [&>li]:py-4 [&>li:first-child]:pt-0 [&>li:last-child]:pb-0">
                  {listado.map((publicacion) => (
                    <FilaArticulo key={publicacion.uuid} publicacion={publicacion} />
                  ))}
                </ul>
              ) : (
                <p className="text-[13.5px] text-g-50">
                  Por ahora solo están los artículos de arriba. Pronto habrá más.
                </p>
              )}

              {hayMas && (
                <div className="mt-7 flex justify-center">
                  <button
                    type="button"
                    onClick={verMas}
                    disabled={cargando}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-g-30 px-5 text-[13px] font-medium text-g-70 transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                  >
                    {cargando ? 'Cargando...' : 'Ver más artículos'}
                    <Icon icon="solar:alt-arrow-down-linear" width="16" height="16" aria-hidden />
                  </button>
                </div>
              )}
            </section>

            <aside className="h-fit rounded-2xl border border-g-20 bg-g-5 p-6">
              <PanelMasLeidos publicaciones={masLeidos.publicaciones} cargando={masLeidos.cargandoPrimera} />
            </aside>
          </div>
        </>
      )}
    </PlantillaSeccion>
  );
}
