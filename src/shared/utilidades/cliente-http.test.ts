import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { alExpirarSesion, ErrorHttp, peticion, renovarSesion } from './cliente-http';
import { borrarToken, guardarToken, leerToken } from './almacenamiento-sesion';

const respuesta = (estado: number, cuerpo?: unknown) =>
  new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  });

const fetchFalso = vi.fn<typeof fetch>();

const rutaDe = (llamada: number) => String(fetchFalso.mock.calls[llamada][0]);
const cabecerasDe = (llamada: number) =>
  fetchFalso.mock.calls[llamada][1]?.headers as Record<string, string>;

beforeEach(() => {
  borrarToken();
  fetchFalso.mockReset();
  vi.stubGlobal('fetch', fetchFalso);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('peticion', () => {
  it('envia la cookie de sesion con credentials include', async () => {
    fetchFalso.mockResolvedValue(respuesta(200, { success: true, data: { ok: 1 } }));

    await peticion('/api/v1/catalog/products');

    expect(fetchFalso.mock.calls[0][1]?.credentials).toBe('include');
  });

  it('adjunta el token de acceso guardado en memoria', async () => {
    guardarToken('token-1');
    fetchFalso.mockResolvedValue(respuesta(200, { success: true, data: {} }));

    await peticion('/api/v1/auth/me', { autenticada: true });

    expect(cabecerasDe(0).Authorization).toBe('Bearer token-1');
  });

  it('expone los segundos de espera de un 429', async () => {
    fetchFalso.mockResolvedValue(
      respuesta(429, { success: false, error: 'Demasiados intentos', reintentarEnSegundos: 840 })
    );

    const error = await peticion('/api/v1/auth/login', { metodo: 'POST', cuerpo: {} }).catch((e) => e);

    expect(error).toBeInstanceOf(ErrorHttp);
    expect(error).toMatchObject({ estado: 429, reintentarEnSegundos: 840 });
  });

  it('si el token caduco lo renueva y repite la peticion una vez', async () => {
    guardarToken('token-viejo');
    fetchFalso
      .mockResolvedValueOnce(respuesta(401, { success: false, error: 'La sesion expiro' }))
      .mockResolvedValueOnce(respuesta(200, { success: true, data: { token: 'token-nuevo', expiraEn: 900, usuario: {} } }))
      .mockResolvedValueOnce(respuesta(200, { success: true, data: { productos: [] } }));

    const datos = await peticion('/api/v1/catalog/products', { metodo: 'POST', autenticada: true, cuerpo: {} });

    expect(datos).toEqual({ productos: [] });
    expect(rutaDe(1)).toMatch(/\/api\/v1\/auth\/refresh$/);
    expect(cabecerasDe(2).Authorization).toBe('Bearer token-nuevo');
    expect(leerToken()).toBe('token-nuevo');
  });

  it('si no se puede renovar avisa de que la sesion termino y borra el token', async () => {
    guardarToken('token-viejo');
    const oyente = vi.fn();
    const quitar = alExpirarSesion(oyente);
    fetchFalso
      .mockResolvedValueOnce(respuesta(401, { success: false, error: 'La sesion expiro' }))
      .mockResolvedValueOnce(respuesta(401, { success: false, error: 'Tu sesion termino' }));

    const error = await peticion('/api/v1/auth/me', { autenticada: true }).catch((e) => e);

    expect(error).toMatchObject({ estado: 401, message: expect.stringMatching(/sesion termino/i) });
    expect(oyente).toHaveBeenCalledTimes(1);
    expect(leerToken()).toBeNull();
    quitar();
  });

  it('un 401 en una ruta publica no dispara la renovacion', async () => {
    fetchFalso.mockResolvedValue(respuesta(401, { success: false, error: 'Correo o contrasena incorrectos' }));

    await expect(peticion('/api/v1/auth/login', { metodo: 'POST', cuerpo: {} })).rejects.toThrow(/incorrectos/);
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });
});

describe('renovarSesion', () => {
  it('varias renovaciones simultaneas comparten una sola peticion', async () => {
    let resolver: (valor: Response) => void = () => {};
    fetchFalso.mockReturnValue(new Promise((r) => (resolver = r)));

    const primera = renovarSesion();
    const segunda = renovarSesion();
    resolver(respuesta(200, { success: true, data: { token: 't', expiraEn: 900, usuario: { userId: 1 } } }));

    await expect(primera).resolves.toMatchObject({ token: 't' });
    await expect(segunda).resolves.toMatchObject({ token: 't' });
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });
});
