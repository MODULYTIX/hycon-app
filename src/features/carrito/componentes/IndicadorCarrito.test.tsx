import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccesoCuenta from '@/features/autenticacion/componentes/organismos/AccesoCuenta';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import { agregarAlCarrito, vaciarCarrito } from '@/features/carrito/servicios/carrito.almacen';

vi.mock('@/features/autenticacion/servicios/autenticacion.api');

const CAJA = '7b73989c-0719-4c06-bd1e-8c7ae193a432';

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <MemoryRouter>
        <AccesoCuenta />
      </MemoryRouter>
    </AutenticacionProveedor>
  );

describe('contador del carrito en el encabezado', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('sin nada en el carrito no muestra numero', () => {
    renderizar();

    expect(screen.getByRole('link', { name: 'Ver carrito' })).toHaveAttribute('href', '/carrito');
  });

  it('cuenta las unidades guardadas y se actualiza al agregar', async () => {
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 2 }, 10);
    renderizar();

    expect(await screen.findByRole('link', { name: /ver carrito, 2 artículos/i })).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Agregar desde otra parte de la web se refleja sin recargar
    await act(async () => {
      agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 1 }, 10);
    });

    expect(await screen.findByText('3')).toBeInTheDocument();
  });

  it('al vaciarlo desaparece el numero', async () => {
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 1 }, 10);
    renderizar();
    await screen.findByText('1');

    await act(async () => {
      vaciarCarrito();
    });

    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});
