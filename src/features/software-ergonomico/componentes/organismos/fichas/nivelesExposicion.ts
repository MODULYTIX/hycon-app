// Categorización del nivel de exposición por color. Las clases van completas para que Tailwind las detecte.

export interface NivelExposicion {
  etiqueta: string;
  /** Borde + fondo suave para el input */
  input: string;
  /** Insignia con el nombre del nivel */
  insignia: string;
}

export type Clasificador = (valor: number) => NivelExposicion;

const ACEPTABLE: NivelExposicion = {
  etiqueta: 'Riesgo aceptable',
  input: 'border-green-600 bg-green-50 focus:border-green-600 focus:ring-green-600',
  insignia: 'bg-green-600 text-white',
};
const LIMITE: NivelExposicion = {
  etiqueta: 'Riesgo límite o muy bajo',
  input: 'border-yellow-500 bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-500',
  insignia: 'bg-yellow-400 text-g-90',
};
const INACEPTABLE_BAJO: NivelExposicion = {
  etiqueta: 'Riesgo inaceptable bajo',
  input: 'border-orange-500 bg-orange-50 focus:border-orange-500 focus:ring-orange-500',
  insignia: 'bg-orange-500 text-white',
};
const INACEPTABLE_MEDIO: NivelExposicion = {
  etiqueta: 'Riesgo inaceptable medio',
  input: 'border-red-600 bg-red-50 focus:border-red-600 focus:ring-red-600',
  insignia: 'bg-red-600 text-white',
};
const INACEPTABLE_ALTO: NivelExposicion = {
  etiqueta: 'Riesgo inaceptable alto',
  input: 'border-purple-600 bg-purple-50 focus:border-purple-600 focus:ring-purple-600',
  insignia: 'bg-purple-600 text-white',
};

// Tabla N°5 — Puntuación de posturas forzadas (D / I)
export const clasificarPostura: Clasificador = (valor) => {
  if (valor <= 1) {
    return {
      etiqueta: '0 - Inapreciable',
      input: 'border-g-40 bg-g-10 focus:border-g-40 focus:ring-g-40',
      insignia: 'bg-g-20 text-g-80',
    };
  }
  if (valor <= 3) return { ...ACEPTABLE, etiqueta: '1 - Bajo' };
  if (valor <= 7) return { ...LIMITE, etiqueta: '2 - Medio' };
  if (valor <= 10) {
    return {
      etiqueta: '3 - Alto',
      input: 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500',
      insignia: 'bg-red-500 text-white',
    };
  }
  return {
    etiqueta: '4 - Muy alto',
    input: 'border-red-800 bg-red-100 focus:border-red-800 focus:ring-red-800',
    insignia: 'bg-red-800 text-white',
  };
};

// Levantamiento manual de carga — Índice de levantamiento (IL, NIOSH)
export const clasificarNiosh: Clasificador = (valor) => {
  if (valor < 1) return { ...ACEPTABLE, etiqueta: 'Aceptable' };
  if (valor <= 3) return { ...LIMITE, etiqueta: 'Riesgo presente: moderado' };
  return { ...INACEPTABLE_MEDIO, etiqueta: 'Riesgo presente: nivel muy alto' };
};

// Tabla N°3 — Índice OCRA Check List (movimientos repetitivos)
export const clasificarOcra: Clasificador = (valor) => {
  if (valor <= 7.5) return ACEPTABLE;
  if (valor <= 11) return LIMITE;
  if (valor <= 14) return INACEPTABLE_BAJO;
  if (valor <= 22.5) return INACEPTABLE_MEDIO;
  return INACEPTABLE_ALTO;
};
