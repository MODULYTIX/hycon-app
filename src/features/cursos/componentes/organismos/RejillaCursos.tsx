import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import TarjetaCurso from '@/features/cursos/componentes/moleculas/TarjetaCurso';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

interface Props {
  cursos: Curso[];
  onVerAvance: (curso: Curso) => void;
  cargando: boolean;
  error: string | null;
}

const REJILLA = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3';

export default function RejillaCursos({ cursos, cargando, error, onVerAvance }: Props) {
  if (cargando) {
    return (
      <ul aria-label="Cargando cursos" className={REJILLA}>
        {[0, 1, 2, 3, 4, 5].map((posicion) => (
          <li key={posicion} className="bg-white ring-1 ring-g-20">
            <div className="aspect-[16/9] animate-pulse bg-g-10" />
            <div className="space-y-3 border-t border-g-20 p-5">
              <div className="h-3 w-1/4 animate-pulse rounded bg-g-10" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-g-10" />
              <div className="h-7 w-24 animate-pulse rounded bg-g-10" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-[3px] border border-red-200 bg-red-50 px-5 py-8 text-center text-[15px] text-red-700">
        {error}
      </p>
    );
  }

  if (cursos.length === 0) {
    return (
      <div className="rounded-[3px] bg-white ring-1 ring-g-20">
        <EstadoVacio
          icono="solar:diploma-linear"
          titulo="Todavia no hay cursos publicados"
          descripcion="Estamos preparando la primera tanda de cursos. Vuelve pronto."
        />
      </div>
    );
  }

  return (
    <ul aria-label="Catalogo de cursos" className={REJILLA}>
      {cursos.map((curso) => (
        <TarjetaCurso key={curso.uuid} curso={curso} onVerAvance={onVerAvance} />
      ))}
    </ul>
  );
}
