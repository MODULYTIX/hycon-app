import type { CredencialesLogin, DatosRegistro } from '@/features/autenticacion/tipos/autenticacion.tipos';

// Mismas reglas que aplica el backend con Zod, replicadas aqui para dar
// respuesta inmediata sin ida y vuelta al servidor. El backend sigue siendo
// la autoridad: esto es solo una capa de conveniencia.
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ErroresLogin = Partial<Record<keyof CredencialesLogin, string>>;
export type ErroresRegistro = Partial<Record<keyof DatosRegistro, string>>;

export const validarEmail = (valor: string): string | undefined => {
  const limpio = valor.trim();
  if (!limpio) return 'El correo es obligatorio';
  if (!PATRON_EMAIL.test(limpio)) return 'Ingresa un correo valido';
  return undefined;
};

export const validarPasswordLogin = (valor: string): string | undefined => {
  if (!valor) return 'La contrasena es obligatoria';
  return undefined;
};

export const validarPasswordNueva = (valor: string): string | undefined => {
  if (!valor) return 'La contrasena es obligatoria';
  if (valor.length < 8) return 'Debe tener al menos 8 caracteres';
  if (!/[A-Za-z]/.test(valor)) return 'Debe incluir al menos una letra';
  if (!/[0-9]/.test(valor)) return 'Debe incluir al menos un numero';
  return undefined;
};

const validarNombre = (valor: string, etiqueta: string): string | undefined => {
  const limpio = valor.trim();
  if (!limpio) return `${etiqueta} es obligatorio`;
  if (limpio.length < 2) return `${etiqueta} debe tener al menos 2 caracteres`;
  return undefined;
};

export const validarLogin = (credenciales: CredencialesLogin): ErroresLogin => {
  const errores: ErroresLogin = {};
  const email = validarEmail(credenciales.email);
  const password = validarPasswordLogin(credenciales.password);
  if (email) errores.email = email;
  if (password) errores.password = password;
  return errores;
};

export const validarRegistro = (datos: DatosRegistro): ErroresRegistro => {
  const errores: ErroresRegistro = {};
  const name = validarNombre(datos.name, 'El nombre');
  const lastname = validarNombre(datos.lastname, 'El apellido');
  const email = validarEmail(datos.email);
  const password = validarPasswordNueva(datos.password);
  if (name) errores.name = name;
  if (lastname) errores.lastname = lastname;
  if (email) errores.email = email;
  if (password) errores.password = password;
  return errores;
};

export const sinErrores = (errores: Record<string, string | undefined>): boolean =>
  Object.values(errores).every((error) => !error);

// Nivel de fortaleza para la barra indicadora del formulario de registro
export const calcularFuerzaPassword = (valor: string): 0 | 1 | 2 | 3 => {
  if (!valor) return 0;
  let puntos = 0;
  if (valor.length >= 8) puntos += 1;
  if (/[A-Za-z]/.test(valor) && /[0-9]/.test(valor)) puntos += 1;
  if (valor.length >= 12 && /[^A-Za-z0-9]/.test(valor)) puntos += 1;
  return puntos as 0 | 1 | 2 | 3;
};
