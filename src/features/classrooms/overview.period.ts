import { MONTH_NAMES, SCHOOL_YEAR_END, SCHOOL_YEAR_START } from '@/data/calendar';

/**
 * Navegación por mes de la Vista General del Aula. Los reportes del colegio
 * siempre se emiten por mes, así que no hay pestañas de periodo: un único
 * `cursor` (`Date`) apunta al mes en pantalla, y de él salen el rango de
 * fechas, la etiqueta del navegador y los pasos anterior/siguiente.
 *
 * Todo se mueve dentro del año escolar (`SCHOOL_YEAR_START`/`END`): el
 * navegador no llega a enero ni a febrero, y marzo empieza el día 16 —
 * el primer día de clases— en vez del 1.
 */

export interface PeriodRange {
  start: Date;
  end: Date;
}

/** Primer y último mes con clases, como fecha en su día 1. */
const FIRST_MONTH = new Date(SCHOOL_YEAR_START.getFullYear(), SCHOOL_YEAR_START.getMonth(), 1);
const LAST_MONTH = new Date(SCHOOL_YEAR_END.getFullYear(), SCHOOL_YEAR_END.getMonth(), 1);

/** Lleva `cursor` al mes con clases más cercano: nunca antes de marzo ni después de diciembre. */
export const clampToSchoolYear = (cursor: Date): Date => {
  const month = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  if (month < FIRST_MONTH) return new Date(FIRST_MONTH);
  if (month > LAST_MONTH) return new Date(LAST_MONTH);
  return new Date(month);
};

/**
 * Días del mes en el que cae `cursor`, recortados solo por el final del año
 * escolar (diciembre acaba el 18). Marzo sí muestra el mes completo desde el
 * día 1: los días previos al 16 no son "días de clase", pero la cuadrícula
 * los necesita para pintarlos como el tramo de vacaciones que son —
 * `getSchoolTerm` ya los marca `isVacation` en `buildSchoolDays`.
 */
export const getMonthRange = (cursor: Date): PeriodRange => {
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  return {
    start,
    end: end > SCHOOL_YEAR_END ? new Date(SCHOOL_YEAR_END) : end,
  };
};

/** Si el navegador de mes puede dar un paso más en esa dirección sin salirse del año escolar. */
export const canStepMonth = (cursor: Date, direction: 1 | -1): boolean => {
  const month = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  return direction === -1 ? month > FIRST_MONTH : month < LAST_MONTH;
};

/** Etiqueta legible del mes en pantalla, la que se ve en el navegador ("‹ Marzo 2026 ›"). */
export const getMonthLabel = (cursor: Date): string =>
  `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;

/**
 * Solo el nombre del mes ("Marzo"), sin año.
 *
 * Para navegadores que no pueden salirse del año escolar: ahí el año es
 * siempre el mismo y repetirlo solo alarga la etiqueta. El año sí se escribe
 * en los textos que salen de la pantalla —descargas, avisos— donde no hay
 * contexto que lo dé por sabido (`getMonthLabel`).
 */
export const getMonthName = (cursor: Date): string => MONTH_NAMES[cursor.getMonth()];

/** Mes anterior (-1) o siguiente (+1), sin salirse del año escolar. */
export const stepMonth = (cursor: Date, direction: 1 | -1): Date =>
  clampToSchoolYear(new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1));

/** Si dos fechas caen en el mismo mes: sirve para saber si "Hoy" tiene algo que hacer. */
export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** Si `date` es el día de hoy — la columna que la cuadrícula remarca. */
export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
