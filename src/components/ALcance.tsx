import Tittle from '../shared/components/Tittle';
import AlcanceMapa from '../assets/images/alcance_mapa.webp';

export default function Alcance() {
  return (
    <div className="w-full max-w-[1340px] mx-auto px-6 md:px-12 space-y-8 my-4">
      <header className="text-center">
        <Tittle>Alcance en Arequipa</Tittle>
      </header>

      {/* Columna en móvil/tablet, fila en desktop */}
      <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8">
        {/* Texto */}
        <div className="w-full lg:w-[686px] space-y-4">
          <p className="text-primary font-semibold text-[18px] sm:text-[20px] lg:text-[22px]">
            Contamos con una gran area de alcance para realizar los envíos
          </p>
          <ul className="text-g-60 list-disc pl-6 space-y-1 text-[15px] sm:text-[16px]">
            <li>ALTO SELVA ALEGRE</li>
            <li>CERCADO DE AREQUIPA</li>
            <li>CAYMA, CERRO COLORADO</li>
            <li>CHARACATO, JACOBO HUNTER</li>
            <li>JOSE LUIS BUSTAMANTE Y RIVERO</li>
            <li>MARIANO MELGAR</li>
            <li>MIRAFLORES, PAUCARPATA</li>
            <li>SABANDIA</li>
            <li>SACHACA</li>
            <li>SOCABAYA</li>
            <li>TIABAYA</li>
            <li>UCHUMAYO</li>
            <li>YANAHUARA</li>
            <li>YURA</li>
          </ul>
        </div>

        {/* Imagen */}
        <div className="">
          <img
            src={AlcanceMapa}
            alt="Mapa Alcance"
            className=""
          />
        </div>
      </div>
    </div>
  );
}
