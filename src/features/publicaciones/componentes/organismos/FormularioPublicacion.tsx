import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import CampoTextoLargo from '@/shared/ui/moleculas/CampoTextoLargo';
import SelectorEstado from '@/shared/ui/moleculas/SelectorEstado';
import AlertaFormulario from '@/shared/ui/moleculas/AlertaFormulario';
import PieFormulario from '@/shared/ui/moleculas/PieFormulario';
import ZonaImagen from '@/shared/ui/organismos/ZonaImagen';
import EditorTextoEnriquecido from '@/shared/ui/organismos/EditorTextoEnriquecido';
import VistaPreviaArticulo from '@/features/publicaciones/componentes/organismos/VistaPreviaArticulo';
import { useImagenFormulario } from '@/shared/hooks/useImagenFormulario';
import { useUrlTemporal } from '@/shared/hooks/useUrlTemporal';
import {
  actualizarPublicacionApi,
  crearPublicacionApi,
} from '@/features/publicaciones/servicios/publicaciones.api';
import {
  MAXIMO_RESUMEN,
  validarPublicacion,
  type ErroresPublicacion,
} from '@/features/publicaciones/utilidades/validaciones-publicacion';
import { contarPalabras, minutosDeLectura } from '@/features/publicaciones/utilidades/lectura';
import {
  publicacionAFormulario,
  publicacionVacia,
  type FormularioPublicacion as ValoresPublicacion,
  type Publicacion,
} from '@/features/publicaciones/tipos/publicacion.tipos';

type CampoTextual = Exclude<keyof ValoresPublicacion, 'status'>;
type Pestana = 'escribir' | 'vista-previa';

const ESTADOS = [
  { valor: 'active' as const, etiqueta: 'Publicado', detalle: 'Visible en la web' },
  { valor: 'inactive' as const, etiqueta: 'Borrador', detalle: 'Solo en el panel' },
];

interface Props {
  publicacion: Publicacion | null;
  onGuardado: (publicacion: Publicacion) => void;
  onCancelar: () => void;
  onCambiosPendientes: (hayCambios: boolean) => void;
}

