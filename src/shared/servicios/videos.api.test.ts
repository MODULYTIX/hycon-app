import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  obtenerAlmacenVideosApi,
  revisarVideo,
  subirVideoApi,
  type AlmacenVideos,
} from './videos.api';
import { peticion } from '@/shared/utilidades/cliente-http';

vi.mock('@/shared/utilidades/cliente-http', async (original) => {
  const real = await original<typeof import('@/shared/utilidades/cliente-http')>();
  return { ...real, peticion: vi.fn() };
});

const CURSO = '01a0fef2-19c0-70bf-a4e4-2e1a85443aef';

const almacen: AlmacenVideos = {
  proveedor: 'r2',
  aceptaSubidas: true,
  maximoMb: 1024,
  extensiones: ['mp4', 'webm'],
};

const subida = {
  proveedor: 'r2' as const,
  metodo: 'PUT' as const,
  url: 'https://bucket.r2.cloudflarestorage.com/hycon/cursos/a.mp4?X-Amz-Signature=abc',
  referencia: 'r2:cursos/01a0/a.mp4',
  campoArchivo: null,
};

const archivo = (nombre = 'clase.mp4', bytes = 5_000_000) => {
  const video = new File([new Uint8Array(10)], nombre, { type: 'video/mp4' });
  Object.defineProperty(video, 'size', { value: bytes });
  return video;
};

// Doble de XMLHttpRequest: fetch no informa del avance de una subida
class EnvioFalso {
  static ultimo: EnvioFalso | null = null;

  metodo = '';
  url = '';
  cuerpo: unknown = null;
  status = 200;
  abortado = false;
  private oyentes = new Map<string, (() => void)[]>();
  private deSubida = new Map<string, ((evento: ProgressEvent) => void)[]>();

  upload = {
    addEventListener: (nombre: string, oyente: (evento: ProgressEvent) => void) => {
      this.deSubida.set(nombre, [...(this.deSubida.get(nombre) ?? []), oyente]);
    },
  };

  constructor() {
    EnvioFalso.ultimo = this;
  }

  open(metodo: string, url: string) {
    this.metodo = metodo;
    this.url = url;
  }

  addEventListener(nombre: string, oyente: () => void) {
    this.oyentes.set(nombre, [...(this.oyentes.get(nombre) ?? []), oyente]);
  }

  send(cuerpo: unknown) {
    this.cuerpo = cuerpo;
  }

  abort() {
    this.abortado = true;
    this.emitir('abort');
  }

  emitir(nombre: string) {
    (this.oyentes.get(nombre) ?? []).forEach((oyente) => oyente());
  }

  avanzar(cargado: number, total: number) {
    (this.deSubida.get('progress') ?? []).forEach((oyente) =>
      oyente({ lengthComputable: true, loaded: cargado, total } as ProgressEvent)
    );
  }
}

const esperarEnvio = async () => {
  await vi.waitFor(() => expect(EnvioFalso.ultimo).not.toBeNull());
  return EnvioFalso.ultimo as EnvioFalso;
};

beforeEach(() => {
  EnvioFalso.ultimo = null;
  vi.stubGlobal('XMLHttpRequest', EnvioFalso);
  vi.mocked(peticion).mockResolvedValue({ subida } as never);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('revisarVideo', () => {
  it('acepta los formatos que admite el servidor', () => {
    expect(revisarVideo(archivo('clase.mp4'), almacen)).toBeUndefined();
    expect(revisarVideo(archivo('clase.webm'), almacen)).toBeUndefined();
    expect(revisarVideo(archivo('CLASE.MP4'), almacen)).toBeUndefined();
  });

  it('avisa si el formato no sirve', () => {
    expect(revisarVideo(archivo('clase.avi'), almacen)).toMatch(/MP4, WEBM/);
  });

  it('avisa si pesa mas de lo permitido', () => {
    expect(revisarVideo(archivo('clase.mp4', 2_000_000_000), almacen)).toMatch(/1024 MB/);
  });
});

describe('obtenerAlmacenVideosApi', () => {
  it('pregunta al backend con la sesion', async () => {
    vi.mocked(peticion).mockResolvedValue({ almacen } as never);

    await expect(obtenerAlmacenVideosApi()).resolves.toEqual(almacen);
    expect(peticion).toHaveBeenCalledWith(
      '/api/v1/media/videos',
      expect.objectContaining({ autenticada: true })
    );
  });
});

describe('subirVideoApi', () => {
  it('pide la firma al backend con el curso y el nombre del archivo', async () => {
    void subirVideoApi(CURSO, archivo());
    await esperarEnvio();

    expect(peticion).toHaveBeenCalledWith(
      '/api/v1/media/videos/firma',
      expect.objectContaining({
        metodo: 'POST',
        cuerpo: { cursoUuid: CURSO, nombre: 'clase.mp4' },
        autenticada: true,
      })
    );
  });

  // El archivo no pasa por nuestro servidor: va directo al almacen
  it('manda el archivo al destino firmado y devuelve la referencia', async () => {
    const video = archivo();
    const promesa = subirVideoApi(CURSO, video);
    const envio = await esperarEnvio();

    expect(envio.metodo).toBe('PUT');
    expect(envio.url).toBe(subida.url);
    expect(envio.cuerpo).toBe(video);

    envio.emitir('load');
    await expect(promesa).resolves.toBe('r2:cursos/01a0/a.mp4');
  });

  it('cuando el almacen espera un formulario lo manda asi', async () => {
    vi.mocked(peticion).mockResolvedValue({
      subida: {
        proveedor: 'stream',
        metodo: 'POST',
        url: 'https://upload.stream/abc',
        referencia: 'stream:ea95132c15732412d22c1476fa83f27a',
        campoArchivo: 'file',
      },
    } as never);

    const promesa = subirVideoApi(CURSO, archivo());
    const envio = await esperarEnvio();

    expect(envio.metodo).toBe('POST');
    expect(envio.cuerpo).toBeInstanceOf(FormData);
    expect((envio.cuerpo as FormData).get('file')).toBeInstanceOf(File);

    envio.emitir('load');
    await expect(promesa).resolves.toBe('stream:ea95132c15732412d22c1476fa83f27a');
  });

  it('informa del avance en porcentaje', async () => {
    const avances: number[] = [];
    const promesa = subirVideoApi(CURSO, archivo(), (porcentaje) => avances.push(porcentaje));
    const envio = await esperarEnvio();

    envio.avanzar(25, 100);
    envio.avanzar(100, 100);
    envio.emitir('load');
    await promesa;

    expect(avances).toEqual([25, 100]);
  });

  it('un rechazo del almacen se cuenta como error', async () => {
    const promesa = subirVideoApi(CURSO, archivo());
    const envio = await esperarEnvio();

    envio.status = 403;
    envio.emitir('load');

    await expect(promesa).rejects.toThrow(/rechazó el video/i);
  });

  it('si se corta la conexion se avisa', async () => {
    const promesa = subirVideoApi(CURSO, archivo());
    const envio = await esperarEnvio();

    envio.emitir('error');

    await expect(promesa).rejects.toThrow(/conexión/i);
  });

  it('se puede cancelar una subida en marcha', async () => {
    const control = new AbortController();
    const promesa = subirVideoApi(CURSO, archivo(), undefined, control.signal);
    const envio = await esperarEnvio();

    control.abort();

    expect(envio.abortado).toBe(true);
    await expect(promesa).rejects.toThrow(/cancelada/i);
  });
});
