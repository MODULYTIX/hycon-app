import { describe, expect, it } from 'vitest';
import { normalizarFicha, factoresFicha, estadoFactor, actualizarFactor, resumenFicha, validarFicha } from './ficha';

describe('criterios de identificación ergonómica', () => {
  it.each([
    ['119', true, false], ['120', true, true], ['121', true, true],
    ['120', false, false], ['120', null, false], ['', true, false],
  ] as const)('representatividad con %s minutos y cotidiana=%s: %s', (duracionMinutos, cotidiana, esperado) => {
    const d = normalizarFicha({ paso2: { duracionMinutos, cotidiana } });
    expect(d.paso2.requiereIdentificacion).toBe(esperado);
  });

  it.each([
    ['manosSobreCabeza', '119', 'registrado'], ['manosSobreCabeza', '120', 'evaluar'],
    ['manosSobreCabeza', '121', 'evaluar'], ['impactoRepetido', '120', 'registrado'],
    ['impactoRepetido', '121', 'evaluar'], ['vibracionBrazoMano', '29', 'registrado'],
    ['vibracionBrazoMano', '30', 'registrado'], ['vibracionBrazoMano', '31', 'evaluar'],
  ])('%s con %s minutos: %s', (id, minutos, esperado) => {
    const d = normalizarFicha(null);
    const f = factoresFicha(d).find(f => f.id === id)!;
    expect(estadoFactor({ ...f, valor: { aplica: true, duracionDiaria: minutos } })).toBe(esperado);
  });
  it('evalúa cargas de 40 kg por Sí, sin minutos y sin depender de la representatividad', () => {
    const d = normalizarFicha(null);
    const f = factoresFicha(d).find(f => f.id === 'levantamiento40kg')!;
    const cambiado = actualizarFactor(d, f, { aplica: true, duracionDiaria: '' });
    expect(cambiado.paso2.requiereIdentificacion).toBe(false);
    expect(resumenFicha(cambiado).evaluar.map(f => f.id)).toContain('levantamiento40kg');
    expect(resumenFicha(cambiado).resultadosPendientes).toHaveLength(1);
    expect(validarFicha(cambiado)).toBeNull();
  });
  it('permite guardar vibración de 31 minutos y OCRA pendiente aunque la tarea no supere 120', () => {
    let d = normalizarFicha(null);
    d.paso2.duracionMinutos = '60'; d.paso2.cotidiana = true;
    const f = factoresFicha(d).find(f => f.id === 'vibracionBrazoMano')!;
    d = actualizarFactor(d, f, { aplica: true, duracionDiaria: '31' });
    expect(resumenFicha(d).evaluar).toHaveLength(1);
    expect(resumenFicha(d).resultadosPendientes).toHaveLength(2);
    expect(validarFicha(d)).toBeNull();
  });
  it('distingue sin responder, No y Sí con duración pendiente', () => {
    const f = factoresFicha(normalizarFicha(null))[0];
    expect(estadoFactor(f)).toBe('pendiente');
    expect(estadoFactor({ ...f, valor: { aplica: false, duracionDiaria: '' } })).toBe('no');
    expect(estadoFactor({ ...f, valor: { aplica: true, duracionDiaria: '' } })).toBe('pendiente');
    expect(resumenFicha(normalizarFicha(null)).estado).toBe('En registro');
  });
  it('normaliza fichas antiguas sin borrar valores ni campos adicionales', () => {
    const original = {
      paso1: { puesto: 'Operador', area: 'Almacén' }, paso2: { duracionMinutos: '180', cotidiana: false },
      paso3: { manosSobreCabeza: { aplica: true, duracionDiaria: '140' } },
      paso5: { esfuerzoManos: { accionAtornillar: { aplica: false, duracionDiaria: '' } } },
      evaluacion: { posturaForzada: { d: '6', i: '2' } },
      extensionHistorica: { referencia: 'original' },
    };
    const d = normalizarFicha(original);
    expect(d.paso1.puesto).toBe('Operador');
    expect(d.paso2.cotidiana).toBe(false);
    expect(d.paso3.manosSobreCabeza).toEqual({ aplica: true, duracionDiaria: '140' });
    expect(d.paso5.esfuerzoManos.impactoRepetido.aplica).toBeNull();
    expect(d.evaluacion.posturaForzada.d).toBe('6');
    expect(d).toHaveProperty('extensionHistorica.referencia', 'original');
    expect(original).not.toHaveProperty('paso5.esfuerzoManos.impactoRepetido');
  });
  it('roundtrip de nuevos factores y resultados conserva los datos', () => {
    const d = normalizarFicha(null);
    d.paso5.esfuerzoManos.impactoRepetido = { aplica: true, duracionDiaria: '121' };
    d.paso5.esfuerzoManos.vibracionBrazoMano = { aplica: true, duracionDiaria: '31' };
    d.evaluacion.movimientosRepetitivos = { dx: '12.5', ix: '' };
    const recargada = normalizarFicha(JSON.parse(JSON.stringify(d)));
    expect(recargada).toEqual(d);
    expect(resumenFicha(recargada).evaluar).toHaveLength(2);
    expect(resumenFicha(recargada).resultadosPendientes).toHaveLength(1);
  });
  it('no considera válidas duraciones negativas, infinitas o superiores a un día', () => {
    const d = normalizarFicha(null);
    d.paso2.duracionMinutos = '1441';
    expect(validarFicha(d)?.seccion).toBe('tarea');
    d.paso2.duracionMinutos = 'NaN';
    expect(validarFicha(d)).not.toBeNull();
    d.paso2.duracionMinutos = '';
    d.evaluacion.movimientosRepetitivos.dx = '-1';
    expect(validarFicha(d)?.seccion).toBe('repetitivos');
  });
  it('actualiza el estado de registro y de evaluación sin tratar los pendientes como No', () => {
    let d = normalizarFicha(null);
    d.paso1.area = 'Operaciones'; d.paso1.puesto = 'Operador';
    d.paso2.duracionMinutos = '60'; d.paso2.cotidiana = true;
    for (const f of factoresFicha(d)) d = actualizarFactor(d, f, { aplica: false, duracionDiaria: '' });
    expect(resumenFicha(d).estado).toBe('Registro completo');
    const vibracion = factoresFicha(d).find(f => f.id === 'vibracionBrazoMano')!;
    d = actualizarFactor(d, vibracion, { aplica: true, duracionDiaria: '31' });
    expect(resumenFicha(d).estado).toBe('Evaluación pendiente');
    d.evaluacion.movimientosRepetitivos = { dx: '0', ix: '12.5' };
    expect(resumenFicha(d).estado).toBe('Registro completo');
    expect(resumenFicha(d).evaluar).toHaveLength(1);
    expect(resumenFicha(d).resultadosPendientes).toHaveLength(0);
  });
});
