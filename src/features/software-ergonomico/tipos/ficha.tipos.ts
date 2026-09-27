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
  cotidiana: boolean; // Frecuencia cotidiana / diaria (Sí / No)
  duracionMayor120: boolean; // Automático: duracionMinutos > 120
  requiereIdentificacion: boolean; // Automático: duracion > 120 && cotidiana
  identificacionErgonomica: string; // Texto libre, solo se muestra si requiereIdentificacion
}

export interface FactorPostura {
  aplica: boolean;
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
  empujeTraccion: { iso11228: string };
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
    cotidiana: false,
    duracionMayor120: false,
    requiereIdentificacion: false,
    identificacionErgonomica: '',
  },
  paso3: {
    manosSobreCabeza: { aplica: false, duracionDiaria: '' },
    codosSobreHombro: { aplica: false, duracionDiaria: '' },
    espaldaInclinadaAdelante: { aplica: false, duracionDiaria: '' },
    espaldaExtension: { aplica: false, duracionDiaria: '' },
    cuelloDobladoGirado: { aplica: false, duracionDiaria: '' },
    sentadoEspaldaInclinada: { aplica: false, duracionDiaria: '' },
    sentadoEspaldaGirada: { aplica: false, duracionDiaria: '' },
    trabajoCuclillas: { aplica: false, duracionDiaria: '' },
    trabajoRodillas: { aplica: false, duracionDiaria: '' },
  },
  paso4: {
    levantamiento40kg: { aplica: false, duracionDiaria: '' },
    levantamiento25kg: { aplica: false, duracionDiaria: '' },
    levantamiento5kg: { aplica: false, duracionDiaria: '' },
    levantamientoMenor3kg: { aplica: false, duracionDiaria: '' },
  },
  paso5: {
    esfuerzoManos: {
      manipulacionPinzaMayor1kg: { aplica: false, duracionDiaria: '' },
      munecasFlexionadasAgarre: { aplica: false, duracionDiaria: '' },
      accionAtornillar: { aplica: false, duracionDiaria: '' },
    },
    movimientosAltaFrecuencia: {
      repiteMovimiento4vecesMinuto2horas: { aplica: false, duracionDiaria: '' },
    },
  },
  evaluacion: {
    movimientosRepetitivos: { dx: '', ix: '' },
    posturaForzada: { d: '', i: '' },
    levantamientoCargas: { niosh: '' },
    empujeTraccion: { iso11228: '' },
  },
  paso7Adicional: {
    sector: '',
    numeroEvaluaciones: '',
  },
};
