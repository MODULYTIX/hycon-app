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
  descripcion?: ReactNode;
  children: ReactNode;
  compacto?: boolean;
}) {
  return (
    <div className={compacto ? "pagina-interior catalogo-compacto hy-contenedor py-7 sm:py-9" : "pagina-interior hy-contenedor py-10 sm:py-14"}>
      <CabeceraPagina titulo={titulo} descripcion={descripcion} compacto={compacto} />
      {children}
    </div>
  );
}
