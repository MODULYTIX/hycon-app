import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { revisarImagen, sinCloudinary, subirACloudinaryApi } from './cloudinary.api';
import { subirImagenApi } from './imagenes.api';
import { ErrorHttp, peticion } from '@/shared/utilidades/cliente-http';

vi.mock('@/shared/utilidades/cliente-http', async (original) => {
  const real = await original<typeof import('@/shared/utilidades/cliente-http')>();
  return { ...real, peticion: vi.fn() };
});

const firma = {
  cloudName: 'hycon-demo',
  apiKey: '123456789012345',
  timestamp: 1760000000,
  folder: 'hycon/catalogo',
  signature: 'a'.repeat(40),
};

const archivo = (tipo = 'image/webp', bytes = 1000) => {
  const imagen = new File([new Uint8Array(10)], 'foto.webp', { type: tipo });
  Object.defineProperty(imagen, 'size', { value: bytes });
  return imagen;
};

const respuestaCloudinary = (datos: object, ok = true) =>
  vi.fn().mockResolvedValue({ ok, json: async () => datos });

beforeEach(() => {
  vi.mocked(peticion).mockResolvedValue({ firma } as never);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('revisarImagen', () => {
  it('acepta los formatos permitidos', () => {
    expect(revisarImagen(archivo('image/jpeg'))).toBeUndefined();
    expect(revisarImagen(archivo('image/png'))).toBeUndefined();
  });

  it('rechaza otros formatos y lo que pesa de mas', () => {
    expect(revisarImagen(archivo('application/pdf'))).toMatch(/jpg, png, webp o gif/i);
    expect(revisarImagen(archivo('image/webp', 6 * 1024 * 1024))).toMatch(/5 MB/);
  });
});

describe('subirACloudinaryApi', () => {
  it('pide la firma al backend y sube el archivo directo a Cloudinary', async () => {
    const subida = respuestaCloudinary({ secure_url: 'https://res.cloudinary.com/x/foto.webp' });
    vi.stubGlobal('fetch', subida);

    const url = await subirACloudinaryApi(archivo(), 'catalogo');

    expect(peticion).toHaveBeenCalledWith('/api/v1/uploads/firma/catalogo', {
      metodo: 'POST',
      autenticada: true,
    });
    const [destino, opciones] = subida.mock.calls[0];
    const cuerpo = opciones.body as FormData;
    expect(destino).toBe('https://api.cloudinary.com/v1_1/hycon-demo/image/upload');
    expect(cuerpo.get('signature')).toBe(firma.signature);
    expect(cuerpo.get('folder')).toBe('hycon/catalogo');
    expect(cuerpo.get('file')).toBeInstanceOf(File);
    expect(url).toBe('https://res.cloudinary.com/x/foto.webp');
  });

  it('el avatar pide la firma de su propia carpeta', async () => {
    vi.stubGlobal('fetch', respuestaCloudinary({ secure_url: 'https://res.cloudinary.com/x/a.webp' }));

    await subirACloudinaryApi(archivo(), 'avatar');

    expect(peticion).toHaveBeenCalledWith('/api/v1/uploads/firma/avatar', expect.any(Object));
  });

  it('no pide firma si el archivo no sirve', async () => {
    await expect(subirACloudinaryApi(archivo('text/plain'), 'catalogo')).rejects.toThrow(/jpg, png/i);
    expect(peticion).not.toHaveBeenCalled();
  });

  it('avisa con el mensaje de Cloudinary si rechaza la subida', async () => {
    vi.stubGlobal('fetch', respuestaCloudinary({ error: { message: 'Invalid signature' } }, false));

    await expect(subirACloudinaryApi(archivo(), 'catalogo')).rejects.toThrow('Invalid signature');
  });
});

describe('subirImagenApi', () => {
  it('usa Cloudinary cuando esta configurado', async () => {
    vi.stubGlobal('fetch', respuestaCloudinary({ secure_url: 'https://res.cloudinary.com/x/f.webp' }));

    await expect(subirImagenApi(archivo())).resolves.toBe('https://res.cloudinary.com/x/f.webp');
  });

  it('si el servidor no tiene Cloudinary, guarda en el backend', async () => {
    vi.mocked(peticion)
      .mockRejectedValueOnce(new ErrorHttp('Cloudinary no esta configurado', 503))
      .mockResolvedValueOnce({ imagen: { url: 'http://localhost:4000/uploads/imagenes/a.webp' } } as never);

    const url = await subirImagenApi(archivo());

    expect(url).toBe('http://localhost:4000/uploads/imagenes/a.webp');
    expect(vi.mocked(peticion).mock.calls[1][0]).toBe('/api/v1/uploads/imagenes');
  });

  it('cualquier otro error no se disimula con la reserva', async () => {
    vi.mocked(peticion).mockRejectedValue(new ErrorHttp('No tienes permisos', 403));

    await expect(subirImagenApi(archivo())).rejects.toThrow(/permisos/);
    expect(peticion).toHaveBeenCalledTimes(1);
  });
});

describe('sinCloudinary', () => {
  it('solo reconoce el 503 del servidor', () => {
    expect(sinCloudinary(new ErrorHttp('no configurado', 503))).toBe(true);
    expect(sinCloudinary(new ErrorHttp('sin permiso', 403))).toBe(false);
    expect(sinCloudinary(new Error('cualquier cosa'))).toBe(false);
  });
});
