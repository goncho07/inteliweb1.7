import type { LucideIcon } from 'lucide-react';

import { formatShortPersonName } from '@/features/classrooms/overview.format';
import { getMonthRange } from '@/features/classrooms/overview.period';
import {
  buildIncidentReportRows,
  buildSchoolDays,
  type OverviewStudent,
} from '@/features/classrooms/overview.rows';
import type {
  AttendanceCalendarDay,
  AttendanceStatus,
  IncidentTone,
  PersonalIncidentEntry,
} from '@/features/classrooms/types';
import { pseudoRandom } from '@/lib/pseudoRandom';

/**
 * Datos y colores del perfil del estudiante: el calendario de asistencia del
 * mes y el historial de incidencias que salen de él.
 *
 * Vive fuera de los componentes por dos motivos: la tarjeta de asistencia y la
 * de incidencias leen el mismo mes (una lo pinta, la otra lo convierte en
 * historial), y el color de cada estado se declara una sola vez en lugar de
 * repetirse en la celda, la leyenda y la ventana de notificaciones.
 */

/* -------------------------------------------------------------------------
 * Colores por estado
 * ---------------------------------------------------------------------- */

interface AttendanceStatusStyle {
  /** Celda del calendario. */
  cell: string;
  /** Punto de la leyenda: el mismo relleno y borde, en pequeño. */
  dot: string;
}

/**
 * Verde = presente, ámbar = atención (tardanza), rosa = negativo (falta), azul
 * = resuelto (justificada). Texto en el tono 700/800 sobre fondo 100 para
 * mantener el contraste AA también en las celdas pequeñas.
 */
export const ATTENDANCE_STATUS_STYLES: Record<AttendanceStatus, AttendanceStatusStyle> = {
  Presente: {
    cell: 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    dot: 'border-emerald-200 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/40',
  },
  Tardanza: {
    cell: 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    dot: 'border-amber-200 bg-amber-100 dark:border-amber-800 dark:bg-amber-900/40',
  },
  Falta: {
    cell: 'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    dot: 'border-rose-200 bg-rose-100 dark:border-rose-800 dark:bg-rose-900/40',
  },
  Justificada: {
    cell: 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    dot: 'border-blue-200 bg-blue-100 dark:border-blue-800 dark:bg-blue-900/40',
  },
  'Sin registro': {
    cell: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400',
    dot: 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800',
  },
};

/** Orden de la leyenda del calendario: del mejor al peor estado, y al final el resuelto. */
export const ATTENDANCE_LEGEND: AttendanceStatus[] = ['Presente', 'Tardanza', 'Falta', 'Justificada'];

/* -------------------------------------------------------------------------
 * Hora de entrada y salida de un día
 * ---------------------------------------------------------------------- */

/** Hora límite de entrada: a partir de aquí el registro pasa a Tardanza. */
export const ATTENDANCE_ENTRY_LIMIT = '08:00';
/** Hora de entrada registrada cuando el día es Tardanza (fija, igual que en el historial de incidencias). */
const LATE_ENTRY_TIME = '08:15';
/** Hora de salida del colegio, la misma todos los días lectivos. */
export const ATTENDANCE_EXIT_TIME = '15:30';

export interface AttendanceDayTimes {
  /** `null` cuando el estudiante no asistió ese día (Falta sin justificar entrada). */
  entryTime: string | null;
  exitTime: string | null;
}

/** Hora de entrada estable antes del límite (7:30-7:59), para un día Presente. */
const onTimeEntry = (studentName: string, isoDate: string): string => {
  const minute = 30 + Math.floor(pseudoRandom(`${studentName}-entrada-${isoDate}`) * 30);
  return `07:${String(minute).padStart(2, '0')}`;
};

/**
 * Hora de entrada y salida de un día del calendario, a partir de su estado
 * registrado (`originalStatus`, no el estado ya justificado): un día
 * justificado sigue mostrando la hora real con la que se marcó tardanza, o
 * ninguna hora si fue una falta.
 */
export const getAttendanceDayTimes = (
  studentName: string,
  day: AttendanceCalendarDay,
): AttendanceDayTimes => {
  if (day.isWeekend || day.originalStatus === 'Falta') return { entryTime: null, exitTime: null };
  if (day.originalStatus === 'Tardanza') return { entryTime: LATE_ENTRY_TIME, exitTime: ATTENDANCE_EXIT_TIME };
  if (day.originalStatus === 'Presente') {
    return { entryTime: onTimeEntry(studentName, day.date), exitTime: ATTENDANCE_EXIT_TIME };
  }
  return { entryTime: null, exitTime: null };
};

