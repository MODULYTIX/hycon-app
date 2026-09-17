import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaginaCursos from './PaginaCursos';
import PaginaDetalleCurso from './PaginaDetalleCurso';
import * as api from '@/features/cursos/servicios/cursos.api';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

vi.mock('@/features/cursos/servicios/cursos.api');

const curso: Curso = {
  courseId: 7,
  name: 'Curso completo de Claude Code',
  description: 'Aprende a crear aplicaciones.\n\nDesarrolla un proyecto paso a paso.',
  thumbnailUrl: 'https://example.com/curso.jpg',
  videoUrl: 'https://example.com/avance.mp4',
  durationMinutes: 150,
  price: 150,
  discountPrice: 120,
  status: 'active',
  createdAt: '2026-09-17T12:00:00.000Z',
};

const renderizar = (ruta = '/cursos/7') => render(
  <MemoryRouter initialEntries={[ruta]}>
    <Routes>
      <Route path="/cursos" element={<PaginaCursos />} />
      <Route path="/cursos/:courseId" element={<PaginaDetalleCurso />} />
    </Routes>
  </MemoryRouter>
);

describe('detalle del curso', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    vi.mocked(api.listarCursosApi).mockResolvedValue([curso]);
    vi.mocked(api.obtenerCursoApi).mockResolvedValue(curso);
  });

  it('abre el detalle desde una tarjeta y muestra los datos, avance y consulta del curso', async () => {
    const usuario = userEvent.setup();
    renderizar('/cursos');
    await usuario.click(await screen.findByRole('link', { name: `Ver detalles de ${curso.name}` }));

    expect(await screen.findByRole('heading', { level: 1, name: curso.name })).toBeInTheDocument();
    expect(api.obtenerCursoApi).toHaveBeenCalledWith(7, expect.anything());
    expect(screen.getByText('2 h 30 min')).toBeInTheDocument();
    expect(screen.getByText('Aprende a crear aplicaciones.')).toBeInTheDocument();
    expect(screen.getByText(/120\.00/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver avance del curso' })).toHaveAttribute('href', curso.videoUrl);
    const consulta = screen.getByRole('link', { name: /conversemos/i }).getAttribute('href')!;
    expect(new URL(consulta).searchParams.get('text')).toContain(curso.name);
  });

  it('agrega una sola inscripcion al carrito y conserva otros cursos', async () => {
    window.localStorage.setItem('hycon.carrito.cursos', JSON.stringify([{ courseId: 2, quantity: 1 }]));
    const usuario = userEvent.setup();
    renderizar();
    const boton = await screen.findByRole('button', { name: 'Agregar al carrito' });
    await usuario.click(boton);
    expect(screen.getByRole('status')).toHaveTextContent('Curso agregado al carrito.');
    await usuario.click(boton);
    expect(screen.getByRole('status')).toHaveTextContent('Este curso ya está en tu carrito.');
    expect(JSON.parse(window.localStorage.getItem('hycon.carrito.cursos')!)).toEqual([
      { courseId: 2, quantity: 1 }, { courseId: 7, quantity: 1 },
    ]);
  });

  it('muestra alternativas si faltan portada, duracion, descripcion o avance', async () => {
    vi.mocked(api.obtenerCursoApi).mockResolvedValue({ ...curso, thumbnailUrl: null, durationMinutes: null, videoUrl: null, description: null, discountPrice: 0 });
    renderizar();
    await screen.findByRole('heading', { name: curso.name });
    expect(screen.getByText('Formación Hycon')).toBeInTheDocument();
    expect(screen.getByText('Por confirmar')).toBeInTheDocument();
    expect(screen.getByText(/^S\/\s*0\.00$/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ver avance del curso' })).not.toBeInTheDocument();
    expect(screen.getByText(/consulta con nuestro equipo para conocer el contenido/i)).toBeInTheDocument();
  });

  it('muestra el estado no disponible cuando falla la consulta', async () => {
    vi.mocked(api.obtenerCursoApi).mockRejectedValue(new Error('Curso no encontrado'));
    renderizar();
    expect(await screen.findByRole('alert')).toHaveTextContent('Curso no encontrado');
    expect(screen.getByRole('link', { name: 'Volver a cursos' })).toHaveAttribute('href', '/cursos');
  });

  it('rechaza IDs invalidos sin consultar la API', async () => {
    renderizar('/cursos/invalido');
    expect(await screen.findByRole('alert')).toHaveTextContent('Este curso no existe.');
    expect(api.obtenerCursoApi).not.toHaveBeenCalled();
  });
});
