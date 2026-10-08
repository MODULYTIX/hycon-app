import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import Modal from '@/shared/ui/organismos/Modal';
import CampoTexto from '@/shared/ui/moleculas/CampoTexto';
import FormularioTarjeta from '@/features/carrito/componentes/organismos/FormularioTarjeta';
import CodigoQr from '@/features/carrito/componentes/moleculas/CodigoQr';
import { crearPedidoApi } from '@/features/pedidos/servicios/pedidos.api';
import {
  codigoYapeValido,
  revisarTarjeta,
  soloDigitos,
  ultimosCuatro,
  type DatosTarjeta,
  type ErroresTarjeta,
} from '@/features/carrito/utilidades/validaciones-pago';
import { formatearPrecio } from '@/shared/utilidades/formato';
import { RUTAS } from '@/app/rutas/rutas';
import type { ItemPedido, MetodoPago, Pedido } from '@/features/pedidos/tipos/pedido.tipos';

const ID_TITULO = 'titulo-modal-pago';
const TELEFONO = '902 665 565';

// Pausa corta antes de confirmar, el tiempo que tarda cualquier autorizacion
const ESPERA_AUTORIZACION = 1400;

const TARJETA_VACIA: DatosTarjeta = { numero: '', titular: '', vencimiento: '', cvv: '' };

const METODOS: Array<{ id: MetodoPago; nombre: string; icono: string; detalle: string }> = [
  { id: 'tarjeta', nombre: 'Tarjeta', icono: 'solar:card-linear', detalle: 'Débito o crédito' },
  { id: 'yape', nombre: 'Yape', icono: 'solar:qr-code-linear', detalle: 'Escanea y aprueba' },
  { id: 'whatsapp', nombre: 'WhatsApp', icono: 'ic:baseline-whatsapp', detalle: 'Coordinar el pago' },
];

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  total: number;
  items: ItemPedido[];
  // Se avisa al carrito para que se vacie cuando la compra queda registrada
  onPagado: (pedido: Pedido) => void;
}

