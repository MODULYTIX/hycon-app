import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Editor } from '@tiptap/react';
import EditorTextoEnriquecido from './EditorTextoEnriquecido';

const renderizar = (valor = '') => {
  const onCambiar = vi.fn();
  render(
    <EditorTextoEnriquecido
      id="contenido"
      etiqueta="Contenido"
      valor={valor}
      onCambiar={onCambiar}
      placeholder="Escribe el articulo"
    />
  );
  return onCambiar;
};

const areaDeTexto = () => screen.getByRole('textbox', { name: 'Contenido' });

// Tiptap deja su instancia en el nodo editable: permite colocar el cursor como lo haria el raton
const instancia = async (): Promise<Editor> => {
  await waitFor(() => expect((areaDeTexto() as unknown as { editor?: Editor }).editor).toBeDefined());
  return (areaDeTexto() as unknown as { editor: Editor }).editor;
};

const seleccionarTodo = async () => {
  const editor = await instancia();
  act(() => {
    editor.commands.focus();
    editor.commands.selectAll();
  });
  return editor;
};

const barra = () => screen.getByRole('toolbar', { name: /formato de contenido/i });
const boton = (nombre: string) => within(barra()).getByRole('button', { name: nombre });
const ultimoHtml = (onCambiar: ReturnType<typeof vi.fn>) => onCambiar.mock.calls.at(-1)?.[0] as string;

describe('EditorTextoEnriquecido', () => {
  it('muestra el contenido guardado con su formato', async () => {
    renderizar('<h2>Claves</h2><p>Texto con <strong>negrita</strong></p><ul><li><p>Uno</p></li></ul>');
    await instancia();

    expect(within(areaDeTexto()).getByRole('heading', { name: 'Claves', level: 2 })).toBeInTheDocument();
    expect(areaDeTexto().querySelector('strong')).toHaveTextContent('negrita');
    expect(within(areaDeTexto()).getByRole('listitem')).toHaveTextContent('Uno');
  });

  it('ofrece la barra completa de formato', async () => {
    renderizar();
    await instancia();

    for (const nombre of [
      'Deshacer',
      'Rehacer',
      'Párrafo',
      'Título',
      'Subtítulo',
      'Negrita',
      'Cursiva',
      'Subrayado',
      'Tachado',
      'Viñetas',
      'Lista numerada',
      'Cita',
      'Separador',
      'Enlace',
    ]) {
      expect(boton(nombre)).toBeInTheDocument();
    }
  });

  it.each([
    ['Negrita', '<strong>'],
    ['Cursiva', '<em>'],
    ['Subrayado', '<u>'],
    ['Tachado', '<s>'],
  ])('%s aplica el formato al texto seleccionado', async (nombre, etiqueta) => {
    const usuario = userEvent.setup();
    const onCambiar = renderizar('<p>Hola mundo</p>');
    await seleccionarTodo();

    await usuario.click(boton(nombre));

    expect(ultimoHtml(onCambiar)).toContain(`${etiqueta}Hola mundo`);
    expect(boton(nombre)).toHaveAttribute('aria-pressed', 'true');
  });

  it.each([
    ['Título', '<h2>'],
    ['Subtítulo', '<h3>'],
    ['Viñetas', '<ul>'],
    ['Lista numerada', '<ol>'],
    ['Cita', '<blockquote>'],
  ])('%s convierte el bloque', async (nombre, etiqueta) => {
    const usuario = userEvent.setup();
    const onCambiar = renderizar('<p>Hola mundo</p>');
    await seleccionarTodo();

    await usuario.click(boton(nombre));

    expect(ultimoHtml(onCambiar)).toContain(etiqueta);
  });

  it('inserta un separador', async () => {
    const usuario = userEvent.setup();
    const onCambiar = renderizar('<p>Hola</p>');
    const editor = await instancia();
    act(() => {
      editor.commands.focus('end');
    });

    await usuario.click(boton('Separador'));

    expect(ultimoHtml(onCambiar)).toContain('<hr>');
  });

  it('enlaza el texto seleccionado completando https', async () => {
    const usuario = userEvent.setup();
    const onCambiar = renderizar('<p>Visita Hycon</p>');
    await seleccionarTodo();

    await usuario.click(boton('Enlace'));
    await usuario.type(screen.getByRole('textbox', { name: /direcci[oó]n del enlace/i }), 'hycon.lat');
    await usuario.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(ultimoHtml(onCambiar)).toMatch(/<a [^>]*href="https:\/\/hycon\.lat"[^>]*>Visita Hycon<\/a>/);
    expect(screen.queryByRole('group', { name: /editar enlace/i })).not.toBeInTheDocument();
  });

  it('no acepta enlaces peligrosos', async () => {
    const usuario = userEvent.setup();
    const onCambiar = renderizar('<p>Clic aqui</p>');
    await seleccionarTodo();

    await usuario.click(boton('Enlace'));
    await usuario.type(screen.getByRole('textbox', { name: /direcci[oó]n del enlace/i }), 'javascript:alert(1)');
    await usuario.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/direcci[oó]n web o un correo v[aá]lido/i);
    expect(onCambiar).not.toHaveBeenCalled();
  });

  it('permite quitar un enlace existente', async () => {
    const usuario = userEvent.setup();
    const onCambiar = renderizar('<p><a href="https://hycon.lat">Hycon</a></p>');
    await seleccionarTodo();

    await usuario.click(boton('Enlace'));
    expect(screen.getByRole('textbox', { name: /direcci[oó]n del enlace/i })).toHaveValue('https://hycon.lat');
    await usuario.click(screen.getByRole('button', { name: /quitar enlace/i }));

    expect(ultimoHtml(onCambiar)).not.toContain('<a');
  });

  it('Escape en la barra del enlace no se propaga hacia el modal', async () => {
    const usuario = userEvent.setup();
    const alPulsarEscape = vi.fn();
    document.addEventListener('keydown', alPulsarEscape);
    renderizar('<p>Hola</p>');
    await seleccionarTodo();

    await usuario.click(boton('Enlace'));
    await usuario.keyboard('{Escape}');

    expect(screen.queryByRole('group', { name: /editar enlace/i })).not.toBeInTheDocument();
    expect(alPulsarEscape).not.toHaveBeenCalled();
    document.removeEventListener('keydown', alPulsarEscape);
  });

  it('pulsar la barra no le quita el foco al editor', async () => {
    renderizar('<p>Hola</p>');
    await seleccionarTodo();

    // Si el boton se quedara el foco, lo siguiente que se escribe caeria fuera del editor
    const pulsacion = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    boton('Título').dispatchEvent(pulsacion);

    expect(pulsacion.defaultPrevented).toBe(true);
  });

  it('deshacer queda disponible tras un cambio', async () => {
    const usuario = userEvent.setup();
    renderizar('<p>Hola</p>');
    await seleccionarTodo();

    expect(boton('Deshacer')).toBeDisabled();
    await usuario.click(boton('Negrita'));
    expect(boton('Deshacer')).toBeEnabled();
  });

  it('si se borra todo avisa con una cadena vacia', async () => {
    const onCambiar = renderizar('<p>Hola</p>');
    const editor = await seleccionarTodo();

    act(() => {
      editor.commands.deleteSelection();
    });

    expect(ultimoHtml(onCambiar)).toBe('');
  });
});
