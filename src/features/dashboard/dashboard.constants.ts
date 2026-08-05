import { CHART_COLORS } from '@/components/charts/chartTheme';
import { MOCK_USERS } from '@/data/users';
import { getClassroomLabel } from '@/features/classrooms/overview.format';
import { pseudoRandom } from '@/lib/pseudoRandom';
import type { ClassroomRef } from '@/types';

// Colores y alto de gráfico son compartidos por toda la app — ver
// `@/components/charts/chartTheme`. Se re-exporta `CHART_COLORS` porque los
// datos de este archivo lo referencian (`INCIDENT_SEVERITY_COLORS`, abajo).
export { CHART_COLORS };

/**
 * Meta de asistencia diaria (Compromiso de Gestión Escolar 2 — permanencia).
 * Se usa para colorear el KPI de asistencia.
 */
export const ATTENDANCE_GOAL = 90;

export interface WeeklyAttendancePoint {
  day: string;
  /** Porcentaje de estudiantes presentes, ausentes y con tardanza (suman 100). */
  presente: number;
  ausente: number;
  tardanza: number;
}

export interface LevelAttendancePoint {
  level: string;
  /** Porcentaje de estudiantes presentes, ausentes y con tardanza (suman 100). */
  presente: number;
  ausente: number;
  tardanza: number;
}

/** Catálogo cerrado de niveles educativos, para el selector "Nivel" del panel lateral. */
export type EducationLevel = 'Inicial' | 'Primaria' | 'Secundaria';

export const EDUCATION_LEVELS: EducationLevel[] = ['Inicial', 'Primaria', 'Secundaria'];

/**
 * Asistencia general de la semana en curso (todos los niveles), para el
 * gráfico de barras del panel Inicio. Es un dato "en vivo" y no cambia con
 * el bimestre elegido en el panel lateral.
 */
export const WEEKLY_ATTENDANCE_DATA: WeeklyAttendancePoint[] = [
  { day: 'Lun', presente: 95, ausente: 2, tardanza: 3 },
  { day: 'Mar', presente: 93, ausente: 3, tardanza: 4 },
  { day: 'Mié', presente: 89, ausente: 6, tardanza: 5 },
  { day: 'Jue', presente: 91, ausente: 4, tardanza: 5 },
  { day: 'Vie', presente: 87, ausente: 8, tardanza: 5 },
];

export type BimestreId = 1 | 2 | 3 | 4;

export interface Bimestre {
  id: BimestreId;
  label: string;
  /** Rango de fechas legible, mostrado en el selector del panel Inicio. */
  range: string;
  start: Date;
  end: Date;
}

/**
 * Calendario bimestral 2026 del colegio. Las fechas solo se usan para ubicar
 * el bimestre vigente por defecto al abrir el panel Inicio; no hay más
 * bimestres registrados que estos 4.
 */
export const BIMESTRES: Bimestre[] = [
  { id: 1, label: '1° Bimestre', range: '02 mar – 08 may', start: new Date(2026, 2, 2), end: new Date(2026, 4, 8) },
  { id: 2, label: '2° Bimestre', range: '11 may – 24 jul', start: new Date(2026, 4, 11), end: new Date(2026, 6, 24) },
  { id: 3, label: '3° Bimestre', range: '10 ago – 16 oct', start: new Date(2026, 7, 10), end: new Date(2026, 9, 16) },
  { id: 4, label: '4° Bimestre', range: '19 oct – 18 dic', start: new Date(2026, 9, 19), end: new Date(2026, 11, 18) },
];

/**
 * Bimestre vigente por defecto al abrir el panel: el primero cuyo cierre no
 * haya pasado todavía. Si el colegio está en el receso entre dos bimestres
 * (ej. vacaciones de medio año), ya cuenta como el siguiente — es el que el
 * equipo directivo está preparando.
 */
