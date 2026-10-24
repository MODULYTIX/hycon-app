import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import ReproductorIncrustado from './ReproductorIncrustado';

const URL_FIRMADA = 'https://customer-abc.cloudflarestream.com/token-del-video/iframe';

const marco = () => screen.queryByTitle('Reproductor: Parte 1');
const play = () => screen.getByRole('button');

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ReproductorIncrustado', () => {
  it('no carga el reproductor ajeno hasta que se da al play', () => {
    render(<ReproductorIncrustado url={URL_FIRMADA} titulo="Parte 1" />);

    expect(marco()).not.toBeInTheDocument();
    expect(play()).toBeInTheDocument();
  });

  it('al dar al play muestra el reproductor firmado y arranca solo', () => {
    render(<ReproductorIncrustado url={URL_FIRMADA} titulo="Parte 1" />);

    act(() => play().click());

    expect(marco()).toHaveAttribute('src', `${URL_FIRMADA}?autoplay=true`);
  });

  it('respeta los parametros que ya trae el enlace', () => {
    render(<ReproductorIncrustado url={`${URL_FIRMADA}?poster=foto`} titulo="Parte 1" />);

    act(() => play().click());

    expect(marco()).toHaveAttribute('src', `${URL_FIRMADA}?poster=foto&autoplay=true`);
  });

  it('sin limite el video se queda hasta el final', () => {
    render(<ReproductorIncrustado url={URL_FIRMADA} titulo="Parte 1" />);
    act(() => play().click());

    act(() => vi.advanceTimersByTime(600_000));

    expect(marco()).toBeInTheDocument();
    expect(screen.queryByText(/terminó la vista previa/i)).not.toBeInTheDocument();
  });

  it('con limite corta al cumplirse los segundos y retira el reproductor', () => {
    render(<ReproductorIncrustado url={URL_FIRMADA} titulo="Parte 1" limiteSegundos={60} />);
    act(() => play().click());

    act(() => vi.advanceTimersByTime(59_000));
    expect(screen.queryByText(/terminó la vista previa/i)).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2_000));

    expect(screen.getByText(/terminó la vista previa/i)).toBeInTheDocument();
    expect(marco()).not.toBeInTheDocument();
  });

  // La cuenta no corre mientras el video no se ha abierto
  it('el limite no empieza antes del play', () => {
    render(<ReproductorIncrustado url={URL_FIRMADA} titulo="Parte 1" limiteSegundos={10} />);

    act(() => vi.advanceTimersByTime(60_000));

    expect(screen.queryByText(/terminó la vista previa/i)).not.toBeInTheDocument();
    expect(play()).toBeInTheDocument();
  });

  it('en el aviso ofrece lo que se le pase', () => {
    render(
      <ReproductorIncrustado
        url={URL_FIRMADA}
        titulo="Parte 1"
        limiteSegundos={10}
        alTerminarMuestra={<span>Compra el curso</span>}
      />
    );
    act(() => play().click());

    act(() => vi.advanceTimersByTime(11_000));

    expect(screen.getByText('Compra el curso')).toBeInTheDocument();
  });
});
