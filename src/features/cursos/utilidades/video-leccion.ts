import { extraerInicioYoutube } from '@/shared/utilidades/youtube';
import type { Leccion } from '@/features/cursos/tipos/leccion.tipos';

/**
 * Lo que hay que darle al reproductor: el id de YouTube o el enlace firmado del
 * archivo. null cuando esa parte no tiene video o esta bloqueada.
 */
export const fuenteDeLeccion = (leccion: Leccion | null | undefined): string | null => {
  if (!leccion?.tipoVideo) return null;
  return (leccion.tipoVideo === 'youtube' ? leccion.youtubeId : leccion.videoUrl) ?? null;
};

// El minuto de arranque solo lo trae un enlace de YouTube
export const inicioDeLeccion = (leccion: Leccion): number =>
  leccion.tipoVideo === 'youtube' ? extraerInicioYoutube(leccion.videoUrl) : 0;
