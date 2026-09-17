import { useState } from 'react';
import Modal from '@/shared/ui/organismos/Modal';
import CabeceraModal from '@/shared/ui/moleculas/CabeceraModal';
import FormularioProducto from '@/features/productos/componentes/organismos/FormularioProducto';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

const ID_TITULO = 'titulo-modal-producto';

interface Props {
  abierto: boolean;
  // null para crear, un producto para editarlo
  producto: Producto | null;
  onCerrar: () => void;
  onGuardado: (producto: Producto) => void;
}

export default function ModalProducto({ abierto, producto, onCerrar, onGuardado }: Props) {
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
            icono={producto ? 'solar:pen-new-square-bold' : 'solar:box-bold'}
            titulo={producto ? 'Editar producto' : 'Agregar producto'}
            descripcion={
              producto
                ? `Estás editando "${producto.name}".`
                : 'Completa los datos y publícalo en el catálogo.'
            }
          />

          <FormularioProducto
            // Una clave por registro reinicia el formulario al pasar de un producto a otro
            key={producto?.productId ?? 'nuevo'}
            producto={producto}
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
