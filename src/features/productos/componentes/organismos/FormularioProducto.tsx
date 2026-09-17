import { useEffect, useState, type FormEvent } from 'react';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import CampoTextoLargo from '@/shared/ui/moleculas/CampoTextoLargo';
import SelectorMultiple from '@/shared/ui/moleculas/SelectorMultiple';
import SelectorEstado from '@/shared/ui/moleculas/SelectorEstado';
import AlertaFormulario from '@/shared/ui/moleculas/AlertaFormulario';
import PieFormulario from '@/shared/ui/moleculas/PieFormulario';
import ZonaImagen from '@/shared/ui/organismos/ZonaImagen';
import { useImagenFormulario } from '@/shared/hooks/useImagenFormulario';
import { useAgenciasEnvio } from '@/features/productos/hooks/useAgenciasEnvio';
import {
  actualizarProductoApi,
  crearProductoApi,
} from '@/features/productos/servicios/productos.api';
import {
  validarProducto,
  type ErroresProducto,
} from '@/features/productos/utilidades/validaciones-producto';
import {
  PRODUCTO_VACIO,
  productoAFormulario,
  type FormularioProducto as ValoresProducto,
  type Producto,
} from '@/features/productos/tipos/producto.tipos';

type CampoTextual = Exclude<keyof ValoresProducto, 'shippingAgencies' | 'status'>;

interface Props {
  // Con producto se edita; sin el se crea uno nuevo
  producto: Producto | null;
  onGuardado: (producto: Producto) => void;
  onCancelar: () => void;
  // Avisa al modal si hay algo escrito, para pedir confirmacion antes de cerrar
  onCambiosPendientes: (hayCambios: boolean) => void;
}

export default function FormularioProducto({
  producto,
  onGuardado,
  onCancelar,
  onCambiosPendientes,
}: Props) {
  const [inicial] = useState<ValoresProducto>(() =>
    producto ? productoAFormulario(producto) : PRODUCTO_VACIO
  );
  const [valores, setValores] = useState<ValoresProducto>(inicial);
  const [errores, setErrores] = useState<ErroresProducto>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const { imagen, setImagen, cambio: cambioImagen, resolverUrl } = useImagenFormulario(
    producto?.imageUrl ?? ''
  );
  const agencias = useAgenciasEnvio();

  const hayCambios = cambioImagen || JSON.stringify(valores) !== JSON.stringify(inicial);

  useEffect(() => {
    onCambiosPendientes(hayCambios);
  }, [hayCambios, onCambiosPendientes]);

  const cambiar = (campo: CampoTextual, valor: string) => {
    setValores((previo) => ({ ...previo, [campo]: valor }));
    setErrores((previo) => ({ ...previo, [campo]: undefined }));
  };

  // Atajo para no repetir value, error y onChange en cada campo
  const enlazar = (campo: CampoTextual) => ({
    id: `producto-${campo}`,
    value: valores[campo],
    error: errores[campo],
    onChange: (evento: { target: { value: string } }) => cambiar(campo, evento.target.value),
  });

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (enviando) return;

    // La URL escrita a mano se valida; un archivo elegido ya se valido al soltarlo
    const encontrados = validarProducto({
      ...valores,
      imageUrl: imagen.archivo ? '' : imagen.url,
    });
    setErrores(encontrados);
    setErrorGeneral(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const datos = { ...valores, imageUrl: await resolverUrl() };
      const guardado = producto
        ? await actualizarProductoApi(producto.productId, datos)
        : await crearProductoApi(datos);
      onGuardado(guardado);
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No se pudo guardar el producto');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={enviar} noValidate>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
        <AlertaFormulario mensaje={errorGeneral} />

        <div className="grid gap-6 md:grid-cols-[230px_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[280px] md:max-w-none">
            <ZonaImagen
              etiqueta="Imagen del producto"
              valor={imagen}
              onCambiar={(nuevo) => {
                setImagen(nuevo);
                setErrores((previo) => ({ ...previo, imageUrl: undefined }));
              }}
              error={errores.imageUrl}
            />
          </div>

          <div className="space-y-4">
            <CampoTexto
              {...enlazar('name')}
              etiqueta="Nombre"
              placeholder="Silla ergonómica Pro"
              maxLength={200}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto {...enlazar('brand')} etiqueta="Marca" placeholder="Hycon" opcional />
              <CampoTexto {...enlazar('model')} etiqueta="Modelo" placeholder="SE-200" opcional />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto {...enlazar('color')} etiqueta="Color" placeholder="Negro" opcional />
              <CampoTexto
                {...enlazar('stock')}
                etiqueta="Cantidad"
                inputMode="numeric"
                placeholder="0"
                ayuda="Unidades disponibles"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto
                {...enlazar('price')}
                etiqueta="Precio"
                prefijo="S/"
                inputMode="decimal"
                placeholder="459.90"
              />
              <CampoTexto
                {...enlazar('discountPrice')}
                etiqueta="Precio de oferta"
                prefijo="S/"
                inputMode="decimal"
                placeholder="399.90"
                opcional
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-hy-10 bg-hy-5 p-4 sm:p-5">
          <SelectorMultiple
            leyenda="Envíos por la agencia de su preferencia"
            ayuda="Marca las agencias con las que puedes despachar este producto."
            opciones={agencias.agencias.map((agencia) => ({
              valor: agencia.code,
              etiqueta: agencia.name,
            }))}
            seleccionados={valores.shippingAgencies}
            onCambiar={(seleccionados) =>
              setValores((previo) => ({ ...previo, shippingAgencies: seleccionados }))
            }
            cargando={agencias.cargando}
            error={agencias.error}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <CampoTextoLargo
            {...enlazar('description')}
            etiqueta="Descripción"
            placeholder="Materiales, medidas, garantía..."
            opcional
          />
          <SelectorEstado
            nombre="producto-status"
            valor={valores.status}
            onCambiar={(status) => setValores((previo) => ({ ...previo, status }))}
          />
        </div>
      </div>

      <PieFormulario
        textoGuardar={producto ? 'Guardar cambios' : 'Agregar producto'}
        textoGuardando="Guardando..."
        enviando={enviando}
        onCancelar={onCancelar}
      />
    </form>
  );
}
