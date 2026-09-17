import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { createEvent, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ZonaImagen, { type ValorImagen } from './ZonaImagen';

const png = () => new File([new Uint8Array(1200)], 'silla.png', { type: 'image/png' });

// Envoltorio con estado real para ver como reacciona el componente a sus propios cambios
const Prueba = ({ inicial, alCambiar }: { inicial: ValorImagen; alCambiar: (v: ValorImagen) => void }) => {
  const [valor, setValor] = useState(inicial);
  return (
    <ZonaImagen
      etiqueta="Imagen del producto"
      valor={valor}
      onCambiar={(nuevo) => {
        setValor(nuevo);
        alCambiar(nuevo);
      }}
    />
  );
};

const renderizar = (inicial: ValorImagen = { archivo: null, url: '' }) => {
  const alCambiar = vi.fn();
  render(<Prueba inicial={inicial} alCambiar={alCambiar} />);
  return alCambiar;
};

const zona = () => screen.getByRole('group', { name: /imagen del producto/i });

const soltar = (archivos: File[]) => {
  const evento = createEvent.drop(zona());
  Object.defineProperty(evento, 'dataTransfer', { value: { files: archivos } });
  fireEvent(zona(), evento);
};

describe('ZonaImagen', () => {
  it('invita a arrastrar o elegir cuando no hay imagen', () => {
    renderizar();

    expect(within(zona()).getByText(/arrastra una imagen aqu[ií]/i)).toBeInTheDocument();
  });

  it('acepta una imagen soltada encima', () => {
    const alCambiar = renderizar();
    const archivo = png();

    soltar([archivo]);

    expect(alCambiar).toHaveBeenCalledWith({ archivo, url: '' });
    expect(screen.getByText(/silla\.png/)).toBeInTheDocument();
  });

  it('cambia el aspecto mientras se arrastra encima', () => {
    renderizar();

    fireEvent.dragEnter(zona());

    expect(zona()).toHaveAttribute('data-arrastrando', 'true');
    expect(screen.getByText(/suelta la imagen aqu[ií]/i)).toBeInTheDocument();
  });

  it('rechaza un archivo que no es imagen sin cambiar el valor', () => {
    const alCambiar = renderizar();

    soltar([new File(['%PDF'], 'factura.pdf', { type: 'application/pdf' })]);

    expect(alCambiar).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/formato no permitido/i);
  });

  it('tambien se puede elegir con el selector de archivos', async () => {
    const usuario = userEvent.setup();
    const alCambiar = renderizar();
    const archivo = png();

    await usuario.upload(screen.getByLabelText(/elegir archivo/i), archivo);

    expect(alCambiar).toHaveBeenCalledWith({ archivo, url: '' });
  });

  it('permite pegar una URL en lugar de subir un archivo', async () => {
    const usuario = userEvent.setup();
    const alCambiar = renderizar();

    await usuario.click(screen.getByRole('button', { name: /usar una url/i }));
    await usuario.type(screen.getByLabelText(/url de la imagen/i), 'https://cdn.hycon.lat/a.webp');

    expect(alCambiar).toHaveBeenLastCalledWith({ archivo: null, url: 'https://cdn.hycon.lat/a.webp' });
    expect(screen.getByAltText('Vista previa')).toHaveAttribute('src', 'https://cdn.hycon.lat/a.webp');
  });

  it('muestra la imagen que ya tenia el registro y deja quitarla', async () => {
    const usuario = userEvent.setup();
    const alCambiar = renderizar({ archivo: null, url: 'https://cdn.hycon.lat/actual.webp' });

    expect(screen.getByAltText('Vista previa')).toHaveAttribute(
      'src',
      'https://cdn.hycon.lat/actual.webp'
    );

    await usuario.click(screen.getByRole('button', { name: /quitar imagen/i }));

    expect(alCambiar).toHaveBeenCalledWith({ archivo: null, url: '' });
    expect(screen.queryByAltText('Vista previa')).not.toBeInTheDocument();
  });
});
