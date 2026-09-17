import { describe, expect, it } from 'vitest';
import { validarCurso } from './validaciones-curso';
import { sinErroresCatalogo } from '@/shared/utilidades/validaciones-comunes';
import { CURSO_VACIO, cursoAFormulario } from '@/features/cursos/tipos/curso.tipos';

const vacio = { ...CURSO_VACIO, thumbnailUrl: '' };
const curso = { ...vacio, name: 'Pausas activas', price: '120' };

describe('validarCurso', () => {
  it('acepta un curso con lo minimo obligatorio', () => {
    expect(validarCurso(curso)).toEqual({});
  });

  it('exige nombre y precio', () => {
    const errores = validarCurso(vacio);
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

describe('cursoAFormulario', () => {
  it('prepara un curso guardado para editarlo', () => {
    expect(
      cursoAFormulario({
        courseId: 1,
        name: 'Pausas activas',
        description: null,
        videoUrl: 'https://youtu.be/abc',
        thumbnailUrl: null,
        durationMinutes: null,
        price: 120,
        discountPrice: 99,
        status: 'active',
        createdAt: '2026-09-10T12:00:00.000Z',
      })
    ).toEqual({
      name: 'Pausas activas',
      description: '',
      videoUrl: 'https://youtu.be/abc',
      durationMinutes: '',
      price: '120',
      discountPrice: '99',
      status: 'active',
    });
  });
});
