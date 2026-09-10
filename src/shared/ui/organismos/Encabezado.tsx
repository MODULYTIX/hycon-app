import HyconLogo from '@/assets/images/logo_hycon.webp';
import { useState } from 'react';
import AccesoCuenta from '@/features/autenticacion/componentes/organismos/AccesoCuenta';

export default function Encabezado() {
  const [active, setActive] = useState<string>('');

  const items = [
    'Quienes Somos',
    '|',
    'Nuestros Servicios',
    '|',
    'Plataforma Asociada',
    '|',
    '¿Por qué Elegimos?',
    '|',
    'Nuestros Clientes',
    // '|',
    // 'Testimonios',
    '|',
    'Contactanos',
  ];

  const idMap: Record<string, string> = {
    'Quienes Somos': 'quienes_somos',
    'Nuestros Servicios': 'servicios',
    'Plataforma Asociada': 'plataforma_asociada',
    '¿Por qué Elegimos?': 'porque_elegirnos',
    'Nuestros Clientes': 'NuestrosClientes',
    Testimonios: 'testimonios',
    Contactanos: 'contactanos',
  };

  const goTo = (key: string) => {
    const id = idMap[key];
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between bg-primary h-[74px] items-center px-4 sm:px-[40px]">
        <div className="outline-2 outline-white shrink-0">
          <img src={HyconLogo} alt="" className="p-2 w-22" draggable="false" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setActive('Contactanos');
              goTo('Contactanos');
            }}
            className="bg-g-70 px-4 sm:px-6 py-2 rounded-full h-fit text-[15px] sm:text-[16px] self-center text-white font-medium whitespace-nowrap"
          >
            Contactanos
          </button>

          <AccesoCuenta />
        </div>
      </div>

      {/* En móvil/tablet: scroll horizontal. En laptop/pc: ancho del contenido */}
      <div className="w-full lg:w-fit overflow-x-auto lg:overflow-visible whitespace-nowrap">
        <nav className="inline-block bg-g-10 text-[17px] px-10 py-2.5 rounded-br-2xl font-medium">
          <ul className="flex gap-0.5">
            {items.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  setActive(item);
                  goTo(item);
                }}
                className={`px-4 cursor-pointer transition-colors ${
                  active === item
                    ? 'text-primary font-bold'
                    : 'text-g-50 font-semibold'
                }`}
              >
                {item}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
