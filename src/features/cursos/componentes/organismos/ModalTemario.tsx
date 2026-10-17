import Modal from '@/shared/ui/organismos/Modal';
import CabeceraModal from '@/shared/ui/moleculas/CabeceraModal';
import GestorTemario from '@/features/cursos/componentes/organismos/GestorTemario';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

const ID_TITULO = 'titulo-modal-temario';

interface Props {
  abierto: boolean;
  curso: Curso | null;
  onCerrar: () => void;
}

/** El contenido del curso desde el listado del panel. */
export default function ModalTemario({ abierto, curso, onCerrar }: Props) {
  if (!curso) return null;

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} idTitulo={ID_TITULO} ancho="max-w-[820px]">
      <div className="flex max-h-[calc(100dvh-24px)] flex-col sm:max-h-[90vh]">
        <CabeceraModal
          id={ID_TITULO}
          icono="solar:playlist-2-bold"
          titulo="Contenido del curso"
          descripcion={`Partes de "${curso.name}". Solo la marcada como muestra se ve sin comprar.`}
        />

        <GestorTemario curso={curso} />
      </div>
    </Modal>
  );
}
