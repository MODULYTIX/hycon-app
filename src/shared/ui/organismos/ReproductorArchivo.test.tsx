import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ReproductorArchivo from './ReproductorArchivo';

const URL_FIRMADA = 'https://bucket.r2.cloudflarestorage.com/hycon/cursos/a.mp4?X-Amz-Signature=abc';

const video = () => screen.getByLabelText('Reproductor: Parte 1') as HTMLVideoElement;

// jsdom no reproduce nada: se coloca el segundo y se avisa como lo haria el navegador
const avanzarA = (segundos: number) => {
  const elemento = video();
  elemento.pause = vi.fn();
  Object.defineProperty(elemento, 'currentTime', {
    value: segundos,
    writable: true,
    configurable: true,
  });
  fireEvent.timeUpdate(elemento);
  return elemento;
};

describe('ReproductorArchivo', () => {
  it('reproduce el enlace firmado que dio el backend', () => {
    render(<ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" />);

    expect(video()).toHaveAttribute('src', URL_FIRMADA);
  });

  // Sin esto el navegador ofrece "guardar video" en sus propios controles
  it('quita la descarga de los controles del navegador', () => {
    render(<ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" />);

    expect(video()).toHaveAttribute('controlsList', expect.stringContaining('nodownload'));
    expect(video()).toHaveAttribute('disablePictureInPicture');
  });

  it('sin limite deja ver el video entero', () => {
    render(<ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" />);

    avanzarA(500);

    expect(screen.queryByText(/terminó la vista previa/i)).not.toBeInTheDocument();
  });

  it('antes del limite no corta', () => {
    render(<ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" limiteSegundos={60} />);

    avanzarA(45);

    expect(screen.queryByText(/terminó la vista previa/i)).not.toBeInTheDocument();
  });

  it('al llegar al limite pausa y avisa', () => {
    render(<ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" limiteSegundos={60} />);

    const elemento = avanzarA(61);

    expect(elemento.pause).toHaveBeenCalled();
    expect(screen.getByText(/terminó la vista previa/i)).toBeInTheDocument();
  });

  it('en el aviso ofrece lo que se le pase', () => {
    render(
      <ReproductorArchivo
        url={URL_FIRMADA}
        titulo="Parte 1"
        limiteSegundos={10}
        alTerminarMuestra={<button type="button">Agregar al carrito</button>}
      />
    );

    avanzarA(11);

    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeInTheDocument();
  });

  it('al cambiar de parte vuelve a empezar', () => {
    const { rerender } = render(
      <ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" limiteSegundos={10} />
    );
    avanzarA(11);
    expect(screen.getByText(/terminó la vista previa/i)).toBeInTheDocument();

    rerender(
      <ReproductorArchivo url={`${URL_FIRMADA}-2`} titulo="Parte 1" limiteSegundos={10} />
    );

    expect(screen.queryByText(/terminó la vista previa/i)).not.toBeInTheDocument();
  });
});

describe('aviso al llegar al final', () => {
  const avanzarConDuracion = (segundo: number, duracion: number) => {
    const elemento = video();
    elemento.pause = vi.fn();
    Object.defineProperty(elemento, 'duration', { value: duracion, configurable: true });
    Object.defineProperty(elemento, 'currentTime', {
      value: segundo,
      writable: true,
      configurable: true,
    });
    fireEvent.timeUpdate(elemento);
  };

  it('avisa en los ultimos cinco segundos', () => {
    const alLlegarAlFinal = vi.fn();
    render(<ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" alLlegarAlFinal={alLlegarAlFinal} />);

    avanzarConDuracion(100, 600);
    expect(alLlegarAlFinal).not.toHaveBeenCalled();

    avanzarConDuracion(596, 600);
    expect(alLlegarAlFinal).toHaveBeenCalledTimes(1);
  });

  // Da igual como llego hasta ahi: saltar tambien cuenta
  it('tambien avisa si el usuario salta hasta el final', () => {
    const alLlegarAlFinal = vi.fn();
    render(<ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" alLlegarAlFinal={alLlegarAlFinal} />);

    avanzarConDuracion(599, 600);

    expect(alLlegarAlFinal).toHaveBeenCalledTimes(1);
  });

  it('no avisa dos veces por el mismo video', () => {
    const alLlegarAlFinal = vi.fn();
    render(<ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" alLlegarAlFinal={alLlegarAlFinal} />);

    avanzarConDuracion(596, 600);
    avanzarConDuracion(598, 600);
    avanzarConDuracion(600, 600);

    expect(alLlegarAlFinal).toHaveBeenCalledTimes(1);
  });

  // En una muestra el final no cuenta: esa parte no se ha visto entera
  it('en una muestra recortada no avisa', () => {
    const alLlegarAlFinal = vi.fn();
    render(
      <ReproductorArchivo
        url={URL_FIRMADA}
        titulo="Parte 1"
        limiteSegundos={5}
        alLlegarAlFinal={alLlegarAlFinal}
      />
    );

    avanzarConDuracion(599, 600);

    expect(alLlegarAlFinal).not.toHaveBeenCalled();
  });

  it('al cambiar de parte vuelve a poder avisar', () => {
    const alLlegarAlFinal = vi.fn();
    const { rerender } = render(
      <ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" alLlegarAlFinal={alLlegarAlFinal} />
    );
    avanzarConDuracion(596, 600);

    rerender(
      <ReproductorArchivo url={`${URL_FIRMADA}-2`} titulo="Parte 1" alLlegarAlFinal={alLlegarAlFinal} />
    );
    avanzarConDuracion(596, 600);

    expect(alLlegarAlFinal).toHaveBeenCalledTimes(2);
  });
});

describe('arranque automatico', () => {
  // jsdom no reproduce: se vigila la llamada que haria arrancar el video
  const reproducir = vi.fn();

  beforeEach(() => {
    reproducir.mockReset();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(reproducir);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sin pedirlo espera a que pulsen play', () => {
    render(<ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" />);

    expect(reproducir).not.toHaveBeenCalled();
  });

  it('al pasar solo a la siguiente parte el video arranca', () => {
    render(<ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" autoReproducir />);

    expect(reproducir).toHaveBeenCalledTimes(1);
  });

  // Los navegadores pueden negar el arranque: entonces se queda en pausa, sin fallar
  it('si el navegador lo rechaza el reproductor sigue en pie', () => {
    reproducir.mockReturnValue(Promise.reject(new Error('bloqueado')));

    expect(() =>
      render(<ReproductorArchivo url={URL_FIRMADA} titulo="Parte 1" autoReproducir />)
    ).not.toThrow();
    expect(video()).toHaveAttribute('src', URL_FIRMADA);
  });
});
