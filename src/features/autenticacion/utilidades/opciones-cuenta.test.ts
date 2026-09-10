import { describe, expect, it } from 'vitest';
import {
  esAdministrador,
  filtrarOpcionesPorRol,
  obtenerIniciales,
  OPCIONES_CUENTA,
} from './opciones-cuenta';

const idsDe = (rol: string | undefined) => filtrarOpcionesPorRol(rol).map((o) => o.id);

describe('filtrarOpcionesPorRol', () => {
  it('muestra el panel de configuracion solo al rol ADMIN', () => {
    expect(idsDe('ADMIN')).toContain('panel-configuracion');
  });

  it('oculta el panel de configuracion a CLIENTE e INSTRUCTOR', () => {
    expect(idsDe('CLIENTE')).not.toContain('panel-configuracion');
    expect(idsDe('INSTRUCTOR')).not.toContain('panel-configuracion');
  });

  it('mantiene el resto de opciones para cualquier rol con sesion', () => {
    const comunes = ['perfil', 'historial', 'panel-cursos', 'software-ergonomico'];
    for (const rol of ['ADMIN', 'CLIENTE', 'INSTRUCTOR']) {
      expect(idsDe(rol)).toEqual(expect.arrayContaining(comunes));
    }
  });

  it('no devuelve nada sin sesion', () => {
    expect(filtrarOpcionesPorRol(undefined)).toHaveLength(0);
  });

  it('oculta las opciones restringidas ante un rol desconocido', () => {
    // Un rol nuevo en la base no debe heredar permisos de administrador
    expect(idsDe('SOPORTE')).not.toContain('panel-configuracion');
  });

  it('todas las opciones tienen id, etiqueta e icono', () => {
    for (const opcion of OPCIONES_CUENTA) {
      expect(opcion.id).toBeTruthy();
      expect(opcion.etiqueta).toBeTruthy();
      expect(opcion.icono).toBeTruthy();
      expect(opcion.href).toMatch(/^\//);
    }
  });
});

describe('esAdministrador', () => {
  it('reconoce solo el rol ADMIN', () => {
    expect(esAdministrador('ADMIN')).toBe(true);
    expect(esAdministrador('CLIENTE')).toBe(false);
    expect(esAdministrador(undefined)).toBe(false);
  });
});

describe('obtenerIniciales', () => {
  it('toma la primera letra del nombre y del apellido en mayuscula', () => {
    expect(obtenerIniciales('esau', 'morales')).toBe('EM');
  });

  it('devuelve interrogacion si no hay datos', () => {
    expect(obtenerIniciales('', '')).toBe('?');
  });
});
