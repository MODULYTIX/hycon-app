import { describe, expect, it } from 'vitest';
import { normalizarEnlace, textoPlano } from './texto-enriquecido';

describe('textoPlano', () => {
  it('quita las etiquetas y decodifica entidades', () => {
    expect(textoPlano('<h2>Hola</h2><p><strong>uno</strong>&nbsp;&amp; dos</p>')).toBe('Hola uno & dos');
  });

  it('el HTML de un editor vacio no tiene texto', () => {
    expect(textoPlano('<p></p>')).toBe('');
  });
});

describe('normalizarEnlace', () => {
  it('completa https cuando falta', () => {
    expect(normalizarEnlace('hycon.lat')).toBe('https://hycon.lat');
    expect(normalizarEnlace(' www.hycon.lat/cursos ')).toBe('https://www.hycon.lat/cursos');
  });

  it('respeta http y https', () => {
    expect(normalizarEnlace('http://hycon.lat')).toBe('http://hycon.lat');
    expect(normalizarEnlace('https://hycon.lat/a?b=1')).toBe('https://hycon.lat/a?b=1');
  });

  it('convierte un correo en mailto', () => {
    expect(normalizarEnlace('info@hycon.lat')).toBe('mailto:info@hycon.lat');
    expect(normalizarEnlace('mailto:info@hycon.lat')).toBe('mailto:info@hycon.lat');
  });

  it('rechaza esquemas peligrosos y textos que no son direcciones', () => {
    expect(normalizarEnlace('javascript:alert(1)')).toBeNull();
    expect(normalizarEnlace('data:text/html,hola')).toBeNull();
    expect(normalizarEnlace('hola')).toBeNull();
    expect(normalizarEnlace('mailto:no-es-correo')).toBeNull();
    expect(normalizarEnlace('')).toBeNull();
  });
});
