import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';

interface Props {
  icono: string;
  titulo: string;
  descripcion: string;
}

// Pagina generica para 404 y para las rutas que todavia no tienen contenido
export default function PaginaMensaje({ icono, titulo, descripcion }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-3 px-4 py-24 text-center">
      <Icon icon={icono} width="56" height="56" aria-hidden className="text-g-30" />
      <h1 className="text-[28px] font-medium text-g-80">{titulo}</h1>
      <p className="text-[16px] text-g-50">{descripcion}</p>

      <Link
        to={RUTAS.home}
        className="mt-4 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
