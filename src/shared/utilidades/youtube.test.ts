import { describe, expect, it } from 'vitest';
import {
  extraerIdYoutube,
  extraerInicioYoutube,
  formatearTiempo,
  mensajeErrorYoutube,
  miniaturaYoutube,
  parametrosReproductor,
} from './youtube';

const ID = 'dQw4w9WgXcQ';

describe('extraerIdYoutube', () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&list=PL1`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube.com/live/${ID}`,
  ])('reconoce %s', (enlace) => {
    expect(extraerIdYoutube(enlace)).toBe(ID);
  });

  it.each([
    '',
    'youtube',
    'https://vimeo.com/123',
    'https://youtu.be/demo-hycon',
    `https://youtube.com.falso.com/watch?v=${ID}`,
  ])('rechaza %s', (enlace) => {
    expect(extraerIdYoutube(enlace)).toBeNull();
  });
});

describe('extraerInicioYoutube', () => {
  it('entiende los formatos de tiempo de YouTube', () => {
    expect(extraerInicioYoutube(`https://youtu.be/${ID}?t=90`)).toBe(90);
    expect(extraerInicioYoutube(`https://youtu.be/${ID}?t=90s`)).toBe(90);
    expect(extraerInicioYoutube(`https://www.youtube.com/watch?v=${ID}&t=1m30s`)).toBe(90);
    expect(extraerInicioYoutube(`https://www.youtube.com/watch?v=${ID}&t=1h0m5s`)).toBe(3605);
    expect(extraerInicioYoutube(`https://www.youtube.com/embed/${ID}?start=12`)).toBe(12);
  });

  it('sin tiempo o con basura empieza desde cero', () => {
    expect(extraerInicioYoutube(`https://youtu.be/${ID}`)).toBe(0);
    expect(extraerInicioYoutube(`https://youtu.be/${ID}?t=mucho`)).toBe(0);
    expect(extraerInicioYoutube(null)).toBe(0);
  });
});

describe('parametrosReproductor', () => {
  it('oculta la barra, las anotaciones y los atajos de YouTube', () => {
    expect(parametrosReproductor()).toMatchObject({
      controls: 0,
      rel: 0,
      iv_load_policy: 3,
      disablekb: 1,
      fs: 0,
      autoplay: 1,
      playsinline: 1,
    });
  });

  it('solo incluye inicio y origen si vienen', () => {
    expect(parametrosReproductor()).not.toHaveProperty('start');
    expect(parametrosReproductor(90, 'http://localhost:5173')).toMatchObject({
      start: 90,
      origin: 'http://localhost:5173',
    });
  });
});

describe('formatearTiempo', () => {
  it('usa minutos y segundos, y horas si hacen falta', () => {
    expect(formatearTiempo(0)).toBe('0:00');
    expect(formatearTiempo(14.8)).toBe('0:14');
    expect(formatearTiempo(327)).toBe('5:27');
    expect(formatearTiempo(3725)).toBe('1:02:05');
  });

  it('no muestra valores raros mientras el video carga', () => {
    expect(formatearTiempo(Number.NaN)).toBe('0:00');
    expect(formatearTiempo(-3)).toBe('0:00');
  });
});

describe('mensajeErrorYoutube', () => {
  it('explica los errores habituales', () => {
    expect(mensajeErrorYoutube(150)).toMatch(/no permite reproducirlo/);
    expect(mensajeErrorYoutube(101)).toMatch(/no permite reproducirlo/);
    expect(mensajeErrorYoutube(100)).toMatch(/no existe/);
    expect(mensajeErrorYoutube(5)).toBe('No se pudo reproducir el video.');
  });
});

describe('miniaturaYoutube', () => {
  it('usa la calidad que siempre existe', () => {
    expect(miniaturaYoutube(ID)).toBe(`https://i.ytimg.com/vi/${ID}/hqdefault.jpg`);
  });
});
