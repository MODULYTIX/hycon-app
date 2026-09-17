import { Icon } from '@iconify/react';
import { rangoMostrado, rangoPaginas, type Paginacion } from '@/shared/utilidades/paginacion';

interface Props {
  paginacion: Paginacion;
  onCambiar: (pagina: number) => void;
  // Nombre de lo que se lista, en plural: "productos", "cursos"
  entidad: string;
  deshabilitado?: boolean;
}

const BASE_BOTON =
  'flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-[14px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40';

// Solo aparece si hay mas de una pagina: con 6 o menos registros no aporta nada
export default function Paginador({ paginacion, onCambiar, entidad, deshabilitado }: Props) {
  if (paginacion.totalPaginas <= 1) return null;

  const { pagina, totalPaginas, total } = paginacion;
  const { desde, hasta } = rangoMostrado(paginacion);

  return (
    <nav
      aria-label={`Paginas de ${entidad}`}
      className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p className="text-[13px] text-g-50">
        Mostrando <span className="font-semibold text-g-80">{desde}</span>
        {' - '}
        <span className="font-semibold text-g-80">{hasta}</span> de{' '}
        <span className="font-semibold text-g-80">{total}</span> {entidad}
      </p>

      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            onClick={() => onCambiar(pagina - 1)}
            disabled={deshabilitado || pagina === 1}
            aria-label="Pagina anterior"
            className={`${BASE_BOTON} text-g-60 hover:bg-primary/10`}
          >
            <Icon icon="solar:alt-arrow-left-linear" width="18" height="18" aria-hidden />
          </button>
        </li>

        {rangoPaginas(pagina, totalPaginas).map((elemento, posicion) =>
          elemento === 'hueco' ? (
            <li
              key={`hueco-${posicion}`}
              aria-hidden
              className="flex h-9 w-6 items-end justify-center pb-2 text-g-40"
            >
              ...
            </li>
          ) : (
            <li key={elemento}>
              <button
                type="button"
                onClick={() => onCambiar(elemento)}
                disabled={deshabilitado}
                aria-label={`Pagina ${elemento}`}
                aria-current={elemento === pagina ? 'page' : undefined}
                className={`${BASE_BOTON} ${
                  elemento === pagina
                    ? 'bg-primary text-white'
                    : 'text-g-80 hover:bg-primary/10'
                }`}
              >
                {elemento}
              </button>
            </li>
          )
        )}

        <li>
          <button
            type="button"
            onClick={() => onCambiar(pagina + 1)}
            disabled={deshabilitado || pagina === totalPaginas}
            aria-label="Pagina siguiente"
            className={`${BASE_BOTON} text-g-60 hover:bg-primary/10`}
          >
            <Icon icon="solar:alt-arrow-right-linear" width="18" height="18" aria-hidden />
          </button>
        </li>
      </ul>
    </nav>
  );
}
