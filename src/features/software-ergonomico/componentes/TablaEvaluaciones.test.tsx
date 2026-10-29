import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TablaEvaluaciones, { type FilaEvaluacion } from './TablaEvaluaciones';
import { normalizarFicha } from '../utilidades/ficha';

const empresa = { id: '1', nombre: 'Hycon', fecha: '2026-10-28', totalFichas: 2 };
function fila(id: string, puesto: string, area: string, gerencia: string): FilaEvaluacion {
  const datos = normalizarFicha(null);
  Object.assign(datos.paso1, { puesto, area, gerencia, superintendencia: 'Operaciones' });
  return { empresa, ficha: { id, empresaId: '1', nombre: `Ficha ${id}`, fecha: '2026-10-28', actualizada: '2026-10-28', payload: datos } };
}
const primera = fila('1', 'Técnico de almacén', 'Logística', 'Operaciones');
const segunda = fila('2', 'Soldador', 'Mantenimiento', 'Servicios');

describe('tabla comparativa de ergonomía', () => {
  it('combina búsqueda sin acentos y filtro de área, y permite limpiar', async () => {
    const u = userEvent.setup();
    render(<TablaEvaluaciones filas={[primera, segunda]} todasEmpresas onAbrir={vi.fn()} />);
    await u.type(screen.getByRole('searchbox', { name: 'Buscar' }), 'tecnico');
    expect(screen.getByRole('status')).toHaveTextContent('1 de 2');
    expect(screen.queryByRole('button', { name: 'Soldador' })).not.toBeInTheDocument();
    await u.click(screen.getByRole('combobox', { name: 'Área' }));
    await u.click(screen.getByRole('option', { name: 'Mantenimiento' }));
    expect(screen.getByText('No hay coincidencias')).toBeInTheDocument();
    await u.click(screen.getAllByRole('button', { name: 'Limpiar filtros' })[0]);
    expect(screen.getByRole('status')).toHaveTextContent('2 de 2');
    await u.type(screen.getByRole('searchbox'), 'servicios');
    expect(screen.getByRole('button', { name: 'Soldador' })).toBeInTheDocument();
  });
  it('muestra valores independientes, clasificación y colores sin confundir cero con pendiente', () => {
    const f = fila('3', 'Operador', 'Mina', 'Producción');
    const d = normalizarFicha(f.ficha.payload);
    d.evaluacion.posturaForzada = { d: '0', i: '9' };
    d.evaluacion.levantamientoCargas.niosh = '2.9';
    d.evaluacion.movimientosRepetitivos = { dx: '7.5', ix: '' };
    f.ficha.payload = d;
    render(<TablaEvaluaciones filas={[f]} onAbrir={vi.fn()} />);
    expect(screen.getByText('0 - Inapreciable')).toBeInTheDocument();
    expect(screen.getByText('3 - Alto').closest('.er-valor-tabla')).toHaveClass('bg-red-500');
    expect(screen.getByText('Riesgo presente: moderado').closest('.er-valor-tabla')).toHaveClass('bg-yellow-400');
    expect(screen.getByText('Riesgo aceptable').closest('.er-valor-tabla')).toHaveClass('bg-green-600');
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Superintendencia' })).not.toBeInTheDocument();
  });
  it('permite mostrar superintendencia y abrir resumen o edición de la fila correcta', async () => {
    const u = userEvent.setup(); const abrir = vi.fn();
    render(<TablaEvaluaciones filas={[primera, segunda]} onAbrir={abrir} />);
    await u.click(screen.getByRole('checkbox', { name: 'Mostrar superintendencia' }));
    expect(screen.getByRole('columnheader', { name: 'Superintendencia' })).toBeInTheDocument();
    await u.click(screen.getByRole('button', { name: 'Ver resumen de Ficha 2' }));
    expect(abrir).toHaveBeenLastCalledWith(segunda.ficha, false);
    await u.click(screen.getByRole('button', { name: 'Editar Ficha 1' }));
    expect(abrir).toHaveBeenLastCalledWith(primera.ficha, true);
  });
  it('filtra evaluaciones activadas aun con resultados pendientes y conserva valores previos', async () => {
    const u = userEvent.setup(); const f = fila('3', 'Operador', 'Mina', 'Producción');
    const d = normalizarFicha(f.ficha.payload);
    d.paso4.levantamiento40kg = { aplica: true, duracionDiaria: '' };
    f.ficha.payload = d;
    render(<TablaEvaluaciones filas={[primera, f]} onAbrir={vi.fn()} />);
    await u.click(screen.getByRole('combobox', { name: 'Evaluación' }));
    await u.click(screen.getByRole('option', { name: 'Levantamiento de cargas' }));
    const tabla = screen.getByRole('table');
    expect(within(tabla).getAllByRole('row')).toHaveLength(2);
    expect(within(tabla).getByText('Pendiente')).toBeInTheDocument();
  });
});
