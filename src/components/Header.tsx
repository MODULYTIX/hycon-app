import HyconLogo from '../assets/images/logo_hycon.webp';
import { useState } from 'react';

export default function Header() {
  const [active, setActive] = useState<string>('');

  const items = [
    'Quienes Somos',
    'Nuestros Servicios',
    'Plataforma Asociada',
    '¿Por qué Elegimos?',
    'Nuestros Clientes',
    'Testimonios',
    'Contactanos',
  ];

  const idMap: Record<string, string> = {
    'Quienes Somos': 'quienes_somos',
    'Nuestros Servicios': 'servicios',
    'Plataforma Asociada': 'plataforma_asociada',
    '¿Por qué Elegimos?': 'porque_elegirnos',
    'Nuestros Clientes': 'clientes',
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
      <div className="flex justify-between bg-primary h-[64px] items-center px-[40px]">
        <div className="outline-2 outline-white">
          <img src={HyconLogo} alt="" className="p-2 w-22" draggable="false" />
        </div>
        <button
          onClick={() => {
            setActive('Contactanos');
            goTo('Contactanos');
          }}
          className="bg-g-70 px-3 py-2 rounded-xl h-fit text-[16px] self-center text-white font-medium"
        >
          Contactanos
        </button>
      </div>

      <div className="w-fit">
        <nav className="bg-g-10 text-[17px] px-3 py-2 rounded-br-2xl font-medium">
          <ul className="flex gap-4">
            {items.map((item) => (
              <li
                key={item}
                onClick={() => {
                  setActive(item);
                  goTo(item);
                }}
                className={`cursor-pointer transition-colors ${
                  active === item ? 'text-primary' : 'text-g-80'
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
