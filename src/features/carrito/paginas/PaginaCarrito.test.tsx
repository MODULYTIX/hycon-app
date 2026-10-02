import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaCarrito from './PaginaCarrito';
import { agregarAlCarrito, leerCarrito } from '@/features/carrito/servicios/carrito.almacen';
import * as productosApi from '@/features/productos/servicios/productos.api';
import * as cursosApi from '@/features/cursos/servicios/cursos.api';
import type { ProductoDetalle } from '@/features/productos/tipos/producto.tipos';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

vi.mock('@/features/productos/servicios/productos.api');
vi.mock('@/features/cursos/servicios/cursos.api');

const CAJA = '7b73989c-0719-4c06-bd1e-8c7ae193a432';
const CURSO = 'b7b299d8-ee8f-4bea-a618-0a5f8261136f';

const caja: ProductoDetalle = {
  uuid: CAJA,
  name: 'Caja de carton 40x40',
  description: 'Doble corrugado',
  brand: 'Hycon',
  model: 'C-40R',
  color: null,
  price: 25.9,
  discountPrice: 19.9,
  stock: 3,
  shippingAgencies: [],
  status: 'active',
  imageUrl: 'https://cdn.hycon.lat/caja.webp',
  imageUrls: ['https://cdn.hycon.lat/caja.webp'],
  createdAt: '2026-09-10T12:00:00.000Z',
};

const curso: Curso = {
  uuid: CURSO,
  name: 'Logistica de ultima milla',
  description: null,
  videoUrl: null,
  youtubeId: null,
  thumbnailUrl: null,
  durationMinutes: 150,
  price: 149,
  discountPrice: null,
  status: 'active',
  createdAt: '2026-09-10T12:00:00.000Z',
};

const renderizar = () =>
  render(
    <MemoryRouter>
      <PaginaCarrito />
    </MemoryRouter>
  );

describe('PaginaCarrito', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(productosApi.obtenerProductoApi).mockResolvedValue(caja);
    vi.mocked(cursosApi.obtenerCursoApi).mockResolvedValue(curso);
  });

  it('sin nada guardado invita a ver el catalogo', async () => {
    renderizar();

    expect(await screen.findByText(/tu carrito está vacío/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver productos' })).toHaveAttribute('href', '/productos');
  });

  it('muestra lo guardado con el precio de ahora y el total', async () => {
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 2 }, 3);
    agregarAlCarrito({ tipo: 'curso', uuid: CURSO });
    renderizar();

    await screen.findByRole('heading', { name: caja.name });
    expect(screen.getByRole('heading', { name: curso.name })).toBeInTheDocument();
    // 2 cajas en oferta (19.90) + el curso (149)
    expect(screen.getByText(/39\.80/)).toBeInTheDocument();
    expect(screen.getByText(/188\.80/)).toBeInTheDocument();
    expect(productosApi.obtenerProductoApi).toHaveBeenCalledWith(CAJA, expect.anything());
  });

  it('sube y baja unidades, y recalcula el total', async () => {
    const usuario = userEvent.setup({ delay: null });
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 1 }, 3);
    renderizar();
    await screen.findByRole('heading', { name: caja.name });
    const resumen = within(screen.getByRole('complementary'));

    await usuario.click(screen.getByRole('button', { name: `Una unidad más de ${caja.name}` }));

    await waitFor(() => expect(leerCarrito()[0].cantidad).toBe(2));
    expect(resumen.getByText(/39\.80/)).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: `Una unidad menos de ${caja.name}` }));

    await waitFor(() => expect(leerCarrito()[0].cantidad).toBe(1));
    expect(resumen.getByText(/19\.90/)).toBeInTheDocument();
  });

  it('no deja pasar del stock disponible', async () => {
    const usuario = userEvent.setup({ delay: null });
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 3 }, 3);
    renderizar();
    await screen.findByRole('heading', { name: caja.name });

    expect(screen.getByRole('button', { name: `Una unidad más de ${caja.name}` })).toBeDisabled();
    expect(screen.getByText(/es todo el stock disponible/i)).toBeInTheDocument();
    void usuario;
  });

  it('quitar una linea la saca del carrito guardado', async () => {
    const usuario = userEvent.setup({ delay: null });
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 1 }, 3);
    agregarAlCarrito({ tipo: 'curso', uuid: CURSO });
    renderizar();
    const fila = (await screen.findByRole('heading', { name: caja.name })).closest('li') as HTMLElement;

    await usuario.click(within(fila).getByRole('button', { name: `Quitar ${caja.name} del carrito` }));

    await waitFor(() => expect(screen.queryByRole('heading', { name: caja.name })).not.toBeInTheDocument());
    expect(leerCarrito()).toEqual([{ tipo: 'curso', uuid: CURSO, cantidad: 1 }]);
  });

  it('vaciar deja el carrito sin nada', async () => {
    const usuario = userEvent.setup({ delay: null });
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 1 }, 3);
    renderizar();
    await screen.findByRole('heading', { name: caja.name });

    await usuario.click(screen.getByRole('button', { name: /vaciar carrito/i }));

    expect(await screen.findByText(/tu carrito está vacío/i)).toBeInTheDocument();
    expect(leerCarrito()).toEqual([]);
  });

  it('el pedido por WhatsApp lleva el detalle y el total', async () => {
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 2 }, 3);
    renderizar();
    await screen.findByRole('heading', { name: caja.name });

    const enlace = screen.getByRole('link', { name: /pedir por whatsapp/i }).getAttribute('href') as string;
    const texto = new URL(enlace).searchParams.get('text') as string;

    expect(enlace.startsWith('https://wa.me/')).toBe(true);
    expect(texto).toContain(`2 x ${caja.name}`);
    expect(texto).toMatch(/Total: S\/\s*39\.80/);
  });

  it('lo que ya no esta en el catalogo no se muestra', async () => {
    vi.mocked(productosApi.obtenerProductoApi).mockRejectedValue(new Error('Producto no encontrado'));
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 1 }, 3);
    agregarAlCarrito({ tipo: 'curso', uuid: CURSO });
    renderizar();

    await screen.findByRole('heading', { name: curso.name });
    expect(screen.queryByRole('heading', { name: caja.name })).not.toBeInTheDocument();
  });
});
