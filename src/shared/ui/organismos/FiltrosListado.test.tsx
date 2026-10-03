import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FiltrosListado from './FiltrosListado';
describe('Filtros del listado', () => {
  it('envía la búsqueda y el precio seleccionado con los deslizadores', async () => {
    const aplicar = vi.fn(); const u = userEvent.setup();
    render(<FiltrosListado modulo="productos" admin onAplicar={aplicar} />);
    await u.type(screen.getByLabelText('Buscar'), '  Caja  ');
    fireEvent.change(screen.getByRole('slider', { name: 'Precio mínimo' }), { target: { value: '20' } });
    fireEvent.change(screen.getByRole('slider', { name: 'Precio máximo' }), { target: { value: '100' } });
    await u.selectOptions(screen.getByLabelText('Estado'), 'inactive');
    await u.selectOptions(screen.getByLabelText('Disponibilidad'), 'agotado');
    await u.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
    expect(aplicar).toHaveBeenCalledWith({ buscar: 'Caja', precioMin: 20, precioMax: 100, estado: 'inactive', stock: 'agotado' });
  });
  it('los controles impiden que el mínimo supere el máximo', async () => {
    const aplicar = vi.fn(); const u = userEvent.setup();
    render(<FiltrosListado modulo="cursos" onAplicar={aplicar} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Precio máximo' }), { target: { value: '100' } });
    fireEvent.change(screen.getByRole('slider', { name: 'Precio mínimo' }), { target: { value: '200' } });
    expect(screen.getByRole('slider', { name: 'Precio mínimo' })).toHaveValue('100');
    await u.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
    expect(aplicar).toHaveBeenCalledWith({ precioMin: 100, precioMax: 100 });
  });
  it('el rango inicial no impone límites de precio', async () => {
    const aplicar = vi.fn(); const u = userEvent.setup();
    render(<FiltrosListado modulo="productos" onAplicar={aplicar} />);
    await u.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
    expect(aplicar).toHaveBeenCalledWith({});
    expect(screen.queryByRole('spinbutton', { name: /precio/i })).not.toBeInTheDocument();
  });
  it('limpiar restablece los controles y consulta sin filtros', async () => {
    const aplicar = vi.fn(); const u = userEvent.setup();
    render(<FiltrosListado modulo="cursos" onAplicar={aplicar} />);
    await u.type(screen.getByLabelText('Buscar'), 'inventario');
    fireEvent.change(screen.getByRole('slider', { name: 'Precio máximo' }), { target: { value: '300' } });
    await u.type(screen.getByLabelText('Duración máxima (minutos)'), '90');
    await u.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
    expect(aplicar).toHaveBeenLastCalledWith({ buscar: 'inventario', duracionMax: 90, precioMax: 300 });
    await u.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(aplicar).toHaveBeenLastCalledWith({});
    expect(screen.getByLabelText('Buscar')).toHaveValue('');
    expect(screen.getByRole('slider', { name: 'Precio máximo' })).toHaveValue('1000');
    expect(screen.getByRole('slider', { name: 'Precio mínimo' })).toHaveValue('0');
    expect(screen.getByLabelText('Duración máxima (minutos)')).toHaveValue(null);
  });
  it('no permite escoger estado en el catálogo público', () => {
    render(<FiltrosListado modulo="productos" onAplicar={vi.fn()} />);
    expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument();
  });
});
