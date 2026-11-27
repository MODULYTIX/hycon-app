import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import LaminaPrograma from './LaminaPrograma';
import type { Certificado, ParteProgreso } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

const certificado: Certificado = {
  codigo: 'HY-ABCD1234',
  nombre: 'Ana Quispe Flores',
  curso: 'Mejora continua en operaciones',
  duracionMinutos: 150,
  emitidoEl: '2026-11-04T12:00:00.000Z',
};

const parte = (posicion: number, titulo: string): ParteProgreso => ({
  uuid: `0000000${posicion}-0000-4000-8000-000000000001`,
  titulo,
  posicion,
  vista: true,
});

const PARTES = [
  parte(1, 'Que es la mejora continua'),
  parte(2, 'El ciclo PDCA paso a paso'),
  parte(3, 'Indicadores y seguimiento'),
];

const hoja = () => within(screen.getByRole('article', { name: /programa del curso/i }));

describe('LaminaPrograma', () => {
  it('encabeza con el programa y el nombre del curso', () => {
    render(<LaminaPrograma certificado={certificado} partes={PARTES} />);

    expect(hoja().getByRole('heading', { level: 1 })).toHaveTextContent(/programa del curso/i);
    expect(hoja().getAllByText('Mejora continua en operaciones').length).toBeGreaterThan(0);
  });

  it('lista todas las partes del curso', () => {
    render(<LaminaPrograma certificado={certificado} partes={PARTES} />);

    const temas = hoja().getAllByRole('listitem');
    expect(temas).toHaveLength(3);
    expect(temas[0]).toHaveTextContent('Que es la mejora continua');
    expect(temas[2]).toHaveTextContent('Indicadores y seguimiento');
  });

  // El backend puede devolverlas en cualquier orden: manda la posicion
  it('las ordena por su posicion, no por como lleguen', () => {
    render(
      <LaminaPrograma certificado={certificado} partes={[PARTES[2], PARTES[0], PARTES[1]]} />
    );

    const temas = hoja().getAllByRole('listitem');
    expect(temas[0]).toHaveTextContent('Que es la mejora continua');
    expect(temas[1]).toHaveTextContent('El ciclo PDCA paso a paso');
    expect(temas[2]).toHaveTextContent('Indicadores y seguimiento');
  });

  it('al pie identifica de quien es y con que codigo', () => {
    render(<LaminaPrograma certificado={certificado} partes={PARTES} />);

    expect(hoja().getByText('Ana Quispe Flores')).toBeInTheDocument();
    expect(hoja().getByText(/HY-ABCD1234/)).toBeInTheDocument();
    expect(hoja().getByText(/04\/11\/2026/)).toBeInTheDocument();
  });

  it('dice la duracion total cuando se conoce', () => {
    render(<LaminaPrograma certificado={certificado} partes={PARTES} />);

    expect(hoja().getByText(/duración total: 2 h 30 min/i)).toBeInTheDocument();
  });

  it('sin duracion no inventa ninguna', () => {
    render(
      <LaminaPrograma certificado={{ ...certificado, duracionMinutos: null }} partes={PARTES} />
    );

    expect(hoja().queryByText(/duración total/i)).not.toBeInTheDocument();
  });

  // Un curso sin temario desglosado no puede dejar la hoja muda
  it('sin partes lo explica en vez de quedarse vacia', () => {
    render(<LaminaPrograma certificado={certificado} partes={[]} />);

    expect(hoja().getByText(/no tiene el temario desglosado/i)).toBeInTheDocument();
    expect(hoja().queryAllByRole('listitem')).toHaveLength(0);
  });
});
