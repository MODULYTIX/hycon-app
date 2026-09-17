import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { Editor } from '@tiptap/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaPanelPublicaciones from './PaginaPanelPublicaciones';
import * as api from '@/features/publicaciones/servicios/publicaciones.api';
import * as apiImagenes from '@/shared/servicios/imagenes.api';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

vi.mock('@/features/publicaciones/servicios/publicaciones.api');
vi.mock('@/shared/servicios/imagenes.api');

type Usuario = ReturnType<typeof userEvent.setup>;

const CONTENIDO = '<p>Levantarse cada hora reduce la tension.</p><p>Estirar el cuello alivia la espalda.</p>';

const pausas: Publicacion = {
  postId: 1,
  title: 'Pausas activas en la oficina',
  slug: 'pausas-activas-en-la-oficina',
  excerpt: 'Cinco ejercicios de dos minutos',
  content: CONTENIDO,
  coverUrl: 'http://localhost:4000/uploads/imagenes/portada.webp',
  status: 'active',
  views: 120,
  readingMinutes: 4,
  authorName: 'Esau Morales',
  publishedAt: '2026-03-01T12:00:00.000Z',
  createdAt: '2026-03-01T12:00:00.000Z',
};

const borrador: Publicacion = {
  ...pausas,
  postId: 2,
  title: 'Cargas seguras en almacen',
  slug: 'cargas-seguras',
  excerpt: null,
  coverUrl: null,
  status: 'inactive',
  views: 1,
  readingMinutes: 1,
};

const pagina = (elementos: Publicacion[], extra = {}) => ({
  elementos,
  paginacion: { pagina: 1, porPagina: 6, total: elementos.length, totalPaginas: 1, ...extra },
});

const renderizar = () =>
  render(
    <MemoryRouter>
      <PaginaPanelPublicaciones />
    </MemoryRouter>
  );

const esperarListado = () => screen.findByText('Pausas activas en la oficina');
const lista = () => screen.getByRole('list', { name: /art[ií]culos/i });
const fila = (titulo: string) =>
  within(lista())
    .getAllByRole('listitem')
    .find((elemento) => elemento.textContent?.includes(titulo)) as HTMLElement;

const abrirAlta = async (usuario: Usuario) => {
  await usuario.click(screen.getByRole('button', { name: /nueva publicaci[oó]n/i }));
  return screen.findByRole('dialog', { name: /nueva publicaci[oó]n/i });
};

// El contenido es un editor visual (Tiptap): su instancia vive en el nodo editable
const editorDe = async (dialogo: HTMLElement): Promise<Editor> => {
  const area = within(dialogo).getByRole('textbox', { name: /^contenido$/i });
  await waitFor(() => expect((area as unknown as { editor?: Editor }).editor).toBeDefined());
  return (area as unknown as { editor: Editor }).editor;
};

const escribirContenido = async (dialogo: HTMLElement, html: string) => {
  const editor = await editorDe(dialogo);
  act(() => {
    editor.commands.focus('end');
    editor.commands.insertContent(html);
  });
};

const escribir = async (usuario: Usuario, dialogo: HTMLElement) => {
  await usuario.type(within(dialogo).getByRole('textbox', { name: /^t[ií]tulo$/i }), 'Ergonomia en casa');
  await escribirContenido(dialogo, 'Primer parrafo del articulo.');
};

