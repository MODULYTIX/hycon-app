import QuienesSomos from '@/features/acerca-de/componentes/organismos/QuienesSomos';
import PorqueElegirnos from '@/features/acerca-de/componentes/organismos/PorqueElegirnos';
import Alcance from '@/features/acerca-de/componentes/organismos/Alcance';

export default function PaginaAcercaDe() {
  return (
    <>
      <h1 className="sr-only">Acerca de Hycon</h1>

      <section id="quienes_somos" className="flex items-center justify-center py-10">
        <QuienesSomos />
      </section>

      <section id="porque_elegirnos" className="flex items-center justify-center">
        <PorqueElegirnos />
      </section>

      <section id="alcance" className="flex items-center justify-center py-16">
        <Alcance />
      </section>
    </>
  );
}
