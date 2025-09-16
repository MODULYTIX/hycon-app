import { Icon } from '@iconify/react';
import Tittle from '../shared/components/Tittle';

export default function Servicios() {
  return (
    <div className="flex flex-col w-[1200px]">
      <header>
        <Tittle>Nuestros Servicios</Tittle>
      </header>
      <main className="flex flex-col  ">
        <div className="flex justify-between items-center">
          <div className="flex">
            <p className="text-[150px] text-g-50">01</p>
          </div>
          <div className="flex">
            <span className="w-[650px]">
              <Icon
                icon="fa6-solid:truck-fast"
                width="20"
                height="20"
                className="text-primary"
              />
              <p className="font-bold text-g-70">Sameday</p>
              <p className='text-g-50'>
                Entrega inmediata desde nuestros almacenes para ecommerce que
                necesitan velocidad y eficiencia. Tus clientes reciben sus
                pedidos el mismo día, garantizando una experiencia de compra
                ágil y confiable.
              </p>
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[150px] text-g-50">02</p>
          </div>
          <div className="w-[650px] ">
            <span>
              <Icon
                icon="ri:time-fill"
                width="20"
                height="20"
                className="text-primary"
              />
              <p className="font-bold text-g-70">Nextday</p>
              <p className='text-g-50'>
                Servicio de entrega al día siguiente, ideal para negocios que
                almacenan sus productos con nosotros. Optimiza tu logística con
                entregas rápidas y seguras sin preocuparte por la gestión de
                inventario.
              </p>
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[150px] text-g-50">03</p>
          </div>
          <div className="w-[650px]">
            <span>
              <Icon
                icon="bi:calendar2-day-fill"
                width="20"
                height="20"
                className="text-primary"
              />
              <p className="font-bold text-g-70">Standard delivery</p>
              <p className='text-g-50'>
                Opción diseñada para envíos de paquetería masiva con destinos
                programados durante la semana. Perfecto para plataformas como
                Temu, Wish, Shein y otros marketplaces de alto volumen.
              </p>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
