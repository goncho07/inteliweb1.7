import React, { useMemo, useState } from 'react';
import { LayoutGrid, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { StudentAvatar } from '@/components/common/StudentAvatar';
import { MOCK_USERS } from '@/data/users';
import type { ClassroomRef } from '@/features/classrooms/types';
import { cn } from '@/lib/utils';
import { UserItem } from '@/types';

/**
 * Lista de alumnos de una sección, desplegada bajo su fila en el árbol de
 * `ClassroomSidebar`. Antes vivía en un sidebar aparte (con su propio botón
 * "volver") al que se navegaba al elegir un aula; ahora aparece debajo de la
 * fila del aula para no romper la vista del árbol de niveles.
 */
export const ClassroomRosterPanel: React.FC<{
  classroom: ClassroomRef;
  selectedStudent: UserItem | null;
  onSelectStudent: (student: UserItem) => void;
  isOverviewOpen: boolean;
  onOpenOverview: () => void;
}> = ({ classroom, selectedStudent, onSelectStudent, isOverviewOpen, onOpenOverview }) => {
  const students = useMemo(
    () =>
      MOCK_USERS.filter(
        (u) =>
          u.role === 'Estudiante' &&
          u.level === classroom.level &&
          u.grade === classroom.grade &&
          u.section === classroom.section,
      ).sort((a, b) => a.name.localeCompare(b.name)),
    [classroom],
  );

  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [students, searchQuery],
  );

  return (
    <div className="space-y-2 border-t border-slate-100 p-2 dark:border-slate-800">
      <div className="relative w-full">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          type="text"
          placeholder="Buscar estudiante..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 rounded-lg pl-9 text-sm"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={onOpenOverview}
        className={cn(
          'h-11 w-full justify-start gap-2 rounded-lg px-3 text-left',
          isOverviewOpen
            ? 'bg-primary/10 text-primary hover:bg-primary/10'
            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50',
        )}
      >
        <LayoutGrid
          size={16}
          strokeWidth={2}
          className={cn('shrink-0', isOverviewOpen ? 'text-primary' : 'text-slate-400')}
        />
        <span className={cn('truncate text-sm', isOverviewOpen ? 'font-semibold' : 'font-medium')}>
          Vista General
        </span>
      </Button>

      <Separator className="my-1" />

      <div className="space-y-1">
        {filteredStudents.map((student) => {
          const isSelected = selectedStudent?.id === student.id && !isOverviewOpen;
          return (
            <Button
              key={student.id}
              type="button"
              variant="outline"
              onClick={() => onSelectStudent(student)}
              className={cn(
                'h-auto w-full justify-start gap-2 rounded-lg border p-2 text-left group',
                isSelected
                  ? 'bg-primary/10 border-primary hover:bg-primary/10'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/40',
              )}
            >
              <StudentAvatar className="h-9 w-9" />
              <span
                className={cn(
                  'truncate text-sm font-semibold leading-snug',
                  isSelected
                    ? 'text-primary'
                    : 'text-slate-800 dark:text-slate-100 group-hover:text-primary',
                )}
              >
                {student.name}
              </span>
            </Button>
          );
        })}

        {filteredStudents.length === 0 && (
          <p className="px-1 py-4 text-center text-sm text-slate-400 dark:text-slate-500">
            Ningún alumno coincide con la búsqueda.
          </p>
        )}
      </div>
    </div>
  );
};
