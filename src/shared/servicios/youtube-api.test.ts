import { afterEach, describe, expect, it } from 'vitest';
import { cargarApiYoutube, reiniciarCargaYoutube, type ApiYoutube } from './youtube-api';

const scripts = () => document.head.querySelectorAll('script[src="https://www.youtube.com/iframe_api"]');
const apiFalsa = { Player: class {}, PlayerState: {} } as unknown as ApiYoutube;

afterEach(() => {
  delete window.YT;
  delete window.onYouTubeIframeAPIReady;
  scripts().forEach((script) => script.remove());
  reiniciarCargaYoutube();
});

describe('cargarApiYoutube', () => {
  it('si la API ya esta cargada no inserta otro script', async () => {
    window.YT = apiFalsa;

    await expect(cargarApiYoutube()).resolves.toBe(apiFalsa);
    expect(scripts()).toHaveLength(0);
  });

  it('inserta el script una sola vez aunque se pida varias veces', async () => {
    const primera = cargarApiYoutube();
    const segunda = cargarApiYoutube();

    expect(scripts()).toHaveLength(1);

    // YouTube avisa llamando a esta funcion global cuando termina de cargar
    window.YT = apiFalsa;
    window.onYouTubeIframeAPIReady?.();

    await expect(primera).resolves.toBe(apiFalsa);
    await expect(segunda).resolves.toBe(apiFalsa);
  });

  it('si el script falla lo informa y permite reintentar', async () => {
    const intento = cargarApiYoutube();
    scripts()[0].dispatchEvent(new Event('error'));

    await expect(intento).rejects.toThrow(/no se pudo cargar/i);
    expect(scripts()).toHaveLength(0);

    cargarApiYoutube();
    expect(scripts()).toHaveLength(1);
  });
});
