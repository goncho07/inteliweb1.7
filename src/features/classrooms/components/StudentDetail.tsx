import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';

import { StudentAvatar } from '@/components/common/StudentAvatar';
import { ModuleBody, ModulePaneHeader } from '@/components/layout/ModuleShell';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AttendanceHeatmapCard } from '@/features/classrooms/components/student-detail/AttendanceHeatmapCard';
import { JustifyAbsenceModal } from '@/features/classrooms/components/student-detail/JustifyAbsenceModal';
import { MonthNavigator } from '@/features/classrooms/components/student-detail/MonthNavigator';
import { PersonalIncidentsCard } from '@/features/classrooms/components/student-detail/PersonalIncidentsCard';
import { clampToSchoolYear, getMonthLabel, stepMonth } from '@/features/classrooms/overview.period';
import {
  buildAttendanceMonth,
  buildPersonalIncidents,
} from '@/features/classrooms/student-detail.attendance';
import type { AttendanceCalendarDay } from '@/features/classrooms/types';
import { downloadStudentReport } from '@/features/classrooms/utils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { UserItem } from '@/types';

/**
 * Perfil de un estudiante: su asistencia del mes y el historial de incidencias
 * de ese mismo mes, las dos caras del mismo periodo.
 *
 * El mes se navega con un `cursor` (`Date`) sobre los ayudantes de
 * `overview.period` — los mismos que usa la Vista General del Aula—, así que
 * las flechas se detienen en marzo y diciembre en vez de dar la vuelta al año.
 */
