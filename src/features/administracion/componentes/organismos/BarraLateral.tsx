import ItemSeccion from '@/features/administracion/componentes/moleculas/ItemSeccion';
import { SECCIONES_PANEL } from '@/features/administracion/utilidades/opciones-panel';

// En movil es una tira horizontal desplazable; desde lg, una columna fija
export default function BarraLateral() {
  return (
    <aside className="w-full shrink-0 border-b border-hy-20/70 bg-white lg:w-[250px] lg:border-b-0 lg:border-r">
      <nav aria-label="Secciones del panel" className="px-3 py-3 lg:px-4 lg:py-6">
        <p className="mb-3 hidden px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-hy-50 lg:block">
          Administración
        </p>
        <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {SECCIONES_PANEL.map((seccion) => (
            <ItemSeccion key={seccion.id} seccion={seccion} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
