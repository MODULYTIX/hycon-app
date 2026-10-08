import { evaluarPassword, type DatosPersonales } from '@/features/autenticacion/utilidades/politica-password';

// Mismas reglas que el backend: aqui solo se adelanta el aviso para no ir y volver
const TELEFONO = /^[\d+()\s-]*$/;

export interface CamposPerfil {
  name: string;
  lastname: string;
  phone: string;
}

export type ErroresPerfil = Partial<Record<keyof CamposPerfil, string>>;

export const revisarPerfil = (datos: CamposPerfil): ErroresPerfil => {
  const errores: ErroresPerfil = {};
  if (datos.name.trim().length < 2) errores.name = 'El nombre debe tener al menos 2 caracteres';
  if (datos.lastname.trim().length < 2) errores.lastname = 'El apellido debe tener al menos 2 caracteres';

  const telefono = datos.phone.trim();
  if (telefono.length > 30) errores.phone = 'El teléfono es demasiado largo';
  else if (!TELEFONO.test(telefono)) errores.phone = 'Solo números y los signos + ( ) -';

  return errores;
};

export interface CamposPassword {
  actual: string;
  nueva: string;
  repetida: string;
}

export type ErroresPassword = Partial<Record<keyof CamposPassword, string>>;

export const revisarCambioPassword = (
  datos: CamposPassword,
  personales: DatosPersonales = {}
): ErroresPassword => {
  const errores: ErroresPassword = {};
  if (datos.actual.length === 0) errores.actual = 'Escribe tu contraseña actual';

  const motivo = evaluarPassword(datos.nueva, personales);
  if (motivo) errores.nueva = motivo;
  else if (datos.nueva === datos.actual) errores.nueva = 'La contraseña nueva debe ser distinta de la actual';

  if (datos.repetida !== datos.nueva) errores.repetida = 'Las contraseñas no coinciden';

  return errores;
};
