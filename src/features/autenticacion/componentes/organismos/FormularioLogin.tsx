import { useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import CampoFormulario from '@/shared/ui/moleculas/CampoFormulario';
import Cargador from '@/shared/ui/atomos/Cargador';
import AlertaFormulario from '@/features/autenticacion/componentes/atomos/AlertaFormulario';
import CampoContrasena from '@/features/autenticacion/componentes/moleculas/CampoContrasena';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import {
  sinErrores,
  validarEmail,
  validarLogin,
  validarPasswordLogin,
  type ErroresLogin,
} from '@/features/autenticacion/utilidades/validaciones';
import type { Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

export default function FormularioLogin({ onExito }: { onExito: (usuario: Usuario) => void }) {
  const { iniciarSesion } = useAutenticacion();

  const [valores, setValores] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState<ErroresLogin>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo: 'email' | 'password', valor: string) => {
    setValores((previo) => ({ ...previo, [campo]: valor }));
    // Si el campo ya fue tocado se revalida al escribir para que el error desaparezca solo
    if (tocados[campo]) {
      const mensaje = campo === 'email' ? validarEmail(valor) : validarPasswordLogin(valor);
      setErrores((previo) => ({ ...previo, [campo]: mensaje }));
    }
  };

  const marcarTocado = (campo: 'email' | 'password') => {
    setTocados((previo) => ({ ...previo, [campo]: true }));
    const mensaje =
      campo === 'email' ? validarEmail(valores.email) : validarPasswordLogin(valores.password);
    setErrores((previo) => ({ ...previo, [campo]: mensaje }));
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (enviando) return;

    const encontrados = validarLogin(valores);
    setErrores(encontrados);
    setTocados({ email: true, password: true });
    setErrorGeneral(null);

    if (!sinErrores(encontrados)) return;

    setEnviando(true);
    try {
      const usuario = await iniciarSesion({
        email: valores.email.trim().toLowerCase(),
        password: valores.password,
      });
      onExito(usuario);
    } catch (error) {
      setErrorGeneral(
        error instanceof Error ? error.message : 'No se pudo iniciar sesion'
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={enviar} noValidate>
      <AlertaFormulario mensaje={errorGeneral} />

      <CampoFormulario
        id="login-email"
        etiqueta="Correo electronico"
        icono="solar:letter-bold"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@empresa.com"
        value={valores.email}
        error={errores.email}
        onChange={(evento) => cambiar('email', evento.target.value)}
        onBlur={() => marcarTocado('email')}
      />

      <CampoContrasena
        id="login-password"
        etiqueta="Contrasena"
        autoComplete="current-password"
        placeholder="Tu contrasena"
        value={valores.password}
        error={errores.password}
        onChange={(evento) => cambiar('password', evento.target.value)}
        onBlur={() => marcarTocado('password')}
      />

      <button
        type="submit"
        disabled={enviando}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {enviando ? (
          <>
            <Cargador etiqueta="Iniciando sesion" />
            <span>Iniciando sesion...</span>
          </>
        ) : (
          <>
            <span>Iniciar sesion</span>
            <Icon icon="solar:login-3-bold" width="18" height="18" />
          </>
        )}
      </button>
    </form>
  );
}
