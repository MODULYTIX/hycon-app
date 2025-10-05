import HeroBackground from '../assets/images/hero-background.webp';
import HeroPersona from '../assets/images/hero-persona.webp';
import Header from './Header';

export default function Hero() {
  return (
    <div className="relative w-full min-h-screen">
      {/* Header encima del hero */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Fondo + overlay */}
      <img
        src={HeroBackground}
        alt="Hero Background"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Contenido */}
      <div
        className="
          relative z-10 flex min-h-screen
          flex-col md:flex-row            /* móvil: columna | md+: fila */
          items-center                   /* centrado en móvil */
          md:items-stretch               /* que ocupen la altura en md+ */
          justify-between gap-8
          px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto text-white
        ">
        {/* Texto */}
        <div className="w-full md:max-w-[554px] space-y-4 text-center md:text-left justify-center flex flex-col">
          <h1
            className="text-white font-BostNoBillsColombo
                       text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl pt-12">
            HYCON AREQUIPA
          </h1>

          <p className="text-white/95 text-justify md:text-left">
            Brindamos servicio Courier y contamos con una plataforma web y
            aplicativo móvil que permitirán a nuestros repartidores actualizar
            el estado de los pedidos y resolver inconvenientes en las entregas
            en la ciudad de AREQUIPA, manteniendo una coordinación constante con
            el ECOMMERCE.
          </p>

          <div className="flex md:block">
            <button className="mx-auto md:mx-0 px-3 py-2 bg-primary text-white font-medium rounded-lg">
              Contactanos
            </button>
          </div>
        </div>

        {/* Imagen: siempre debajo en móvil; en md+ alineada al PIE */}
        <div
          className="
            w-full max-w-[400px] mx-auto md:mx-0
            md:self-end         
          ">
          <img
            src={HeroPersona}
            alt="Persona"
            draggable={false}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
