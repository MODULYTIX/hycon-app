import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalTemario from './ModalTemario';
import * as api from '@/features/cursos/servicios/lecciones.api';
import * as videosApi from '@/shared/servicios/videos.api';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';
import type { Leccion, Temario } from '@/features/cursos/tipos/leccion.tipos';

vi.mock('@/features/cursos/servicios/lecciones.api');
vi.mock('@/shared/servicios/videos.api', async (original) => {
  const real = await original<typeof import('@/shared/servicios/videos.api')>();
  return { ...real, obtenerAlmacenVideosApi: vi.fn(), subirVideoApi: vi.fn() };
});

const CURSO_UUID = 'b7b299d8-ee8f-4bea-a618-0a5f8261136f';

const curso: Curso = {
  uuid: CURSO_UUID,
  name: 'Mejora continua',
  description: null,
  videoUrl: null,
  youtubeId: null,
  thumbnailUrl: null,
  durationMinutes: 150,
  partes: 0,
  previewSegundos: 60,
  price: 149,
  discountPrice: null,
  status: 'active',
  createdAt: '2026-10-07T12:00:00.000Z',
};

const leccion = (cambios: Partial<Leccion> = {}): Leccion => ({
  uuid: '01a0fef2-0000-70bf-a4e4-000000000001',
  titulo: 'Introducción',
  descripcion: null,
  duracionMinutos: 8,
  posicion: 1,
  esMuestra: true,
  bloqueada: false,
  tipoVideo: 'youtube',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtubeId: 'dQw4w9WgXcQ',
  referencia: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  limiteSegundos: null,
  ...cambios,
});

const segunda = leccion({
  uuid: '01a0fef2-0000-70bf-a4e4-000000000002',
  titulo: 'Parte 2',
  posicion: 2,
  esMuestra: false,
});

const temario = (lecciones: Leccion[]): Temario => ({
  cursoUuid: CURSO_UUID,
  tieneAcceso: true,
  previewSegundos: 60,
  lecciones,
});

const renderizar = () => render(<ModalTemario abierto curso={curso} onCerrar={vi.fn()} />);

beforeEach(() => {
  // Por defecto el servidor no guarda videos: solo se pegan enlaces de YouTube
  vi.mocked(videosApi.obtenerAlmacenVideosApi).mockResolvedValue({
    proveedor: 'youtube',
    aceptaSubidas: false,
    maximoMb: 1024,
    extensiones: ['mp4'],
  });
});

describe('ModalTemario', () => {
  beforeEach(() => {
    vi.mocked(api.obtenerTemarioAdminApi).mockResolvedValue(temario([leccion(), segunda]));
    vi.mocked(api.crearLeccionApi).mockResolvedValue(leccion({ titulo: 'Parte 3' }));
    vi.mocked(api.actualizarLeccionApi).mockResolvedValue(leccion());
    vi.mocked(api.eliminarLeccionApi).mockResolvedValue(undefined);
    vi.mocked(api.reordenarLeccionesApi).mockResolvedValue(temario([segunda, leccion()]));
  });

  it('lista las partes del curso en orden, con la muestra marcada', async () => {
    renderizar();

    const lista = within(await screen.findByRole('list', { name: /partes del curso/i }));
    const filas = lista.getAllByRole('listitem');
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByText('Introducción')).toBeInTheDocument();
    expect(within(filas[0]).getByText('Muestra gratis')).toBeInTheDocument();
    expect(within(filas[1]).queryByText('Muestra gratis')).not.toBeInTheDocument();
    expect(api.obtenerTemarioAdminApi).toHaveBeenCalledWith(CURSO_UUID);
  });

  it('avisa de las partes que no tienen video', async () => {
    vi.mocked(api.obtenerTemarioAdminApi).mockResolvedValue(
      temario([leccion({ tipoVideo: null, videoUrl: null, youtubeId: null, referencia: null })])
    );
    renderizar();

    expect(await screen.findByText('Sin video')).toBeInTheDocument();
  });

  it('sin partes invita a crear la primera', async () => {
    vi.mocked(api.obtenerTemarioAdminApi).mockResolvedValue(temario([]));
    renderizar();

    expect(await screen.findByText(/todavía no tiene partes/i)).toBeInTheDocument();
  });

  it('agrega una parte y recarga el temario', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    await usuario.type(screen.getByLabelText('Título'), 'Parte 3');
    await usuario.type(screen.getByLabelText(/url del video/i), 'https://youtu.be/dQw4w9WgXcQ');
    await usuario.type(screen.getByLabelText(/duración/i), '12');
    await usuario.click(screen.getByRole('button', { name: /agregar parte/i }));

    await waitFor(() =>
      expect(api.crearLeccionApi).toHaveBeenCalledWith(
        CURSO_UUID,
        expect.objectContaining({ title: 'Parte 3', durationMinutes: '12', esMuestra: false })
      )
    );
    // Dos veces: la carga inicial y la recarga tras guardar
    await waitFor(() => expect(api.obtenerTemarioAdminApi).toHaveBeenCalledTimes(2));
  });

  it('no guarda una parte sin titulo o con un video que no es de YouTube', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    await usuario.click(screen.getByRole('button', { name: /agregar parte/i }));
    expect(await screen.findByText(/el nombre es obligatorio/i)).toBeInTheDocument();

    await usuario.type(screen.getByLabelText('Título'), 'Parte 3');
    await usuario.type(screen.getByLabelText(/url del video/i), 'https://vimeo.com/123');
    await usuario.click(screen.getByRole('button', { name: /agregar parte/i }));

    expect(await screen.findByText(/link de youtube valido/i)).toBeInTheDocument();
    expect(api.crearLeccionApi).not.toHaveBeenCalled();
  });

  it('marcar la muestra se envia al backend', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    await usuario.type(screen.getByLabelText('Título'), 'Clase de prueba');
    await usuario.click(screen.getByRole('checkbox', { name: /muestra gratis/i }));
    await usuario.click(screen.getByRole('button', { name: /agregar parte/i }));

    await waitFor(() =>
      expect(api.crearLeccionApi).toHaveBeenCalledWith(
        CURSO_UUID,
        expect.objectContaining({ esMuestra: true })
      )
    );
  });

  it('editar carga los datos en el formulario y guarda los cambios', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    await usuario.click(screen.getByRole('button', { name: 'Editar Introducción' }));

    expect(screen.getByLabelText('Título')).toHaveValue('Introducción');
    expect(screen.getByRole('checkbox', { name: /muestra gratis/i })).toBeChecked();

    await usuario.clear(screen.getByLabelText('Título'));
    await usuario.type(screen.getByLabelText('Título'), 'Introducción al método');
    await usuario.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() =>
      expect(api.actualizarLeccionApi).toHaveBeenCalledWith(
        CURSO_UUID,
        leccion().uuid,
        expect.objectContaining({ title: 'Introducción al método' })
      )
    );
  });

  it('elimina una parte', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    await usuario.click(screen.getByRole('button', { name: 'Eliminar Parte 2' }));

    await waitFor(() => expect(api.eliminarLeccionApi).toHaveBeenCalledWith(CURSO_UUID, segunda.uuid));
  });

  it('subir y bajar manda el orden nuevo completo', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    // La primera no se puede subir ni la ultima bajar
    expect(screen.getByRole('button', { name: 'Subir Introducción' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Bajar Parte 2' })).toBeDisabled();

    await usuario.click(screen.getByRole('button', { name: 'Bajar Introducción' }));

    await waitFor(() =>
      expect(api.reordenarLeccionesApi).toHaveBeenCalledWith(CURSO_UUID, [segunda.uuid, leccion().uuid])
    );
  });

  it('muestra el error del servidor si algo falla', async () => {
    const usuario = userEvent.setup({ delay: null });
    vi.mocked(api.crearLeccionApi).mockRejectedValue(new Error('El titulo ya existe'));
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    await usuario.type(screen.getByLabelText('Título'), 'Parte 3');
    await usuario.click(screen.getByRole('button', { name: /agregar parte/i }));

    expect(await screen.findByText(/el titulo ya existe/i)).toBeInTheDocument();
  });
});

