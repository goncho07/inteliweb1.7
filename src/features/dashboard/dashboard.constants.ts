import { CHART_COLORS } from '@/components/charts/chartTheme';
import { MONTH_NAMES, SCHOOL_TERMS } from '@/data/calendar';
import { EDUCATIONAL_STRUCTURE } from '@/data/education';
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

export type BimestreId = 1 | 2 | 3 | 4;

export interface Bimestre {
  id: BimestreId;
  label: string;
  /** Rango de fechas legible, mostrado en el selector del panel Inicio. */
  range: string;
  start: Date;
  end: Date;
}

/** "16 mar", el formato corto del rango que se lee en el selector de bimestre. */
const formatTermDay = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')} ${MONTH_NAMES[date.getMonth()].slice(0, 3).toLowerCase()}`;

/**
 * Calendario bimestral del colegio, tal cual lo define `SCHOOL_TERMS`
 * (determinación de bimestres del Ministerio de Educación). Las fechas no se
 * repiten aquí: este selector y la numeración de semanas de los reportes de
 * Aulas leen el mismo calendario, así que no pueden desincronizarse.
 */
export const BIMESTRES: Bimestre[] = SCHOOL_TERMS.map((term) => ({
  id: term.id,
  label: term.label,
  range: `${formatTermDay(term.start)} – ${formatTermDay(term.end)}`,
  start: term.start,
  end: term.end,
}));

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

/** Aulas de un docente que caben en sus tarjetas de ranking del panel Inicio. */
const TEACHER_CLASSROOM_LIMIT = 5;

/** Un aula cualquiera en el formato que consumen los rankings. */
const toRankingEntry = (classroom: ClassroomRef): RankingPoolEntry => ({
  label: getClassroomLabel(classroom),
  level: classroom.level as EducationLevel,
  grade: classroom.grade,
  section: classroom.section,
});

/**
 * Hasta 5 aulas del docente, en el mismo formato que `CLASSROOM_POOL`, para
 * que sus tarjetas de ranking del panel Inicio muestren solo sus aulas.
 */
export const buildScopedClassroomPool = (classrooms: ClassroomRef[]): RankingPoolEntry[] =>
  classrooms.slice(0, TEACHER_CLASSROOM_LIMIT).map(toRankingEntry);

