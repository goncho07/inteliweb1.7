import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { StudentAvatar } from '@/components/common/StudentAvatar';
import { ModuleBody, ModulePaneHeader } from '@/components/layout/ModuleShell';
import { Button } from '@/components/ui/button';
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
import { UserItem } from '@/types';

/** Incidencias por página del historial: tres caben sin obligar a hacer scroll dentro de la tarjeta. */
const INCIDENTS_PER_PAGE = 3;

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
}> = ({ student, onBack, isParentView }) => {
  const { toast } = useToast();

  const [cursor, setCursor] = useState<Date>(() => clampToSchoolYear(new Date()));
  const [justifiedDays, setJustifiedDays] = useState<Record<string, string>>({});
  const [incidentsPage, setIncidentsPage] = useState(1);

  const [dayToJustify, setDayToJustify] = useState<AttendanceCalendarDay | null>(null);
  const [justificationObservation, setJustificationObservation] = useState('');
  const [justificationFiles, setJustificationFiles] = useState<File[]>([]);

  const calendarData = useMemo(
    () => buildAttendanceMonth(student.name, cursor, justifiedDays),
    [student.name, cursor, justifiedDays],
  );

  const personalIncidents = useMemo(
    () => buildPersonalIncidents(student.name, cursor, calendarData),
    [student.name, cursor, calendarData],
  );

  const totalIncidentPages = Math.max(1, Math.ceil(personalIncidents.length / INCIDENTS_PER_PAGE));

  // Al cambiar de mes se vuelve a la primera página. Se ajusta durante el
  // render (patrón recomendado por React) en lugar de con un efecto, que
  // provocaría un render intermedio con la página anterior.
  const [prevCursor, setPrevCursor] = useState(cursor);
  if (prevCursor !== cursor) {
    setPrevCursor(cursor);
    setIncidentsPage(1);
  }

  const paginatedIncidents = useMemo(() => {
    const start = (incidentsPage - 1) * INCIDENTS_PER_PAGE;
    return personalIncidents.slice(start, start + INCIDENTS_PER_PAGE);
  }, [personalIncidents, incidentsPage]);

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
        </div>

        {/* Único selector de mes de la ficha: gobierna a la vez el calendario
            de Asistencia y el historial de Incidencias, así que vive aquí en
            vez de repetirse dentro de cada tarjeta. */}
        <MonthNavigator
          cursor={cursor}
          onStep={(direction) => setCursor((prev) => stepMonth(prev, direction))}
          onJump={(month) => setCursor(clampToSchoolYear(month))}
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
            otra y el borde divisorio deja de caer en la mitad exacta. */}
        <div className="mx-auto grid min-h-full w-full max-w-[1700px] grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <AttendanceHeatmapCard
            className="border-b border-slate-200 dark:border-slate-800/60 2xl:border-b-0 2xl:border-r"
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
            paginatedIncidents={paginatedIncidents}
            hasIncidents={personalIncidents.length > 0}
            incidentsPage={incidentsPage}
            totalIncidentPages={totalIncidentPages}
            onPrevPage={() => setIncidentsPage((page) => Math.max(1, page - 1))}
            onNextPage={() => setIncidentsPage((page) => Math.min(totalIncidentPages, page + 1))}
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
