import { useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import IndicadorFuerza from '@/features/autenticacion/componentes/atomos/IndicadorFuerza';
import { cambiarPasswordApi } from '@/features/autenticacion/servicios/autenticacion.api';
import {
  revisarCambioPassword,
  type CamposPassword,
  type ErroresPassword,
} from '@/features/perfil/utilidades/validaciones-perfil';
import type { Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

const VACIO: CamposPassword = { actual: '', nueva: '', repetida: '' };

export default function CambiarPassword({ usuario }: { usuario: Usuario }) {
  const [datos, setDatos] = useState<CamposPassword>(VACIO);
  const [errores, setErrores] = useState<ErroresPassword>({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const personales = { email: usuario.email, name: usuario.name, lastname: usuario.lastname };

  const cambiar = (campo: keyof CamposPassword, valor: string) => {
    setDatos((previo) => ({ ...previo, [campo]: valor }));
    setErrores((previo) => ({ ...previo, [campo]: undefined }));
    setAviso(null);
    setError(null);
  };

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();
    const fallos = revisarCambioPassword(datos, personales);
    setErrores(fallos);
    if (Object.keys(fallos).length > 0) return;

    setGuardando(true);
    setError(null);
    try {
      await cambiarPasswordApi({ actual: datos.actual, nueva: datos.nueva });
      setDatos(VACIO);
      setAviso('Contraseña actualizada. Cerramos las sesiones abiertas en otros dispositivos.');
    } catch (fallo: unknown) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo cambiar la contraseña');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section aria-labelledby="titulo-password" className="min-w-0 rounded-xl border border-g-20 bg-white p-5 shadow-sm">
      <h2 id="titulo-password" className="text-[16px] font-semibold tracking-tight text-g-90">
        Contraseña
      </h2>
      <p className="mt-1 text-[13px] leading-relaxed text-g-50">
        Al cambiarla cerramos tu sesión en los demás dispositivos. En este seguirás dentro.
      </p>

      <form onSubmit={guardar} noValidate className="mt-5 space-y-4">
        <CampoTexto
          id="password-actual"
          etiqueta="Contraseña actual"
          type="password"
          autoComplete="current-password"
          value={datos.actual}
          error={errores.actual}
          onChange={(evento) => cambiar('actual', evento.target.value)}
        />

        <div>
          <CampoTexto
            id="password-nueva"
            etiqueta="Contraseña nueva"
            type="password"
            autoComplete="new-password"
            value={datos.nueva}
            error={errores.nueva}
            onChange={(evento) => cambiar('nueva', evento.target.value)}
          />
          <IndicadorFuerza valor={datos.nueva} datos={personales} />
        </div>

        <CampoTexto
          id="password-repetida"
          etiqueta="Repite la contraseña nueva"
          type="password"
          autoComplete="new-password"
          value={datos.repetida}
          error={errores.repetida}
          onChange={(evento) => cambiar('repetida', evento.target.value)}
        />

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
            <Icon icon="solar:lock-password-linear" width="17" height="17" aria-hidden />
            {guardando ? 'Guardando...' : 'Cambiar contraseña'}
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
