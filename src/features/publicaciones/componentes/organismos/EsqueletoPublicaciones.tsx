export default function EsqueletoPublicaciones() {
  return (
    <div aria-label="Cargando artículos" className="space-y-7">
      {/* Cabecera editorial: Destacado principal y 2 artículos secundarios */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Artículo Destacado */}
        <article className="tarjeta-editorial flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-g-20">
          <div className="esqueleto-onda aspect-[16/9] w-full bg-g-10" />
          <div className="flex flex-1 flex-col gap-2.5 border-t border-g-20 p-4">
            {/* Etiqueta "Lo último" */}
            <div className="esqueleto-onda h-5 w-20 rounded bg-hy-10" />

            {/* Título editorial en 2 líneas */}
            <div className="space-y-1.5 pt-0.5">
              <div className="esqueleto-onda h-5 w-5/6 rounded" />
              <div className="esqueleto-onda h-5 w-3/5 rounded" />
            </div>

            {/* Metadatos (autor, fecha, tiempo de lectura) */}
            <div className="esqueleto-onda h-3 w-44 rounded" />

            {/* Resumen */}
            <div className="space-y-1 pt-1">
              <div className="esqueleto-onda h-3 w-full rounded" />
              <div className="esqueleto-onda h-3 w-4/5 rounded" />
            </div>

            {/* Botón de lectura */}
            <div className="esqueleto-onda mt-3 h-9 w-36 rounded-lg bg-g-20" />
          </div>
        </article>

        {/* 2 Artículos Secundarios */}
        <div className="contents">
          {[0, 1].map((posicion) => (
            <article
              key={posicion}
              className="tarjeta-editorial flex flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-g-20"
            >
              <div className="esqueleto-onda aspect-[16/9] w-full bg-g-10" />
              <div className="flex flex-1 flex-col gap-2 border-t border-g-20 p-4">
                <div className="space-y-1.5">
                  <div className="esqueleto-onda h-4 w-full rounded" />
                  <div className="esqueleto-onda h-4 w-3/4 rounded" />
                </div>

                <div className="space-y-1 pt-1">
                  <div className="esqueleto-onda h-2.5 w-full rounded" />
                  <div className="esqueleto-onda h-2.5 w-4/5 rounded" />
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                  <div className="esqueleto-onda h-3 w-28 rounded" />
                  <div className="esqueleto-onda h-8 w-16 rounded-lg" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Sección inferior: Listado "Todos los artículos" + Panel "Lo más leído" */}
      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-6">
        <section aria-label="Cargando todos los artículos">
          <div className="mb-5 flex items-center gap-3 border-l-2 border-primary pl-3">
            <div className="esqueleto-onda h-4.5 w-36 rounded" />
          </div>

          <ul className="divide-y divide-g-20 [&>li]:py-4 [&>li:first-child]:pt-0 [&>li:last-child]:pb-0">
            {[0, 1, 2].map((posicion) => (
              <li key={posicion}>
                <div className="flex flex-row gap-3 sm:gap-4">
                  {/* Portada en miniatura */}
                  <div className="esqueleto-onda aspect-[16/9] w-[112px] shrink-0 rounded-lg ring-1 ring-g-20 sm:aspect-[4/3] sm:w-[128px]" />

                  {/* Datos del artículo */}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="space-y-1.5">
                      <div className="esqueleto-onda h-4 w-5/6 rounded" />
                      <div className="esqueleto-onda h-4 w-1/2 rounded" />
                    </div>
                    <div className="esqueleto-onda h-3 w-32 rounded" />
                    <div className="esqueleto-onda h-3 w-3/4 rounded" />
                    <div className="esqueleto-onda mt-1 h-3 w-20 rounded" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Panel lateral "Lo más leído" */}
        <aside className="hidden h-fit rounded-2xl border border-g-20 bg-g-5 p-6 xl:block">
          <div className="mb-4 flex items-center gap-3 border-l-2 border-primary pl-3">
            <div className="esqueleto-onda h-4 w-24 rounded" />
          </div>

          <div className="space-y-4">
            {[0, 1, 2].map((posicion) => (
              <div key={posicion} className="flex gap-3">
                <span className="mt-0.5 text-[13px] font-semibold text-g-30">
                  {String(posicion + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="esqueleto-onda h-3.5 w-full rounded" />
                  <div className="esqueleto-onda h-3.5 w-3/4 rounded" />
                  <div className="esqueleto-onda h-2.5 w-1/2 rounded" />
                </div>
                <div className="esqueleto-onda hidden h-14 w-[70px] shrink-0 rounded-[3px] ring-1 ring-g-20 sm:block" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
