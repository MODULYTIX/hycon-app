import { useState, type FormEvent } from 'react';
import CampoFormulario from '@/shared/ui/moleculas/CampoFormulario';
import AlertaFormulario from '@/shared/ui/moleculas/AlertaFormulario';
import Boton from '@/shared/ui/atomos/Boton';
import CampoContrasena from '@/features/autenticacion/componentes/moleculas/CampoContrasena';
import CasillaRecordar from '@/features/autenticacion/componentes/moleculas/CasillaRecordar';
import AvisoBloqueo from '@/features/autenticacion/componentes/moleculas/AvisoBloqueo';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { useCuentaAtras } from '@/features/autenticacion/hooks/useCuentaAtras';
import {
  sinErrores,
  validarEmail,
  validarLogin,
  validarPasswordLogin,
  type ErroresLogin,
} from '@/features/autenticacion/utilidades/validaciones';
import { ErrorHttp } from '@/shared/utilidades/cliente-http';
import type { Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

type Campo = 'email' | 'password';

export default function FormularioLogin({ onExito }: { onExito: (usuario: Usuario) => void }) {
  const { iniciarSesion } = useAutenticacion();

  const [valores, setValores] = useState({ email: '', password: '' });
  const [recordar, setRecordar] = useState(false);
  const [errores, setErrores] = useState<ErroresLogin>({});
  const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [bloqueadoHasta, setBloqueadoHasta] = useState<number | null>(null);

  const segundosBloqueo = useCuentaAtras(bloqueadoHasta);
  const bloqueado = segundosBloqueo > 0;

  const validarCampo = (campo: Campo, valor: string) =>
    campo === 'email' ? validarEmail(valor) : validarPasswordLogin(valor);

  const cambiar = (campo: Campo, valor: string) => {
    setValores((previo) => ({ ...previo, [campo]: valor }));
    // El bloqueo es de esa cuenta: al escribir otro correo se puede volver a intentar
    if (campo === 'email' && bloqueadoHasta) setBloqueadoHasta(null);
    // Si el campo ya fue tocado se revalida al escribir para que el error desaparezca solo
    if (tocados[campo]) setErrores((previo) => ({ ...previo, [campo]: validarCampo(campo, valor) }));
  };

  const marcarTocado = (campo: Campo) => {
    setTocados((previo) => ({ ...previo, [campo]: true }));
    setErrores((previo) => ({ ...previo, [campo]: validarCampo(campo, valores[campo]) }));
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (enviando || bloqueado) return;

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
        recordar,
      });
      onExito(usuario);
    } catch (error) {
      // Tras un intento fallido la contrasena se borra: no se queda escrita en pantalla
      setValores((previo) => ({ ...previo, password: '' }));
      if (error instanceof ErrorHttp && error.estado === 429 && error.reintentarEnSegundos) {
        setBloqueadoHasta(Date.now() + error.reintentarEnSegundos * 1000);
      } else {
        setErrorGeneral(error instanceof Error ? error.message : 'No se pudo iniciar sesión');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={enviar} noValidate>
      {bloqueado ? <AvisoBloqueo segundos={segundosBloqueo} /> : <AlertaFormulario mensaje={errorGeneral} />}

      <CampoFormulario
        id="login-email"
        etiqueta="Correo electrónico"
        icono="solar:letter-linear"
        type="email"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="tucorreo@empresa.com"
        value={valores.email}
        error={errores.email}
        onChange={(evento) => cambiar('email', evento.target.value)}
        onBlur={() => marcarTocado('email')}
      />

      <CampoContrasena
        id="login-password"
        etiqueta="Contraseña"
        autoComplete="current-password"
        placeholder="Tu contraseña"
        value={valores.password}
        error={errores.password}
        onChange={(evento) => cambiar('password', evento.target.value)}
        onBlur={() => marcarTocado('password')}
      />

      <CasillaRecordar id="login-recordar" marcada={recordar} onCambiar={setRecordar} />

      <Boton
        type="submit"
        cargando={enviando}
        disabled={bloqueado}
        icono={bloqueado ? 'solar:lock-keyhole-minimalistic-bold' : 'solar:login-3-bold'}
        className="h-12 w-full text-[15px]"
      >
        {enviando ? 'Verificando...' : 'Iniciar sesión'}
      </Boton>
    </form>
  );
}
