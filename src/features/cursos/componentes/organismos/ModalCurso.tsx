import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Modal from '@/shared/ui/organismos/Modal';
import CabeceraModal from '@/shared/ui/moleculas/CabeceraModal';
import FormularioCurso from '@/features/cursos/componentes/organismos/FormularioCurso';
import GestorTemario from '@/features/cursos/componentes/organismos/GestorTemario';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

const ID_TITULO = 'titulo-modal-curso';

type Pestana = 'datos' | 'contenido';

interface Props {
  abierto: boolean;
  curso: Curso | null;
  onCerrar: () => void;
  onGuardado: (curso: Curso) => void;
}

export default function ModalCurso({ abierto, curso, onCerrar, onGuardado }: Props) {
  const [hayCambios, setHayCambios] = useState(false);
  const [pestana, setPestana] = useState<Pestana>('datos');
  // Tras guardar uno nuevo se sigue trabajando sobre el curso ya creado
  const [guardado, setGuardado] = useState<Curso | null>(null);

  const enEdicion = curso ?? guardado;

  useEffect(() => {
    if (!abierto) return;
    setPestana('datos');
    setGuardado(null);
  }, [abierto, curso]);

  const cerrar = () => {
    setHayCambios(false);
    onCerrar();
  };

  const PESTANAS: Array<{ id: Pestana; etiqueta: string; icono: string }> = [
    { id: 'datos', etiqueta: 'Datos del curso', icono: 'solar:document-text-linear' },
    { id: 'contenido', etiqueta: 'Contenido', icono: 'solar:playlist-2-linear' },
  ];

  return (
    <Modal
      abierto={abierto}
      onCerrar={cerrar}
      idTitulo={ID_TITULO}
      protegido={hayCambios}
      ancho="max-w-[920px]"
    >
      {(solicitarCierre) => (
        <div className="modal-formulario flex min-h-0 max-h-[calc(100dvh-24px)] flex-col sm:max-h-[min(90dvh,calc(100dvh-32px))]">
          <CabeceraModal
            id={ID_TITULO}
            icono={enEdicion ? 'solar:pen-new-square-bold' : 'solar:diploma-bold'}
            titulo={curso ? 'Editar curso' : 'Agregar curso'}
            descripcion={
              enEdicion
                ? `Estás editando "${enEdicion.name}".`
                : 'Completa los datos y publícalo en el catálogo.'
            }
          />

          <div role="tablist" aria-label="Secciones del curso" className="flex gap-1 border-b border-hy-10 px-5 sm:px-6">
            {PESTANAS.map((opcion) => {
              const activa = pestana === opcion.id;
              // Las partes se agregan sobre un curso que ya existe
              const bloqueada = opcion.id === 'contenido' && !enEdicion;

              return (
                <button
                  key={opcion.id}
                  type="button"
                  role="tab"
                  aria-selected={activa}
                  disabled={bloqueada}
                  title={bloqueada ? 'Guarda el curso para agregarle contenido' : undefined}
                  onClick={() => setPestana(opcion.id)}
                  className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                    activa
                      ? 'border-hy-60 text-hy-70'
                      : 'border-transparent text-g-50 hover:text-hy-70'
                  } disabled:cursor-not-allowed disabled:text-g-30 disabled:hover:text-g-30`}
                >
                  <Icon icon={opcion.icono} width="16" height="16" aria-hidden />
                  {opcion.etiqueta}
                </button>
              );
            })}
          </div>

          {pestana === 'datos' ? (
            <FormularioCurso
              key={enEdicion?.uuid ?? 'nuevo'}
              curso={enEdicion}
              onCambiosPendientes={setHayCambios}
              onCancelar={solicitarCierre}
              onGuardado={(recienGuardado) => {
                onGuardado(recienGuardado);
                setHayCambios(false);
                // Al crear no se cierra: se pasa a Contenido para agregar las partes
                if (curso) {
                  cerrar();
                  return;
                }
                setGuardado(recienGuardado);
                setPestana('contenido');
              }}
            />
          ) : (
            <>
              <GestorTemario curso={enEdicion} />
              <div className="flex justify-end border-t border-hy-10 px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={cerrar}
                  className="inline-flex h-10 items-center rounded-lg bg-hy-60 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-hy-70"
                >
                  Listo
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
