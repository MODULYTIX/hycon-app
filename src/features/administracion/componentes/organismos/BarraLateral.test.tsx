import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BarraLateral from './BarraLateral';

const renderizar = (ruta = '/panel-de-configuracion/productos') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <BarraLateral />
    </MemoryRouter>
  );

describe('BarraLateral', () => {
  it('lista las tres secciones del panel', () => {
    renderizar();

    expect(screen.getByText('PRODUCTOS')).toBeInTheDocument();
    expect(screen.getByText('CURSOS')).toBeInTheDocument();
    expect(screen.getByText('PUBLICACIONES')).toBeInTheDocument();
  });

  it('productos y cursos son enlaces navegables', () => {
    renderizar();

    expect(screen.getByRole('link', { name: 'PRODUCTOS' })).toHaveAttribute(
      'href',
      '/panel-de-configuracion/productos'
    );
    expect(screen.getByRole('link', { name: 'CURSOS' })).toHaveAttribute(
      'href',
      '/panel-de-configuracion/cursos'
    );
  });

  it('publicaciones es un enlace navegable', () => {
    renderizar();

    expect(screen.getByRole('link', { name: 'PUBLICACIONES' })).toHaveAttribute(
      'href',
      '/panel-de-configuracion/publicaciones'
    );
  });

  it('marca como actual la seccion en la que estas', () => {
    renderizar('/panel-de-configuracion/cursos');

    expect(screen.getByRole('link', { name: 'CURSOS' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'PRODUCTOS' })).not.toHaveAttribute('aria-current');
  });
});
