import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import TarjetaCurso from '@/features/cursos/componentes/moleculas/TarjetaCurso';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

interface Props {
  cursos: Curso[];
  onVerAvance: (curso: Curso) => void;
  cargando: boolean;
  error: string | null;
}

export default function RejillaCursos({ cursos, cargando, error, onVerAvance }: Props) {
  if (cargando) {
    return (
      <ul aria-label="Cargando cursos" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((posicion) => (
          <li
            key={posicion}
            className="h-[320px] animate-pulse rounded-xl border border-g-20 bg-g-5"
          />
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-8 text-center text-[15px] text-red-700">
        {error}
      </p>
    );
  }

  if (cursos.length === 0) {
    return (
      <div className="rounded-xl border border-g-20 bg-white">
        <EstadoVacio
          icono="solar:diploma-linear"
          titulo="Todavia no hay cursos publicados"
          descripcion="Estamos preparando la primera tanda de cursos. Vuelve pronto."
        />
      </div>
    );
  }

  return (
    <ul aria-label="Catalogo de cursos" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cursos.map((curso) => (
        <TarjetaCurso key={curso.courseId} curso={curso} onVerAvance={onVerAvance} />
      ))}
    </ul>
  );
}
