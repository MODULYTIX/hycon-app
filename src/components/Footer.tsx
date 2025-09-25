import { Icon } from '@iconify/react';
import LOGOHYCON from '../assets/images/logo_hycon.webp';

export default function Footer() {
  return (
    <footer className="h-full w-full bg-primary text-white flex flex-col text-sm  ">
      <div className="max-w-[1340px] mx-auto w-full flex justify-between items-center p-4 ">
        <div className="flex space-x-48 items-center">
          <div className="">
            <img
              src={LOGOHYCON}
              alt="logo hycon"
              draggable="false"
              width={80}
              className="p-2 outline-2 outline-white"
            />
          </div>
          <div className="flex gap-8 ">
            <div>
              <p>Términos y condiciones</p>
              <p>Política de privacidad</p>
              <p>Libro de reclamaciones</p>
            </div>
            <div>
              <p>Contactanos</p>
              <p>Ayuda</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col text-center">
          <div>Nuestras redes</div>
          <div className="flex gap-4 ">
            <p className="flex  items-center">
              <Icon icon="ic:baseline-facebook" width="16" height="16" />
              Facebook
            </p>
            <p className="flex  items-center">
              <Icon icon="lets-icons:insta-fill" width="16" height="16" />
              Instragram
            </p>
            <p className="flex  items-center">
              <Icon icon="mingcute:linkedin-fill" width="16" height="16" />
              Linkedink
            </p>
          </div>
        </div>
      </div>
      <div className="bg-g-80 w-full text-center">
        Diseño en blanco de Trustrus Design. Todos los derechos reservados. ©
        2025
      </div>
    </footer>
  );
}