export const getDefaultBimestreId = (referenceDate: Date = new Date()): BimestreId => {
  const upcoming = BIMESTRES.find((bimestre) => bimestre.end >= referenceDate);
  return (upcoming ?? BIMESTRES[BIMESTRES.length - 1]).id;
};

export interface IncidentSeverityPoint {
  severity: string;
  count: number;
  fill: string;
}

export interface RankingPoint {
  label: string;
  score: number;
  /** Nivel educativo del aula/estudiante, para el filtro "Nivel" del panel lateral. */
  level: EducationLevel;
  /** Grado y sección del aula (o del aula del estudiante), para acotar el ranking al alcance de un docente. */
  grade: string;
  section: string;
}

/** Gravedad oficial de una incidencia, según el reglamento del colegio (catálogo cerrado de 3 niveles). */
export type IncidentSeverityLevel = 'Leve' | 'Moderada' | 'Grave';

/** Color fijo por gravedad: amarillo=leve, naranja=moderada, rojo=grave. */
export const INCIDENT_SEVERITY_COLORS: Record<IncidentSeverityLevel, string> = {
  Leve: CHART_COLORS.yellow500,
  Moderada: CHART_COLORS.orange500,
  Grave: CHART_COLORS.red500,
};

export interface IncidentTypeCount {
  /** Tipo/motivo de incidencia, tal como aparece en el reglamento del colegio. */
  type: string;
  count: number;
  severity: IncidentSeverityLevel;
  fill: string;
}

/**
 * Tipos de incidencia de la semana en curso — dato "en vivo", no cambia con
 * el bimestre elegido en el panel lateral (misma semántica que
 * `WEEKLY_ATTENDANCE_DATA`), para la vista "Semana" de la tarjeta Tipos de
 * Incidencia. Siempre 5 tipos, igual que la vista "Bimestre" — ningún
 * gráfico del panel Inicio muestra menos de 5 barras.
 */
export const WEEKLY_INCIDENT_TYPE_DATA: IncidentTypeCount[] = [
  { type: 'Uniforme incompleto', count: 3, severity: 'Leve', fill: INCIDENT_SEVERITY_COLORS.Leve },
  { type: 'Uso de celular', count: 2, severity: 'Moderada', fill: INCIDENT_SEVERITY_COLORS.Moderada },
  { type: 'Falta de aseo personal', count: 2, severity: 'Leve', fill: INCIDENT_SEVERITY_COLORS.Leve },
  { type: 'Indisciplina en aula', count: 1, severity: 'Moderada', fill: INCIDENT_SEVERITY_COLORS.Moderada },
  { type: 'Agresión física', count: 1, severity: 'Grave', fill: INCIDENT_SEVERITY_COLORS.Grave },
];

interface RankingPoolEntry {
  label: string;
  level: EducationLevel;
  grade: string;
  section: string;
}

/**
 * Aulas del colegio, 5 por nivel — el ranking de aulas siempre tiene 5 filas
 * que mostrar sin importar qué nivel se filtre en el panel lateral (ningún
 * gráfico del panel Inicio puede salir con menos de 5 barras) cuando el
 * alcance es "todo el colegio" (directivo/auxiliar). Las etiquetas ya no
 * repiten el nivel ("4°B", no "4° B Sec"): ese dato lo da la leyenda que la
 * tarjeta muestra debajo del gráfico. Aulas reales de `EDUCATIONAL_STRUCTURE`
 * (`@/data/education`), para que `grade`/`section` puedan cruzarse con las
 * aulas de un docente (`buildScopedClassroomPool`).
 */
