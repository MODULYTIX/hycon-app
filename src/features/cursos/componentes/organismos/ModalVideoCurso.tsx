import { Icon } from '@iconify/react';
import Modal from '@/shared/ui/organismos/Modal';
import ReproductorYoutube from '@/shared/ui/organismos/ReproductorYoutube';
import { extraerInicioYoutube } from '@/shared/utilidades/youtube';
import { formatearDuracion } from '@/shared/utilidades/formato';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

const ID_TITULO = 'titulo-modal-video';

interface Props {
  curso: Curso | null;
  onCerrar: () => void;
}

// Reproduce el avance del curso sin salir de la web
export default function ModalVideoCurso({ curso, onCerrar }: Props) {
  const abierto = Boolean(curso?.youtubeId);

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} idTitulo={ID_TITULO} ancho="max-w-[1040px]">
      {curso?.youtubeId && (
        <div>
          <div className="flex items-center gap-3 px-5 py-3.5 pr-14 sm:px-6">
            <Icon
              icon="solar:play-circle-bold"
              width="22"
              height="22"
              aria-hidden
              className="shrink-0 text-primary"
            />
            <div className="min-w-0">
              <h2 id={ID_TITULO} className="truncate text-[17px] font-semibold text-g-90 sm:text-[19px]">
                {curso.name}
              </h2>
              {curso.durationMinutes !== null && (
                <p className="text-[13px] text-g-50">
                  Curso de {formatearDuracion(curso.durationMinutes)}
                </p>
              )}
            </div>
          </div>

          <ReproductorYoutube
            // Una clave por video: al cambiar de curso se monta un reproductor nuevo
            key={curso.youtubeId}
            id={curso.youtubeId}
            titulo={curso.name}
            inicio={extraerInicioYoutube(curso.videoUrl)}
          />
        </div>
      )}
    </Modal>
  );
}
