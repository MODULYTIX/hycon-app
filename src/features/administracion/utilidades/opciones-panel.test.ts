import { describe, expect, it } from 'vitest';
import { SECCIONES_PANEL, seccionesDisponibles } from './opciones-panel';
import { RUTAS } from '@/app/rutas/rutas';

describe('SECCIONES_PANEL', () => {
  it('lista productos, cursos y articulos en ese orden', () => {
    expect(SECCIONES_PANEL.map((seccion) => seccion.id)).toEqual([
      'productos',
      'cursos',
      'publicaciones',
    ]);
  });

  it('marca publicaciones como no disponible porque no existe en el backend', () => {
    const articulos = SECCIONES_PANEL.find((seccion) => seccion.id === 'publicaciones');
    expect(articulos?.disponible).toBe(false);
  });

  it('solo productos y cursos tienen respaldo en el backend', () => {
    expect(seccionesDisponibles().map((seccion) => seccion.id)).toEqual(['productos', 'cursos']);
  });

  it('todas las rutas cuelgan del panel de configuracion', () => {
    for (const seccion of SECCIONES_PANEL) {
      expect(seccion.ruta.startsWith(RUTAS.panel)).toBe(true);
    }
  });

  it('la ruta del panel coincide con la del menu de cuenta', () => {
    // Si estas dos se separan, el enlace del menu lleva a una pagina inexistente
    expect(RUTAS.panel).toBe('/panel-de-configuracion');
  });
});
