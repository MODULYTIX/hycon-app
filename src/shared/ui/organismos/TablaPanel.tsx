import type { ReactNode } from 'react';
import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import Paginador from '@/shared/ui/moleculas/Paginador';
import type { Paginacion } from '@/shared/utilidades/paginacion';

interface Props {
  titulo: string;
  // Nombre en plural para el paginador y los mensajes: "productos"
  entidad: string;
  columnas: string[];
  claseColumnas: string;
  paginacion: Paginacion;
  cargando: boolean;
  error: string | null;
  vacio: { icono: string; titulo: string; descripcion: string };
  onCambiarPagina: (pagina: number) => void;
  // Las filas, ya renderizadas como <li>
  children: ReactNode;
  cantidadFilas: number;
}

// Contenedor comun de los listados del panel: cabecera, columnas, estados y paginador
export default function TablaPanel({
  titulo,
  entidad,
  columnas,
  claseColumnas,
  paginacion,
  cargando,
  error,
  vacio,
  onCambiarPagina,
  children,
  cantidadFilas,
}: Props) {
  const primeraCarga = cargando && cantidadFilas === 0;
  const hayFilas = !error && cantidadFilas > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-hy-20/70 bg-white">
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <h2 className="text-[16px] font-semibold text-hy-tinta">{titulo}</h2>
        {!primeraCarga && !error && (
          <span className="rounded-full bg-hy-10 px-2.5 py-0.5 text-[12.5px] font-semibold text-hy-70">
            {paginacion.total} {paginacion.total === 1 ? entidad.replace(/s$/, '') : entidad}
          </span>
        )}
      </header>

      {hayFilas && (
        <div
          aria-hidden
          className={`hidden gap-4 border-y border-hy-10 bg-hy-5 px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-wider text-hy-50 lg:grid ${claseColumnas}`}
        >
          {columnas.map((columna, indice) => (
            <span key={columna} className={indice === columnas.length - 1 ? 'text-right' : ''}>
              {columna}
            </span>
          ))}
        </div>
      )}

      {primeraCarga && (
        <ul aria-label={`Cargando ${entidad}`} className="divide-y divide-hy-10 border-t border-hy-10">
          {[0, 1, 2].map((posicion) => (
            <li key={posicion} className="flex items-center gap-3.5 px-5 py-4">
              <span className="h-16 w-16 animate-pulse rounded-lg bg-hy-10" />
              <span className="flex-1 space-y-2">
                <span className="block h-3.5 w-2/5 animate-pulse rounded bg-hy-10" />
                <span className="block h-3 w-1/4 animate-pulse rounded bg-hy-10" />
              </span>
            </li>
          ))}
        </ul>
      )}

      {!cargando && error && (
        <p
          role="alert"
          className="border-t border-hy-10 px-5 py-10 text-center text-[15px] text-red-600"
        >
          {error}
        </p>
      )}

      {!cargando && !error && cantidadFilas === 0 && (
        <div className="border-t border-hy-10">
          <EstadoVacio {...vacio} />
        </div>
      )}

      {hayFilas && (
        <ul
          aria-label={titulo}
          aria-busy={cargando || undefined}
          className={`divide-y divide-hy-10 border-t border-hy-10 transition-opacity lg:border-t-0 ${
            cargando ? 'opacity-50' : ''
          }`}
        >
          {children}
        </ul>
      )}

      {hayFilas && paginacion.totalPaginas > 1 && (
        <div className="border-t border-hy-10 px-4 py-3.5 sm:px-5">
          <Paginador
            paginacion={paginacion}
            onCambiar={onCambiarPagina}
            entidad={entidad}
            deshabilitado={cargando}
          />
        </div>
      )}
    </section>
  );
}
