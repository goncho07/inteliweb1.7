import React, { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, GraduationCap, UserRound } from 'lucide-react';

import { ModuleSidebar, ModuleSidebarBody, ModuleSidebarSection } from '@/components/layout/ModuleShell';
import { NavCard } from '@/components/common/NavCard';
import { Button } from '@/components/ui/button';
import { ClassroomRosterPanel } from '@/features/classrooms/components/ClassroomRosterPanel';
import { getSectionSize } from '@/data/education';
import { useSession } from '@/features/auth/SessionContext';
import { visibleClassroomTree } from '@/features/auth/scope';
import type { ClassroomRef } from '@/features/classrooms/types';
import { cn } from '@/lib/utils';
import { UserItem } from '@/types';

interface LevelGroup {
  level: string;
  gradeGroups: {
    key: string;
    label: string;
    totalCount: number;
    sections: { key: string; label: string; count: number }[];
  }[];
  sectionCount: number;
  totalStudents: number;
}

/**
 * Construye las tarjetas de nivel a partir del árbol nivel → grado → sección
 * que corresponde a la sesión (`visibleClassroomTree`): para directivo y
 * auxiliar es siempre Secundaria (igual que hoy); para un docente, el único
 * nivel de sus aulas asignadas, ya recortado a sus propios grados y
 * secciones (`assignTeacherClassrooms` en `data/users.ts` nunca reparte
 * aulas de más de un nivel a un mismo docente).
 */
const buildLevelGroups = (tree: Record<string, Record<string, string[]>>): LevelGroup[] =>
  Object.entries(tree).map(([level, grades]) => {
    const gradeGroups = Object.entries(grades).map(([grade, sections]) => ({
      key: grade,
      label: grade,
      totalCount: sections.reduce((sum, section) => sum + getSectionSize(level, grade, section), 0),
      sections: sections.map((section) => ({
        key: section,
        label: `${grade.replace('° Grado', '°')} ${section}`,
        count: getSectionSize(level, grade, section),
      })),
    }));

    return {
      level,
      gradeGroups,
      sectionCount: gradeGroups.reduce((sum, g) => sum + g.sections.length, 0),
      totalStudents: gradeGroups.reduce((sum, g) => sum + g.totalCount, 0),
    };
  });

const isSameClassroom = (a: ClassroomRef | null, b: ClassroomRef) =>
  !!a && a.level === b.level && a.grade === b.grade && a.section === b.section;

/**
 * Sidebar del módulo: carpetas Grado → Sección de Secundaria. Elegir una
 * sección la despliega en el sitio —`ClassroomRosterPanel` aparece debajo de
 * su fila— para que el árbol de niveles nunca desaparezca de la vista.
 */
