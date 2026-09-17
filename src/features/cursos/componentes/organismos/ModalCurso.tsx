import { useState } from 'react';
import Modal from '@/shared/ui/organismos/Modal';
import CabeceraModal from '@/shared/ui/moleculas/CabeceraModal';
import FormularioCurso from '@/features/cursos/componentes/organismos/FormularioCurso';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

const ID_TITULO = 'titulo-modal-curso';

interface Props {
  abierto: boolean;
  curso: Curso | null;
  onCerrar: () => void;
  onGuardado: (curso: Curso) => void;
}

export default function ModalCurso({ abierto, curso, onCerrar, onGuardado }: Props) {
  const [hayCambios, setHayCambios] = useState(false);

  const cerrar = () => {
    setHayCambios(false);
    onCerrar();
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={cerrar}
      idTitulo={ID_TITULO}
      protegido={hayCambios}
      ancho="max-w-[920px]"
    >
      {(solicitarCierre) => (
        <div className="flex max-h-[calc(100dvh-24px)] flex-col sm:max-h-[90vh]">
          <CabeceraModal
            id={ID_TITULO}
            icono={curso ? 'solar:pen-new-square-bold' : 'solar:diploma-bold'}
            titulo={curso ? 'Editar curso' : 'Agregar curso'}
            descripcion={
              curso
                ? `Estás editando "${curso.name}".`
                : 'Completa los datos y publícalo en el catálogo.'
            }
          />

          <FormularioCurso
            key={curso?.courseId ?? 'nuevo'}
            curso={curso}
            onCambiosPendientes={setHayCambios}
            onCancelar={solicitarCierre}
            onGuardado={(guardado) => {
              onGuardado(guardado);
              cerrar();
            }}
          />
        </div>
      )}
    </Modal>
  );
}
