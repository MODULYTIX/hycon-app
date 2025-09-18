import { Icon } from '@iconify/react';
import Tittle from '../shared/components/Tittle';
import React from 'react';

export default function Servicios() {
  const services = [
    {
      id: '01',
      icon: 'fa6-solid:truck-fast',
      title: 'Sameday',
      description:
        'Entrega inmediata desde nuestros almacenes para ecommerce que necesitan velocidad y eficiencia. Tus clientes reciben sus pedidos el mismo día, garantizando una experiencia de compra ágil y confiable.',
    },
    {
      id: '02',
      icon: 'ri:time-fill',
      title: 'Nextday',
      description:
        'Servicio de entrega al día siguiente, ideal para negocios que almacenan sus productos con nosotros. Optimiza tu logística con entregas rápidas y seguras sin preocuparte por la gestión de inventario.',
    },
    {
      id: '03',
      icon: 'bi:calendar2-day-fill',
      title: 'Standard delivery',
      description:
        'Opción diseñada para envíos de paquetería masiva con destinos programados durante la semana. Perfecto para plataformas como Temu, Wish, Shein y otros marketplaces de alto volumen.',
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-[1340px] mx-auto px-6 md:px-12">
      <header>
        <Tittle>Nuestros Servicios</Tittle>
      </header>

      <main className="flex flex-col gap-[8px]">
        {services.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 ">
              <p className="text-[80px] md:text-[130px] text-g-50 shrink-0">
                {s.id}
              </p>

              <div className="w-full max-w-[800px] items-center">
                <Icon
                  icon={s.icon}
                  width="26"
                  height="26"
                  className="text-primary"
                />
                <p className="font-bold text-g-70 text-[22px] md:text-[30px]">
                  {s.title}
                </p>
                <p className="text-g-50 text-[14px] md:text-[16px]">
                  {s.description}
                </p>
              </div>
            </div>

            {idx < services.length - 1 && (
              <div className="block w-full max-w-[800px] h-px bg-g-70  self-end" />
            )}
          </React.Fragment>
        ))}
      </main>
    </div>
  );
}
