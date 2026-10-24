import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import MensajeCampo from '@/shared/ui/atomos/MensajeCampo';
import { revisarVideo, subirVideoApi, type AlmacenVideos } from '@/shared/servicios/videos.api';
import { esVideoSubido, nombreDeVideoSubido } from '@/shared/utilidades/video';
import { formatearTamano } from '@/shared/utilidades/imagenes';

interface Props {
  cursoUuid: string;
  // El enlace de YouTube o la referencia del video ya subido
  valor: string;
  onCambiar: (valor: string) => void;
  error?: string;
  // Lo que el servidor acepta; null mientras se consulta o si no se pudo saber
  almacen: AlmacenVideos | null;
}

/** El video de una parte: un enlace de YouTube o un archivo subido a nuestro almacen. */
export default function ZonaVideo({ cursoUuid, valor, onCambiar, error, almacen }: Props) {
  const entradaRef = useRef<HTMLInputElement>(null);
  const abortarRef = useRef<AbortController | null>(null);
  const [porcentaje, setPorcentaje] = useState<number | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string>();

  const subido = esVideoSubido(valor);
  const subiendo = porcentaje !== null;

  const subir = async (archivo: File | undefined) => {
    if (!archivo || !almacen) return;

    const problema = revisarVideo(archivo, almacen);
    setErrorArchivo(problema);
    if (problema) return;

    const control = new AbortController();
    abortarRef.current = control;
    setPorcentaje(0);
    try {
      const referencia = await subirVideoApi(cursoUuid, archivo, setPorcentaje, control.signal);
      onCambiar(referencia);
    } catch (fallo: unknown) {
      setErrorArchivo(fallo instanceof Error ? fallo.message : 'No se pudo subir el video');
    } finally {
      setPorcentaje(null);
      abortarRef.current = null;
      if (entradaRef.current) entradaRef.current.value = '';
    }
  };

  const quitar = () => {
    setErrorArchivo(undefined);
    onCambiar('');
  };

  if (subiendo) {
    return (
      <div className="rounded-lg border border-hy-20 bg-hy-5 px-3 py-3">
        <p className="flex items-center justify-between gap-3 text-[13px] font-medium text-hy-tinta">
          <span className="inline-flex items-center gap-2">
            <Icon icon="solar:cloud-upload-linear" width="16" height="16" aria-hidden />
            Subiendo el video
          </span>
          <span className="tabular-nums text-hy-70">{porcentaje}%</span>
        </p>

        <div
          role="progressbar"
          aria-label="Avance de la subida"
          aria-valuenow={porcentaje}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hy-20"
        >
          <div className="h-full bg-hy-60" style={{ width: `${porcentaje}%` }} />
        </div>

        <button
          type="button"
          onClick={() => abortarRef.current?.abort()}
          className="mt-2 text-[12.5px] font-semibold text-g-50 hover:text-red-600"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div>
      {subido ? (
        <>
          <span className="mb-1.5 block text-[13px] font-semibold text-hy-tinta">Video</span>
          <div className="flex items-center gap-3 rounded-lg border border-hy-20 bg-hy-5 px-3 py-2.5">
            <Icon
              icon="solar:videocamera-record-linear"
              width="18"
              height="18"
              aria-hidden
              className="shrink-0 text-hy-60"
            />
            <p className="min-w-0 flex-1 truncate text-[13px] text-hy-tinta">
              {nombreDeVideoSubido(valor)}
            </p>
            <button
              type="button"
              onClick={quitar}
              className="shrink-0 text-[12.5px] font-semibold text-g-50 hover:text-red-600"
            >
              Quitar
            </button>
          </div>
        </>
      ) : (
        <CampoTexto
          id="leccion-videoUrl"
          etiqueta="URL del video"
          placeholder="https://www.youtube.com/watch?v=..."
          inputMode="url"
          opcional
          value={valor}
          error={error}
          onChange={(evento) => onCambiar(evento.target.value)}
        />
      )}

      <MensajeCampo id="leccion-video-archivo" error={errorArchivo} />

      {almacen?.aceptaSubidas && !subido && (
        <>
          <input
            ref={entradaRef}
            type="file"
            accept={almacen.extensiones.map((extension) => `.${extension}`).join(',')}
            aria-label="Elegir el archivo del video"
            className="sr-only"
            tabIndex={-1}
            onChange={(evento) => void subir(evento.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => entradaRef.current?.click()}
            className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-hy-60 hover:text-hy-80"
          >
            <Icon icon="solar:cloud-upload-linear" width="15" height="15" aria-hidden />
            Subir un archivo en su lugar
          </button>
          <span className="ml-2 text-[12px] text-g-40">
            {almacen.extensiones.join(', ').toUpperCase()} · máx.{' '}
            {formatearTamano(almacen.maximoMb * 1024 * 1024)}
          </span>
        </>
      )}
    </div>
  );
}
