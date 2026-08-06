import React, { useMemo, useState } from 'react';
import { AlertTriangle, ChevronRight, Search, Users } from 'lucide-react';

import {
  DialogShellBody,
  DialogShellCancelButton,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
  DialogShellSection,
} from '@/components/common/DialogShell';
import { ClassroomSelect } from '@/components/common/ClassroomSelect';
import { Field } from '@/components/common/FormField';
import { StudentAvatar } from '@/components/common/StudentAvatar';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { studentsInClassroom } from '@/data/users';
import { cn } from '@/lib/utils';
import type { ClassroomRef, UserItem } from '@/types';

/**
 * Acción rápida de Inicio: a quién reportarle una incidencia. Un solo
 * formulario: elegir aula arriba, buscar y elegir alumno debajo, todo en la
 * misma pantalla. Al elegir el alumno se cierra este picker y
 * `DashboardModule` abre el mismo `RegisterIncidentModal` que usa la ficha
 * del alumno en Aulas — el registro de incidencias sigue viviendo en un solo
 * componente.
 */
export const QuickIncidentPickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  classrooms: ClassroomRef[];
  onPickStudent: (student: UserItem) => void;
}> = ({ isOpen, onClose, classrooms, onPickStudent }) => {
  const [classroom, setClassroom] = useState<ClassroomRef | null>(null);
  const [search, setSearch] = useState('');

  const students = useMemo(() => (classroom ? studentsInClassroom(classroom) : []), [classroom]);
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((s) => s.name.toLowerCase().includes(query));
  }, [students, search]);

  const reset = () => {
    setClassroom(null);
    setSearch('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectClassroom = (c: ClassroomRef) => {
    setClassroom(c);
    setSearch('');
  };

  const handlePick = (student: UserItem) => {
    reset();
    onPickStudent(student);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogShellContent>
        <DialogShellHeader icon={AlertTriangle} tone="destructive" title="Incidencias" description="Reportar la conducta de un alumno" />

        <DialogShellBody flush>
          <DialogShellSection title="Aula" icon={AlertTriangle} className="border-t-0">
            <Field id="incident-classroom" label="Aula" required>
              <ClassroomSelect
                id="incident-classroom"
                classrooms={classrooms}
                value={classroom}
                onChange={handleSelectClassroom}
              />
            </Field>
          </DialogShellSection>

          <DialogShellSection title="Alumno" icon={Users}>
            <div className="relative w-full">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={classroom ? 'Buscar alumno por nombre…' : 'Elige un aula primero'}
                disabled={!classroom}
                className="h-11 rounded-xl pl-9 text-base disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              {!classroom ? (
                <p className="px-1 py-4 text-center text-base text-slate-500 dark:text-slate-400">
                  Elige un aula para ver su lista de alumnos.
                </p>
              ) : filteredStudents.length === 0 ? (
                <p className="px-1 py-4 text-center text-base text-slate-500 dark:text-slate-400">
                  Ningún alumno coincide con la búsqueda.
                </p>
              ) : (
                filteredStudents.map((student) => (
                  <Button
                    key={student.id}
                    type="button"
                    variant="outline"
                    onClick={() => handlePick(student)}
                    className={cn(
                      'group h-auto w-full justify-between gap-3 rounded-xl border border-slate-100 bg-white p-2 text-left hover:border-primary/40 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60',
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <StudentAvatar className="h-10 w-10" photoUrl={student.photoUrl} name={student.name} />
                      <span className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">
                        {student.name}
                      </span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-slate-400" />
                  </Button>
                ))
              )}
            </div>
          </DialogShellSection>
        </DialogShellBody>

        <DialogShellFooter className="justify-end">
          <DialogShellCancelButton onClick={handleClose} />
        </DialogShellFooter>
      </DialogShellContent>
    </Dialog>
  );
};
