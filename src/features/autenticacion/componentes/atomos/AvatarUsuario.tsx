import { obtenerIniciales } from '@/features/autenticacion/utilidades/opciones-cuenta';
import type { Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

interface Props {
  usuario: Usuario;
  tamano?: 'sm' | 'md';
}

// Muestra la foto del usuario y, si no tiene, sus iniciales sobre el color de marca
export default function AvatarUsuario({ usuario, tamano = 'md' }: Props) {
  const medidas = tamano === 'sm' ? 'h-9 w-9 text-[13px]' : 'h-11 w-11 text-[15px]';

  if (usuario.avatarUrl) {
    return (
      <img
        src={usuario.avatarUrl}
        alt={`${usuario.name} ${usuario.lastname}`}
        draggable={false}
        className={`${medidas} shrink-0 rounded-full border-2 border-white/80 object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${medidas} flex shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-white font-bold text-primary`}
    >
      {obtenerIniciales(usuario.name, usuario.lastname)}
    </span>
  );
}
