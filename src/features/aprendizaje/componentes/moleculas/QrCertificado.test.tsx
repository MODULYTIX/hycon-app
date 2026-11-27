import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import QrCertificado from './QrCertificado';
import { enlaceDeVerificacion } from '@/features/aprendizaje/utilidades/verificacion';

describe('enlaceDeVerificacion', () => {
  // Nada de dominios escritos a mano: el QR apunta donde este publicada la web
  it('usa el sitio donde corre la aplicacion', () => {
    expect(enlaceDeVerificacion('HY-ABCD1234')).toBe(
      `${window.location.origin}/certificados/HY-ABCD1234`
    );
  });

  it('escapa lo que no vale en una direccion', () => {
    expect(enlaceDeVerificacion('HY ABCD/1234')).toContain('HY%20ABCD%2F1234');
  });
});

describe('QrCertificado', () => {
  it('dibuja un codigo de verdad, no un adorno', () => {
    const { container } = render(<QrCertificado codigo="HY-ABCD1234" />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Un QR real tiene decenas de modulos; un patron decorativo no los calcula
    expect(svg?.querySelectorAll('path').length).toBeGreaterThan(0);
    expect(svg?.getAttribute('viewBox')).toMatch(/^0 0 \d+ \d+$/);
  });

  // El de antes dibujaba un patron a partir de un hash y no se podia escanear
  it('dos certificados distintos dan codigos distintos', () => {
    const { container: uno } = render(<QrCertificado codigo="HY-ABCD1234" />);
    const { container: otro } = render(<QrCertificado codigo="HY-9999ZZZZ" />);

    const modulos = (raiz: HTMLElement) =>
      [...raiz.querySelectorAll('path')].at(-1)?.getAttribute('d');

    expect(modulos(uno)).not.toBe(modulos(otro));
  });

  it('dice para que sirve a quien no puede verlo', () => {
    render(<QrCertificado codigo="HY-ABCD1234" />);

    expect(screen.getByTitle(/verificar el certificado HY-ABCD1234/i)).toBeInTheDocument();
  });

  it('se puede pedir mas grande o mas pequeno', () => {
    const { container } = render(<QrCertificado codigo="HY-ABCD1234" lado={120} />);

    expect(container.querySelector('svg')).toHaveAttribute('height', '120');
  });
});