const CLASSROOM_POOL: RankingPoolEntry[] = [
  { label: '3 años Margaritas', level: 'Inicial', grade: '3 Años', section: 'Margaritas' },
  { label: '3 años Crisantemos', level: 'Inicial', grade: '3 Años', section: 'Crisantemos' },
  { label: '4 años Jasminez', level: 'Inicial', grade: '4 Años', section: 'Jasminez' },
  { label: '4 años Rosas', level: 'Inicial', grade: '4 Años', section: 'Rosas' },
  { label: '5 años Orquídeas', level: 'Inicial', grade: '5 Años', section: 'Orquídeas' },
  { label: '1°A', level: 'Primaria', grade: '1° Grado', section: 'A' },
  { label: '2°A', level: 'Primaria', grade: '2° Grado', section: 'A' },
  { label: '3°A', level: 'Primaria', grade: '3° Grado', section: 'A' },
  { label: '4°A', level: 'Primaria', grade: '4° Grado', section: 'A' },
  { label: '5°A', level: 'Primaria', grade: '5° Grado', section: 'A' },
  { label: '1°B', level: 'Secundaria', grade: '1° Grado', section: 'B' },
  { label: '2°B', level: 'Secundaria', grade: '2° Grado', section: 'B' },
  { label: '3°B', level: 'Secundaria', grade: '3° Grado', section: 'B' },
  { label: '4°B', level: 'Secundaria', grade: '4° Grado', section: 'B' },
  { label: '5°B', level: 'Secundaria', grade: '5° Grado', section: 'B' },
];

/** Iniciales "N. Apellido" a partir de "Nombre Apellido1 Apellido2" (formato de `MOCK_USERS`). */
const shortStudentLabel = (name: string): string => {
  const [firstName, lastName1] = name.split(' ');
  return `${firstName.charAt(0)}. ${lastName1}`;
};

/** Elige, de forma estable, un estudiante matriculado real de un aula puntual. */
const pickEnrolledStudent = (classroom: ClassroomRef, seed: string) => {
  const candidates = MOCK_USERS.filter(
    (u) =>
      u.role === 'Estudiante' &&
      u.status === 'Matriculado' &&
      u.level === classroom.level &&
      u.grade === classroom.grade &&
      u.section === classroom.section,
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(pseudoRandom(seed) * candidates.length)];
};

/**
 * Estudiantes de muestra, 5 por nivel — mismo criterio que `CLASSROOM_POOL`:
 * un alumno real de `MOCK_USERS` por cada aula del pool (misma semilla =
 * mismo alumno siempre).
 */
const STUDENT_POOL: RankingPoolEntry[] = CLASSROOM_POOL.map((classroom) => {
  const student = pickEnrolledStudent(classroom, `dashboard-student-pool-${classroom.label}`);
  return {
    label: student ? shortStudentLabel(student.name) : classroom.label,
    level: classroom.level,
    grade: classroom.grade,
    section: classroom.section,
  };
});

/**
 * Hasta 5 aulas del docente, en el mismo formato que `CLASSROOM_POOL`, para
 * que sus tarjetas de ranking del panel Inicio muestren solo sus aulas.
 */
export const buildScopedClassroomPool = (classrooms: ClassroomRef[]): RankingPoolEntry[] =>
  classrooms.slice(0, 5).map((classroom) => ({
    label: getClassroomLabel(classroom),
    level: classroom.level as EducationLevel,
    grade: classroom.grade,
    section: classroom.section,
  }));

/** Un alumno real por cada una de las aulas del docente (hasta 5), mismo criterio que `STUDENT_POOL`. */
export const buildScopedStudentPool = (classrooms: ClassroomRef[]): RankingPoolEntry[] =>
  classrooms.slice(0, 5).flatMap((classroom) => {
    const student = pickEnrolledStudent(classroom, `docente-student-pool-${classroom.level}-${classroom.grade}-${classroom.section}`);
    if (!student) return [];
    return [
      {
        label: shortStudentLabel(student.name),
        level: classroom.level as EducationLevel,
        grade: classroom.grade,
        section: classroom.section,
      },
    ];
  });

