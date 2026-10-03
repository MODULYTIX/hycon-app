import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useListadoPaginado } from './useListadoPaginado';
const resultado = (pagina: number, elementos = ['actual']) => ({ elementos, paginacion: { pagina, porPagina: 12, total: 30, totalPaginas: 3 } });
describe('Paginación con filtros', () => {
  it('reinicia a la primera página y cancela la petición previa', async () => {
    const cargar = vi.fn(async (p: number, _senal: AbortSignal) => resultado(p));
    const { result, rerender } = renderHook(({ clave }) => useListadoPaginado(cargar, 'Error', clave), { initialProps: { clave: '' } });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    act(() => result.current.irAPagina(3));
    await waitFor(() => expect(result.current.paginacion.pagina).toBe(3));
    const anterior = cargar.mock.calls.at(-1)![1];
    rerender({ clave: 'caja' });
    await waitFor(() => expect(cargar).toHaveBeenLastCalledWith(1, expect.any(AbortSignal)));
    expect(anterior.aborted).toBe(true);
    await waitFor(() => expect(result.current.paginacion.pagina).toBe(1));
  });
  it('una respuesta tardía del filtro anterior no sustituye al nuevo', async () => {
    let terminar!: (r: ReturnType<typeof resultado>) => void;
    const viejo = vi.fn(() => new Promise<ReturnType<typeof resultado>>((resolve) => { terminar = resolve; }));
    const nuevo = vi.fn(async () => resultado(1, ['nuevo']));
    const { result, rerender } = renderHook(({ clave }) => useListadoPaginado(clave ? nuevo : viejo, 'Error', clave), { initialProps: { clave: '' } });
    rerender({ clave: 'nuevo' });
    await waitFor(() => expect(result.current.elementos).toEqual(['nuevo']));
    await act(async () => terminar(resultado(1, ['viejo'])));
    expect(result.current.elementos).toEqual(['nuevo']);
  });
});
