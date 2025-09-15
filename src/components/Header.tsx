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

  return (
    <div className="m-0 flex flex-col w-full">
      <div className="sticky top-0 z-50 flex justify-between bg-primary h-[84px] items-center px-[40px]">
        {/* logo aun no definido */}
        <div className="h-8 w-24 bg-white/30 rounded" />

        <button className="bg-g-70 px-3 py-2 rounded-xl h-fit text-[20px] self-center text-white font-medium">
          Contactanos
        </button>
      </div>

      <div className="w-fit z-10">
        <nav className="bg-g-10 text-[20px] px-3 py-2 rounded-br-2xl font-medium">
          <ul className="flex gap-4">
            {items.map((item) => (
              <li
                key={item}
                onClick={() => setActive(item)}
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
