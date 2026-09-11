import { useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import CampoFormulario from '@/shared/ui/moleculas/CampoFormulario';
import CampoArea from '@/shared/ui/moleculas/CampoArea';
import CampoSeleccion from '@/shared/ui/moleculas/CampoSeleccion';
import Cargador from '@/shared/ui/atomos/Cargador';
import AlertaFormulario from '@/features/autenticacion/componentes/atomos/AlertaFormulario';
import { crearCursoApi } from '@/features/administracion/servicios/catalogo.api';
import {
  sinErroresCatalogo,
  validarCurso,
  type ErroresCurso,
} from '@/features/administracion/utilidades/validaciones-catalogo';
import {
  CURSO_VACIO,
  type Curso,
  type FormularioCurso as DatosCurso,
} from '@/features/administracion/tipos/catalogo.tipos';

const ESTADOS = [
  { valor: 'active', etiqueta: 'Activo' },
  { valor: 'inactive', etiqueta: 'Inactivo' },
];

export default function FormularioCurso({
  onCreado,
  onCancelar,
}: {
  onCreado: (curso: Curso) => void;
  onCancelar: () => void;
}) {
  const [valores, setValores] = useState<DatosCurso>(CURSO_VACIO);
  const [errores, setErrores] = useState<ErroresCurso>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo: keyof DatosCurso, valor: string) => {
    setValores((previo) => ({ ...previo, [campo]: valor }));
    setErrores((previo) => ({ ...previo, [campo]: undefined }));
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (enviando) return;

    const encontrados = validarCurso(valores);
    setErrores(encontrados);
    setErrorGeneral(null);

    if (!sinErroresCatalogo(encontrados)) return;

    setEnviando(true);
    try {
      const curso = await crearCursoApi(valores);
      onCreado(curso);
      setValores(CURSO_VACIO);
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No se pudo crear el curso');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={enviar} noValidate>
      <AlertaFormulario mensaje={errorGeneral} />

      <CampoFormulario
        id="curso-name"
        etiqueta="Nombre"
        placeholder="Logistica de ultima milla"
        value={valores.name}
        error={errores.name}
        onChange={(evento) => cambiar('name', evento.target.value)}
      />

      <CampoArea
        id="curso-description"
        etiqueta="Descripcion (opcional)"
        placeholder="De que trata el curso"
        value={valores.description}
        onChange={(evento) => cambiar('description', evento.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario
          id="curso-videoUrl"
          etiqueta="URL del video (opcional)"
          placeholder="https://youtu.be/abc123"
          value={valores.videoUrl}
          error={errores.videoUrl}
          onChange={(evento) => cambiar('videoUrl', evento.target.value)}
        />
        <CampoFormulario
          id="curso-thumbnailUrl"
          etiqueta="URL de la miniatura (opcional)"
          placeholder="https://cdn.hycon.lat/curso.webp"
          value={valores.thumbnailUrl}
          error={errores.thumbnailUrl}
          onChange={(evento) => cambiar('thumbnailUrl', evento.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <CampoFormulario
          id="curso-durationMinutes"
          etiqueta="Duracion (min)"
          inputMode="numeric"
          placeholder="90"
          value={valores.durationMinutes}
          error={errores.durationMinutes}
          onChange={(evento) => cambiar('durationMinutes', evento.target.value)}
        />
        <CampoFormulario
          id="curso-price"
          etiqueta="Precio (S/)"
          inputMode="decimal"
          placeholder="120.00"
          value={valores.price}
          error={errores.price}
          onChange={(evento) => cambiar('price', evento.target.value)}
        />
        <CampoFormulario
          id="curso-discountPrice"
          etiqueta="Precio oferta (opcional)"
          inputMode="decimal"
          placeholder="99.00"
          value={valores.discountPrice}
          error={errores.discountPrice}
          onChange={(evento) => cambiar('discountPrice', evento.target.value)}
        />
        <CampoSeleccion
          id="curso-status"
          etiqueta="Estado"
          opciones={ESTADOS}
          value={valores.status}
          onChange={(evento) => cambiar('status', evento.target.value)}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancelar}
          disabled={enviando}
          className="rounded-lg border border-g-30 px-6 py-2.5 font-semibold text-g-60 transition-colors hover:bg-g-5 disabled:opacity-70"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={enviando}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {enviando ? (
            <>
              <Cargador etiqueta="Guardando curso" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <span>Agregar curso</span>
              <Icon icon="solar:add-circle-bold" width="18" height="18" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
