import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaProductos from './PaginaProductos';
import * as api from '@/features/productos/servicios/productos.api';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

vi.mock('@/features/productos/servicios/productos.api');

const enOferta: Producto = {
  productId: 1,
  name: 'Silla ergonomica Pro',
  description: 'Soporte lumbar regulable',
  brand: 'Hycon',
  model: 'SE-200',
  color: 'Negro',
  price: 25.9,
  discountPrice: 19.9,
  stock: 12,
  shippingAgencies: [
    { code: 'shalom', name: 'Shalom' },
    { code: 'olva', name: 'Olva Courier' },
  ],
  status: 'active',
  imageUrl: null,
  createdAt: '2026-09-10T12:00:00.000Z',
};

const agotado: Producto = {
  ...enOferta,
  productId: 2,
  name: 'Reposapies',
  description: null,
  brand: null,
  model: null,
  color: null,
  discountPrice: null,
  stock: 0,
  shippingAgencies: [],
};

const pagina = (elementos: Producto[], extra = {}) => ({
  elementos,
  paginacion: { pagina: 1, porPagina: 6, total: elementos.length, totalPaginas: 1, ...extra },
});

const renderizar = () =>
  render(
    <MemoryRouter>
      <PaginaProductos />
    </MemoryRouter>
  );

const rejilla = () => screen.findByRole('list', { name: /catalogo de productos/i });

describe('PaginaProductos (publica)', () => {
  beforeEach(() => {
    vi.mocked(api.listarProductosApi).mockResolvedValue(pagina([enOferta, agotado]));
  });

  it('pide al backend solo los productos activos de la primera pagina', async () => {
    renderizar();
    await screen.findByText('Silla ergonomica Pro');

    expect(api.listarProductosApi).toHaveBeenCalledWith('active', 1, expect.anything());
  });

  it('muestra una tarjeta por producto', async () => {
    renderizar();

    expect(within(await rejilla()).getAllByRole('listitem')).toHaveLength(2);
  });

  it('destaca la oferta y tacha el precio original', async () => {
    renderizar();

    const tarjeta = within(await rejilla()).getAllByRole('listitem')[0];

    expect(within(tarjeta).getByText('OFERTA')).toBeInTheDocument();
    expect(within(tarjeta).getByText(/19\.90/)).toBeInTheDocument();
    expect(within(tarjeta).getByText(/25\.90/)).toBeInTheDocument();
  });

  it('informa el color y las agencias de envio', async () => {
    renderizar();

    const tarjeta = within(await rejilla()).getAllByRole('listitem')[0];

    expect(tarjeta).toHaveTextContent('Color: Negro');
    expect(tarjeta).toHaveTextContent('Envíos por Shalom, Olva Courier');
  });

  it('avisa cuando un producto esta agotado', async () => {
    renderizar();

    const tarjeta = within(await rejilla()).getAllByRole('listitem')[1];

    expect(within(tarjeta).getByText('Sin stock')).toBeInTheDocument();
    expect(tarjeta).not.toHaveTextContent('Envíos por');
  });

  it('muestra un estado vacio si no hay catalogo', async () => {
    vi.mocked(api.listarProductosApi).mockResolvedValue(pagina([]));
    renderizar();

    expect(await screen.findByText(/todavia no hay productos publicados/i)).toBeInTheDocument();
  });

  it('avisa si la carga falla', async () => {
    vi.mocked(api.listarProductosApi).mockRejectedValue(new Error('Servidor no disponible'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(/servidor no disponible/i);
  });

  it('sin mas de una pagina no muestra paginador', async () => {
    renderizar();
    await rejilla();

    expect(screen.queryByRole('navigation', { name: /paginas de productos/i })).not.toBeInTheDocument();
  });

  it('con mas de 6 productos pagina desde el backend', async () => {
    const usuario = userEvent.setup();
    vi.mocked(api.listarProductosApi).mockImplementation(async (_estado, numero) =>
      numero === 1
        ? pagina([enOferta], { total: 8, totalPaginas: 2 })
        : pagina([agotado], { pagina: 2, total: 8, totalPaginas: 2 })
    );
    renderizar();
    await screen.findByText('Silla ergonomica Pro');

    await usuario.click(screen.getByRole('button', { name: 'Pagina 2' }));

    expect(await screen.findByText('Reposapies')).toBeInTheDocument();
    expect(api.listarProductosApi).toHaveBeenLastCalledWith('active', 2, expect.anything());
    expect(screen.queryByText('Silla ergonomica Pro')).not.toBeInTheDocument();
  });

  it('la pagina publica no ofrece alta ni edicion', async () => {
    renderizar();
    await screen.findByText('Silla ergonomica Pro');

    expect(screen.queryByRole('button', { name: /agregar producto/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
  });
});
