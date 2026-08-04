import React, { useState, useMemo } from 'react';
import { AlertTriangle, ArrowLeft, Clock } from 'lucide-react';

import { ModuleBody, ModulePaneHeader } from '@/components/layout/ModuleShell';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AttendanceHeatmapCard } from '@/features/classrooms/components/student-detail/AttendanceHeatmapCard';
import { AttendanceNotificationsModal } from '@/features/classrooms/components/student-detail/AttendanceNotificationsModal';
import { JustifyAbsenceModal } from '@/features/classrooms/components/student-detail/JustifyAbsenceModal';
import { PersonalIncidentsCard } from '@/features/classrooms/components/student-detail/PersonalIncidentsCard';
import { RegisterIncidentModal } from '@/features/classrooms/components/student-detail/RegisterIncidentModal';
import { downloadStudentReport } from '@/features/classrooms/utils';
import { INCIDENT_TYPES } from '@/data/education';
import { cn } from '@/lib/utils';
import { UserItem } from '@/types';

export const StudentDetail: React.FC<{
  student: UserItem;
  onBack: () => void;
  isParentView?: boolean;
}> = ({ student, onBack, isParentView }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() >= 2 && new Date().getMonth() <= 11
      ? new Date().getMonth()
      : 2,
  );
  const [justifiedDays, setJustifiedDays] = useState<Record<string, string>>(
    {},
  );
  const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);
  const [
    isAttendanceNotificationsModalOpen,
    setIsAttendanceNotificationsModalOpen,
  ] = useState(false);
  const [activeAttendanceTab, setActiveAttendanceTab] = useState<
    "asistencia" | "salidas"
  >("asistencia");
  const [dayToJustify, setDayToJustify] = useState<any>(null);
  const [justificationObservation, setJustificationObservation] = useState("");

  const [isRegisterIncidentModalOpen, setIsRegisterIncidentModalOpen] =
    useState(false);
  const [incidentForm, setIncidentForm] = useState({
    type: "",
    description: "",
    teacher: "Carlos Mendoza del curso de DPCC",
  });

  const calendarData = useMemo(() => {
    const year = new Date().getFullYear();
    const data = [];
    const firstDay = new Date(year, selectedMonth, 1);
    const lastDay = new Date(year, selectedMonth + 1, 0);

    let startOffset = firstDay.getDay() - 1;
    if (startOffset === -1) startOffset = 6; // Sunday

    for (let i = 0; i < startOffset; i++) {
      data.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const current = new Date(year, selectedMonth, d);
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;

      let status = "Sin registro";
      let color = "bg-slate-100 dark:bg-slate-800 text-slate-400";

      if (!isWeekend) {
        const hash =
          current.getDate() + student.name.charCodeAt(0) + selectedMonth;
        status = "Presente";
        color =
          "bg-emerald-100 text-emerald-700 border-2 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 shadow-sm";
        if (hash % 10 === 0) {
          status = "Falta";
          color = "bg-rose-100 text-rose-700 border-2 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400 shadow-sm";
        } else if (hash % 7 === 0) {
          status = "Tardanza";
          color = "bg-amber-100 text-amber-700 border-2 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400 shadow-sm";
        }

        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
        if (justifiedDays[dateStr]) {
          status = `${status} (Justificada)`;
          color = "bg-blue-100 text-blue-700 border-2 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 shadow-sm";
        }
      }

      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
      data.push({
        date: dateStr,
        dayNumber: d,
        isWeekend,
        status,
        color,
        originalStatus: status.split(" ")[0],
      });
    }
    return data;
  }, [student.name, selectedMonth, justifiedDays]);

  const [incidentsPage, setIncidentsPage] = useState(1);

  // Estados para el reporte del estudiante
  const [reportType, setReportType] = useState<
    "Asistencia" | "Incidencias" | "Completo"
  >("Completo");
  const [selectedReportMonth, setSelectedReportMonth] = useState<number>(
    new Date().getMonth() >= 2 && new Date().getMonth() <= 11
      ? new Date().getMonth()
      : 2,
  );

  // Al cambiar de mes se vuelve a la primera página. Se ajusta durante el
  // render (patrón recomendado por React) en lugar de con un efecto, que
  // provocaría un render intermedio con la página anterior.
  const [prevSelectedMonth, setPrevSelectedMonth] = useState(selectedMonth);
  if (prevSelectedMonth !== selectedMonth) {
    setPrevSelectedMonth(selectedMonth);
    setIncidentsPage(1);
  }

  // Mock data for personal incidents combined with attendance
  const personalIncidents = useMemo(() => {
    const year = new Date().getFullYear();
    const monthAttendance = [];

    // Generate attendance for the selected month to show in incidents list
    const lastDay = new Date(year, selectedMonth + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      const current = new Date(year, selectedMonth, d);
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      if (!isWeekend) {
        const hash = d + student.name.charCodeAt(0) + selectedMonth;
        let status = "Presente";
        if (hash % 10 === 0) {
          status = "Falta";
        } else if (hash % 7 === 0) {
          status = "Tardanza";
        }

        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
        const isJustified = justifiedDays[dateStr] !== undefined;

        monthAttendance.push({
          date: dateStr,
          originalStatus: status,
          isJustified,
          justification: justifiedDays[dateStr],
        });
      }
    }

    const attendanceIncidents = monthAttendance
      .filter((d) => d.originalStatus === "Falta" || d.originalStatus === "Tardanza")
      .map((d) => {
        const isFalta = d.originalStatus === "Falta";
        const entryId = `att-in-${d.date}`;

        return {
          id: entryId,
          date: d.date,
          time: isFalta ? "08:00 AM" : "08:15 AM",
          teacher: null,
          originalStatus: d.originalStatus,
          type: {
            id: isFalta ? "falta" : "tardanza",
            label: isFalta ? "Inasistencia" : "Tardanza",
            category: isFalta ? "Grave" : "Leve",
            icon: isFalta ? AlertTriangle : Clock,
            color: d.isJustified
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : isFalta
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-amber-50 text-amber-700 border-amber-200",
          },
          description: d.isJustified
            ? `Justificada: ${d.justification || "Sin observación"}`
            : `Registro de ${d.originalStatus.toLowerCase()} en el sistema de asistencia.`,
        };
      });

    const mockIncidents = [
      {
        id: "inc-1",
        date: `${year}-${String(selectedMonth + 1).padStart(2, "0")}-15`,
        time: "10:30 AM",
        teacher: "Prof. María Gómez",
        type: INCIDENT_TYPES[0],
        description: "Discusión en el recreo",
      },
      {
        id: "inc-2",
        date: `${year}-${String(selectedMonth + 1).padStart(2, "0")}-05`,
        time: "08:15 AM",
        teacher: "Prof. Carlos Ruiz",
        type: INCIDENT_TYPES[4],
        description: "No presentó la tarea de matemáticas",
      },
      {
        id: "inc-3",
        date: `${year}-${String(selectedMonth + 1).padStart(2, "0")}-10`,
        time: "12:00 PM",
        teacher: "Prof. Juan Vargas",
        type: INCIDENT_TYPES[1],
        description: "Uso indebido de celular en clase",
      }
    ];

    return [...mockIncidents, ...attendanceIncidents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [student.name, selectedMonth, justifiedDays]);

  const paginatedIncidents = useMemo(() => {
    const startIndex = (incidentsPage - 1) * 3;
    return personalIncidents.slice(startIndex, startIndex + 3);
  }, [personalIncidents, incidentsPage]);

  const totalIncidentPages = Math.ceil(personalIncidents.length / 3);

  const handleOpenJustifyModal = (record: any) => {
    if (
      record.originalStatus === "Falta" ||
      record.originalStatus === "Tardanza"
    ) {
      setDayToJustify(record);
      setJustificationObservation("");
      setIsJustifyModalOpen(true);
    }
  };

  const handleConfirmJustification = () => {
    if (!dayToJustify) return;
    setJustifiedDays((prev) => ({
      ...prev,
      [dayToJustify.date]: justificationObservation || "Sin observación",
    }));
    setIsJustifyModalOpen(false);
    setDayToJustify(null);
  };

  const handleDownloadPersonalReport = () => {
    downloadStudentReport({
      studentName: student.name,
      reportType,
      selectedReportMonth,
      calendarData,
      personalIncidents,
    });
  };

  const faltasCount = calendarData.filter(
    (d) => d?.originalStatus === "Falta",
  ).length;
  const tardanzasCount = calendarData.filter(
    (d) => d?.originalStatus === "Tardanza",
  ).length;

  return (
    <>
      <ModulePaneHeader>
        <div className="flex min-w-0 items-center gap-3">
          {!isParentView && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Volver a la lista de estudiantes"
                    onClick={onBack}
                    className="h-10 w-10 shrink-0 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <ArrowLeft size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Volver</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-sm',
              student.avatarColor,
            )}
          >
            {student.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-800 dark:text-white">{student.name}</p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {`${student.grade} ${student.section} • DNI: ${student.dni}`}
            </p>
          </div>
        </div>
      </ModulePaneHeader>

      <ModuleBody centered>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Attendance Heatmap Card */}
          <AttendanceHeatmapCard
            selectedMonth={selectedMonth}
            onPrevMonth={() =>
              setSelectedMonth((prev) => (prev > 2 ? prev - 1 : 11))
            }
            onNextMonth={() =>
              setSelectedMonth((prev) => (prev < 11 ? prev + 1 : 2))
            }
            calendarData={calendarData}
            onOpenNotifications={() =>
              setIsAttendanceNotificationsModalOpen(true)
            }
            onDownloadAttendance={() => {
              setReportType("Asistencia");
              setSelectedReportMonth(selectedMonth);
              setTimeout(handleDownloadPersonalReport, 0);
            }}
            onDayClick={handleOpenJustifyModal}
            canJustify={!isParentView}
          />

          {/* Incidents Card */}
          <PersonalIncidentsCard
            paginatedIncidents={paginatedIncidents}
            hasIncidents={personalIncidents.length > 0}
            incidentsPage={incidentsPage}
            totalIncidentPages={totalIncidentPages}
            onPrevPage={() =>
              setIncidentsPage((p) => Math.max(1, p - 1))
            }
            onNextPage={() =>
              setIncidentsPage((p) =>
                Math.min(totalIncidentPages, p + 1),
              )
            }
            faltasCount={faltasCount}
            tardanzasCount={tardanzasCount}
            onDownloadIncidents={() => {
              setReportType("Incidencias");
              setSelectedReportMonth(selectedMonth);
              setTimeout(handleDownloadPersonalReport, 0);
            }}
          />
        </div>

        {/* MODAL DE JUSTIFICACIÓN */}
        <JustifyAbsenceModal
          isOpen={isJustifyModalOpen}
          onClose={() => setIsJustifyModalOpen(false)}
          dayToJustify={dayToJustify}
          studentName={student.name}
          justificationObservation={justificationObservation}
          setJustificationObservation={setJustificationObservation}
          onConfirm={handleConfirmJustification}
        />

        {/* Registrar Incidencia Modal */}
        <RegisterIncidentModal
          isOpen={isRegisterIncidentModalOpen}
          onClose={() => setIsRegisterIncidentModalOpen(false)}
          student={student}
          incidentForm={incidentForm}
          setIncidentForm={setIncidentForm}
        />

        {/* Attendance Notifications Modal */}
        <AttendanceNotificationsModal
          isOpen={isAttendanceNotificationsModalOpen}
          onClose={() => setIsAttendanceNotificationsModalOpen(false)}
          studentName={student.name}
          activeAttendanceTab={activeAttendanceTab}
          setActiveAttendanceTab={setActiveAttendanceTab}
          personalIncidents={personalIncidents}
        />
      </ModuleBody>
    </>
  );
};
