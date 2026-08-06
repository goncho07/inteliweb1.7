import React, { useMemo, useState } from 'react';
import { HeartHandshake, School } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ModulePane, ModuleShell } from '@/components/layout/ModuleShell';
import { MOCK_USERS } from '@/data/users';
import { useSession } from '@/features/auth/SessionContext';
import { ClassroomSidebar } from '@/features/classrooms/components/ClassroomSidebar';
import { ClassroomTodayOverview } from '@/features/classrooms/components/ClassroomTodayOverview';
import { StudentDetail } from '@/features/classrooms/components/StudentDetail';
import { useClassroomsNavigation } from '@/features/classrooms/hooks/useClassroomsNavigation';
import { ModuleProps, UserItem } from '@/types';

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
 * (`session.children`, resuelto por `buildSession`). Si tiene más de uno
 * vinculado, `GuardianClassroomsView` (abajo) ofrece un selector.
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
    return <GuardianClassroomsView children={session.children} />;
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
          <EmptyState
            icon={School}
            title="Elija una sección"
            description="Navegue por los niveles educativos del panel de la izquierda y elija un grado y una sección para ver los detalles del aula."
          />
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
          {/* `key`: al elegir otro alumno del mismo aula el componente se
              vuelve a montar en vez de arrastrar el mes, la página de
              incidencias o una justificación a medio llenar del alumno
              anterior. */}
          <StudentDetail
            key={view.student.id}
            student={view.student}
            onBack={() => goToSectionOverview(view.classroom)}
          />
        </ModulePane>
      )}
    </ModuleShell>
  );
};

/**
 * Vista del apoderado: sin sidebar, entra directo al perfil de su hijo. Si
 * tiene más de uno vinculado (`session.children`), elige cuál ver desde el
 * propio selector de `StudentDetail` — la sesión no vuelve a preguntar en
 * cada visita, el primero se muestra por defecto.
 */
const GuardianClassroomsView: React.FC<{ children: UserItem[] }> = ({ children }) => {
  const [selectedId, setSelectedId] = useState(children[0]?.id);
  const child = children.find((c) => c.id === selectedId) ?? children[0];

  return (
    <ModuleShell>
      <ModulePane>
        {child ? (
          // Sin `onBack`: el apoderado entra directo al perfil de su hijo,
          // no hay lista detrás a la que volver.
          <StudentDetail
            key={child.id}
            student={child}
            isParentView
            allChildren={children}
            onSelectChild={(next) => setSelectedId(next.id)}
          />
        ) : (
          <EmptyState
            icon={HeartHandshake}
            title="Sin estudiante vinculado"
            description="No encontramos un estudiante vinculado a su cuenta. Comuníquese con Dirección para regularizar el vínculo con su hijo."
          />
        )}
      </ModulePane>
    </ModuleShell>
  );
};
