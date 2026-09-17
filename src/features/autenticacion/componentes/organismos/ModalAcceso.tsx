import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Modal from '@/shared/ui/organismos/Modal';
import PestanasAcceso, {
  type ModoAcceso,
} from '@/features/autenticacion/componentes/moleculas/PestanasAcceso';
import FormularioLogin from '@/features/autenticacion/componentes/organismos/FormularioLogin';
import FormularioRegistro from '@/features/autenticacion/componentes/organismos/FormularioRegistro';
import LogoHycon from '@/assets/images/logo_hycon.webp';

const ID_TITULO = 'titulo-modal-acceso';

const VENTAJAS = [
  { icono: 'solar:box-linear', texto: 'Sigue tus envíos en tiempo real' },
  { icono: 'solar:bag-check-linear', texto: 'Tu historial de compras en un lugar' },
  { icono: 'solar:diploma-linear', texto: 'Tus cursos y certificados' },
];

// Lo que protege la cuenta, contado sin tecnicismos
const PROTECCIONES = [
  { icono: 'solar:lock-keyhole-minimalistic-linear', texto: 'Conexión cifrada y contraseñas protegidas con bcrypt' },
  { icono: 'solar:shield-warning-linear', texto: 'Bloqueo automático ante intentos sospechosos' },
  { icono: 'solar:history-linear', texto: 'Registro de cada acceso a tu cuenta' },
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

  const esLogin = modo === 'login';

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} idTitulo={ID_TITULO} ancho="max-w-[940px]">
      {/* tema-panel: dentro del modal el color principal es el del logo */}
      <div className="tema-panel grid max-h-[calc(100dvh-24px)] overflow-y-auto lg:max-h-none lg:grid-cols-[360px_minmax(0,1fr)] lg:overflow-visible">
        <aside className="hidden flex-col justify-between gap-10 bg-marca p-9 text-encabezado-texto lg:flex">
          <div>
            <img src={LogoHycon} alt="Hycon" draggable={false} width={96} className="p-2 outline-2 outline-white" />

            <p className="mt-10 font-BostNoBillsColombo text-[40px] leading-[1.05]">TU CUENTA HYCON</p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/80">
              Un solo acceso para tus envíos, tus compras y tus cursos.
            </p>

            <ul className="mt-8 space-y-3.5">
              {VENTAJAS.map((ventaja) => (
                <li key={ventaja.texto} className="flex items-center gap-3 text-[14.5px]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/12">
                    <Icon icon={ventaja.icono} width="19" height="19" aria-hidden />
                  </span>
                  {ventaja.texto}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-marca-oscuro/60 p-4">
            <p className="flex items-center gap-2 text-[13px] font-semibold">
              <Icon icon="solar:shield-check-bold" width="17" height="17" aria-hidden />
              Tu cuenta está protegida
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {PROTECCIONES.map((proteccion) => (
                <li key={proteccion.texto} className="flex items-start gap-2 text-[12.5px] leading-snug text-white/80">
                  <Icon icon={proteccion.icono} width="14" height="14" aria-hidden className="mt-0.5 shrink-0" />
                  {proteccion.texto}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="px-5 pb-6 pt-7 sm:px-10 sm:pb-9 sm:pt-10">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-marca">
            <Icon icon="solar:shield-keyhole-minimalistic-bold" width="15" height="15" aria-hidden />
            Acceso seguro
          </p>
          <h2 id={ID_TITULO} className="mt-2 pr-8 text-[26px] font-semibold leading-tight text-g-90 sm:text-[28px]">
            {esLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p className="mb-6 mt-1 text-[15px] text-g-50">
            {esLogin ? 'Ingresa con tu correo y tu contraseña.' : 'Solo te tomará un minuto.'}
          </p>

          <PestanasAcceso modo={modo} onCambiar={setModo} />

          <div key={modo} className="mt-6 animate-fadeIn">
            {esLogin ? <FormularioLogin onExito={() => onCerrar()} /> : <FormularioRegistro onExito={() => onCerrar()} />}
          </div>

          <p className="mt-6 border-t border-g-20 pt-4 text-center text-[12.5px] text-g-50">
            {esLogin ? '¿Aún no tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              type="button"
              onClick={() => setModo(esLogin ? 'registro' : 'login')}
              className="font-semibold text-marca hover:underline"
            >
              {esLogin ? 'Créala aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
}
