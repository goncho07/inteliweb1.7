import { useMemo, useState } from 'react';
import { CalendarX2, Moon, School, Sun, Sunset, UserRound, UserX } from 'lucide-react';
import type { AppliedFilterChip } from '@/components/common/AppliedFilterChips';
import { AppliedFilterChips } from '@/components/common/AppliedFilterChips';
import { ModuleBody, ModulePane, ModulePaneHeader, ModuleShell } from '@/components/layout/ModuleShell';
import { MOCK_USERS } from '@/data/users';
import { visibleClassroomTree, visibleStudents } from '@/features/auth/scope';
import { useSession } from '@/features/auth/SessionContext';
import { RegisterIncidentModal } from '@/features/classrooms/components/student-detail/RegisterIncidentModal';
import {
  DraftCitationModal,
  formatGuardianPhone,
  guardianRelationship,
  type DraftCitationResult,
} from '@/features/citations/components/DraftCitationModal';
import { useToast } from '@/hooks/use-toast';
import { formatLongDate } from '@/lib/formatLongDate';
import { ModuleProps, UserItem } from '@/types';

import { getRecentCitations, getRecentIncidents } from './dashboard.recent';
import { DashboardRecentActivity } from './components/DashboardRecentActivity';
import { DashboardScopeFilter } from './components/DashboardScopeFilter';
import { DashboardSidebar } from './components/DashboardSidebar';
import { IncidentRankingChart } from './components/IncidentRankingChart';
import { IncidentTypesChart } from './components/IncidentTypesChart';
import { QuickAttendanceModal } from './components/QuickAttendanceModal';
import { QuickBroadcastModal } from './components/QuickBroadcastModal';
import { QuickIncidentPickerModal } from './components/QuickIncidentPickerModal';
import { WeeklyAttendanceChart } from './components/WeeklyAttendanceChart';
import {
  ALL_SCOPE,
  BIMESTRE_DASHBOARD_DATA,
  BIMESTRES,
  buildClassroomPool,
  buildStudentPool,
  CHART_COLORS,
  FULL_SCHOOL_SCOPE,
  getClassroomAbsenceRanking,
  getClassroomIncidentRanking,
  getDefaultBimestreId,
  getScopedIncidentTypes,
  getScopedWeeklyAttendance,
  getStudentAbsenceRanking,
  getStudentIncidentRanking,
  type BimestreId,
  type DashboardScope,
} from './dashboard.constants';
import { getDashboardMonth, getDashboardMonthLabel, getMonthWeeks } from './dashboard.weeks';

/** Saludo según la hora real del reloj del navegador — `globalDate` es una fecha simulada sin hora significativa (siempre 00:00), así que no sirve para esto. */
const getGreeting = (): { label: string; Icon: typeof Sun } => {
  const hour = new Date().getHours();
  if (hour < 12) return { label: 'Buenos días', Icon: Sun };
  if (hour < 19) return { label: 'Buenas tardes', Icon: Sunset };
  return { label: 'Buenas noches', Icon: Moon };
};

/**
 * Panel de bienvenida ("Inicio"): un saludo simple arriba (orientación, no
 * análisis) y, debajo, las 4 tarjetas que un director revisa al entrar, en dos
 * filas de dos, todas con gráficos Recharts (barras con eje) en vez de los
 * medidores propios sin ejes de la versión anterior (decisión del responsable
 * de producto, ver DESIGN_SYSTEM.md § C2). Las filas no llevan título propio:
 * cada tarjeta ya dice qué muestra y un rótulo encima solo repetía lo que se
 * lee dentro.
 *
 * El bimestre se elige en el panel izquierdo y manda sobre los rankings; las
 * dos tarjetas de gráfico se leen por mes y semana, con los mismos tramos que
 * los reportes de Aulas (ver `dashboard.weeks.ts`). El filtro de la cabecera
 * acota las cuatro tarjetas a un nivel, grado o sección. Todos los datos son
 * simulados; no hay backend todavía.
 */