export const StudentDetail: React.FC<{
  student: UserItem;
  /**
   * Vuelve a la lista de alumnos. Se omite en la vista del apoderado: entra
   * directo aquí, así que no hay ninguna lista a la que regresar y el botón
   * ni siquiera se dibuja (en vez de dibujarlo sin que haga nada).
   */
  onBack?: () => void;
  isParentView?: boolean;
  /** Todos los hijos del apoderado, para alternar entre ellos si tiene más de uno. Solo en la vista de apoderado. */
  allChildren?: UserItem[];
  onSelectChild?: (child: UserItem) => void;
}> = ({ student, onBack, isParentView, allChildren, onSelectChild }) => {
  const { toast } = useToast();

  const hasMultipleChildren = isParentView && (allChildren?.length ?? 0) > 1;

  const [cursor, setCursor] = useState<Date>(() => clampToSchoolYear(new Date()));
  const [justifiedDays, setJustifiedDays] = useState<Record<string, string>>({});

  const [dayToJustify, setDayToJustify] = useState<AttendanceCalendarDay | null>(null);
  const [justificationObservation, setJustificationObservation] = useState('');
  const [justificationFiles, setJustificationFiles] = useState<File[]>([]);

  const calendarData = useMemo(
    () => buildAttendanceMonth(student.name, cursor, justifiedDays),
    [student.name, cursor, justifiedDays],
  );

  const personalIncidents = useMemo(
    () =>
      buildPersonalIncidents(
        {
          id: student.id,
          name: student.name,
          level: student.level ?? '',
          grade: student.grade ?? '',
          section: student.section ?? '',
        },
        cursor,
      ),
    [student.id, student.name, student.level, student.grade, student.section, cursor],
  );

  const handleConfirmJustification = () => {
    if (!dayToJustify) return;
    const filesNote =
      justificationFiles.length > 0
        ? ` (Adjunto: ${justificationFiles.map((file) => file.name).join(', ')})`
        : '';
    const observation = (justificationObservation.trim() || 'Sin observación') + filesNote;
    setJustifiedDays((prev) => ({ ...prev, [dayToJustify.date]: observation }));
    setDayToJustify(null);
    setJustificationFiles([]);
    toast({
      title: 'Justificación registrada',
      description: `Se justificó la ${dayToJustify.originalStatus.toLowerCase()} del ${dayToJustify.dayNumber} de ${getMonthLabel(cursor)} de ${student.name}.`,
      variant: 'success',
    });
  };

  const handleDownload = (reportType: 'Asistencia' | 'Incidencias') => {
    downloadStudentReport({
      studentName: student.name,
      reportType,
      selectedReportMonth: cursor.getMonth(),
      calendarData,
      personalIncidents,
    });
    toast({
      title: 'Descarga iniciada',
      description: `Se descargó el reporte de ${reportType.toLowerCase()} de ${student.name} (${getMonthLabel(cursor)}).`,
      variant: 'success',
    });
  };

  return (
    <>
      <ModulePaneHeader>
        <div className="flex min-w-0 items-center gap-3">
          {onBack && !isParentView && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Volver a la lista de estudiantes"
                    onClick={onBack}
                    className="h-10 w-10 shrink-0 rounded-full"
                  >
                    <ArrowLeft size={20} strokeWidth={2} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Volver a la lista de estudiantes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* Icono gris por defecto (`StudentAvatar`), salvo que el centro haya
              subido una foto real desde la ficha del alumno en Usuarios. */}
          {hasMultipleChildren && allChildren ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Cambiar de hijo. Viendo a ${student.name}.`}
                  className="-mx-2 -my-1 flex min-w-0 items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-slate-800/60"
                >
                  <StudentAvatar
                    className="h-11 w-11 rounded-full"
                    photoUrl={student.photoUrl}
                    name={student.name}
                  />
                  <div className="min-w-0 text-left">
                    <p className="flex items-center gap-1 truncate text-lg font-bold text-slate-800 dark:text-white">
                      <span className="truncate">{student.name}</span>
                      <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-slate-400" />
                    </p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      {`${student.grade.replace('° Grado', '°')} ${student.section} • DNI ${student.dni}`}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              {/* `onOpenAutoFocus`: Radix enfoca el primer ítem al abrir, y ese
                  foco pinta el fondo sólido (`focus:bg-accent`) igual que un
                  hover real — como el hijo activo suele ser el primero de la
                  lista, el menú se abría mostrándolo como si el cursor
                  estuviera encima todo el tiempo. Se evita ese foco
                  automático; el ítem activo se marca solo con el tinte suave
                  + el check, sin necesidad de foco. */}
              <DropdownMenuContent
                align="start"
                className="w-72 rounded-xl"
                onOpenAutoFocus={(event) => event.preventDefault()}
              >
                {allChildren.map((child) => {
                  const isActive = child.id === student.id;
                  return (
                    <DropdownMenuItem
                      key={child.id}
                      onClick={() => onSelectChild?.(child)}
                      // Se anula el hover sólido por defecto del menú
                      // (`focus:bg-accent`, azul institucional a pantalla
                      // completa): con avatar + dos líneas de texto dentro,
                      // pintar todo el ítem de azul sólido tapaba el nombre.
                      // Un tinte suave es suficiente para marcar "encima" u
                      // "hijo actual" sin perder la lectura.
                      className={cn(
                        'h-auto cursor-pointer gap-3 rounded-lg py-2 focus:bg-slate-100 focus:text-inherit dark:focus:bg-slate-800/60',
                        isActive && 'bg-primary/10 focus:bg-primary/15',
                      )}
                    >
                      <StudentAvatar
                        className="h-9 w-9 shrink-0 rounded-full"
                        photoUrl={child.photoUrl}
                        name={child.name}
                      />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                          {child.name}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {`${child.grade.replace('° Grado', '°')} ${child.section}`}
                        </p>
                      </div>
                      {isActive && (
                        <Check size={18} strokeWidth={2.5} className="shrink-0 text-primary" aria-hidden />
                      )}
                      <span className="sr-only">{isActive ? '(hijo actual)' : ''}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <StudentAvatar
                className="h-11 w-11 rounded-full"
                photoUrl={student.photoUrl}
                name={student.name}
              />
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-slate-800 dark:text-white">{student.name}</p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {`${student.grade.replace('° Grado', '°')} ${student.section} • DNI ${student.dni}`}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Único selector de mes de la ficha: gobierna a la vez el calendario
            de Asistencia y el historial de Incidencias, así que vive aquí en
            vez de repetirse dentro de cada tarjeta. */}
        <MonthNavigator
          cursor={cursor}
          onStep={(direction) => setCursor((prev) => stepMonth(prev, direction))}
        />
      </ModulePaneHeader>

      {/* A sangre, como Usuarios y la Vista General del Aula: el calendario y
          el historial llegan a los bordes del panel, sin margen ni tarjeta
          flotante. Se separan por un borde: horizontal al apilarse, vertical
          cuando caben en dos columnas. */}
      <ModuleBody flush className="flex flex-col">
        {/* `min-h-full`: las dos secciones estiran hasta el fondo del panel
            aunque el contenido no dé para tanto. Si no, quedaba una franja
            gris muerta bajo las tarjetas en cuanto sobraba alto. */}
        {/* `minmax(0,1fr)` en las dos columnas, no `grid-cols-2`: con `1fr` a
            secas una columna con contenido ancho (el calendario) empuja a la
            otra y el borde divisorio deja de caer en la mitad exacta.
            El apoderado no tiene `ClassroomSidebar` a la izquierda —entra
            directo aquí—, así que su panel ya ocupa todo el ancho sobrante
            del riel de navegación: capar a 1700px dejaba un margen muerto a
            los lados que crecía según el riel estuviera compacto o expandido.
            El resto de vistas sí conserva el límite, como el resto de la app. */}
        <div
          className={cn(
            'mx-auto grid min-h-full w-full grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
            !isParentView && 'max-w-[1700px]',
          )}
        >
          <AttendanceHeatmapCard
            className="border-b border-slate-200 dark:border-slate-800/60 2xl:border-b-0 2xl:border-r"
            studentName={student.name}
            calendarData={calendarData}
            onDownloadAttendance={() => handleDownload('Asistencia')}
            onDayClick={(day) => {
              setDayToJustify(day);
              setJustificationObservation('');
              setJustificationFiles([]);
            }}
            canJustify={!isParentView}
          />

          <PersonalIncidentsCard
            className="border-b border-slate-200 dark:border-slate-800/60"
            incidents={personalIncidents}
            onDownloadIncidents={() => handleDownload('Incidencias')}
          />
        </div>

        <JustifyAbsenceModal
          isOpen={dayToJustify !== null}
          onClose={() => setDayToJustify(null)}
          dayToJustify={dayToJustify}
          studentName={student.name}
          justificationObservation={justificationObservation}
          setJustificationObservation={setJustificationObservation}
          justificationFiles={justificationFiles}
          setJustificationFiles={setJustificationFiles}
          onConfirm={handleConfirmJustification}
        />
      </ModuleBody>
    </>
  );
};
