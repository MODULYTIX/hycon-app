import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import portada from '@/assets/images/banners/contactanos.webp';
import FormularioCotizacion from '@/features/contacto/componentes/organismos/FormularioCotizacion';
import '@/features/productos/paginas/catalogo-productos.css';
import './contacto.css';

export default function PaginaContacto() {
  return (
    <div className="catalogo-productos pagina-contacto">
      <section className="productos-portada" aria-labelledby="titulo-contacto">
        <img className="productos-portada-foto-editorial" src={portada} alt="" />
        <div className="productos-portada-texto">
          <h1 id="titulo-contacto">Contáctanos</h1>
          <nav className="productos-migas" aria-label="Ruta de navegación">
            <Link to={RUTAS.home}>Inicio</Link>
            <Icon icon="solar:alt-arrow-right-linear" width="14" aria-hidden />
            <span aria-current="page">Contáctanos</span>
          </nav>
          <p>Consulta sobre productos y cursos o solicita una evaluación ergonómica.</p>
        </div>
      </section>
      <div id="cotizacion" className="hy-contenedor contacto-distribucion">
        <aside className="contacto-ayuda" aria-labelledby="titulo-ayuda-contacto">
          <h2 id="titulo-ayuda-contacto">¿En qué te ayudamos?</h2>
          <nav className="contacto-tarjetas" aria-label="Canales de ayuda y catálogos">
            <a href="https://wa.me/51902665565" target="_blank" rel="noreferrer">
              <span className="contacto-insignia" aria-hidden="true"><Icon icon="ic:baseline-whatsapp" width="24" /></span>
              <strong>Escríbenos por WhatsApp</strong>
              <span>+51 902 665 565</span>
            </a>
            <Link to={RUTAS.productos}>
              <span className="contacto-insignia" aria-hidden="true"><Icon icon="solar:box-linear" width="24" /></span>
              <strong>Ver productos</strong>
              <span>Equipamiento ergonómico para tu espacio de trabajo.</span>
            </Link>
            <Link to={RUTAS.cursos}>
              <span className="contacto-insignia" aria-hidden="true"><Icon icon="solar:book-linear" width="24" /></span>
              <strong>Ver cursos</strong>
              <span>Formación en ergonomía y operaciones.</span>
            </Link>
          </nav>
        </aside>
        <FormularioCotizacion />
      </div>
    </div>
  );
}
