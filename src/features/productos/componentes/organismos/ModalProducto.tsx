import Modal from '@/shared/ui/organismos/Modal';
import FormularioProducto from '@/features/administracion/componentes/organismos/FormularioProducto';
import type { Producto } from '@/features/administracion/tipos/catalogo.tipos';

const ID_TITULO = 'titulo-modal-producto';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onCreado: (producto: Producto) => void;
}

export default function ModalProducto({ abierto, onCerrar, onCreado }: Props) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} idTitulo={ID_TITULO}>
      <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <h2 id={ID_TITULO} className="text-[24px] font-medium text-g-80">
          Agregar producto
        </h2>
        <p className="mt-1 mb-5 text-[15px] text-g-50">
          Los campos sin marcar como opcionales son obligatorios.
        </p>

        <FormularioProducto
          onCreado={(producto) => {
            onCreado(producto);
            onCerrar();
          }}
          onCancelar={onCerrar}
        />
      </div>
    </Modal>
  );
}
