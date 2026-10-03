import { beforeEach, describe, expect, it, vi } from 'vitest';
import { peticion } from './cliente-http';
import { listarProductosApi } from '@/features/productos/servicios/productos.api';
import { listarCursosApi } from '@/features/cursos/servicios/cursos.api';
import { listarPublicacionesApi } from '@/features/publicaciones/servicios/publicaciones.api';
vi.mock('./cliente-http');
beforeEach(() => { vi.mocked(peticion).mockResolvedValue({ productos: [], cursos: [], publicaciones: [], paginacion: {} }); });
const parametros = () => new URL(`http://localhost${vi.mocked(peticion).mock.calls.at(-1)![0]}`).searchParams;
describe('API de productos filtrados', () => {
  it('envía búsqueda, rango y disponibilidad una sola vez', async () => {
    await listarProductosApi('inactive', 2, undefined, 12, { estado: 'inactive', buscar: 'Caja & cinta', precioMin: 0, precioMax: 100, stock: 'agotado' });
    const p = parametros();
    expect(p.getAll('estado')).toEqual(['inactive']);
    expect(p.get('buscar')).toBe('Caja & cinta'); expect(p.get('precioMin')).toBe('0');
    expect(p.get('stock')).toBe('agotado'); expect(p.get('pagina')).toBe('2');
  });
});
describe('API de cursos filtrados', () => {
  it('envía duración y orden sin perder la señal de cancelación', async () => {
    const senal = new AbortController().signal;
    await listarCursosApi('active', 1, senal, 12, { duracionMax: 90, orden: 'precio-desc' });
    expect(parametros().get('duracionMax')).toBe('90'); expect(parametros().get('orden')).toBe('precio-desc');
    expect(peticion).toHaveBeenLastCalledWith(expect.any(String), { senal });
  });
});
describe('API de publicaciones filtradas', () => {
  it('envía rango de fechas y respeta el orden seleccionado', async () => {
    await listarPublicacionesApi('todos', { pagina: 3, filtros: { orden: 'titulo', desde: '2026-10-01', hasta: '2026-10-03', estado: 'todos' } });
    const p = parametros();
    expect(p.getAll('orden')).toEqual(['titulo']); expect(p.getAll('estado')).toEqual(['todos']);
    expect(p.get('desde')).toBe('2026-10-01'); expect(p.get('hasta')).toBe('2026-10-03');
  });
});
