import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaginaCursos from './PaginaCursos';
import * as api from '@/features/cursos/servicios/cursos.api';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

vi.mock('@/features/cursos/servicios/cursos.api');

const curso: Curso = {
  courseId: 1,
  name: 'Logistica de ultima milla',
  description: 'Ruteo y tiempos de entrega',
  videoUrl: 'https://youtu.be/abc123',
  thumbnailUrl: null,
  durationMinutes: 150,
  price: 199,
  discountPrice: 149,
  status: 'active',
  createdAt: '2026-09-10T12:00:00.000Z',
};

const renderizar = () =>
  render(
    <MemoryRouter>
      <PaginaCursos />
    </MemoryRouter>
  );

describe('PaginaCursos (publica)', () => {
  beforeEach(() => {
    vi.mocked(api.listarCursosApi).mockResolvedValue([curso]);
  });

  it('pide al backend solo los cursos activos', async () => {
    renderizar();
    await screen.findByText('Logistica de ultima milla');

    expect(api.listarCursosApi).toHaveBeenCalledWith('active', expect.anything());
  });

  it('muestra duracion, precio de oferta y enlace al avance', async () => {
    renderizar();

    const tarjeta = within(
      await screen.findByRole('list', { name: /catalogo de cursos/i })
    ).getByRole('listitem');

    expect(within(tarjeta).getByText('2 h 30 min')).toBeInTheDocument();
    expect(within(tarjeta).getByText(/149\.00/)).toBeInTheDocument();
    expect(within(tarjeta).getByRole('link', { name: /ver avance/i })).toHaveAttribute(
      'href',
      'https://youtu.be/abc123'
    );
  });

  it('muestra un estado vacio si no hay cursos', async () => {
    vi.mocked(api.listarCursosApi).mockResolvedValue([]);
    renderizar();

    expect(await screen.findByText(/todavia no hay cursos publicados/i)).toBeInTheDocument();
  });
});
