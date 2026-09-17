import { describe, expect, it } from 'vitest';
import { validarProducto } from './validaciones-producto';
import { sinErroresCatalogo } from '@/shared/utilidades/validaciones-comunes';
import {
  PRODUCTO_VACIO,
  productoAFormulario,
  type Producto,
} from '@/features/productos/tipos/producto.tipos';

const producto = {
  ...PRODUCTO_VACIO,
  name: 'Silla ergonomica',
  price: '25.90',
  stock: '10',
  imageUrl: '',
};

describe('validarProducto', () => {
  it('acepta un producto con lo minimo obligatorio', () => {
    expect(sinErroresCatalogo(validarProducto(producto))).toBe(true);
    expect(validarProducto(producto)).toEqual({});
  });

  it('exige nombre y precio', () => {
    const errores = validarProducto({ ...PRODUCTO_VACIO, imageUrl: '' });
    expect(errores.name).toBe('El nombre es obligatorio');
    expect(errores.price).toBe('El precio es obligatorio');
  });

  it('rechaza precio cero, negativo o que no es numero', () => {
    expect(validarProducto({ ...producto, price: '0' }).price).toBe('Debe ser mayor que cero');
    expect(validarProducto({ ...producto, price: '-3' }).price).toBe('Debe ser mayor que cero');
    expect(validarProducto({ ...producto, price: 'gratis' }).price).toBe('Debe ser un numero');
  });

  it('exige que la oferta sea menor que el precio', () => {
    expect(validarProducto({ ...producto, discountPrice: '30' }).discountPrice).toBe(
      'Debe ser menor que el precio'
    );
    expect(validarProducto({ ...producto, discountPrice: '19.90' }).discountPrice).toBeUndefined();
  });

  it('trata los campos opcionales vacios como validos', () => {
    const errores = validarProducto({
      ...producto,
      discountPrice: '',
      stock: '',
      color: '',
      brand: '',
      model: '',
      description: '',
    });
    expect(sinErroresCatalogo(errores)).toBe(true);
  });

  it('rechaza cantidad negativa o decimal', () => {
    expect(validarProducto({ ...producto, stock: '-1' }).stock).toBeDefined();
    expect(validarProducto({ ...producto, stock: '2.5' }).stock).toBe('Debe ser un numero entero');
  });

  it('limita el largo del color igual que el backend', () => {
    expect(validarProducto({ ...producto, color: 'x'.repeat(51) }).color).toMatch(/50 caracteres/);
    expect(validarProducto({ ...producto, color: 'Azul marino' }).color).toBeUndefined();
  });

  it('rechaza URLs de imagen invalidas y protocolos no http', () => {
    expect(validarProducto({ ...producto, imageUrl: 'imagen.png' }).imageUrl).toBeDefined();
    expect(validarProducto({ ...producto, imageUrl: 'javascript:alert(1)' }).imageUrl).toBeDefined();
    expect(
      validarProducto({ ...producto, imageUrl: 'https://cdn.hycon.lat/a.webp' }).imageUrl
    ).toBeUndefined();
  });
});

describe('productoAFormulario', () => {
  const guardado: Producto = {
    productId: 3,
    name: 'Silla',
    description: null,
    brand: 'Hycon',
    model: null,
    color: 'Negro',
    price: 459.9,
    discountPrice: null,
    stock: 0,
    shippingAgencies: [
      { code: 'shalom', name: 'Shalom' },
      { code: 'olva', name: 'Olva Courier' },
    ],
    status: 'inactive',
    imageUrl: null,
    createdAt: '2026-09-10T12:00:00.000Z',
  };

  it('convierte nulls en cadenas vacias y numeros en texto', () => {
    expect(productoAFormulario(guardado)).toEqual({
      name: 'Silla',
      brand: 'Hycon',
      model: '',
      color: 'Negro',
      price: '459.9',
      discountPrice: '',
      stock: '0',
      shippingAgencies: ['shalom', 'olva'],
      description: '',
      status: 'inactive',
    });
  });
});
