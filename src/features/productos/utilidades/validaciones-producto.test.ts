import { describe, expect, it } from 'vitest';
import { validarProducto } from './validaciones-producto';
import { sinErroresCatalogo } from '@/shared/utilidades/validaciones-comunes';
import { PRODUCTO_VACIO } from '@/features/productos/tipos/producto.tipos';

const producto = { ...PRODUCTO_VACIO, name: 'Caja de carton', price: '25.90', stock: '10' };

describe('validarProducto', () => {
  it('acepta un producto con lo minimo obligatorio', () => {
    expect(sinErroresCatalogo(validarProducto(producto))).toBe(true);
  });

  it('exige nombre y precio', () => {
    const errores = validarProducto(PRODUCTO_VACIO);
    expect(errores.name).toBe('El nombre es obligatorio');
    expect(errores.price).toBe('El precio es obligatorio');
  });

  it('rechaza precio cero o negativo', () => {
    expect(validarProducto({ ...producto, price: '0' }).price).toBe('Debe ser mayor que cero');
    expect(validarProducto({ ...producto, price: '-3' }).price).toBe('Debe ser mayor que cero');
  });

  it('rechaza precio que no es numero', () => {
    expect(validarProducto({ ...producto, price: 'gratis' }).price).toBe('Debe ser un numero');
  });

  it('exige que la oferta sea menor que el precio', () => {
    expect(validarProducto({ ...producto, discountPrice: '30' }).discountPrice).toBe(
      'Debe ser menor que el precio'
    );
    expect(validarProducto({ ...producto, discountPrice: '25.90' }).discountPrice).toBe(
      'Debe ser menor que el precio'
    );
    expect(validarProducto({ ...producto, discountPrice: '19.90' }).discountPrice).toBeUndefined();
  });

  it('trata los campos opcionales vacios como validos', () => {
    const errores = validarProducto({
      ...producto,
      discountPrice: '',
      stock: '',
      imageUrl: '',
      brand: '',
      model: '',
      description: '',
    });
    expect(sinErroresCatalogo(errores)).toBe(true);
  });

  it('rechaza stock negativo o decimal', () => {
    expect(validarProducto({ ...producto, stock: '-1' }).stock).toBeDefined();
    expect(validarProducto({ ...producto, stock: '2.5' }).stock).toBe('Debe ser un numero entero');
  });

  it('rechaza URLs de imagen invalidas y protocolos no http', () => {
    expect(validarProducto({ ...producto, imageUrl: 'imagen.png' }).imageUrl).toBeDefined();
    expect(validarProducto({ ...producto, imageUrl: 'javascript:alert(1)' }).imageUrl).toBeDefined();
    expect(
      validarProducto({ ...producto, imageUrl: 'https://cdn.hycon.lat/a.webp' }).imageUrl
    ).toBeUndefined();
  });

  it('rechaza nombres de un solo caracter', () => {
    expect(validarProducto({ ...producto, name: 'A' }).name).toBe(
      'Debe tener al menos 2 caracteres'
    );
  });
});
