import { describe, expect, it } from 'vitest';
import { parametrosFiltros } from './filtros-listado';
describe('Parámetros de filtros', () => {
  it('codifica espacios y caracteres sin alterar el estado principal', () => {
    const q = new URLSearchParams(parametrosFiltros({ buscar: 'caja & embalaje', estado: 'inactive', precioMin: 0, stock: 'agotado' }).slice(1));
    expect(q.get('buscar')).toBe('caja & embalaje');
    expect(q.get('precioMin')).toBe('0'); expect(q.get('stock')).toBe('agotado');
    expect(q.has('estado')).toBe(false);
  });
  it('omite parámetros vacíos', () => expect(parametrosFiltros({ buscar: '', precioMax: undefined })).toBe(''));
});
