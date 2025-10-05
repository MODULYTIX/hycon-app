import Tittle from '../shared/components/Tittle';
import QS from '../assets/images/QS.png';

export default function QuienesSomos() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1340px] px-4 sm:px-6 md:px-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-10">
          
          {/* Texto */}
          <div className="flex flex-col gap-6 md:gap-8 w-full max-w-[760px]">
            <Tittle> ¿Quiénes somos?</Tittle>

            <p
              className="w-full md:max-w-[640px]
                         text-[16px] sm:text-[18px] md:text-[20px]
                         leading-relaxed md:leading-[1.6]
                         text-gray-800 text-justify"
              style={{
                fontFamily:
                  "Roboto, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
              }}
            >
              HYCON es una empresa peruana especializada en logística de última
              milla y servicios de fulfillment. Nos enfocamos en hacer que cada
              entrega sea rápida, segura y eficiente, integrando todos los canales
              de pago para que los clientes puedan realizar sus compras con total
              confianza, incluyendo la opción de pago contraentrega.
              <br />
              <br />
              Con HYCON, tu negocio crece mientras nosotros nos encargamos de que
              cada pedido llegue a tiempo y sin complicaciones.
            </p>
          </div>

          {/* Imagen */}
          <img
            src={QS}
            alt="Quiénes somos"
            className="w-full max-w-[540px] aspect-[9/10] object-cover rounded-[22px]
                       mx-auto lg:mx-0"
            draggable="false"
          />
        </div>
      </div>
    </div>
  );
}
