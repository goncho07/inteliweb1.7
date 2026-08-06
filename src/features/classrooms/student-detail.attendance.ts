import { AlertTriangle, Clock, type LucideIcon } from 'lucide-react';

import { INCIDENT_TYPES } from '@/data/education';
import { formatShortDate } from '@/features/classrooms/overview.rows';
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

/** Faltas y tardanzas del mes, convertidas en entradas del historial. */
const attendanceEntries = (days: (AttendanceCalendarDay | null)[]): PersonalIncidentEntry[] =>
  days
    .filter(
      (day): day is AttendanceCalendarDay =>
        day !== null && (day.originalStatus === 'Falta' || day.originalStatus === 'Tardanza'),
    )
    .map((day) => {
      const isFalta = day.originalStatus === 'Falta';
      const isJustified = day.status === 'Justificada';

      return {
        id: `att-in-${day.date}`,
        date: day.date,
        dateLabel: formatShortDate(new Date(`${day.date}T00:00:00`)),
        time: isFalta ? '08:00' : '08:15',
        teacher: null,
        label: isFalta ? 'Inasistencia' : 'Tardanza',
        category: isFalta ? 'Grave' : 'Leve',
        icon: (isFalta ? AlertTriangle : Clock) as LucideIcon,
        tone: isJustified ? 'info' : isFalta ? 'danger' : 'warning',
        description: isJustified
          ? `Justificada por el docente: ${day.justification || 'sin observación'}.`
          : `Registro de ${day.originalStatus.toLowerCase()} en el sistema de asistencia.`,
      } satisfies PersonalIncidentEntry;
    });

/** Constancias con las que un docente cierra el registro de una incidencia. */
const INCIDENT_NOTES = [
  'Se dejó constancia del hecho en el cuaderno de incidencias del aula.',
  'El docente conversó con el estudiante y registró lo ocurrido.',
  'Se comunicó lo ocurrido al apoderado por el canal habitual.',
];

/** Incidencias de conducta simuladas del mes: tipo, día y hora estables por alumno. */
const behaviourEntries = (studentName: string, cursor: Date): PersonalIncidentEntry[] => {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const teachers = ['Prof. María Gómez', 'Prof. Carlos Ruiz', 'Prof. Juan Vargas'];
  const times = ['08:15', '10:30', '12:00'];

  return teachers.map((teacher, index) => {
    const seed = `${studentName}-incidencia-${year}-${month}-${index}`;
    const dayNumber = 1 + Math.floor(pseudoRandom(`${seed}-dia`) * lastDay);
    const type = INCIDENT_TYPES[Math.floor(pseudoRandom(`${seed}-tipo`) * INCIDENT_TYPES.length)];
    const date = toIsoDate(new Date(year, month, dayNumber));

    return {
      id: `inc-${date}-${index}`,
      date,
      dateLabel: formatShortDate(new Date(year, month, dayNumber)),
      time: times[index],
      teacher,
      label: type.label,
      category: type.category,
      icon: type.icon as LucideIcon,
      tone: type.category === 'Grave' ? 'danger' : type.category === 'Moderada' ? 'warning' : 'neutral',
      description: INCIDENT_NOTES[Math.floor(pseudoRandom(`${seed}-nota`) * INCIDENT_NOTES.length)],
    } satisfies PersonalIncidentEntry;
  });
};

/**
 * Historial del mes: incidencias de conducta + faltas y tardanzas, de la más
 * reciente a la más antigua — el orden en el que un docente busca "qué pasó
 * últimamente".
 */
export const buildPersonalIncidents = (
  studentName: string,
  cursor: Date,
  days: (AttendanceCalendarDay | null)[],
): PersonalIncidentEntry[] =>
  [...behaviourEntries(studentName, cursor), ...attendanceEntries(days)].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
