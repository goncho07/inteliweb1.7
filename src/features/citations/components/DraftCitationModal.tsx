import React, { useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, Check, ClipboardList, FilePlus2, FileText, Search, Users } from 'lucide-react';

import { CustomCalendar } from '@/components/calendar/CustomCalendar';
import { CustomTimePicker } from '@/components/calendar/CustomTimePicker';
import { ClassroomSelect } from '@/components/common/ClassroomSelect';
import {
  DialogShellActionButton,
  DialogShellBody,
  DialogShellCancelButton,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
  DialogShellSection,
} from '@/components/common/DialogShell';
import { EmptyState } from '@/components/common/EmptyState';
import { Field } from '@/components/common/FormField';
import { StudentAvatar } from '@/components/common/StudentAvatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { buildAttendanceMonth, buildPersonalIncidents } from '@/features/classrooms/student-detail.attendance';
import { cn } from '@/lib/utils';
import type { ClassroomRef, UserItem } from '@/types';

import { CATEGORY_ICONS } from '../citations.constants';
import type { CitationCategory, CitationIncident } from '../types';

/**
 * Los 3 motivos que se ofrecen al redactar una citación desde cero. "Gestión"
 * queda fuera: es un motivo administrativo (matrícula, documentación) que no
 * nace de una situación del alumno, así que no encaja aquí — solo se usa hoy
 * al editar una citación existente.
 */
const REASON_CARDS: { value: CitationCategory; label: string }[] = [
  { value: 'Incidencias', label: 'Incidencias' },
  { value: 'Académico', label: 'Rendimiento Académico' },
  { value: 'Otros', label: 'Otros' },
];

/**
 * Incidencias de conducta recientes del alumno (últimos 3 meses), para
 * elegir cuáles motivan la citación en vez de escribir el motivo a mano.
 * Reutiliza `buildPersonalIncidents` — la misma fuente que ya usa su ficha en
 * Aulas — y descarta las entradas de asistencia (faltas/tardanzas): esas no
 * son "una incidencia" que un docente marque para citar por este motivo.
 */
const recentStudentIncidents = (studentName: string): CitationIncident[] => {
  const today = new Date();
  const entries = [0, 1, 2].flatMap((monthsAgo) => {
    const cursor = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
    const days = buildAttendanceMonth(studentName, cursor, {});
    return buildPersonalIncidents(studentName, cursor, days).filter((entry) => entry.id.startsWith('inc-'));
  });
  return entries
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)
    .map((entry) => ({ type: entry.label, date: entry.dateLabel }));
};

/** Datos ya validados que entrega el formulario al confirmar. */
export interface DraftCitationResult {
  student: UserItem;
  guardian: UserItem;
  reason: string;
  category: CitationCategory;
  description: string;
  /** Solo cuando `category` es "Incidencias": las que el docente marcó para citar. */
  incidents?: CitationIncident[];
  /** 'DD/MM/YYYY', mismo formato que el resto de citaciones. */
  date: string;
  /** 'hh:mm AM/PM', mismo formato que el resto de citaciones. */
  time: string;
}

/** `CustomCalendar` entrega 'YYYY-MM-DD' (como un `<input type="date">`); las citaciones lo guardan como 'DD/MM/YYYY'. */
const toDisplayDate = (iso: string): string => {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
};

