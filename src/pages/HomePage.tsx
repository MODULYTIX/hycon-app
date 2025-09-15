import Footer from '../components/Footer';
import Header from '../components/Header';
import Hero from '../components/Hero';

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col ">
      <Header />

      <main className="flex-1 min-h-0">
        <section id="hero" className="h-screen w-full">
          <Hero />
        </section>

        <section
          id="quienes_somos"
          className="h-screen w-full  flex items-center justify-center">
          {/* Elimina esto y pon el componente.. haci con los demas */}
          <h2 className="text-3xl font-bold">Quienes Somos</h2>
        </section>

        {/* Elimina esto y pon el componente.. haci con los demas */}
        <section
          id="servicios"
          className="h-screen w-full  flex items-center justify-center">
          <h2 className="text-3xl font-bold">Servicios</h2>
        </section>

        {/* Elimina esto y pon el componente.. haci con los demas */}
        <section
          id="plataforma_asociada"
          className="h-screen w-full  flex items-center justify-center">
          <h2 className="text-3xl font-bold">Plataforma Asociada</h2>
        </section>

        {/* Elimina esto y pon el componente.. haci con los demas */}
        <section
          id="porque_elegirnos"
          className="h-screen w-full  flex items-center justify-center">
          <h2 className="text-3xl font-bold">Porque Elegirnos</h2>
        </section>

        {/* Elimina esto y pon el componente.. haci con los demas */}
        <section
          id="Alcance"
          className="h-screen w-full  flex items-center justify-center">
          <h2 className="text-3xl font-bold">Alcance</h2>
        </section>

        {/* Elimina esto y pon el componente.. haci con los demas */}
        <section
          id="contactanos"
          className="h-screen w-full  flex items-center justify-center">
          <h2 className="text-3xl font-bold">Contactanos</h2>
        </section>
      </main>

      <Footer />
    </div>
  );
}
