import React, { useMemo } from 'react';
import { HeartHandshake, School } from 'lucide-react';
import { ModulePane, ModuleShell } from '@/components/layout/ModuleShell';
import { MOCK_USERS } from '@/data/users';
import { useSession } from '@/features/auth/SessionContext';
import { ClassroomSidebar } from '@/features/classrooms/components/ClassroomSidebar';
import { ClassroomTodayOverview } from '@/features/classrooms/components/ClassroomTodayOverview';
import { StudentDetail } from '@/features/classrooms/components/StudentDetail';
import { useClassroomsNavigation } from '@/features/classrooms/hooks/useClassroomsNavigation';
import { ModuleProps } from '@/types';

/**
 * Módulo Aulas: un solo camino de navegación (`useClassroomsNavigation`, ver
 * `ClassroomsView` en `types.ts`) — Nivel → Grado → Sección → Alumnos → Perfil.
 * El árbol de niveles (`ClassroomSidebar`) se mantiene siempre visible; elegir
 * un aula despliega su lista de alumnos debajo, en vez de navegar a un
 * sidebar aparte. La Vista General de la sección (`ClassroomTodayOverview`)
 * incluye sus reportes de asistencia, incidencias y citaciones — no existe un
 * módulo Reportes aparte. Citar a un apoderado vive en el módulo Citaciones;
 * no se abre desde aquí.
 *
 * El apoderado no navega: entra directo al perfil de su hijo, sin sidebar
 * (`session.children[0]`, resuelto por `buildSession`).
 */
export const ClassroomsModule: React.FC<ModuleProps> = ({ globalDate }) => {
  const session = useSession();
  const { view, toggleClassroom, selectStudent, goToSectionOverview } = useClassroomsNavigation();

  const classroom = view.kind === 'browse' ? null : view.classroom;

  const students = useMemo(() => {
    if (!classroom) return [];
    return MOCK_USERS.filter(
      (u) =>
        u.role === 'Estudiante' &&
        u.level === classroom.level &&
        u.grade === classroom.grade &&
        u.section === classroom.section,
    );
  }, [classroom]);

  if (session.role === 'apoderado') {
    const child = session.children[0];
    return (
      <ModuleShell>
        <ModulePane>
          {child ? (
            <StudentDetail student={child} onBack={() => undefined} isParentView />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-800/40 dark:bg-blue-900/30 dark:text-blue-400">
                  <HeartHandshake size={32} />
                </div>
                <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                  Sin estudiante vinculado
                </h2>
                <p className="max-w-sm text-base leading-relaxed text-slate-500 dark:text-slate-400">
                  No encontramos un estudiante vinculado a su cuenta. Contacte a Dirección para
                  regularizar el vínculo con su hijo.
                </p>
              </div>
            </div>
          )}
        </ModulePane>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell>
      <ClassroomSidebar
        expandedClassroom={classroom}
        onToggleClassroom={toggleClassroom}
        selectedStudent={view.kind === 'student-detail' ? view.student : null}
        onSelectStudent={selectStudent}
        isOverviewOpen={view.kind === 'section-overview'}
        onOpenOverview={goToSectionOverview}
      />

      {view.kind === 'browse' && (
        <ModulePane>
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-800/40 dark:bg-blue-900/30 dark:text-blue-400">
                <School size={32} />
              </div>
              <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                Elige una sección
              </h2>
              <p className="max-w-sm text-base leading-relaxed text-slate-500 dark:text-slate-400">
                Navega por los niveles educativos y elige un grado y una sección en el panel para ver
                los detalles del aula.
              </p>
            </div>
          </div>
        </ModulePane>
      )}

      {view.kind === 'section-overview' && (
        <ModulePane>
          <ClassroomTodayOverview
            classroom={view.classroom}
            students={students}
            globalDate={globalDate}
          />
        </ModulePane>
      )}

      {view.kind === 'student-detail' && (
        <ModulePane>
          <StudentDetail
            student={view.student}
            onBack={() => goToSectionOverview(view.classroom)}
          />
        </ModulePane>
      )}
    </ModuleShell>
  );
};