// El servidor dice si guarda videos y de que tipo; sin eso solo se pegan enlaces
const almacenR2 = {
  proveedor: 'r2' as const,
  aceptaSubidas: true,
  maximoMb: 1024,
  extensiones: ['mp4', 'webm'],
};

const subida = leccion({
  titulo: 'Parte subida',
  tipoVideo: 'archivo',
  videoUrl: 'https://bucket.r2.cloudflarestorage.com/hycon/cursos/clase.mp4?X-Amz-Signature=abc',
  youtubeId: null,
  referencia: 'r2:cursos/01a0/clase.mp4',
});

describe('video de las partes segun el almacen del servidor', () => {
  beforeEach(() => {
    vi.mocked(api.obtenerTemarioAdminApi).mockResolvedValue(temario([leccion(), segunda]));
  });

  it('sin almacen configurado solo se puede pegar un enlace', async () => {
    vi.mocked(videosApi.obtenerAlmacenVideosApi).mockRejectedValue(new Error('sin almacen'));
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    expect(screen.getByLabelText(/url del video/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /subir un archivo/i })).not.toBeInTheDocument();
  });

  it('con almacen configurado ofrece subir el archivo', async () => {
    vi.mocked(videosApi.obtenerAlmacenVideosApi).mockResolvedValue(almacenR2);
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    expect(await screen.findByRole('button', { name: /subir un archivo/i })).toBeInTheDocument();
  });

  // Al editar se trabaja con lo guardado, no con el enlace firmado que caduca
  it('una parte con video propio se edita mostrando el archivo', async () => {
    const usuario = userEvent.setup({ delay: null });
    vi.mocked(videosApi.obtenerAlmacenVideosApi).mockResolvedValue(almacenR2);
    vi.mocked(api.obtenerTemarioAdminApi).mockResolvedValue(temario([subida]));
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    await usuario.click(screen.getByRole('button', { name: /editar parte subida/i }));

    expect(screen.getByText(/clase\.mp4/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/url del video/i)).not.toBeInTheDocument();
  });

  it('al subir un video se guarda su referencia en la parte', async () => {
    const usuario = userEvent.setup({ delay: null });
    vi.mocked(videosApi.obtenerAlmacenVideosApi).mockResolvedValue(almacenR2);
    vi.mocked(videosApi.subirVideoApi).mockResolvedValue('r2:cursos/01a0/nueva.mp4');
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });
    await screen.findByRole('button', { name: /subir un archivo/i });

    const video = new File([new Uint8Array(10)], 'nueva.mp4', { type: 'video/mp4' });
    fireEvent.change(screen.getByLabelText(/elegir el archivo del video/i), {
      target: { files: [video] },
    });
    await screen.findByText(/nueva\.mp4/);

    await usuario.type(screen.getByLabelText('Título'), 'Parte 3');
    await usuario.click(screen.getByRole('button', { name: /agregar parte/i }));

    await waitFor(() =>
      expect(api.crearLeccionApi).toHaveBeenCalledWith(
        CURSO_UUID,
        expect.objectContaining({ videoUrl: 'r2:cursos/01a0/nueva.mp4' })
      )
    );
  });
});
