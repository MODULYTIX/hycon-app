import { useEffect, useState, type FormEvent } from 'react';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import CampoTextoLargo from '@/shared/ui/moleculas/CampoTextoLargo';
import SelectorEstado from '@/shared/ui/moleculas/SelectorEstado';
import AlertaFormulario from '@/shared/ui/moleculas/AlertaFormulario';
import PieFormulario from '@/shared/ui/moleculas/PieFormulario';
import ZonaImagen from '@/shared/ui/organismos/ZonaImagen';
import { useImagenFormulario } from '@/shared/hooks/useImagenFormulario';
import { actualizarCursoApi, crearCursoApi } from '@/features/cursos/servicios/cursos.api';
import { validarCurso, type ErroresCurso } from '@/features/cursos/utilidades/validaciones-curso';
import {
  CURSO_VACIO,
  cursoAFormulario,
  type Curso,
  type FormularioCurso as ValoresCurso,
} from '@/features/cursos/tipos/curso.tipos';

type CampoTextual = Exclude<keyof ValoresCurso, 'status'>;

interface Props {
  curso: Curso | null;
  onGuardado: (curso: Curso) => void;
  onCancelar: () => void;
  onCambiosPendientes: (hayCambios: boolean) => void;
}

export default function FormularioCurso({
  curso,
  onGuardado,
  onCancelar,
  onCambiosPendientes,
}: Props) {
  const [inicial] = useState<ValoresCurso>(() => (curso ? cursoAFormulario(curso) : CURSO_VACIO));
  const [valores, setValores] = useState<ValoresCurso>(inicial);
  const [errores, setErrores] = useState<ErroresCurso>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const { imagen, setImagen, cambio: cambioImagen, resolverUrl } = useImagenFormulario(
    curso?.thumbnailUrl ?? ''
  );

  const hayCambios = cambioImagen || JSON.stringify(valores) !== JSON.stringify(inicial);

  useEffect(() => {
    onCambiosPendientes(hayCambios);
  }, [hayCambios, onCambiosPendientes]);

  const enlazar = (campo: CampoTextual) => ({
    id: `curso-${campo}`,
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

    const encontrados = validarCurso({
      ...valores,
      thumbnailUrl: imagen.archivo ? '' : imagen.url,
    });
    setErrores(encontrados);
    setErrorGeneral(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const datos = { ...valores, thumbnailUrl: await resolverUrl() };
      const guardado = curso
        ? await actualizarCursoApi(curso.courseId, datos)
        : await crearCursoApi(datos);
      onGuardado(guardado);
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No se pudo guardar el curso');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={enviar} noValidate>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
        <AlertaFormulario mensaje={errorGeneral} />

        <div className="grid gap-6 md:grid-cols-[300px_minmax(0,1fr)]">
          <ZonaImagen
            etiqueta="Miniatura del curso"
            proporcion="video"
            valor={imagen}
            onCambiar={(nuevo) => {
              setImagen(nuevo);
              setErrores((previo) => ({ ...previo, thumbnailUrl: undefined }));
            }}
            error={errores.thumbnailUrl}
          />

          <div className="space-y-4">
            <CampoTexto
              {...enlazar('name')}
              etiqueta="Nombre"
              placeholder="Pausas activas en oficina"
              maxLength={200}
            />
            <CampoTexto
              {...enlazar('videoUrl')}
              etiqueta="URL del video"
              placeholder="https://www.youtube.com/watch?v=..."
              inputMode="url"
              ayuda="Link de YouTube. Se verá dentro de la web y, si no subes miniatura, se usa la del video."
              opcional
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <CampoTexto
                {...enlazar('durationMinutes')}
                etiqueta="Duración (min)"
                inputMode="numeric"
                placeholder="90"
                opcional
              />
              <CampoTexto
                {...enlazar('price')}
                etiqueta="Precio"
                prefijo="S/"
                inputMode="decimal"
                placeholder="120.00"
              />
              <CampoTexto
                {...enlazar('discountPrice')}
                etiqueta="Precio de oferta"
                prefijo="S/"
                inputMode="decimal"
                placeholder="99.00"
                opcional
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <CampoTextoLargo
            {...enlazar('description')}
            etiqueta="Descripción"
            placeholder="Qué aprenderá el alumno"
            opcional
          />
          <SelectorEstado
            nombre="curso-status"
            valor={valores.status}
            onCambiar={(status) => setValores((previo) => ({ ...previo, status }))}
          />
        </div>
      </div>

      <PieFormulario
        textoGuardar={curso ? 'Guardar cambios' : 'Agregar curso'}
        textoGuardando="Guardando..."
        enviando={enviando}
        onCancelar={onCancelar}
      />
    </form>
  );
}
