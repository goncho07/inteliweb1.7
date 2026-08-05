import { DAY_NAMES } from '@/data/calendar';
import { INCIDENT_TYPES } from '@/data/education';
import { pseudoRandom } from '@/lib/pseudoRandom';
import type { IncidentType } from '@/types';

/**
 * Filas de contenido de las pestañas Asistencia e Incidencias de la Vista
 * General del Aula: una sola fuente de datos deterministas (semilla +
 * `pseudoRandom`) para que la tabla en pantalla y la descarga
 * (`overview.pdf.ts`) coincidan siempre.
 */

export const isWeekendDay = (date: Date): boolean => date.getDay() === 0 || date.getDay() === 6;

/** Alumno mínimo que necesitan las tablas de asistencia/incidencias — el mismo `id`/`name` que trae `UserItem`. */
export interface OverviewStudent {
  id: string;
  name: string;
}

/**
 * Estado de una celda de la cuadrícula alumnos × días. `sin-clase` cubre días
 * futuros (aún no ocurrieron) — nunca se inventa un estado de asistencia para
 * un día que no ha pasado. Los fines de semana ni siquiera llegan a ser una
 * columna (ver `buildSchoolDays`).
 */
export type AttendanceCellState = 'presente' | 'tardanza' | 'falta' | 'justificada' | 'sin-clase';

export const ATTENDANCE_CELL_META: Record<
  AttendanceCellState,
  { label: string; letter: string; textClassName: string; badgeClassName: string }
> = {
  presente: {
    label: 'Presente',
    letter: 'P',
    textClassName: 'text-emerald-600 dark:text-emerald-400',
    badgeClassName: 'bg-emerald-500 text-white',
  },
  tardanza: {
    label: 'Tardanza',
    letter: 'T',
    textClassName: 'text-amber-600 dark:text-amber-400',
    badgeClassName: 'bg-amber-500 text-white',
  },
  falta: {
    label: 'Faltó',
    letter: 'F',
    textClassName: 'text-rose-600 dark:text-rose-400',
    badgeClassName: 'bg-rose-500 text-white',
  },
  justificada: {
    label: 'Justificada',
    letter: 'J',
    textClassName: 'text-blue-600 dark:text-blue-400',
    badgeClassName: 'bg-blue-500 text-white',
  },
  'sin-clase': {
    label: 'Sin clase',
    letter: '—',
    textClassName: 'text-slate-300 dark:text-slate-600',
    badgeClassName: 'text-slate-300 dark:text-slate-600',
  },
};

export interface AttendanceGridDay {
  date: Date;
  dayLabel: string; // "01", "02"...
  weekdayLabel: string; // "LUN", "MAR"...
}

export interface AttendanceGridRow {
  id: string;
  name: string;
  cells: AttendanceCellState[]; // alineado 1 a 1 con el arreglo de días recibido
}

