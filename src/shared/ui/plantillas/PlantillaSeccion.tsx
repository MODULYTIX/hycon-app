import type { ReactNode } from 'react';
import CabeceraPagina from '@/shared/ui/plantillas/CabeceraPagina';

// Envoltorio con el ancho y los margenes que comparten las paginas internas
export default function PlantillaSeccion({
  titulo,
  descripcion,
  children,
  compacto = false,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  compacto?: boolean;
}) {
  return (
    <div className={compacto ? "pagina-interior catalogo-compacto mx-auto w-full max-w-[1340px] px-5 py-7 sm:px-8 sm:py-9 md:px-12" : "pagina-interior mx-auto w-full max-w-[1340px] px-5 py-10 sm:px-8 sm:py-14 md:px-12"}>
      <CabeceraPagina titulo={titulo} descripcion={descripcion} compacto={compacto} />
      {children}
    </div>
  );
}
