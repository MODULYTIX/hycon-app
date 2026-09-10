import { useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import CampoFormulario from '@/shared/ui/moleculas/CampoFormulario';
import Cargador from '@/shared/ui/atomos/Cargador';
import AlertaFormulario from '@/features/autenticacion/componentes/atomos/AlertaFormulario';
import IndicadorFuerza from '@/features/autenticacion/componentes/atomos/IndicadorFuerza';
import CampoContrasena from '@/features/autenticacion/componentes/moleculas/CampoContrasena';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import {
  sinErrores,
  validarRegistro,
  type ErroresRegistro,
} from '@/features/autenticacion/utilidades/validaciones';
import type { DatosRegistro, Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

const VALORES_INICIALES: DatosRegistro = {
  name: '',
  lastname: '',
  email: '',
  password: '',
  phone: '',
};

export default function FormularioRegistro({
  onExito,
}: {
  onExito: (usuario: Usuario) => void;
}) {
  const { registrar } = useAutenticacion();

  const [valores, setValores] = useState<DatosRegistro>(VALORES_INICIALES);
  const [errores, setErrores] = useState<ErroresRegistro>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo: keyof DatosRegistro, valor: string) => {
    setValores((previo) => ({ ...previo, [campo]: valor }));
    // Al escribir se limpia el error del campo; la validacion completa corre al enviar
    setErrores((previo) => ({ ...previo, [campo]: undefined }));
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (enviando) return;

    const encontrados = validarRegistro(valores);
    setErrores(encontrados);
    setErrorGeneral(null);

    if (!sinErrores(encontrados)) return;

    setEnviando(true);
    try {
      const usuario = await registrar({
        name: valores.name.trim(),
        lastname: valores.lastname.trim(),
        email: valores.email.trim().toLowerCase(),
        password: valores.password,
        phone: valores.phone?.trim() || undefined,
      });
      onExito(usuario);
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No se pudo crear la cuenta');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={enviar} noValidate>
      <AlertaFormulario mensaje={errorGeneral} />

      <div className="flex gap-4">
        <div className="w-1/2">
          <CampoFormulario
            id="registro-name"
            etiqueta="Nombre"
            icono="solar:user-bold"
            autoComplete="given-name"
            placeholder="Nombre"
            value={valores.name}
            error={errores.name}
            onChange={(evento) => cambiar('name', evento.target.value)}
          />
        </div>
        <div className="w-1/2">
          <CampoFormulario
            id="registro-lastname"
            etiqueta="Apellido"
            icono="solar:user-bold"
            autoComplete="family-name"
            placeholder="Apellido"
            value={valores.lastname}
            error={errores.lastname}
            onChange={(evento) => cambiar('lastname', evento.target.value)}
          />
        </div>
      </div>

      <CampoFormulario
        id="registro-email"
        etiqueta="Correo electronico"
        icono="solar:letter-bold"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@empresa.com"
        value={valores.email}
        error={errores.email}
        onChange={(evento) => cambiar('email', evento.target.value)}
      />

      <CampoFormulario
        id="registro-phone"
        etiqueta="Telefono (opcional)"
        icono="solar:phone-bold"
        autoComplete="tel"
        placeholder="999 888 777"
        value={valores.phone}
        onChange={(evento) => cambiar('phone', evento.target.value)}
      />

      <CampoContrasena
        id="registro-password"
        etiqueta="Contrasena"
        autoComplete="new-password"
        placeholder="Minimo 8 caracteres"
        value={valores.password}
        error={errores.password}
        onChange={(evento) => cambiar('password', evento.target.value)}
        ayuda={<IndicadorFuerza valor={valores.password} />}
      />

      <button
        type="submit"
        disabled={enviando}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {enviando ? (
          <>
            <Cargador etiqueta="Creando cuenta" />
            <span>Creando cuenta...</span>
          </>
        ) : (
          <>
            <span>Crear cuenta</span>
            <Icon icon="solar:user-plus-bold" width="18" height="18" />
          </>
        )}
      </button>
    </form>
  );
}
