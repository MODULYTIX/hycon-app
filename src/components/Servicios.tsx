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
    <div className="flex flex-col w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-12 my-8">
      <header>
        <Tittle>Nuestros Servicios</Tittle>
      </header>

      <main className="flex flex-col gap-6">
        {services.map((s, idx) => (
          <React.Fragment key={s.id}>
            {/* Columna en móvil/tablet; fila sólo en desktop (lg) */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <p className="text-[72px] sm:text-[80px] lg:text-[130px] leading-none text-g-50 shrink-0">
                {s.id}
              </p>

              <div className="w-full lg:max-w-[800px]">
                <div className="flex items-center gap-2 lg:gap-3">
                  <Icon icon={s.icon} width="22" height="22" className="text-primary lg:w-[26px] lg:h-[26px]" />
                  <p className="font-bold text-g-70 text-[20px] sm:text-[22px] lg:text-[30px]">
                    {s.title}
                  </p>
                </div>

                <p className="mt-2 text-g-50 text-[14px] sm:text-[15px] lg:text-[16px] leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>

            {/* Separador: full en móvil/tablet; alineado al bloque derecho en desktop */}
            {idx < services.length - 1 && (
              <div className="block w-full lg:max-w-[800px] h-px bg-g-70 lg:self-end my-2 lg:my-4" />
            )}
          </React.Fragment>
        ))}
      </main>
    </div>
  );
}
