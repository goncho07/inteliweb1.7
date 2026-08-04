import React, { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Folder, GraduationCap } from 'lucide-react';

import { ModuleSidebar } from '@/components/layout/ModuleShell';
import { Button } from '@/components/ui/button';
import { AcademicDatesPopover } from '@/features/classrooms/components/overview/AcademicDatesPopover';
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

  const allGroupKeys = useMemo(
    () => levelGroups.flatMap((level) => level.gradeGroups.map((g) => `${level.level}-${g.key}`)),
    [levelGroups],
  );

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
  const expandAll = () => setOpenGrades(Object.fromEntries(allGroupKeys.map((key) => [key, true])));

  return (
    <ModuleSidebar title="Aulas" icon={BookOpen} actions={<AcademicDatesPopover />}>
      <div className="hidden-scrollbar flex-1 space-y-3 overflow-y-auto p-3">
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
          <div key={levelGroup.level} className="space-y-3 rounded-2xl bg-white p-3 dark:bg-slate-900">
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                <GraduationCap size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{levelGroup.level}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {levelGroup.gradeGroups.length} {levelGroup.gradeGroups.length === 1 ? 'grado' : 'grados'} •{' '}
                  {levelGroup.sectionCount} {levelGroup.sectionCount === 1 ? 'sección' : 'secciones'} (
                  {levelGroup.totalStudents.toLocaleString('es-PE')} est.)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Carpetas por grado
                </p>
                <Button
                  type="button"
                  variant="link"
                  onClick={expandAll}
                  className="h-10 px-2 text-xs font-semibold text-blue-700 dark:text-blue-400"
                >
                  Ver todo
                </Button>
              </div>

              <div className="space-y-2">
                {levelGroup.gradeGroups.map((group) => {
                  const isGradeOpen = isGradeOpenFor(levelGroup.level, group.key);
                  return (
                    <div key={group.key} className="rounded-xl border border-slate-200 dark:border-slate-800">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => toggleGrade(levelGroup.level, group.key)}
                        aria-expanded={isGradeOpen}
                        className="h-11 w-full justify-between gap-2 rounded-xl px-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {isGradeOpen ? (
                            <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-slate-400" />
                          ) : (
                            <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-slate-400" />
                          )}
                          <span className="truncate text-sm font-bold text-slate-800 dark:text-white">{group.label}</span>
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-slate-400 dark:text-slate-500">
                          {group.totalCount} est.
                        </span>
                      </Button>

                      {isGradeOpen && (
                        <div className="space-y-1 border-t border-slate-100 p-2 dark:border-slate-800">
                          {group.sections.map((section) => {
                            const classroom: ClassroomRef = {
                              level: levelGroup.level,
                              grade: group.key,
                              section: section.key,
                            };
                            const isExpanded = isSameClassroom(expandedClassroom, classroom);
                            return (
                              <div key={section.key} className="space-y-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => onToggleClassroom(classroom)}
                                  aria-expanded={isExpanded}
                                  className={cn(
                                    'h-10 w-full justify-between gap-2 rounded-lg px-3 text-left',
                                    isExpanded
                                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50',
                                  )}
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    {isExpanded ? (
                                      <ChevronDown size={16} strokeWidth={2} className="shrink-0" />
                                    ) : (
                                      <Folder size={16} strokeWidth={2} className="shrink-0" />
                                    )}
                                    <span className={cn('truncate text-sm', isExpanded ? 'font-semibold' : 'font-medium')}>
                                      {section.label}
                                    </span>
                                  </span>
                                  <span
                                    className={cn(
                                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-bold',
                                      isExpanded
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                                    )}
                                  >
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </ModuleSidebar>
  );
};
