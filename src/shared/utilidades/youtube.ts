// Replica de src/core/utils/youtube.ts del backend: sirve para validar el formulario
// al momento. El listado ya trae youtubeId calculado por el backend.
const PATRON_ID = /^[A-Za-z0-9_-]{11}$/;

const DOMINIOS_YOUTUBE = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const RUTAS_CON_ID = ['embed', 'shorts', 'live', 'v'];

const leerUrl = (enlace: string): URL | null => {
  try {
    const url = new URL(enlace.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
};

export const extraerIdYoutube = (enlace: string | null | undefined): string | null => {
  if (!enlace) return null;
  const url = leerUrl(enlace);
  if (!url) return null;

  const host = url.hostname.toLowerCase();
  const segmentos = url.pathname.split('/').filter(Boolean);
  let candidato: string | null = null;

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    candidato = segmentos[0] ?? null;
  } else if (DOMINIOS_YOUTUBE.has(host)) {
    if (segmentos[0] === 'watch') candidato = url.searchParams.get('v');
    else if (RUTAS_CON_ID.includes(segmentos[0])) candidato = segmentos[1] ?? null;
  }

  return candidato && PATRON_ID.test(candidato) ? candidato : null;
};

// Segundo de inicio si el link lo trae: ?t=90, ?t=90s, ?t=1m30s, ?t=1h2m3s o ?start=90
export const extraerInicioYoutube = (enlace: string | null | undefined): number => {
  const url = enlace ? leerUrl(enlace) : null;
  const valor = url?.searchParams.get('t') ?? url?.searchParams.get('start');
  if (!valor) return 0;

  if (/^\d+s?$/.test(valor)) return Number.parseInt(valor, 10);

  const partes = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(valor);
  if (!partes) return 0;
  const [, horas = '0', minutos = '0', segundos = '0'] = partes;
  return Number(horas) * 3600 + Number(minutos) * 60 + Number(segundos);
};

// Dominio sin cookies de YouTube: no deja rastreo hasta que se reproduce el video
export const HOST_YOUTUBE_SIN_COOKIES = 'https://www.youtube-nocookie.com';

// Configuracion del reproductor: sin la barra de YouTube (la web pinta la suya),
// sin anotaciones, sin atajos propios y sin su boton de pantalla completa
export const parametrosReproductor = (inicio = 0, origen?: string) => ({
  autoplay: 1,
  controls: 0,
  rel: 0,
  playsinline: 1,
  iv_load_policy: 3,
  disablekb: 1,
  fs: 0,
  enablejsapi: 1,
  ...(inicio > 0 ? { start: inicio } : {}),
  ...(origen ? { origin: origen } : {}),
});

// hqdefault existe para todos los videos; maxresdefault no siempre
export const miniaturaYoutube = (id: string): string => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

// 75 -> 1:15, 3725 -> 1:02:05
export const formatearTiempo = (total: number): string => {
  const segundos = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const resto = String(segundos % 60).padStart(2, '0');
  return horas > 0 ? `${horas}:${String(minutos).padStart(2, '0')}:${resto}` : `${minutos}:${resto}`;
};

// Codigos de error de la IFrame API traducidos para el usuario
export const mensajeErrorYoutube = (codigo: number): string => {
  if (codigo === 101 || codigo === 150) {
    return 'El dueño de este video no permite reproducirlo fuera de YouTube.';
  }
  if (codigo === 100) return 'El video no existe o es privado.';
  return 'No se pudo reproducir el video.';
};