/** El input de hora entrega 24h ('HH:MM'); las citaciones lo guardan en 12h con AM/PM. */
const toDisplayTime = (value: string): string => {
  const [hourStr, minuteStr] = value.split(':');
  const hour24 = Number(hourStr);
  const meridiem = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${minuteStr} ${meridiem}`;
};

/**
 * '987654321' (como lo guarda `data/users.ts`) → '+51 987 654 321' (como lo
 * esperan las citaciones). Exportado: `CitationsModule` la reutiliza al
 * armar la citación final, en vez de repetir el formato.
 */
export const formatGuardianPhone = (phone?: string): string =>
  phone && phone.length === 9 ? `+51 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}` : (phone ?? '—');

/** No hay campo de parentesco en `UserItem`; se deriva del género, igual que en la ficha de Usuarios. */
export const guardianRelationship = (guardian: UserItem): string => (guardian.gender === 'M' ? 'Padre' : 'Madre');

/** '3° Grado' + 'A' → '3° A', el formato corto que usan las citaciones (mismo criterio que `gradesForLevel`). */
export const formatStudentGrade = (student: Pick<UserItem, 'grade' | 'section'>): string =>
  `${(student.grade ?? '').replace(' Grado', '')} ${student.section ?? ''}`.trim();

/**
 * Formulario de una sola pantalla para crear una citación desde cero: aula →
 * alumno → apoderado → motivo → fecha y hora, todo visible a la vez y con
 * scroll en el cuerpo (sin pasos ni indicador de avance). El estado del
 * formulario vive aquí dentro (no en `CitationsModule`, que ya tiene
 * bastante) y solo sale al exterior cuando el docente confirma, ya validado.
 */
export const DraftCitationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  /** Alumnos que esta sesión puede citar (`visibleStudents(session)`). */
  students: UserItem[];
  /** Padrón completo, para resolver los apoderados del alumno elegido. */
  allUsers: UserItem[];
  onConfirm: (result: DraftCitationResult) => void;
}> = ({ isOpen, onClose, students, allUsers, onConfirm }) => {
  // Aula obligatoria antes de ver la lista de alumnos: mismas aulas que ve
  // esta sesión, en vez de un buscador con más de mil alumnos de todo el
  // colegio.
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomRef | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedGuardianId, setSelectedGuardianId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState<CitationCategory | null>(null);
  const [description, setDescription] = useState('');
  const [selectedIncidentTypes, setSelectedIncidentTypes] = useState<Set<string>>(new Set());
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId],
  );

  // Solo tiene sentido cuando el motivo es "Incidencias": las incidencias de
  // conducta recientes del alumno elegido, para marcar cuáles motivan la cita.
  const incidentOptions = useMemo(
    () => (selectedStudent ? recentStudentIncidents(selectedStudent.name) : []),
    [selectedStudent],
  );

  const guardians = useMemo(
    () =>
      (selectedStudent?.guardianIds ?? [])
        .map((id) => allUsers.find((u) => u.id === id))
        .filter((u): u is UserItem => !!u),
    [selectedStudent, allUsers],
  );

  const selectedGuardian = useMemo(
    () => guardians.find((g) => g.id === selectedGuardianId) ?? guardians[0] ?? null,
    [guardians, selectedGuardianId],
  );

  // Aulas derivadas de `students` (ya acotado a lo que ve esta sesión): un
  // docente solo ve sus propias aulas, no la estructura educativa completa.
  const classrooms = useMemo(() => {
    const byKey = new Map<string, ClassroomRef>();
    students.forEach((s) => {
      if (!s.level || !s.grade || !s.section) return;
      const key = `${s.level}-${s.grade}-${s.section}`;
      if (!byKey.has(key)) byKey.set(key, { level: s.level, grade: s.grade, section: s.section });
    });
    return Array.from(byKey.values()).sort(
      (a, b) => a.level.localeCompare(b.level) || a.grade.localeCompare(b.grade) || a.section.localeCompare(b.section),
    );
  }, [students]);

  const classroomStudents = useMemo(() => {
    if (!selectedClassroom) return [];
    return students.filter(
      (s) =>
        s.level === selectedClassroom.level && s.grade === selectedClassroom.grade && s.section === selectedClassroom.section,
    );
  }, [students, selectedClassroom]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return classroomStudents;
    return classroomStudents.filter((s) => s.name.toLowerCase().includes(query));
  }, [classroomStudents, studentSearch]);

  const reset = () => {
    setSelectedClassroom(null);
    setStudentSearch('');
    setSelectedStudentId(null);
    setSelectedGuardianId(null);
    setReason('');
    setCategory(null);
    setDescription('');
    setSelectedIncidentTypes(new Set());
    setDate('');
    setTime('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectClassroom = (classroom: ClassroomRef) => {
    setSelectedClassroom(classroom);
    setStudentSearch('');
    setSelectedStudentId(null);
    setSelectedGuardianId(null);
  };

  const handleSelectStudent = (student: UserItem) => {
    setSelectedStudentId(student.id);
    setSelectedGuardianId(null);
  };

  const incidentKey = (incident: CitationIncident): string => `${incident.type}||${incident.date}`;
  const toggleIncident = (incident: CitationIncident) => {
    setSelectedIncidentTypes((prev) => {
      const next = new Set(prev);
      const key = incidentKey(incident);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const allIncidentsSelected = incidentOptions.length > 0 && incidentOptions.every((i) => selectedIncidentTypes.has(incidentKey(i)));
  const toggleAllIncidents = () => {
    setSelectedIncidentTypes(allIncidentsSelected ? new Set() : new Set(incidentOptions.map(incidentKey)));
  };

  const isValid =
    !!selectedStudent &&
    !!selectedGuardian &&
    !!category &&
    (category === 'Incidencias' ? selectedIncidentTypes.size > 0 : reason.trim().length > 0) &&
    !!date &&
    !!time;

  const handleSubmit = () => {
    if (!selectedStudent || !selectedGuardian || !date || !time || !category) return;

    const chosenIncidents =
      category === 'Incidencias'
        ? incidentOptions.filter((i) => selectedIncidentTypes.has(incidentKey(i)))
        : undefined;

    onConfirm({
      student: selectedStudent,
      guardian: selectedGuardian,
      reason: category === 'Incidencias' ? chosenIncidents!.map((i) => i.type).join('; ') : reason.trim(),
      category,
      description: category === 'Incidencias' ? '' : description.trim(),
      incidents: chosenIncidents,
      date: toDisplayDate(date),
      time: toDisplayTime(time),
    });
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogShellContent>
        <DialogShellHeader
          icon={FilePlus2}
          title="Redactar citación"
          description="Alumno, motivo y fecha de la reunión con el apoderado"
        />

        <DialogShellBody flush>
          <DialogShellSection title="Aula" icon={Search} className="border-t-0">
            <Field id="draft-classroom" label="Aula" required>
              <ClassroomSelect
                id="draft-classroom"
                classrooms={classrooms}
                value={selectedClassroom}
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
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder={selectedClassroom ? 'Buscar alumno por nombre…' : 'Elige un aula primero'}
                disabled={!selectedClassroom}
                className="h-11 rounded-xl pl-9 text-base disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="hidden-scrollbar max-h-[220px] space-y-1 overflow-y-auto">
              {!selectedClassroom ? (
                <p className="px-1 py-4 text-center text-base text-slate-500 dark:text-slate-400">
                  Elige un aula para ver su lista de alumnos.
                </p>
              ) : filteredStudents.length === 0 ? (
                <p className="px-1 py-4 text-center text-base text-slate-500 dark:text-slate-400">
                  Ningún alumno coincide con la búsqueda.
                </p>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = student.id === selectedStudentId;
                  const hasGuardian = (student.guardianIds?.length ?? 0) > 0;
                  return (
                    <Button
                      key={student.id}
                      type="button"
                      variant="outline"
                      onClick={() => handleSelectStudent(student)}
                      className={cn(
                        'group h-auto w-full justify-start gap-3 rounded-xl border p-2 text-left',
                        isSelected
                          ? 'border-primary bg-primary/10 hover:bg-primary/10'
                          : 'border-slate-100 bg-white hover:border-primary/40 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60',
                      )}
                    >
                      <StudentAvatar className="h-10 w-10" photoUrl={student.photoUrl} name={student.name} />
                      <span className="flex min-w-0 flex-col">
                        <span
                          className={cn(
                            'truncate text-base font-semibold leading-snug',
                            isSelected ? 'text-primary' : 'text-slate-800 dark:text-slate-100',
                          )}
                        >
                          {student.name}
                        </span>
                        <span className="truncate text-sm text-slate-500 dark:text-slate-400">
                          {student.level} · {formatStudentGrade(student)}
                          {!hasGuardian && ' · Sin apoderado registrado'}
                        </span>
                      </span>
                    </Button>
                  );
                })
              )}
            </div>
          </DialogShellSection>

          {selectedStudent && (
            <DialogShellSection title="Apoderado a citar" icon={Users}>
              {guardians.length === 0 ? (
                <p className="text-base text-slate-500 dark:text-slate-400">
                  {selectedStudent.name} no tiene un apoderado registrado en Usuarios. Vincula uno antes de
                  citarlo.
                </p>
              ) : (
                <div className="space-y-2">
                  {guardians.map((guardian) => {
                    const isSelected = guardian.id === (selectedGuardianId ?? guardians[0]?.id);
                    return (
                      <Button
                        key={guardian.id}
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedGuardianId(guardian.id)}
                        className={cn(
                          'h-auto w-full justify-start gap-1 rounded-xl border p-3 text-left',
                          isSelected
                            ? 'border-primary bg-primary/10 hover:bg-primary/10'
                            : 'border-slate-100 bg-white hover:border-primary/40 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60',
                        )}
                      >
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span
                            className={cn(
                              'truncate text-base font-semibold',
                              isSelected ? 'text-primary' : 'text-slate-800 dark:text-slate-100',
                            )}
                          >
                            {guardian.name}
                          </span>
                          <span className="truncate text-sm text-slate-500 dark:text-slate-400">
                            {guardianRelationship(guardian)} · {formatGuardianPhone(guardian.phone)}
                          </span>
                        </span>
                        {isSelected && <Check size={20} className="shrink-0 text-primary" strokeWidth={2.5} />}
                      </Button>
                    );
                  })}
                </div>
              )}
            </DialogShellSection>
          )}

          <DialogShellSection title="Motivo de la citación" icon={ClipboardList}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {REASON_CARDS.map(({ value, label }) => {
                const Icon = CATEGORY_ICONS[value];
                const isSelected = category === value;
                return (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCategory(value);
                      if (value !== 'Incidencias') setSelectedIncidentTypes(new Set());
                    }}
                    className={cn(
                      'h-auto flex-col gap-2 rounded-xl border p-4 text-center',
                      isSelected
                        ? 'border-primary bg-primary/10 hover:bg-primary/10'
                        : 'border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60',
                    )}
                  >
                    <Icon size={24} className={isSelected ? 'text-primary' : 'text-slate-500 dark:text-slate-400'} strokeWidth={2} />
                    <span className={cn('text-sm font-bold', isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-200')}>
                      {label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </DialogShellSection>

          {category === 'Incidencias' && (
            <DialogShellSection
              title="Selecciona las incidencias a citar"
              icon={AlertTriangle}
              action={
                incidentOptions.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={toggleAllIncidents}
                    className="h-auto rounded-lg px-2 py-1 text-sm font-bold text-primary hover:bg-primary/10"
                  >
                    {allIncidentsSelected ? 'Quitar selección' : 'Seleccionar todo'}
                  </Button>
                )
              }
            >
              {incidentOptions.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="Sin incidencias recientes"
                  description={`${selectedStudent?.name ?? 'El alumno'} no tiene incidencias de conducta registradas en los últimos 3 meses.`}
                />
              ) : (
                <div className="hidden-scrollbar max-h-[260px] space-y-2 overflow-y-auto">
                  {incidentOptions.map((incident) => {
                    const key = incidentKey(incident);
                    const isChecked = selectedIncidentTypes.has(key);
                    return (
                      <label
                        key={key}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-xl border p-3',
                          isChecked
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-100 bg-white hover:border-primary/40 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60',
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleIncident(incident)}
                          className="mt-1"
                          aria-label={`Citar por: ${incident.type}`}
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="text-base font-semibold text-slate-800 dark:text-slate-100">
                            {incident.type}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">{incident.date}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </DialogShellSection>
          )}

          {(category === 'Académico' || category === 'Otros') && (
            <>
              <DialogShellSection title="Motivo" icon={FileText}>
                <Field id="draft-reason" label="Motivo" required>
                  <Input
                    id="draft-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ej: Bajo rendimiento en Matemáticas"
                    className="h-11 rounded-xl text-base"
                  />
                </Field>
              </DialogShellSection>

              <DialogShellSection title="Detalle" icon={FileText}>
                <Field id="draft-description" label="Descripción" hint="Opcional. Lo verá el apoderado.">
                  <Textarea
                    id="draft-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalle de la citación…"
                    className="min-h-[120px] resize-none rounded-xl text-base"
                  />
                </Field>
              </DialogShellSection>
            </>
          )}

          <DialogShellSection title="Fecha y hora de la reunión" icon={CalendarDays}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="draft-date" label="Fecha" required>
                <CustomCalendar mode="date" value={date} onChange={setDate} placeholder="Seleccionar fecha" />
              </Field>

              <Field id="draft-time" label="Hora" required>
                <CustomTimePicker value={time} onChange={setTime} placeholder="Seleccionar hora" />
              </Field>
            </div>
          </DialogShellSection>
        </DialogShellBody>

        <DialogShellFooter>
          <DialogShellCancelButton onClick={handleClose} />
          <DialogShellActionButton onClick={handleSubmit} disabled={!isValid}>
            <Check size={20} /> Crear citación
          </DialogShellActionButton>
        </DialogShellFooter>
      </DialogShellContent>
    </Dialog>
  );
};
