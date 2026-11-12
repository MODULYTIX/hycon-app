import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import LaminaCertificado from './LaminaCertificado';
import type { Certificado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

const certificado = (cambios: Partial<Certificado> = {}): Certificado => ({
  codigo: 'HY-ABCD1234',
  nombre: 'Ana Quispe Flores',
  curso: 'Mejora continua en operaciones',
  duracionMinutos: 150,
  emitidoEl: '2026-11-04T12:00:00.000Z',
  ...cambios,
});

const lamina = () => within(screen.getByRole('article', { name: /certificado/i }));

describe('LaminaCertificado', () => {
  // Lo que pidio el usuario: el titulo dice solo "Certificado"
  it('se titula solo Certificado', () => {
    render(<LaminaCertificado certificado={certificado()} />);

    expect(lamina().getByRole('heading', { level: 1 })).toHaveTextContent(/^Certificado$/);
  });

  it('lleva el nombre, el curso, la fecha y el codigo', () => {
    render(<LaminaCertificado certificado={certificado()} />);

    expect(lamina().getByText('Ana Quispe Flores')).toBeInTheDocument();
    expect(lamina().getByText('Mejora continua en operaciones')).toBeInTheDocument();
    expect(lamina().getByText(/04\/11\/2026/)).toBeInTheDocument();
    expect(lamina().getByText('HY-ABCD1234')).toBeInTheDocument();
  });

  it('dice la duracion del curso cuando se conoce', () => {
    render(<LaminaCertificado certificado={certificado()} />);

    expect(lamina().getByText(/duración/i)).toBeInTheDocument();
  });

  it('sin duracion no inventa ninguna', () => {
    render(<LaminaCertificado certificado={certificado({ duracionMinutos: null })} />);

    expect(lamina().queryByText(/duración/i)).not.toBeInTheDocument();
  });

  it('deja claro quien lo emite', () => {
    render(<LaminaCertificado certificado={certificado()} />);

    expect(lamina().getByText(/formación en ergonomía/i)).toBeInTheDocument();
  });
});
