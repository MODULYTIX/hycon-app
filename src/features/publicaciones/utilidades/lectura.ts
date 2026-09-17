import { textoPlano } from '@/shared/utilidades/texto-enriquecido';

// Mismo calculo que el backend (posts.utils.ts): 200 palabras por minuto
const PALABRAS_POR_MINUTO = 200;

// El contenido es HTML del editor: solo cuenta el texto visible
export const contarPalabras = (contenido: string): number => {
  const texto = textoPlano(contenido);
  return texto ? texto.split(' ').length : 0;
};

export const minutosDeLectura = (contenido: string): number =>
  Math.max(1, Math.ceil(contarPalabras(contenido) / PALABRAS_POR_MINUTO));

const dosCifras = (numero: number) => String(numero).padStart(2, '0');

// Fecha local en el formato del <input type="date">: YYYY-MM-DD
const aCampo = (fecha: Date) =>
  `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`;

export const hoyParaCampo = (): string => aCampo(new Date());

export const fechaParaCampo = (iso: string): string => {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? hoyParaCampo() : aCampo(fecha);
};

// "2026-03-01" -> "1 de marzo de 2026", para la vista previa
export const fechaLarga = (campo: string): string => {
  const [anio, mes, dia] = campo.split('-').map(Number);
  if (!anio || !mes || !dia) return '';
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
