import { useMemo, useState } from 'react';
import { CalendarX2, Moon, School, Sun, Sunset, UserRound, UserX } from 'lucide-react';
import { ModuleBody, ModulePane, ModulePaneHeader, ModuleShell } from '@/components/layout/ModuleShell';
import { useSession } from '@/features/auth/SessionContext';
import { ModuleProps } from '@/types';

import { DashboardSidebar } from './components/DashboardSidebar';
import { IncidentRankingChart } from './components/IncidentRankingChart';
import { IncidentTypesChart } from './components/IncidentTypesChart';
import { WeeklyAttendanceChart } from './components/WeeklyAttendanceChart';
import {
  BIMESTRE_DASHBOARD_DATA,
  BIMESTRES,
  buildScopedClassroomPool,
  buildScopedStudentPool,
  CHART_COLORS,
  getClassroomAbsenceRanking,
  getClassroomIncidentRanking,
  getDefaultBimestreId,
  getStudentAbsenceRanking,
  getStudentIncidentRanking,
  WEEKLY_ATTENDANCE_DATA,
  WEEKLY_INCIDENT_TYPE_DATA,
  type BimestreId,
  type EducationLevel,
  type RankingPoint,
} from './dashboard.constants';

type LevelFilter = EducationLevel | 'Todos';

const filterByLevel = (points: RankingPoint[], level: LevelFilter): RankingPoint[] =>
  level === 'Todos' ? points : points.filter((point) => point.level === level);

/** Saludo según la hora real del reloj del navegador — `globalDate` es una fecha simulada sin hora significativa (siempre 00:00), así que no sirve para esto. */
const getGreeting = (): { label: string; Icon: typeof Sun } => {
  const hour = new Date().getHours();
  if (hour < 12) return { label: 'Buenos días', Icon: Sun };
  if (hour < 19) return { label: 'Buenas tardes', Icon: Sunset };
  return { label: 'Buenas noches', Icon: Moon };
};

const formatLongDate = (date: Date) => {
  const formatted = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

/**
 * Panel de bienvenida ("Inicio"): un saludo simple arriba (orientación, no
 * análisis) y, debajo, las 4 tarjetas que un director revisa al entrar —
 * agrupadas en 2 secciones narrativas (Asistencia / Convivencia e
 * incidencias) en vez de una rejilla plana de 4 tarjetas sueltas — todas con
 * gráficos Recharts (barras con eje), en vez de los medidores propios sin
 * ejes de la versión anterior (decisión del responsable de producto, ver
 * DESIGN_SYSTEM.md § C2). Las métricas de incidencias se leen por bimestre
 * (selector en el panel izquierdo); la asistencia semanal es un dato "en
 * vivo" y no varía con el bimestre elegido. Todos los datos son simulados;
 * no hay backend todavía.
 */
export const DashboardModule: React.FC<ModuleProps> = ({ globalDate }) => {
  const session = useSession();
  const [selectedBimestreId, setSelectedBimestreId] = useState<BimestreId>(() => getDefaultBimestreId());
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('Todos');
  const today = globalDate ?? new Date();
  const { label: greetingLabel, Icon: GreetingIcon } = getGreeting();
  const firstName = session.user.name.split(' ')[0];

  const bimestreData = BIMESTRE_DASHBOARD_DATA[selectedBimestreId];
  const selectedBimestre = BIMESTRES.find((bimestre) => bimestre.id === selectedBimestreId) ?? BIMESTRES[0];

  // Directivo/auxiliar ven el ranking de todo el colegio (pools por defecto);
  // un docente ve solo sus propias aulas y sus propios alumnos.
  const classroomPool = useMemo(
    () => (session.classrooms ? buildScopedClassroomPool(session.classrooms) : undefined),
    [session.classrooms],
  );
  const studentPool = useMemo(
    () => (session.classrooms ? buildScopedStudentPool(session.classrooms) : undefined),
    [session.classrooms],
  );
  const classroomAbsenceRanking = useMemo(
    () => getClassroomAbsenceRanking(selectedBimestreId, classroomPool),
    [selectedBimestreId, classroomPool],
  );
  const studentAbsenceRanking = useMemo(
    () => getStudentAbsenceRanking(selectedBimestreId, studentPool),
    [selectedBimestreId, studentPool],
  );
  const classroomIncidentRanking = useMemo(
    () => getClassroomIncidentRanking(selectedBimestreId, classroomPool),
    [selectedBimestreId, classroomPool],
  );
  const studentIncidentRanking = useMemo(
    () => getStudentIncidentRanking(selectedBimestreId, studentPool),
    [selectedBimestreId, studentPool],
  );

  return (
    <ModuleShell>
      <DashboardSidebar
        selectedBimestreId={selectedBimestreId}
        onSelectBimestre={setSelectedBimestreId}
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
      />

      {/* Área principal: resumen ejecutivo del colegio */}
      <ModulePane>
        {/* Mismo alto (`h-16`) e idéntica anatomía que la cabecera del sidebar:
            las dos columnas arrancan en la misma línea. */}
        <ModulePaneHeader>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
              <GreetingIcon size={24} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-800 dark:text-white">
                {greetingLabel}, {firstName}
              </p>
              <p className="truncate text-base text-slate-500 dark:text-slate-400">{formatLongDate(today)}</p>
            </div>
          </div>
        </ModulePaneHeader>

        <ModuleBody centered>
          <section>
            <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Asistencia
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              <WeeklyAttendanceChart
                weekData={WEEKLY_ATTENDANCE_DATA}
                bimestreData={bimestreData.weeklyAttendance}
                bimestreLabel={selectedBimestre.label}
                today={today}
              />
              <IncidentRankingChart
                variants={[
                  {
                    key: 'aulas',
                    toggleLabel: 'Aulas',
                    title: 'Aulas con Más Faltas',
                    icon: CalendarX2,
                    emptyLabel: 'Sin inasistencias registradas este bimestre.',
                    data: filterByLevel(classroomAbsenceRanking, selectedLevel),
                    barColor: CHART_COLORS.blue500,
                    showLevelLegend: true,
                  },
                  {
                    key: 'estudiantes',
                    toggleLabel: 'Estudiantes',
                    title: 'Estudiantes con Mayor Faltas',
                    icon: UserX,
                    emptyLabel: 'Sin inasistencias registradas este bimestre.',
                    data: filterByLevel(studentAbsenceRanking, selectedLevel),
                    barColor: CHART_COLORS.blue500,
                  },
                ]}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Convivencia e incidencias
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              <IncidentTypesChart bimestreData={bimestreData.incidentTypeData} weekData={WEEKLY_INCIDENT_TYPE_DATA} />
              <IncidentRankingChart
                variants={[
                  {
                    key: 'aulas',
                    toggleLabel: 'Aulas',
                    title: 'Aulas con Más Incidencias',
                    icon: School,
                    emptyLabel: 'Sin incidencias registradas este bimestre.',
                    data: filterByLevel(classroomIncidentRanking, selectedLevel),
                    barColor: CHART_COLORS.rose500,
                    showLevelLegend: true,
                  },
                  {
                    key: 'estudiantes',
                    toggleLabel: 'Estudiantes',
                    title: 'Estudiantes con Reincidencias',
                    icon: UserRound,
                    emptyLabel: 'Sin incidencias registradas este bimestre.',
                    data: filterByLevel(studentIncidentRanking, selectedLevel),
                    barColor: CHART_COLORS.rose500,
                  },
                ]}
              />
            </div>
          </section>
        </ModuleBody>
      </ModulePane>
    </ModuleShell>
  );
};
