import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaginaProductos from './PaginaProductos';
import * as api from '@/features/productos/servicios/productos.api';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

vi.mock('@/features/productos/servicios/productos.api');

const enOferta: Producto = {
  productId: 1,
  name: 'Caja de carton 40x40',
  description: 'Doble corrugado',
  brand: 'Hycon',
  model: 'C-40',
  price: 25.9,
  discountPrice: 19.9,
  stock: 12,
  status: 'active',
  imageUrl: null,
  createdAt: '2026-09-10T12:00:00.000Z',
};

const agotado: Producto = {
  ...enOferta,
  productId: 2,
  name: 'Cinta de embalaje',
  description: null,
  brand: null,
  model: null,
  discountPrice: null,
  stock: 0,
};

const renderizar = () =>
  render(
    <MemoryRouter>
      <PaginaProductos />
    </MemoryRouter>
  );

const rejilla = () => screen.findByRole('list', { name: /catalogo de productos/i });

describe('PaginaProductos (publica)', () => {
  beforeEach(() => {
    vi.mocked(api.listarProductosApi).mockResolvedValue([enOferta, agotado]);
  });

  it('pide al backend solo los productos activos', async () => {
    renderizar();
    await screen.findByText('Caja de carton 40x40');

    // El catalogo publico no debe mostrar lo dado de baja
    expect(api.listarProductosApi).toHaveBeenCalledWith('active', expect.anything());
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

  it('avisa cuando un producto esta agotado', async () => {
    renderizar();

    const tarjeta = within(await rejilla()).getAllByRole('listitem')[1];

    expect(within(tarjeta).getByText('Sin stock')).toBeInTheDocument();
    expect(within(tarjeta).getByText('Agotado')).toBeInTheDocument();
  });

  it('muestra un estado vacio si no hay catalogo', async () => {
    vi.mocked(api.listarProductosApi).mockResolvedValue([]);
    renderizar();

    expect(await screen.findByText(/todavia no hay productos publicados/i)).toBeInTheDocument();
  });

  it('avisa si la carga falla', async () => {
    vi.mocked(api.listarProductosApi).mockRejectedValue(new Error('Servidor no disponible'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(/servidor no disponible/i);
  });

  it('la pagina publica no ofrece formulario de alta', async () => {
    renderizar();
    await screen.findByText('Caja de carton 40x40');

    expect(screen.queryByRole('button', { name: /agregar producto/i })).not.toBeInTheDocument();
  });
});
