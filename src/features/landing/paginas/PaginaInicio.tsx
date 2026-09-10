import Alcance from '@/features/landing/componentes/organismos/Alcance';
import Hero from '@/features/landing/componentes/organismos/Hero';
import NuestrosClientes from '@/features/landing/componentes/organismos/NuestrosClientes';
import PlataformaAsociada from '@/features/landing/componentes/organismos/PlataformaAsociada';
import PorqueElegirnos from '@/features/landing/componentes/organismos/PorqueElegirnos';
import QuienesSomos from '@/features/landing/componentes/organismos/QuienesSomos';
import Servicios from '@/features/landing/componentes/organismos/Servicios';
import FormularioContacto from '@/features/contacto/componentes/organismos/FormularioContacto';
import { BotonWhatsapp } from '@/features/contacto/componentes/atomos/BotonWhatsapp';
import PiePagina from '@/shared/ui/organismos/PiePagina';

export default function PaginaInicio() {
  return (
    <div className="flex flex-col w-screen">
      <main className="flex-1 w-full">
        <section id="hero" className="min-h-screen w-screen">
          <Hero />
        </section>

        <section
          id="quienes_somos"
          className="min-h-screen w-screen flex items-center justify-center"
        >
          <QuienesSomos />
        </section>

        <section
          id="servicios"
          className="min-h-screen w-screen flex items-center justify-center"
        >
          <Servicios />
        </section>

        <section
          id="plataforma_asociada"
          className="min-h-screen w-screen flex items-center justify-center"
        >
          <PlataformaAsociada />
        </section>

        <section
          id="porque_elegirnos"
          className="min-h-screen w-screen flex items-center justify-center"
        >
          <PorqueElegirnos />
        </section>

        <section
          id="Alcance"
          className="min-h-screen w-screen flex items-center justify-center"
        >
          <Alcance />
        </section>

        <section
          id="NuestrosClientes"
          className=" w-screen flex items-center justify-center bg-g-10"
        >
          <NuestrosClientes />
        </section>

        <section
          id="contactanos"
          className=" w-screen flex items-center justify-center"
        >
          <FormularioContacto />
        </section>
      </main>

      <PiePagina />
      <BotonWhatsapp />
    </div>
  );
}
