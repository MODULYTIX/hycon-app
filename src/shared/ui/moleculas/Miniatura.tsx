import { useState } from 'react';
import { Icon } from '@iconify/react';

// Imagen pequena de las filas del panel. Si la URL falla se muestra el icono de reserva
export default function Miniatura({
  url,
  iconoReserva,
  clase = 'h-16 w-16',
}: {
  url: string | null;
  iconoReserva: string;
  clase?: string;
}) {
  const [fallo, setFallo] = useState(false);

  if (url && !fallo) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        onError={() => setFallo(true)}
        className={`${clase} shrink-0 rounded-lg border border-hy-10 bg-hy-5 object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${clase} flex shrink-0 items-center justify-center rounded-lg border border-hy-10 bg-hy-5 text-hy-40`}
    >
      <Icon icon={iconoReserva} width="24" height="24" />
    </span>
  );
}
