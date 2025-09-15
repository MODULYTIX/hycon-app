import Footer from '../components/Footer';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Tittle from '../shared/components/Tittle';
import QS from '../assets/images/QS.png';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section id="hero" className="h-screen w-full">
          <Hero />
        </section>

        <section
          id="quienes_somos"
          className="h-screen w-full flex items-center justify-center border border-black">
          {/* Padre: horizontal + padding interno 200px */}
          <div className="w-full max-w-[1520px] flex items-center justify-between gap-10">
            {/* Columna IZQUIERDA: título + texto (vertical) */}
            <div className="flex flex-col gap-10 max-w-[760px]">
              <Tittle>¿Quiénes somos?</Tittle>

              <p
                className="font-normal text-[30px] leading-[1.5] text-gray-800"
                style={{
                  fontFamily:
                    "Roboto, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
                }}>
                HYCON es una empresa peruana especializada en logística de
                última milla y servicios de fulfillment. Nos enfocamos en hacer
                que cada entrega sea rápida, segura y eficiente, integrando
                todos los canales de pago para que los clientes puedan realizar
                sus compras con total confianza, incluyendo la opción de pago
                contraentrega.
                <br />
                <br />
                Con HYCON, tu negocio crece mientras nosotros nos encargamos de
                que cada pedido llegue a tiempo y sin complicaciones.
              </p>
            </div>

            {/* Columna DERECHA: imagen con máscara (inline, sin componente) */}
            <img
              src={QS}
              alt="Quiénes somos"
              className="w-[540px] h-[600px] object-cover rounded-[22px]"
            />
          </div>
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
