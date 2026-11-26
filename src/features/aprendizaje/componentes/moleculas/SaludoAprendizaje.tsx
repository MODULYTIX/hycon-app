import { saludoPorHora } from '@/features/aprendizaje/utilidades/panel-aprendizaje';

interface Props {
  nombre: string;
  // Se puede fijar la hora para que las pruebas no dependan del reloj
  ahora?: Date;
}

/** Cabecera del panel: saluda por el nombre, como al entrar a casa. */
export default function SaludoAprendizaje({ nombre, ahora = new Date() }: Props) {
  const inicial = nombre.trim().charAt(0).toUpperCase();

  return (
    <header className="flex items-center gap-4">
      <span
        aria-hidden
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-[19px] font-semibold text-white"
      >
        {inicial}
      </span>

      <div className="min-w-0">
        <h1 className="truncate text-[23px] font-semibold tracking-tight text-g-90 sm:text-[28px]">
          {saludoPorHora(ahora)}, {nombre}
        </h1>
        <p className="mt-0.5 text-[13.5px] text-g-50">Retoma tus cursos donde los dejaste.</p>
      </div>
    </header>
  );
}
