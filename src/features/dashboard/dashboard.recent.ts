import { visibleCitations, visibleStudents } from '@/features/auth/scope';
import type { Session } from '@/features/auth/session';
import { INITIAL_CITATIONS, parseCitationDateTime } from '@/features/citations/citations.constants';
import type { Citation } from '@/features/citations/types';
import { getClassroomLabel } from '@/features/classrooms/overview.format';
import { buildIncidentReportRows, buildSchoolDays, type IncidentReportRow } from '@/features/classrooms/overview.rows';
import type { ClassroomRef, UserItem } from '@/types';

/**
 * "Últimas incidencias" y "Últimas citaciones" del panel Inicio. No hay datos
 * nuevos aquí: las incidencias salen del mismo generador que la Vista General
 * del Aula (`buildIncidentReportRows`, sembrado por aula), y las citaciones de
 * `INITIAL_CITATIONS`, el dato que gestiona el módulo Citaciones. Este archivo
 * solo los junta y se queda con lo más reciente — se crean y editan en su
 * módulo, aquí únicamente se leen.
 *
 * El alcance lo decide `@/features/auth/scope`: un docente ve lo de sus aulas
 * y sus alumnos; un auxiliar o directivo, lo de todo el colegio.
 */

/**
 * Ventana de la que se lee "lo último". Un docente mira 3-6 aulas, así que
 * hace falta un mes para que la tarjeta tenga filas; un auxiliar mira el
 * colegio entero, donde una semana ya sobra — y recorrer 1800 alumnos por 30
 * días para quedarse con 5 filas es trabajo tirado.
 */
const RECENT_WINDOW_DAYS = { classroom: 30, school: 7 };

/** Cuántas filas muestra cada tarjeta. */
export const RECENT_LIMIT = 5;

/** Una incidencia con el aula donde ocurrió — la tarjeta puede juntar varias aulas. */
export interface RecentIncident extends IncidentReportRow {
  classroomLabel: string;
}

const classroomKey = ({ level, grade, section }: ClassroomRef) => `${level}-${grade}-${section}`;

/** Agrupa los alumnos visibles por aula, para poder sembrar cada aula como lo hace Aulas. */
const groupByClassroom = (students: UserItem[]): Map<string, { classroom: ClassroomRef; students: UserItem[] }> => {
  const groups = new Map<string, { classroom: ClassroomRef; students: UserItem[] }>();
  students.forEach((student) => {
    if (!student.level || !student.grade || !student.section) return;
    const classroom: ClassroomRef = { level: student.level, grade: student.grade, section: student.section };
    const key = classroomKey(classroom);
    const group = groups.get(key) ?? { classroom, students: [] };
    group.students.push(student);
    groups.set(key, group);
  });
  return groups;
};

/**
 * Las incidencias más recientes del alcance de la sesión, de más nueva a más
 * vieja. La semilla de cada aula es la misma que usa la Vista General del
 * Aula, así que una incidencia que aparece aquí aparece igual allí.
 */
export const getRecentIncidents = (session: Session, today: Date, limit = RECENT_LIMIT): RecentIncident[] => {
  const start = new Date(today);
  start.setDate(start.getDate() - (session.classrooms === null ? RECENT_WINDOW_DAYS.school : RECENT_WINDOW_DAYS.classroom));
  const days = buildSchoolDays(start, today);

  const rows: RecentIncident[] = [];
  groupByClassroom(visibleStudents(session)).forEach(({ classroom, students }) => {
    const classroomLabel = getClassroomLabel(classroom);
    buildIncidentReportRows(classroomKey(classroom), students, days, today).forEach((row) => {
      rows.push({ ...row, classroomLabel });
    });
  });

  return rows.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
};

/** Las citaciones más recientes del alcance de la sesión, de más nueva a más vieja. */
export const getRecentCitations = (session: Session, limit = RECENT_LIMIT): Citation[] =>
  [...visibleCitations(session, INITIAL_CITATIONS)]
    .sort((a, b) => parseCitationDateTime(b).getTime() - parseCitationDateTime(a).getTime())
    .slice(0, limit);
