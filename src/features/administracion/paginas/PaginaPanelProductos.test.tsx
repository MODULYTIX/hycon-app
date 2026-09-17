import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createEvent, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaPanelProductos from './PaginaPanelProductos';
import * as api from '@/features/productos/servicios/productos.api';
import * as apiImagenes from '@/shared/servicios/imagenes.api';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

// Las pruebas no hablan con el backend: se sustituye la capa de servicios
vi.mock('@/features/productos/servicios/productos.api');
vi.mock('@/shared/servicios/imagenes.api');

type Usuario = ReturnType<typeof userEvent.setup>;

const AGENCIAS = [
  { code: 'shalom', name: 'Shalom' },
  { code: 'olva', name: 'Olva Courier' },
  { code: 'marvisur', name: 'Marvisur' },
];

const silla: Producto = {
  productId: 1,
  name: 'Silla ergonomica Pro',
  description: null,
  brand: 'Hycon',
  model: 'SE-200',
  color: 'Negro',
  price: 459.9,
  discountPrice: 399.9,
  stock: 12,
  shippingAgencies: [AGENCIAS[0]],
  status: 'active',
  imageUrl: 'http://localhost:4000/uploads/imagenes/silla.webp',
  createdAt: '2026-09-10T12:00:00.000Z',
};

const reposapies: Producto = {
  ...silla,
  productId: 2,
  name: 'Reposapies regulable',
  brand: null,
  model: null,
  color: null,
  discountPrice: null,
  stock: 0,
  shippingAgencies: [],
  imageUrl: null,
};

const pagina = (elementos: Producto[], extra = {}) => ({
  elementos,
  paginacion: { pagina: 1, porPagina: 6, total: elementos.length, totalPaginas: 1, ...extra },
});

const renderizar = () =>
  render(
    <MemoryRouter>
      <PaginaPanelProductos />
    </MemoryRouter>
  );

const lista = () => screen.getByRole('list', { name: /productos del cat[aá]logo/i });
const fila = (nombre: string) =>
  within(lista())
    .getAllByRole('listitem')
    .find((elemento) => elemento.textContent?.includes(nombre)) as HTMLElement;

const esperarListado = () => screen.findByText('Silla ergonomica Pro');

const abrirAlta = async (usuario: Usuario) => {
  await usuario.click(screen.getByRole('button', { name: /agregar producto/i }));
  return screen.findByRole('dialog', { name: /agregar producto/i });
};

const rellenarMinimo = async (usuario: Usuario, dialogo: HTMLElement) => {
  await usuario.type(within(dialogo).getByLabelText(/^nombre$/i), 'Cojin lumbar');
  await usuario.type(within(dialogo).getByLabelText(/^precio$/i), '89.90');
};

const guardar = (usuario: Usuario, dialogo: HTMLElement, texto = /agregar producto/i) =>
  usuario.click(within(dialogo).getByRole('button', { name: texto }));

const fondoDelModal = () => screen.getAllByRole('dialog')[0].parentElement as HTMLElement;

