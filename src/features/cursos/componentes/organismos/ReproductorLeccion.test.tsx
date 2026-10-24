import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReproductorLeccion from './ReproductorLeccion';

// Cada reproductor ya tiene sus pruebas: aqui solo importa a quien se llama
vi.mock('@/shared/ui/organismos/ReproductorYoutube', () => ({
  default: ({ id, inicio }: { id: string; inicio: number }) => (
    <div data-testid="youtube" data-id={id} data-inicio={inicio} />
  ),
}));
vi.mock('@/shared/ui/organismos/ReproductorArchivo', () => ({
  default: ({ url }: { url: string }) => <div data-testid="archivo" data-url={url} />,
}));
vi.mock('@/shared/ui/organismos/ReproductorIncrustado', () => ({
  default: ({ url }: { url: string }) => <div data-testid="incrustado" data-url={url} />,
}));

describe('ReproductorLeccion', () => {
  it('un video de YouTube va al reproductor de YouTube', () => {
    render(
      <ReproductorLeccion tipo="youtube" fuente="dQw4w9WgXcQ" titulo="Parte 1" inicio={30} />
    );

    expect(screen.getByTestId('youtube')).toHaveAttribute('data-id', 'dQw4w9WgXcQ');
    expect(screen.getByTestId('youtube')).toHaveAttribute('data-inicio', '30');
  });

  it('un archivo nuestro va al reproductor de archivos', () => {
    render(
      <ReproductorLeccion tipo="archivo" fuente="https://bucket/a.mp4?firma=1" titulo="Parte 1" />
    );

    expect(screen.getByTestId('archivo')).toHaveAttribute(
      'data-url',
      'https://bucket/a.mp4?firma=1'
    );
    expect(screen.queryByTestId('youtube')).not.toBeInTheDocument();
  });

  it('un reproductor del proveedor se muestra incrustado', () => {
    render(
      <ReproductorLeccion tipo="incrustado" fuente="https://stream/token/iframe" titulo="Parte 1" />
    );

    expect(screen.getByTestId('incrustado')).toHaveAttribute(
      'data-url',
      'https://stream/token/iframe'
    );
  });
});
