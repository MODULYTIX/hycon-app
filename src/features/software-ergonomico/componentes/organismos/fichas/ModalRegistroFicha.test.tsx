import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalRegistroFicha from './ModalRegistroFicha';
import { normalizarFicha } from '../../../utilidades/ficha';
import * as api from '../../../servicios/ergo.api';

vi.mock('../../../servicios/ergo.api');
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  HTMLElement.prototype.scrollTo = vi.fn();
});
const empresa = { id: '7', nombre: 'Empresa de prueba', fecha: '2026-10-17T12:00:00.000Z', totalFichas: 1 };
const base = { id: '9', empresaId: '7', nombre: 'Ficha almacén', fecha: empresa.fecha, actualizada: empresa.fecha, payload: normalizarFicha(null) };
describe('editor de fichas', () => {
  beforeEach(() => vi.clearAllMocks());
  it('indica identificar factores desde 120 minutos inclusive cuando la tarea es cotidiana', async () => {
    const user = userEvent.setup();
    render(<ModalRegistroFicha empresa={empresa} onCerrar={vi.fn()} onGuardado={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Representatividad' }));
    const duracion = screen.getByRole('spinbutton', { name: 'Duración diaria de la tarea (min)' });
    await user.type(duracion, '119');
    await user.click(screen.getByRole('radio', { name: 'Sí' }));
    expect(screen.getByText('No cumple el criterio general de representatividad')).toBeInTheDocument();
    await user.clear(duracion);
    await user.type(duracion, '120');
    expect(screen.getByText('Corresponde identificar factores')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'No' }));
    expect(screen.getByText('No cumple el criterio general de representatividad')).toBeInTheDocument();
  });
  it('protege cambios desde el primer campo y permite seguir editando', async () => {
    const user = userEvent.setup(); const cerrar = vi.fn();
    render(<ModalRegistroFicha empresa={empresa} onCerrar={cerrar} onGuardado={vi.fn()} />);
    await user.type(screen.getByPlaceholderText('Ej. Operaciones'), 'Logística');
    await user.click(screen.getByRole('button', { name: 'Cerrar ficha' }));
    expect(screen.getByRole('dialog', { name: 'Cambios sin guardar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Seguir editando' }));
    expect(screen.getByPlaceholderText('Ej. Operaciones')).toHaveValue('Logística');
    expect(cerrar).not.toHaveBeenCalled();
  });
  it('activa OCRA a 31 minutos y permite guardar los resultados vacíos', async () => {
    const user = userEvent.setup(); const guardado = vi.fn();
    vi.mocked(api.crearFichaErgo).mockResolvedValue(base);
    render(<ModalRegistroFicha empresa={empresa} onCerrar={vi.fn()} onGuardado={guardado} />);
    await user.click(screen.getByRole('button', { name: 'Movimientos repetitivos' }));
    const pregunta = screen.getByRole('group', { name: 'Vibración de brazo-mano de moderada a alta' });
    await user.click(within(pregunta).getByRole('radio', { name: 'Sí' }));
    const minutos = screen.getByRole('spinbutton', { name: 'Minutos: Vibración de brazo-mano de moderada a alta' });
    await user.type(minutos, '30');
    expect(screen.getByLabelText('DX')).toBeDisabled();
    await user.clear(minutos); await user.type(minutos, '31');
    expect(screen.getByLabelText('DX')).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Ver resumen' }));
    expect(screen.getByText(/31 min\/día · criterio > 30 min/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Guardar ficha' }));
    await waitFor(() => expect(api.crearFichaErgo).toHaveBeenCalledWith('7', expect.any(String), expect.objectContaining({
      paso5: expect.objectContaining({ esfuerzoManos: expect.objectContaining({ vibracionBrazoMano: { aplica: true, duracionDiaria: '31' } }) }),
      evaluacion: expect.objectContaining({ movimientosRepetitivos: { dx: '', ix: '' } }),
    })));
    expect(guardado).toHaveBeenCalledWith(base);
  });
  it('edita directamente una ficha y conserva el resto al fallar y reintentar', async () => {
    const user = userEvent.setup();
    const payload = normalizarFicha(null);
    payload.paso1.area = 'Almacén';
    payload.paso5.esfuerzoManos.impactoRepetido = { aplica: true, duracionDiaria: '121' };
    vi.mocked(api.actualizarFichaErgo).mockRejectedValueOnce(new Error('No se pudo guardar.')).mockResolvedValue(base);
    render(<ModalRegistroFicha empresa={empresa} ficha={{ ...base, payload }} inicial="resumen" onCerrar={vi.fn()} onGuardado={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Revisar Impacto repetido' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Editar datos' }));
    await user.clear(screen.getByPlaceholderText('Ej. Operaciones'));
    await user.type(screen.getByPlaceholderText('Ej. Operaciones'), 'Producción');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar.');
    expect(screen.getByPlaceholderText('Ej. Operaciones')).toHaveValue('Producción');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(api.actualizarFichaErgo).toHaveBeenCalledTimes(2));
    const guardada = vi.mocked(api.actualizarFichaErgo).mock.calls[1];
    expect(guardada[0]).toBe('7'); expect(guardada[1]).toBe('9');
    expect(guardada[3].paso1.area).toBe('Producción');
    expect(guardada[3].paso5.esfuerzoManos.impactoRepetido.duracionDiaria).toBe('121');
    expect(guardada[4]).toBe(base.actualizada);
  });
  it('no duplica solicitudes mientras se guarda', async () => {
    let resolver!: (f: api.FichaErgo) => void;
    vi.mocked(api.crearFichaErgo).mockReturnValue(new Promise(resolve => { resolver = resolve; }));
    render(<ModalRegistroFicha empresa={empresa} onCerrar={vi.fn()} onGuardado={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar ficha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardando…' }));
    expect(api.crearFichaErgo).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Cerrar ficha' })).toBeDisabled();
    resolver(base);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar ficha' })).toBeEnabled());
  });
});
