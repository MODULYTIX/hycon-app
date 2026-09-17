import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import TarjetaCurso from '@/features/cursos/componentes/moleculas/TarjetaCurso';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

interface Props {
  cursos: Curso[];
  cargando: boolean;
  error: string | null;
}

export default function RejillaCursos({ cursos, cargando, error }: Props) {
  if (cargando) {
    return (
      <ul aria-label="Cargando cursos" className="grid gap-6 md:grid-cols-2 lg:gap-8">
        {[0, 1, 2, 3].map((posicion) => (
          <li key={posicion} className="relative overflow-hidden rounded-[3px] bg-g-20 ring-1 ring-g-20">
            <div className="aspect-[4/3] animate-pulse sm:aspect-[5/4]" />
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 bg-white/80 px-4 py-4 sm:inset-x-6 sm:bottom-6">
              <div className="h-5 w-1/2 animate-pulse bg-g-20" />
              <div className="h-5 w-20 animate-pulse bg-g-20" />
            </div>
          </li>
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
    <ul aria-label="Catalogo de cursos" className="grid gap-6 md:grid-cols-2 lg:gap-8">
      {cursos.map((curso) => (
        <TarjetaCurso key={curso.courseId} curso={curso} />
      ))}
    </ul>
  );
}
