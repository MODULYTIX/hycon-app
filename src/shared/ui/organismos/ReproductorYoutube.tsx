import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@iconify/react';
import { useReproductorYoutube } from '@/shared/hooks/useReproductorYoutube';
import { formatearTiempo } from '@/shared/utilidades/youtube';

interface Props {
  id: string;
  titulo: string;
  inicio?: number;
}

// Tras este tiempo sin mover el raton, los controles se esconden mientras se reproduce
const OCULTAR_CONTROLES_MS = 2500;

const BOTON_CONTROL =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40';

/**
 * Reproductor con los controles de la web. YouTube pone la imagen; la barra, los botones
 * y los clics los gestiona Hycon, asi nada en el reproductor lleva a youtube.com.
 */
export default function ReproductorYoutube({ id, titulo, inicio = 0 }: Props) {
  const marcoRef = useRef<HTMLDivElement>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [controlesVisibles, setControlesVisibles] = useState(true);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  const { estado, alternarReproduccion, buscar, alternarSonido, cambiarVolumen } =
    useReproductorYoutube(id, inicio, contenedorRef);
  const { listo, reproduciendo, actual, duracion, silenciado, volumen, error } = estado;

  const mostrarControles = useCallback(() => {
    setControlesVisibles(true);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setControlesVisibles(false), OCULTAR_CONTROLES_MS);
  }, []);

  // En pausa los controles quedan fijos; al reproducir empiezan a esconderse solos
  useEffect(() => {
    if (reproduciendo) mostrarControles();
    else {
      clearTimeout(temporizador.current);
      setControlesVisibles(true);
    }
  }, [reproduciendo, mostrarControles]);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  useEffect(() => {
    const alCambiar = () => setPantallaCompleta(document.fullscreenElement === marcoRef.current);
    document.addEventListener('fullscreenchange', alCambiar);
    return () => document.removeEventListener('fullscreenchange', alCambiar);
  }, []);

  const alternarPantallaCompleta = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void marcoRef.current?.requestFullscreen?.();
  };

  const alPulsarTecla = (evento: KeyboardEvent<HTMLDivElement>) => {
    const acciones: Record<string, () => void> = {
      ' ': alternarReproduccion,
      k: alternarReproduccion,
      ArrowRight: () => buscar(actual + 5),
      ArrowLeft: () => buscar(actual - 5),
      m: alternarSonido,
      f: alternarPantallaCompleta,
    };
    // Las teclas dentro de un control (barra de progreso, volumen) se dejan a ese control
    if (evento.target !== evento.currentTarget) return;
    const accion = acciones[evento.key];
    if (!accion) return;
    evento.preventDefault();
    mostrarControles();
    accion();
  };

  const visibles = controlesVisibles || !reproduciendo;
  const progreso = duracion > 0 ? (actual / duracion) * 100 : 0;

  return (
    <div
      ref={marcoRef}
      role="region"
      aria-label={`Reproductor: ${titulo}`}
      tabIndex={0}
      onKeyDown={alPulsarTecla}
      onMouseMove={mostrarControles}
      onMouseLeave={() => reproduciendo && setControlesVisibles(false)}
      className={`relative w-full overflow-hidden bg-black outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        pantallaCompleta ? 'h-full' : 'aspect-video'
      } ${visibles ? '' : 'cursor-none'}`}
    >
      {/* YouTube inserta aqui su iframe */}
      <div
        ref={contenedorRef}
        data-testid="lienzo-video"
        className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full"
      />

      {/* Capa transparente encima del video: recibe los clics para pausar y reanudar,
          y evita que un clic en el titulo o el logo abra youtube.com */}
      <div
        aria-hidden
        data-testid="capa-video"
        onClick={() => {
          mostrarControles();
          alternarReproduccion();
        }}
        onDoubleClick={alternarPantallaCompleta}
        className="absolute inset-0 z-10 flex items-center justify-center"
      >
        {!listo && !error && (
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-white/25 border-t-white" />
        )}
        {listo && !reproduciendo && !error && (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 sm:h-20 sm:w-20">
            <Icon icon="solar:play-bold" width="34" height="34" className="ml-1" />
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-g-90 px-6 text-center text-white"
        >
          <Icon icon="solar:videocamera-record-broken" width="40" height="40" aria-hidden className="text-white/60" />
          <p className="max-w-[420px] text-[15px]">{error}</p>
        </div>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-g-90/85 px-3 pb-2 pt-1.5 transition-opacity duration-200 sm:px-4 ${
          visibles && !error ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Barra solida con el color de la web; el input invisible encima da el arrastre y el teclado */}
        <div className="group/progreso relative flex h-4 items-center">
          <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full bg-primary" style={{ width: `${progreso}%` }} />
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white shadow transition-transform group-hover/progreso:scale-110"
            style={{ left: `${progreso}%` }}
          />
          <input
            type="range"
            aria-label="Progreso del video"
            aria-valuetext={`${formatearTiempo(actual)} de ${formatearTiempo(duracion)}`}
            min={0}
            max={duracion || 0}
            step={0.1}
            value={Math.min(actual, duracion || 0)}
            disabled={!listo}
            onChange={(evento) => buscar(Number(evento.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
          />
        </div>

        <div className="mt-1.5 flex items-center gap-1">
          <button
            type="button"
            onClick={alternarReproduccion}
            disabled={!listo}
            aria-label={reproduciendo ? 'Pausar' : 'Reproducir'}
            className={BOTON_CONTROL}
          >
            <Icon icon={reproduciendo ? 'solar:pause-bold' : 'solar:play-bold'} width="20" height="20" aria-hidden />
          </button>

          <button
            type="button"
            onClick={alternarSonido}
            disabled={!listo}
            aria-label={silenciado ? 'Activar sonido' : 'Silenciar'}
            className={BOTON_CONTROL}
          >
            <Icon
              icon={silenciado || volumen === 0 ? 'solar:muted-bold' : 'solar:volume-loud-bold'}
              width="20"
              height="20"
              aria-hidden
            />
          </button>

          <input
            type="range"
            aria-label="Volumen"
            min={0}
            max={100}
            value={silenciado ? 0 : volumen}
            disabled={!listo}
            onChange={(evento) => cambiarVolumen(Number(evento.target.value))}
            className="hidden h-1 w-20 cursor-pointer accent-white sm:block"
          />

          <span className="ml-2 text-[12.5px] font-medium tabular-nums text-white/90">
            {formatearTiempo(actual)} / {formatearTiempo(duracion)}
          </span>

          <button
            type="button"
            onClick={alternarPantallaCompleta}
            aria-label={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className={`${BOTON_CONTROL} ml-auto`}
          >
            <Icon
              icon={pantallaCompleta ? 'solar:minimize-square-linear' : 'solar:maximize-square-linear'}
              width="20"
              height="20"
              aria-hidden
            />
          </button>
        </div>
      </div>
    </div>
  );
}
