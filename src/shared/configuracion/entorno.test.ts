import { describe, expect, it, vi } from 'vitest';
import { resolverUrlApi } from './entorno';

describe('resolverUrlApi', () => {
  it('usa HYCON_API_URL cuando esta definida', () => {
    expect(resolverUrlApi({ HYCON_API_URL: 'https://api.hycon.com' })).toBe(
      'https://api.hycon.com'
    );
  });

  it('da prioridad a HYCON_API_URL sobre el respaldo VITE_API_URL', () => {
    expect(
      resolverUrlApi({
        HYCON_API_URL: 'https://api.hycon.com',
        VITE_API_URL: 'http://localhost:9999',
      })
    ).toBe('https://api.hycon.com');
  });

  it('acepta VITE_API_URL como respaldo para despliegues antiguos', () => {
    expect(resolverUrlApi({ VITE_API_URL: 'http://localhost:4000' })).toBe(
      'http://localhost:4000'
    );
  });

  it('cae al backend local cuando no hay ninguna variable', () => {
    expect(resolverUrlApi({})).toBe('http://localhost:4000');
  });

  it('quita la barra final para no duplicarla al concatenar rutas', () => {
    expect(resolverUrlApi({ HYCON_API_URL: 'https://api.hycon.com/' })).toBe(
      'https://api.hycon.com'
    );
  });

  it('tolera que se pegue la linea entera del .env en el valor', () => {
    // Error tipico al configurar Vercel: el nombre acaba dentro del valor
    expect(resolverUrlApi({ HYCON_API_URL: 'HYCON_API_URL=https://api.hycon.com' })).toBe(
      'https://api.hycon.com'
    );
    expect(resolverUrlApi({ VITE_API_URL: 'VITE_API_URL = http://localhost:4000' })).toBe(
      'http://localhost:4000'
    );
  });

  it('quita las comillas y los espacios de sobra', () => {
    expect(resolverUrlApi({ HYCON_API_URL: '  "https://api.hycon.com"  ' })).toBe(
      'https://api.hycon.com'
    );
  });

  it('una direccion sin http avisa y no deja que el front se pida datos a si mismo', () => {
    const aviso = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(resolverUrlApi({ HYCON_API_URL: 'api.hycon.com' })).toBe('http://localhost:4000');
    expect(aviso).toHaveBeenCalledWith(expect.stringContaining('no es una direccion valida'));

    aviso.mockRestore();
  });
});