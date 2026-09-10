import { describe, expect, it } from 'vitest';
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
});
