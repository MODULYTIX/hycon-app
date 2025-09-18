import Footer from '../components/Footer';
import Hero from '../components/Hero';
import PlataformaAsociada from '../components/PlataformaAsociada';
import PorqueElegirnos from '../components/PorqueElegirnos';
import QuienesSomos from '../components/QuienesSomos';
import Servicios from '../components/Servicios';

export default function HomePage() {
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
          <h2 className="text-3xl font-bold">Alcance</h2>
        </section>

        <section
          id="contactanos"
          className="min-h-screen w-screen flex items-center justify-center"
        >
          <h2 className="text-3xl font-bold">Contactanos</h2>
        </section>
      </main>

      <Footer />
    </div>
  );
}
