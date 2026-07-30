import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertTriangle, ArrowLeft, Bell, Calendar, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, MessageCircle, MoreVertical, Search, ShieldCheck, User, X } from 'lucide-react';

import { getWeekString } from '@/components/calendar/CustomCalendar';
import { APP_CONFIG } from '@/config/app';
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

  const months = [
    { value: 2, label: "Marzo" },
    { value: 3, label: "Abril" },
    { value: 4, label: "Mayo" },
    { value: 5, label: "Junio" },
    { value: 6, label: "Julio" },
    { value: 7, label: "Agosto" },
    { value: 8, label: "Septiembre" },
    { value: 9, label: "Octubre" },
    { value: 10, label: "Noviembre" },
    { value: 11, label: "Diciembre" },
  ];

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
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("I.E 6049 RICARDO PALMA", pageWidth / 2, 15, { align: "center" });
    doc.text(`REGISTRO DE ${reportType.toUpperCase()}`, pageWidth / 2, 22, {
      align: "center",
    });

    // Subheader info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TIPO: ESTUDIANTES", 14, 35);
    doc.text("NIVEL: INICIAL", 70, 35);
    doc.text("GRADO: 3 AÑOS", 130, 35);
    doc.text("SECCIÓN: MARGARITAS", 190, 35);

    const monthNames = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];
    const currentMonthName = monthNames[selectedReportMonth];
    const currentYear = new Date().getFullYear();
    doc.text(`MES: ${currentMonthName} ${currentYear}`, 250, 35);

    // Draw border for subheader
    doc.rect(12, 28, pageWidth - 24, 10);

    if (reportType === "Asistencia") {
      // Generate days for the month
      const daysInMonth = new Date(
        currentYear,
        selectedReportMonth + 1,
        0,
      ).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      const dayLetters = days.map((day) => {
        const date = new Date(currentYear, selectedReportMonth, day);
        const dayOfWeek = date.getDay();
        return ["D", "L", "M", "M", "J", "V", "S"][dayOfWeek];
      });

      const head = [
        [
          {
            content: "N°",
            rowSpan: 2,
            styles: { halign: "center" as const, valign: "middle" as const },
          },
          {
            content: "APELLIDOS Y NOMBRES",
            rowSpan: 2,
            styles: { halign: "center" as const, valign: "middle" as const },
          },
          ...days.map((d) => ({
            content: d.toString(),
            styles: { halign: "center" as const, cellPadding: 1 },
          })),
        ],
        [
          ...dayLetters.map((l) => ({
            content: l,
            styles: { halign: "center" as const, cellPadding: 1 },
          })),
        ],
      ];

      const body = [
        [
          1,
          student.name.toUpperCase(),
          ...days.map((day) => {
            const date = new Date(currentYear, selectedReportMonth, day);
            const dayOfWeek = date.getDay();

            if (dayOfWeek === 0 || dayOfWeek === 6) {
              return ""; // Weekend
            } else {
              // Use actual calendar data if available
              const record = calendarData.find((r) => r && r.dayNumber === day);
              if (record) {
                if (record.originalStatus === "Falta")
                  return {
                    content: "F",
                    styles: {
                      textColor: [255, 0, 0] as [number, number, number],
                    },
                  };
                if (record.originalStatus === "Tardanza")
                  return {
                    content: "T",
                    styles: {
                      textColor: [255, 165, 0] as [number, number, number],
                    },
                  };
                if (record.status.includes("Justificada"))
                  return {
                    content: "J",
                    styles: {
                      textColor: [0, 0, 255] as [number, number, number],
                    },
                  };
              }
              return ""; // Present
            }
          }),
        ],
      ];

      autoTable(doc, {
        startY: 40,
        head: head,
        body: body,
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 1,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 50 },
        },
      });

      // Legend
      const finalY = (doc as any).lastAutoTable.finalY || 40;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        ". Asistió   F Faltó   T Tardanza   J Falta justificada",
        14,
        finalY + 5,
      );

      // Print date
      const printDate = new Date().toLocaleString("es-PE");
      doc.text(`Impreso: ${printDate}`, pageWidth - 14, finalY + 5, {
        align: "right",
      });
    } else if (reportType === "Incidencias") {
      const head = [["Fecha", "Hora", "Tipo", "Descripción", "Registrado por"]];
      const body = personalIncidents.map((inc) => [
        inc.date,
        inc.time || "10:30 AM",
        inc.type.label,
        inc.description,
        inc.teacher || "Prof. María García",
      ]);

      autoTable(doc, {
        startY: 40,
        head: head,
        body: body,
        theme: "grid",
        styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1 },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY || 40;
      const printDate = new Date().toLocaleString("es-PE");
      doc.setFontSize(8);
      doc.text(`Impreso: ${printDate}`, pageWidth - 14, finalY + 5, {
        align: "right",
      });
    }

    doc.save(`Reporte_${reportType}_${student.name.replace(/\s+/g, '_')}.pdf`);
  };

  const unconfirmedAttendancesCount = useMemo(() => {
    return personalIncidents.filter(
      (inc) =>
        inc.id.startsWith("att-") &&
        inc.signatureStatus === "Esperando confirmación",
    ).length;
  }, [personalIncidents]);

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
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center sm:flex-nowrap flex-wrap gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                      Asistencia
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                      <button
                        onClick={() =>
                          setSelectedMonth((prev) => (prev > 2 ? prev - 1 : 11))
                        }
                        className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </button>
                      <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 min-w-[60px] sm:min-w-[80px] text-center">
                        {months.find((m) => m.value === selectedMonth)?.label}
                      </span>
                      <button
                        onClick={() =>
                          setSelectedMonth((prev) => (prev < 11 ? prev + 1 : 2))
                        }
                        className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        setIsAttendanceNotificationsModalOpen(true)
                      }
                      className="p-2 sm:p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm min-w-[36px] sm:min-w-[44px] flex justify-center items-center relative"
                      title="Ver Notificaciones de Asistencia"
                    >
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                      {unconfirmedAttendancesCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unconfirmedAttendancesCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setReportType("Asistencia");
                        setReportPeriod("Mes");
                        setSelectedReportMonth(selectedMonth);
                        setTimeout(handleDownloadPersonalReport, 0);
                      }}
                      className="p-2 sm:p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-sm min-w-[36px] sm:min-w-[44px] flex justify-center items-center"
                      title="Descargar Asistencia"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-6 flex-1 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-7 gap-2 sm:gap-3">
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"
                        >
                          {day}
                        </div>
                      ),
                    )}
                    {calendarData.map((record, idx) => {
                      if (!record) {
                        return (
                          <div
                            key={`empty-${idx}`}
                            className="aspect-square"
                          ></div>
                        );
                      }
                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            !record.isWeekend && handleOpenJustifyModal(record)
                          }
                          className={`relative aspect-square rounded-xl ${record.isWeekend ? "bg-slate-50/80 dark:bg-slate-800/50 text-slate-400 font-bold" : record.color} group ${!record.isWeekend && (record.originalStatus === "Falta" || record.originalStatus === "Tardanza") ? "cursor-pointer hover:ring-2 hover:ring-blue-400" : "cursor-help"} transition-transform hover:scale-105 flex items-center justify-center`}
                        >
                          <span className="text-lg font-bold">
                            {record.dayNumber}
                          </span>
                          {!record.isWeekend && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-xl backdrop-blur-sm z-10">
                              <span className="text-white text-[10px] font-bold text-center leading-tight px-1">
                                {record.status}
                                {(record.originalStatus === "Falta" ||
                                  record.originalStatus === "Tardanza") &&
                                  !record.status.includes("Justificada") && (
                                    <span className="block text-[8px] text-blue-300 mt-1">
                                      Click para justificar
                                    </span>
                                  )}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-6 md:mt-8 text-sm font-medium text-slate-600 dark:text-slate-400 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-800"></div>{" "}
                      Presente
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-100 border-2 border-amber-200 dark:bg-amber-900/40 dark:border-amber-800"></div>{" "}
                      Tardanza
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-rose-100 border-2 border-rose-200 dark:bg-rose-900/40 dark:border-rose-800"></div>{" "}
                      Falta
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800"></div>{" "}
                      Justificada
                    </div>
                  </div>
                </div>
              </div>

              {/* Incidents Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                      Incidencias
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-lg text-sm font-bold border border-rose-200 dark:border-rose-800 shadow-sm">
                      <AlertTriangle className="w-4 h-4" />
                      {
                        calendarData.filter(
                          (d) => d?.originalStatus === "Falta",
                        ).length
                      }{" "}
                      <span className="hidden md:inline">Faltas</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-bold border border-amber-200 dark:border-amber-800 shadow-sm">
                      <Clock className="w-4 h-4" />
                      {
                        calendarData.filter(
                          (d) => d?.originalStatus === "Tardanza",
                        ).length
                      }{" "}
                      <span className="hidden md:inline">Tardanzas</span>
                    </div>
                    <button
                      onClick={() => {
                        setReportType("Incidencias");
                        setReportPeriod("Mes");
                        setSelectedReportMonth(selectedMonth);
                        setTimeout(handleDownloadPersonalReport, 0);
                      }}
                      className="p-2 sm:p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex justify-center"
                      title="Descargar Incidencias"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col">
                  {personalIncidents.length > 0 ? (
                    <>
                      <div className="space-y-4 flex-1">
                        {paginatedIncidents.map((incident, idx) => {
                          const Icon = incident.type.icon;
                          const isSevere = incident.type.category === "Grave";
                          return (
                            <div
                              key={idx}
                              className={`p-4 bg-white dark:bg-slate-800 rounded-xl border ${isSevere ? "border-rose-200 dark:border-rose-900/50 shadow-rose-100/50 dark:shadow-rose-900/20" : "border-slate-200 dark:border-slate-700"} shadow-sm hover:shadow-md transition-all flex gap-3 sm:gap-4`}
                            >
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${incident.type.color.includes("rose") ? "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400" : incident.type.color.includes("amber") ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400" : incident.type.color.includes("blue") ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400" : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}
                              >
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-slate-800 dark:text-white text-base uppercase tracking-wide">
                                    {incident.type.label}
                                  </h4>
                                  <span
                                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isSevere ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}
                                  >
                                    {incident.type.category}
                                  </span>
                                  {incident.signatureStatus && (
                                    <span
                                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${incident.signatureStatus === "signed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                                    >
                                      {incident.signatureStatus ===
                                      "signed" ? (
                                        <CheckCircle2 className="w-3 h-3" />
                                      ) : (
                                        <Clock className="w-3 h-3" />
                                      )}
                                      {incident.signatureStatus ===
                                      "signed"
                                        ? "Confirmado por el padre"
                                        : "Esperando confirmación"}
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                                  {incident.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {incident.date}
                                    </div>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {incident.time}
                                    </div>
                                    {incident.teacher && (
                                      <>
                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                        <div className="flex items-center gap-1">
                                          <User className="w-3.5 h-3.5" />
                                          {incident.teacher}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  {incident.signatureStatus ===
                                    "Esperando confirmación" && (
                                    <button
                                      onClick={() => {
                                        setParentViewIncident(incident);
                                        setShowWebhookSimulation(false);
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg text-xs font-bold transition-colors"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      Simular WhatsApp
                                    </button>
                                  )}
                                  {incident.signatureStatus ===
                                    "signed" && (
                                    <div
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
                                      title={`IP: ${incident.signatureIp}`}
                                    >
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      {incident.signatureDate}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {totalIncidentPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() =>
                              setIncidentsPage((p) => Math.max(1, p - 1))
                            }
                            disabled={incidentsPage === 1}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Anterior
                          </button>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Página {incidentsPage} de {totalIncidentPages}
                          </span>
                          <button
                            onClick={() =>
                              setIncidentsPage((p) =>
                                Math.min(totalIncidentPages, p + 1),
                              )
                            }
                            disabled={incidentsPage === totalIncidentPages}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Siguiente
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                        Excelente comportamiento
                      </p>
                      <p className="text-sm mt-1">
                        No se registran incidencias para este estudiante.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MODAL DE JUSTIFICACIÓN */}
            <AnimatePresence>
              {isJustifyModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsJustifyModalOpen(false)}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
                  >
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shadow-sm">
                            <ShieldCheck size={28} />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                              Justificar {dayToJustify?.originalStatus}
                            </h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                              Validación Manual
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsJustifyModalOpen(false)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-400"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl flex gap-3 mb-6">
                        <AlertTriangle
                          className="text-amber-600 shrink-0"
                          size={20}
                        />
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-relaxed">
                          Asegúrate de que los documentos físicos presentados
                          sean correctos. Esta acción quedará registrada en el
                          historial.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Estudiante
                          </p>
                          <p className="text-sm font-bold text-gray-800 dark:text-white">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Fecha: {dayToJustify?.date}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-widest">
                            Motivo / Observación (Opcional)
                          </label>
                          <textarea
                            value={justificationObservation}
                            onChange={(e) =>
                              setJustificationObservation(e.target.value)
                            }
                            placeholder="Ej: Presentó certificado médico físico..."
                            className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-transparent rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-200 transition-all min-h-[100px] resize-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-8">
                        <button
                          onClick={() => setIsJustifyModalOpen(false)}
                          className="py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleConfirmJustification}
                          className="py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                        >
                          <Check size={18} /> Confirmar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* VISTA WHATSAPP MODAL */}
            <AnimatePresence>
              {parentViewIncident && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setParentViewIncident(null)}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                  />
                  <div className="relative flex flex-col md:flex-row gap-6 items-center justify-center w-full max-w-4xl pointer-events-none">
                    {/* Phone Simulation */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      className="relative w-full max-w-sm h-[80vh] max-h-[700px] bg-[#efeae2] rounded-[40px] shadow-2xl border-[12px] border-slate-900 overflow-hidden flex flex-col pointer-events-auto"
                      style={{
                        backgroundImage:
                          'url("https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")',
                        backgroundSize: "cover",
                        backgroundBlendMode: "overlay",
                        backgroundColor: "rgba(239, 234, 226, 0.9)",
                      }}
                    >
                      {/* Mobile Status Bar Simulation */}
                      <div className="h-7 bg-[#075e54] w-full flex justify-between items-center px-5 shrink-0 text-white/90 text-[10px] font-medium">
                        <span>18:47</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full border border-white/50"></div>
                          <div className="w-3 h-3 rounded-full bg-white/80"></div>
                        </div>
                      </div>

                      {/* WhatsApp Header */}
                      <div className="bg-[#005c4b] dark:bg-[#202C33] py-2.5 px-3 flex items-center gap-3 shrink-0 shadow-sm relative z-10">
                        <button
                          onClick={() => setParentViewIncident(null)}
                          className="p-1 hover:bg-white/10 rounded-full transition-colors -ml-1 text-white"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-white/50">
                          <img
                            src={APP_CONFIG.schoolLogo}
                            alt="Logo"
                            className="w-full h-full object-cover scale-[1.7]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col text-white">
                          <span className="font-bold text-[15px] leading-tight flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                            Asistencia Ricardo Palma Secundaria
                          </span>
                          <span className="text-[12px] text-white/80 leading-tight">
                            Cuenta Oficial de Empresa
                          </span>
                        </div>
                      </div>

                      {/* Chat Content */}
                      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative custom-scrollbar">
                        {/* Fake WhatsApp Background Pattern */}
                        <div
                          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.06] pointer-events-none"
                          style={{
                            backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                            backgroundSize: "cover",
                          }}
                        ></div>

                        <div className="self-center bg-[#E1F3FB] dark:bg-[#182229] text-slate-700 dark:text-slate-300 text-[11px] font-medium px-3 py-1 rounded-lg uppercase tracking-wider relative z-10 shadow-sm">
                          HOY
                        </div>

                        {/* Message Bubble */}
                        <div className="bg-white dark:bg-[#202C33] rounded-xl rounded-tl-[0px] p-3 shadow-sm max-w-[90%] relative z-10 text-left">
                          <div className="text-[15px] leading-[1.4] whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100 font-medium space-y-3">
                            <p className="font-bold flex items-center gap-2">
                              🚨 Notificación de Incidencia
                            </p>
                            <p>
                              Estimado padre de familia, se ha registrado una
                              incidencia conductual del estudiante{" "}
                              <span className="font-semibold text-[#005c4b] dark:text-emerald-400">
                                {student.name}
                              </span>
                              .
                            </p>
                            <p className="font-bold">
                              Detalle: {parentViewIncident.description}
                            </p>

                            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/50 text-[14px]">
                              <p>📝 *Registrado por:*</p>
                              <p className="font-bold mt-1">
                                {parentViewIncident.teacher ||
                                  parentViewIncident.registrar ||
                                  "Carlos Mendoza"}
                              </p>
                              <p className="italic opacity-80 text-[13px] mt-0.5">
                                Docente del curso de DPCC
                              </p>
                            </div>

                            <p className="italic text-[13px] opacity-80 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                              Por favor, confirme que ha recibido este aviso
                              digital.
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                              ID:{" "}
                              {parentViewIncident.id?.toUpperCase() ||
                                "INC-2026-001"}
                            </p>
                          </div>
                          {/* Bubble arrow */}
                          <div
                            className="absolute left-[-8px] top-0 w-3 h-4 bg-white dark:bg-[#202C33]"
                            style={{
                              clipPath: "polygon(100% 0, 100% 100%, 0 0)",
                            }}
                          ></div>
                          <div className="text-right mt-1">
                            <span className="text-[10px] text-slate-400">
                              18:47
                            </span>
                          </div>

                          {/* Interactive Buttons */}
                          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
                            {incidentSignatures[parentViewIncident.id]
                              ?.status === "signed" ? (
                              <div className="flex items-center justify-center gap-2 py-2 text-[#075e54] font-medium text-sm">
                                <Check className="w-4 h-4" /> Confirmado por el
                                padre
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setShowWebhookSimulation(true);
                                  setWebhookTimestamp(Math.floor(Date.now() / 1000));
                                  setTimeout(() => {
                                    setIncidentSignatures((prev) => ({
                                      ...prev,
                                      [parentViewIncident.id]: {
                                        status: "signed",
                                        date: new Date().toLocaleString(
                                          "es-PE",
                                          {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                          },
                                        ),
                                        ip: "190.234.x.x",
                                      },
                                    }));
                                  }, 1500);
                                }}
                                className="flex items-center justify-center gap-2 py-2 text-[#00a884] font-medium text-sm hover:bg-slate-50 rounded-md transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Confirmar
                                de Enterado
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Parent Reply (if signed) */}
                        {incidentSignatures[parentViewIncident.id]?.status ===
                          "signed" && (
                          <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none p-2 shadow-sm max-w-[80%] self-end relative">
                            <p className="text-sm text-slate-800">
                              ✅ Conforme
                            </p>
                            <div className="text-right mt-1 flex items-center justify-end gap-1">
                              <span className="text-[10px] text-slate-500">
                                18:48
                              </span>
                              <Check className="w-3 h-3 text-blue-500" />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Webhook Simulation Terminal */}
                    <AnimatePresence>
                      {showWebhookSimulation && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="w-full max-w-md bg-[#1e1e1e] rounded-xl shadow-2xl border border-slate-700 overflow-hidden font-mono text-sm pointer-events-auto"
                        >
                          <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-slate-700">
                            <span className="text-emerald-400 font-bold text-xs">
                              SIMULACIÓN WEBHOOK WAHA
                            </span>
                            <span className="bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                              RECIBIDO
                            </span>
                          </div>
                          <div className="p-4 text-slate-300 space-y-1">
                            <p>{"{"}</p>
                            <p className="pl-4">
                              <span className="text-blue-400">"event"</span>:{" "}
                              <span className="text-amber-300">
                                "message.create"
                              </span>
                              ,
                            </p>
                            <p className="pl-4">
                              <span className="text-blue-400">"payload"</span>:{" "}
                              {"{"}
                            </p>
                            <p className="pl-8">
                              <span className="text-blue-400">"from"</span>:{" "}
                              <span className="text-amber-300">
                                "51900000000@c.us"
                              </span>
                              ,
                            </p>
                            <p className="pl-8">
                              <span className="text-blue-400">"body"</span>:{" "}
                              <span className="text-amber-300">
                                "✅ Conforme"
                              </span>
                              ,
                            </p>
                            <p className="pl-8">
                              <span className="text-blue-400">
                                "selectedButtonId"
                              </span>
                              :{" "}
                              <span className="text-amber-300">
                                "CONFORME_LECTURA"
                              </span>
                              ,
                            </p>
                            <p className="pl-8">
                              <span className="text-blue-400">"timestamp"</span>
                              :{" "}
                              <span className="text-blue-400">{webhookTimestamp}</span>
                            </p>
                            <p className="pl-4">{"}"}</p>
                            <p>{"}"}</p>

                            {incidentSignatures[parentViewIncident.id]
                              ?.status === "signed" && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 pt-4 border-t border-slate-700 text-emerald-400 font-bold"
                              >
                                Acción: Guardando firma digital en Base de Datos
                                para auditoría UGEL...
                              </motion.p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Registrar Incidencia Modal with WhatsApp Preview */}
            <AnimatePresence>
              {isRegisterIncidentModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden w-full flex flex-col transition-all duration-300 max-w-xl`}
                  >
                    <div className="flex flex-col lg:flex-row w-full h-full max-h-[90vh]">
                      {/* Form Section */}
                      <div className="flex-1 flex flex-col min-h-0 relative overflow-y-auto custom-scrollbar">
                        <div className="px-6 py-[22px] border-b border-[#EAEBF0] dark:border-slate-800 flex justify-between items-center bg-transparent sticky top-0 z-10 bg-white dark:bg-slate-900">
                          <h3 className="text-xl font-extrabold text-[#0D082C] dark:text-white flex items-center gap-2.5">
                            <AlertTriangle className="w-[22px] h-[22px] text-rose-500" />{" "}
                            <span className="pt-0.5">Registrar Incidencia</span>
                          </h3>
                          <button
                            onClick={() =>
                              setIsRegisterIncidentModalOpen(false)
                            }
                            className="text-[#8792A2] hover:text-[#0D082C] dark:hover:text-slate-300 transition-colors bg-[#F2F4FC] dark:bg-slate-800 w-9 h-9 rounded-full flex items-center justify-center"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="p-6 flex flex-col gap-6 flex-1">
                          <div>
                            <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                              Estudiante
                            </label>
                            <div className="flex items-center gap-4 bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border-none shadow-none">
                              <div
                                className={`w-[45px] h-[45px] rounded-full flex items-center justify-center text-white font-bold text-[18px] bg-rose-500`}
                              >
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-rose-900 dark:text-rose-100 text-[17px] leading-none mb-1">
                                  {student.name}
                                </p>
                                <p className="text-[13px] text-rose-700 dark:text-rose-400 font-semibold">
                                  {student.grade.replace("° Grado", "")}°{" "}
                                  {student.section}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                              Tipo de Incidencia
                            </label>
                            <select
                              value={incidentForm.type}
                              onChange={(e) =>
                                setIncidentForm((prev) => ({
                                  ...prev,
                                  type: e.target.value,
                                }))
                              }
                              className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 appearance-none focus:ring-2 focus:ring-rose-500 outline-none"
                            >
                              <option value="" disabled>
                                Seleccione un tipo
                              </option>
                              <option value="Conducta en clase">
                                Conducta en clase
                              </option>
                              <option value="Falta de respeto">
                                Falta de respeto
                              </option>
                              <option value="Falta de material">
                                Falta de material
                              </option>
                              <option value="Uso indebido de celular">
                                Uso indebido de celular
                              </option>
                              <option value="Incumplimiento de tareas">
                                Incumplimiento de tareas
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                              Descripción Detallada
                            </label>
                            <textarea
                              value={incidentForm.description}
                              onChange={(e) =>
                                setIncidentForm((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder="Describa el suceso ocurrido..."
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] px-4 py-3 font-medium text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[120px] resize-none"
                            />
                          </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-4 bg-transparent sticky bottom-0 z-10 bg-white dark:bg-slate-900">
                          <button
                            onClick={() =>
                              setIsRegisterIncidentModalOpen(false)
                            }
                            className="px-[25px] py-[11px] rounded-[10px] font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-900 transition-colors border border-slate-200 dark:border-slate-700 text-[13px]"
                          >
                            Cancelar
                          </button>
                          <button
                            disabled={
                              !incidentForm.type || !incidentForm.description
                            }
                            className="px-[25px] py-[11px] rounded-[10px] font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-none text-[13px]"
                          >
                            Registrar Incidencia
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Attendance Notifications Modal */}
            <AnimatePresence>
              {isAttendanceNotificationsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                  >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                          <Bell className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                            Estado de Notificaciones
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Ingresos y salidas de {student.name}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setIsAttendanceNotificationsModalOpen(false)
                        }
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1">
                      {unconfirmedAttendancesCount > 0 && (
                        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-amber-800 dark:text-amber-300 font-bold text-sm">
                              Acción Requerida
                            </h4>
                            <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                              Hay {unconfirmedAttendancesCount} notificaciones
                              esperando confirmación del padre/apoderado.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => setActiveAttendanceTab("asistencia")}
                          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeAttendanceTab === "asistencia" ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                        >
                          Asistencia
                        </button>
                        <button
                          onClick={() => setActiveAttendanceTab("salidas")}
                          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeAttendanceTab === "salidas" ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                        >
                          Salidas
                        </button>
                      </div>

                      <div className="space-y-4">
                        {personalIncidents.filter((inc) =>
                          inc.id.startsWith(
                            activeAttendanceTab === "asistencia"
                              ? "att-in-"
                              : "att-out-",
                          ),
                        ).length === 0 ? (
                          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            No hay notificaciones de{" "}
                            {activeAttendanceTab === "asistencia"
                              ? "asistencia"
                              : "salida"}{" "}
                            registradas.
                          </div>
                        ) : (
                          personalIncidents
                            .filter((inc) =>
                              inc.id.startsWith(
                                activeAttendanceTab === "asistencia"
                                  ? "att-in-"
                                  : "att-out-",
                              ),
                            )
                            .map((incident) => (
                              <div
                                key={incident.id}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`p-2 rounded-lg shrink-0 ${incident.type.color}`}
                                  >
                                    <incident.type.icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-slate-800 dark:text-white">
                                        {incident.type.label}
                                      </span>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />{" "}
                                        {incident.date}
                                      </span>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />{" "}
                                        {incident.time}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                      {incident.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                  <span
                                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1 ${incident.signatureStatus === "signed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                                  >
                                    {incident.signatureStatus ===
                                    "signed" ? (
                                      <CheckCircle2 className="w-3 h-3" />
                                    ) : (
                                      <Clock className="w-3 h-3" />
                                    )}
                                    {incident.signatureStatus ===
                                    "signed"
                                      ? "Confirmado por el padre"
                                      : "Esperando confirmación"}
                                  </span>

                                  {incident.signatureStatus ===
                                  "signed" ? (
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                      <Check className="w-3 h-3 text-emerald-500" />{" "}
                                      {incident.signatureDate}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setIsAttendanceNotificationsModalOpen(
                                          false,
                                        );
                                        setParentViewIncident(incident);
                                        setShowWebhookSimulation(false);
                                      }}
                                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                      <MessageCircle className="w-3 h-3" />{" "}
                                      Simular WhatsApp
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
