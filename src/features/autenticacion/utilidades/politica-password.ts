import { CONTRASENAS_COMUNES } from '@/features/autenticacion/utilidades/contrasenas-comunes';

// Replica de hycon-backend/src/modules/auth/auth.politica.ts (NIST SP 800-63B / OWASP ASVS).
// Sirve para guiar mientras se escribe; el backend vuelve a aplicarla al guardar.
export const LARGO_MINIMO_PASSWORD = 12;
export const LARGO_MAXIMO_PASSWORD = 128;
const BYTES_MAXIMOS_PASSWORD = 72;

export interface DatosPersonales {
  email?: string;
  name?: string;
  lastname?: string;
}

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const esRepeticion = (texto: string) => /^(.{1,3})\1+$/.test(texto);

const esSecuencia = (texto: string) => {
  if (texto.length < 4) return false;
  const pasos = new Set<number>();
  for (let i = 1; i < texto.length; i += 1) pasos.add(texto.charCodeAt(i) - texto.charCodeAt(i - 1));
  return pasos.size === 1 && [1, -1].includes([...pasos][0]);
};

const fragmentosPersonales = ({ email, name, lastname }: DatosPersonales): string[] => {
  const local = email ? email.split('@')[0] : '';
  return [local, ...local.split(/[._\-+]/), name ?? '', ...(name ?? '').split(/\s+/), lastname ?? '', ...(lastname ?? '').split(/\s+/)]
    .map(normalizar)
    .filter((fragmento) => fragmento.length >= 4);
};

export const esComunOPrevisible = (password: string): boolean => {
  const limpia = normalizar(password);
  const sinFinal = limpia.replace(/[\d\W_]+$/, '');
  return (
    CONTRASENAS_COMUNES.has(limpia) ||
    (sinFinal.length >= 4 && CONTRASENAS_COMUNES.has(sinFinal)) ||
    esRepeticion(limpia) ||
    esSecuencia(limpia)
  );
};

export const contieneDatosPersonales = (password: string, datos: DatosPersonales): boolean => {
  const compacta = normalizar(password).replace(/[\s._-]/g, '');
  return fragmentosPersonales(datos).some((fragmento) =>
    compacta.includes(fragmento.replace(/[\s._-]/g, ''))
  );
};

export interface RequisitoPassword {
  id: 'largo' | 'comun' | 'personal';
  texto: string;
  cumple: boolean;
}

// Lista que ve quien se registra, con cada regla marcada en vivo
export const requisitosPassword = (password: string, datos: DatosPersonales): RequisitoPassword[] => {
  const escrita = password.length > 0;
  return [
    {
      id: 'largo',
      texto: `Al menos ${LARGO_MINIMO_PASSWORD} caracteres`,
      cumple: password.length >= LARGO_MINIMO_PASSWORD && password.length <= LARGO_MAXIMO_PASSWORD,
    },
    { id: 'comun', texto: 'No es una contraseña común ni fácil de adivinar', cumple: escrita && !esComunOPrevisible(password) },
    { id: 'personal', texto: 'No incluye tu nombre ni tu correo', cumple: escrita && !contieneDatosPersonales(password, datos) },
  ];
};

export const evaluarPassword = (password: string, datos: DatosPersonales = {}): string | undefined => {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < LARGO_MINIMO_PASSWORD) return `Debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres`;
  if (password.length > LARGO_MAXIMO_PASSWORD) return `No puede superar los ${LARGO_MAXIMO_PASSWORD} caracteres`;
  if (new TextEncoder().encode(password).length > BYTES_MAXIMOS_PASSWORD) return 'Es demasiado larga para guardarse de forma segura';
  if (esComunOPrevisible(password)) return 'Es muy común o fácil de adivinar. Elige otra';
  if (contieneDatosPersonales(password, datos)) return 'No debe contener tu nombre ni tu correo';
  return undefined;
};

/**
 * Nivel para la barra: 0 vacia, 1 no cumple la politica, 2 cumple, 3 cumple con margen.
 * La longitud pesa mas que la variedad de caracteres, como recomienda NIST.
 */
export const calcularFuerzaPassword = (password: string, datos: DatosPersonales = {}): 0 | 1 | 2 | 3 => {
  if (!password) return 0;
  if (evaluarPassword(password, datos)) return 1;
  const clases = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((patron) => patron.test(password)).length;
  return password.length >= 16 || (password.length >= 14 && clases >= 3) ? 3 : 2;
};
