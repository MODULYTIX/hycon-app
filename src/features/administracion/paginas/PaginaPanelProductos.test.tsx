import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaProductos from './PaginaProductos';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import * as api from '@/features/administracion/servicios/catalogo.api';
import type { Producto } from '@/features/administracion/tipos/catalogo.tipos';

// Las pruebas no hablan con el backend: se sustituye la capa de servicios
vi.mock('@/features/administracion/servicios/catalogo.api');

const productoExistente: Producto = {
  productId: 1,
  name: 'Caja de carton 40x40',
  description: null,
  brand: 'Hycon',
  model: 'C-40',
  price: 25.9,
  discountPrice: 19.9,
  stock: 12,
  status: 'active',
  imageUrl: null,
  createdAt: '2026-09-10T12:00:00.000Z',
};

const productoNuevo: Producto = {
  productId: 2,
  name: 'Cinta de embalaje',
  description: null,
  brand: null,
  model: null,
  price: 8.5,
  discountPrice: null,
  stock: 40,
  status: 'active',
  imageUrl: null,
  createdAt: '2026-09-10T13:00:00.000Z',
};

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <MemoryRouter>
        <PaginaProductos />
      </MemoryRouter>
    </AutenticacionProveedor>
  );

const lista = () => screen.getByRole('list', { name: /productos del catalogo/i });

const abrirModal = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.click(screen.getByRole('button', { name: /agregar producto/i }));
  return screen.findByRole('dialog');
};

const rellenarMinimo = async (
  usuario: ReturnType<typeof userEvent.setup>,
  dialogo: HTMLElement
) => {
  await usuario.type(within(dialogo).getByLabelText(/^nombre$/i), 'Cinta de embalaje');
  await usuario.type(within(dialogo).getByLabelText(/^precio \(s\/\)$/i), '8.50');
};

const enviar = (usuario: ReturnType<typeof userEvent.setup>, dialogo: HTMLElement) =>
  usuario.click(within(dialogo).getByRole('button', { name: /agregar producto/i }));

describe('PaginaProductos', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(api.listarProductosApi).mockResolvedValue([productoExistente]);
    vi.mocked(api.crearProductoApi).mockResolvedValue(productoNuevo);
  });

  it('pide el listado al backend y lo muestra', async () => {
    renderizar();

    expect(await screen.findByText('Caja de carton 40x40')).toBeInTheDocument();
    expect(api.listarProductosApi).toHaveBeenCalledTimes(1);
  });

  it('muestra marca, modelo, stock y el precio rebajado con el original tachado', async () => {
    renderizar();

    const fila = within(await screen.findByRole('list', { name: /productos/i })).getByRole(
      'listitem'
    );

    expect(within(fila).getByText(/Hycon - C-40/)).toBeInTheDocument();
    expect(within(fila).getByText('12 en stock')).toBeInTheDocument();
    expect(within(fila).getByText(/19\.90/)).toBeInTheDocument();
    expect(within(fila).getByText(/25\.90/)).toBeInTheDocument();
  });

  it('muestra un estado vacio cuando no hay productos', async () => {
    vi.mocked(api.listarProductosApi).mockResolvedValue([]);
    renderizar();

    expect(await screen.findByText(/todavia no hay productos/i)).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: /productos del catalogo/i })).not.toBeInTheDocument();
  });

  it('avisa si el listado falla', async () => {
    vi.mocked(api.listarProductosApi).mockRejectedValue(new Error('Servidor no disponible'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(/servidor no disponible/i);
  });

  it('el formulario vive en un modal que empieza cerrado', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Caja de carton 40x40');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const dialogo = await abrirModal(usuario);

    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(within(dialogo).getByLabelText(/^nombre$/i)).toBeInTheDocument();
  });

  it('el modal se cierra con Cancelar sin llamar al backend', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Caja de carton 40x40');

    const dialogo = await abrirModal(usuario);
    await usuario.click(within(dialogo).getByRole('button', { name: /cancelar/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.crearProductoApi).not.toHaveBeenCalled();
  });

  it('el modal se cierra con Escape', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Caja de carton 40x40');

    await abrirModal(usuario);
    await usuario.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('valida dentro del modal antes de llamar al backend', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Caja de carton 40x40');

    const dialogo = await abrirModal(usuario);
    await enviar(usuario, dialogo);

    expect(await within(dialogo).findByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(within(dialogo).getByText('El precio es obligatorio')).toBeInTheDocument();
    expect(api.crearProductoApi).not.toHaveBeenCalled();
    // El modal sigue abierto para poder corregir
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('bloquea una oferta mayor que el precio', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Caja de carton 40x40');

    const dialogo = await abrirModal(usuario);
    await rellenarMinimo(usuario, dialogo);
    await usuario.type(within(dialogo).getByLabelText(/precio oferta/i), '10');
    await enviar(usuario, dialogo);

    expect(await within(dialogo).findByText('Debe ser menor que el precio')).toBeInTheDocument();
    expect(api.crearProductoApi).not.toHaveBeenCalled();
  });

  it('guarda, cierra el modal y agrega el producto al listado sin recargar', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Caja de carton 40x40');

    const dialogo = await abrirModal(usuario);
    await rellenarMinimo(usuario, dialogo);
    await usuario.type(within(dialogo).getByLabelText(/^stock$/i), '40');
    await enviar(usuario, dialogo);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    expect(api.crearProductoApi).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Cinta de embalaje', price: '8.50', stock: '40' })
    );
    expect(within(lista()).getByText('Cinta de embalaje')).toBeInTheDocument();
    // El nuevo va primero y no se vuelve a pedir la lista al servidor
    expect(within(lista()).getAllByRole('listitem')[0]).toHaveTextContent('Cinta de embalaje');
    expect(api.listarProductosApi).toHaveBeenCalledTimes(1);
  });

  it('confirma el alta con un aviso en la pagina', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Caja de carton 40x40');

    const dialogo = await abrirModal(usuario);
    await rellenarMinimo(usuario, dialogo);
    await enviar(usuario, dialogo);

    expect(await screen.findByText(/agregado al catalogo/i)).toBeInTheDocument();
  });

  it('muestra el error del backend dentro del modal y no toca el listado', async () => {
    const usuario = userEvent.setup();
    vi.mocked(api.crearProductoApi).mockRejectedValue(
      new Error('No tienes permisos para esta accion')
    );
    renderizar();
    await screen.findByText('Caja de carton 40x40');

    const dialogo = await abrirModal(usuario);
    await rellenarMinimo(usuario, dialogo);
    await enviar(usuario, dialogo);

    expect(await within(dialogo).findByText(/no tienes permisos/i)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(within(lista()).queryByText('Cinta de embalaje')).not.toBeInTheDocument();
  });

  it('el panel no ofrece filtros de busqueda', async () => {
    renderizar();
    await screen.findByText('Caja de carton 40x40');

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/buscar/i)).not.toBeInTheDocument();
  });
});
