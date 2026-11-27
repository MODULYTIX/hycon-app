import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import logoM3 from '@/assets/images/m3biznovatech.svg';
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
      <div className="hy-contenedor hy-footer-principal">
        <div className="hy-footer-marca">
          <Link to={RUTAS.home} aria-label="Hycon, volver al inicio"><img src={logo} alt="Hycon" /></Link>
          <p>Equipamiento y conocimiento para trabajar con más comodidad.</p>
        </div>
        <div className="hy-footer-columna"><h2>Explora</h2><ul>{enlaces.map(e => <li key={e.ruta}><Link to={e.ruta}>{e.titulo}</Link></li>)}</ul></div>
        <div className="hy-footer-columna"><h2>Tu cuenta</h2><ul><li><Link to={RUTAS.carrito}>Carrito</Link></li><li><Link to={RUTAS.historial}>Mis compras</Link></li><li><Link to={RUTAS.panelCursos}>Mis cursos</Link></li></ul></div>
        <div className="hy-footer-contacto">
          <h2>¿Necesitas ayuda para elegir?</h2>
          <p>Conversemos sobre los productos que buscas para tu espacio de trabajo.</p>
          <ul className="hy-footer-redes">
            <li><a href="https://wa.me/51902665565" target="_blank" rel="noreferrer">
              <Icon icon="mdi:whatsapp" width="18" aria-hidden /> Escríbenos por WhatsApp
            </a></li>
            <li><a href="https://www.facebook.com/profile.php?id=100063509954652" target="_blank" rel="noreferrer">
              <Icon icon="ic:baseline-facebook" width="18" aria-hidden /> Búscanos en Facebook
            </a></li>
          </ul>
        </div>
      </div>
    </div>
    <div className="hy-footer-inferior hy-contenedor"><span>© {new Date().getFullYear()} Hycon. Todos los derechos reservados.</span><p className="hy-footer-credito">Desarrollado por <a href="https://m3biznovatech.com/"><img src={logoM3} width={22} height={22} alt="" />M3Biznovatech</a></p></div>
  </footer>;
}
