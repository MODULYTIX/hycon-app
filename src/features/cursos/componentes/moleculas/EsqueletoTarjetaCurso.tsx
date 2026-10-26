export default function EsqueletoTarjetaCurso() {
  return (
    <li
      aria-hidden="true"
      className="tarjeta-catalogo flex flex-col overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-g-20"
    >
      {/* Portada de video o miniatura del curso con ratio 16:9 */}
      <div className="esqueleto-onda relative aspect-[16/9] w-full bg-g-10">
        {/* Placeholder de etiqueta de oferta */}
        <div className="absolute left-3 top-3 h-4 w-12 rounded bg-white/70 backdrop-blur-xs" />
        {/* Placeholder de duración del curso en la esquina inferior derecha */}
        <div className="absolute bottom-3 right-3 h-4.5 w-14 rounded bg-g-90/40 backdrop-blur-xs" />
      </div>

      {/* Contenido de la ficha del curso */}
      <div className="flex flex-1 flex-col gap-2.5 border-t border-g-20 p-4">
        {/* Categoría / Etiqueta "Curso" */}
        <div className="esqueleto-onda h-2.5 w-12 rounded-full" />

        {/* Nombre del curso en 2 líneas */}
        <div className="space-y-1.5 pt-0.5">
          <div className="esqueleto-onda h-4 w-5/6 rounded" />
          <div className="esqueleto-onda h-4 w-3/5 rounded" />
        </div>

        {/* Breve descripción */}
        <div className="esqueleto-onda h-3 w-4/5 rounded" />

        {/* Fila inferior: precio del curso y enlace a detalle */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-g-20 pt-3">
          <div className="space-y-1">
            <div className="esqueleto-onda h-5 w-20 rounded" />
            <div className="esqueleto-onda h-2.5 w-12 rounded" />
          </div>

          <div className="esqueleto-onda h-3.5 w-16 rounded" />
        </div>
      </div>

      {/* Botón de reproducción de avance del curso */}
      <div className="flex items-center justify-center border-t border-g-20 bg-g-5/70 py-2.5">
        <div className="esqueleto-onda h-3.5 w-24 rounded" />
      </div>
    </li>
  );
}
