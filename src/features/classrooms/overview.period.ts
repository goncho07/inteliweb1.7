import { MONTH_NAMES, YEAR } from '@/data/calendar';

import { isWeekendDay } from './overview.rows';

/**
 * Periodos y su navegación (mes/semana/día/bimestre) para la Vista General
 * del Aula. Un único "cursor" (`Date`) representa el punto donde está el
 * navegador; `getPeriodRange` lo traduce al rango de fechas real que hay que
 * mostrar según la pestaña de periodo activa.
 */

export type PeriodId = 'hoy' | 'dia' | 'semana' | 'mes' | 'bimestre';

export const PERIOD_TABS: { value: PeriodId; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'dia', label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'bimestre', label: 'Bimestre' },
];

export interface BimesterRange {
  index: 1 | 2 | 3 | 4;
  roman: 'I' | 'II' | 'III' | 'IV';
  start: Date;
  end: Date;
}

/**
 * Rango real de cada bimestre 2026, tomado de los hitos "INICIO/FIN
 * BIMESTRE" de `data/calendar.ts` (`EVENTS_2026`) — una sola fuente de
 * verdad para el calendario académico, sin volver a inventar fechas.
 */
export const BIMESTER_RANGES_2026: BimesterRange[] = [
  { index: 1, roman: 'I', start: new Date(YEAR, 2, 16), end: new Date(YEAR, 4, 15) }, // 16 mar – 15 may
  { index: 2, roman: 'II', start: new Date(YEAR, 4, 25), end: new Date(YEAR, 6, 24) }, // 25 may – 24 jul
  { index: 3, roman: 'III', start: new Date(YEAR, 7, 10), end: new Date(YEAR, 9, 9) }, // 10 ago – 09 oct
  { index: 4, roman: 'IV', start: new Date(YEAR, 9, 19), end: new Date(YEAR, 11, 18) }, // 19 oct – 18 dic
];

/** El bimestre que contiene `date`, o el más cercano si cae en vacaciones (entre dos bimestres). */
export const getBimesterForDate = (date: Date): BimesterRange => {
  const match = BIMESTER_RANGES_2026.find((b) => date >= b.start && date <= b.end);
  if (match) return match;
  const upcoming = BIMESTER_RANGES_2026.find((b) => date < b.start);
  return upcoming ?? BIMESTER_RANGES_2026[BIMESTER_RANGES_2026.length - 1];
};

const addDays = (date: Date, amount: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

/** Lunes de la semana que contiene `date` (asume `date` ya es un día de colegio, lunes a viernes). */
const getWeekStart = (date: Date): Date => addDays(date, -(date.getDay() - 1));

export interface PeriodRange {
  start: Date;
  end: Date;
}

/** Rango de fechas real a mostrar para una pestaña de periodo y un cursor dados. */
export const getPeriodRange = (period: PeriodId, cursor: Date, today: Date): PeriodRange => {
  switch (period) {
    case 'hoy':
      return { start: today, end: today };
    case 'dia':
      return { start: cursor, end: cursor };
    case 'semana': {
      const start = getWeekStart(cursor);
      return { start, end: addDays(start, 4) };
    }
    case 'mes': {
      const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      return { start, end };
    }
    case 'bimestre': {
      const bimester = getBimesterForDate(cursor);
      return { start: bimester.start, end: bimester.end };
    }
  }
};

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
const WEEKDAY_LONG_FORMATTER = new Intl.DateTimeFormat('es-PE', { weekday: 'long' });

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

/** Etiqueta legible del periodo activo, la que se ve en el navegador ("‹ Marzo 2026 ›"). */
export const getPeriodLabel = (period: PeriodId, cursor: Date, today: Date): string => {
  switch (period) {
    case 'hoy':
      return `Hoy, ${LONG_DATE_FORMATTER.format(today)}`;
    case 'dia':
      return `${capitalize(WEEKDAY_LONG_FORMATTER.format(cursor))} ${LONG_DATE_FORMATTER.format(cursor)}`;
    case 'semana': {
      const start = getWeekStart(cursor);
      const end = addDays(start, 4);
      const sameMonth = start.getMonth() === end.getMonth();
      const startLabel = sameMonth ? String(start.getDate()) : `${start.getDate()} ${MONTH_NAMES[start.getMonth()].slice(0, 3)}`;
      return `Semana del ${startLabel} al ${end.getDate()} de ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
    }
    case 'mes':
      return `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;
    case 'bimestre': {
      const bimester = getBimesterForDate(cursor);
      return `Bimestre ${bimester.roman} · ${MONTH_NAMES[bimester.start.getMonth()]} – ${MONTH_NAMES[bimester.end.getMonth()]} ${bimester.end.getFullYear()}`;
    }
  }
};

/** Siguiente cursor tras pulsar "anterior" (-1) o "siguiente" (+1) según la pestaña de periodo activa. */
export const stepPeriod = (period: PeriodId, cursor: Date, direction: 1 | -1): Date => {
  switch (period) {
    case 'hoy':
      return cursor;
    case 'dia': {
      let next = addDays(cursor, direction);
      while (isWeekendDay(next)) next = addDays(next, direction);
      return next;
    }
    case 'semana':
      return addDays(cursor, direction * 7);
    case 'mes':
      return new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1);
    case 'bimestre': {
      const current = getBimesterForDate(cursor);
      const nextIndex = Math.min(4, Math.max(1, current.index + direction)) as 1 | 2 | 3 | 4;
      return BIMESTER_RANGES_2026.find((b) => b.index === nextIndex)?.start ?? cursor;
    }
  }
};

/** El navegador de periodo no tiene nada que mostrar en "Hoy": no hay anterior/siguiente para un día fijo. */
export const periodHasNavigation = (period: PeriodId): boolean => period !== 'hoy';
