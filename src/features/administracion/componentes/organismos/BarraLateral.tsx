import ItemSeccion from '@/features/administracion/componentes/moleculas/ItemSeccion';
import { SECCIONES_PANEL } from '@/features/administracion/utilidades/opciones-panel';

export default function BarraLateral() {
  return (
    <aside className="w-full shrink-0 border-b border-g-20 bg-white lg:min-h-full lg:w-[248px] lg:border-b-0 lg:border-r">
      <nav aria-label="Secciones del panel" className="p-4">
        <p className="mb-3 px-3 text-[12px] font-bold tracking-widest text-g-40">
          ADMINISTRACION
        </p>
        <ul className="space-y-1">
          {SECCIONES_PANEL.map((seccion) => (
            <ItemSeccion key={seccion.id} seccion={seccion} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
