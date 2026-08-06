import React, { useMemo, useState } from 'react';
import { Check, CheckCheck, Clock, ClipboardCheck, Users, X, type LucideIcon } from 'lucide-react';

import {
  DialogShellActionButton,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { studentsInClassroom } from '@/data/users';
import { ATTENDANCE_STATUS_STYLES } from '@/features/classrooms/student-detail.attendance';
import type { AttendanceStatus } from '@/features/classrooms/types';
import { formatLongDate } from '@/lib/formatLongDate';
import { cn } from '@/lib/utils';
import type { ClassroomRef } from '@/types';

/** Estados que se pueden marcar al pasar lista. "Justificada" y "Sin registro" no aplican aquí: son estados posteriores. */
const TAKEABLE_STATUSES: AttendanceStatus[] = ['Presente', 'Tardanza', 'Falta'];

/** Letra e icono de cada estado — mismo código de letra que la Vista General de Aulas (`ATTENDANCE_CELL_META`). */
const STATUS_META: Record<AttendanceStatus, { letter: string; icon: LucideIcon }> = {
  Presente: { letter: 'P', icon: Check },
  Tardanza: { letter: 'T', icon: Clock },
  Falta: { letter: 'F', icon: X },
  Justificada: { letter: 'J', icon: Check },
  'Sin registro': { letter: '—', icon: X },
};

/**
 * Repite cada clase de fondo/texto con el prefijo `hover:` (o `dark:hover:`
 * cuando ya es de modo oscuro) para que el color del estado seleccionado no
 * lo tape el `hover:bg-accent` del botón base al pasar el ratón por encima.
 */
const lockHover = (classes: string): string =>
  classes
    .split(' ')
    .filter((c) => /^(dark:)?(bg|text)-/.test(c))
    .map((c) => (c.startsWith('dark:') ? `dark:hover:${c.slice(5)}` : `hover:${c}`))
    .join(' ');

/**
 * Hover del botón sin marcar: repite el mismo gris en `hover:` para tapar el
 * `hover:bg-accent`/`hover:text-accent-foreground` (azul con texto blanco)
 * del `outline` base — si no, el texto se vuelve blanco sobre un fondo casi
 * blanco y la letra desaparece al pasar el ratón.
 */
const UNSELECTED_HOVER =
  'hover:bg-slate-50 hover:text-slate-500 dark:hover:bg-slate-700/60 dark:hover:text-slate-400';

/**
 * Acción rápida de Inicio: pasar lista de un aula sin salir del panel.
 * Un solo formulario: elegir aula arriba y, en cuanto se elige, la lista de
 * alumnos aparece debajo en la misma pantalla (sin paso "Atrás"). Mismos 3
 * estados y mismos colores que el resto de Aulas (`ATTENDANCE_STATUS_STYLES`),
 * para no inventar una segunda paleta de asistencia.
 */
export const QuickAttendanceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  classrooms: ClassroomRef[];
  today: Date;
  onRegister: (classroom: ClassroomRef, statuses: Record<string, AttendanceStatus>) => void;
}> = ({ isOpen, onClose, classrooms, today, onRegister }) => {
  const [classroom, setClassroom] = useState<ClassroomRef | null>(null);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});

  const students = useMemo(() => (classroom ? studentsInClassroom(classroom) : []), [classroom]);
  const allMarked = students.length > 0 && students.every((s) => statuses[s.id] !== undefined);

  const reset = () => {
    setClassroom(null);
    setStatuses({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectClassroom = (c: ClassroomRef) => {
    setClassroom(c);
    // Sin marcar por defecto: el docente elige el estado de cada alumno, o
    // usa "Marcar todos presentes" si la mayoría vino a clase.
    setStatuses({});
  };

  const handleSubmit = () => {
    if (!classroom) return;
    onRegister(classroom, statuses);
    reset();
  };

  const handleMarkAllPresent = () => {
    const all: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      all[s.id] = 'Presente';
    });
    setStatuses(all);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogShellContent>
        <DialogShellHeader icon={ClipboardCheck} title="Asistencia" description={formatLongDate(today)} />

        <DialogShellBody flush>
          <DialogShellSection title="Aula" icon={ClipboardCheck} className="border-t-0">
            <Field id="attendance-classroom" label="Aula" required>
              <ClassroomSelect
                id="attendance-classroom"
                classrooms={classrooms}
                value={classroom}
                onChange={handleSelectClassroom}
              />
            </Field>
          </DialogShellSection>

          {classroom && (
            <DialogShellSection
              title={`${classroom.grade.replace(' Grado', '')} ${classroom.section} · ${students.length} alumnos`}
              icon={Users}
              action={
                students.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleMarkAllPresent}
                    className="h-10 gap-2 rounded-lg px-3 text-sm font-semibold"
                  >
                    <CheckCheck size={16} /> Marcar todos presentes
                  </Button>
                )
              }
            >
              <div className="space-y-2">
                {students.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="w-6 shrink-0 text-right text-sm font-semibold text-slate-400 dark:text-slate-500">
                        {index + 1}.
                      </span>
                      <StudentAvatar className="h-9 w-9" photoUrl={student.photoUrl} name={student.name} />
                      <span className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">
                        {student.name}
                      </span>
                    </span>
                    <div className="flex w-full shrink-0 gap-1.5 sm:w-auto sm:min-w-[180px]">
                      <TooltipProvider delayDuration={200}>
                        {TAKEABLE_STATUSES.map((status) => {
                          const isSelected = statuses[student.id] === status;
                          const { letter, icon: Icon } = STATUS_META[status];
                          return (
                            <Tooltip key={status}>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  aria-label={status}
                                  aria-pressed={isSelected}
                                  onClick={() => setStatuses((prev) => ({ ...prev, [student.id]: status }))}
                                  className={cn(
                                    'h-10 flex-1 gap-1.5 rounded-lg px-2 text-sm font-bold',
                                    isSelected
                                      ? cn(ATTENDANCE_STATUS_STYLES[status].cell, lockHover(ATTENDANCE_STATUS_STYLES[status].cell))
                                      : cn(
                                          'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
                                          UNSELECTED_HOVER,
                                        ),
                                  )}
                                >
                                  <Icon size={16} strokeWidth={2.5} />
                                  {letter}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{status}</TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </TooltipProvider>
                    </div>
                  </div>
                ))}

                {students.length === 0 && (
                  <p className="px-1 py-4 text-center text-base text-slate-500 dark:text-slate-400">
                    Esta aula no tiene alumnos matriculados.
                  </p>
                )}
              </div>
            </DialogShellSection>
          )}
        </DialogShellBody>

        <DialogShellFooter>
          <DialogShellCancelButton onClick={handleClose} />
          <DialogShellActionButton onClick={handleSubmit} disabled={!classroom || !allMarked}>
            <Check size={20} /> Registrar asistencia
          </DialogShellActionButton>
        </DialogShellFooter>
      </DialogShellContent>
    </Dialog>
  );
};
