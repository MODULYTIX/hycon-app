import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaginaVerificarCertificado from './PaginaVerificarCertificado';
import * as api from '@/features/aprendizaje/servicios/aprendizaje.api';
import type { Certificado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

vi.mock('@/features/aprendizaje/servicios/aprendizaje.api');

const certificado: Certificado = {
  codigo: 'HY-ABCD1234',
  nombre: 'Ana Quispe Flores',
  curso: 'Mejora continua en operaciones',
  duracionMinutos: 150,
  emitidoEl: '2026-11-04T12:00:00.000Z',
};

const abrir = (codigo = 'HY-ABCD1234') =>
  render(
    <MemoryRouter initialEntries={[`/certificados/${codigo}`]}>
      <Routes>
        <Route path="/certificados/:codigo" element={<PaginaVerificarCertificado />} />
      </Routes>
    </MemoryRouter>
  );

describe('PaginaVerificarCertificado', () => {
  beforeEach(() => {
    vi.mocked(api.verificarCertificadoApi).mockResolvedValue(certificado);
  });

  it('consulta el codigo que viene en la direccion', async () => {
    abrir('HY-ZZZZ9999');
    await screen.findByRole('heading', { level: 1 });

    expect(api.verificarCertificadoApi).toHaveBeenCalledWith('HY-ZZZZ9999', expect.any(AbortSignal));
  });

  // Lo que busca quien escanea: saber si el titulo es de verdad
  it('dice que el certificado es valido y de quien es', async () => {
    abrir();

    expect(await screen.findByText(/certificado válido/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ana Quispe Flores');
    expect(screen.getAllByText(/mejora continua en operaciones/i).length).toBeGreaterThan(0);
  });

  it('muestra la duracion, la fecha y el codigo', async () => {
    abrir();
    await screen.findByText(/certificado válido/i);

    expect(screen.getByText('2 h 30 min')).toBeInTheDocument();
    expect(screen.getByText('04/11/2026')).toBeInTheDocument();
    expect(screen.getByText('HY-ABCD1234')).toBeInTheDocument();
  });

  it('un codigo que no existe se explica sin dejar la pagina muda', async () => {
    vi.mocked(api.verificarCertificadoApi).mockRejectedValue(
      new Error('No encontramos ningun certificado con ese codigo')
    );
    abrir('HY-00000000');

    expect(await screen.findByRole('alert')).toHaveTextContent(/no encontramos ningun certificado/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/no encontramos/i);
    // Se repite el codigo consultado, por si lo copiaron mal
    expect(screen.getByText('HY-00000000')).toBeInTheDocument();
  });

  // No hace falta cuenta: quien escanea el papel no es cliente de Hycon
  it('no pide sesion para nada', async () => {
    abrir();
    await screen.findByText(/certificado válido/i);

    expect(screen.queryByText(/iniciar sesión/i)).not.toBeInTheDocument();
  });

  it('sin duracion no inventa ninguna', async () => {
    vi.mocked(api.verificarCertificadoApi).mockResolvedValue({
      ...certificado,
      duracionMinutos: null,
    });
    abrir();
    await screen.findByText(/certificado válido/i);

    expect(screen.queryByText(/duración/i)).not.toBeInTheDocument();
  });
});
