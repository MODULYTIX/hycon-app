import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaginaProductos from './PaginaProductos';
import PaginaDetalleProducto from './PaginaDetalleProducto';
import * as api from '@/features/productos/servicios/productos.api';
import type { ProductoDetalle } from '@/features/productos/tipos/producto.tipos';

vi.mock('@/features/productos/servicios/productos.api');

const producto: ProductoDetalle = {
  productId: 7,
  name: 'Silla ergonómica',
  description: 'Soporte para jornadas de trabajo prolongadas.',
  brand: 'Hycon',
  model: 'E-20',
  price: 150,
  discountPrice: 120,
  stock: 3,
  status: 'active',
  imageUrl: 'https://example.com/silla.jpg',
  imageUrls: ['https://example.com/silla.jpg'],
  createdAt: '2026-09-10T12:00:00.000Z',
};

const renderizar = (ruta = '/productos') => render(
  <MemoryRouter initialEntries={[ruta]}>
    <Routes>
      <Route path="/productos" element={<PaginaProductos />} />
      <Route path="/productos/:productId" element={<PaginaDetalleProducto />} />
    </Routes>
  </MemoryRouter>
);

describe('detalle de producto', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(api.listarProductosApi).mockResolvedValue([producto]);
    vi.mocked(api.obtenerProductoApi).mockResolvedValue(producto);
  });

  it('abre el detalle al seleccionar una tarjeta y consulta el ID', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.click(await screen.findByRole('link', { name: /ver detalles de silla ergonómica/i }));

    expect(await screen.findByRole('heading', { name: 'Silla ergonómica' })).toBeInTheDocument();
    expect(api.obtenerProductoApi).toHaveBeenCalledWith(7, expect.anything());
    expect(screen.getByText('Soporte para jornadas de trabajo prolongadas.')).toBeInTheDocument();
    expect(screen.getByText('E-20')).toBeInTheDocument();
  });

  it('controla la cantidad y guarda el producto en el carrito local', async () => {
    const usuario = userEvent.setup();
    renderizar('/productos/7');
    await screen.findByRole('heading', { name: 'Silla ergonómica' });

    await usuario.click(screen.getByRole('button', { name: 'Aumentar cantidad' }));
    await usuario.click(screen.getByRole('button', { name: 'Agregar al carrito' }));

    expect(JSON.parse(window.localStorage.getItem('hycon.carrito.productos') || '[]')).toEqual([
      { productId: 7, quantity: 2 },
    ]);
    expect(screen.getByRole('status')).toHaveTextContent('2 unidades agregadas');
  });

  it('muestra las fotos distintas y permite cambiar la imagen de la galería', async () => {
    const usuario = userEvent.setup();
    const secundaria = 'https://example.com/silla-lateral.jpg';
    vi.mocked(api.obtenerProductoApi).mockResolvedValue({ ...producto, imageUrls: [producto.imageUrl!, secundaria] });
    renderizar('/productos/7');
    await screen.findByRole('heading', { name: 'Silla ergonómica' });

    const filaPrincipal = screen.getByRole('region', { name: 'Imagen e información principal' });
    const filaInferior = screen.getByRole('region', { name: 'Descripción y vista adicional' });

    expect(within(filaPrincipal).getByRole('img', { name: 'Silla ergonómica' })).toBeInTheDocument();
    expect(within(filaPrincipal).getByText('E-20')).toBeInTheDocument();
    expect(within(filaInferior).getByText('Soporte para jornadas de trabajo prolongadas.')).toBeInTheDocument();
    expect(within(filaInferior).getByRole('img', { name: 'Vista adicional de Silla ergonómica' })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Ver imagen 2' }));
    expect(within(filaPrincipal).getByRole('img', { name: 'Silla ergonómica' })).toHaveAttribute('src', secundaria);
    expect(screen.getByRole('link', { name: 'Ampliar imagen' })).toHaveAttribute('href', secundaria);
  });

  it('evita repetir la misma foto y muestra información de entrega cuando no hay otra vista', async () => {
    vi.mocked(api.obtenerProductoApi).mockResolvedValue({ ...producto, imageUrls: [producto.imageUrl!, producto.imageUrl!] });
    renderizar('/productos/7');
    await screen.findByRole('heading', { name: 'Silla ergonómica' });

    expect(screen.queryByRole('img', { name: 'Vista adicional de Silla ergonómica' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver imagen 2' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Entrega coordinada' })).toBeInTheDocument();
  });
});