export default function ModalPago({ abierto, onCerrar, total, items, onPagado }: Props) {
  const [metodo, setMetodo] = useState<MetodoPago>('tarjeta');
  const [tarjeta, setTarjeta] = useState<DatosTarjeta>(TARJETA_VACIA);
  const [errores, setErrores] = useState<ErroresTarjeta>({});
  const [codigoYape, setCodigoYape] = useState('');
  const [errorYape, setErrorYape] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [pedido, setPedido] = useState<Pedido | null>(null);

  // Cada vez que se abre, la pantalla empieza limpia
  useEffect(() => {
    if (!abierto) return;
    setMetodo('tarjeta');
    setTarjeta(TARJETA_VACIA);
    setErrores({});
    setCodigoYape('');
    setErrorYape(null);
    setErrorPago(null);
    setPedido(null);
    setProcesando(false);
  }, [abierto]);

  const cambiarTarjeta = (campo: keyof DatosTarjeta, valor: string) => {
    setTarjeta((previo) => ({ ...previo, [campo]: valor }));
    setErrores((previo) => ({ ...previo, [campo]: undefined }));
    setErrorPago(null);
  };

  const registrarCompra = async () => {
    setProcesando(true);
    setErrorPago(null);
    try {
      const [guardado] = await Promise.all([
        crearPedidoApi(metodo, items),
        new Promise((seguir) => setTimeout(seguir, ESPERA_AUTORIZACION)),
      ]);
      setPedido(guardado);
      onPagado(guardado);
    } catch (fallo: unknown) {
      setErrorPago(fallo instanceof Error ? fallo.message : 'No se pudo completar la compra');
    } finally {
      setProcesando(false);
    }
  };

  const pagar = () => {
    if (procesando) return;

    if (metodo === 'tarjeta') {
      const fallos = revisarTarjeta(tarjeta);
      setErrores(fallos);
      if (Object.keys(fallos).length > 0) return;
    }

    if (metodo === 'yape') {
      if (!codigoYapeValido(codigoYape)) {
        setErrorYape('El código de aprobación son 6 dígitos');
        return;
      }
      setErrorYape(null);
    }

    void registrarCompra();
  };

  const mensajeWhatsapp = pedido
    ? `https://wa.me/51902665565?text=${encodeURIComponent(
        `Hola Hycon, acabo de registrar el pedido ${pedido.codigo} por ${formatearPrecio(pedido.total)}.`
      )}`
    : '';

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      idTitulo={ID_TITULO}
      ancho="max-w-[520px]"
      protegido={!pedido && (tarjeta.numero !== '' || codigoYape !== '')}
    >
      {pedido ? (
        <div className="px-6 py-8 text-center sm:px-8">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-hy-10 text-primary">
            <Icon icon="solar:check-circle-bold" width="40" height="40" aria-hidden />
          </span>

          <h2 id={ID_TITULO} className="mt-5 text-[21px] font-semibold text-g-90">
            {pedido.estadoPago === 'pagado' ? 'Pago aprobado' : 'Pedido registrado'}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-g-50">
            {pedido.estadoPago === 'pagado'
              ? 'Te enviaremos la confirmación y el detalle del envío.'
              : 'Coordinamos el pago y el envío por WhatsApp.'}
          </p>

          <dl className="mt-6 divide-y divide-g-20 border-y border-g-20 text-[14px]">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-g-50">Pedido</dt>
              <dd className="font-semibold tabular-nums text-g-90">{pedido.codigo}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-g-50">Total</dt>
              <dd className="font-semibold tabular-nums text-primary">{formatearPrecio(pedido.total)}</dd>
            </div>
            {metodo === 'tarjeta' && (
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-g-50">Tarjeta</dt>
                <dd className="tabular-nums text-g-80">···· {ultimosCuatro(tarjeta.numero)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 flex flex-col gap-2">
            {pedido.estadoPago === 'pendiente' && (
              <a
                href={mensajeWhatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-white transition-colors hover:bg-marca-oscuro"
              >
                <Icon icon="ic:baseline-whatsapp" width="18" height="18" aria-hidden />
                Escribir por WhatsApp
              </a>
            )}
            <Link
              to={RUTAS.historial}
              onClick={onCerrar}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-g-30 text-sm font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
            >
              Ver mis compras
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center gap-3 border-b border-g-20 bg-hy-5/50 px-4 py-4 pr-12 sm:px-6 sm:pr-14">
            <Icon icon="solar:lock-keyhole-minimalistic-bold" width="20" height="20" aria-hidden className="shrink-0 text-primary" />
            <div className="min-w-0">
              <h2 id={ID_TITULO} className="text-[17px] font-semibold text-g-90">
                Pago seguro
              </h2>
              <p className="text-[12.5px] text-g-50">Conexión cifrada de extremo a extremo</p>
            </div>
            <p className="ml-auto shrink-0 text-right">
              <span className="block text-[11px] uppercase tracking-[0.12em] text-g-50">Total</span>
              <span className="text-[19px] font-semibold tabular-nums text-primary">
                {formatearPrecio(total)}
              </span>
            </p>
          </div>

          <div className="px-4 py-5 sm:px-6">
            <fieldset disabled={procesando}>
              <legend className="sr-only">Forma de pago</legend>
              <div className="grid grid-cols-3 gap-2">
                {METODOS.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => setMetodo(opcion.id)}
                    aria-pressed={metodo === opcion.id}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition-colors ${
                      metodo === opcion.id
                        ? 'border-primary bg-hy-5 text-primary ring-1 ring-primary/20'
                        : 'border-g-20 text-g-60 hover:border-g-30'
                    }`}
                  >
                    <Icon icon={opcion.icono} width="22" height="22" aria-hidden />
                    <span className="text-[13px] font-medium">{opcion.nombre}</span>
                    <span className="text-[11px] leading-tight text-g-50">{opcion.detalle}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5">
                {metodo === 'tarjeta' && (
                  <FormularioTarjeta
                    datos={tarjeta}
                    errores={errores}
                    deshabilitado={procesando}
                    onCambiar={cambiarTarjeta}
                  />
                )}

                {metodo === 'yape' && (
                  <div className="flex flex-col items-center gap-4">
                    <CodigoQr texto={`hycon-${total}`} clase="h-40 w-40 rounded-lg ring-1 ring-g-20" />
                    <p className="text-center text-[13.5px] leading-relaxed text-g-60">
                      Escanea el código desde Yape o paga al <strong className="text-g-90">{TELEFONO}</strong> y
                      escribe aquí el código de aprobación.
                    </p>
                    <CampoTexto
                      id="pago-codigo-yape"
                      etiqueta="Código de aprobación"
                      inputMode="numeric"
                      placeholder="000000"
                      maxLength={6}
                      className="w-full"
                      value={codigoYape}
                      error={errorYape ?? undefined}
                      onChange={(evento) => {
                        setCodigoYape(soloDigitos(evento.target.value).slice(0, 6));
                        setErrorYape(null);
                      }}
                    />
                  </div>
                )}

                {metodo === 'whatsapp' && (
                  <div className="rounded-lg bg-g-5 px-5 py-6 text-center">
                    <Icon icon="ic:baseline-whatsapp" width="34" height="34" aria-hidden className="mx-auto text-primary" />
                    <p className="mt-3 text-[13.5px] leading-relaxed text-g-60">
                      Guardamos tu pedido y te escribimos al {TELEFONO} para confirmar el pago y la
                      agencia de envío.
                    </p>
                  </div>
                )}
              </div>
            </fieldset>

            {errorPago && (
              <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
                {errorPago}
              </p>
            )}

            <button
              type="button"
              onClick={pagar}
              disabled={procesando}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[15px] font-medium text-white transition-colors hover:bg-marca-oscuro disabled:opacity-70"
            >
              {procesando ? (
                <>
                  <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Autorizando el pago...
                </>
              ) : metodo === 'whatsapp' ? (
                'Confirmar pedido'
              ) : (
                `Pagar ${formatearPrecio(total)}`
              )}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-g-50">
              <Icon icon="solar:shield-check-linear" width="14" height="14" aria-hidden />
              Tus datos viajan cifrados y no se guardan en la tienda
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