describe('PaginaPanelProductos', () => {
  beforeEach(() => {
    vi.mocked(api.listarProductosApi).mockResolvedValue(pagina([silla, reposapies]));
    vi.mocked(api.listarAgenciasApi).mockResolvedValue(AGENCIAS);
    vi.mocked(api.crearProductoApi).mockImplementation(async (datos) => ({
      ...reposapies,
      productId: 3,
      name: datos.name,
    }));
    vi.mocked(api.actualizarProductoApi).mockImplementation(async (id, datos) => ({
      ...silla,
      productId: id,
      name: datos.name,
      color: datos.color || null,
    }));
    vi.mocked(api.eliminarProductoApi).mockResolvedValue(undefined);
    vi.mocked(apiImagenes.subirImagenApi).mockResolvedValue(
      'http://localhost:4000/uploads/imagenes/nueva.png'
    );
  });

  describe('listado', () => {
    it('pide al backend la primera pagina incluyendo inactivos', async () => {
      renderizar();
      await esperarListado();

      expect(api.listarProductosApi).toHaveBeenCalledWith('todos', 1, expect.anything());
    });

    it('muestra marca, modelo, color, agencias, cantidad y precio con oferta', async () => {
      renderizar();
      await esperarListado();

      const conDatos = fila('Silla ergonomica Pro');
      expect(conDatos).toHaveTextContent('Hycon · SE-200');
      expect(conDatos).toHaveTextContent('Negro');
      expect(conDatos).toHaveTextContent('Shalom');
      expect(conDatos).toHaveTextContent('12 unid.');
      expect(conDatos).toHaveTextContent(/399\.90/);
      expect(conDatos).toHaveTextContent(/459\.90/);

      expect(fila('Reposapies regulable')).toHaveTextContent('Sin stock');
    });

    it('cada fila tiene sus botones de editar y eliminar', async () => {
      renderizar();
      await esperarListado();

      expect(screen.getByRole('button', { name: 'Editar Silla ergonomica Pro' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Eliminar Reposapies regulable' })
      ).toBeInTheDocument();
    });

    it('muestra un estado vacio cuando no hay productos', async () => {
      vi.mocked(api.listarProductosApi).mockResolvedValue(pagina([]));
      renderizar();

      expect(await screen.findByText(/todav[ií]a no hay productos/i)).toBeInTheDocument();
    });

    it('avisa si el listado falla', async () => {
      vi.mocked(api.listarProductosApi).mockRejectedValue(new Error('Servidor no disponible'));
      renderizar();

      expect(await screen.findByRole('alert')).toHaveTextContent(/servidor no disponible/i);
    });

    it('con 6 o menos no hay paginador', async () => {
      renderizar();
      await esperarListado();

      expect(screen.queryByRole('navigation', { name: /paginas de productos/i })).not.toBeInTheDocument();
    });

    it('con mas de 6 pagina pidiendo cada pagina al backend', async () => {
      const usuario = userEvent.setup();
      vi.mocked(api.listarProductosApi).mockImplementation(async (_estado, numero) =>
        numero === 1
          ? pagina([silla], { total: 14, totalPaginas: 3 })
          : pagina([{ ...reposapies, name: `Producto de la pagina ${numero}` }], {
              pagina: numero,
              total: 14,
              totalPaginas: 3,
            })
      );
      renderizar();
      await esperarListado();

      const paginador = screen.getByRole('navigation', { name: /paginas de productos/i });
      expect(paginador).toHaveTextContent('Mostrando 1 - 6 de 14 productos');

      await usuario.click(within(paginador).getByRole('button', { name: 'Pagina 3' }));

      expect(await screen.findByText('Producto de la pagina 3')).toBeInTheDocument();
      expect(api.listarProductosApi).toHaveBeenLastCalledWith('todos', 3, expect.anything());
    });

    it('el panel no ofrece filtros de busqueda', async () => {
      renderizar();
      await esperarListado();

      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    });
  });

  describe('agregar', () => {
    it('el formulario vive en un modal con los campos pedidos', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      const dialogo = await abrirAlta(usuario);

      for (const etiqueta of [/^nombre$/i, /^marca$/i, /^modelo$/i, /^color$/i, /^precio$/i, /^cantidad$/i]) {
        expect(within(dialogo).getByLabelText(etiqueta)).toBeInTheDocument();
      }
      expect(
        within(dialogo).getByRole('group', { name: /env[ií]os por la agencia de su preferencia/i })
      ).toBeInTheDocument();
      expect(await within(dialogo).findByRole('checkbox', { name: 'Olva Courier' })).toBeInTheDocument();
    });

    it('valida antes de llamar al backend', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await guardar(usuario, dialogo);

      expect(await within(dialogo).findByText('El nombre es obligatorio')).toBeInTheDocument();
      expect(within(dialogo).getByText('El precio es obligatorio')).toBeInTheDocument();
      expect(api.crearProductoApi).not.toHaveBeenCalled();
    });

    it('bloquea una oferta mayor que el precio', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await rellenarMinimo(usuario, dialogo);
      await usuario.type(within(dialogo).getByLabelText(/precio de oferta/i), '120');
      await guardar(usuario, dialogo);

      expect(await within(dialogo).findByText('Debe ser menor que el precio')).toBeInTheDocument();
      expect(api.crearProductoApi).not.toHaveBeenCalled();
    });

    it('envia color, cantidad y agencias elegidas y vuelve a la primera pagina', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await rellenarMinimo(usuario, dialogo);
      await usuario.type(within(dialogo).getByLabelText(/^color$/i), 'Gris');
      await usuario.type(within(dialogo).getByLabelText(/^cantidad$/i), '30');
      // Se marcan en otro orden: se envian en el orden del catalogo de agencias
      await usuario.click(await within(dialogo).findByRole('checkbox', { name: 'Olva Courier' }));
      await usuario.click(within(dialogo).getByRole('checkbox', { name: 'Shalom' }));
      await guardar(usuario, dialogo);

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      expect(api.crearProductoApi).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Cojin lumbar',
          price: '89.90',
          color: 'Gris',
          stock: '30',
          shippingAgencies: ['shalom', 'olva'],
          imageUrl: '',
        })
      );
      expect(await screen.findByRole('status')).toHaveTextContent(/cojin lumbar.*agregado/i);
      // Se recarga desde el backend para respetar su orden y su paginacion
      expect(api.listarProductosApi).toHaveBeenCalledTimes(2);
      expect(api.listarProductosApi).toHaveBeenLastCalledWith('todos', 1, expect.anything());
    });

    it('sube la imagen arrastrada y guarda el producto con su URL', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await rellenarMinimo(usuario, dialogo);

      const zona = within(dialogo).getByRole('group', { name: /imagen del producto/i });
      const archivo = new File([new Uint8Array(2048)], 'cojin.png', { type: 'image/png' });
      const soltar = createEvent.drop(zona);
      Object.defineProperty(soltar, 'dataTransfer', { value: { files: [archivo] } });
      fireEvent(zona, soltar);

      await guardar(usuario, dialogo);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      expect(apiImagenes.subirImagenApi).toHaveBeenCalledWith(archivo);
      expect(api.crearProductoApi).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'http://localhost:4000/uploads/imagenes/nueva.png' })
      );
    });

    it('si falla la subida no crea el producto y lo explica', async () => {
      const usuario = userEvent.setup();
      vi.mocked(apiImagenes.subirImagenApi).mockRejectedValue(
        new Error('La imagen supera el maximo de 5 MB')
      );
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await rellenarMinimo(usuario, dialogo);
      await usuario.upload(
        within(dialogo).getByLabelText(/elegir archivo/i),
        new File([new Uint8Array(10)], 'a.png', { type: 'image/png' })
      );
      await guardar(usuario, dialogo);

      expect(await within(dialogo).findByText(/supera el maximo de 5 MB/i)).toBeInTheDocument();
      expect(api.crearProductoApi).not.toHaveBeenCalled();
    });

    it('muestra el error del backend dentro del modal', async () => {
      const usuario = userEvent.setup();
      vi.mocked(api.crearProductoApi).mockRejectedValue(new Error('No tienes permisos para esta accion'));
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await rellenarMinimo(usuario, dialogo);
      await guardar(usuario, dialogo);

      expect(await within(dialogo).findByText(/no tienes permisos/i)).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('salir del modal con datos escritos', () => {
    it('sin escribir nada, pulsar fuera cierra directamente', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      await abrirAlta(usuario);
      fireEvent.mouseDown(fondoDelModal());

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('con datos escritos, pulsar fuera pide confirmacion antes de salir', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await usuario.type(within(dialogo).getByLabelText(/^nombre$/i), 'Cojin');
      fireEvent.mouseDown(fondoDelModal());

      const confirmacion = screen.getByRole('alertdialog', { name: /cambios sin guardar/i });

      // Seguir editando conserva lo escrito
      await usuario.click(within(confirmacion).getByRole('button', { name: /seguir editando/i }));
      expect(within(dialogo).getByLabelText(/^nombre$/i)).toHaveValue('Cojin');

      // Cancelar tambien pregunta, y descartar cierra
      await usuario.click(within(dialogo).getByRole('button', { name: /^cancelar$/i }));
      await usuario.click(screen.getByRole('button', { name: /descartar y salir/i }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(api.crearProductoApi).not.toHaveBeenCalled();
    });

    it('marcar una agencia tambien cuenta como cambio', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      const dialogo = await abrirAlta(usuario);
      await usuario.click(await within(dialogo).findByRole('checkbox', { name: 'Marvisur' }));
      await usuario.keyboard('{Escape}');

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('al editar, abrir y cerrar sin tocar nada no pregunta', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      await usuario.click(screen.getByRole('button', { name: 'Editar Silla ergonomica Pro' }));
      await screen.findByRole('dialog', { name: /editar producto/i });
      fireEvent.mouseDown(fondoDelModal());

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });

  describe('editar', () => {
    it('abre el modal con los datos guardados', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      await usuario.click(screen.getByRole('button', { name: 'Editar Silla ergonomica Pro' }));
      const dialogo = await screen.findByRole('dialog', { name: /editar producto/i });

      expect(within(dialogo).getByLabelText(/^nombre$/i)).toHaveValue('Silla ergonomica Pro');
      expect(within(dialogo).getByLabelText(/^color$/i)).toHaveValue('Negro');
      expect(within(dialogo).getByLabelText(/^precio$/i)).toHaveValue('459.9');
      expect(within(dialogo).getByLabelText(/^cantidad$/i)).toHaveValue('12');
      expect(await within(dialogo).findByRole('checkbox', { name: 'Shalom' })).toBeChecked();
      expect(within(dialogo).getByRole('checkbox', { name: 'Olva Courier' })).not.toBeChecked();
      expect(within(dialogo).getByAltText('Vista previa')).toHaveAttribute('src', silla.imageUrl);
    });

    it('guarda con PUT, conserva la imagen y actualiza la fila sin recargar', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      await usuario.click(screen.getByRole('button', { name: 'Editar Silla ergonomica Pro' }));
      const dialogo = await screen.findByRole('dialog', { name: /editar producto/i });
      const color = within(dialogo).getByLabelText(/^color$/i);
      await usuario.clear(color);
      await usuario.type(color, 'Azul marino');
      await guardar(usuario, dialogo, /guardar cambios/i);

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      expect(api.actualizarProductoApi).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ color: 'Azul marino', imageUrl: silla.imageUrl })
      );
      expect(apiImagenes.subirImagenApi).not.toHaveBeenCalled();
      expect(fila('Silla ergonomica Pro')).toHaveTextContent('Azul marino');
      expect(api.listarProductosApi).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('status')).toHaveTextContent(/cambios guardados/i);
    });

    it('quitar la imagen envia la URL vacia', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      await usuario.click(screen.getByRole('button', { name: 'Editar Silla ergonomica Pro' }));
      const dialogo = await screen.findByRole('dialog', { name: /editar producto/i });
      await usuario.click(within(dialogo).getByRole('button', { name: /quitar imagen/i }));
      await guardar(usuario, dialogo, /guardar cambios/i);

      await waitFor(() =>
        expect(api.actualizarProductoApi).toHaveBeenCalledWith(1, expect.objectContaining({ imageUrl: '' }))
      );
    });
  });

  describe('eliminar', () => {
    it('pide confirmacion y cancelar no borra nada', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      await usuario.click(screen.getByRole('button', { name: 'Eliminar Silla ergonomica Pro' }));
      const dialogo = await screen.findByRole('dialog', { name: /eliminar este producto/i });
      expect(dialogo).toHaveTextContent('Silla ergonomica Pro');

      await usuario.click(within(dialogo).getByRole('button', { name: /^cancelar$/i }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(api.eliminarProductoApi).not.toHaveBeenCalled();
    });

    it('al confirmar borra en el backend y recarga la pagina', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await esperarListado();

      vi.mocked(api.listarProductosApi).mockResolvedValue(pagina([reposapies]));
      await usuario.click(screen.getByRole('button', { name: 'Eliminar Silla ergonomica Pro' }));
      const dialogo = await screen.findByRole('dialog', { name: /eliminar este producto/i });
      await usuario.click(within(dialogo).getByRole('button', { name: /s[ií], eliminar/i }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(api.eliminarProductoApi).toHaveBeenCalledWith(1);
      expect(await screen.findByRole('status')).toHaveTextContent(/silla ergonomica pro.*eliminado/i);
      await waitFor(() => expect(screen.queryByText('Silla ergonomica Pro')).not.toBeInTheDocument());
    });

    it('si el backend lo impide muestra el motivo y no cierra', async () => {
      const usuario = userEvent.setup();
      vi.mocked(api.eliminarProductoApi).mockRejectedValue(
        new Error('Este producto ya tiene pedidos o carritos asociados. Desactivalo en lugar de eliminarlo')
      );
      renderizar();
      await esperarListado();

      await usuario.click(screen.getByRole('button', { name: 'Eliminar Silla ergonomica Pro' }));
      const dialogo = await screen.findByRole('dialog', { name: /eliminar este producto/i });
      await usuario.click(within(dialogo).getByRole('button', { name: /s[ií], eliminar/i }));

      expect(await within(dialogo).findByRole('alert')).toHaveTextContent(/desactivalo/i);
      expect(fila('Silla ergonomica Pro')).toBeInTheDocument();
    });

    it('si se borra lo unico de la ultima pagina retrocede a la anterior', async () => {
      const usuario = userEvent.setup();
      vi.mocked(api.listarProductosApi).mockImplementation(async (_estado, numero) =>
        numero === 1
          ? pagina([silla], { total: 7, totalPaginas: 2 })
          : pagina([reposapies], { pagina: 2, total: 7, totalPaginas: 2 })
      );
      renderizar();
      await esperarListado();
      await usuario.click(screen.getByRole('button', { name: 'Pagina 2' }));
      await screen.findByText('Reposapies regulable');

      // Tras borrar ya solo existe una pagina
      vi.mocked(api.listarProductosApi).mockImplementation(async (_estado, numero) =>
        numero === 1
          ? pagina([silla], { total: 6, totalPaginas: 1 })
          : pagina([], { pagina: numero, total: 6, totalPaginas: 1 })
      );
      await usuario.click(screen.getByRole('button', { name: 'Eliminar Reposapies regulable' }));
      const dialogo = await screen.findByRole('dialog', { name: /eliminar este producto/i });
      await usuario.click(within(dialogo).getByRole('button', { name: /s[ií], eliminar/i }));

      expect(await screen.findByText('Silla ergonomica Pro')).toBeInTheDocument();
      expect(api.listarProductosApi).toHaveBeenLastCalledWith('todos', 1, expect.anything());
    });
  });
});
