import { useState } from 'react';
import Modal from '@/shared/ui/organismos/Modal';
import CabeceraModal from '@/shared/ui/moleculas/CabeceraModal';
import FormularioPublicacion from '@/features/publicaciones/componentes/organismos/FormularioPublicacion';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

const ID_TITULO = 'titulo-modal-publicacion';

interface Props {
  abierto: boolean;
  publicacion: Publicacion | null;
  onCerrar: () => void;
  onGuardado: (publicacion: Publicacion) => void;
}

export default function ModalPublicacion({ abierto, publicacion, onCerrar, onGuardado }: Props) {
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
      ancho="max-w-[1100px]"
    >
      {(solicitarCierre) => (
        <div className="flex max-h-[calc(100dvh-24px)] flex-col sm:max-h-[92vh]">
          <CabeceraModal
            id={ID_TITULO}
            icono={publicacion ? 'solar:pen-new-square-bold' : 'solar:document-add-bold'}
            titulo={publicacion ? 'Editar publicación' : 'Nueva publicación'}
            descripcion={
              publicacion
                ? `Estás editando "${publicacion.title}".`
                : 'Escribe el artículo y revisa cómo quedará antes de publicarlo.'
            }
          />

          <FormularioPublicacion
            key={publicacion?.postId ?? 'nueva'}
            publicacion={publicacion}
            onCambiosPendientes={setHayCambios}
            onCancelar={solicitarCierre}
            onGuardado={(guardada) => {
              onGuardado(guardada);
              cerrar();
            }}
          />
        </div>
      )}
    </Modal>
  );
}
