// Tipos base para el registro de una ficha ergonómica

export interface DatosAdministrativos {
  area: string;
  puesto: string;
  resumenPuesto: string;
  actividad: string;
  superintendencia: string;
  gerencia: string;
}

export interface DatosRepresentatividad {
  duracionMinutos: string; // lo guardamos como string para el input y lo parseamos luego
  cotidiana: boolean | null; // null indica que aún no se ha respondido.
  duracionMayor120: boolean; // Automático: duracionMinutos >= 120 (nombre conservado por compatibilidad)
  requiereIdentificacion: boolean; // Automático: duracion >= 120 && cotidiana
}

export interface FactorPostura {
  aplica: boolean | null;
  duracionDiaria: string;
}

export interface PosturasForzadas {
  manosSobreCabeza: FactorPostura;
  codosSobreHombro: FactorPostura;
  espaldaInclinadaAdelante: FactorPostura;
  espaldaExtension: FactorPostura;
  cuelloDobladoGirado: FactorPostura;
  sentadoEspaldaInclinada: FactorPostura;
  sentadoEspaldaGirada: FactorPostura;
  trabajoCuclillas: FactorPostura;
  trabajoRodillas: FactorPostura;
}

export interface ManipulacionCargas {
  levantamiento40kg: FactorPostura;
  levantamiento25kg: FactorPostura;
  levantamiento5kg: FactorPostura;
  levantamientoMenor3kg: FactorPostura;
}

export interface MovimientosRepetitivos {
  esfuerzoManos: {
    manipulacionPinzaMayor1kg: FactorPostura;
    munecasFlexionadasAgarre: FactorPostura;
    accionAtornillar: FactorPostura;
    impactoRepetido: FactorPostura;
    vibracionBrazoMano: FactorPostura;
  };
  movimientosAltaFrecuencia: {
    repiteMovimiento4vecesMinuto2horas: FactorPostura;
  };
}

// Pasos 7 a 10: valores decimales opcionales, como texto para el input y se parsean luego
export interface EvaluacionResultados {
  movimientosRepetitivos: { dx: string; ix: string };
  posturaForzada: { d: string; i: string };
  levantamientoCargas: { niosh: string };
}

export interface InformacionAdicional {
  sector: 'mineria' | 'industria' | 'construccion' | 'agricultura' | '';
  numeroEvaluaciones: string;
}

export interface FormularioFichaErgonomica {
  paso1: DatosAdministrativos;
  paso2: DatosRepresentatividad;
  paso3: PosturasForzadas;
  paso4: ManipulacionCargas;
  paso5: MovimientosRepetitivos;
  evaluacion: EvaluacionResultados;
  paso7Adicional: InformacionAdicional;
}

// Valores iniciales vacíos para el formulario
export const FICHA_VACIA: FormularioFichaErgonomica = {
  paso1: {
    area: '',
    puesto: '',
    resumenPuesto: '',
    actividad: '',
    superintendencia: '',
    gerencia: '',
  },
  paso2: {
    duracionMinutos: '',
    cotidiana: null,
    duracionMayor120: false,
    requiereIdentificacion: false,
  },
  paso3: {
    manosSobreCabeza: { aplica: null, duracionDiaria: '' },
    codosSobreHombro: { aplica: null, duracionDiaria: '' },
    espaldaInclinadaAdelante: { aplica: null, duracionDiaria: '' },
    espaldaExtension: { aplica: null, duracionDiaria: '' },
    cuelloDobladoGirado: { aplica: null, duracionDiaria: '' },
    sentadoEspaldaInclinada: { aplica: null, duracionDiaria: '' },
    sentadoEspaldaGirada: { aplica: null, duracionDiaria: '' },
    trabajoCuclillas: { aplica: null, duracionDiaria: '' },
    trabajoRodillas: { aplica: null, duracionDiaria: '' },
  },
  paso4: {
    levantamiento40kg: { aplica: null, duracionDiaria: '' },
    levantamiento25kg: { aplica: null, duracionDiaria: '' },
    levantamiento5kg: { aplica: null, duracionDiaria: '' },
    levantamientoMenor3kg: { aplica: null, duracionDiaria: '' },
  },
  paso5: {
    esfuerzoManos: {
      manipulacionPinzaMayor1kg: { aplica: null, duracionDiaria: '' },
      munecasFlexionadasAgarre: { aplica: null, duracionDiaria: '' },
      accionAtornillar: { aplica: null, duracionDiaria: '' },
      impactoRepetido: { aplica: null, duracionDiaria: '' },
      vibracionBrazoMano: { aplica: null, duracionDiaria: '' },
    },
    movimientosAltaFrecuencia: {
      repiteMovimiento4vecesMinuto2horas: { aplica: null, duracionDiaria: '' },
    },
  },
  evaluacion: {
    movimientosRepetitivos: { dx: '', ix: '' },
    posturaForzada: { d: '', i: '' },
    levantamientoCargas: { niosh: '' },
  },
  paso7Adicional: {
    sector: '',
    numeroEvaluaciones: '',
  },
};
