import HeroBackground from '../assets/images/hero-background.webp';
import HeroPersona from '../assets/images/hero-persona.webp';
import Header from './Header';

export default function Hero() {
  return (
    <div className="relative w-full min-h-screen">
      <div>
        <Header />
      </div>
      <img
        src={HeroBackground}
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex items-center justify-around min-h-screen text-white " >
        <div className="w-[554px] space-y-4">
          <h1 className="text-white text-8xl font-BostNoBillsColombo">HYCON AREQUIPA</h1>
          <p className="text-white text-justify">
            Brindamos servicio Courier y contamos con una plataforma web y
            aplicativo móvil que permitirán a nuestros repartidores actualizar
            el estado de los pedidos y resolver inconvenientes en las entregas
            en la ciudad de AREQUIPA, manteniendo una coordinación constante con
            el ECOMMERCE.
          </p>
          <button className="px-3 py-2 bg-primary text-white font-medium rounded-lg">
            Contactanos
          </button>
        </div>
        <div className="max-w-[400px]">
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
