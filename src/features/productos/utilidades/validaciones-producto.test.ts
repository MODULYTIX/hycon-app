import { describe, expect, it } from 'vitest';
import {
  sinErroresCatalogo,
  validarCurso,
  validarProducto,
} from './validaciones-catalogo';
import { CURSO_VACIO, PRODUCTO_VACIO } from '@/features/administracion/tipos/catalogo.tipos';

const producto = { ...PRODUCTO_VACIO, name: 'Caja de carton', price: '25.90', stock: '10' };
const curso = { ...CURSO_VACIO, name: 'Logistica basica', price: '120' };

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
    expect(validarProducto({ ...producto, stock: '2.5' }).stock).toBe(
      'Debe ser un numero entero'
    );
  });

  it('rechaza URLs de imagen invalidas y protocolos no http', () => {
    expect(validarProducto({ ...producto, imageUrl: 'imagen.png' }).imageUrl).toBeDefined();
    expect(
      validarProducto({ ...producto, imageUrl: 'javascript:alert(1)' }).imageUrl
    ).toBeDefined();
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

describe('validarCurso', () => {
  it('acepta un curso con lo minimo obligatorio', () => {
    expect(sinErroresCatalogo(validarCurso(curso))).toBe(true);
  });

  it('exige nombre y precio', () => {
    const errores = validarCurso(CURSO_VACIO);
    expect(errores.name).toBeDefined();
    expect(errores.price).toBeDefined();
  });

  it('rechaza duracion de cero, negativa o decimal', () => {
    expect(validarCurso({ ...curso, durationMinutes: '0' }).durationMinutes).toBeDefined();
    expect(validarCurso({ ...curso, durationMinutes: '-5' }).durationMinutes).toBeDefined();
    expect(validarCurso({ ...curso, durationMinutes: '9.5' }).durationMinutes).toBe(
      'Debe ser un numero entero'
    );
    expect(validarCurso({ ...curso, durationMinutes: '90' }).durationMinutes).toBeUndefined();
  });

  it('valida las URLs de video y miniatura', () => {
    expect(validarCurso({ ...curso, videoUrl: 'youtube' }).videoUrl).toBeDefined();
    expect(validarCurso({ ...curso, thumbnailUrl: 'foto' }).thumbnailUrl).toBeDefined();
    expect(validarCurso({ ...curso, videoUrl: 'https://youtu.be/abc' }).videoUrl).toBeUndefined();
  });

  it('deja pasar los opcionales vacios', () => {
    expect(
      sinErroresCatalogo(
        validarCurso({ ...curso, durationMinutes: '', discountPrice: '', videoUrl: '' })
      )
    ).toBe(true);
  });
});