export default function FormularioPublicacion({
  publicacion,
  onGuardado,
  onCancelar,
  onCambiosPendientes,
}: Props) {
  const [inicial] = useState<ValoresPublicacion>(() =>
    publicacion ? publicacionAFormulario(publicacion) : publicacionVacia()
  );
  const [valores, setValores] = useState<ValoresPublicacion>(inicial);
  const [errores, setErrores] = useState<ErroresPublicacion>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pestana, setPestana] = useState<Pestana>('escribir');

  const { imagen, setImagen, cambio: cambioImagen, resolverUrl } = useImagenFormulario(
    publicacion?.coverUrl ?? ''
  );
  const portadaLocal = useUrlTemporal(imagen.archivo);

  const hayCambios = cambioImagen || JSON.stringify(valores) !== JSON.stringify(inicial);

  useEffect(() => {
    onCambiosPendientes(hayCambios);
  }, [hayCambios, onCambiosPendientes]);

  const enlazar = (campo: CampoTextual) => ({
    id: `publicacion-${campo}`,
    value: valores[campo],
    error: errores[campo],
    onChange: (evento: { target: { value: string } }) => {
      setValores((previo) => ({ ...previo, [campo]: evento.target.value }));
      setErrores((previo) => ({ ...previo, [campo]: undefined }));
    },
  });

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (enviando) return;

    const encontrados = validarPublicacion({
      ...valores,
      coverUrl: imagen.archivo ? '' : imagen.url,
    });
    setErrores(encontrados);
    setErrorGeneral(null);
    if (Object.keys(encontrados).length > 0) {
      // Los errores estan en la pestana de escritura: se vuelve a ella para verlos
      setPestana('escribir');
      return;
    }

    setEnviando(true);
    try {
      const datos = { ...valores, coverUrl: await resolverUrl() };
      const guardada = publicacion
        ? await actualizarPublicacionApi(publicacion.postId, datos)
        : await crearPublicacionApi(datos);
      onGuardado(guardada);
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No se pudo guardar la publicación');
    } finally {
      setEnviando(false);
    }
  };

  const palabras = contarPalabras(valores.content);
  const caracteresResumen = valores.excerpt.trim().length;

  const clasePestana = (activa: boolean) =>
    `flex h-9 items-center gap-1.5 rounded-md px-3.5 text-[13.5px] font-semibold transition-colors ${
      activa ? 'bg-white text-hy-80 shadow-sm' : 'text-g-50 hover:text-hy-80'
    }`;

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={enviar} noValidate>
      <div className="flex items-center justify-between gap-3 border-b border-hy-10 px-5 py-2.5 sm:px-7">
        <div role="tablist" aria-label="Modo del editor" className="flex gap-1 rounded-lg bg-hy-5 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={pestana === 'escribir'}
            onClick={() => setPestana('escribir')}
            className={clasePestana(pestana === 'escribir')}
          >
            <Icon icon="solar:pen-new-round-linear" width="16" height="16" aria-hidden />
            Escribir
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pestana === 'vista-previa'}
            onClick={() => setPestana('vista-previa')}
            className={clasePestana(pestana === 'vista-previa')}
          >
            <Icon icon="solar:eye-linear" width="16" height="16" aria-hidden />
            Vista previa
          </button>
        </div>

        <p className="hidden text-[12.5px] text-g-50 sm:block">
          {palabras} {palabras === 1 ? 'palabra' : 'palabras'} · {minutosDeLectura(valores.content)} min de lectura
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
        <AlertaFormulario mensaje={errorGeneral} />

        {pestana === 'vista-previa' ? (
          <VistaPreviaArticulo
            titulo={valores.title}
            resumen={valores.excerpt}
            contenido={valores.content}
            fecha={valores.publishedAt}
            portada={portadaLocal ?? (imagen.url.trim() || null)}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-5">
              <CampoTexto
                {...enlazar('title')}
                etiqueta="Título"
                placeholder="Pausas activas: 5 ejercicios para la oficina"
                maxLength={200}
                className="[&_input]:text-[17px] [&_input]:font-medium"
              />

              <CampoTextoLargo
                {...enlazar('excerpt')}
                etiqueta="Resumen"
                rows={2}
                maxLength={MAXIMO_RESUMEN}
                placeholder="Una o dos frases que inviten a leer el artículo"
                ayuda={`Se muestra en las tarjetas del listado · ${caracteresResumen}/${MAXIMO_RESUMEN}`}
                opcional
              />

              <EditorTextoEnriquecido
                id="publicacion-content"
                etiqueta="Contenido"
                // Se monta con el HTML inicial; desde ahi el editor es quien manda
                valor={valores.content}
                onCambiar={(html) => {
                  setValores((previo) => ({ ...previo, content: html }));
                  setErrores((previo) => ({ ...previo, content: undefined }));
                }}
                error={errores.content}
                placeholder="Escribe el artículo aquí. Usa la barra para títulos, negritas, viñetas y enlaces."
              />
            </div>

            <aside className="space-y-5">
              <ZonaImagen
                etiqueta="Portada"
                proporcion="video"
                valor={imagen}
                onCambiar={(nuevo) => {
                  setImagen(nuevo);
                  setErrores((previo) => ({ ...previo, coverUrl: undefined }));
                }}
                error={errores.coverUrl}
              />

              <CampoTexto {...enlazar('publishedAt')} etiqueta="Fecha de publicación" type="date" />

              <SelectorEstado
                nombre="publicacion-status"
                valor={valores.status}
                opciones={ESTADOS}
                onCambiar={(status) => setValores((previo) => ({ ...previo, status }))}
              />
            </aside>
          </div>
        )}
      </div>

      <PieFormulario
        textoGuardar={publicacion ? 'Guardar cambios' : 'Crear publicación'}
        textoGuardando="Guardando..."
        enviando={enviando}
        onCancelar={onCancelar}
      />
    </form>
  );
}
