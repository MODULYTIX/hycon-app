import { useId, useRef, useState, type DragEvent } from 'react';
import { useUrlTemporal } from '@/shared/hooks/useUrlTemporal';
import { Icon } from '@iconify/react';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import MensajeCampo from '@/shared/ui/atomos/MensajeCampo';
import { formatearTamano, validarArchivoImagen } from '@/shared/utilidades/imagenes';
import { esUrlValida } from '@/shared/utilidades/validaciones-comunes';

export interface ValorImagen {
  // Archivo elegido en el equipo, pendiente de subir al guardar
  archivo: File | null;
  // URL pegada a mano o la que ya tenia el registro
  url: string;
}

interface Props {
  etiqueta: string;
  valor: ValorImagen;
  onCambiar: (valor: ValorImagen) => void;
  error?: string;
  // Proporcion de la vista previa: cuadrada para productos, 16:9 para cursos
  proporcion?: 'cuadrada' | 'video';
}

export default function ZonaImagen({
  etiqueta,
  valor,
  onCambiar,
  error,
  proporcion = 'cuadrada',
}: Props) {
  const idBase = useId();
  const entradaRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState<string>();
  // El campo de URL queda oculto hasta pedirlo: al editar basta con la vista previa
  const [usarUrl, setUsarUrl] = useState(false);

  const urlTemporal = useUrlTemporal(valor.archivo);
  const vistaPrevia = valor.archivo
    ? urlTemporal
    : esUrlValida(valor.url.trim())
      ? valor.url.trim()
      : null;
  const hayImagen = Boolean(valor.archivo) || Boolean(vistaPrevia);

  const elegirArchivo = (archivo: File | undefined) => {
    if (!archivo) return;
    const problema = validarArchivoImagen(archivo);
    setErrorArchivo(problema);
    if (problema) return;
    // El archivo sustituye a la URL anterior: al guardar se sube y se usa la nueva
    onCambiar({ archivo, url: '' });
    setUsarUrl(false);
  };

  const quitar = () => {
    setErrorArchivo(undefined);
    onCambiar({ archivo: null, url: '' });
    if (entradaRef.current) entradaRef.current.value = '';
  };

  const alSoltar = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    setArrastrando(false);
    elegirArchivo(evento.dataTransfer.files?.[0]);
  };

  const abrirSelector = () => entradaRef.current?.click();

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span id={`${idBase}-etiqueta`} className="text-[13px] font-semibold text-hy-tinta">
          {etiqueta}
        </span>
        <span className="text-[12px] text-g-40">Opcional</span>
      </div>

      <input
        ref={entradaRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        aria-label={`Elegir archivo para ${etiqueta.toLowerCase()}`}
        className="sr-only"
        tabIndex={-1}
        onChange={(evento) => elegirArchivo(evento.target.files?.[0])}
      />

      <div
        role="group"
        aria-labelledby={`${idBase}-etiqueta`}
        data-arrastrando={arrastrando || undefined}
        onDragEnter={(evento) => {
          evento.preventDefault();
          setArrastrando(true);
        }}
        onDragOver={(evento) => evento.preventDefault()}
        onDragLeave={(evento) => {
          // Al pasar sobre un hijo tambien salta dragleave: solo cuenta si sale del todo
          if (!evento.currentTarget.contains(evento.relatedTarget as Node)) setArrastrando(false);
        }}
        onDrop={alSoltar}
        className={`relative overflow-hidden rounded-xl border-2 transition-colors ${
          proporcion === 'video' ? 'aspect-video' : 'aspect-square'
        } ${
          arrastrando
            ? 'border-solid border-hy-60 bg-hy-10'
            : hayImagen
              ? 'border-solid border-hy-20 bg-hy-5'
              : 'border-dashed border-hy-30 bg-hy-5 hover:border-hy-50'
        }`}
      >
        {hayImagen && !arrastrando ? (
          <>
            {vistaPrevia ? (
              <img src={vistaPrevia} alt="Vista previa" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-hy-40">
                <Icon icon="solar:gallery-bold" width="48" height="48" aria-hidden />
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-hy-90/85 px-3 py-2 text-white">
              <p className="min-w-0 flex-1 truncate text-[12px]">
                {valor.archivo
                  ? `${valor.archivo.name} · ${formatearTamano(valor.archivo.size)}`
                  : 'Imagen actual'}
              </p>
              <button
                type="button"
                onClick={abrirSelector}
                className="rounded-md px-2 py-1 text-[12px] font-semibold hover:bg-white/15"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={quitar}
                aria-label="Quitar imagen"
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/15"
              >
                <Icon icon="solar:trash-bin-minimalistic-linear" width="16" height="16" aria-hidden />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={abrirSelector}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-hy-60"
          >
            <span
              aria-hidden
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                arrastrando ? 'bg-hy-60 text-white' : 'bg-white text-hy-60'
              }`}
            >
              <Icon icon="solar:upload-minimalistic-bold" width="24" height="24" />
            </span>
            <span className="text-[14px] font-semibold text-hy-80">
              {arrastrando ? 'Suelta la imagen aquí' : 'Arrastra una imagen aquí'}
            </span>
            {!arrastrando && (
              <span className="text-[13px] text-g-50">
                o <span className="font-semibold text-hy-60 underline">elige un archivo</span>
              </span>
            )}
            <span className="text-[12px] text-g-40">JPG, PNG, WEBP o GIF · máx. 5 MB</span>
          </button>
        )}
      </div>

      <MensajeCampo id={`${idBase}-error`} error={errorArchivo ?? (usarUrl ? undefined : error)} />

      {usarUrl ? (
        <div className="mt-3">
          <CampoTexto
            id={`${idBase}-url`}
            etiqueta="URL de la imagen"
            placeholder="https://..."
            inputMode="url"
            value={valor.url}
            error={error}
            onChange={(evento) => onCambiar({ archivo: null, url: evento.target.value })}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setUsarUrl(true)}
          className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-hy-60 hover:text-hy-80"
        >
          <Icon icon="solar:link-minimalistic-2-linear" width="15" height="15" aria-hidden />
          Usar una URL en su lugar
        </button>
      )}
    </div>
  );
}
