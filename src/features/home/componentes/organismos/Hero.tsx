import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { RUTAS } from '@/app/rutas/rutas';
import hero from '@/assets/images/home/hero-ergonomia.webp';
import escritorio from '@/assets/images/home/categoria-escritorios.webp';
import ambiente from '@/assets/images/home/ambiente-trabajo.webp';
import '../../paginas/home.css';

const escenas = [
  { imagen: hero, nombre: 'Tu espacio de trabajo' },
  { imagen: escritorio, nombre: 'Un escritorio a tu medida' },
  { imagen: ambiente, nombre: 'Comodidad para cada jornada', invertida: true },
];

export default function Hero() {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [interaccion, setInteraccion] = useState(false);
  const [movimientoReducido, setMovimientoReducido] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const actualizar = () => setMovimientoReducido(media.matches);
    actualizar();
    media.addEventListener('change', actualizar);
    return () => media.removeEventListener('change', actualizar);
  }, []);
  useEffect(() => {
    if (pausado || interaccion || movimientoReducido) return;
    const temporizador = window.setInterval(() => {
      if (!document.hidden) setActual(indice => (indice + 1) % escenas.length);
    }, 7000);
    return () => window.clearInterval(temporizador);
  }, [pausado, interaccion, movimientoReducido]);

  return <section className="home-hero" aria-labelledby="home-titulo"
    onMouseEnter={() => setInteraccion(true)} onMouseLeave={() => setInteraccion(false)}
    onFocusCapture={() => setInteraccion(true)}
    onBlurCapture={evento => { if (!evento.currentTarget.contains(evento.relatedTarget)) setInteraccion(false); }}>
    {escenas.map((escena, indice) => <img key={escena.imagen}
      className={`home-hero-foto home-hero-escena ${escena.invertida ? 'home-hero-foto-invertida' : ''} ${actual === indice ? 'home-hero-escena-activa' : ''}`}
      src={escena.imagen} alt="" aria-hidden fetchPriority={indice === 0 ? 'high' : 'low'} />)}
    <div className="home-hero-sombra" />
    <div className="home-hero-contenido home-contenedor">
      <p className="home-hero-kicker">Hycon · Ergonomía para cada jornada</p>
      <h1 id="home-titulo">Tu espacio de trabajo, mejor pensado.</h1>
      <p>Descubre productos ergonómicos para trabajar con más comodidad, en la oficina o desde casa.</p>
      <div className="home-hero-acciones"><Link className="home-boton home-boton-claro" to={RUTAS.productos}>Comprar productos <Icon icon="solar:arrow-right-linear" width="18" aria-hidden /></Link><Link className="home-boton home-boton-contorno" to={RUTAS.cursos}>Explorar cursos</Link></div>
    </div>
    <div className="home-hero-controles" aria-label="Ambientes del espacio de trabajo">
      {escenas.map((escena, indice) => <button key={escena.nombre} type="button" aria-label={`Mostrar ambiente ${indice + 1}: ${escena.nombre}`} aria-pressed={actual === indice} onClick={() => { setActual(indice); setPausado(true); }}><span /></button>)}
      {!movimientoReducido && <button type="button" className="home-hero-pausa" aria-label={pausado ? 'Reanudar imágenes' : 'Pausar imágenes'} onClick={() => setPausado(valor => !valor)}><Icon icon={pausado ? 'solar:play-linear' : 'solar:pause-linear'} width="16" aria-hidden /></button>}
    </div>
  </section>;
}
