import Titulo from '@/shared/ui/atomos/Titulo';

// Cabecera comun de las paginas internas del sitio publico
export default function CabeceraPagina({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion?: string;
}) {
  return (
    <header className="mb-8 flex flex-col items-start gap-4">
      <Titulo nivel="h1">{titulo}</Titulo>
      {descripcion && (
        <p className="max-w-[720px] text-[16px] leading-relaxed text-g-60 sm:text-[18px]">
          {descripcion}
        </p>
      )}
    </header>
  );
}
