import type { CredencialesLogin, DatosRegistro } from '@/features/autenticacion/tipos/autenticacion.tipos';
import { evaluarPassword } from '@/features/autenticacion/utilidades/politica-password';

// Mismas reglas que aplica el backend con Zod, replicadas aqui para dar
// respuesta inmediata sin ida y vuelta al servidor. El backend sigue siendo
// la autoridad: esto es solo una capa de conveniencia.
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ErroresLogin = Partial<Record<'email' | 'password', string>>;
export type ErroresRegistro = Partial<Record<'name' | 'lastname' | 'email' | 'password' | 'phone', string>>;

export const validarEmail = (valor: string): string | undefined => {
  const limpio = valor.trim();
  if (!limpio) return 'El correo es obligatorio';
  if (!PATRON_EMAIL.test(limpio)) return 'Ingresa un correo válido';
  return undefined;
};

// Al iniciar sesion no se aplica la politica: una cuenta antigua debe poder entrar
export const validarPasswordLogin = (valor: string): string | undefined =>
  valor ? undefined : 'La contraseña es obligatoria';

const validarNombre = (valor: string, etiqueta: string): string | undefined => {
  const limpio = valor.trim();
  if (!limpio) return `${etiqueta} es obligatorio`;
  if (limpio.length < 2) return `${etiqueta} debe tener al menos 2 caracteres`;
  return undefined;
};

const soloConError = <T extends Record<string, string | undefined>>(errores: T) =>
  Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje)) as Partial<T>;

export const validarLogin = (credenciales: CredencialesLogin): ErroresLogin =>
  soloConError({
    email: validarEmail(credenciales.email),
    password: validarPasswordLogin(credenciales.password),
  });

export const validarRegistro = (datos: DatosRegistro): ErroresRegistro =>
  soloConError({
    name: validarNombre(datos.name, 'El nombre'),
    lastname: validarNombre(datos.lastname, 'El apellido'),
    email: validarEmail(datos.email),
    password: evaluarPassword(datos.password, datos),
  });

export const sinErrores = (errores: Record<string, string | undefined>): boolean =>
  Object.values(errores).every((error) => !error);
