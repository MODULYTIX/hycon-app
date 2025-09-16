import Tittle from '../shared/components/Tittle';
import QS from '../assets/images/QS.png';

export default function QuienesSomos() {
  return (
    <div className="w-full max-w-[1520px] flex items-center justify-between gap-10">
      {/* Columna IZQUIERDA: título + texto (vertical) */}
      <div className="flex flex-col gap-10 max-w-[760px]">
        <Tittle>¿Quiénes somos?</Tittle>

        <p
          className="font-normal text-[30px] leading-[1.5] text-gray-800"
          style={{
            fontFamily:
              "Roboto, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
          }}>
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

      {/* Columna DERECHA: imagen con máscara (inline, sin componente) */}
      <img
        src={QS}
        alt="Quiénes somos"
        className="w-[540px] h-[600px] object-cover rounded-[22px]"
        draggable="false"
      />
    </div>
  );
}
