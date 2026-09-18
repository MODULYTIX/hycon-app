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

// Como se protege la cuenta, en una linea al pie y sin tecnicismos
const PROTECCIONES = [
  { icono: 'solar:lock-keyhole-minimalistic-linear', texto: 'Conexión cifrada' },
  { icono: 'solar:shield-warning-linear', texto: 'Bloqueo tras 5 intentos' },
  { icono: 'solar:history-linear', texto: 'Registro de accesos' },
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
    // Una sola columna centrada: el formulario manda y se ve igual en movil que en escritorio
    <Modal abierto={abierto} onCerrar={onCerrar} idTitulo={ID_TITULO} ancho="max-w-[660px]">
      {/* tema-panel: dentro del modal el color principal es el del logo */}
      <div className="tema-panel max-h-[calc(100dvh-24px)] overflow-y-auto px-6 pb-7 pt-9 sm:px-14 sm:pb-9 sm:pt-11">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-marca">
            <img src={LogoHycon} alt="Hycon" draggable={false} width={44} />
          </span>

          <h2 id={ID_TITULO} className="mt-5 text-[25px] font-semibold leading-tight text-g-90">
            {esLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p className="mt-1.5 max-w-[420px] text-[14.5px] leading-relaxed text-g-50">
            {esLogin
              ? 'Entra para ver tus envíos, tus compras y tus cursos.'
              : 'Una sola cuenta para tus envíos, tus compras y tus cursos.'}
          </p>
        </div>

        <div className="mt-7">
          <PestanasAcceso modo={modo} onCambiar={setModo} />
        </div>

        <div key={modo} className="mt-6 animate-fadeIn">
          {esLogin ? <FormularioLogin onExito={() => onCerrar()} /> : <FormularioRegistro onExito={() => onCerrar()} />}
        </div>

        <p className="mt-6 text-center text-[13px] text-g-50">
          {esLogin ? '¿Aún no tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            type="button"
            onClick={() => setModo(esLogin ? 'registro' : 'login')}
            className="font-semibold text-marca hover:underline"
          >
            {esLogin ? 'Créala aquí' : 'Inicia sesión'}
          </button>
        </p>

        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-g-20 pt-4">
          {PROTECCIONES.map((proteccion) => (
            <li key={proteccion.texto} className="flex items-center gap-1.5 text-[11.5px] text-g-40">
              <Icon icon={proteccion.icono} width="14" height="14" aria-hidden className="text-marca" />
              {proteccion.texto}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
