import { useState } from 'react';
import type { ClassroomRef, ClassroomsView } from '@/features/classrooms/types';
import type { UserItem } from '@/types';

/**
 * Única fuente de verdad de "qué se ve" en el módulo Aulas. Reemplaza las 4
 * banderas booleanas + `selectedClassroom`/`selectedStudent` que tenía
 * `ClassroomsModule` antes de este rework — cada acción produce una vista
 * completa y válida, en vez de dejar que combinaciones de banderas queden a
 * medio actualizar. Solo se usa para el personal (directivo/docente/
 * auxiliar): el apoderado no navega, `ClassroomsModule` lo resuelve aparte.
 */
export function useClassroomsNavigation() {
  const [view, setView] = useState<ClassroomsView>({ kind: 'browse' });

  /**
   * Despliega el aula en el árbol del sidebar; si ya estaba desplegada, la
   * cierra (vuelve a `browse`) — es el equivalente a "volver" ahora que no
   * hay un sidebar aparte al que regresar.
   */
  const toggleClassroom = (classroom: ClassroomRef) =>
    setView((prev) => {
      const isSameExpanded =
        prev.kind !== 'browse' &&
        prev.classroom.level === classroom.level &&
        prev.classroom.grade === classroom.grade &&
        prev.classroom.section === classroom.section;
      return isSameExpanded ? { kind: 'browse' } : { kind: 'section-overview', classroom };
    });
  const selectStudent = (classroom: ClassroomRef, student: UserItem) =>
    setView({ kind: 'student-detail', classroom, student });
  const goToSectionOverview = (classroom: ClassroomRef) => setView({ kind: 'section-overview', classroom });

  return {
    view,
    toggleClassroom,
    selectStudent,
    goToSectionOverview,
  };
}
