import Titulo from '@/shared/ui/atomos/Titulo';

// Cabecera comun de las paginas internas del sitio publico
export default function CabeceraPagina({
  titulo,
  descripcion,
  compacto = false,
}: {
  titulo: string;
  descripcion?: string;
  compacto?: boolean;
}) {
  return (
    <header className={compacto ? "cabecera-catalogo" : "cabecera-interior mb-10 flex flex-col items-start gap-4 border-b border-g-20 pb-8 sm:mb-12 sm:pb-10"}>
      {compacto ? <h1>{titulo}</h1> : <Titulo nivel="h1">{titulo}</Titulo>}
      {descripcion && (
        <p className="max-w-[720px] text-[16px] leading-relaxed text-g-60 sm:text-[18px]">
          {descripcion}
        </p>
      )}
    </header>
  );
}