/**
 * Genera un ranking determinista (misma semilla = mismo resultado siempre,
 * ver `pseudoRandom`) a partir de un pool de hasta 5 entidades por nivel —
 * así el selector "Nivel" del panel lateral siempre deja filas para mostrar
 * cuando el alcance es todo el colegio. `scale` ajusta la magnitud según el
 * bimestre (ver la nota en `BIMESTRE_DASHBOARD_DATA`).
 */
const buildRanking = (
  pool: RankingPoolEntry[],
  bimestreId: BimestreId,
  kind: string,
  maxScore: number,
  scale: number,
): RankingPoint[] =>
  pool
    .map((entry) => ({
      ...entry,
      score: Math.max(1, Math.round(pseudoRandom(`${kind}-${bimestreId}-${entry.label}`) * maxScore * scale)),
    }))
    .sort((a, b) => b.score - a.score);

/** Magnitud del ranking de incidencias por bimestre (repunte hacia el cierre del año). */
const INCIDENT_RANKING_SCALE: Record<BimestreId, number> = { 1: 1, 2: 1.25, 3: 0.75, 4: 1.3 };
/** Magnitud del ranking de inasistencias por bimestre. */
const ABSENCE_RANKING_SCALE: Record<BimestreId, number> = { 1: 1, 2: 1.2, 3: 0.7, 4: 1.25 };

/** Ranking "Aulas con más incidencias" / "Aulas con más inasistencias" para un pool de aulas dado (todo el colegio o las de un docente). */
export const getClassroomIncidentRanking = (bimestreId: BimestreId, pool: RankingPoolEntry[] = CLASSROOM_POOL): RankingPoint[] =>
  buildRanking(pool, bimestreId, 'aula-incidencias', 8, INCIDENT_RANKING_SCALE[bimestreId]);
export const getClassroomAbsenceRanking = (bimestreId: BimestreId, pool: RankingPoolEntry[] = CLASSROOM_POOL): RankingPoint[] =>
  buildRanking(pool, bimestreId, 'aula-faltas', 11, ABSENCE_RANKING_SCALE[bimestreId]);
/** Ranking "Estudiantes con reincidencias" / "Estudiantes con mayor faltas" para un pool de estudiantes dado. */
export const getStudentIncidentRanking = (bimestreId: BimestreId, pool: RankingPoolEntry[] = STUDENT_POOL): RankingPoint[] =>
  buildRanking(pool, bimestreId, 'estudiante-incidencias', 5, INCIDENT_RANKING_SCALE[bimestreId]);
export const getStudentAbsenceRanking = (bimestreId: BimestreId, pool: RankingPoolEntry[] = STUDENT_POOL): RankingPoint[] =>
  buildRanking(pool, bimestreId, 'estudiante-faltas', 6, ABSENCE_RANKING_SCALE[bimestreId]);

export interface BimestreDashboardData {
  /** Asistencia promedio del bimestre (KPI de la fila superior). */
  attendanceAvg: number;
  /**
   * Patrón semanal consolidado del bimestre (Lun-Vie), para la vista
   * "Bimestre" de la tarjeta de Asistencia — misma forma que
   * `WEEKLY_ATTENDANCE_DATA` (la semana en curso), pero como promedio
   * representativo del bimestre en vez de un dato "en vivo".
   */
  weeklyAttendance: WeeklyAttendancePoint[];
  /** Asistencia consolidada del bimestre por nivel educativo (Inicial/Primaria/Secundaria). */
  attendanceByLevel: LevelAttendancePoint[];
  /** Incidencias por gravedad, mismo catálogo de 3 niveles del real (Leve/Moderada/Grave). */
  incidentSeverityData: IncidentSeverityPoint[];
  /**
   * Los tipos de incidencia más frecuentes del bimestre (no el catálogo
   * completo del reglamento), ordenados de mayor a menor. Cada tipo hereda el
   * color de su gravedad — coherente con, pero no igual a, los totales de
   * `incidentSeverityData` (estos 5 tipos no agotan todas las incidencias
   * registradas, solo los motivos más comunes).
   */
  incidentTypeData: IncidentTypeCount[];
}

