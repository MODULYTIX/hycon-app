import { useState } from 'react';
import { Icon } from '@iconify/react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import MensajeCampo from '@/shared/ui/atomos/MensajeCampo';
import { normalizarEnlace } from '@/shared/utilidades/texto-enriquecido';

interface Props {
  id: string;
  etiqueta: string;
  // HTML inicial; el editor es la fuente de verdad mientras esta montado
  valor: string;
  onCambiar: (html: string) => void;
  error?: string;
  ayuda?: string;
  placeholder?: string;
}

interface Boton {
  etiqueta: string;
  atajo?: string;
  icono: string;
  activo?: (editor: Editor) => boolean;
  accion: (editor: Editor) => void;
}

// Los grupos se separan visualmente en la barra
const GRUPOS: Boton[][] = [
  [
    { etiqueta: 'Párrafo', icono: 'material-symbols:format-paragraph', activo: (e) => e.isActive('paragraph'), accion: (e) => e.chain().focus().setParagraph().run() },
    { etiqueta: 'Título', icono: 'material-symbols:format-h2', activo: (e) => e.isActive('heading', { level: 2 }), accion: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
    { etiqueta: 'Subtítulo', icono: 'material-symbols:format-h3', activo: (e) => e.isActive('heading', { level: 3 }), accion: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  ],
  [
    { etiqueta: 'Negrita', atajo: 'Ctrl+B', icono: 'material-symbols:format-bold', activo: (e) => e.isActive('bold'), accion: (e) => e.chain().focus().toggleBold().run() },
    { etiqueta: 'Cursiva', atajo: 'Ctrl+I', icono: 'material-symbols:format-italic', activo: (e) => e.isActive('italic'), accion: (e) => e.chain().focus().toggleItalic().run() },
    { etiqueta: 'Subrayado', atajo: 'Ctrl+U', icono: 'material-symbols:format-underlined', activo: (e) => e.isActive('underline'), accion: (e) => e.chain().focus().toggleUnderline().run() },
    { etiqueta: 'Tachado', icono: 'material-symbols:format-strikethrough', activo: (e) => e.isActive('strike'), accion: (e) => e.chain().focus().toggleStrike().run() },
  ],
  [
    { etiqueta: 'Viñetas', icono: 'material-symbols:format-list-bulleted', activo: (e) => e.isActive('bulletList'), accion: (e) => e.chain().focus().toggleBulletList().run() },
    { etiqueta: 'Lista numerada', icono: 'material-symbols:format-list-numbered', activo: (e) => e.isActive('orderedList'), accion: (e) => e.chain().focus().toggleOrderedList().run() },
    { etiqueta: 'Cita', icono: 'material-symbols:format-quote', activo: (e) => e.isActive('blockquote'), accion: (e) => e.chain().focus().toggleBlockquote().run() },
    { etiqueta: 'Separador', icono: 'material-symbols:horizontal-rule', accion: (e) => e.chain().focus().setHorizontalRule().run() },
  ],
];

const BOTONES = GRUPOS.flat();

const CLASE_BOTON =
  'flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-hy-60 disabled:cursor-not-allowed disabled:opacity-35';

/**
 * Editor visual de articulos: se escribe con formato, como en un procesador de texto,
 * y se entrega HTML. El backend vuelve a limpiar ese HTML al guardarlo.
 */
export default function EditorTextoEnriquecido({
  id,
  etiqueta,
  valor,
  onCambiar,
  error,
  ayuda,
  placeholder,
}: Props) {
  const idEtiqueta = `${id}-etiqueta`;
  const idMensaje = `${id}-mensaje`;
  const [enlaceAbierto, setEnlaceAbierto] = useState(false);
  const [enlace, setEnlace] = useState('');
  const [errorEnlace, setErrorEnlace] = useState<string>();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          protocols: ['http', 'https', 'mailto'],
        },
      }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: valor,
    // Solo se vuelve a pintar la barra cuando cambia lo que ella lee (ver useEditorState)
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        id,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': idEtiqueta,
        ...(error || ayuda ? { 'aria-describedby': idMensaje } : {}),
        ...(error ? { 'aria-invalid': 'true' } : {}),
        class: 'contenido-articulo min-h-[320px] px-4 py-3.5 text-[15px] outline-none',
      },
    },
    onUpdate: ({ editor: actual }) => onCambiar(actual.isEmpty ? '' : actual.getHTML()),
  });

  const estado = useEditorState({
    editor,
    selector: ({ editor: actual }) => ({
      activos: BOTONES.map((boton) => (actual && boton.activo ? boton.activo(actual) : false)),
      enlace: actual?.isActive('link') ?? false,
      puedeDeshacer: actual?.can().undo() ?? false,
      puedeRehacer: actual?.can().redo() ?? false,
    }),
  });

  const abrirEnlace = () => {
    if (!editor) return;
    setEnlace(editor.getAttributes('link').href ?? '');
    setErrorEnlace(undefined);
    setEnlaceAbierto(true);
  };

  const aplicarEnlace = (evento?: { preventDefault(): void }) => {
    evento?.preventDefault();
    if (!editor) return;

    if (!enlace.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setEnlaceAbierto(false);
      return;
    }

    const href = normalizarEnlace(enlace);
    if (!href) {
      setErrorEnlace('Escribe una dirección web o un correo válido');
      return;
    }

    const cadena = editor.chain().focus().extendMarkRange('link');
    // Sin texto seleccionado, se inserta la propia direccion como enlace
    if (editor.state.selection.empty && !editor.isActive('link')) {
      cadena.insertContent({ type: 'text', text: enlace.trim(), marks: [{ type: 'link', attrs: { href } }] }).run();
    } else {
      cadena.setLink({ href }).run();
    }
    setEnlaceAbierto(false);
  };

  const quitarEnlace = () => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    setEnlaceAbierto(false);
  };

  return (
    <div>
      <p id={idEtiqueta} className="mb-1.5 text-[13px] font-semibold text-hy-tinta">
        {etiqueta}
      </p>

      <div
        className={`overflow-clip rounded-lg border bg-white transition-colors focus-within:ring-3 ${
          error
            ? 'border-red-400 focus-within:ring-red-500/15'
            : 'border-hy-20 focus-within:border-hy-60 focus-within:ring-hy-60/15'
        }`}
      >
        <div
          role="toolbar"
          aria-label={`Formato de ${etiqueta.toLowerCase()}`}
          // Pulsar un boton no debe quitarle el foco al editor: asi el cursor y la
          // seleccion siguen donde estaban y se puede seguir escribiendo sin volver a hacer clic
          onMouseDown={(evento) => {
            if ((evento.target as HTMLElement).closest('button')) evento.preventDefault();
          }}
          className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-hy-10 bg-hy-5 px-1.5 py-1.5"
        >
          <button type="button" aria-label="Deshacer" title="Deshacer (Ctrl+Z)" disabled={!estado?.puedeDeshacer} onClick={() => editor?.chain().focus().undo().run()} className={`${CLASE_BOTON} text-g-60 hover:bg-white`}>
            <Icon icon="material-symbols:undo" width="19" height="19" aria-hidden />
          </button>
          <button type="button" aria-label="Rehacer" title="Rehacer (Ctrl+Y)" disabled={!estado?.puedeRehacer} onClick={() => editor?.chain().focus().redo().run()} className={`${CLASE_BOTON} text-g-60 hover:bg-white`}>
            <Icon icon="material-symbols:redo" width="19" height="19" aria-hidden />
          </button>

          {GRUPOS.map((grupo, posicionGrupo) => (
            <div key={posicionGrupo} className="ml-0.5 flex items-center gap-0.5 border-l border-hy-20 pl-1">
              {grupo.map((boton) => {
                const activo = estado?.activos[BOTONES.indexOf(boton)] ?? false;
                return (
                  <button
                    key={boton.etiqueta}
                    type="button"
                    aria-label={boton.etiqueta}
                    title={boton.atajo ? `${boton.etiqueta} (${boton.atajo})` : boton.etiqueta}
                    aria-pressed={boton.activo ? activo : undefined}
                    disabled={!editor}
                    onClick={() => editor && boton.accion(editor)}
                    className={`${CLASE_BOTON} ${activo ? 'bg-hy-60 text-white' : 'text-g-70 hover:bg-white'}`}
                  >
                    <Icon icon={boton.icono} width="19" height="19" aria-hidden />
                  </button>
                );
              })}
            </div>
          ))}

          <div className="ml-0.5 flex items-center border-l border-hy-20 pl-1">
            <button
              type="button"
              aria-label="Enlace"
              title="Enlace"
              aria-pressed={estado?.enlace ?? false}
              aria-expanded={enlaceAbierto}
              disabled={!editor}
              onClick={abrirEnlace}
              className={`${CLASE_BOTON} ${estado?.enlace ? 'bg-hy-60 text-white' : 'text-g-70 hover:bg-white'}`}
            >
              <Icon icon="material-symbols:link" width="19" height="19" aria-hidden />
            </button>
          </div>
        </div>

        {enlaceAbierto && (
          // No es un <form> anidado: el editor ya vive dentro del formulario del articulo
          <div
            role="group"
            aria-label="Editar enlace"
            className="flex flex-wrap items-start gap-2 border-b border-hy-10 bg-white px-3 py-2.5"
          >
            <div className="min-w-[220px] flex-1">
              <input
                autoFocus
                type="text"
                inputMode="url"
                aria-label="Dirección del enlace"
                placeholder="https://hycon.lat o correo@empresa.com"
                value={enlace}
                onChange={(evento) => {
                  setEnlace(evento.target.value);
                  setErrorEnlace(undefined);
                }}
                onKeyDown={(evento) => {
                  if (evento.key === 'Enter') aplicarEnlace(evento);
                  if (evento.key === 'Escape') {
                    // Cierra solo esta barra, no el modal
                    evento.stopPropagation();
                    setEnlaceAbierto(false);
                  }
                }}
                className="h-9 w-full rounded-md border border-hy-20 px-2.5 text-[14px] outline-none focus:border-hy-60"
              />
              {errorEnlace && (
                <p role="alert" className="mt-1 text-[12.5px] text-red-600">
                  {errorEnlace}
                </p>
              )}
            </div>
            <button type="button" onClick={() => aplicarEnlace()} className="h-9 rounded-md bg-hy-60 px-3 text-[13px] font-semibold text-white hover:bg-hy-70">
              Aplicar
            </button>
            {estado?.enlace && (
              <button type="button" onClick={quitarEnlace} className="h-9 rounded-md px-3 text-[13px] font-semibold text-red-600 hover:bg-red-50">
                Quitar enlace
              </button>
            )}
            <button type="button" onClick={() => setEnlaceAbierto(false)} className="h-9 rounded-md px-3 text-[13px] font-semibold text-g-60 hover:bg-hy-5">
              Cancelar
            </button>
          </div>
        )}

        <EditorContent editor={editor} />
      </div>

      <MensajeCampo id={idMensaje} error={error} ayuda={ayuda} />
    </div>
  );
}
