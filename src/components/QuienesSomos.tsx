import Tittle from '../shared/components/Tittle';
import QS from '../assets/images/QS.png';

export default function QuienesSomos() {
  return (
    <div className="w-screen">
      <div className="mx-auto w-full max-w-[1340px] px-6 md:px-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex flex-col gap-10 max-w-[760px]">
            <Tittle>¿Quiénes somos?</Tittle>
            <p
              className="font-normal text-[20px] leading-[1.5] text-gray-800 text-justify w-[640px]"
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

          <img
            src={QS}
            alt="Quiénes somos"
            className="w-full max-w-[540px] aspect-[9/10] object-cover rounded-[22px]"
            draggable="false"
          />
        </div>
      </div>
    </div>
  );
}
