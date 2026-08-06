import { DAY_NAMES, VACATION_LABEL, getSchoolTerm, getTermWeekNumber } from '@/data/calendar';
import { INCIDENT_TYPES } from '@/data/education';
import { MOCK_USERS } from '@/data/users';
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
 * Estado de una celda de la cuadrícula alumnos × días.
 *
 * `sin-clase` cubre días futuros (aún no ocurrieron) — nunca se inventa un
 * estado de asistencia para un día que no ha pasado. `vacaciones` es distinto:
 * el día existe pero el colegio está cerrado, así que no hay nada que
 * registrar ni ahora ni después. Se distinguen porque uno se rellenará solo
 * cuando llegue la fecha y el otro no. Los fines de semana ni siquiera llegan
 * a ser una columna (ver `buildSchoolDays`).
 */
export type AttendanceCellState =
  | 'presente'
  | 'tardanza'
  | 'falta'
  | 'justificada'
  | 'vacaciones'
  | 'sin-clase';

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
  /**
   * No lleva letra ni insignia a propósito: la columna entera va pintada de
   * ámbar con trama diagonal de "bloqueado" (`AttendanceGridTable`), y una
   * letra dentro solo ensuciaría un tramo donde no hay nada que registrar.
   * `label` existe únicamente para el lector de pantalla.
   */
  vacaciones: {
    label: 'Vacaciones, sin clases',
    letter: '',
    textClassName: 'text-amber-700 dark:text-amber-400',
    badgeClassName: '',
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
  /** El día cae fuera de todo bimestre: el colegio está cerrado. */
  isVacation: boolean;
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
        isVacation: getSchoolTerm(cursor) === null,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

/** Grupo de columnas del encabezado de dos filas de la tabla de asistencia: una semana lectiva o un tramo de vacaciones. */
export interface DayGroup {
  /** "Semana 4" dentro de su bimestre, o "Vacaciones" si el tramo cae entre dos bimestres. */
  label: string;
  /** "3° Bim." — de qué bimestre es esa semana. Vacío en los tramos de vacaciones. */
  termLabel: string;
  /** El tramo entero cae entre dos bimestres: la cabecera se pinta como bloqueada. */
  isVacation: boolean;
  days: AttendanceGridDay[];
}

/**
 * Agrupa los días lectivos de un mes en los bloques de la cabecera de la
 * tabla de asistencia.
 *
 * La semana **no** se cuenta desde el 1 del mes ni por semana ISO, sino
 * desde la fecha de inicio del bimestre al que pertenece cada día
 * (`getTermWeekNumber`). Por eso el 1 de septiembre abre el mes ya como
 * "Semana 4": el 3° Bimestre empezó el 10 de agosto. Un bloque se cierra al
 * llegar el viernes o al cambiar de bimestre, y una semana que el mes parte
 * por la mitad conserva el número que le toca — no se queda sin rótulo.
 *
 * Los días que caen entre un bimestre y el siguiente se agrupan aparte, como
 * "Vacaciones": no son semana de clases de nadie.
 */
export const groupDaysBySchoolWeek = (days: AttendanceGridDay[]): DayGroup[] => {
  const groups: (DayGroup & { key: string })[] = [];
  days.forEach((day) => {
    const term = getSchoolTerm(day.date);
    // El lunes de la semana identifica el tramo dentro del bimestre; sin
    // bimestre (vacaciones) sirve igual para no juntar dos semanas seguidas.
    const weekStamp = `${day.date.getFullYear()}-${getTermWeekOrWeekStamp(day.date)}`;
    const key = term ? `${term.id}-${getTermWeekNumber(day.date, term)}` : `vacaciones-${weekStamp}`;
    const current = groups[groups.length - 1];
    if (current?.key === key) {
      current.days.push(day);
      return;
    }
    groups.push({
      key,
      label: term ? `Semana ${getTermWeekNumber(day.date, term)}` : VACATION_LABEL,
      termLabel: term ? term.shortLabel : '',
      isVacation: term === null,
      days: [day],
    });
  });
  return groups.map(({ key: _key, ...group }) => group);
};

/** Marca de la semana natural (su lunes) — solo para separar tramos de vacaciones consecutivos. */
const getTermWeekOrWeekStamp = (date: Date): string => {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return `${monday.getMonth() + 1}-${monday.getDate()}`;
};

/**
 * Estado de asistencia determinista de un alumno en un día puntual.
 *
 * Vacaciones antes que futuro: un día de vacaciones que además está por venir
 * sigue siendo vacaciones — nunca se llenará, y decir "sin clase" haría pensar
 * que falta el dato.
 */
export const buildAttendanceCellState = (seed: string, date: Date, today: Date): AttendanceCellState => {
  if (!getSchoolTerm(date)) return 'vacaciones';
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
  /** Hora del registro, "HH:MM" — el mismo formato que la hora de una citación. */
  timeLabel: string;
  studentId: string;
  studentName: string;
  type: IncidentType;
  /** Docente que dejó constancia de la incidencia. */
  teacherName: string;
  description: string;
}

/**
 * Horas en las que un docente registra una incidencia: el inicio de cada hora
 * pedagógica de la jornada (07:45 a 13:00). No se inventan horas fuera del
 * horario escolar.
 */
const INCIDENT_TIME_SLOTS = ['07:45', '08:30', '09:15', '10:00', '10:45', '11:30', '12:15', '13:00'];

/** Docentes del colegio, la misma lista que gestiona el módulo Usuarios — de ahí sale quién registró. */
const TEACHER_NAMES = MOCK_USERS.filter((user) => user.role === 'Docente').map((user) => user.name);

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
      // Ni días futuros ni vacaciones: sin clases no hay incidencia que registrar.
      if (day.date > today || !getSchoolTerm(day.date)) return;
      const chance = pseudoRandom(`${seed}-incidencia-chance-${student.id}-${day.date.toISOString()}`);
      if (chance > 0.05) return;
      const type = pick(INCIDENT_TYPES, `${seed}-incidencia-tipo-${student.id}-${day.date.toISOString()}`);
      rows.push({
        id: `${student.id}-${day.date.toISOString()}`,
        date: day.date,
        dateLabel: formatShortDate(day.date),
        timeLabel: pick(INCIDENT_TIME_SLOTS, `${seed}-incidencia-hora-${student.id}-${day.date.toISOString()}`),
        studentId: student.id,
        studentName: student.name,
        type,
        teacherName: pick(TEACHER_NAMES, `${seed}-incidencia-docente-${student.id}-${day.date.toISOString()}`),
        description: pick(
          INCIDENT_DESCRIPTION_TEMPLATES[type.category],
          `${seed}-incidencia-desc-${student.id}-${day.date.toISOString()}`,
        ),
      });
    });
  });
  return rows.sort((a, b) => a.date.getTime() - b.date.getTime());
};
