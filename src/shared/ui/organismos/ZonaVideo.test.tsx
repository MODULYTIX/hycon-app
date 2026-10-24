import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ZonaVideo from './ZonaVideo';
import { subirVideoApi, type AlmacenVideos } from '@/shared/servicios/videos.api';

// Se sustituye solo la subida: las comprobaciones del archivo son las de verdad
vi.mock('@/shared/servicios/videos.api', async (original) => {
  const real = await original<typeof import('@/shared/servicios/videos.api')>();
  return { ...real, subirVideoApi: vi.fn() };
});

const CURSO = '01a0fef2-19c0-70bf-a4e4-2e1a85443aef';

const conSubidas: AlmacenVideos = {
  proveedor: 'r2',
  aceptaSubidas: true,
  maximoMb: 1024,
  extensiones: ['mp4', 'webm'],
};

const soloEnlaces: AlmacenVideos = {
  proveedor: 'youtube',
  aceptaSubidas: false,
  maximoMb: 1024,
  extensiones: ['mp4'],
};

const archivo = (nombre = 'clase.mp4', bytes = 5_000_000) => {
  const video = new File([new Uint8Array(10)], nombre, { type: 'video/mp4' });
  Object.defineProperty(video, 'size', { value: bytes });
  return video;
};

const pintar = (propiedades: Partial<Parameters<typeof ZonaVideo>[0]> = {}) => {
  const onCambiar = vi.fn();
  render(
    <ZonaVideo
      cursoUuid={CURSO}
      valor=""
      onCambiar={onCambiar}
      almacen={conSubidas}
      {...propiedades}
    />
  );
  return onCambiar;
};

const elegir = (nombre?: string, bytes?: number) =>
  fireEvent.change(screen.getByLabelText(/elegir el archivo del video/i), {
    target: { files: [archivo(nombre, bytes)] },
  });

beforeEach(() => {
  vi.mocked(subirVideoApi).mockResolvedValue('r2:cursos/01a0/clase.mp4');
});

describe('cuando el servidor no acepta subidas', () => {
  it('solo ofrece pegar el enlace', () => {
    pintar({ almacen: soloEnlaces });

    expect(screen.getByLabelText(/url del video/i)).toBeInTheDocument();
    expect(screen.queryByText(/subir un archivo/i)).not.toBeInTheDocument();
  });

  // Mientras no se sabe que almacen hay, se queda como siempre
  it('sin respuesta del servidor tampoco la ofrece', () => {
    pintar({ almacen: null });

    expect(screen.getByLabelText(/url del video/i)).toBeInTheDocument();
    expect(screen.queryByText(/subir un archivo/i)).not.toBeInTheDocument();
  });
});

describe('cuando se puede subir el video', () => {
  it('ofrece las dos vias y dice que acepta', () => {
    pintar();

    expect(screen.getByLabelText(/url del video/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subir un archivo/i })).toBeInTheDocument();
    expect(screen.getByText(/MP4, WEBM/)).toBeInTheDocument();
  });

  it('al elegir un archivo lo sube y guarda la referencia', async () => {
    const onCambiar = pintar();

    elegir();

    await waitFor(() => expect(onCambiar).toHaveBeenCalledWith('r2:cursos/01a0/clase.mp4'));
    expect(subirVideoApi).toHaveBeenCalledWith(
      CURSO,
      expect.any(File),
      expect.any(Function),
      expect.any(AbortSignal)
    );
  });

  it('un formato que no sirve no se sube', async () => {
    const onCambiar = pintar();

    elegir('clase.avi');

    expect(await screen.findByRole('alert')).toHaveTextContent(/MP4, WEBM/);
    expect(subirVideoApi).not.toHaveBeenCalled();
    expect(onCambiar).not.toHaveBeenCalled();
  });

  it('un archivo demasiado pesado no se sube', async () => {
    pintar();

    elegir('clase.mp4', 2_000_000_000);

    expect(await screen.findByRole('alert')).toHaveTextContent(/1024 MB/);
    expect(subirVideoApi).not.toHaveBeenCalled();
  });

  it('muestra el avance y deja cancelar mientras sube', async () => {
    let avisar: ((porcentaje: number) => void) | undefined;
    vi.mocked(subirVideoApi).mockImplementation(async (_curso, _archivo, onProgreso) => {
      avisar = onProgreso;
      return new Promise<string>(() => undefined);
    });
    pintar();

    elegir();

    const barra = await screen.findByRole('progressbar');
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();

    avisar?.(40);
    await waitFor(() => expect(barra).toHaveAttribute('aria-valuenow', '40'));
  });

  it('si la subida falla lo dice y no guarda nada', async () => {
    vi.mocked(subirVideoApi).mockRejectedValue(new Error('Se cortó la conexión al subir el video'));
    const onCambiar = pintar();

    elegir();

    expect(await screen.findByRole('alert')).toHaveTextContent(/se cortó la conexión/i);
    expect(onCambiar).not.toHaveBeenCalled();
  });
});

describe('cuando ya hay un video subido', () => {
  it('muestra el archivo en lugar del campo de enlace', () => {
    pintar({ valor: 'r2:cursos/01a0/clase.mp4' });

    expect(screen.getByText(/clase\.mp4/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/url del video/i)).not.toBeInTheDocument();
  });

  it('nombra el proveedor cuando el video no es un archivo nuestro', () => {
    pintar({ valor: 'stream:ea95132c15732412d22c1476fa83f27a' });

    expect(screen.getByText(/cloudflare stream/i)).toBeInTheDocument();
  });

  it('quitarlo deja la parte sin video', () => {
    const onCambiar = pintar({ valor: 'r2:cursos/01a0/clase.mp4' });

    screen.getByRole('button', { name: /quitar/i }).click();

    expect(onCambiar).toHaveBeenCalledWith('');
  });
});
