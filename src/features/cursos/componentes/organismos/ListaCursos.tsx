import EstadoVacio from '@/features/administracion/componentes/atomos/EstadoVacio';
import FilaCurso from '@/features/administracion/componentes/moleculas/FilaCurso';
import type { Curso } from '@/features/administracion/tipos/catalogo.tipos';

interface Props {
  cursos: Curso[];
  cargando: boolean;
  error: string | null;
}

export default function ListaCursos({ cursos, cargando, error }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-g-20 bg-white">
      <header className="flex items-center justify-between border-b border-g-20 px-5 py-4">
        <h2 className="text-[18px] font-semibold text-g-80">Cursos del catalogo</h2>
        <span className="rounded-full bg-g-10 px-2.5 py-0.5 text-[13px] font-semibold text-g-60">
          {cursos.length}
        </span>
      </header>

      {cargando && (
        <p className="px-5 py-10 text-center text-[15px] text-g-50">Cargando cursos...</p>
      )}

      {!cargando && error && (
        <p role="alert" className="px-5 py-10 text-center text-[15px] text-red-600">
          {error}
        </p>
      )}

      {!cargando && !error && cursos.length === 0 && (
        <EstadoVacio
          icono="solar:diploma-linear"
          titulo="Todavia no hay cursos"
          descripcion="Pulsa Agregar curso para publicar el primero en el catalogo."
        />
      )}

      {!cargando && !error && cursos.length > 0 && (
        <ul aria-label="Cursos del catalogo" className="divide-y divide-g-20">
          {cursos.map((curso) => (
            <FilaCurso key={curso.courseId} curso={curso} />
          ))}
        </ul>
      )}
    </section>
  );
}
