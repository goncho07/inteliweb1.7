/**
 * Formato de fechas relativo a "ahora", usado en el módulo de Citaciones:
 * la fila de la lista y los separadores de día de la conversación. Sin
 * dependencias externas de fechas (`date-fns`, etc.) — solo `Intl` nativo.
 */

export type RelativeDateBucket = 'hoy' | 'ayer' | 'semana' | 'mismo-anio' | 'otro-anio';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const SHORT_WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const SHORT_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Clasifica `date` respecto a `now` en un bucket relativo. `diffDays` es el
 * número de días completos entre el inicio del día de `now` y el de `date`
 * (positivo si `date` es pasado, negativo si es futuro). Las fechas futuras
 * nunca caen en 'ayer' ni 'semana': van directo a 'mismo-anio'/'otro-anio'.
 */
export function getRelativeDateBucket(date: Date, now: Date = new Date()): RelativeDateBucket {
  const diffDays = Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / MS_PER_DAY);

  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  if (diffDays >= 2 && diffDays <= 6) return 'semana';
  return date.getFullYear() === now.getFullYear() ? 'mismo-anio' : 'otro-anio';
}

const formatHour = (date: Date): string =>
  new Intl.DateTimeFormat('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);

const formatShortDate = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')} ${SHORT_MONTHS[date.getMonth()]}`;

/**
 * Timestamp puntual (fila de la lista de citaciones): 'hoy' muestra solo la
 * hora, el resto un formato cada vez más largo según qué tan lejos esté.
 */
export function formatRelativeTimestamp(date: Date, now: Date = new Date()): string {
  const bucket = getRelativeDateBucket(date, now);
  switch (bucket) {
    case 'hoy':
      return formatHour(date);
    case 'ayer':
      return 'Ayer';
    case 'semana':
      return SHORT_WEEKDAYS[date.getDay()];
    case 'mismo-anio':
      return formatShortDate(date);
    case 'otro-anio':
      return `${formatShortDate(date)} ${date.getFullYear()}`;
  }
}

/**
 * Etiqueta de separador de día (pestaña "Conversación"): 'hoy' y 'ayer' se
 * leen como palabras, no como hora — a diferencia de `formatRelativeTimestamp`.
 */
export function formatRelativeDayLabel(date: Date, now: Date = new Date()): string {
  const bucket = getRelativeDateBucket(date, now);
  if (bucket === 'hoy') return 'Hoy';
  if (bucket === 'ayer') return 'Ayer';
  return formatRelativeTimestamp(date, now);
}
