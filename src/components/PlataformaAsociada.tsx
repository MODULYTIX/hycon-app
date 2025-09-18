import Tittle from '../shared/components/Tittle';
import PLATAFORMAASOCIADA from '../assets/images/plataforma_asociada.webp';
import BACKGROUNDPLATAFORMAASOCIADA from '../assets/images/background_PlataformaAsocada.webp';

export default function PlataformaAsociada() {
  return (
    <div className="relative w-screen h-screen">
      <img
        src={BACKGROUNDPLATAFORMAASOCIADA}
        alt="background"
        className="absolute inset-0 w-screen h-screen object-cover z-[-1]"
      />
      <div className="flex flex-col w-[1520px] mx-auto my-[80px]">
        <header className="flex justify-center ">
          <Tittle>
            <p className="text-white">Plataforma Asociada</p>
          </Tittle>
        </header>
        <main className="flex justify-between items-end text-white">
          <div className="flex flex-col space-y-[40px]">
            <div>
              <h1 className="text-[64px] font-semibold">TIKTUY</h1>
            </div>
            <div className="space-y-4 text-justify w-[610px] text-[19px]">
              <p>
                Tiktuy es nuestra plataforma inteligente de gestión logística,
                creada para que los couriers y operadores de reparto tengan el
                control total de sus envíos. Con ella puedes administrar desde
                qué almacén despachar, organizar pedidos y asignarlos de manera
                ágil y precisa a cada repartidor.
              </p>
              <p>
                La plataforma centraliza todo el proceso y te permite hacer un
                seguimiento en tiempo real del estado de los pedidos, asegurando
                transparencia y control en cada etapa.
              </p>
              <p>
                Con Tiktuy, simplificas tu operación, optimizas recursos y
                garantizas que cada entrega llegue a tiempo y sin
                complicaciones. Una sola herramienta para que tu logística sea
                más eficiente, ordenada y confiable.
              </p>
            </div>
            <div>
              <button className="bg-primary text-[22px] font-semibold px-[61px] py-[15px] rounded-lg">
                Sobre Tiktuy
              </button>
            </div>
          </div>
          <div >
            <img src={PLATAFORMAASOCIADA} alt="plataforma" className='w-200' />
          </div>
        </main>
      </div>
    </div>
  );
}
