import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import TarjetaCurso from '@/features/cursos/componentes/moleculas/TarjetaCurso';
import EsqueletoRejillaCursos from '@/features/cursos/componentes/organismos/EsqueletoRejillaCursos';
import AvisoErrorCatalogo from '@/shared/ui/moleculas/AvisoErrorCatalogo';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

interface Props {
  vista: 'grilla' | 'lista';
  cursos: Curso[];
  onVerAvance: (curso: Curso) => void;
  cargando: boolean;
  error: string | null;
  filtrado?: boolean;
  onReintentar?: () => void;
}


export default function RejillaCursos({
  cursos,
  vista,
  cargando,
  error,
  onVerAvance,
  filtrado = false,
  onReintentar,
}: Props) {
  if (cargando) {
    return <EsqueletoRejillaCursos vista={vista} />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AvisoErrorCatalogo error={error} onReintentar={onReintentar} />
        <EsqueletoRejillaCursos vista={vista} cantidad={4} />
      </div>
    );
  }

  if (cursos.length === 0) {
    return (
      <div className="bg-white border border-g-20">
        <EstadoVacio
          icono="solar:diploma-linear"
          titulo={filtrado ? "No encontramos cursos" : "Todavia no hay cursos publicados"}
          descripcion={filtrado ? "Prueba otros filtros o pulsa Limpiar para ver todo el catálogo." : "Estamos preparando la primera tanda de cursos. Vuelve pronto."}
        />
      </div>
    );
  }

  return (
    <ul aria-label="Catalogo de cursos" className="productos-rejilla" data-vista={vista}>
      {cursos.map((curso) => (
        <TarjetaCurso key={curso.uuid} curso={curso} onVerAvance={onVerAvance} />
      ))}
    </ul>
  );
}
