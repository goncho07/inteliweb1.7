import React, { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, ArrowLeft, Clock, MoreVertical, Search } from 'lucide-react';

import { getWeekString } from '@/components/calendar/CustomCalendar';
import { AttendanceHeatmapCard } from '@/features/classrooms/components/student-detail/AttendanceHeatmapCard';
import { AttendanceNotificationsModal } from '@/features/classrooms/components/student-detail/AttendanceNotificationsModal';
import { JustifyAbsenceModal } from '@/features/classrooms/components/student-detail/JustifyAbsenceModal';
import { ParentWhatsAppPreviewModal } from '@/features/classrooms/components/student-detail/ParentWhatsAppPreviewModal';
import { PersonalIncidentsCard } from '@/features/classrooms/components/student-detail/PersonalIncidentsCard';
import { RegisterIncidentModal } from '@/features/classrooms/components/student-detail/RegisterIncidentModal';
import type { PersonalIncidentEntry } from '@/features/classrooms/types';
import { downloadStudentReport } from '@/features/classrooms/utils';
import { INCIDENT_TYPES } from '@/data/education';
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
  const [parentViewIncident, setParentViewIncident] = useState<any>(null);
  const [showWebhookSimulation, setShowWebhookSimulation] = useState(false);
  // Instante en que se lanzó el webhook. Se captura al dispararlo y no en el
  // render: leer Date.now() al pintar hace que el JSON cambie en cada repintado.
  const [webhookTimestamp, setWebhookTimestamp] = useState(0);
  const [dayToJustify, setDayToJustify] = useState<any>(null);
  const [justificationObservation, setJustificationObservation] = useState("");
  const [incidentSignatures, setIncidentSignatures] = useState<
    Record<string, { status: "pending" | "signed"; date?: string; ip?: string }>
  >({
    "inc-1": { status: "pending" },
    "inc-2": { status: "signed", date: "2026-03-06 14:20", ip: "192.168.1.45" },
  });

  const [isRegisterIncidentModalOpen, setIsRegisterIncidentModalOpen] =
    useState(false);
  const [showIncidentWhatsAppPreview, setShowIncidentWhatsAppPreview] =
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
  const [reportPeriod, setReportPeriod] = useState<
    "Día" | "Semana" | "Mes" | "Bimestre"
  >("Día");
  const [reportType, setReportType] = useState<
    "Asistencia" | "Incidencias" | "Completo"
  >("Completo");
  const [selectedReportDate, setSelectedReportDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedReportWeek, setSelectedReportWeek] = useState<string>(
    getWeekString(new Date()),
  );
  const [selectedReportMonth, setSelectedReportMonth] = useState<number>(
    new Date().getMonth() >= 2 && new Date().getMonth() <= 11
      ? new Date().getMonth()
      : 2,
  );
  const [selectedReportBimestre, setSelectedReportBimestre] =
    useState<number>(1);

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
        const isTardanza = d.originalStatus === "Tardanza";
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
          signatureStatus: incidentSignatures[entryId]?.status || "Esperando confirmación",
          signatureDate: incidentSignatures[entryId]?.date,
          signatureIp: incidentSignatures[entryId]?.ip,
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
    ].map((inc) => ({
      ...inc,
      signatureStatus:
        incidentSignatures[inc.id]?.status || "Esperando confirmación",
      signatureDate: incidentSignatures[inc.id]?.date,
      signatureIp: incidentSignatures[inc.id]?.ip,
    }));

    return [...mockIncidents, ...attendanceIncidents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [student.name, selectedMonth, justifiedDays, incidentSignatures]);

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

  const unconfirmedAttendancesCount = useMemo(() => {
    return personalIncidents.filter(
      (inc) =>
        inc.id.startsWith("att-") &&
        inc.signatureStatus === "Esperando confirmación",
    ).length;
  }, [personalIncidents]);

  const faltasCount = calendarData.filter(
    (d) => d?.originalStatus === "Falta",
  ).length;
  const tardanzasCount = calendarData.filter(
    (d) => d?.originalStatus === "Tardanza",
  ).length;

  const handleSimulateWhatsApp = (incident: PersonalIncidentEntry) => {
    setParentViewIncident(incident);
    setShowWebhookSimulation(false);
  };

  const handleSimulateWhatsAppFromNotifications = (incident: PersonalIncidentEntry) => {
    setIsAttendanceNotificationsModalOpen(false);
    setParentViewIncident(incident);
    setShowWebhookSimulation(false);
  };

  const handleConfirmParentSignature = () => {
    setShowWebhookSimulation(true);
    setWebhookTimestamp(Math.floor(Date.now() / 1000));
    setTimeout(() => {
      setIncidentSignatures((prev) => ({
        ...prev,
        [parentViewIncident.id]: {
          status: "signed",
          date: new Date().toLocaleString("es-PE", {
            dateStyle: "short",
            timeStyle: "short",
          }),
          ip: "190.234.x.x",
        },
      }));
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col font-poppins animate-in fade-in slide-in-from-right-4 duration-500 pb-8">
      <div className="flex flex-col relative">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20 gap-4">
            {!isParentView && (
              <button onClick={onBack} className="text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1 flex items-center gap-3">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${student.avatarColor}`}>
                  {student.name.charAt(0)}
               </div>
               <div className="flex flex-col">
                  <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px] leading-tight truncate">{student.name}</h2>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {student.grade} {student.section} • DNI: {student.dni}
                  </span>
               </div>
            </div>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1] shrink-0">
               <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
               <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
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
                unconfirmedAttendancesCount={unconfirmedAttendancesCount}
                onOpenNotifications={() =>
                  setIsAttendanceNotificationsModalOpen(true)
                }
                onDownloadAttendance={() => {
                  setReportType("Asistencia");
                  setReportPeriod("Mes");
                  setSelectedReportMonth(selectedMonth);
                  setTimeout(handleDownloadPersonalReport, 0);
                }}
                onDayClick={handleOpenJustifyModal}
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
                  setReportPeriod("Mes");
                  setSelectedReportMonth(selectedMonth);
                  setTimeout(handleDownloadPersonalReport, 0);
                }}
                onSimulateWhatsApp={handleSimulateWhatsApp}
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

            {/* VISTA WHATSAPP MODAL */}
            <ParentWhatsAppPreviewModal
              incident={parentViewIncident}
              studentName={student.name}
              onClose={() => setParentViewIncident(null)}
              incidentSignatures={incidentSignatures}
              showWebhookSimulation={showWebhookSimulation}
              webhookTimestamp={webhookTimestamp}
              onConfirmSignature={handleConfirmParentSignature}
            />

            {/* Registrar Incidencia Modal with WhatsApp Preview */}
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
              unconfirmedAttendancesCount={unconfirmedAttendancesCount}
              activeAttendanceTab={activeAttendanceTab}
              setActiveAttendanceTab={setActiveAttendanceTab}
              personalIncidents={personalIncidents}
              onSimulateWhatsApp={handleSimulateWhatsAppFromNotifications}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
