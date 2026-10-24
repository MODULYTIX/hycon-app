import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Selector from './Selector';

const opciones = [{ valor: '', etiqueta: 'Sin especificar' }, { valor: 'mineria', etiqueta: 'Minería' }, { valor: 'industria', etiqueta: 'Industria', deshabilitada: true }, { valor: 'agricultura', etiqueta: 'Agricultura' }];
describe('Selector Hycon', () => {
  it('selecciona dentro de una etiqueta, envía FormData y restablece el valor sin enviar el formulario', async () => {
    const u = userEvent.setup(); const enviar = vi.fn();
    render(<form aria-label="Ficha" onSubmit={e => { e.preventDefault(); enviar(new FormData(e.currentTarget).get('sector')); }}>
      <label htmlFor="sector">Sector<Selector id="sector" aria-label="Sector" name="sector" opciones={opciones} placeholder="Selecciona un sector" /></label>
      <button>Guardar</button><button type="reset">Restablecer</button>
    </form>);
    const campo = screen.getByRole('combobox', { name: 'Sector' });
    await u.click(campo);
    await u.click(screen.getByRole('option', { name: 'Minería' }));
    expect(campo).toHaveTextContent('Minería');
    expect(campo).toHaveAttribute('aria-expanded', 'false');
    expect(enviar).not.toHaveBeenCalled();
    await u.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(enviar).toHaveBeenLastCalledWith('mineria');
    await u.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(campo).toHaveTextContent('Selecciona un sector');
    await u.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(enviar).toHaveBeenLastCalledWith('');
  });
  it('navega con teclado, omite opciones deshabilitadas y busca sin distinguir acentos', async () => {
    const u = userEvent.setup(); const cambio = vi.fn();
    render(<Selector aria-label="Sector" opciones={opciones} onChange={cambio} />);
    const campo = screen.getByRole('combobox'); campo.focus();
    await u.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');
    expect(cambio).toHaveBeenLastCalledWith('agricultura');
    await u.keyboard('mine{Enter}');
    expect(campo).toHaveTextContent('Minería');
    await u.keyboard('{End}{Enter}');
    expect(campo).toHaveTextContent('Agricultura');
    await u.keyboard('{Home}{Enter}');
    expect(campo).toHaveTextContent('Sin especificar');
  });
  it('Escape cierra la lista sin propagarse al modal y el clic exterior también cierra', async () => {
    const u = userEvent.setup(); const escapar = vi.fn();
    render(<div onKeyDown={e => { if (e.key === 'Escape') escapar(); }}><Selector aria-label="Sector" opciones={opciones} /><button>Fuera</button></div>);
    const campo = screen.getByRole('combobox');
    await u.click(campo); await u.keyboard('{Escape}');
    expect(campo).toHaveAttribute('aria-expanded', 'false');
    expect(escapar).not.toHaveBeenCalled();
    await u.keyboard('{Escape}'); expect(escapar).toHaveBeenCalledOnce();
    await u.click(campo); await u.click(screen.getByRole('button', { name: 'Fuera' }));
    expect(campo).toHaveAttribute('aria-expanded', 'false');
  });
  it('respeta valores controlados y el bloqueo de un fieldset', async () => {
    const u = userEvent.setup(); const cambio = vi.fn();
    const { rerender } = render(<fieldset><Selector aria-label="Sector" opciones={opciones} value="mineria" onChange={cambio} /></fieldset>);
    await u.click(screen.getByRole('combobox'));
    await u.click(screen.getByRole('option', { name: 'Agricultura' }));
    expect(cambio).toHaveBeenCalledWith('agricultura');
    expect(screen.getByRole('combobox')).toHaveTextContent('Minería');
    rerender(<fieldset disabled><Selector aria-label="Sector" opciones={opciones} value="agricultura" onChange={cambio} /></fieldset>);
    expect(screen.getByRole('combobox')).toBeDisabled();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });
});
