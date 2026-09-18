import { useState, type FormEvent } from 'react';
import CampoFormulario from '@/shared/ui/moleculas/CampoFormulario';
import AlertaFormulario from '@/shared/ui/moleculas/AlertaFormulario';
import Boton from '@/shared/ui/atomos/Boton';
import IndicadorFuerza from '@/features/autenticacion/componentes/atomos/IndicadorFuerza';
import CampoContrasena from '@/features/autenticacion/componentes/moleculas/CampoContrasena';
import CasillaRecordar from '@/features/autenticacion/componentes/moleculas/CasillaRecordar';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import {
  sinErrores,
  validarRegistro,
  type ErroresRegistro,
} from '@/features/autenticacion/utilidades/validaciones';
import type { DatosRegistro, Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

type CampoTexto = 'name' | 'lastname' | 'email' | 'password' | 'phone';

const VALORES_INICIALES: Record<CampoTexto, string> = {
  name: '',
  lastname: '',
  email: '',
  password: '',
  phone: '',
};

export default function FormularioRegistro({ onExito }: { onExito: (usuario: Usuario) => void }) {
  const { registrar } = useAutenticacion();

  const [valores, setValores] = useState(VALORES_INICIALES);
  const [recordar, setRecordar] = useState(false);
  const [errores, setErrores] = useState<ErroresRegistro>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo: CampoTexto, valor: string) => {
    setValores((previo) => ({ ...previo, [campo]: valor }));
    // Al escribir se limpia el error del campo; la validacion completa corre al enviar
    setErrores((previo) => ({ ...previo, [campo]: undefined }));
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (enviando) return;

    const datos: DatosRegistro = {
      name: valores.name.trim(),
      lastname: valores.lastname.trim(),
      email: valores.email.trim().toLowerCase(),
      password: valores.password,
      phone: valores.phone.trim() || undefined,
      recordar,
    };

    const encontrados = validarRegistro(datos);
    setErrores(encontrados);
    setErrorGeneral(null);
    if (!sinErrores(encontrados)) return;

    setEnviando(true);
    try {
      onExito(await registrar(datos));
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No se pudo crear la cuenta');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={enviar} noValidate>
      <AlertaFormulario mensaje={errorGeneral} />

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario
          id="registro-name"
          etiqueta="Nombre"
          autoComplete="given-name"
          placeholder="Ana"
          value={valores.name}
          error={errores.name}
          onChange={(evento) => cambiar('name', evento.target.value)}
        />
        <CampoFormulario
          id="registro-lastname"
          etiqueta="Apellido"
          autoComplete="family-name"
          placeholder="Quispe"
          value={valores.lastname}
          error={errores.lastname}
          onChange={(evento) => cambiar('lastname', evento.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)]">
        <CampoFormulario
          id="registro-email"
          etiqueta="Correo electrónico"
          icono="solar:letter-linear"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="tucorreo@empresa.com"
          value={valores.email}
          error={errores.email}
          onChange={(evento) => cambiar('email', evento.target.value)}
        />

        <CampoFormulario
          id="registro-phone"
          etiqueta="Teléfono (opcional)"
          icono="solar:phone-linear"
          type="tel"
          autoComplete="tel"
          placeholder="999 888 777"
          value={valores.phone}
          onChange={(evento) => cambiar('phone', evento.target.value)}
        />
      </div>

      <CampoContrasena
        id="registro-password"
        etiqueta="Contraseña"
        autoComplete="new-password"
        placeholder="Una frase que recuerdes"
        value={valores.password}
        error={errores.password}
        onChange={(evento) => cambiar('password', evento.target.value)}
        ayuda={<IndicadorFuerza valor={valores.password} datos={valores} />}
      />

      <CasillaRecordar id="registro-recordar" marcada={recordar} onCambiar={setRecordar} />

      <Boton type="submit" cargando={enviando} icono="solar:user-plus-bold" className="h-12 w-full text-[15px]">
        {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
      </Boton>
    </form>
  );
}