/** Días de colegio (lunes a viernes) entre `start` y `end` (ambos inclusive), con su etiqueta de día y día de semana. */
export const buildSchoolDays = (start: Date, end: Date): AttendanceGridDay[] => {
  const days: AttendanceGridDay[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    if (!isWeekendDay(cursor)) {
      days.push({
        date: new Date(cursor),
        dayLabel: String(cursor.getDate()).padStart(2, '0'),
        weekdayLabel: DAY_NAMES[cursor.getDay()].toUpperCase(),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

/** Grupo de columnas del encabezado de dos filas de la tabla de asistencia (una semana o un mes). */
export interface DayGroup {
  label: string;
  days: AttendanceGridDay[];
}

/**
 * Número de semana dentro del mes: la semana 1 es el tramo antes del primer
 * lunes del mes (puede ser solo un fin de semana suelto); cada lunes
 * siguiente abre una semana nueva. Solo tiene sentido para agrupar un único
 * mes — para un bimestre (varios meses) se agrupa por mes, no por semana.
 */
const getWeekOfMonth = (date: Date): number => {
  let week = 1;
  for (let d = 2; d <= date.getDate(); d++) {
    if (new Date(date.getFullYear(), date.getMonth(), d).getDay() === 1) week += 1;
  }
  return week;
};

/** Agrupa los días de un solo mes en "Semana N", tal como se ve la cabecera de dos filas de la tabla mensual. */
export const groupDaysByWeekOfMonth = (days: AttendanceGridDay[]): DayGroup[] => {
  const groups: DayGroup[] = [];
  days.forEach((day) => {
    const week = getWeekOfMonth(day.date);
    const label = `Semana ${week}`;
    const current = groups[groups.length - 1];
    if (current?.label === label) current.days.push(day);
    else groups.push({ label, days: [day] });
  });
  return groups;
};

/** Estado de asistencia determinista de un alumno en un día puntual. `sin-clase` si el día aún no ha ocurrido. */
export const buildAttendanceCellState = (seed: string, date: Date, today: Date): AttendanceCellState => {
  if (date > today) return 'sin-clase';
  const rand = pseudoRandom(seed);
  if (rand > 0.9) return 'falta';
  if (rand > 0.82) return 'justificada';
  if (rand > 0.74) return 'tardanza';
  return 'presente';
};

/**
 * Genera el estado por día de una lista real de alumnos del aula,
 * determinista por semilla y por el id del alumno. `today` acota qué días ya
 * "ocurrieron" — un periodo en curso no tiene datos para los días que aún no llegan.
 */
export const buildAttendanceGridRowsForStudents = (
  seed: string,
  days: AttendanceGridDay[],
  today: Date,
  students: OverviewStudent[],
): AttendanceGridRow[] =>
  students.map((student) => ({
    id: student.id,
    name: student.name,
    cells: days.map((day) =>
      buildAttendanceCellState(`${seed}-grid-${student.id}-${day.date.toISOString()}`, day.date, today),
    ),
  }));

/** Fecha "DD/MM/YYYY", el mismo formato que usa el módulo de Citaciones. */
export const formatShortDate = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

export interface IncidentReportRow {
  id: string;
  date: Date;
  dateLabel: string;
  studentId: string;
  studentName: string;
  type: IncidentType;
  description: string;
}

const INCIDENT_DESCRIPTION_TEMPLATES: Record<IncidentType['category'], string[]> = {
  Leve: [
    'Se conversó con el alumno y se registró la observación en su ficha.',
    'Situación leve, resuelta en el momento por el docente.',
    'Se solicitó a la familia reforzar el hábito en casa.',
  ],
  Moderada: [
    'Se citó al apoderado para conversar sobre la situación.',
    'Se aplicó la medida formativa según el reglamento interno.',
    'Situación derivada a Tutoría para seguimiento.',
  ],
  Grave: [
    'Caso derivado a Dirección para su evaluación según el reglamento interno.',
    'Se activó el protocolo de atención inmediata del colegio.',
    'Se citó a los apoderados de forma urgente.',
  ],
};

const pick = <T,>(pool: T[], seed: string): T => pool[Math.floor(pseudoRandom(seed) * pool.length)];

/**
 * Incidencias deterministas de una lista de alumnos dentro de un rango de
 * fechas: para cada alumno y cada día de colegio hay una probabilidad baja
 * de que exista una incidencia, con un tipo real de `INCIDENT_TYPES`
 * (Leve/Moderada/Grave) y una descripción acorde a su gravedad.
 */
export const buildIncidentReportRows = (
  seed: string,
  students: OverviewStudent[],
  days: AttendanceGridDay[],
  today: Date,
): IncidentReportRow[] => {
  const rows: IncidentReportRow[] = [];
  students.forEach((student) => {
    days.forEach((day) => {
      if (day.date > today) return;
      const chance = pseudoRandom(`${seed}-incidencia-chance-${student.id}-${day.date.toISOString()}`);
      if (chance > 0.05) return;
      const type = pick(INCIDENT_TYPES, `${seed}-incidencia-tipo-${student.id}-${day.date.toISOString()}`);
      rows.push({
        id: `${student.id}-${day.date.toISOString()}`,
        date: day.date,
        dateLabel: formatShortDate(day.date),
        studentId: student.id,
        studentName: student.name,
        type,
        description: pick(
          INCIDENT_DESCRIPTION_TEMPLATES[type.category],
          `${seed}-incidencia-desc-${student.id}-${day.date.toISOString()}`,
        ),
      });
    });
  });
  return rows.sort((a, b) => a.date.getTime() - b.date.getTime());
};