describe('PaginaPanelPublicaciones', () => {
  beforeEach(() => {
    vi.mocked(api.listarPublicacionesApi).mockResolvedValue(pagina([pausas, borrador]));
    vi.mocked(api.crearPublicacionApi).mockImplementation(async (datos) => ({
      ...borrador,
      postId: 3,
      title: datos.title,
    }));
    vi.mocked(api.actualizarPublicacionApi).mockImplementation(async (id, datos) => ({
      ...pausas,
      postId: id,
      title: datos.title,
      excerpt: datos.excerpt || null,
    }));
    vi.mocked(api.eliminarPublicacionApi).mockResolvedValue(undefined);
    vi.mocked(apiImagenes.subirImagenApi).mockResolvedValue(
      'http://localhost:4000/uploads/imagenes/nueva.webp'
    );
  });

  describe('listado', () => {
    it('pide todas las publicaciones, incluidos los borradores', async () => {
      renderizar();
      await esperarListado();

      expect(api.listarPublicacionesApi).toHaveBeenCalledWith('todos', 1, expect.anything());
    });

    it('muestra fecha, lecturas, tiempo de lectura y estado', async () => {
      renderizar();
      await esperarListado();

      const publicada = fila('Pausas activas en la oficina');
      expect(publicada).toHaveTextContent('Cinco ejercicios de dos minutos');
      expect(publicada).toHaveTextContent('01/03/2026');
      expect(publicada).toHaveTextContent('120');
      expect(publicada).toHaveTextContent('4 min de lectura');
      expect(publicada).toHaveTextContent('Publicado');

      expect(fila('Cargas seguras en almacen')).toHaveTextContent('Borrador');
    });

    it('muestra un estado vacio sin publicaciones', async () => {
      vi.mocked(api.listarPublicacionesApi).mockResolvedValue(pagina([]));
      renderizar();

      expect(await screen.findByText(/todav[ií]a no hay publicaciones/i)).toBeInTheDocument();
    });

    it('pagina desde el backend con mas de 6', async () => {
      const usuario = userEvent.setup();
      vi.mocked(api.listarPublicacionesApi).mockImplementation(async (_estado, numero) =>
        numero === 1
          ? pagina([pausas], { total: 8, totalPaginas: 2 })
          : pagina([borrador], { pagina: 2, total: 8, totalPaginas: 2 })
      );
      renderizar();
      await esperarListado();

      await usuario.click(screen.getByRole('button', { name: 'Pagina 2' }));

      expect(await screen.findByText('Cargas seguras en almacen')).toBeInTheDocument();
      expect(api.listarPublicacionesApi).toHaveBeenLastCalledWith('todos', 2, expect.anything());
    });
  });

  describe('crear', () => {
    it('el modal trae los campos del articulo y la fecha de hoy', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);

      expect(within(dialogo).getByRole('textbox', { name: /^t[ií]tulo$/i })).toBeInTheDocument();
      expect(within(dialogo).getByLabelText(/^resumen$/i)).toBeInTheDocument();
      expect(within(dialogo).getByLabelText(/^contenido$/i)).toBeInTheDocument();
      expect(within(dialogo).getByRole('group', { name: /portada/i })).toBeInTheDocument();
      expect(within(dialogo).getByLabelText(/fecha de publicaci[oó]n/i)).toHaveValue(
        new Date().toLocaleDateString('en-CA')
      );
      expect(within(dialogo).getByRole('radio', { name: /publicado/i })).toBeChecked();
    });

    it('valida titulo y contenido antes de enviar', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await usuario.click(within(dialogo).getByRole('button', { name: /crear publicaci[oó]n/i }));

      expect(await within(dialogo).findByText('El título es obligatorio')).toBeInTheDocument();
      expect(within(dialogo).getByText('El contenido es obligatorio')).toBeInTheDocument();
      expect(api.crearPublicacionApi).not.toHaveBeenCalled();
    });

    it('cuenta los caracteres del resumen y las palabras del contenido', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await usuario.type(within(dialogo).getByLabelText(/^resumen$/i), 'Hola');
      await escribirContenido(dialogo, '<h2>uno</h2><p><strong>dos</strong> tres</p>');

      expect(within(dialogo).getByText(/4\/300/)).toBeInTheDocument();
      expect(within(dialogo).getByText(/3 palabras · 1 min de lectura/)).toBeInTheDocument();
    });

    it('el contenido tiene barra de formato', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      const barra = within(dialogo).getByRole('toolbar', { name: /formato de contenido/i });

      for (const nombre of ['Negrita', 'Cursiva', 'Título', 'Viñetas', 'Lista numerada', 'Cita', 'Enlace']) {
        expect(within(barra).getByRole('button', { name: nombre })).toBeInTheDocument();
      }
    });

    it('la vista previa muestra el articulo con su formato', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await usuario.type(within(dialogo).getByRole('textbox', { name: /^t[ií]tulo$/i }), 'Ergonomia en casa');
      await escribirContenido(
        dialogo,
        '<h2>Por que importa</h2><p>Texto con <strong>negrita</strong>.</p><ul><li><p>Primer punto</p></li><li><p>Segundo punto</p></li></ul>'
      );

      await usuario.click(within(dialogo).getByRole('tab', { name: /vista previa/i }));

      const articulo = within(dialogo).getByRole('article', { name: /vista previa/i });
      expect(within(articulo).getByRole('heading', { name: 'Ergonomia en casa', level: 1 })).toBeInTheDocument();
      expect(within(articulo).getByRole('heading', { name: 'Por que importa', level: 2 })).toBeInTheDocument();
      expect(within(articulo).getByText('negrita').tagName).toBe('STRONG');
      expect(within(articulo).getAllByRole('listitem')).toHaveLength(2);

      // Volver a escribir conserva lo escrito, formato incluido
      await usuario.click(within(dialogo).getByRole('tab', { name: /escribir/i }));
      expect(within(dialogo).getByRole('textbox', { name: /^t[ií]tulo$/i })).toHaveValue('Ergonomia en casa');
      const area = within(dialogo).getByRole('textbox', { name: /^contenido$/i });
      await waitFor(() => expect(within(area).getByText('negrita').tagName).toBe('STRONG'));
    });

    it('guarda como borrador con fecha y portada subida', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await escribir(usuario, dialogo);
      await usuario.type(within(dialogo).getByLabelText(/^resumen$/i), 'Consejos rapidos');
      fireEvent.change(within(dialogo).getByLabelText(/fecha de publicaci[oó]n/i), {
        target: { value: '2026-04-15' },
      });
      await usuario.click(within(dialogo).getByRole('radio', { name: /borrador/i }));
      const portada = new File([new Uint8Array(900)], 'portada.webp', { type: 'image/webp' });
      await usuario.upload(within(dialogo).getByLabelText(/elegir archivo/i), portada);
      await usuario.click(within(dialogo).getByRole('button', { name: /crear publicaci[oó]n/i }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(apiImagenes.subirImagenApi).toHaveBeenCalledWith(portada);
      expect(api.crearPublicacionApi).toHaveBeenCalledWith({
        title: 'Ergonomia en casa',
        excerpt: 'Consejos rapidos',
        content: '<p>Primer parrafo del articulo.</p>',
        publishedAt: '2026-04-15',
        status: 'inactive',
        coverUrl: 'http://localhost:4000/uploads/imagenes/nueva.webp',
      });
      expect(await screen.findByRole('status')).toHaveTextContent('Artículo "Ergonomia en casa" creado');
      expect(api.listarPublicacionesApi).toHaveBeenLastCalledWith('todos', 1, expect.anything());
    });

    it('si hay errores estando en la vista previa vuelve a la pestana de escribir', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await usuario.click(within(dialogo).getByRole('tab', { name: /vista previa/i }));
      await usuario.click(within(dialogo).getByRole('button', { name: /crear publicaci[oó]n/i }));

      expect(await within(dialogo).findByText('El título es obligatorio')).toBeInTheDocument();
      expect(within(dialogo).getByRole('tab', { name: /escribir/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('con texto escrito pide confirmacion antes de salir', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await escribirContenido(dialogo, 'Un borrador');
      fireEvent.mouseDown(dialogo.parentElement as HTMLElement);

      expect(screen.getByRole('alertdialog', { name: /cambios sin guardar/i })).toBeInTheDocument();
    });

    it('sin tocar nada se cierra sin preguntar', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      fireEvent.mouseDown(dialogo.parentElement as HTMLElement);

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });

  describe('editar', () => {
    it('abre con los datos guardados y actualiza la fila', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      await usuario.click(screen.getByRole('button', { name: 'Editar Pausas activas en la oficina' }));
      const dialogo = await screen.findByRole('dialog', { name: /editar publicaci[oó]n/i });

      const area = within(dialogo).getByRole('textbox', { name: /^contenido$/i });
      await waitFor(() => expect(within(area).getAllByText(/./).length).toBeGreaterThan(0));
      expect(area).toHaveTextContent('Levantarse cada hora reduce la tension.');
      expect(within(area).getByText('Estirar el cuello alivia la espalda.').tagName).toBe('P');
      expect(within(dialogo).getByLabelText(/fecha de publicaci[oó]n/i)).toHaveValue('2026-03-01');
      expect(within(dialogo).getByAltText('Vista previa')).toHaveAttribute('src', pausas.coverUrl);

      const resumen = within(dialogo).getByLabelText(/^resumen$/i);
      await usuario.clear(resumen);
      await usuario.type(resumen, 'Nuevo resumen');
      await usuario.click(within(dialogo).getByRole('button', { name: /guardar cambios/i }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(api.actualizarPublicacionApi).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ excerpt: 'Nuevo resumen', coverUrl: pausas.coverUrl, publishedAt: '2026-03-01' })
      );
      expect(fila('Pausas activas en la oficina')).toHaveTextContent('Nuevo resumen');
      expect(api.listarPublicacionesApi).toHaveBeenCalledTimes(1);
    });
  });

  describe('eliminar', () => {
    it('confirma y borra en el backend', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      vi.mocked(api.listarPublicacionesApi).mockResolvedValue(pagina([borrador]));
      await usuario.click(screen.getByRole('button', { name: 'Eliminar Pausas activas en la oficina' }));
      const dialogo = await screen.findByRole('dialog', { name: /eliminar esta publicaci[oó]n/i });
      await usuario.click(within(dialogo).getByRole('button', { name: /s[ií], eliminar/i }));

      await waitFor(() => expect(screen.queryByText('Pausas activas en la oficina')).not.toBeInTheDocument());
      expect(api.eliminarPublicacionApi).toHaveBeenCalledWith(1);
      expect(screen.getByRole('status')).toHaveTextContent(/eliminado/i);
    });

    it('cancelar no borra nada', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      await usuario.click(screen.getByRole('button', { name: 'Eliminar Pausas activas en la oficina' }));
      const dialogo = await screen.findByRole('dialog', { name: /eliminar esta publicaci[oó]n/i });
      await usuario.click(within(dialogo).getByRole('button', { name: /^cancelar$/i }));

      expect(api.eliminarPublicacionApi).not.toHaveBeenCalled();
    });
  });
});
