import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Paginador from './Paginador';

const paginacion = { pagina: 2, porPagina: 6, total: 14, totalPaginas: 3 };

describe('Paginador', () => {
  it('no se pinta con una sola pagina', () => {
    const { container } = render(
      <Paginador
        paginacion={{ pagina: 1, porPagina: 6, total: 6, totalPaginas: 1 }}
        onCambiar={vi.fn()}
        entidad="productos"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('resume el tramo visible y marca la pagina actual', () => {
    render(<Paginador paginacion={paginacion} onCambiar={vi.fn()} entidad="productos" />);

    expect(screen.getByRole('navigation', { name: /paginas de productos/i })).toHaveTextContent(
      'Mostrando 7 - 12 de 14 productos'
    );
    expect(screen.getByRole('button', { name: 'Pagina 2' })).toHaveAttribute('aria-current', 'page');
  });

  it('avisa de la pagina elegida', async () => {
    const usuario = userEvent.setup();
    const onCambiar = vi.fn();
    render(<Paginador paginacion={paginacion} onCambiar={onCambiar} entidad="productos" />);

    await usuario.click(screen.getByRole('button', { name: 'Pagina 3' }));
    await usuario.click(screen.getByRole('button', { name: /pagina anterior/i }));
    await usuario.click(screen.getByRole('button', { name: /pagina siguiente/i }));

    expect(onCambiar.mock.calls).toEqual([[3], [1], [3]]);
  });

  it('desactiva anterior en la primera y siguiente en la ultima', () => {
    const { rerender } = render(
      <Paginador paginacion={{ ...paginacion, pagina: 1 }} onCambiar={vi.fn()} entidad="cursos" />
    );
    expect(screen.getByRole('button', { name: /pagina anterior/i })).toBeDisabled();

    rerender(
      <Paginador paginacion={{ ...paginacion, pagina: 3 }} onCambiar={vi.fn()} entidad="cursos" />
    );
    expect(screen.getByRole('button', { name: /pagina siguiente/i })).toBeDisabled();
  });
});
