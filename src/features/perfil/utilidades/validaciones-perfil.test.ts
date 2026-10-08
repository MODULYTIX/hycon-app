import { describe, expect, it } from 'vitest';
import { revisarCambioPassword, revisarPerfil } from './validaciones-perfil';

const personales = { email: 'ana@hycon.com', name: 'Ana', lastname: 'Quispe' };

describe('revisarPerfil', () => {
  it('acepta unos datos correctos', () => {
    expect(revisarPerfil({ name: 'Ana', lastname: 'Quispe', phone: '+51 902 665 565' })).toEqual({});
  });

  it('el telefono puede quedar vacio', () => {
    expect(revisarPerfil({ name: 'Ana', lastname: 'Quispe', phone: '' })).toEqual({});
  });

  it('pide nombre y apellido con dos caracteres', () => {
    const errores = revisarPerfil({ name: 'A', lastname: ' ', phone: '' });

    expect(errores.name).toMatch(/al menos 2/);
    expect(errores.lastname).toMatch(/al menos 2/);
  });

  it('rechaza un telefono con letras o simbolos raros', () => {
    expect(revisarPerfil({ name: 'Ana', lastname: 'Quispe', phone: 'llamame' }).phone).toMatch(
      /solo números/i
    );
    expect(revisarPerfil({ name: 'Ana', lastname: 'Quispe', phone: '9'.repeat(31) }).phone).toMatch(
      /demasiado largo/i
    );
  });
});

describe('revisarCambioPassword', () => {
  const nueva = 'brisa-tablero-19-norte';

  it('acepta un cambio correcto', () => {
    expect(
      revisarCambioPassword({ actual: 'la-de-antes-2026', nueva, repetida: nueva }, personales)
    ).toEqual({});
  });

  it('exige la contrasena actual', () => {
    const errores = revisarCambioPassword({ actual: '', nueva, repetida: nueva }, personales);

    expect(errores.actual).toMatch(/contraseña actual/i);
  });

  it('aplica la politica a la contrasena nueva', () => {
    const corta = revisarCambioPassword({ actual: 'x', nueva: '123456', repetida: '123456' }, personales);
    const conSuNombre = revisarCambioPassword(
      { actual: 'x', nueva: 'ana-quispe-2026', repetida: 'ana-quispe-2026' },
      personales
    );

    expect(corta.nueva).toBeDefined();
    expect(conSuNombre.nueva).toBeDefined();
  });

  it('la nueva no puede ser la misma de siempre', () => {
    const errores = revisarCambioPassword({ actual: nueva, nueva, repetida: nueva }, personales);

    expect(errores.nueva).toMatch(/distinta de la actual/i);
  });

  it('avisa si la repeticion no coincide', () => {
    const errores = revisarCambioPassword(
      { actual: 'la-de-antes-2026', nueva, repetida: 'brisa-tablero-19-sur' },
      personales
    );

    expect(errores.repetida).toMatch(/no coinciden/i);
  });
});
