import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ModalPago from './ModalPago';
import * as api from '@/features/pedidos/servicios/pedidos.api';
import type { ItemPedido, Pedido } from '@/features/pedidos/tipos/pedido.tipos';

vi.mock('@/features/pedidos/servicios/pedidos.api');

const UUID = '7b73989c-0719-4c06-bd1e-8c7ae193a432';
const items: ItemPedido[] = [{ tipo: 'producto', uuid: UUID, cantidad: 2 }];

const pedidoGuardado: Pedido = {
  uuid: '0192f0aa-1111-7000-8000-000000000001',
  codigo: 'PED-0192F0',
  estadoPago: 'pagado',
  metodoPago: 'tarjeta',
  subtotal: 51.8,
  descuento: 12,
  total: 39.8,
  createdAt: '2026-10-07T12:00:00.000Z',
  items: [{ tipo: 'producto', nombre: 'Caja de carton', cantidad: 2, precio: 19.9, total: 39.8 }],
};

const alPagar = vi.fn();

const renderizar = () =>
  render(
    <MemoryRouter>
      <ModalPago abierto onCerrar={vi.fn()} total={39.8} items={items} onPagado={alPagar} />
    </MemoryRouter>
  );

const rellenarTarjeta = async (
  usuario: ReturnType<typeof userEvent.setup>,
  numero = '4111111111111111'
) => {
  await usuario.type(screen.getByLabelText(/número de tarjeta/i), numero);
  await usuario.type(screen.getByLabelText(/titular/i), 'Esau Morales');
  await usuario.type(screen.getByLabelText(/vencimiento/i), '1230');
  await usuario.type(screen.getByLabelText(/cvv/i), '123');
};

describe('ModalPago', () => {
  beforeEach(() => {
    vi.mocked(api.crearPedidoApi).mockResolvedValue(pedidoGuardado);
  });

  it('abre en tarjeta y muestra el total a cobrar', () => {
    renderizar();

    expect(screen.getByRole('button', { name: /pagar .*39\.80/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/número de tarjeta/i)).toBeInTheDocument();
  });

  it('da formato al numero y reconoce la marca mientras se escribe', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();

    await usuario.type(screen.getByLabelText(/número de tarjeta/i), '4111111111111111');

    expect(screen.getByLabelText(/número de tarjeta/i)).toHaveValue('4111 1111 1111 1111');
    expect(screen.getByLabelText('visa')).toBeInTheDocument();
  });

  it('no cobra si la tarjeta no pasa la validacion', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();

    await rellenarTarjeta(usuario, '4111111111111112');
    await usuario.click(screen.getByRole('button', { name: /pagar/i }));

    expect(await screen.findByText(/revisa el número de la tarjeta/i)).toBeInTheDocument();
    expect(api.crearPedidoApi).not.toHaveBeenCalled();
  });

  it('con la tarjeta correcta guarda la compra y confirma el pago', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();

    await rellenarTarjeta(usuario);
    await usuario.click(screen.getByRole('button', { name: /pagar/i }));

    // Mientras autoriza, el boton queda bloqueado
    expect(await screen.findByRole('button', { name: /autorizando el pago/i })).toBeDisabled();

    expect(await screen.findByRole('heading', { name: 'Pago aprobado' }, { timeout: 4000 })).toBeInTheDocument();
    expect(api.crearPedidoApi).toHaveBeenCalledWith('tarjeta', items);
    expect(alPagar).toHaveBeenCalledWith(pedidoGuardado);
    expect(screen.getByText('PED-0192F0')).toBeInTheDocument();
    // Del numero solo se recuerdan los ultimos cuatro digitos
    expect(screen.getByText('···· 1111')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver mis compras/i })).toHaveAttribute(
      'href',
      '/historial-de-compras'
    );
  });

  it('Yape pide el codigo de aprobacion de seis digitos', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();

    await usuario.click(screen.getByRole('button', { name: /yape/i }));
    expect(screen.getByRole('img', { name: /código para escanear/i })).toBeInTheDocument();

    await usuario.type(screen.getByLabelText(/código de aprobación/i), '123');
    await usuario.click(screen.getByRole('button', { name: /pagar/i }));

    expect(await screen.findByText(/son 6 dígitos/i)).toBeInTheDocument();
    expect(api.crearPedidoApi).not.toHaveBeenCalled();

    await usuario.type(screen.getByLabelText(/código de aprobación/i), '456');
    await usuario.click(screen.getByRole('button', { name: /pagar/i }));

    await waitFor(() => expect(api.crearPedidoApi).toHaveBeenCalledWith('yape', items));
  });

  it('por WhatsApp el pedido queda pendiente y ofrece escribirnos', async () => {
    const usuario = userEvent.setup({ delay: null });
    vi.mocked(api.crearPedidoApi).mockResolvedValue({
      ...pedidoGuardado,
      estadoPago: 'pendiente',
      metodoPago: 'whatsapp',
    });
    renderizar();

    await usuario.click(screen.getByRole('button', { name: /whatsapp/i }));
    await usuario.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    expect(
      await screen.findByRole('heading', { name: 'Pedido registrado' }, { timeout: 4000 })
    ).toBeInTheDocument();
    const enlace = screen.getByRole('link', { name: /escribir por whatsapp/i }).getAttribute('href') as string;
    expect(new URL(enlace).searchParams.get('text')).toContain('PED-0192F0');
  });

  it('muestra el motivo si el backend rechaza la compra', async () => {
    const usuario = userEvent.setup({ delay: null });
    vi.mocked(api.crearPedidoApi).mockRejectedValue(new Error('Solo quedan 1 unidades de "Caja"'));
    renderizar();

    await rellenarTarjeta(usuario);
    await usuario.click(screen.getByRole('button', { name: /pagar/i }));

    const aviso = await screen.findByRole('alert', {}, { timeout: 4000 });
    expect(aviso).toHaveTextContent(/solo quedan 1/i);
    expect(alPagar).not.toHaveBeenCalled();
    // Se puede corregir y reintentar
    expect(screen.getByRole('button', { name: /pagar/i })).toBeEnabled();
  });

  it('el detalle de la tarjeta no viaja al backend', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();

    await rellenarTarjeta(usuario);
    await usuario.click(screen.getByRole('button', { name: /pagar/i }));

    await waitFor(() => expect(api.crearPedidoApi).toHaveBeenCalled());
    const enviado = JSON.stringify(vi.mocked(api.crearPedidoApi).mock.calls[0]);
    expect(enviado).not.toContain('4111');
    expect(enviado).not.toContain('123');
  });

  it('cerrado no pinta nada', () => {
    render(
      <MemoryRouter>
        <ModalPago abierto={false} onCerrar={vi.fn()} total={10} items={items} onPagado={alPagar} />
      </MemoryRouter>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('ModalPago: resumen', () => {
  it('cada metodo tiene su propia pantalla', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();
    const dialogo = within(screen.getByRole('dialog'));

    await usuario.click(dialogo.getByRole('button', { name: /yape/i }));
    expect(dialogo.queryByLabelText(/número de tarjeta/i)).not.toBeInTheDocument();

    await usuario.click(dialogo.getByRole('button', { name: /tarjeta/i }));
    expect(dialogo.getByLabelText(/número de tarjeta/i)).toBeInTheDocument();
    expect(dialogo.queryByLabelText(/código de aprobación/i)).not.toBeInTheDocument();
  });
});
