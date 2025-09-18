import { Icon } from '@iconify/react';
import Tittle from '../shared/components/Tittle';
import React from 'react';

export default function Servicios() {
  const services = [
    { id: '01', icon: 'fa6-solid:truck-fast', title: 'Sameday',
      description: 'Entrega inmediata desde nuestros almacenes para ecommerce que necesitan velocidad y eficiencia. Tus clientes reciben sus pedidos el mismo día, garantizando una experiencia de compra ágil y confiable.' },
    { id: '02', icon: 'ri:time-fill', title: 'Nextday',
      description: 'Servicio de entrega al día siguiente, ideal para negocios que almacenan sus productos con nosotros. Optimiza tu logística con entregas rápidas y seguras sin preocuparte por la gestión de inventario.' },
    { id: '03', icon: 'bi:calendar2-day-fill', title: 'Standard delivery',
      description: 'Opción diseñada para envíos de paquetería masiva con destinos programados durante la semana. Perfecto para plataformas como Temu, Wish, Shein y otros marketplaces de alto volumen.' },
  ];

  return (
    <div className="flex flex-col w-[1520px]">
      <header>
        <Tittle>Nuestros Servicios</Tittle>
      </header>

      <main className="flex flex-col">
        {services.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex justify-between items-center">
              <div className="flex">
                <p className="text-[150px] text-g-50">{s.id}</p>
              </div>
              <div className="w-[1000px]">
                <span>
                  <Icon icon={s.icon} width="40" height="40" className="text-primary" />
                  <p className="font-bold text-g-70 text-[40px]">{s.title}</p>
                  <p className="text-g-50 text-[20px]">{s.description}</p>
                </span>
              </div>
            </div>

            {idx < services.length - 1 && (
              <div className="block w-[1000px] h-[0.1px] bg-g-70 mt-8 self-end" />
            )}
          </React.Fragment>
        ))}
      </main>
    </div>
  );
}