/** Traducción de la intención de color de una incidencia a clases de Tailwind. */
export const INCIDENT_TONE_STYLES: Record<IncidentTone, string> = {
  neutral:
    'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  warning:
    'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  danger:
    'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  info: 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

/* -------------------------------------------------------------------------
 * Calendario del mes
 * ---------------------------------------------------------------------- */

/** Fecha ISO "YYYY-MM-DD", la clave con la que se indexan las justificaciones. */
const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/**
 * Estado registrado de un día lectivo. Determinista por alumno y fecha
 * (`pseudoRandom`): el mismo alumno muestra siempre el mismo mes, aunque el
 * componente vuelva a renderizar.
 */
const registeredStatus = (studentName: string, isoDate: string): AttendanceStatus => {
  const roll = pseudoRandom(`${studentName}-asistencia-${isoDate}`);
  if (roll < 0.08) return 'Falta';
  if (roll < 0.24) return 'Tardanza';
  return 'Presente';
};

/**
 * Semanas que se dibujan siempre, tenga el mes 4, 5 o 6 filas reales.
 *
 * Un mes de 28 días que empieza en lunes ocupa 4 filas y uno de 31 que empieza
 * en domingo ocupa 6: si la rejilla se ajustara al mes, el calendario cambiaría
 * de alto —y con él toda la columna— cada vez que se pulsa la flecha. Se
 * rellena hasta 6×7 con huecos para que el bloque mida siempre lo mismo.
 */
const CALENDAR_CELLS = 42;

/**
 * Rejilla del mes que empieza en lunes: `null` en los huecos previos al día 1,
 * y un día por cada fecha del mes. `justifiedDays` marca las faltas y
 * tardanzas ya justificadas por el docente.
 */
export const buildAttendanceMonth = (
  studentName: string,
  cursor: Date,
  justifiedDays: Record<string, string>,
): (AttendanceCalendarDay | null)[] => {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  // `getDay()` es 0 = domingo; la rejilla arranca en lunes.
  const firstWeekday = new Date(year, month, 1).getDay();
  const leadingBlanks = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const days: (AttendanceCalendarDay | null)[] = Array.from({ length: leadingBlanks }, () => null);

  for (let dayNumber = 1; dayNumber <= lastDay; dayNumber++) {
    const current = new Date(year, month, dayNumber);
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;
    const date = toIsoDate(current);
    const originalStatus: AttendanceStatus = isWeekend
      ? 'Sin registro'
      : registeredStatus(studentName, date);
    const justification = justifiedDays[date];

    days.push({
      date,
      dayNumber,
      isWeekend,
      originalStatus,
      status: justification !== undefined ? 'Justificada' : originalStatus,
      justification,
    });
  }

  // Huecos de cola hasta completar las 6 semanas.
  while (days.length < CALENDAR_CELLS) days.push(null);

  return days;
};

/* -------------------------------------------------------------------------
 * Historial de incidencias del mes
 * ---------------------------------------------------------------------- */

/** Datos del alumno que necesita el generador de incidencias: el mismo alumno que filtra la Vista General del Aula. */
export interface StudentForIncidents extends OverviewStudent {
  level: string;
  grade: string;
  section: string;
}

/**
 * Historial de incidencias de conducta del mes, para un solo alumno.
 *
 * Reutiliza `buildIncidentReportRows` — el mismo generador que arma la
 * pestaña Incidencias de la Vista General del Aula — con la semilla del aula
 * del alumno (`nivel-grado-sección`), así que un mismo día y una misma
 * incidencia se ven igual desde el aula y desde el perfil del alumno; no se
 * inventa un catálogo de incidencias aparte. Las faltas y tardanzas no son
 * incidencias — su propio registro vive en la tarjeta de Asistencia.
 */
export const buildPersonalIncidents = (student: StudentForIncidents, cursor: Date): PersonalIncidentEntry[] => {
  const { start, end } = getMonthRange(cursor);
  const schoolDays = buildSchoolDays(start, end);
  const aulaSeed = `${student.level}-${student.grade}-${student.section}`;
  // Sin corte de "hoy": a diferencia de la Vista General del Aula, el perfil
  // del alumno navega libremente cualquier mes del año escolar, incluidos
  // los que ya pasaron por completo.
  const today = end;

  return buildIncidentReportRows(aulaSeed, [student], schoolDays, today)
    .map(
      (row): PersonalIncidentEntry => ({
        id: row.id,
        date: toIsoDate(row.date),
        dateLabel: row.dateLabel,
        time: row.timeLabel,
        // Nombre corto (primer apellido + nombre, con "Prof."): la ficha del
        // alumno no necesita el nombre completo del docente para identificarlo.
        teacher: `Prof. ${formatShortPersonName(row.teacherName)}`,
        label: row.type.label,
        category: row.type.category,
        icon: row.type.icon as LucideIcon,
        tone: row.type.category === 'Grave' ? 'danger' : row.type.category === 'Moderada' ? 'warning' : 'neutral',
        description: row.description,
      }),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
};
