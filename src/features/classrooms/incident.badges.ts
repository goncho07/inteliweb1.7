import type { IncidentType } from '@/types';

/**
 * Color de la insignia de gravedad de una incidencia. Vive aquí —y no dentro
 * de una tabla— porque lo comparten la Vista General del Aula
 * (`IncidentsTable`) y el historial del perfil del estudiante
 * (`PersonalIncidentsCard`): la misma gravedad tiene que verse igual en las
 * dos pantallas.
 *
 * `amber` = atención (Moderada), `rose` = negativo (Grave), y un tono neutro
 * para Leve — el mismo mapeo semántico que usa el resto de la app
 * (`DESIGN_SYSTEM.md` § Color).
 */
export const CATEGORY_BADGE_CLASSES: Record<IncidentType['category'], string> = {
  Leve: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  Moderada: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  Grave: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
};

/** Orden de menor a mayor gravedad, el que siguen las leyendas. */
export const CATEGORY_ORDER: IncidentType['category'][] = ['Leve', 'Moderada', 'Grave'];
