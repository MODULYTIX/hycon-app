import { useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import { actualizarPerfilApi } from '@/features/autenticacion/servicios/autenticacion.api';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { revisarPerfil, type ErroresPerfil } from '@/features/perfil/utilidades/validaciones-perfil';
import type { Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

export default function DatosPersonales({ usuario }: { usuario: Usuario }) {
  const { actualizarUsuario } = useAutenticacion();
  const [datos, setDatos] = useState({
    name: usuario.name,
    lastname: usuario.lastname,
    phone: usuario.phone ?? '',
  });
  const [errores, setErrores] = useState<ErroresPerfil>({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cambiar = (campo: keyof typeof datos, valor: string) => {
    setDatos((previo) => ({ ...previo, [campo]: valor }));
    setErrores((previo) => ({ ...previo, [campo]: undefined }));
    setAviso(null);
    setError(null);
  };

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();
    const fallos = revisarPerfil(datos);
    setErrores(fallos);
    if (Object.keys(fallos).length > 0) return;

    setGuardando(true);
    setError(null);
    try {
      const actualizado = await actualizarPerfilApi({
        name: datos.name.trim(),
        lastname: datos.lastname.trim(),
        // Un telefono vacio borra el que hubiera
        phone: datos.phone.trim(),
      });
      actualizarUsuario(actualizado);
      setAviso('Datos guardados');
    } catch (fallo: unknown) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudieron guardar los datos');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section aria-labelledby="titulo-datos" className="min-w-0 rounded-xl border border-g-20 bg-white p-5 shadow-sm">
      <h2 id="titulo-datos" className="text-[16px] font-semibold tracking-tight text-g-90">
        Datos personales
      </h2>

      <form onSubmit={guardar} noValidate className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            id="perfil-nombre"
            etiqueta="Nombre"
            autoComplete="given-name"
            value={datos.name}
            error={errores.name}
            onChange={(evento) => cambiar('name', evento.target.value)}
          />
          <CampoTexto
            id="perfil-apellido"
            etiqueta="Apellido"
            autoComplete="family-name"
            value={datos.lastname}
            error={errores.lastname}
            onChange={(evento) => cambiar('lastname', evento.target.value)}
          />
        </div>

        <CampoTexto
          id="perfil-telefono"
          etiqueta="Teléfono"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+51 902 665 565"
          opcional
          value={datos.phone}
          error={errores.phone}
          ayuda="Lo usamos para coordinar entregas"
          onChange={(evento) => cambiar('phone', evento.target.value)}
        />

        <div>
          <CampoTexto
            id="perfil-correo"
            etiqueta="Correo electrónico"
            type="email"
            value={usuario.email}
            readOnly
            disabled
          />
          <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-g-50">
            <Icon icon="solar:lock-keyhole-minimalistic-linear" width="14" height="14" aria-hidden className="mt-0.5 shrink-0" />
            Tu correo identifica la cuenta. Para cambiarlo escríbenos y lo verificamos contigo.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={guardando}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-marca-oscuro disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {aviso && (
            <p role="status" className="inline-flex items-center gap-1.5 text-[13.5px] text-primary">
              <Icon icon="solar:check-circle-bold" width="16" height="16" aria-hidden />
              {aviso}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
