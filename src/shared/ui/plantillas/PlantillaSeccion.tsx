import type { ReactNode } from 'react';
import CabeceraPagina from '@/shared/ui/plantillas/CabeceraPagina';

// Envoltorio con el ancho y los margenes que comparten las paginas internas
export default function PlantillaSeccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1340px] px-4 py-10 sm:px-6 md:px-12">
      <CabeceraPagina titulo={titulo} descripcion={descripcion} />
      {children}
    </div>
  );
}
