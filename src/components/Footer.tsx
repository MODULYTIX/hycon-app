import { Icon } from '@iconify/react';
import LOGOHYCON from '../assets/images/logo_hycon.webp';

export default function Footer() {
  return (
    <footer className="w-full bg-primary text-white flex flex-col text-sm">
      <div className="max-w-[1340px] mx-auto w-full p-4 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
        {/* Bloque superior: logo + links */}
        <div className="flex flex-wrap lg:flex-row items-center lg:items-start gap-16 lg:gap-48 justify-center sm:flex sm:flex-wrap md:flex md:flex-row">
          {/* Logo */}
          <div className="flex">
            <img
              src={LOGOHYCON}
              alt="logo hycon"
              draggable="false"
              width={80}
              className="p-2 outline-2 outline-white"
            />
          </div>

          {/* Links legales y contacto */}
          <div className="flex flex-wrap sm:flex-row gap-8 text-center lg:text-left">
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

        {/* Redes sociales */}
        <div className="flex flex-col items-center text-center lg:items-start">
          <div className="font-semibold lg:flex lg:items-center lg:text-center lg:justify-center">
            <p>Nuestras redes</p>
          </div>
          <div className="flex gap-4 mt-1 flex-wrap justify-center lg:justify-start">
            <p className="flex items-center gap-1">
              <Icon icon="ic:baseline-facebook" width="16" height="16" />
              Facebook
            </p>
            <p className="flex items-center gap-1">
              <Icon icon="lets-icons:insta-fill" width="16" height="16" />
              Instagram
            </p>
            <p className="flex items-center gap-1">
              <Icon icon="mingcute:linkedin-fill" width="16" height="16" />
              LinkedIn
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-g-80 w-full text-center h-12 flex items-center justify-center font-extralight">
        Design copyright BizNovaTech. All rights reserved. © 2025
      </div>
    </footer>
  );
}
