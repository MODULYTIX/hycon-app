export default function EsqueletoTarjetaProducto() {
  return (
    <li
      aria-hidden="true"
      className="tarjeta-catalogo flex flex-col overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-g-20"
    >
      {/* Portada / foto del producto con ratio idéntico a TarjetaProducto */}
      <div className="esqueleto-onda relative aspect-[4/3] max-h-[190px] w-full bg-g-10">
        {/* Placeholder de etiqueta de oferta */}
        <div className="absolute left-3 top-3 h-4 w-12 rounded bg-white/70 backdrop-blur-xs" />
      </div>

      {/* Cuerpo de la ficha técnica */}
      <div className="flex flex-1 flex-col gap-2.5 border-t border-g-20 p-4">
        {/* Marca y modelo */}
        <div className="esqueleto-onda h-2.5 w-24 rounded-full" />

        {/* Nombre del producto en dos líneas */}
        <div className="space-y-1.5 pt-0.5">
          <div className="esqueleto-onda h-4 w-5/6 rounded" />
          <div className="esqueleto-onda h-4 w-3/5 rounded" />
        </div>

        {/* Resumen o descripción */}
        <div className="esqueleto-onda h-3 w-4/5 rounded" />

        {/* Metadatos (color, unidades disponibles) */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <div className="esqueleto-onda h-2.5 w-14 rounded" />
          <div className="esqueleto-onda h-2.5 w-20 rounded" />
        </div>

        {/* Barra de precio y acción de detalle */}
        <div className="flex items-end justify-between gap-3 border-t border-g-20 pt-3">
          <div className="space-y-1">
            <div className="esqueleto-onda h-5 w-20 rounded" />
            <div className="esqueleto-onda h-2.5 w-12 rounded" />
          </div>

          <div className="esqueleto-onda h-3.5 w-16 rounded" />
        </div>
      </div>
    </li>
  );
}
