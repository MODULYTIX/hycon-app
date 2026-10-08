// Validaciones de la pantalla de pago. Son locales: los datos de la tarjeta
// solo se usan aqui para comprobar el formato, nunca salen del navegador.

export type MarcaTarjeta = 'visa' | 'mastercard' | 'amex' | 'diners' | 'desconocida';

const SOLO_DIGITOS = /\D/g;

export const soloDigitos = (valor: string): string => valor.replace(SOLO_DIGITOS, '');

/** 4111111111111111 -> 4111 1111 1111 1111, como se escribe en una tarjeta. */
export const formatearNumeroTarjeta = (valor: string): string =>
  soloDigitos(valor)
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

/** 0926 -> 09/26, y no deja escribir un mes imposible. */
export const formatearVencimiento = (valor: string): string => {
  const digitos = soloDigitos(valor).slice(0, 4);
  if (digitos.length <= 2) return digitos;
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
};

export const marcaDeTarjeta = (numero: string): MarcaTarjeta => {
  const digitos = soloDigitos(numero);
  if (/^4/.test(digitos)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digitos)) return 'mastercard';
  if (/^3[47]/.test(digitos)) return 'amex';
  if (/^3(0[0-5]|[68])/.test(digitos)) return 'diners';
  return 'desconocida';
};

// Luhn: el mismo digito de control que usan los bancos, asi un numero
// inventado al azar no pasa la pantalla de pago
export const numeroTarjetaValido = (numero: string): boolean => {
  const digitos = soloDigitos(numero);
  if (digitos.length < 15 || digitos.length > 16) return false;

  let suma = 0;
  let duplicar = false;
  for (let posicion = digitos.length - 1; posicion >= 0; posicion -= 1) {
    let cifra = Number(digitos[posicion]);
    if (duplicar) {
      cifra *= 2;
      if (cifra > 9) cifra -= 9;
    }
    suma += cifra;
    duplicar = !duplicar;
  }
  return suma % 10 === 0;
};

/** El mes debe existir y la tarjeta no puede estar vencida. */
export const vencimientoValido = (valor: string, hoy = new Date()): boolean => {
  const digitos = soloDigitos(valor);
  if (digitos.length !== 4) return false;

  const mes = Number(digitos.slice(0, 2));
  const anio = 2000 + Number(digitos.slice(2));
  if (mes < 1 || mes > 12) return false;

  // Vale todo el mes impreso en la tarjeta: vence el ultimo dia
  const finDeMes = new Date(anio, mes, 0, 23, 59, 59);
  return finDeMes >= hoy;
};

// Amex pide cuatro digitos; el resto, tres
export const cvvValido = (cvv: string, numero = ''): boolean => {
  const largo = marcaDeTarjeta(numero) === 'amex' ? 4 : 3;
  return new RegExp(`^\\d{${largo}}$`).test(soloDigitos(cvv));
};

export const titularValido = (titular: string): boolean => titular.trim().length >= 5;

/** El codigo de aprobacion de Yape son seis digitos. */
export const codigoYapeValido = (codigo: string): boolean => /^\d{6}$/.test(soloDigitos(codigo));

export interface DatosTarjeta {
  numero: string;
  titular: string;
  vencimiento: string;
  cvv: string;
}

export type ErroresTarjeta = Partial<Record<keyof DatosTarjeta, string>>;

/** Devuelve solo los campos con problema; vacio significa que se puede cobrar. */
export const revisarTarjeta = (datos: DatosTarjeta, hoy = new Date()): ErroresTarjeta => {
  const errores: ErroresTarjeta = {};
  if (!numeroTarjetaValido(datos.numero)) errores.numero = 'Revisa el número de la tarjeta';
  if (!titularValido(datos.titular)) errores.titular = 'Escribe el nombre tal como figura en la tarjeta';
  if (!vencimientoValido(datos.vencimiento, hoy)) errores.vencimiento = 'Fecha no válida';
  if (!cvvValido(datos.cvv, datos.numero)) errores.cvv = 'Código incompleto';
  return errores;
};

// Ultimos cuatro digitos para el resumen; nunca se guarda el numero entero
export const ultimosCuatro = (numero: string): string => soloDigitos(numero).slice(-4);