export const DashboardModule: React.FC<ModuleProps> = ({ globalDate }) => {
  const session = useSession();
  const { toast } = useToast();
  const [selectedBimestreId, setSelectedBimestreId] = useState<BimestreId>(() => getDefaultBimestreId());
  const [scope, setScope] = useState<DashboardScope>(FULL_SCHOOL_SCOPE);
  // Estable entre renders: alimenta el cálculo memoizado de las incidencias recientes.
  const today = useMemo(() => globalDate ?? new Date(), [globalDate]);
  const { label: greetingLabel, Icon: GreetingIcon } = getGreeting();
  const firstName = session.user.name.split(' ')[0];

  // Acciones rápidas (solo docente, ver `showsQuickActions` más abajo): las
  // cuatro ventanas abren directo desde Inicio, sin salir del panel. Cada una
  // es autónoma — no hay un almacén compartido entre módulos, así que lo que
  // registran aquí no reaparece luego en Aulas o Citaciones (igual que el
  // resto de la app: datos simulados, sin persistencia).
  const [activeQuickAction, setActiveQuickAction] = useState<
    'asistencia' | 'comunicados' | 'incidencias' | 'citaciones' | null
  >(null);
  const [incidentStudent, setIncidentStudent] = useState<UserItem | null>(null);
  const [incidentForm, setIncidentForm] = useState({ type: '', description: '', teacher: session.user.name });
  const quickActionClassrooms = useMemo(() => session.classrooms ?? [], [session.classrooms]);
  const draftCitationStudents = useMemo(() => visibleStudents(session), [session]);

  const handleRegisterAttendance: React.ComponentProps<typeof QuickAttendanceModal>['onRegister'] = (
    classroom,
    statuses,
  ) => {
    const total = Object.keys(statuses).length;
    const faltas = Object.values(statuses).filter((s) => s === 'Falta').length;
    setActiveQuickAction(null);
    toast({
      title: 'Asistencia registrada',
      description: `${classroom.grade.replace(' Grado', '')} ${classroom.section}: ${total} alumnos, ${faltas} faltas.`,
      variant: 'success',
    });
  };

  const handleSendBroadcast: React.ComponentProps<typeof QuickBroadcastModal>['onSend'] = (
    classroom,
    _message,
    guardianCount,
  ) => {
    setActiveQuickAction(null);
    toast({
      title: 'Aviso enviado',
      description: `Se envió por WhatsApp a ${guardianCount} apoderados de ${classroom.grade.replace(' Grado', '')} ${classroom.section}.`,
      variant: 'success',
    });
  };

  const handlePickIncidentStudent = (student: UserItem) => {
    setIncidentForm({ type: '', description: '', teacher: session.user.name });
    setIncidentStudent(student);
    setActiveQuickAction(null);
  };

  const handleRegisterIncident = () => {
    if (!incidentStudent) return;
    toast({
      title: 'Incidencia registrada',
      description: `Se registró la incidencia de ${incidentStudent.name}.`,
      variant: 'success',
    });
    setIncidentStudent(null);
  };

  const handleDraftCitation = (result: DraftCitationResult) => {
    setActiveQuickAction(null);
    toast({
      title: 'Citación creada',
      description: `Se registró la citación de ${guardianRelationship(result.guardian)} ${result.guardian.name} (${formatGuardianPhone(result.guardian.phone)}).`,
      variant: 'success',
    });
  };

  const bimestreData = BIMESTRE_DASHBOARD_DATA[selectedBimestreId];
  const selectedBimestre = BIMESTRES.find((bimestre) => bimestre.id === selectedBimestreId) ?? BIMESTRES[0];

  // Directivo/auxiliar ven el ranking de todo el colegio; un docente, solo sus
  // propias aulas y sus propios alumnos. Sobre ese alcance se aplica además el
  // filtro de nivel/grado/sección de la cabecera.
  // Un docente solo puede acotar dentro de sus propias aulas; un directivo,
  // dentro de toda la institución.
  const scopeStructure = useMemo(() => visibleClassroomTree(session), [session]);
  const classroomPool = useMemo(
    () => buildClassroomPool(scope, session.classrooms),
    [scope, session.classrooms],
  );
  const studentPool = useMemo(
    () => buildStudentPool(scope, session.classrooms),
    [scope, session.classrooms],
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

  // Asistencia y tipos de incidencia no tienen desglose por aula en los datos
  // simulados: se derivan del ámbito (ver `getScopedWeeklyAttendance`).
  const attendancePattern = useMemo(
    () => getScopedWeeklyAttendance(bimestreData.weeklyAttendance, scope),
    [bimestreData, scope],
  );
  const incidentTypeProfile = useMemo(
    () => getScopedIncidentTypes(bimestreData.incidentTypeData, scope),
    [bimestreData, scope],
  );

  // Periodo de las dos tarjetas de gráfico: un mes, filtrado por semana, con
  // los mismos tramos ("Semana 1", "Semana 2"…) que los reportes de Aulas.
  const monthCursor = useMemo(() => getDashboardMonth(selectedBimestre, today), [selectedBimestre, today]);
  const monthWeeks = useMemo(() => getMonthWeeks(monthCursor), [monthCursor]);
  const monthLabel = getDashboardMonthLabel(monthCursor);
  const chartSeed = `${selectedBimestreId}-${scope.level}-${scope.grade}-${scope.section}`;

  // Lo aplicado, a la vista y quitable pieza a pieza — igual que en Usuarios y
  // Citaciones. Quitar el nivel arrastra al grado y a la sección, que sin él
  // quedarían huérfanos.
  const scopeChips: AppliedFilterChip[] = [
    {
      key: 'level',
      label: 'Nivel',
      value: scope.level,
      clear: () => setScope(FULL_SCHOOL_SCOPE),
    },
    {
      key: 'grade',
      label: 'Grado',
      value: scope.grade,
      clear: () => setScope({ ...scope, grade: ALL_SCOPE, section: ALL_SCOPE }),
    },
    {
      key: 'section',
      label: 'Sección',
      value: scope.section,
      clear: () => setScope({ ...scope, section: ALL_SCOPE }),
    },
  ].filter((chip) => chip.value !== ALL_SCOPE);

  /**
   * Un ranking vacío con filtro puesto no es "no hay incidencias": es que el
   * filtro no alcanza ningún aula (un docente acotando a un nivel que no
   * enseña). El estado vacío lo dice, en vez de dar por buena una cifra cero.
   */
  const rankingEmptyLabel = (label: string) =>
    classroomPool.length === 0 ? 'No hay aulas dentro del filtro elegido.' : label;

  // Quién está mirando: el directivo revisa el colegio (rankings de aulas);
  // docente y auxiliar trabajan el día a día de sus aulas (actividad reciente).
  const showsClassroomRankings = session.role === 'directivo';
  const showsRecentActivity = session.role === 'docente' || session.role === 'auxiliar';
  // Las acciones rápidas actúan sobre "mis aulas": solo tiene sentido para un
  // docente, el único rol con `session.classrooms` acotado a su propia carga.
  const showsQuickActions = session.role === 'docente';

  const recentIncidents = useMemo(
    () => (showsRecentActivity ? getRecentIncidents(session, today) : []),
    [session, showsRecentActivity, today],
  );
  const recentCitations = useMemo(
    () => (showsRecentActivity ? getRecentCitations(session) : []),
    [session, showsRecentActivity],
  );

  return (
    <ModuleShell>
      <DashboardSidebar
        selectedBimestreId={selectedBimestreId}
        onSelectBimestre={setSelectedBimestreId}
        showsQuickActions={showsQuickActions}
        onSelectQuickAction={setActiveQuickAction}
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

          <DashboardScopeFilter scope={scope} structure={scopeStructure} onApply={setScope} />
        </ModulePaneHeader>

        <ModuleBody centered>
          <AppliedFilterChips chips={scopeChips} onClearAll={() => setScope(FULL_SCHOOL_SCOPE)} />

          <section>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              <WeeklyAttendanceChart
                pattern={attendancePattern}
                weeks={monthWeeks}
                monthLabel={monthLabel}
                today={today}
                seed={chartSeed}
              />
              <IncidentRankingChart
                variants={[
                  // El ranking de aulas solo tiene sentido para quien compara
                  // unas aulas con otras: un directivo. Un docente o auxiliar
                  // ve directamente a sus estudiantes.
                  ...(showsClassroomRankings
                    ? [
                        {
                          key: 'aulas',
                          toggleLabel: 'Aulas',
                          title: 'Aulas con Más Faltas',
                          icon: CalendarX2,
                          emptyLabel: rankingEmptyLabel('Sin inasistencias registradas este bimestre.'),
                          data: classroomAbsenceRanking,
                          barColor: CHART_COLORS.blue500,
                          showLevelLegend: true,
                        },
                      ]
                    : []),
                  {
                    key: 'estudiantes',
                    toggleLabel: 'Estudiantes',
                    title: 'Estudiantes con Mayor Faltas',
                    icon: UserX,
                    emptyLabel: rankingEmptyLabel('Sin inasistencias registradas este bimestre.'),
                    data: studentAbsenceRanking,
                    barColor: CHART_COLORS.blue500,
                  },
                ]}
              />
            </div>
          </section>

          <section>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              <IncidentTypesChart
                profile={incidentTypeProfile}
                weeks={monthWeeks}
                monthLabel={monthLabel}
                today={today}
                seed={chartSeed}
              />
              <IncidentRankingChart
                variants={[
                  ...(showsClassroomRankings
                    ? [
                        {
                          key: 'aulas',
                          toggleLabel: 'Aulas',
                          title: 'Aulas con Más Incidencias',
                          icon: School,
                          emptyLabel: rankingEmptyLabel('Sin incidencias registradas este bimestre.'),
                          data: classroomIncidentRanking,
                          barColor: CHART_COLORS.rose500,
                          showLevelLegend: true,
                        },
                      ]
                    : []),
                  {
                    key: 'estudiantes',
                    toggleLabel: 'Estudiantes',
                    title: 'Estudiantes con Reincidencias',
                    icon: UserRound,
                    emptyLabel: rankingEmptyLabel('Sin incidencias registradas este bimestre.'),
                    data: studentIncidentRanking,
                    barColor: CHART_COLORS.rose500,
                  },
                ]}
              />
            </div>
          </section>

          {showsRecentActivity && (
            <DashboardRecentActivity incidents={recentIncidents} citations={recentCitations} />
          )}
        </ModuleBody>
      </ModulePane>

      {showsQuickActions && (
        <>
          <QuickAttendanceModal
            isOpen={activeQuickAction === 'asistencia'}
            onClose={() => setActiveQuickAction(null)}
            classrooms={quickActionClassrooms}
            today={today}
            onRegister={handleRegisterAttendance}
          />

          <QuickBroadcastModal
            isOpen={activeQuickAction === 'comunicados'}
            onClose={() => setActiveQuickAction(null)}
            classrooms={quickActionClassrooms}
            onSend={handleSendBroadcast}
          />

          <QuickIncidentPickerModal
            isOpen={activeQuickAction === 'incidencias'}
            onClose={() => setActiveQuickAction(null)}
            classrooms={quickActionClassrooms}
            onPickStudent={handlePickIncidentStudent}
          />

          {incidentStudent && (
            <RegisterIncidentModal
              isOpen={!!incidentStudent}
              onClose={() => setIncidentStudent(null)}
              student={incidentStudent}
              incidentForm={incidentForm}
              setIncidentForm={setIncidentForm}
              onRegister={handleRegisterIncident}
            />
          )}

          <DraftCitationModal
            isOpen={activeQuickAction === 'citaciones'}
            onClose={() => setActiveQuickAction(null)}
            students={draftCitationStudents}
            allUsers={MOCK_USERS}
            onConfirm={handleDraftCitation}
          />
        </>
      )}
    </ModuleShell>
  );
};
