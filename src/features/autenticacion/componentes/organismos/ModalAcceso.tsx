import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Modal from '@/shared/ui/organismos/Modal';
import PestanasAcceso, {
  type ModoAcceso,
} from '@/features/autenticacion/componentes/moleculas/PestanasAcceso';
import FormularioLogin from '@/features/autenticacion/componentes/organismos/FormularioLogin';
import FormularioRegistro from '@/features/autenticacion/componentes/organismos/FormularioRegistro';
import FondoAcceso from '@/assets/images/hero-background.webp';
import LogoHycon from '@/assets/images/logo_hycon.webp';

const ID_TITULO = 'titulo-modal-acceso';

const VENTAJAS = [
  { icono: 'solar:box-bold', texto: 'Sigue el estado de tus envios en tiempo real' },
  { icono: 'solar:bag-check-bold', texto: 'Revisa tu historial de compras y pedidos' },
  { icono: 'solar:diploma-bold', texto: 'Accede a tus cursos y certificados' },
];

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

export default function ModalAcceso({ abierto, onCerrar }: Props) {
  const [modo, setModo] = useState<ModoAcceso>('login');

  // Al cerrar el modal se vuelve siempre a la pestana de inicio de sesion
  useEffect(() => {
    if (!abierto) setModo('login');
  }, [abierto]);

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} idTitulo={ID_TITULO}>
      <div className="grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* Panel de marca: se oculta en movil para no comprimir el formulario */}
        <aside className="relative hidden overflow-hidden bg-primary lg:block">
          <img
            src={FondoAcceso}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/85" />

          <div className="relative flex h-full flex-col justify-between gap-8 p-8 text-white">
            <img
              src={LogoHycon}
              alt="Hycon"
              draggable={false}
              width={92}
              className="p-2 outline-2 outline-white"
            />

            <div className="space-y-3">
              <p className="font-BostNoBillsColombo text-4xl leading-tight">
                TU CUENTA HYCON
              </p>
              <p className="text-[15px] text-white/85">
                Un solo acceso para tus envios, tus compras y tus cursos.
              </p>
            </div>

            <ul className="space-y-3">
              {VENTAJAS.map((ventaja) => (
                <li key={ventaja.icono} className="flex items-start gap-2 text-[14px] text-white/90">
                  <Icon
                    icon={ventaja.icono}
                    width="18"
                    height="18"
                    aria-hidden
                    className="mt-[2px] shrink-0 text-secondary"
                  />
                  {ventaja.texto}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Panel del formulario */}
        <div className="p-6 sm:p-8">
          <h2 id={ID_TITULO} className="text-[26px] font-medium text-g-70">
            {modo === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p className="mt-1 mb-4 text-[15px] text-g-50">
            {modo === 'login'
              ? 'Ingresa tus datos para entrar a tu cuenta.'
              : 'Completa el formulario para registrarte en Hycon.'}
          </p>

          <PestanasAcceso modo={modo} onCambiar={setModo} />

          <div key={modo} className="mt-6 animate-fadeIn">
            {modo === 'login' ? (
              <FormularioLogin onExito={() => onCerrar()} />
            ) : (
              <FormularioRegistro onExito={() => onCerrar()} />
            )}
          </div>

          <p className="mt-5 flex items-start gap-2 text-[13px] leading-relaxed text-g-50">
            <Icon
              icon="solar:shield-check-bold"
              width="16"
              height="16"
              aria-hidden
              className="mt-[2px] shrink-0 text-primary"
            />
            Tus datos viajan cifrados y solo se usan para gestionar tu cuenta en Hycon.
          </p>
        </div>
      </div>
    </Modal>
  );
}
