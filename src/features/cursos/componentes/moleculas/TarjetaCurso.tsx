import { useRef, useState } from 'react';
import ModalCompraRapida from '@/features/carrito/componentes/organismos/ModalCompraRapida';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaCursoDetalle } from '@/app/rutas/rutas';
import { formatearDuracion, formatearPrecio } from '@/shared/utilidades/formato';
import { miniaturaYoutube } from '@/shared/utilidades/youtube';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

interface Props {
  curso: Curso;
  onVerAvance?: (curso: Curso) => void;
}

export default function TarjetaCurso({ curso, onVerAvance }: Props) {
  const [compraAbierta, setCompraAbierta] = useState(false);
  const botonCompra = useRef<HTMLButtonElement>(null);
  const precio = Math.min(curso.price, curso.discountPrice ?? curso.price);
  const enOferta = precio < curso.price;
  const portada = curso.thumbnailUrl ?? (curso.youtubeId ? miniaturaYoutube(curso.youtubeId) : null);

  return (
    <li className="home-producto productos-tarjeta cursos-tarjeta">
      <Link to={rutaCursoDetalle(curso.uuid)} aria-label={`Ver detalles de ${curso.name}`}>
        <div className="home-producto-titulo productos-tarjeta-titulo">
          <h3>{curso.name}</h3>
        </div>
        <div className="home-producto-imagen productos-tarjeta-foto">
          {portada
            ? <img src={portada} alt={curso.name} draggable={false} loading="lazy" />
            : <Icon icon="solar:diploma-linear" width="48" aria-hidden />}
          {enOferta && (
            <span className="home-producto-oferta">
              <span className="sr-only">Oferta: </span>−{Math.round((1 - precio / curso.price) * 100)}%
            </span>
          )}
          {curso.durationMinutes !== null && (
            <span className="cursos-duracion">
              <Icon icon="solar:clock-circle-linear" width="13" aria-hidden />
              {formatearDuracion(curso.durationMinutes)}
            </span>
          )}
        </div>
        <span className="productos-vista-rapida" aria-hidden>
          <Icon icon="solar:magnifer-linear" width="19" />
        </span>
        <div className="home-producto-info">
          <div className="home-producto-precios">
            <strong>{formatearPrecio(precio)}</strong>
            {enOferta && <del>{formatearPrecio(curso.price)}</del>}
          </div>
          {curso.description && <p className="cursos-descripcion line-clamp-2">{curso.description}</p>}
        </div>
      </Link>
      <button ref={botonCompra} type="button" className="productos-compra-rapida"
        aria-label={`Agregar ${curso.name} al carrito`} aria-haspopup="dialog" title="Agregar al carrito"
        onClick={() => setCompraAbierta(true)}>
        <Icon icon="solar:cart-plus-linear" width="19" aria-hidden />
      </button>
      {compraAbierta && <ModalCompraRapida articulo={{ ...curso, tipo: 'curso', imagen: portada }} precio={precio}
        onCerrar={() => {
          setCompraAbierta(false);
          botonCompra.current?.focus({ preventScroll: true });
        }} />}
      {curso.videoUrl && onVerAvance && (
        <button type="button" onClick={() => onVerAvance(curso)} className="cursos-avance">
          <Icon icon="solar:play-circle-linear" width="16" aria-hidden />
          Ver avance
        </button>
      )}
    </li>
  );
}
