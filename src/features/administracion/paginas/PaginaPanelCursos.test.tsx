import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaPanelCursos from './PaginaPanelCursos';
import * as api from '@/features/cursos/servicios/cursos.api';
import * as apiImagenes from '@/shared/servicios/imagenes.api';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

vi.mock('@/features/cursos/servicios/cursos.api');
vi.mock('@/shared/servicios/imagenes.api');

type Usuario = ReturnType<typeof userEvent.setup>;

const pausas: Curso = {
  courseId: 1,
  name: 'Pausas activas en oficina',
  description: null,
  videoUrl: 'https://youtu.be/abc123',
  thumbnailUrl: null,
  durationMinutes: 90,
  price: 120,
  discountPrice: null,
  status: 'active',
  createdAt: '2026-09-10T12:00:00.000Z',
};

const pagina = (elementos: Curso[], extra = {}) => ({
  elementos,
  paginacion: { pagina: 1, porPagina: 6, total: elementos.length, totalPaginas: 1, ...extra },
});

const renderizar = () =>
  render(
    <MemoryRouter>
      <PaginaPanelCursos />
    </MemoryRouter>
  );

const esperarListado = () => screen.findByText('Pausas activas en oficina');

const abrirAlta = async (usuario: Usuario) => {
  await usuario.click(screen.getByRole('button', { name: /agregar curso/i }));
  return screen.findByRole('dialog', { name: /agregar curso/i });
};

describe('PaginaPanelCursos', () => {
  beforeEach(() => {
    vi.mocked(api.listarCursosApi).mockResolvedValue(pagina([pausas]));
    vi.mocked(api.crearCursoApi).mockImplementation(async (datos) => ({
      ...pausas,
      courseId: 2,
      name: datos.name,
    }));
    vi.mocked(api.actualizarCursoApi).mockImplementation(async (id, datos) => ({
      ...pausas,
      courseId: id,
      name: datos.name,
      durationMinutes: Number(datos.durationMinutes) || null,
    }));
    vi.mocked(api.eliminarCursoApi).mockResolvedValue(undefined);
    vi.mocked(apiImagenes.subirImagenApi).mockResolvedValue(
      'http://localhost:4000/uploads/imagenes/miniatura.webp'
    );
  });

  it('lista los cursos con duracion formateada y enlace al video', async () => {
    renderizar();
    await esperarListado();

    const fila = within(screen.getByRole('list', { name: /cursos del cat[aá]logo/i })).getByRole(
      'listitem'
    );
    expect(fila).toHaveTextContent('1 h 30 min');
    expect(within(fila).getByRole('link', { name: /ver video/i })).toHaveAttribute(
      'href',
      'https://youtu.be/abc123'
    );
    expect(api.listarCursosApi).toHaveBeenCalledWith('todos', 1, expect.anything());
  });

  it('muestra un estado vacio cuando no hay cursos', async () => {
    vi.mocked(api.listarCursosApi).mockResolvedValue(pagina([]));
    renderizar();

    expect(await screen.findByText(/todav[ií]a no hay cursos/i)).toBeInTheDocument();
  });

  it('pagina desde el backend cuando hay mas de 6', async () => {
    const usuario = userEvent.setup();
    vi.mocked(api.listarCursosApi).mockImplementation(async (_estado, numero) =>
      numero === 1
        ? pagina([pausas], { total: 9, totalPaginas: 2 })
        : pagina([{ ...pausas, courseId: 9, name: 'Levantamiento de cargas' }], {
            pagina: 2,
            total: 9,
            totalPaginas: 2,
          })
    );
    renderizar();
    await esperarListado();

    await usuario.click(screen.getByRole('button', { name: 'Pagina 2' }));

    expect(await screen.findByText('Levantamiento de cargas')).toBeInTheDocument();
  });

  it('valida la URL del video antes de guardar', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await esperarListado();

    const dialogo = await abrirAlta(usuario);
    await usuario.type(within(dialogo).getByLabelText(/^nombre$/i), 'Levantamiento de cargas');
    await usuario.type(within(dialogo).getByLabelText(/^precio$/i), '80');
    await usuario.type(within(dialogo).getByLabelText(/url del video/i), 'youtube');
    await usuario.click(within(dialogo).getByRole('button', { name: /agregar curso/i }));

    expect(await within(dialogo).findByText(/debe ser una url valida/i)).toBeInTheDocument();
    expect(api.crearCursoApi).not.toHaveBeenCalled();
  });

  it('crea el curso con su miniatura subida y vuelve a la primera pagina', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await esperarListado();

    const dialogo = await abrirAlta(usuario);
    await usuario.type(within(dialogo).getByLabelText(/^nombre$/i), 'Levantamiento de cargas');
    await usuario.type(within(dialogo).getByLabelText(/^precio$/i), '80');
    const archivo = new File([new Uint8Array(500)], 'portada.webp', { type: 'image/webp' });
    await usuario.upload(within(dialogo).getByLabelText(/elegir archivo/i), archivo);
    await usuario.click(within(dialogo).getByRole('button', { name: /agregar curso/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(apiImagenes.subirImagenApi).toHaveBeenCalledWith(archivo);
    expect(api.crearCursoApi).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Levantamiento de cargas',
        price: '80',
        thumbnailUrl: 'http://localhost:4000/uploads/imagenes/miniatura.webp',
      })
    );
    expect(await screen.findByRole('status')).toHaveTextContent(/agregado/i);
    expect(api.listarCursosApi).toHaveBeenLastCalledWith('todos', 1, expect.anything());
  });

  it('edita un curso y actualiza su fila', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await esperarListado();

    await usuario.click(screen.getByRole('button', { name: 'Editar Pausas activas en oficina' }));
    const dialogo = await screen.findByRole('dialog', { name: /editar curso/i });
    const duracion = within(dialogo).getByLabelText(/duraci[oó]n/i);
    expect(duracion).toHaveValue('90');

    await usuario.clear(duracion);
    await usuario.type(duracion, '45');
    await usuario.click(within(dialogo).getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.actualizarCursoApi).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ durationMinutes: '45' })
    );
    expect(screen.getByText('45 min')).toBeInTheDocument();
  });

  it('pide confirmacion antes de salir con datos escritos', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await esperarListado();

    const dialogo = await abrirAlta(usuario);
    await usuario.type(within(dialogo).getByLabelText(/^nombre$/i), 'Borrador');
    fireEvent.mouseDown(dialogo.parentElement as HTMLElement);

    expect(screen.getByRole('alertdialog', { name: /cambios sin guardar/i })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /agregar curso/i })).toBeInTheDocument();
  });

  it('elimina un curso tras confirmar', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await esperarListado();

    vi.mocked(api.listarCursosApi).mockResolvedValue(pagina([]));
    await usuario.click(screen.getByRole('button', { name: 'Eliminar Pausas activas en oficina' }));
    const dialogo = await screen.findByRole('dialog', { name: /eliminar este curso/i });
    await usuario.click(within(dialogo).getByRole('button', { name: /s[ií], eliminar/i }));

    expect(await screen.findByText(/todav[ií]a no hay cursos/i)).toBeInTheDocument();
    expect(api.eliminarCursoApi).toHaveBeenCalledWith(1);
  });
});
