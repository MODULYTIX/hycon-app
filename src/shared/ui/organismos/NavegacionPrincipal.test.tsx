import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavegacionPrincipal from './NavegacionPrincipal';
import { NAVEGACION_PRINCIPAL } from '@/app/rutas/rutas';

const renderizar = (ruta = '/') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <NavegacionPrincipal />
    </MemoryRouter>
  );

describe('NavegacionPrincipal', () => {
  it('muestra las seis secciones del sitio en orden', () => {
    renderizar();

    const enlaces = screen.getAllByRole('link');
    expect(enlaces.map((enlace) => enlace.textContent)).toEqual([
      'HOME',
      'PRODUCTOS',
      'CURSOS',
      'PUBLICACIONES',
      'ACERCA DE',
      'CONTACTANOS',
    ]);
  });

  it('cada seccion apunta a su ruta', () => {
    renderizar();

    for (const enlace of NAVEGACION_PRINCIPAL) {
      expect(screen.getByRole('link', { name: enlace.etiqueta })).toHaveAttribute(
        'href',
        enlace.ruta
      );
    }
  });

  it('marca HOME como actual solo en la raiz', () => {
    renderizar('/');

    expect(screen.getByRole('link', { name: 'HOME' })).toHaveAttribute('aria-current', 'page');
  });

  it('HOME deja de estar activo en otra seccion', () => {
    // Sin end=true, la ruta raiz coincidiria con todas y HOME quedaria siempre marcado
    renderizar('/productos');

    expect(screen.getByRole('link', { name: 'HOME' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'PRODUCTOS' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('marca la seccion abierta en cada ruta', () => {
    for (const enlace of NAVEGACION_PRINCIPAL.filter((e) => e.ruta !== '/')) {
      const { unmount } = renderizar(enlace.ruta);
      expect(screen.getByRole('link', { name: enlace.etiqueta })).toHaveAttribute(
        'aria-current',
        'page'
      );
      unmount();
    }
  });
});
