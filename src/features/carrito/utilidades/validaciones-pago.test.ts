import { describe, expect, it } from 'vitest';
import {
  codigoYapeValido,
  cvvValido,
  formatearNumeroTarjeta,
  formatearVencimiento,
  marcaDeTarjeta,
  numeroTarjetaValido,
  revisarTarjeta,
  ultimosCuatro,
  vencimientoValido,
} from './validaciones-pago';

const HOY = new Date('2026-10-07T12:00:00.000Z');
const VISA = '4111 1111 1111 1111';

describe('formato de la tarjeta', () => {
  it('agrupa el numero de cuatro en cuatro y corta en dieciseis digitos', () => {
    expect(formatearNumeroTarjeta('4111111111111111')).toBe('4111 1111 1111 1111');
    expect(formatearNumeroTarjeta('4111-1111')).toBe('4111 1111');
    expect(formatearNumeroTarjeta('41111111111111119999')).toBe('4111 1111 1111 1111');
  });

  it('escribe el vencimiento como MM/AA', () => {
    expect(formatearVencimiento('09')).toBe('09');
    expect(formatearVencimiento('0928')).toBe('09/28');
    expect(formatearVencimiento('09/2888')).toBe('09/28');
  });

  it('reconoce la marca por el primer digito', () => {
    expect(marcaDeTarjeta(VISA)).toBe('visa');
    expect(marcaDeTarjeta('5500 0000 0000 0004')).toBe('mastercard');
    expect(marcaDeTarjeta('3400 000000 00009')).toBe('amex');
    expect(marcaDeTarjeta('9999 9999 9999 9999')).toBe('desconocida');
  });

  it('del numero solo se guardan los ultimos cuatro digitos', () => {
    expect(ultimosCuatro(VISA)).toBe('1111');
  });
});

describe('numero de tarjeta', () => {
  it('acepta numeros con digito de control correcto', () => {
    expect(numeroTarjetaValido(VISA)).toBe(true);
    expect(numeroTarjetaValido('5500 0000 0000 0004')).toBe(true);
    expect(numeroTarjetaValido('3400 000000 00009')).toBe(true);
  });

  it('rechaza un numero inventado o incompleto', () => {
    expect(numeroTarjetaValido('4111 1111 1111 1112')).toBe(false);
    expect(numeroTarjetaValido('1234 5678 9012 3456')).toBe(false);
    expect(numeroTarjetaValido('4111 1111')).toBe(false);
    expect(numeroTarjetaValido('')).toBe(false);
  });
});

describe('vencimiento', () => {
  it('vale hasta el ultimo dia del mes impreso', () => {
    expect(vencimientoValido('10/26', HOY)).toBe(true);
    expect(vencimientoValido('01/30', HOY)).toBe(true);
  });

  it('rechaza una tarjeta vencida o un mes imposible', () => {
    expect(vencimientoValido('09/26', HOY)).toBe(false);
    expect(vencimientoValido('13/28', HOY)).toBe(false);
    expect(vencimientoValido('00/28', HOY)).toBe(false);
    expect(vencimientoValido('9/28', HOY)).toBe(false);
  });
});

describe('cvv y codigo de Yape', () => {
  it('pide tres digitos, o cuatro en Amex', () => {
    expect(cvvValido('123', VISA)).toBe(true);
    expect(cvvValido('1234', VISA)).toBe(false);
    expect(cvvValido('1234', '3400 000000 00009')).toBe(true);
    expect(cvvValido('12', VISA)).toBe(false);
  });

  it('el codigo de aprobacion de Yape son seis digitos', () => {
    expect(codigoYapeValido('123456')).toBe(true);
    expect(codigoYapeValido('12345')).toBe(false);
    expect(codigoYapeValido('abcdef')).toBe(false);
  });
});

describe('revisarTarjeta', () => {
  const valida = { numero: VISA, titular: 'Esau Morales', vencimiento: '10/28', cvv: '123' };

  it('sin errores se puede cobrar', () => {
    expect(revisarTarjeta(valida, HOY)).toEqual({});
  });

  it('senala cada campo con problema', () => {
    const errores = revisarTarjeta(
      { numero: '4111 1111 1111 1112', titular: 'Ana', vencimiento: '09/26', cvv: '1' },
      HOY
    );

    expect(Object.keys(errores)).toEqual(['numero', 'titular', 'vencimiento', 'cvv']);
  });
});
