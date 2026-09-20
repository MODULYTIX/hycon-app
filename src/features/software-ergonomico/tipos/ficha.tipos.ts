// Tipos base para el registro de una ficha ergonómica

export interface DatosAdministrativos {
  area: string;
  puesto: string;
  resumenPuesto: string;
  actividad: string;
  superintendencia: string;
  gerencia: string;
  duracionMinutos: string; // lo guardamos como string para el input y lo parseamos luego
  frecuencia: 'cotidiana' | 'no_cotidiana' | '';
}

export interface DatosRepresentatividad {
  duracionMayor120: boolean;
  requiereIdentificacion: boolean; // Automático: duracion > 120 && cotidiana
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
  levantamiento40kg: { aplica: boolean; frecuencia: string };
  levantamiento25kg: { aplica: boolean; frecuencia: string };
  levantamiento5kg: { aplica: boolean; frecuencia: string };
}

export interface MovimientosRepetitivos {
  esfuerzoManos: {
    manipulacionMenor3kg: boolean;
    manipulacionPinzaMayor1kg: boolean;
    munecasFlexionadasAgarre: boolean;
    accionAtornillar: boolean;
  };
  movimientosAltaFrecuencia: {
    repiteMovimiento4vecesMinuto2horas: boolean;
  };
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
    duracionMinutos: '',
    frecuencia: '',
  },
  paso2: {
    duracionMayor120: false,
    requiereIdentificacion: false,
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
    levantamiento40kg: { aplica: false, frecuencia: '' },
    levantamiento25kg: { aplica: false, frecuencia: '' },
    levantamiento5kg: { aplica: false, frecuencia: '' },
  },
  paso5: {
    esfuerzoManos: {
      manipulacionMenor3kg: false,
      manipulacionPinzaMayor1kg: false,
      munecasFlexionadasAgarre: false,
      accionAtornillar: false,
    },
    movimientosAltaFrecuencia: {
      repiteMovimiento4vecesMinuto2horas: false,
    },
  },
  paso7Adicional: {
    sector: '',
    numeroEvaluaciones: '',
  },
};