export const ClassroomSidebar: React.FC<{
  expandedClassroom: ClassroomRef | null;
  onToggleClassroom: (classroom: ClassroomRef) => void;
  selectedStudent: UserItem | null;
  onSelectStudent: (classroom: ClassroomRef, student: UserItem) => void;
  isOverviewOpen: boolean;
  onOpenOverview: (classroom: ClassroomRef) => void;
}> = ({ expandedClassroom, onToggleClassroom, selectedStudent, onSelectStudent, isOverviewOpen, onOpenOverview }) => {
  const session = useSession();

  const levelGroups = useMemo(() => {
    const tree = visibleClassroomTree(session);
    // Directivo y auxiliar ven todo el colegio, pero el árbol de Aulas sigue
    // mostrando solo Secundaria (igual que hoy); un docente ve el único
    // nivel de sus aulas asignadas.
    const scopedTree = session.classrooms === null ? { Secundaria: tree.Secundaria ?? {} } : tree;
    return buildLevelGroups(scopedTree);
  }, [session]);

  const [openGrades, setOpenGrades] = useState<Record<string, boolean>>(() =>
    expandedClassroom ? { [`${expandedClassroom.level}-${expandedClassroom.grade}`]: true } : {},
  );

  const isGradeOpenFor = (level: string, grade: string) => {
    const key = `${level}-${grade}`;
    return !!openGrades[key] || (grade === expandedClassroom?.grade && level === expandedClassroom?.level);
  };
  const toggleGrade = (level: string, grade: string) => {
    const key = `${level}-${grade}`;
    const isOpen = isGradeOpenFor(level, grade);
    // Cerrar el grado que contiene el aula desplegada también repliega su lista de alumnos.
    if (isOpen && expandedClassroom?.grade === grade && expandedClassroom?.level === level) {
      onToggleClassroom(expandedClassroom);
    }
    setOpenGrades((prev) => ({ ...prev, [key]: !isOpen }));
  };

  return (
    <ModuleSidebar title="Aulas" icon={BookOpen}>
      <ModuleSidebarBody>
        {levelGroups.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
              <GraduationCap size={20} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No tiene aulas asignadas</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Contacte a Dirección para que le asignen una sección a cargo.
              </p>
            </div>
          </div>
        )}

        {levelGroups.map((levelGroup) => (
          <ModuleSidebarSection
            key={levelGroup.level}
            label={levelGroup.level}
          >
            {levelGroup.gradeGroups.map((group) => {
              const isGradeOpen = isGradeOpenFor(levelGroup.level, group.key);
              return (
                <div key={group.key} className="flex flex-col gap-2">
                  {/* Misma tarjeta que el selector de bimestre de Inicio y el de
                      rol de Usuarios: idéntico alto, radio, tipografía y sangría. */}
                  <NavCard
                    title={group.label}
                    statLines={[`${group.totalCount} estudiantes`]}
                    selected={isGradeOpen}
                    onClick={() => toggleGrade(levelGroup.level, group.key)}
                    leadingClassName={isGradeOpen ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800'}
                    leading={
                      isGradeOpen ? (
                        <ChevronDown size={20} strokeWidth={2.5} className="text-white" />
                      ) : (
                        <ChevronRight size={20} strokeWidth={2.5} className="text-slate-500 dark:text-slate-400" />
                      )
                    }
                  />

                  {isGradeOpen && (
                    /* Sin caja ni relleno propio: las secciones y su lista de
                       alumnos ocupan todo el ancho de la barra lateral en vez
                       de quedar sangradas dentro de un recuadro. */
                    <div className="flex flex-col gap-1">
                      {group.sections.map((section) => {
                        const classroom: ClassroomRef = {
                          level: levelGroup.level,
                          grade: group.key,
                          section: section.key,
                        };
                        const isExpanded = isSameClassroom(expandedClassroom, classroom);
                        return (
                          <div key={section.key} className="flex flex-col gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => onToggleClassroom(classroom)}
                              aria-expanded={isExpanded}
                              className={cn(
                                'h-12 w-full justify-between gap-3 rounded-xl px-3 text-left',
                                isExpanded
                                  ? 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100',
                              )}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown size={20} strokeWidth={2} className="shrink-0" />
                                ) : (
                                  <ChevronRight size={20} strokeWidth={2} className="shrink-0" />
                                )}
                                <span className={cn('truncate text-sm', isExpanded ? 'font-bold' : 'font-semibold')}>
                                  {section.label}
                                </span>
                              </span>
                              {/* Contador de alumnos: la silueta lo etiqueta sin
                                  necesidad de una palabra que no cabe en la pill. */}
                              <span
                                className={cn(
                                  'flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
                                  isExpanded
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                                )}
                                title={`${section.count} estudiantes`}
                              >
                                <UserRound size={16} strokeWidth={2} aria-hidden="true" />
                                {section.count}
                              </span>
                            </Button>

                            {isExpanded && (
                              <ClassroomRosterPanel
                                classroom={classroom}
                                selectedStudent={selectedStudent}
                                onSelectStudent={(student) => onSelectStudent(classroom, student)}
                                isOverviewOpen={isOverviewOpen}
                                onOpenOverview={() => onOpenOverview(classroom)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </ModuleSidebarSection>
        ))}
      </ModuleSidebarBody>
    </ModuleSidebar>
  );
};
