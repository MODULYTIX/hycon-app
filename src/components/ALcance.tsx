import Tittle from '../shared/components/Tittle';
import AlcanceMapa from '../assets/images/alcance_mapa.webp';

export default function Alcance() {
  return (
    <div className='w-full max-w-[1340px] mx-auto px-6 md:px-12 space-y-8'>
      <header className='text-center'>
        <Tittle>Alcance</Tittle>
      </header>
      <div className=" flex justify-between">
        <div className="w-[686px]  space-y-4">
          <p className='text-primary font-semibold text-[22px]'>Contamos con una gran area de alcance para realizar los envíos</p>
          <div className='text-g-60 object-contain ml-4'>
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
          </div>
        </div>
        <div>
          <img src={AlcanceMapa} alt="" />
        </div>
      </div>
    </div>
  );
}
