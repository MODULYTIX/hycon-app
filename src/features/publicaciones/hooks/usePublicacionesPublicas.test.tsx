import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePublicacionesPublicas } from './usePublicacionesPublicas';
import { listarPublicacionesApi } from '../servicios/publicaciones.api';
import type { Publicacion } from '../tipos/publicacion.tipos';
vi.mock('../servicios/publicaciones.api');
const r = (nombre: string, pagina = 1) => ({ elementos: [{ title: nombre, uuid: nombre } as Publicacion], paginacion: { pagina, porPagina: 9, total: 19, totalPaginas: 3 } });
beforeEach(() => { vi.mocked(listarPublicacionesApi).mockReset(); });
describe('Publicaciones filtradas', () => {
  it('al cambiar búsqueda reinicia el listado y no conserva páginas anteriores', async () => {
    vi.mocked(listarPublicacionesApi).mockImplementation(async (_estado, o) => r(o?.filtros?.buscar ?? `página ${o?.pagina}`, o?.pagina));
    const { result, rerender } = renderHook(({ buscar }) => usePublicacionesPublicas({ porPagina: 9, filtros: buscar ? { buscar } : {} }), { initialProps: { buscar: '' } });
    await waitFor(() => expect(result.current.cargando).toBe(false));
    act(() => result.current.verMas());
    await waitFor(() => expect(result.current.publicaciones).toHaveLength(2));
    rerender({ buscar: 'almacén' });
    await waitFor(() => expect(result.current.publicaciones.map((p) => p.title)).toEqual(['almacén']));
    expect(listarPublicacionesApi).toHaveBeenLastCalledWith('active', expect.objectContaining({ pagina: 1, filtros: { buscar: 'almacén' } }));
  });
  it('ignora respuestas anteriores incluso si el transporte no respeta abort', async () => {
    let resolver!: (respuesta: ReturnType<typeof r>) => void;
    vi.mocked(listarPublicacionesApi).mockImplementation((_e, o) => o?.filtros?.buscar === 'nuevo' ? Promise.resolve(r('nuevo')) : new Promise((resolve) => { resolver = resolve; }));
    const { result, rerender } = renderHook(({ buscar }) => usePublicacionesPublicas({ filtros: { buscar } }), { initialProps: { buscar: 'viejo' } });
    rerender({ buscar: 'nuevo' });
    await waitFor(() => expect(result.current.publicaciones[0]?.title).toBe('nuevo'));
    await act(async () => resolver(r('viejo')));
    expect(result.current.publicaciones[0]?.title).toBe('nuevo');
  });
  it('reintenta la misma página después de fallar al cargar más', async () => {
    vi.mocked(listarPublicacionesApi).mockResolvedValueOnce(r('primero')).mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(r('segundo', 2));
    const { result } = renderHook(() => usePublicacionesPublicas());
    await waitFor(() => expect(result.current.cargando).toBe(false));
    act(() => result.current.verMas());
    await waitFor(() => expect(result.current.error).toBe('Sin conexión'));
    act(() => result.current.verMas());
    await waitFor(() => expect(result.current.publicaciones).toHaveLength(2));
    expect(listarPublicacionesApi).toHaveBeenLastCalledWith('active', expect.objectContaining({ pagina: 2 }));
  });
});
