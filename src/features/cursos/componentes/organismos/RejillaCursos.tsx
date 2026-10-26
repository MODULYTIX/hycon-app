import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import TarjetaCurso from '@/features/cursos/componentes/moleculas/TarjetaCurso';
import EsqueletoRejillaCursos from '@/features/cursos/componentes/organismos/EsqueletoRejillaCursos';
import AvisoErrorCatalogo from '@/shared/ui/moleculas/AvisoErrorCatalogo';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

interface Props {
  cursos: Curso[];
  onVerAvance: (curso: Curso) => void;
  cargando: boolean;
  error: string | null;
  filtrado?: boolean;
  onReintentar?: () => void;
}

const REJILLA = 'grid gap-4 min-[460px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4';

export default function RejillaCursos({
  cursos,
  cargando,
  error,
  onVerAvance,
  filtrado = false,
  onReintentar,
}: Props) {
  if (cargando) {
    return <EsqueletoRejillaCursos />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AvisoErrorCatalogo error={error} onReintentar={onReintentar} />
        <EsqueletoRejillaCursos cantidad={4} />
      </div>
    );
  }

  if (cursos.length === 0) {
    return (
      <div className="rounded-xl bg-white ring-1 ring-g-20">
        <EstadoVacio
          icono="solar:diploma-linear"
          titulo={filtrado ? "No encontramos cursos" : "Todavia no hay cursos publicados"}
          descripcion={filtrado ? "Prueba otros filtros o pulsa Limpiar para ver todo el catálogo." : "Estamos preparando la primera tanda de cursos. Vuelve pronto."}
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
