import EsqueletoTarjetaCurso from '@/features/cursos/componentes/moleculas/EsqueletoTarjetaCurso';

const REJILLA = 'grid gap-4 min-[460px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4';

interface Props {
  cantidad?: number;
}

export default function EsqueletoRejillaCursos({ cantidad = 8 }: Props) {
  return (
    <ul aria-label="Cargando cursos" className={REJILLA}>
      {Array.from({ length: cantidad }).map((_, posicion) => (
        <EsqueletoTarjetaCurso key={posicion} />
      ))}
    </ul>
  );
}