/** Un alumno real por cada una de las aulas del docente (hasta 5), mismo criterio que `STUDENT_POOL`. */
export const buildScopedStudentPool = (classrooms: ClassroomRef[]): RankingPoolEntry[] =>
  classrooms.slice(0, TEACHER_CLASSROOM_LIMIT).flatMap((classroom) => {
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
 * Nivel → grado → secciones que el filtro de la cabecera puede ofrecer. El
 * árbol lo construye `visibleClassroomTree` (`@/features/auth/scope`), el
 * único sitio que decide qué ve cada rol: completo para un directivo o
 * auxiliar, recortado a sus aulas para un docente — ofrecerle "5° de
 * Secundaria" cuando enseña en Inicial sería un filtro que solo puede
 * devolver un gráfico vacío.
 */
export type ScopeStructure = Record<string, Record<string, string[]>>;

/** Todas las aulas de la institución (`EDUCATIONAL_STRUCTURE`) en formato de ranking. */
const ALL_CLASSROOMS: RankingPoolEntry[] = Object.entries(EDUCATIONAL_STRUCTURE).flatMap(([level, grades]) =>
  Object.entries(grades).flatMap(([grade, sections]) =>
    sections.map((section) => ({
      label: getClassroomLabel({ level, grade, section }),
      level: level as EducationLevel,
      grade,
      section,
    })),
  ),
);

/** Alumnos matriculados de un aula concreta, en el orden estable de `MOCK_USERS`. */
const enrolledStudents = (classroom: RankingPoolEntry) =>
  MOCK_USERS.filter(
    (user) =>
      user.role === 'Estudiante' &&
      user.status === 'Matriculado' &&
      user.level === classroom.level &&
      user.grade === classroom.grade &&
      user.section === classroom.section,
  );

/**
 * Aulas que alimentan los rankings, según el filtro de la cabecera y el
 * alcance del usuario (todo el colegio para un directivo; sus aulas para un
 * docente).
 *
 * Sin filtro se usa el pool curado de 5 aulas por nivel (`CLASSROOM_POOL`);
 * con filtro, las aulas reales de ese nivel/grado/sección — si no, elegir
 * "1° Grado B de Secundaria" dejaría el gráfico vacío solo porque esa aula no
 * está en la muestra. La puntuación se siembra con la etiqueta del aula, así
 * que un aula muestra el mismo número venga del pool que venga.
 */
export const buildClassroomPool = (
  scope: DashboardScope,
  teacherClassrooms?: ClassroomRef[],
): RankingPoolEntry[] => {
  if (teacherClassrooms) {
    // El recorte a 5 aulas va después de filtrar: un docente con 6 aulas puede
    // elegir cualquiera de ellas en el filtro, no solo las 5 primeras.
    return teacherClassrooms
      .map(toRankingEntry)
      .filter((entry) => matchesScope(entry, scope))
      .slice(0, TEACHER_CLASSROOM_LIMIT);
  }
  if (isFullSchoolScope(scope)) return CLASSROOM_POOL;
  return ALL_CLASSROOMS.filter((entry) => matchesScope(entry, scope));
};

/**
 * Alumnos que alimentan los rankings de estudiantes, con el mismo criterio.
 * Cuando el filtro deja una sola aula, el ranking se arma con alumnos de esa
 * aula (uno por aula dejaría una única barra); con varias aulas, un alumno
 * representativo de cada una.
 */
export const buildStudentPool = (
  scope: DashboardScope,
  teacherClassrooms?: ClassroomRef[],
): RankingPoolEntry[] => {
  if (teacherClassrooms) {
    const pool = buildScopedStudentPool(teacherClassrooms).filter((entry) => matchesScope(entry, scope));
    if (pool.length > 1) return pool;
  }
  if (!teacherClassrooms && isFullSchoolScope(scope)) return STUDENT_POOL;

  const classrooms = buildClassroomPool(scope, teacherClassrooms);
  const perClassroom = classrooms.length === 1 ? 5 : 1;
  return classrooms.slice(0, 5).flatMap((classroom) =>
    enrolledStudents(classroom)
      .slice(0, perClassroom)
      .map((student) => ({
        label: shortStudentLabel(student.name),
        level: classroom.level,
        grade: classroom.grade,
        section: classroom.section,
      })),
  );
};

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

/* -------------------------------------------------------------------------
 * Ámbito del panel (nivel → grado → sección)
 * ---------------------------------------------------------------------- */

/** Valor de un filtro de ámbito sin usar — mismo literal que Usuarios y Citaciones. */
export const ALL_SCOPE = 'Todos';

/** Qué aulas alimentan los gráficos del panel Inicio. */
export interface DashboardScope {
  level: string;
  grade: string;
  section: string;
}

/** Todo el colegio: el panel arranca siempre así. */
export const FULL_SCHOOL_SCOPE: DashboardScope = {
  level: ALL_SCOPE,
  grade: ALL_SCOPE,
  section: ALL_SCOPE,
};

export const isFullSchoolScope = (scope: DashboardScope): boolean =>
  scope.level === ALL_SCOPE && scope.grade === ALL_SCOPE && scope.section === ALL_SCOPE;

const scopeSeed = (scope: DashboardScope) => `${scope.level}-${scope.grade}-${scope.section}`;

/** Un aula (o el aula de un estudiante) cae dentro del ámbito elegido. */
export const matchesScope = (
  entry: { level: string; grade: string; section: string },
  scope: DashboardScope,
): boolean =>
  (scope.level === ALL_SCOPE || entry.level === scope.level) &&
  (scope.grade === ALL_SCOPE || entry.grade === scope.grade) &&
  (scope.section === ALL_SCOPE || entry.section === scope.section);

export const filterRankingByScope = (points: RankingPoint[], scope: DashboardScope): RankingPoint[] =>
  isFullSchoolScope(scope) ? points : points.filter((point) => matchesScope(point, scope));

/**
 * Asistencia del ámbito elegido. Los rankings sí traen nivel/grado/sección por
 * fila y se filtran de verdad, pero la asistencia y los tipos de incidencia
 * son totales del colegio: no hay un desglose por aula que recortar. En vez de
 * dejar esas dos tarjetas quietas mientras las otras dos cambian —un filtro
 * que a medias no hace nada—, se deriva una variante determinista del ámbito
 * (`pseudoRandom`, misma aula = mismo dato siempre). Son datos simulados, como
 * todo el panel.
 */
export const getScopedWeeklyAttendance = (
  base: WeeklyAttendancePoint[],
  scope: DashboardScope,
): WeeklyAttendancePoint[] => {
  if (isFullSchoolScope(scope)) return base;
  const seed = scopeSeed(scope);
  return base.map((point) => {
    // ±6 puntos de asistencia respecto al consolidado del colegio.
    const delta = Math.round((pseudoRandom(`asistencia-${seed}-${point.day}`) - 0.5) * 12);
    const presente = Math.min(100, Math.max(70, point.presente + delta));
    const remainder = 100 - presente;
    const baseRemainder = point.ausente + point.tardanza;
    // El reparto ausente/tardanza mantiene la proporción del dato de origen.
    const ausente = baseRemainder === 0 ? remainder : Math.round((remainder * point.ausente) / baseRemainder);
    return { ...point, presente, ausente, tardanza: remainder - ausente };
  });
};

/** Tipos de incidencia del ámbito elegido; mismo criterio que `getScopedWeeklyAttendance`. */
export const getScopedIncidentTypes = (
  base: IncidentTypeCount[],
  scope: DashboardScope,
): IncidentTypeCount[] => {
  if (isFullSchoolScope(scope)) return base;
  const seed = scopeSeed(scope);
  return base
    .map((item) => ({
      ...item,
      count: Math.max(1, Math.round(item.count * (0.4 + pseudoRandom(`incidencias-${seed}-${item.type}`) * 0.9))),
    }))
    .sort((a, b) => b.count - a.count);
};

export interface BimestreDashboardData {
  /** Asistencia promedio del bimestre (KPI de la fila superior). */
  attendanceAvg: number;
  /**
   * Patrón semanal consolidado del bimestre (Lun-Vie). No se dibuja tal cual:
   * es la base de la que la tarjeta de Asistencia deriva cada día real de la
   * semana elegida (ver `dashboard.weeks.ts`).
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
