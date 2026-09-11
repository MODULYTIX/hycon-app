import FormularioContacto from '@/features/contacto/componentes/organismos/FormularioContacto';

export default function PaginaContacto() {
  return (
    <>
      <h1 className="sr-only">Contactanos</h1>

      <section id="contactanos" className="flex items-center justify-center">
        <FormularioContacto />
      </section>
    </>
  );
}
