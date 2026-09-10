import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaCursos from './PaginaCursos';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import * as api from '@/features/administracion/servicios/catalogo.api';
import type { Curso } from '@/features/administracion/tipos/catalogo.tipos';

vi.mock('@/features/administracion/servicios/catalogo.api');

const cursoExistente: Curso = {
  courseId: 1,
  name: 'Logistica de ultima milla',
  description: null,
  videoUrl: 'https://youtu.be/abc123',
  thumbnailUrl: null,
  durationMinutes: 90,
  price: 120,
  discountPrice: null,
  status: 'active',
  createdAt: '2026-09-10T12:00:00.000Z',
};

const cursoNuevo: Curso = {
  courseId: 2,
  name: 'Atencion al cliente',
  description: null,
  videoUrl: null,
  thumbnailUrl: null,
  durationMinutes: null,
  price: 80,
  discountPrice: null,
  status: 'active',
  createdAt: '2026-09-10T13:00:00.000Z',
};

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <MemoryRouter>
        <PaginaCursos />
      </MemoryRouter>
    </AutenticacionProveedor>
  );

const lista = () => screen.getByRole('list', { name: /cursos del catalogo/i });

const abrirModal = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.click(screen.getByRole('button', { name: /agregar curso/i }));
  return screen.findByRole('dialog');
};

describe('PaginaCursos', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(api.listarCursosApi).mockResolvedValue([cursoExistente]);
    vi.mocked(api.crearCursoApi).mockResolvedValue(cursoNuevo);
  });

  it('muestra los cursos con la duracion formateada y el enlace al video', async () => {
    renderizar();

    const fila = within(await screen.findByRole('list', { name: /cursos/i })).getByRole(
      'listitem'
    );

    expect(within(fila).getByText('1 h 30 min')).toBeInTheDocument();
    expect(within(fila).getByRole('link', { name: /ver video/i })).toHaveAttribute(
      'href',
      'https://youtu.be/abc123'
    );
  });

  it('muestra un estado vacio cuando no hay cursos', async () => {
    vi.mocked(api.listarCursosApi).mockResolvedValue([]);
    renderizar();

    expect(await screen.findByText(/todavia no hay cursos/i)).toBeInTheDocument();
  });

  it('el formulario vive en un modal que empieza cerrado', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Logistica de ultima milla');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const dialogo = await abrirModal(usuario);

    expect(within(dialogo).getByLabelText(/^nombre$/i)).toBeInTheDocument();
  });

  it('valida dentro del modal antes de llamar al backend', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Logistica de ultima milla');

    const dialogo = await abrirModal(usuario);
    await usuario.click(within(dialogo).getByRole('button', { name: /agregar curso/i }));

    expect(await within(dialogo).findByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(api.crearCursoApi).not.toHaveBeenCalled();
  });

  it('rechaza una URL de video mal escrita', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Logistica de ultima milla');

    const dialogo = await abrirModal(usuario);
    await usuario.type(within(dialogo).getByLabelText(/^nombre$/i), 'Atencion al cliente');
    await usuario.type(within(dialogo).getByLabelText(/^precio \(s\/\)$/i), '80');
    await usuario.type(within(dialogo).getByLabelText(/url del video/i), 'youtube');
    await usuario.click(within(dialogo).getByRole('button', { name: /agregar curso/i }));

    expect(await within(dialogo).findByText(/debe ser una url valida/i)).toBeInTheDocument();
    expect(api.crearCursoApi).not.toHaveBeenCalled();
  });

  it('guarda, cierra el modal y agrega el curso al listado', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Logistica de ultima milla');

    const dialogo = await abrirModal(usuario);
    await usuario.type(within(dialogo).getByLabelText(/^nombre$/i), 'Atencion al cliente');
    await usuario.type(within(dialogo).getByLabelText(/^precio \(s\/\)$/i), '80');
    await usuario.click(within(dialogo).getByRole('button', { name: /agregar curso/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    expect(api.crearCursoApi).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Atencion al cliente', price: '80' })
    );

    const filas = within(lista()).getAllByRole('listitem');
    expect(filas[0]).toHaveTextContent('Atencion al cliente');
    // Sin duracion declarada la fila muestra un guion en su lugar
    expect(filas[0]).toHaveTextContent('-');
    expect(await screen.findByText(/agregado al catalogo/i)).toBeInTheDocument();
  });
});
