import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaCarrito from './PaginaCarrito';
import { agregarAlCarrito, leerCarrito } from '@/features/carrito/servicios/carrito.almacen';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import * as productosApi from '@/features/productos/servicios/productos.api';
import * as cursosApi from '@/features/cursos/servicios/cursos.api';
import * as autenticacionApi from '@/features/autenticacion/servicios/autenticacion.api';
import * as pedidosApi from '@/features/pedidos/servicios/pedidos.api';
import { marcarSesionActiva } from '@/shared/utilidades/almacenamiento-sesion';
import type { Sesion } from '@/features/autenticacion/tipos/autenticacion.tipos';
import type { Pedido } from '@/features/pedidos/tipos/pedido.tipos';
import type { ProductoDetalle } from '@/features/productos/tipos/producto.tipos';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

vi.mock('@/features/productos/servicios/productos.api');
vi.mock('@/features/cursos/servicios/cursos.api');
vi.mock('@/features/autenticacion/servicios/autenticacion.api');
vi.mock('@/features/pedidos/servicios/pedidos.api');

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
  previewSegundos: 60,
  price: 149,
  discountPrice: null,
  status: 'active',
  createdAt: '2026-09-10T12:00:00.000Z',
};

const sesion: Sesion = {
  token: 'token-de-prueba',
  expiraEn: 900,
  usuario: {
    userId: 7,
    name: 'Ana',
    lastname: 'Quispe',
    email: 'ana@hycon.com',
    phone: null,
    avatarUrl: null,
    roleId: 2,
    rol: 'CLIENTE',
  },
};

const pedidoGuardado: Pedido = {
  uuid: '0192f0aa-1111-7000-8000-000000000001',
  codigo: 'PED-0192F0',
  estadoPago: 'pagado',
  metodoPago: 'tarjeta',
  subtotal: 51.8,
  descuento: 12,
  total: 39.8,
  createdAt: '2026-10-07T12:00:00.000Z',
  items: [],
};

// Con sesion abierta: el proveedor la recupera al montar si el navegador la tiene marcada
const conSesion = () => {
  marcarSesionActiva(true);
  vi.mocked(autenticacionApi.restaurarSesionApi).mockResolvedValue(sesion);
};

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <MemoryRouter>
        <PaginaCarrito />
      </MemoryRouter>
    </AutenticacionProveedor>
  );

describe('PaginaCarrito', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(productosApi.obtenerProductoApi).mockResolvedValue(caja);
    vi.mocked(cursosApi.obtenerCursoApi).mockResolvedValue(curso);
    vi.mocked(pedidosApi.crearPedidoApi).mockResolvedValue(pedidoGuardado);
    // Sin marca de sesion el proveedor ni lo intenta: el visitante entra sin cuenta
    vi.mocked(autenticacionApi.restaurarSesionApi).mockRejectedValue(new Error('sin sesion'));
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

  it('muestra el subtotal y lo que se ahorra con las ofertas', async () => {
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 2 }, 3);
    renderizar();
    await screen.findByRole('heading', { name: caja.name });
    const resumen = within(screen.getByRole('complementary'));

    // 2 cajas: 51.80 de lista, 12.00 de descuento, 39.80 a pagar
    expect(resumen.getByText(/51\.80/)).toBeInTheDocument();
    expect(resumen.getByText(/-\s*S\/\s*12\.00/)).toBeInTheDocument();
    expect(resumen.getByText(/39\.80/)).toBeInTheDocument();
  });

  it('sin ofertas no aparece la linea de descuentos', async () => {
    agregarAlCarrito({ tipo: 'curso', uuid: CURSO });
    renderizar();
    await screen.findByRole('heading', { name: curso.name });

    expect(within(screen.getByRole('complementary')).queryByText(/descuentos/i)).not.toBeInTheDocument();
  });

  it('sin sesion, pagar pide entrar a la cuenta antes de cobrar', async () => {
    const usuario = userEvent.setup({ delay: null });
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 1 }, 3);
    renderizar();
    await screen.findByRole('heading', { name: caja.name });

    await usuario.click(screen.getByRole('button', { name: /ir a pagar/i }));

    expect(await screen.findByRole('dialog', { name: /bienvenido de vuelta/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pagar s\//i })).not.toBeInTheDocument();
    expect(pedidosApi.crearPedidoApi).not.toHaveBeenCalled();
  });

  it('al entrar a la cuenta desde el carrito, la compra sigue donde se quedo', async () => {
    const usuario = userEvent.setup({ delay: null });
    vi.mocked(autenticacionApi.iniciarSesionApi).mockResolvedValue(sesion);
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 1 }, 3);
    renderizar();
    await screen.findByRole('heading', { name: caja.name });

    await usuario.click(screen.getByRole('button', { name: /ir a pagar/i }));
    const acceso = await screen.findByRole('dialog', { name: /bienvenido de vuelta/i });
    await usuario.type(within(acceso).getByLabelText(/correo electr[oó]nico/i), 'ana@hycon.com');
    await usuario.type(within(acceso).getByLabelText(/^contrase[nñ]a$/i), 'Cliente2026');
    await usuario.click(within(acceso).getByRole('button', { name: /^iniciar sesi[oó]n$/i }));

    // Sin volver a pulsar nada, se abre la pasarela
    expect(await screen.findByRole('heading', { name: 'Pago seguro' })).toBeInTheDocument();
  });

  it('con sesion abierta pagar lleva directo a la pasarela con el total', async () => {
    const usuario = userEvent.setup({ delay: null });
    conSesion();
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 2 }, 3);
    renderizar();
    await screen.findByRole('heading', { name: caja.name });

    await usuario.click(screen.getByRole('button', { name: /ir a pagar/i }));

    expect(await screen.findByRole('heading', { name: 'Pago seguro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pagar .*39\.80/i })).toBeInTheDocument();
  });

  it('al completar el pago el carrito se vacia', async () => {
    const usuario = userEvent.setup({ delay: null });
    conSesion();
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 2 }, 3);
    renderizar();
    await screen.findByRole('heading', { name: caja.name });

    await usuario.click(screen.getByRole('button', { name: /ir a pagar/i }));
    await screen.findByRole('heading', { name: 'Pago seguro' });
    await usuario.type(screen.getByLabelText(/número de tarjeta/i), '4111111111111111');
    await usuario.type(screen.getByLabelText(/titular/i), 'Ana Quispe');
    await usuario.type(screen.getByLabelText(/vencimiento/i), '1230');
    await usuario.type(screen.getByLabelText(/cvv/i), '123');
    await usuario.click(screen.getByRole('button', { name: /pagar s\//i }));

    expect(
      await screen.findByRole('heading', { name: 'Pago aprobado' }, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(pedidosApi.crearPedidoApi).toHaveBeenCalledWith('tarjeta', [
      { tipo: 'producto', uuid: CAJA, cantidad: 2 },
    ]);
    // La compra queda en la cuenta, no en el navegador
    await waitFor(() => expect(leerCarrito()).toEqual([]));
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
