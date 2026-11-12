import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import logo from '@/assets/images/home/logo-transparente.png';

const enlaces = [
  { titulo: 'Productos', ruta: RUTAS.productos },
  { titulo: 'Cursos', ruta: RUTAS.cursos },
  { titulo: 'Publicaciones', ruta: RUTAS.publicaciones },
  { titulo: 'Contáctanos', ruta: RUTAS.contactanos },
];

export default function PiePagina() {
  return <footer className="hy-footer">
    <div className="hy-footer-superior">
      <div className="hy-footer-contenedor hy-footer-principal">
        <div className="hy-footer-marca">
          <Link to={RUTAS.home} aria-label="Hycon, volver al inicio"><img src={logo} alt="Hycon" /></Link>
          <p>Equipamiento y conocimiento para trabajar con más comodidad.</p>
        </div>
        <div className="hy-footer-columna"><h2>Explora</h2><ul>{enlaces.map(e => <li key={e.ruta}><Link to={e.ruta}>{e.titulo}</Link></li>)}</ul></div>
        <div className="hy-footer-columna"><h2>Tu cuenta</h2><ul><li><Link to={RUTAS.carrito}>Carrito</Link></li><li><Link to={RUTAS.historial}>Mis compras</Link></li><li><Link to={RUTAS.panelCursos}>Mis cursos</Link></li></ul></div>
        <div className="hy-footer-contacto"><h2>¿Necesitas ayuda para elegir?</h2><p>Conversemos sobre los productos que buscas para tu espacio de trabajo.</p><a href="https://wa.me/51902665565" target="_blank" rel="noreferrer">Escríbenos por WhatsApp <Icon icon="solar:arrow-up-right-linear" width="17" aria-hidden /></a></div>
      </div>
    </div>
    <div className="hy-footer-inferior hy-footer-contenedor"><span>© {new Date().getFullYear()} Hycon. Todos los derechos reservados.</span><span>Ergonomía para cada jornada.</span><a href="https://www.facebook.com/profile.php?id=100063509954652" target="_blank" rel="noreferrer" aria-label="Hycon en Facebook"><Icon icon="ic:baseline-facebook" width="20" aria-hidden /></a></div>
  </footer>;
}
