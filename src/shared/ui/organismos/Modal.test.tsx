import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

const fondo = () => screen.getByRole('dialog').parentElement as HTMLElement;

const renderizar = (protegido: boolean, onCerrar = vi.fn()) => {
  render(
    <Modal abierto onCerrar={onCerrar} idTitulo="titulo" protegido={protegido}>
      {(solicitarCierre) => (
        <>
          <h2 id="titulo">Formulario</h2>
          <input aria-label="Nombre" />
          <button type="button" onClick={solicitarCierre}>
            Cancelar
          </button>
        </>
      )}
    </Modal>
  );
  return onCerrar;
};

describe('Modal', () => {
  it('sin cambios se cierra directamente al pulsar fuera', () => {
    const onCerrar = renderizar(false);

    fireEvent.mouseDown(fondo());

    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('con cambios, pulsar fuera pide confirmacion y no cierra', () => {
    const onCerrar = renderizar(true);

    fireEvent.mouseDown(fondo());

    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog', { name: /cambios sin guardar/i })).toBeInTheDocument();
  });

  it('seguir editando mantiene el modal abierto', async () => {
    const usuario = userEvent.setup();
    const onCerrar = renderizar(true);

    fireEvent.mouseDown(fondo());
    await usuario.click(screen.getByRole('button', { name: /seguir editando/i }));

    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('descartar cierra el modal', async () => {
    const usuario = userEvent.setup();
    const onCerrar = renderizar(true);

    fireEvent.mouseDown(fondo());
    await usuario.click(screen.getByRole('button', { name: /descartar y salir/i }));

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('el boton X, Escape y el Cancelar del contenido pasan por la misma proteccion', async () => {
    const usuario = userEvent.setup();
    const onCerrar = renderizar(true);

    await usuario.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    // Con la confirmacion abierta, Escape vuelve al formulario
    await usuario.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    await usuario.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: /seguir editando/i }));

    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('arrastrar desde dentro hasta fuera no cuenta como clic fuera', () => {
    const onCerrar = renderizar(false);

    fireEvent.mouseDown(screen.getByLabelText('Nombre'));

    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('escribir no le quita el foco al campo aunque el padre se vuelva a pintar', async () => {
    const usuario = userEvent.setup();
    const { rerender } = render(
      <Modal abierto onCerrar={() => {}} idTitulo="t">
        <input aria-label="Nombre" />
      </Modal>
    );

    await usuario.click(screen.getByLabelText('Nombre'));
    // Nueva funcion onCerrar en cada render, como pasa con una flecha en linea
    rerender(
      <Modal abierto onCerrar={() => {}} idTitulo="t" protegido>
        <input aria-label="Nombre" />
      </Modal>
    );

    expect(screen.getByLabelText('Nombre')).toHaveFocus();
  });
});
