import { useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import CampoFormulario from '@/shared/ui/moleculas/CampoFormulario';
import CampoArea from '@/shared/ui/moleculas/CampoArea';
import CampoSeleccion from '@/shared/ui/moleculas/CampoSeleccion';
import Cargador from '@/shared/ui/atomos/Cargador';
import AlertaFormulario from '@/features/autenticacion/componentes/atomos/AlertaFormulario';
import { crearProductoApi } from '@/features/administracion/servicios/catalogo.api';
import {
  sinErroresCatalogo,
  validarProducto,
  type ErroresProducto,
} from '@/features/administracion/utilidades/validaciones-catalogo';
import {
  PRODUCTO_VACIO,
  type FormularioProducto as DatosProducto,
  type Producto,
} from '@/features/administracion/tipos/catalogo.tipos';

const ESTADOS = [
  { valor: 'active', etiqueta: 'Activo' },
  { valor: 'inactive', etiqueta: 'Inactivo' },
];

export default function FormularioProducto({
  onCreado,
  onCancelar,
}: {
  onCreado: (producto: Producto) => void;
  onCancelar: () => void;
}) {
  const [valores, setValores] = useState<DatosProducto>(PRODUCTO_VACIO);
  const [errores, setErrores] = useState<ErroresProducto>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo: keyof DatosProducto, valor: string) => {
    setValores((previo) => ({ ...previo, [campo]: valor }));
    setErrores((previo) => ({ ...previo, [campo]: undefined }));
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (enviando) return;

    const encontrados = validarProducto(valores);
    setErrores(encontrados);
    setErrorGeneral(null);

    if (!sinErroresCatalogo(encontrados)) return;

    setEnviando(true);
    try {
      const producto = await crearProductoApi(valores);
      onCreado(producto);
      setValores(PRODUCTO_VACIO);
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No se pudo crear el producto');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={enviar} noValidate>
      <AlertaFormulario mensaje={errorGeneral} />

      <CampoFormulario
        id="producto-name"
        etiqueta="Nombre"
        placeholder="Caja de carton 40x40"
        value={valores.name}
        error={errores.name}
        onChange={(evento) => cambiar('name', evento.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario
          id="producto-brand"
          etiqueta="Marca (opcional)"
          placeholder="Hycon"
          value={valores.brand}
          onChange={(evento) => cambiar('brand', evento.target.value)}
        />
        <CampoFormulario
          id="producto-model"
          etiqueta="Modelo (opcional)"
          placeholder="C-40"
          value={valores.model}
          onChange={(evento) => cambiar('model', evento.target.value)}
        />
      </div>

      <CampoArea
        id="producto-description"
        etiqueta="Descripcion (opcional)"
        placeholder="Detalle del producto"
        value={valores.description}
        onChange={(evento) => cambiar('description', evento.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <CampoFormulario
          id="producto-price"
          etiqueta="Precio (S/)"
          inputMode="decimal"
          placeholder="25.90"
          value={valores.price}
          error={errores.price}
          onChange={(evento) => cambiar('price', evento.target.value)}
        />
        <CampoFormulario
          id="producto-discountPrice"
          etiqueta="Precio oferta (opcional)"
          inputMode="decimal"
          placeholder="19.90"
          value={valores.discountPrice}
          error={errores.discountPrice}
          onChange={(evento) => cambiar('discountPrice', evento.target.value)}
        />
        <CampoFormulario
          id="producto-stock"
          etiqueta="Stock"
          inputMode="numeric"
          placeholder="0"
          value={valores.stock}
          error={errores.stock}
          onChange={(evento) => cambiar('stock', evento.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
        <CampoFormulario
          id="producto-imageUrl"
          etiqueta="URL de la imagen (opcional)"
          placeholder="https://cdn.hycon.lat/caja.webp"
          value={valores.imageUrl}
          error={errores.imageUrl}
          onChange={(evento) => cambiar('imageUrl', evento.target.value)}
        />
        <CampoSeleccion
          id="producto-status"
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
              <Cargador etiqueta="Guardando producto" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <span>Agregar producto</span>
              <Icon icon="solar:add-circle-bold" width="18" height="18" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
