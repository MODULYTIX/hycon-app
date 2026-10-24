import { describe, expect, it, vi } from 'vitest';
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
