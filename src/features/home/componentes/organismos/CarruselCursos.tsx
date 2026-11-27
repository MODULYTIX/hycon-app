import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaCursoDetalle } from '@/app/rutas/rutas';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';
import { formatearPrecio } from '@/shared/utilidades/formato';
import { miniaturaYoutube } from '@/shared/utilidades/youtube';

const INTERVALO = 6000;

export default function CarruselCursos({ cursos }: { cursos: Curso[] }) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [encima, setEncima] = useState(false);
  const [enFoco, setEnFoco] = useState(false);
  const [movimientoReducido, setMovimientoReducido] = useState(false);
  const total = cursos.length;

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;
    const actualizar = () => setMovimientoReducido(media.matches);
    actualizar();
    media.addEventListener('change', actualizar);
    return () => media.removeEventListener('change', actualizar);
  }, []);

  useEffect(() => {
    if (total < 2 || pausado || encima || enFoco || movimientoReducido) return;
    const reloj = window.setInterval(() => {
      if (!document.hidden) setIndice(actual => (actual + 1) % total);
    }, INTERVALO);
    return () => window.clearInterval(reloj);
  }, [total, pausado, encima, enFoco, movimientoReducido]);

  if (!total) return null;

  const actual = indice % total;
  const curso = cursos[actual];
  const imagen = curso.thumbnailUrl || (curso.youtubeId ? miniaturaYoutube(curso.youtubeId) : null);
  const mover = (paso: number) => setIndice(i => (i + paso + total) % total);

  return (
    <div className="home-cursos-carrusel" role="group" aria-label="Cursos destacados"
      onMouseEnter={() => setEncima(true)} onMouseLeave={() => setEncima(false)}
      onFocusCapture={() => setEnFoco(true)}
      onBlurCapture={evento => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setEnFoco(false);
      }}>
      <div className="home-cursos-lista">
        <Link key={curso.uuid} to={rutaCursoDetalle(curso.uuid)}>
          <span className="home-curso-imagen">
            {imagen ? <img src={imagen} alt="" loading="lazy" /> : <Icon icon="solar:diploma-linear" width="38" aria-hidden />}
          </span>
          <span className="home-curso-datos">
            <small>Curso</small>
            <strong>{curso.name}</strong>
            <span>{formatearPrecio(curso.discountPrice ?? curso.price)}</span>
          </span>
          <Icon icon="solar:arrow-up-right-linear" width="20" aria-hidden />
        </Link>
      </div>

      {total > 1 && (
        <div className="home-cursos-controles">
          <button type="button" onClick={() => mover(-1)} aria-label="Curso anterior">
            <Icon icon="solar:arrow-left-linear" width="20" aria-hidden />
          </button>
          <span aria-live={enFoco || pausado ? 'polite' : 'off'}>{actual + 1} de {total}</span>
          <button type="button" onClick={() => mover(1)} aria-label="Siguiente curso">
            <Icon icon="solar:arrow-right-linear" width="20" aria-hidden />
          </button>
          {!movimientoReducido && (
            <button type="button" onClick={() => setPausado(valor => !valor)}
              aria-label={pausado ? 'Reanudar carrusel de cursos' : 'Pausar carrusel de cursos'}>
              <Icon icon={pausado ? 'solar:play-linear' : 'solar:pause-linear'} width="20" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
