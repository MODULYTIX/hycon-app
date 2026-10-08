import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaMisCompras from './PaginaMisCompras';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import * as api from '@/features/pedidos/servicios/pedidos.api';
import * as autenticacionApi from '@/features/autenticacion/servicios/autenticacion.api';
import { marcarSesionActiva } from '@/shared/utilidades/almacenamiento-sesion';
import type { Pedido } from '@/features/pedidos/tipos/pedido.tipos';
import type { Sesion } from '@/features/autenticacion/tipos/autenticacion.tipos';

vi.mock('@/features/pedidos/servicios/pedidos.api');
vi.mock('@/features/autenticacion/servicios/autenticacion.api');

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

const pagado: Pedido = {
  uuid: '0192f0aa-1111-7000-8000-000000000001',
  codigo: 'PED-0192F0',
  estadoPago: 'pagado',
  metodoPago: 'tarjeta',
  subtotal: 51.8,
  descuento: 12,
  total: 39.8,
  createdAt: '2026-10-07T12:00:00.000Z',
  items: [{ tipo: 'producto', nombre: 'Caja de carton 40x40', cantidad: 2, precio: 19.9, total: 39.8 }],
};

const pendiente: Pedido = {
  ...pagado,
  uuid: '0192f0aa-2222-7000-8000-000000000002',
  codigo: 'PED-0192F1',
  estadoPago: 'pendiente',
  metodoPago: 'whatsapp',
  descuento: 0,
  subtotal: 149,
  total: 149,
  items: [{ tipo: 'curso', nombre: 'Logistica de ultima milla', cantidad: 1, precio: 149, total: 149 }],
};

const pagina = (elementos: Pedido[], extra = {}) => ({
  elementos,
  paginacion: { pagina: 1, porPagina: 6, total: elementos.length, totalPaginas: 1, ...extra },
});

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <MemoryRouter>
        <PaginaMisCompras />
      </MemoryRouter>
    </AutenticacionProveedor>
  );

describe('PaginaMisCompras', () => {
  beforeEach(() => {
    window.localStorage.clear();
    marcarSesionActiva(true);
    vi.mocked(autenticacionApi.restaurarSesionApi).mockResolvedValue(sesion);
    vi.mocked(api.listarMisPedidosApi).mockResolvedValue(pagina([pagado, pendiente]));
  });

  it('pide solo las compras de quien tiene la sesion abierta', async () => {
    renderizar();
    await screen.findByText('PED-0192F0');

    expect(api.listarMisPedidosApi).toHaveBeenCalledWith(1, expect.anything());
  });

  it('muestra cada compra con su detalle, su metodo y su total', async () => {
    renderizar();
    const fila = (await screen.findByText('PED-0192F0')).closest('li') as HTMLElement;
    const compra = within(fila);

    expect(compra.getByText('07/10/2026')).toBeInTheDocument();
    expect(compra.getByText('Tarjeta')).toBeInTheDocument();
    expect(compra.getByText('Pagado')).toBeInTheDocument();
    expect(compra.getByText(/caja de carton 40x40/i)).toBeInTheDocument();
    expect(compra.getByText(/2 x/)).toBeInTheDocument();
    expect(compra.getByText(/ahorraste .*12\.00/i)).toBeInTheDocument();
    // El total aparece dos veces: en la linea del producto y en el total del pedido
    expect(compra.getAllByText(/39\.80/)).toHaveLength(2);
  });

  it('distingue lo que quedo pendiente de pago', async () => {
    renderizar();
    const fila = (await screen.findByText('PED-0192F1')).closest('li') as HTMLElement;

    expect(within(fila).getByText('Pendiente de pago')).toBeInTheDocument();
    expect(within(fila).getByText('WhatsApp')).toBeInTheDocument();
    // Sin oferta no se habla de ahorro
    expect(within(fila).queryByText(/ahorraste/i)).not.toBeInTheDocument();
  });

  it('sin compras invita al catalogo', async () => {
    vi.mocked(api.listarMisPedidosApi).mockResolvedValue(pagina([]));
    renderizar();

    expect(await screen.findByText(/todavía no tienes compras/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver el catálogo/i })).toHaveAttribute('href', '/productos');
  });

  it('sin sesion no se consulta nada y se pide entrar', async () => {
    window.localStorage.clear();
    renderizar();

    expect(await screen.findByText(/entra a tu cuenta para ver tus compras/i)).toBeInTheDocument();
    expect(api.listarMisPedidosApi).not.toHaveBeenCalled();
  });

  it('avisa si la consulta falla', async () => {
    vi.mocked(api.listarMisPedidosApi).mockRejectedValue(new Error('Servidor no disponible'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(/servidor no disponible/i);
  });

  it('pagina cuando hay mas de seis compras', async () => {
    const usuario = userEvent.setup({ delay: null });
    vi.mocked(api.listarMisPedidosApi).mockImplementation(async (pedidaPagina) =>
      pedidaPagina === 1
        ? pagina([pagado], { total: 8, totalPaginas: 2 })
        : pagina([pendiente], { pagina: 2, total: 8, totalPaginas: 2 })
    );
    renderizar();
    await screen.findByText('PED-0192F0');

    await usuario.click(screen.getByRole('button', { name: 'Pagina 2' }));

    expect(await screen.findByText('PED-0192F1')).toBeInTheDocument();
    expect(api.listarMisPedidosApi).toHaveBeenLastCalledWith(2, expect.anything());
  });
});
