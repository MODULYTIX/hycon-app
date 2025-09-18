import Tittle from '../shared/components/Tittle';

import logoMilesIdeas from '../assets/images/logo_miles_ideas.png';
import logoKullShop from '../assets/images/logo_kull_shop.png';
import logoAllStore from '../assets/images/logo_all_store.png';
import logoFlume from '../assets/images/logo_flume.png';
import logoParktiTodo from '../assets/images/logo_parktiTodo.png';
import logoVB from '../assets/images/logo_VB.png';
import logoJbc from '../assets/images/logo_jbc.png';
import logoBuenazzo from '../assets/images/logo_buenazzo.png';

export default function NuestrosClientes() {
  const logos = [
    logoMilesIdeas,
    logoKullShop,
    logoAllStore,
    logoFlume,
    logoParktiTodo,
    logoVB,
    logoJbc,
    logoBuenazzo,
  ];

  return (
    <div className="w-full max-w-[1340px] mx-auto px-6 md:px-12 md:py-12 space-y-8">
      <header className="text-center">
        <Tittle>Nuestros Clientes</Tittle>
      </header>
      <main>
        <div className="flex flex-wrap gap-4 justify-between">
          {logos.map((logo, index) => (
            <div key={index} className="flex justify-center items-center">
              <img src={logo} alt={`Logo ${index}`} className="w-16 h-16" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
