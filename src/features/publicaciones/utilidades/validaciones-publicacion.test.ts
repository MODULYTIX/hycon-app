import { describe, expect, it } from 'vitest';
import { validarPublicacion } from './validaciones-publicacion';
import {
  publicacionAFormulario,
  publicacionVacia,
  type Publicacion,
} from '@/features/publicaciones/tipos/publicacion.tipos';

const valida = {
  title: 'Pausas activas en la oficina',
  excerpt: '',
  content: 'Levantarse cada hora reduce la tension del cuello.',
  publishedAt: '2026-03-01',
  status: 'active' as const,
  coverUrl: '',
};

describe('validarPublicacion', () => {
  it('acepta una publicacion completa', () => {
    expect(validarPublicacion(valida)).toEqual({});
  });

  it('exige titulo y contenido', () => {
    const errores = validarPublicacion({ ...valida, title: ' ', content: '' });
    expect(errores.title).toBe('El título es obligatorio');
    expect(errores.content).toBe('El contenido es obligatorio');
  });

  it('un contenido con formato pero sin texto cuenta como vacio', () => {
    expect(validarPublicacion({ ...valida, content: '<p></p><ul><li><p></p></li></ul>' }).content).toBe(
      'El contenido es obligatorio'
    );
    expect(
      validarPublicacion({ ...valida, content: '<h2>Hola</h2><p><strong>texto largo suficiente</strong></p>' })
        .content
    ).toBeUndefined();
  });

  it('pide un titulo y un contenido con largo minimo', () => {
    expect(validarPublicacion({ ...valida, title: 'Ok' }).title).toMatch(/al menos 3/);
    expect(validarPublicacion({ ...valida, content: 'muy corto' }).content).toMatch(/al menos 20/);
  });

  it('limita el resumen a 300 caracteres', () => {
    expect(validarPublicacion({ ...valida, excerpt: 'a'.repeat(301) }).excerpt).toMatch(/300/);
    expect(validarPublicacion({ ...valida, excerpt: 'a'.repeat(300) }).excerpt).toBeUndefined();
  });

  it('valida la fecha, incluido un dia que no existe', () => {
    expect(validarPublicacion({ ...valida, publishedAt: '' }).publishedAt).toMatch(/elige/i);
    expect(validarPublicacion({ ...valida, publishedAt: '2026-02-30' }).publishedAt).toMatch(/no es válida/);
  });

  it('valida la URL de la portada', () => {
    expect(validarPublicacion({ ...valida, coverUrl: 'portada.png' }).coverUrl).toBeDefined();
  });
});

describe('formularios de publicacion', () => {
  it('una publicacion nueva empieza publicada y con la fecha de hoy', () => {
    const vacia = publicacionVacia();
    expect(vacia.status).toBe('active');
    expect(vacia.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('prepara una publicacion guardada para editarla', () => {
    const guardada: Publicacion = {
      postId: 3,
      title: 'Pausas activas',
      slug: 'pausas-activas',
      excerpt: null,
      content: 'Texto del articulo con suficiente largo.',
      coverUrl: null,
      status: 'inactive',
      views: 4,
      readingMinutes: 1,
      authorName: 'Esau Morales',
      publishedAt: '2026-03-01T12:00:00.000Z',
      createdAt: '2026-03-01T12:00:00.000Z',
    };

    expect(publicacionAFormulario(guardada)).toEqual({
      title: 'Pausas activas',
      excerpt: '',
      content: 'Texto del articulo con suficiente largo.',
      publishedAt: '2026-03-01',
      status: 'inactive',
    });
  });
});
