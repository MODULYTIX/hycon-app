import { useState } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DialogoErgo } from './ErgoUI';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});

describe('cierre protegido del editor', () => {
  it('restaura el desplazamiento al descartar desde la confirmación', async () => {
    function Ejemplo() {
      const [abierto, setAbierto] = useState(true);
      return abierto ? <DialogoErgo titulo="Ficha" sucio onCerrar={() => setAbierto(false)}>
        {cerrar => <button onClick={cerrar}>Cerrar ficha</button>}
      </DialogoErgo> : <p>Ficha cerrada</p>;
    }
    const previo = document.body.style.overflow;
    const user = userEvent.setup();
    render(<Ejemplo />);
    expect(document.body.style.overflow).toBe('hidden');
    await user.click(screen.getByRole('button', { name: 'Cerrar ficha' }));
    expect(screen.getByRole('dialog', { name: 'Cambios sin guardar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Descartar y salir' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Ficha cerrada')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe(previo);
  });
});
