import { describe, expect, it } from 'vitest';
import { validarCurso } from './validaciones-curso';
import { sinErroresCatalogo } from '@/shared/utilidades/validaciones-comunes';
import { CURSO_VACIO } from '@/features/cursos/tipos/curso.tipos';

const curso = { ...CURSO_VACIO, name: 'Logistica basica', price: '120' };

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

  it('exige que la oferta sea menor que el precio', () => {
    expect(validarCurso({ ...curso, discountPrice: '150' }).discountPrice).toBeDefined();
  });

  it('deja pasar los opcionales vacios', () => {
    expect(
      sinErroresCatalogo(
        validarCurso({ ...curso, durationMinutes: '', discountPrice: '', videoUrl: '' })
      )
    ).toBe(true);
  });
});
