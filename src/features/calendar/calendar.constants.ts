import type { CalendarEvent } from '@/types';

/**
 * Tipos de evento del calendario general, en el orden en que se muestran en
 * el filtro y en la leyenda de la cuadrícula.
 */
export const EVENT_TYPE_OPTIONS: { value: CalendarEvent['type']; label: string }[] = [
  { value: 'feriado', label: 'Feriado' },
  { value: 'academico', label: 'Académico' },
  { value: 'civico', label: 'Cívico' },
  { value: 'gestion', label: 'Gestión' },
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'incidencia', label: 'Incidencia' },
  { value: 'otros', label: 'Otros' },
];

/**
 * Etiquetas de la leyenda al pie de la cuadrícula: iguales que las del
 * filtro, salvo "incidencia" que aclara que corresponde a una citación.
 */
export const EVENT_TYPE_LEGEND_LABELS: Record<CalendarEvent['type'], string> = {
  feriado: 'Feriado',
  academico: 'Académico',
  civico: 'Cívico',
  gestion: 'Gestión',
  vacaciones: 'Vacaciones',
  incidencia: 'Incidencia (citación)',
  otros: 'Otros',
};
