import { MONTH_NAMES } from '@/data/calendar';

/**
 * Navegación por mes de la Vista General del Aula. Los reportes del colegio
 * siempre se emiten por mes, así que no hay pestañas de periodo: un único
 * `cursor` (`Date`) apunta al mes en pantalla, y de él salen el rango de
 * fechas, la etiqueta del navegador y los pasos anterior/siguiente.
 */

export interface PeriodRange {
  start: Date;
  end: Date;
}

/** Primer y último día del mes en el que cae `cursor`. */
export const getMonthRange = (cursor: Date): PeriodRange => ({
  start: new Date(cursor.getFullYear(), cursor.getMonth(), 1),
  end: new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0),
});

/** Etiqueta legible del mes en pantalla, la que se ve en el navegador ("‹ Marzo 2026 ›"). */
export const getMonthLabel = (cursor: Date): string =>
  `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;

/** Mes anterior (-1) o siguiente (+1). */
export const stepMonth = (cursor: Date, direction: 1 | -1): Date =>
  new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1);

/** Si dos fechas caen en el mismo mes: sirve para saber si "Hoy" tiene algo que hacer. */
export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** Si `date` es el día de hoy — la columna que la cuadrícula remarca. */
export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
