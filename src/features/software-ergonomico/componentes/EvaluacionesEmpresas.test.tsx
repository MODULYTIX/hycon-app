import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EvaluacionesEmpresas from './EvaluacionesEmpresas';
import * as api from '../servicios/ergo.api';
import { normalizarFicha } from '../utilidades/ficha';
vi.mock('../servicios/ergo.api');
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  HTMLElement.prototype.scrollTo = vi.fn();
});
const empresas = [{ id: '1', nombre: 'Hycon', fecha: '2026-10-28', totalFichas: 1 }, { id: '2', nombre: 'Otra empresa', fecha: '2026-10-28', totalFichas: 1 }];
const payload = normalizarFicha(null); payload.paso1.puesto = 'Operador'; payload.paso1.area = 'Mina';
const ficha = { id: '1', empresaId: '1', nombre: 'Ficha Hycon', fecha: '2026-10-28', actualizada: '2026-10-28', payload };
describe('evaluaciones de todas las empresas', () => {
  beforeEach(() => vi.resetAllMocks());
  it('reúne empresas, abre la última versión y actualiza sin perder la búsqueda', async () => {
    const u = userEvent.setup();
    vi.mocked(api.obtenerFichasErgo).mockImplementation(async id => [{ ...ficha, empresaId: id, nombre: id === '1' ? 'Ficha Hycon' : 'Ficha otra' }]);
    vi.mocked(api.obtenerFichaErgo).mockResolvedValue(ficha);
    vi.mocked(api.actualizarFichaErgo).mockResolvedValue({ ...ficha, nombre: 'Ficha actualizada' });
    render(<EvaluacionesEmpresas empresas={empresas} />);
    await screen.findByRole('table');
    expect(api.obtenerFichasErgo).toHaveBeenCalledTimes(2);
    await u.type(screen.getByRole('searchbox'), 'Hycon');
    expect(screen.getByRole('status')).toHaveTextContent('1 de 2');
    await u.click(screen.getByRole('button', { name: 'Editar Ficha Hycon' }));
    await screen.findByRole('dialog', { name: 'Editar ficha ergonómica' });
    expect(api.obtenerFichaErgo).toHaveBeenCalledWith('1', '1', expect.any(AbortSignal));
    await u.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('searchbox')).toHaveValue('Hycon');
    expect(screen.getByText('Ficha actualizada')).toBeInTheDocument();
  });
  it('muestra un error en lugar de una tabla parcial y permite reintentar', async () => {
    const u = userEvent.setup();
    vi.mocked(api.obtenerFichasErgo).mockRejectedValueOnce(new Error('No se pudo consultar la empresa')).mockResolvedValue([]);
    render(<EvaluacionesEmpresas empresas={empresas} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo consultar la empresa');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await u.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Aún no hay fichas registradas')).toBeInTheDocument();
  });
});
