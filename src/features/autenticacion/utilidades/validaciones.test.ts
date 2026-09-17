import { describe, expect, it } from 'vitest';
import { sinErrores, validarEmail, validarLogin, validarRegistro } from './validaciones';
import {
  calcularFuerzaPassword,
  evaluarPassword,
  requisitosPassword,
} from './politica-password';

const persona = { email: 'ana.quispe@hycon.lat', name: 'Ana Lucia', lastname: 'Quispe' };

describe('validarEmail', () => {
  it('acepta correos validos e ignora espacios sobrantes', () => {
    expect(validarEmail('admin@hycon.com')).toBeUndefined();
    expect(validarEmail('  admin@hycon.com  ')).toBeUndefined();
  });

  it('rechaza correos vacios o mal formados', () => {
    expect(validarEmail('')).toBe('El correo es obligatorio');
    expect(validarEmail('admin@')).toBe('Ingresa un correo válido');
  });
});

describe('validarLogin', () => {
  it('senala ambos campos cuando el formulario esta vacio', () => {
    const errores = validarLogin({ email: '', password: '' });
    expect(errores.email).toBeDefined();
    expect(errores.password).toBeDefined();
  });

  it('no aplica la politica al iniciar sesion: las cuentas antiguas siguen entrando', () => {
    expect(sinErrores(validarLogin({ email: 'info@hycon.lat', password: '123456' }))).toBe(true);
  });
});

describe('evaluarPassword (igual que el backend)', () => {
  it('acepta frases largas sin exigir simbolos', () => {
    expect(evaluarPassword('cafe con leche en arequipa', persona)).toBeUndefined();
  });

  it('exige 12 caracteres', () => {
    expect(evaluarPassword('Corta1!', persona)).toMatch(/12 caracteres/);
  });

  it('rechaza comunes, secuencias y datos personales', () => {
    expect(evaluarPassword('contraseña2026!', persona)).toMatch(/común/);
    expect(evaluarPassword('123456789012', persona)).toMatch(/común/);
    expect(evaluarPassword('QuispeFuerte2026', persona)).toMatch(/nombre ni tu correo/);
  });
});

describe('requisitosPassword', () => {
  it('con el campo vacio nada se da por cumplido', () => {
    expect(requisitosPassword('', persona).every((r) => !r.cumple)).toBe(true);
  });

  it('marca cada regla por separado mientras se escribe', () => {
    const estado = (password: string) =>
      Object.fromEntries(requisitosPassword(password, persona).map((r) => [r.id, r.cumple]));

    expect(estado('quispe')).toEqual({ largo: false, comun: true, personal: false });
    expect(estado('password1234')).toEqual({ largo: true, comun: false, personal: true });
    expect(estado('montaña roja del misti')).toEqual({ largo: true, comun: true, personal: true });
  });
});

describe('calcularFuerzaPassword', () => {
  it('0 vacia, 1 si no cumple la politica, 2 si cumple, 3 con margen', () => {
    expect(calcularFuerzaPassword('')).toBe(0);
    expect(calcularFuerzaPassword('password1234')).toBe(1);
    expect(calcularFuerzaPassword('Corta1!')).toBe(1);
    expect(calcularFuerzaPassword('rio chili claro')).toBe(2);
    expect(calcularFuerzaPassword('montaña roja del misti')).toBe(3);
  });
});

describe('validarRegistro', () => {
  const base = { name: 'Ana', lastname: 'Quispe', email: 'ana@hycon.com', password: 'cafe con leche y pan' };

  it('acepta un registro completo con el telefono opcional', () => {
    expect(sinErrores(validarRegistro({ ...base, phone: '' }))).toBe(true);
  });

  it('usa la politica con los datos de la propia persona', () => {
    expect(validarRegistro({ ...base, password: 'quispe-quispe-99' }).password).toMatch(/nombre/);
  });

  it('rechaza nombres de un solo caracter', () => {
    expect(validarRegistro({ ...base, name: 'A' }).name).toBeDefined();
  });
});
