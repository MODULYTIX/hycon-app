import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { quitarAvatarApi, subirAvatarApi } from '@/features/autenticacion/servicios/autenticacion.api';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { obtenerIniciales } from '@/features/autenticacion/utilidades/opciones-cuenta';
import type { Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

// El backend acepta estos formatos hasta 5 MB; se comprueba antes de subir
const FORMATOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TAMANO_MAXIMO = 5 * 1024 * 1024;

export default function FotoPerfil({ usuario }: { usuario: Usuario }) {
  const { actualizarUsuario } = useAutenticacion();
  const entrada = useRef<HTMLInputElement>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ejecutar = async (accion: () => Promise<Usuario>) => {
    setTrabajando(true);
    setError(null);
    try {
      actualizarUsuario(await accion());
    } catch (fallo: unknown) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo cambiar la foto');
    } finally {
      setTrabajando(false);
    }
  };

  const elegirArchivo = (archivo: File | undefined) => {
    if (!archivo) return;
    if (!FORMATOS.includes(archivo.type)) {
      setError('La foto debe ser JPG, PNG, WEBP o GIF');
      return;
    }
    if (archivo.size > TAMANO_MAXIMO) {
      setError('La foto no puede pesar más de 5 MB');
      return;
    }
    void ejecutar(() => subirAvatarApi(archivo));
  };

  return (
    <section aria-labelledby="titulo-foto" className="min-w-0 rounded-xl border border-g-20 bg-white p-5 shadow-sm">
      <h2 id="titulo-foto" className="text-[16px] font-semibold tracking-tight text-g-90">
        Foto de perfil
      </h2>

      <div className="mt-5 flex flex-wrap items-center gap-5">
        <div className="relative">
          {usuario.avatarUrl ? (
            <img
              src={usuario.avatarUrl}
              alt={`Foto de ${usuario.name}`}
              className="h-24 w-24 rounded-full object-cover ring-1 ring-g-20"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-24 w-24 items-center justify-center rounded-full bg-hy-10 text-[28px] font-semibold text-primary"
            >
              {obtenerIniciales(usuario.name, usuario.lastname)}
            </span>
          )}
          {trabajando && (
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70"
            >
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <p className="text-[13px] leading-relaxed text-g-50">
            JPG, PNG, WEBP o GIF, hasta 5 MB. Se verá en tu menú y en tus pedidos.
          </p>

          <div className="flex flex-wrap gap-2">
            <input
              ref={entrada}
              type="file"
              accept={FORMATOS.join(',')}
              className="sr-only"
              aria-label="Elegir foto de perfil"
              onChange={(evento) => {
                elegirArchivo(evento.target.files?.[0]);
                // Permite volver a elegir el mismo archivo si hubo un fallo
                evento.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => entrada.current?.click()}
              disabled={trabajando}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro disabled:opacity-60"
            >
              <Icon icon="solar:camera-linear" width="16" height="16" aria-hidden />
              {usuario.avatarUrl ? 'Cambiar foto' : 'Subir foto'}
            </button>

            {usuario.avatarUrl && (
              <button
                type="button"
                onClick={() => void ejecutar(quitarAvatarApi)}
                disabled={trabajando}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-g-20 px-4 text-[13px] text-g-50 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
              >
                <Icon icon="solar:trash-bin-trash-bold" width="16" height="16" aria-hidden />
                Quitar
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
