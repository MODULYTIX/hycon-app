import Footer from '../components/Footer';
import Header from '../components/Header';
import Hero from '../components/Hero';
import QuienesSomos from '../components/QuienesSomos';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col ">
      <main className="flex-1 h-screen w-full">
        <Header />
        <section id="hero">
          <Hero />
        </section>

        <section
          id="quienes_somos"
          className="h-screen w-full flex items-center justify-center">
          <QuienesSomos />
        </section>

        <section
          id="servicios"
          className="h-screen w-full flex items-center justify-center">
          <h2 className="text-3xl font-bold">Servicios</h2>
        </section>

        <section
          id="plataforma_asociada"
          className="h-screen w-full flex items-center justify-center">
          <h2 className="text-3xl font-bold">Plataforma Asociada</h2>
        </section>

        <section
          id="porque_elegirnos"
          className="h-screen w-full flex items-center justify-center">
          <h2 className="text-3xl font-bold">Porque Elegirnos</h2>
        </section>

        <section
          id="Alcance"
          className="h-screen w-full flex items-center justify-center">
          <h2 className="text-3xl font-bold">Alcance</h2>
        </section>

        <section
          id="contactanos"
          className="h-screen w-full flex items-center justify-center">
          <h2 className="text-3xl font-bold">Contactanos</h2>
        </section>
      </main>

      <Footer />
    </div>
  );
}
