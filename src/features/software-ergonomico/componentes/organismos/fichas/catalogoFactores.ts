import type {
  ManipulacionCargas,
  MovimientosRepetitivos,
  PosturasForzadas,
} from '@/features/software-ergonomico/tipos/ficha.tipos';

// Textos de las condiciones de los pasos 3, 4 y 5. Se comparten con el paso "Tareas a evaluar",
// que usa la versión corta (`corto`) para que el listado sea compacto.

export const NOMBRES_POSTURAS: Record<keyof PosturasForzadas, string> = {
  manosSobreCabeza: 'Manos por encima de la cabeza',
  codosSobreHombro: 'Codos por encima del hombro',
  espaldaInclinadaAdelante: 'Espalda inclinada hacia adelante más de 30°',
  espaldaExtension: 'Espalda en extensión más de 30°',
  cuelloDobladoGirado: 'Cuello doblado o girado más de 30°',
  sentadoEspaldaInclinada: 'Sentado con espalda inclinada hacia adelante más de 30°',
  sentadoEspaldaGirada: 'Sentado con espalda girada/lateralizada más de 30°',
  trabajoCuclillas: 'Trabajo en cuclillas',
  trabajoRodillas: 'Trabajo de rodillas',
};

export const NOMBRES_POSTURAS_CORTOS: Record<keyof PosturasForzadas, string> = {
  manosSobreCabeza: 'Manos sobre la cabeza',
  codosSobreHombro: 'Codos sobre el hombro',
  espaldaInclinadaAdelante: 'Espalda inclinada >30°',
  espaldaExtension: 'Espalda en extensión >30°',
  cuelloDobladoGirado: 'Cuello doblado/girado >30°',
  sentadoEspaldaInclinada: 'Sentado, espalda inclinada >30°',
  sentadoEspaldaGirada: 'Sentado, espalda girada >30°',
  trabajoCuclillas: 'Trabajo en cuclillas',
  trabajoRodillas: 'Trabajo de rodillas',
};

export const FACTORES_CARGAS: Array<{ llave: keyof ManipulacionCargas; titulo: string; corto: string }> = [
  { llave: 'levantamiento40kg', titulo: 'Levanta cargas de 40 kg o más, al menos una vez al día', corto: '40 kg, 1 vez/día' },
  { llave: 'levantamiento25kg', titulo: 'Levanta cargas de 25 kg o más, más de 12 veces por hora', corto: '25 kg, >12 veces/hora' },
  { llave: 'levantamiento5kg', titulo: 'Levanta cargas de 5 kg o más, más de 2 veces por minuto', corto: '5 kg, >2 veces/min' },
  { llave: 'levantamientoMenor3kg', titulo: 'Levanta cargas menores de 3 kg, más de 4 veces por minuto', corto: '<3 kg, >4 veces/min' },
];

export const FACTORES_ESFUERZO: Array<{
  llave: keyof MovimientosRepetitivos['esfuerzoManos'];
  titulo: string;
  corto: string;
}> = [
  { llave: 'manipulacionPinzaMayor1kg', titulo: 'Manipula y sujeta en pinza un objeto de más de 1 kg.', corto: 'Pinza con objeto >1 kg' },
  {
    llave: 'munecasFlexionadasAgarre',
    titulo: 'Muñecas flexionadas, en extensión, giradas o lateralizadas, haciendo un agarre de fuerza.',
    corto: 'Muñecas forzadas con agarre de fuerza',
  },
  { llave: 'accionAtornillar', titulo: 'Ejecuta la acción de atornillar de forma intensa.', corto: 'Atornillar de forma intensa' },
];

export const FACTORES_MOVIMIENTO: Array<{
  llave: keyof MovimientosRepetitivos['movimientosAltaFrecuencia'];
  titulo: string;
  corto: string;
}> = [
  {
    llave: 'repiteMovimiento4vecesMinuto2horas',
    titulo:
      'Repite el mismo movimiento muscular más de 4 veces por minuto, durante más de 2 horas al día, en cuello, hombros, codos, muñecas o manos.',
    corto: 'Movimiento repetido >4 veces/min',
  },
];
