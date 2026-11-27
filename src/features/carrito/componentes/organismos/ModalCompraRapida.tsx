import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import ModalAcceso from '@/features/autenticacion/componentes/organismos/ModalAcceso';
import SelectorCantidad from '@/shared/ui/atomos/SelectorCantidad';
import { useId, useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import { useCarrito } from '@/features/carrito/hooks/useCarrito';
import { agregarAlCarrito, topeDe } from '@/features/carrito/servicios/carrito.almacen';
import Modal from '@/shared/ui/organismos/Modal';
import { formatearPrecio } from '@/shared/utilidades/formato';

interface DatosCompra {
  uuid: string;
  name: string;
  description: string | null;
  price: number;
}
type Articulo = (DatosCompra & { tipo: 'producto'; stock: number; imagen: string | null })
  | (DatosCompra & { tipo: 'curso'; imagen: string | null });

interface Props {
  articulo: Articulo;
  precio: number;
  onCerrar: () => void;
}

export default function ModalCompraRapida(props: Props) {
  const { usuario, cargando } = useAutenticacion();
  if (cargando) return null;
  if (!usuario) {
    // Al iniciar sesión el contexto sustituye el acceso por la selección de compra.
    return <ModalAcceso abierto onCerrar={props.onCerrar} onAutenticado={() => {}} />;
  }
  return <SeleccionCompra {...props} />;
}

function SeleccionCompra({ articulo, precio, onCerrar }: Props) {
  const idTitulo = useId();
  const descripcion = articulo.description?.trim();
  const descuento = precio < articulo.price
    ? Math.round((1 - precio / articulo.price) * 100)
    : 0;
  const navegar = useNavigate();
  const { lineas, quitar } = useCarrito();
  const articulosDistintos = new Set(lineas.map(({ tipo, uuid }) => `${tipo}:${uuid}`)).size;
  const esCurso = articulo.tipo === 'curso';
  const stock = articulo.tipo === 'producto' ? articulo.stock : undefined;
  const enCarrito = lineas.find(linea => linea.tipo === articulo.tipo && linea.uuid === articulo.uuid)?.cantidad ?? 0;
  const disponibles = Math.max(0, topeDe(articulo.tipo, stock) - enCarrito);
  const [seleccion, setSeleccion] = useState(1);
  const cantidad = Math.min(seleccion, disponibles);
  const [error, setError] = useState('');

  const confirmar = (irAlCarrito: boolean) => {
    if (cantidad > 0 && !agregarAlCarrito({ tipo: articulo.tipo, uuid: articulo.uuid, cantidad }, stock)) {
      setError(esCurso ? 'Este curso ya está en tu carrito.' : 'Cambió la cantidad disponible. Revisa tu selección.');
      return;
    }
    onCerrar();
    if (irAlCarrito) navegar(RUTAS.carrito);
  };

  return (
    <Modal abierto onCerrar={onCerrar} idTitulo={idTitulo} ancho="max-w-[768px]" bordesRectos>
      <div className="border-t-[3px] border-primary bg-[#f5f6f4] p-4 sm:p-6">
        <h2 id={idTitulo} className="pr-10 text-xl font-semibold text-g-90 sm:text-2xl">Agregar al carrito</h2>
        <div className="my-4 grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-4 border border-g-20 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-x-5 sm:gap-y-3 sm:p-4">
          <div className="relative grid aspect-square w-full place-items-center overflow-hidden bg-g-5 text-g-50 sm:row-span-2 sm:aspect-[16/10]">
            {articulo.imagen
              ? <img src={articulo.imagen} alt="" className="absolute inset-0 size-full object-cover object-center" />
              : <Icon icon={esCurso ? "solar:diploma-linear" : "solar:box-linear"} width="32" aria-hidden />}
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div className="min-w-0">
              <p className="break-words font-semibold leading-tight text-g-90 sm:text-lg">{articulo.name}</p>
              {descripcion && <p className="mt-1.5 line-clamp-2 break-words text-sm leading-snug text-g-60">{descripcion}</p>}
              {!esCurso && <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {disponibles > 0 && (
                  <span className="font-medium text-marca-oscuro">
                    {disponibles} {disponibles === 1 ? 'unidad disponible' : 'unidades disponibles'}{enCarrito > 0 ? ' para agregar' : ''}
                  </span>
                )}
                {enCarrito > 0 && <span className="text-g-60">En el carrito: {enCarrito}</span>}
              </div>}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 bg-g-5 px-3 py-2 text-right sm:max-w-44">
              {descuento > 0 && (
                <span className="bg-[#bd9d5c] px-2 py-1 text-xs font-semibold text-g-90">
                  <span className="sr-only">Descuento </span>−{descuento}%
                </span>
              )}
              <div>
                {precio < articulo.price && <del className="block text-xs text-g-60">{formatearPrecio(articulo.price)}</del>}
                <p className="font-semibold tabular-nums text-[#806023]">{formatearPrecio(precio)}</p>
                <p className="text-xs text-g-60">{esCurso ? 'por acceso' : 'por unidad'}</p>
              </div>
            </div>
          </div>
          <div className="col-span-2 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 border-t border-g-20 pt-3 sm:col-span-1 sm:col-start-2">
            {esCurso ? (
              <>
                {enCarrito > 0 && <p className="mr-auto text-sm text-g-60">Este curso ya está en tu carrito.</p>}
                <button type="button" onClick={() => {
                  if (enCarrito > 0) quitar(articulo.uuid);
                  onCerrar();
                }} aria-label={enCarrito > 0 ? 'Eliminar curso del carrito' : 'Eliminar la selección'}
                  className="min-h-8 cursor-pointer text-sm text-g-60 underline underline-offset-4 hover:text-g-90">
                  Eliminar
                </button>
              </>
            ) : disponibles > 0 ? (
              <>
                <div role="group" aria-label="Cantidad" className="flex flex-wrap items-center justify-end gap-2">
                  <span className="text-sm font-medium text-g-80">Cantidad</span>
                  <SelectorCantidad cantidad={cantidad} maximo={disponibles} onCambiar={setSeleccion} />
                  <button type="button" onClick={onCerrar} aria-label="Eliminar la selección"
                    className="min-h-8 cursor-pointer text-sm text-g-60 underline underline-offset-4 hover:text-g-90">
                    Eliminar
                  </button>
                </div>
                {cantidad > 1 && (
                  <div className="flex items-baseline gap-2 sm:order-first sm:mr-auto" role="status">
                    <span className="text-xs text-g-60">Subtotal</span>
                    <strong className="text-lg font-semibold tabular-nums text-g-90">{formatearPrecio(precio * cantidad)}</strong>
                  </div>
                )}
              </>
            ) : <p className="text-sm text-g-60">Ya tienes en el carrito el máximo disponible de este articulo.</p>}
          </div>
        </div>
        {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <button type="button" onClick={() => confirmar(false)}
            className="min-h-11 w-full cursor-pointer border border-g-30 bg-white px-4 text-sm font-medium text-g-90 hover:bg-g-5">
            Seguir comprando
          </button>
          <button type="button" onClick={() => confirmar(true)}
            className="min-h-11 w-full cursor-pointer bg-marca-oscuro px-4 text-sm font-medium text-white hover:bg-primary">
            Ver mi carrito ({articulosDistintos})
          </button>
        </div>
      </div>
    </Modal>
  );
}
