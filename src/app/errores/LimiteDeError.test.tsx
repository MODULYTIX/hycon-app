import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import LimiteDeError from './LimiteDeError';

// En desarrollo React repite el render para recoger la traza del fallo, asi que
// la pantalla tiene que romperse siempre igual mientras el interruptor este puesto
let fallando = true;

const Pantalla = () => {
  if (fallando) throw new Error('se rompio al dibujar');
  return <p>Contenido de la pantalla</p>;
};

const montar = () =>
  render(
    <MemoryRouter>
      <nav aria-label="Principal">
        <Link to="/otra">Otra pagina</Link>
      </nav>
      <Routes>
        <Route
          path="*"
          element={
            <LimiteDeError>
              <Pantalla />
            </LimiteDeError>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('LimiteDeError', () => {
  beforeEach(() => {
    fallando = true;
    // React escribe el fallo capturado por consola: ensucia la salida de las pruebas
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mientras nada falla no se mete en medio', () => {
    fallando = false;
    montar();

    expect(screen.getByText('Contenido de la pantalla')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // Lo importante: nunca una pagina en blanco
  it('si la pantalla se rompe avisa en su lugar', () => {
    montar();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /algo salió mal/i })).toBeInTheDocument();
  });

  it('lo que esta fuera del limite sigue en pie', () => {
    montar();

    expect(screen.getByRole('navigation', { name: /principal/i })).toBeInTheDocument();
  });

  it('deja rastro del fallo en la consola', () => {
    montar();

    expect(console.error).toHaveBeenCalled();
  });

  it('al volver a intentarlo muestra la pantalla si ya funciona', async () => {
    const usuario = userEvent.setup();
    montar();

    fallando = false;
    await usuario.click(screen.getByRole('button', { name: /volver a intentar/i }));

    expect(screen.getByText('Contenido de la pantalla')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('si al insistir vuelve a fallar sigue avisando, no se cae', async () => {
    const usuario = userEvent.setup();
    montar();

    await usuario.click(screen.getByRole('button', { name: /volver a intentar/i }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('ofrece ir al inicio', () => {
    montar();

    expect(screen.getByRole('link', { name: /ir al inicio/i })).toHaveAttribute('href', '/');
  });

  // Sin esto el aviso se quedaria pegado al cambiar de seccion
  it('al cambiar de pagina lo vuelve a intentar solo', async () => {
    const usuario = userEvent.setup();
    montar();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fallando = false;
    await usuario.click(screen.getByRole('link', { name: /otra pagina/i }));

    expect(screen.getByText('Contenido de la pantalla')).toBeInTheDocument();
  });
});
