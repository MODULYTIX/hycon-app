import { describe, expect, it } from 'vitest';
import {
  calcularFuerzaPassword,
  sinErrores,
  validarEmail,
  validarLogin,
  validarPasswordNueva,
  validarRegistro,
} from './validaciones';

describe('validarEmail', () => {
  it('acepta correos con formato valido', () => {
    expect(validarEmail('admin@hycon.com')).toBeUndefined();
  });

  it('rechaza correos vacios o mal formados', () => {
    expect(validarEmail('')).toBe('El correo es obligatorio');
    expect(validarEmail('admin@')).toBe('Ingresa un correo valido');
    expect(validarEmail('admin.hycon.com')).toBe('Ingresa un correo valido');
  });

  it('ignora espacios sobrantes', () => {
    expect(validarEmail('  admin@hycon.com  ')).toBeUndefined();
  });
});

describe('validarPasswordNueva', () => {
  it('exige las mismas reglas que el backend', () => {
    expect(validarPasswordNueva('Abc123')).toBe('Debe tener al menos 8 caracteres');
    expect(validarPasswordNueva('solotexto')).toBe('Debe incluir al menos un numero');
    expect(validarPasswordNueva('123456789')).toBe('Debe incluir al menos una letra');
    expect(validarPasswordNueva('Cliente2026')).toBeUndefined();
  });
});

describe('validarLogin', () => {
  it('no devuelve errores con credenciales completas', () => {
    const errores = validarLogin({ email: 'admin@hycon.com', password: 'lo-que-sea' });
    expect(sinErrores(errores)).toBe(true);
  });

  it('senala ambos campos cuando el formulario esta vacio', () => {
    const errores = validarLogin({ email: '', password: '' });
    expect(errores.email).toBeDefined();
    expect(errores.password).toBeDefined();
  });

  it('no aplica reglas de fortaleza al iniciar sesion', () => {
    // Una cuenta antigua puede tener una contrasena que hoy no pasaria el registro
    const errores = validarLogin({ email: 'admin@hycon.com', password: 'abc' });
    expect(errores.password).toBeUndefined();
  });
});

describe('validarRegistro', () => {
  const base = {
    name: 'Ana',
    lastname: 'Quispe',
    email: 'ana@hycon.com',
    password: 'Cliente2026',
  };

  it('acepta un registro completo', () => {
    expect(sinErrores(validarRegistro(base))).toBe(true);
  });

  it('rechaza nombres de un solo caracter', () => {
    expect(validarRegistro({ ...base, name: 'A' }).name).toBeDefined();
  });

  it('el telefono es opcional', () => {
    expect(sinErrores(validarRegistro({ ...base, phone: '' }))).toBe(true);
  });
});

describe('calcularFuerzaPassword', () => {
  it('escala de 0 a 3 segun longitud y variedad', () => {
    expect(calcularFuerzaPassword('')).toBe(0);
    expect(calcularFuerzaPassword('abcdefgh')).toBe(1);
    expect(calcularFuerzaPassword('abcdefg1')).toBe(2);
    expect(calcularFuerzaPassword('abcdefghij1!')).toBe(3);
  });
});