/**
 * Datos simulados del panel Inicio, uno por bimestre (CGE2 asistencia, CGE5
 * convivencia). Se invirtieron para que cuenten una historia realista del año
 * escolar: mejora en el 3er bimestre y repunte de incidencias hacia el cierre
 * del año — de ahí el `scale` creciente de `INCIDENT_RANKING_SCALE` /
 * `ABSENCE_RANKING_SCALE` en los bimestres 2 y 4. Los 4 rankings (aulas y
 * estudiantes, incidencias y faltas) no viven aquí: se calculan en el momento
 * con `getClassroomIncidentRanking` y compañía, para poder acotarlos a las
 * aulas de un docente cuando aplica.
 */
export const BIMESTRE_DASHBOARD_DATA: Record<BimestreId, BimestreDashboardData> = {
  1: {
    attendanceAvg: 92,
    weeklyAttendance: [
      { day: 'Lun', presente: 94, ausente: 3, tardanza: 3 },
      { day: 'Mar', presente: 93, ausente: 4, tardanza: 3 },
      { day: 'Mié', presente: 90, ausente: 6, tardanza: 4 },
      { day: 'Jue', presente: 92, ausente: 5, tardanza: 3 },
      { day: 'Vie', presente: 89, ausente: 7, tardanza: 4 },
    ],
    attendanceByLevel: [
      { level: 'Inicial', presente: 89, ausente: 6, tardanza: 5 },
      { level: 'Primaria', presente: 94, ausente: 3, tardanza: 3 },
      { level: 'Secundaria', presente: 91, ausente: 5, tardanza: 4 },
    ],
    incidentSeverityData: [
      { severity: 'Leve', count: 18, fill: INCIDENT_SEVERITY_COLORS.Leve },
      { severity: 'Moderada', count: 9, fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { severity: 'Grave', count: 2, fill: INCIDENT_SEVERITY_COLORS.Grave },
    ],
    incidentTypeData: [
      { type: 'Uniforme incompleto', count: 7, severity: 'Leve', fill: INCIDENT_SEVERITY_COLORS.Leve },
      { type: 'Falta de aseo personal', count: 5, severity: 'Leve', fill: INCIDENT_SEVERITY_COLORS.Leve },
      { type: 'Uso de celular', count: 4, severity: 'Moderada', fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { type: 'Indisciplina en aula', count: 3, severity: 'Moderada', fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { type: 'Agresión física', count: 1, severity: 'Grave', fill: INCIDENT_SEVERITY_COLORS.Grave },
    ],
  },
  2: {
    attendanceAvg: 90,
    weeklyAttendance: [
      { day: 'Lun', presente: 92, ausente: 5, tardanza: 3 },
      { day: 'Mar', presente: 91, ausente: 6, tardanza: 3 },
      { day: 'Mié', presente: 88, ausente: 8, tardanza: 4 },
      { day: 'Jue', presente: 90, ausente: 6, tardanza: 4 },
      { day: 'Vie', presente: 86, ausente: 9, tardanza: 5 },
    ],
    attendanceByLevel: [
      { level: 'Inicial', presente: 86, ausente: 9, tardanza: 5 },
      { level: 'Primaria', presente: 92, ausente: 5, tardanza: 3 },
      { level: 'Secundaria', presente: 89, ausente: 7, tardanza: 4 },
    ],
    incidentSeverityData: [
      { severity: 'Leve', count: 22, fill: INCIDENT_SEVERITY_COLORS.Leve },
      { severity: 'Moderada', count: 12, fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { severity: 'Grave', count: 3, fill: INCIDENT_SEVERITY_COLORS.Grave },
    ],
    incidentTypeData: [
      { type: 'Uniforme incompleto', count: 8, severity: 'Leve', fill: INCIDENT_SEVERITY_COLORS.Leve },
      { type: 'Falta de aseo personal', count: 6, severity: 'Leve', fill: INCIDENT_SEVERITY_COLORS.Leve },
      { type: 'Uso de celular', count: 6, severity: 'Moderada', fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { type: 'Indisciplina en aula', count: 4, severity: 'Moderada', fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { type: 'Agresión física', count: 2, severity: 'Grave', fill: INCIDENT_SEVERITY_COLORS.Grave },
    ],
  },
  3: {
    attendanceAvg: 94,
    weeklyAttendance: [
      { day: 'Lun', presente: 96, ausente: 2, tardanza: 2 },
      { day: 'Mar', presente: 95, ausente: 3, tardanza: 2 },
      { day: 'Mié', presente: 93, ausente: 4, tardanza: 3 },
      { day: 'Jue', presente: 94, ausente: 4, tardanza: 2 },
      { day: 'Vie', presente: 92, ausente: 5, tardanza: 3 },
    ],
    attendanceByLevel: [
      { level: 'Inicial', presente: 92, ausente: 5, tardanza: 3 },
      { level: 'Primaria', presente: 96, ausente: 2, tardanza: 2 },
      { level: 'Secundaria', presente: 94, ausente: 3, tardanza: 3 },
    ],
    incidentSeverityData: [
      { severity: 'Leve', count: 15, fill: INCIDENT_SEVERITY_COLORS.Leve },
      { severity: 'Moderada', count: 7, fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { severity: 'Grave', count: 1, fill: INCIDENT_SEVERITY_COLORS.Grave },
    ],
    incidentTypeData: [
      { type: 'Uniforme incompleto', count: 6, severity: 'Leve', fill: INCIDENT_SEVERITY_COLORS.Leve },
      { type: 'Falta de aseo personal', count: 4, severity: 'Leve', fill: INCIDENT_SEVERITY_COLORS.Leve },
      { type: 'Uso de celular', count: 3, severity: 'Moderada', fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { type: 'Indisciplina en aula', count: 2, severity: 'Moderada', fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { type: 'Agresión física', count: 1, severity: 'Grave', fill: INCIDENT_SEVERITY_COLORS.Grave },
    ],
  },
  4: {
    attendanceAvg: 90,
    weeklyAttendance: [
      { day: 'Lun', presente: 92, ausente: 5, tardanza: 3 },
      { day: 'Mar', presente: 90, ausente: 6, tardanza: 4 },
      { day: 'Mié', presente: 88, ausente: 8, tardanza: 4 },
      { day: 'Jue', presente: 89, ausente: 7, tardanza: 4 },
      { day: 'Vie', presente: 86, ausente: 9, tardanza: 5 },
    ],
    attendanceByLevel: [
      { level: 'Inicial', presente: 85, ausente: 10, tardanza: 5 },
      { level: 'Primaria', presente: 92, ausente: 5, tardanza: 3 },
      { level: 'Secundaria', presente: 88, ausente: 7, tardanza: 5 },
    ],
    incidentSeverityData: [
      { severity: 'Leve', count: 20, fill: INCIDENT_SEVERITY_COLORS.Leve },
      { severity: 'Moderada', count: 14, fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { severity: 'Grave', count: 4, fill: INCIDENT_SEVERITY_COLORS.Grave },
    ],
    incidentTypeData: [
      { type: 'Uso de celular', count: 7, severity: 'Moderada', fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { type: 'Uniforme incompleto', count: 7, severity: 'Leve', fill: INCIDENT_SEVERITY_COLORS.Leve },
      { type: 'Falta de aseo personal', count: 6, severity: 'Leve', fill: INCIDENT_SEVERITY_COLORS.Leve },
      { type: 'Indisciplina en aula', count: 5, severity: 'Moderada', fill: INCIDENT_SEVERITY_COLORS.Moderada },
      { type: 'Agresión física', count: 3, severity: 'Grave', fill: INCIDENT_SEVERITY_COLORS.Grave },
    ],
  },
};
