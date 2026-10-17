// import FormularioContacto from '@/features/contacto/componentes/organismos/FormularioContacto';
import FormularioCotizacion from '@/features/contacto/componentes/organismos/FormularioCotizacion';

export default function PaginaContacto() {
  return (
    <>
      <h1 className="sr-only">Contactanos</h1>

      {/* Formulario anterior de Ecommerce y Repartidor. Queda a la espera porque
          enviaba a /hycon/enviar, una ruta que el backend ya no tiene.
      <section id="contactanos" className="flex items-center justify-center">
        <FormularioContacto />
      </section>
      */}

      <section id="cotizacion" className="px-5 py-10 sm:px-7">
        <FormularioCotizacion />
      </section>
    </>
  );
}
