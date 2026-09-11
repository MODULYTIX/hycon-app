import Hero from '@/features/home/componentes/organismos/Hero';
import Servicios from '@/features/home/componentes/organismos/Servicios';
import PlataformaAsociada from '@/features/home/componentes/organismos/PlataformaAsociada';
import NuestrosClientes from '@/features/home/componentes/organismos/NuestrosClientes';

export default function PaginaHome() {
  return (
    <>
      <section id="hero">
        <Hero />
      </section>

      <section id="servicios" className="flex min-h-screen items-center justify-center">
        <Servicios />
      </section>

      <section
        id="plataforma_asociada"
        className="flex min-h-screen items-center justify-center"
      >
        <PlataformaAsociada />
      </section>

      <section id="nuestros_clientes" className="flex items-center justify-center bg-g-10">
        <NuestrosClientes />
      </section>
    </>
  );
}
