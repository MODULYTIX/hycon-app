import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaginaDetallePublicacion from './PaginaDetallePublicacion';
import PaginaPublicaciones from './PaginaPublicaciones';
import * as api from '@/features/publicaciones/servicios/publicaciones.api';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

// Los catalogos se direccionan por uuid: el correlativo no sale del backend
const UUID_1 = '00000001-0000-4000-8000-000000000000';
const UUID_2 = '00000002-0000-4000-8000-000000000000';

vi.mock('@/features/publicaciones/servicios/publicaciones.api');

const pausas: Publicacion = {
  uuid: UUID_1,
  title: 'Pausas activas en la oficina',
  slug: 'pausas-activas-en-la-oficina',
  excerpt: 'Cinco ejercicios de dos minutos',
  content:
    '<h2>Por qué importan</h2><p>Estar sentado carga el <strong>cuello</strong>.</p><ul><li><p>Gira los hombros</p></li></ul>',
  coverUrl: 'https://cdn.hycon.lat/pausas.webp',
  status: 'active',
  views: 120,
  readingMinutes: 4,
  authorName: 'Esau Morales',
  publishedAt: '2026-03-01T12:00:00.000Z',
  createdAt: '2026-03-01T12:00:00.000Z',
};

const otro: Publicacion = { ...pausas, uuid: UUID_2, title: 'Cargas seguras', slug: 'cargas-seguras', excerpt: null };

const renderizar = (ruta = '/publicaciones/pausas-activas-en-la-oficina') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/publicaciones" element={<PaginaPublicaciones />} />
        <Route path="/publicaciones/:slug" element={<PaginaDetallePublicacion />} />
      </Routes>
    </MemoryRouter>
  );

// Los articulos de la columna lateral repiten fechas y textos: hay que mirar solo el articulo abierto
const esperarArticulo = async () => {
  const titulo = await screen.findByRole('heading', { level: 1, name: pausas.title });
  return titulo.closest('article') as HTMLElement;
};

describe('PaginaDetallePublicacion', () => {
  beforeEach(() => {
    vi.mocked(api.obtenerPublicacionApi).mockResolvedValue(pausas);
    vi.mocked(api.listarPublicacionesApi).mockResolvedValue({
      elementos: [pausas, otro],
      paginacion: { pagina: 1, porPagina: 4, total: 2, totalPaginas: 1 },
    });
  });

  it('pide el articulo por su slug, que es lo que suma la lectura', async () => {
    renderizar();
    await screen.findByRole('heading', { level: 1, name: pausas.title });

    expect(api.obtenerPublicacionApi).toHaveBeenCalledWith('pausas-activas-en-la-oficina', expect.anything());
  });

  it('muestra fecha, autor, portada, resumen y lecturas', async () => {
    renderizar();
    const articulo = within(await esperarArticulo());

    expect(articulo.getByText('01/03/2026')).toBeInTheDocument();
    expect(articulo.getByText('Por Esau Morales')).toBeInTheDocument();
    expect(articulo.getByAltText(pausas.title)).toHaveAttribute('src', pausas.coverUrl);
    expect(articulo.getByText('Cinco ejercicios de dos minutos')).toBeInTheDocument();
    expect(articulo.getByText('120 lecturas')).toBeInTheDocument();
  });

  it('pinta el contenido con el formato que se escribio', async () => {
    renderizar();
    const articulo = within(await esperarArticulo());

    expect(articulo.getByRole('heading', { level: 2, name: 'Por qué importan' })).toBeInTheDocument();
    expect(articulo.getByText('cuello').tagName).toBe('STRONG');
    expect(articulo.getByRole('listitem')).toHaveTextContent('Gira los hombros');
  });

  it('ofrece otros articulos sin repetir el que se esta leyendo', async () => {
    renderizar();
    await screen.findByRole('heading', { level: 1, name: pausas.title });

    const otros = within(screen.getByRole('heading', { name: 'Otros artículos' }).closest('aside') as HTMLElement);
    expect(otros.getByRole('link', { name: 'Cargas seguras' })).toBeInTheDocument();
    expect(otros.queryByRole('link', { name: pausas.title })).not.toBeInTheDocument();
  });

  it('desde el articulo se vuelve al listado', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { level: 1, name: pausas.title });

    await usuario.click(screen.getByRole('link', { name: 'Artículos' }));

    expect(await screen.findByRole('heading', { name: 'Todos los artículos' })).toBeInTheDocument();
  });

  it('si el articulo no existe lo explica y ofrece volver', async () => {
    vi.mocked(api.obtenerPublicacionApi).mockRejectedValue(new Error('Publicacion no encontrada'));
    renderizar('/publicaciones/inventado');

    expect(await screen.findByRole('heading', { name: /no encontramos este artículo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver todos los artículos/i })).toBeInTheDocument();
  });
});
