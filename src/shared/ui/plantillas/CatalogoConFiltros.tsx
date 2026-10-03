import type { ReactNode } from 'react';
export default function CatalogoConFiltros({ filtros, children }: { filtros: ReactNode; children: ReactNode }) {
  return (
    <div className="catalogo-con-filtros grid items-start gap-6 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-8">
      <aside aria-label="Filtros del catálogo" className="min-w-0 md:sticky md:top-5">{filtros}</aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
