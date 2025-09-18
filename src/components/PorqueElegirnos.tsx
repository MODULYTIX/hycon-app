import Tittle from '../shared/components/Tittle';

import Rapidez from '../assets/images/pq_rapidez.webp';
import Transparencia from '../assets/images/pq_transparencia.webp';
import Seguridad from '../assets/images/pq_seguridad.webp';
import Cobertura from '../assets/images/pq_cobertura.webp';
import Escalabilidad from '../assets/images/pq_escalabilidad.webp';

const cards = [
  {
    image: Rapidez,
    title: 'Rapidez en las entregas',
    description:
      'Aseguramos que tus pedidos lleguen en el menor tiempo posible con nuestras soluciones Sameday y Nextday.',
  },
  {
    image: Seguridad,
    title: 'Seguridad y confianza',
    description:
      'Cada paquete es monitoreado en tiempo real para que tengas total control del estado de tus envíos.',
  },
  {
    image: Escalabilidad,
    title: 'Escalabilidad para tu negocio',
    description:
      'Desde un pequeño ecommerce hasta grandes marcas, adaptamos nuestra logística a tus necesidades de crecimiento.',
  },
  {
    image: Cobertura,
    title: 'Cobertura',
    description:
      'Brindamos servicio en toda la CIUDAD DE AREQUIPA con tarifas desde 10 soles ',
  },
  {
    image: Transparencia,
    title: 'Transparencia total',
    description:
      'Accede a reportes, métricas y seguimiento en tiempo real a través de nuestra plataforma, asegurando una logística clara, ordenada y sin sorpresas.',
  },
];

export default function PorqueElegirnos() {
  return (
    <div className="relative w-full max-w-[1340px]  mx-auto mt-20 px-6 md:px-12">
      <header>
        <Tittle>¿Por qué elegirnos?</Tittle>
      </header>

      <div className="flex flex-col gap-6 mt-8">
        {cards.map((c, idx) => (
          <div
            key={idx}
            className={`flex flex-col md:flex-row items-center ${
              idx % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <img
              src={c.image}
              alt={c.title}
              className="w-full md:w-[480px] h-auto md:h-[220px] object-cover rounded-xl"
            />
            <div
              className={`bg-g-10 p-6 md:p-8 w-full md:max-w-[1040px] min-h-[140px] space-y-2 text-justify flex flex-col justify-center ${
                idx % 2 === 1 ? 'rounded-l-lg' : 'rounded-r-lg'
              }`}
            >
              <p className="text-primary font-bold text-[20px] md:text-[22px]">{c.title}</p>
              <p className="text-g-50 text-[17px] md:text-[17px]">{c.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
