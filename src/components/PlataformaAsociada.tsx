import Tittle from '../shared/components/Tittle';
import PLATAFORMAASOCIADA from '../assets/images/plataforma_asociada.webp';
import BACKGROUNDPLATAFORMAASOCIADA from '../assets/images/background_PlataformaAsocada.webp';

export default function PlataformaAsociada() {
  return (
    <div className="relative w-screen min-h-screen overflow-hidden">
      <img
        src={BACKGROUNDPLATAFORMAASOCIADA}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover z-[-1]"
      />
      <div className="w-full max-w-[1340px] mx-auto px-6 md:px-12 py-[80px]">
        <header className="flex justify-center">
          <Tittle>
            <p className="text-white">Plataforma Asociada</p>
          </Tittle>
        </header>

        <main className="flex flex-col lg:flex-row justify-between items-end gap-10 text-white">
          <div className="flex flex-col space-y-[40px] w-full max-w-[760px]">
            <h1 className="text-[64px] font-semibold">TIKTUY</h1>

            <div className="space-y-4 text-justify w-full max-w-[610px] text-[16px]">
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
              <button className="bg-primary text-[20px] font-semibold px-[28px] py-[8px] rounded-lg">
                Sobre Tiktuy
              </button>
            </div>
          </div>

          <div className="w-full max-w-[600px]">
            <img
              src={PLATAFORMAASOCIADA}
              alt="plataforma"
              className="w-full h-auto object-contain"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
