import type { ReactNode } from 'react';
import ReproductorArchivo from '@/shared/ui/organismos/ReproductorArchivo';
import ReproductorIncrustado from '@/shared/ui/organismos/ReproductorIncrustado';
import ReproductorYoutube from '@/shared/ui/organismos/ReproductorYoutube';
import type { TipoVideo } from '@/features/cursos/tipos/leccion.tipos';

interface Props {
  tipo: TipoVideo;
  // El id del video en YouTube o el enlace que dio el backend
  fuente: string;
  titulo: string;
  inicio?: number;
  limiteSegundos?: number | null;
  alTerminarMuestra?: ReactNode;
}

/**
 * Elige el reproductor segun de donde salga el video. Es el unico sitio donde
 * eso se decide: al cambiar el almacen de los cursos no hay nada mas que tocar.
 */
export default function ReproductorLeccion({
  tipo,
  fuente,
  titulo,
  inicio = 0,
  limiteSegundos = null,
  alTerminarMuestra,
}: Props) {
  if (tipo === 'youtube') {
    return (
      <ReproductorYoutube
        id={fuente}
        titulo={titulo}
        inicio={inicio}
        limiteSegundos={limiteSegundos}
        alTerminarMuestra={alTerminarMuestra}
      />
    );
  }

  if (tipo === 'incrustado') {
    return (
      <ReproductorIncrustado
        url={fuente}
        titulo={titulo}
        limiteSegundos={limiteSegundos}
        alTerminarMuestra={alTerminarMuestra}
      />
    );
  }

  return (
    <ReproductorArchivo
      url={fuente}
      titulo={titulo}
      limiteSegundos={limiteSegundos}
      alTerminarMuestra={alTerminarMuestra}
    />
  );
}
