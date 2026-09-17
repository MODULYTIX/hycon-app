import { Icon } from '@iconify/react';
import Modal from '@/shared/ui/organismos/Modal';
import Boton from '@/shared/ui/atomos/Boton';

interface Props {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  textoConfirmar: string;
  procesando?: boolean;
  error?: string | null;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ID_TITULO = 'titulo-dialogo-confirmacion';

// Confirmacion de acciones destructivas, como eliminar un registro
export default function DialogoConfirmacion({
  abierto,
  titulo,
  descripcion,
  textoConfirmar,
  procesando = false,
  error,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <Modal
      abierto={abierto}
      // Mientras se procesa no se puede cerrar: el resultado debe verse
      onCerrar={procesando ? () => {} : onCancelar}
      idTitulo={ID_TITULO}
      ancho="max-w-[440px]"
    >
      <div className="p-6 sm:p-7">
        <span
          aria-hidden
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"
        >
          <Icon icon="solar:trash-bin-trash-bold" width="24" height="24" />
        </span>

        <h2 id={ID_TITULO} className="pr-8 text-[20px] font-semibold text-hy-tinta">
          {titulo}
        </h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-g-60">{descripcion}</p>

        {error && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[14px] text-red-700"
          >
            <Icon
              icon="solar:danger-circle-bold"
              width="18"
              height="18"
              aria-hidden
              className="mt-px shrink-0"
            />
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Boton variante="secundario" onClick={onCancelar} disabled={procesando}>
            Cancelar
          </Boton>
          <Boton variante="peligro" onClick={onConfirmar} cargando={procesando}>
            {procesando ? 'Eliminando...' : textoConfirmar}
          </Boton>
        </div>
      </div>
    </Modal>
  );
}
