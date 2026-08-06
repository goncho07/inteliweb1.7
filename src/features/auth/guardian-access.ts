import { pseudoRandom } from '@/lib/pseudoRandom';

/**
 * Reglas del acceso por DNI: longitudes de los tres campos que se escriben en
 * el login (DNI, celular y código) y el código simulado del apoderado.
 *
 * No hay backend: el código no se envía a ninguna parte, se deriva del DNI del
 * apoderado con `pseudoRandom` para que sea siempre el mismo entre renders y
 * la pantalla pueda mostrarlo como dato de demostración.
 */

/** DNI peruano: 8 dígitos. */
export const DNI_LENGTH = 8;

/** Celular peruano: 9 dígitos, siempre empieza por 9. */
export const PHONE_LENGTH = 9;

/** Código de verificación que se «envía» por WhatsApp. */
export const CODE_LENGTH = 6;

/** Deja solo dígitos: DNI, celular y código no admiten ningún otro carácter. */
export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

/**
 * Código de verificación del apoderado. `attempt` sube con cada reenvío, así
 * que «Reenviar código» produce uno distinto en vez de repetir el anterior.
 */
export const buildVerificationCode = (dni: string, attempt: number): string =>
  String(Math.floor(pseudoRandom(`codigo-apoderado-${dni}-${attempt}`) * 10 ** CODE_LENGTH)).padStart(
    CODE_LENGTH,
    '0',
  );

/**
 * Celular con los dígitos iniciales ocultos (`•••••4321`): sirve para que el
 * apoderado reconozca cuál tiene registrado sin enseñarlo entero en pantalla.
 */
export const maskPhone = (phone: string): string =>
  phone.length <= 4 ? phone : `${'•'.repeat(phone.length - 4)}${phone.slice(-4)}`;
