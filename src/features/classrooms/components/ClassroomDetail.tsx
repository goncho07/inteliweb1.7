import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDateFromWeekString, getWeekString } from '@/components/calendar/CustomCalendar';
import { MOCK_USERS } from '@/data/users';
import { CitationsBoardPanel } from '@/features/classrooms/components/CitationsBoardPanel';
import { ClassroomReportsHistory } from '@/features/classrooms/components/ClassroomReportsHistory';
import { MONTHS } from '@/features/classrooms/constants';
import {
  COMUNICADOS_VARIANT,
  INCIDENCIAS_VARIANT,
} from '@/features/classrooms/panelVariants';
import { INITIAL_CITATIONS } from '@/features/classrooms/data';
import type { CitationItem } from '@/features/classrooms/types';
import { UserItem } from '@/types';

export const ClassroomDetail: React.FC<{
  classroom: { level: string; grade: string; section: string };
  globalDate?: Date;
  onBack: () => void;
  onLevelClick: () => void;
  onGradeClick: () => void;
  onSelectStudent: (s: UserItem) => void;
  initialShowHistory?: boolean;
  initialShowCitations?: boolean;
  initialShowIncidents?: boolean;
  setHeaderData: React.Dispatch<
    React.SetStateAction<{
      title?: string;
      subtitle?: string;
      icon?: any;
      onBack?: () => void;
    } | null>
  >;
}> = ({
  classroom,
  globalDate,
  onBack,
  onLevelClick,
  onGradeClick,
  onSelectStudent,
  initialShowHistory = false,
  initialShowCitations = false,
  initialShowIncidents = false,
  setHeaderData,
}) => {
  const [showReportsHistory, setShowReportsHistory] =
    useState(initialShowHistory);
  const [showVirtualAttendanceOpen, setShowVirtualAttendanceOpen] =
    useState(false);
  const [isComunicadoModalOpen, setIsComunicadoModalOpen] = useState(false);
  const [showCitationsPanel, setShowCitationsPanel] = useState(initialShowCitations);
  const [showIncidentsPanel, setShowIncidentsPanel] = useState(initialShowIncidents);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCharts, setShowCharts] = useState(false);
  const [showIncidentColumns, setShowIncidentColumns] = useState(false);
  const [sortOrder, setSortOrder] = useState<"az" | "za" | "incidents">("az");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [studentViewMode, setStudentViewMode] = useState<"list" | "grid">("grid");
  const [citationsList, setCitationsList] =
    useState<CitationItem[]>(INITIAL_CITATIONS);
  const [incidentsList, setIncidentsList] =
    useState<CitationItem[]>(INITIAL_CITATIONS.map(c => ({...c, reason: "Incidencia: " + c.reason, status: "closed"})));
  const [hideTeacherNameComunicado, setHideTeacherNameComunicado] =
    useState(false);

  // Los paneles se abren según las props iniciales; cuando el padre las cambia,
  // se reajusta el estado durante el render en lugar de con un efecto.
  const initialPanels = `${initialShowHistory}|${initialShowCitations}|${initialShowIncidents}`;
  const [prevInitialPanels, setPrevInitialPanels] = useState(initialPanels);
  if (prevInitialPanels !== initialPanels) {
    setPrevInitialPanels(initialPanels);
    setShowReportsHistory(initialShowHistory);
    setShowCitationsPanel(initialShowCitations);
    setShowIncidentsPanel(initialShowIncidents);
  }

  const [citationModal, setCitationModal] = useState<{
    isOpen: boolean;
    step: number;
    student: any;
    reason: string;
    customReason: string;
    selectedIncidents: any[];
    availableIncidents: any[];
    showPreview: boolean;
  }>({
    isOpen: false,
    step: 1,
    student: null,
    reason: "",
    customReason: "",
    selectedIncidents: [],
    availableIncidents: [],
    showPreview: false,
  });
  const [citeSchedDate, setCiteSchedDate] = useState("");
  const [citeSchedTime, setCiteSchedTime] = useState("");
  const [citeDateError, setCiteDateError] = useState("");

  const handleDateChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    errorSetter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(value);
    errorSetter("");
    if (!value) return;
    const [y, m, d] = value.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const day = date.getDay();
    if (day === 0 || day === 6) {
      errorSetter("Las citas solo pueden programarse de Lunes a Viernes.");
      setter("");
    }
  };

  const handleQuickCite = (student: any, reasonType: string) => {
    let initialStep = 2;
    let availableIncidents: any[] = [];
    if (reasonType === "Incidencias") {
      initialStep = 1;
      availableIncidents = [
        {
          id: "inc-1",
          label: "No trajo el material escolar",
          date: "14/04/2026",
          time: "10:55 AM",
          registrar: "Auxiliar Juan Perez",
        },
        {
          id: "inc-2",
          label: "Falta de respeto a compañero",
          date: "12/04/2026",
          time: "10:42 AM",
          registrar: "Prof. Ana Gómez",
        },
        {
          id: "inc-3",
          label: "Interrupción constante",
          date: "14/04/2026",
          time: "10:40 AM",
          registrar: "Prof. Ana Gómez",
        },
        {
          id: "inc-4",
          label: "Uso inadecuado del celular",
          date: "13/04/2026",
          time: "10:56 AM",
          registrar: "Prof. Lorenzo Castillo",
        },
      ];
    }

    setCitationModal({
      isOpen: true,
      showPreview: false,
      step: initialStep,
      student,
      reason: reasonType,
      customReason: "",
      selectedIncidents: [],
      availableIncidents,
    });
    setActionMenuId(null);
  };

  const handleSendCitation = () => {
    if (!citationModal.student) return;
    const finalReason =
      citationModal.reason === "Otros"
        ? citationModal.customReason || "Otros"
        : citationModal.reason === "Académico"
          ? "Rendimiento académico"
          : citationModal.reason === "Incidencias"
            ? "Acumulación de incidencias"
            : citationModal.reason;

    const newCitation: CitationItem = {
      id: `cite-${Date.now()}`,
      studentId: citationModal.student.id,
      name: citationModal.student.name,
      avatarColor: citationModal.student.avatarColor,
      avatarLetter: citationModal.student.name.charAt(0),
      reason: finalReason,
      status: "pending",
      theme: citationModal.reason.includes("Incidencia")
        ? "red"
        : citationModal.reason === "Otros"
          ? "yellow"
          : "orange",
      scheduledDate:
        citeSchedDate && citeSchedTime
          ? `En proceso para el ${citeSchedDate} a las ${citeSchedTime}`
          : "En proceso (Sin fecha)",
    };
    setCitationsList((prev) => [newCitation, ...prev]);
    setCitationModal((prev) => ({
      ...prev,
      isOpen: false,
      student: null,
      reason: "",
      customReason: "",
      selectedIncidents: [],
      step: 1,
    }));
  };
  const [attendancePeriod, setAttendancePeriod] = useState<
    "Día" | "Semana" | "Mes" | "Bimestre"
  >("Día");
  const [reportPeriod, setReportPeriod] = useState<
    "Día" | "Semana" | "Mes" | "Bimestre"
  >("Día");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedWeek, setSelectedWeek] = useState<string>(
    getWeekString(new Date()),
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() >= 2 && new Date().getMonth() <= 11
      ? new Date().getMonth()
      : 2,
  );
  const [selectedBimestre, setSelectedBimestre] = useState<number>(1);

  const [incidentsReportPeriod, setIncidentsReportPeriod] = useState<
    "Día" | "Semana" | "Mes" | "Bimestre"
  >("Día");
  const [selectedIncidentsDate, setSelectedIncidentsDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedIncidentsWeek, setSelectedIncidentsWeek] = useState<string>(
    getWeekString(new Date()),
  );
  const [selectedIncidentsMonth, setSelectedIncidentsMonth] = useState<number>(
    new Date().getMonth() >= 2 && new Date().getMonth() <= 11
      ? new Date().getMonth()
      : 2,
  );
  const [selectedIncidentsBimestre, setSelectedIncidentsBimestre] =
    useState<number>(1);

  const [dashboardIncidentsMonth, setDashboardIncidentsMonth] =
    useState<number>(
      new Date().getMonth() >= 2 && new Date().getMonth() <= 11
        ? new Date().getMonth()
        : 2,
    );

  const peruDate = useMemo(
    () =>
      new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Lima" }),
      ),
    [],
  );

  const weekStr = useMemo(() => {
    const start = new Date(peruDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 4);

    const startMonth = start.toLocaleDateString("es-PE", { month: "short" });
    const endMonth = end.toLocaleDateString("es-PE", { month: "short" });

    if (startMonth === endMonth) {
      return `${start.getDate()} al ${end.getDate()} ${endMonth}`;
    } else {
      return `${start.getDate()} ${startMonth} al ${end.getDate()} ${endMonth}`;
    }
  }, [peruDate]);

  const dayStr = useMemo(
    () =>
      peruDate.toLocaleDateString("es-PE", { day: "numeric", month: "short" }),
    [peruDate],
  );

  const students = useMemo(() => {
    return MOCK_USERS.filter(
      (u) =>
        u.role === "Estudiante" &&
        u.level === classroom.level &&
        u.grade === classroom.grade &&
        u.section === classroom.section,
    );
  }, [classroom]);

  const studentIncidents = useMemo(() => {
    const map: Record<
      string,
      { leve: number; mod: number; grave: number; total: number }
    > = {};
    students.forEach((s, idx) => {
      const seed = s.id.charCodeAt(0) + idx;
      const leve = seed % 4;
      const mod = (seed * 2) % 3;
      const grave = (seed * 3) % 2;
      map[s.id] = { leve, mod, grave, total: leve + mod + grave };
    });
    return map;
  }, [students]);

  const filteredStudents = useMemo(() => {
    const filtered = students.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (sortOrder === "incidents") {
      filtered.sort(
        (a, b) => studentIncidents[b.id].total - studentIncidents[a.id].total,
      );
    } else if (sortOrder === "za") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [
    students,
    searchQuery,
    sortOrder,
    studentIncidents,
  ]);

  // Mock data for charts
  const attendanceData = [
    { name: "ASISTIÓ", value: 21, color: "#10b981" },
    { name: "FALTAS", value: 2, color: "#ef4444" },
    { name: "TARDANZAS", value: 1, color: "#f59e0b" },
    { name: "JUSTIFICADAS", value: 2, color: "#3b82f6" },
  ];

  const weeklyAttendanceData = [
    { name: "Lun", Presente: 25, Tardanza: 3, Falta: 2 },
    { name: "Mar", Presente: 28, Tardanza: 1, Falta: 1 },
    { name: "Mié", Presente: 26, Tardanza: 2, Falta: 2 },
    { name: "Jue", Presente: 29, Tardanza: 0, Falta: 1 },
    { name: "Vie", Presente: 24, Tardanza: 4, Falta: 2 },
  ];

  const incidentsData = [
    { name: "Leve", value: 20, color: "#f59e0b" },
    { name: "Moderado", value: 12, color: "#f97316" },
    { name: "Grave", value: 5, color: "#ef4444" },
  ];

  const handleDownloadReport = (type: "Asistencia" | "Incidencias") => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // Título Principal
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("I.E 6049 RICARDO PALMA", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`REPORTE DE ${type.toUpperCase()}`, pageWidth / 2, 22, {
      align: "center",
    });

    // Cuadro de Información
    const startY = 30;
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(margin, startY, pageWidth - margin * 2, 20);

    let periodText = "";
    const currentReportPeriod =
      type === "Asistencia" ? reportPeriod : incidentsReportPeriod;
    const currentDate =
      type === "Asistencia" ? selectedDate : selectedIncidentsDate;
    const currentWeek =
      type === "Asistencia" ? selectedWeek : selectedIncidentsWeek;
    const currentMonth =
      type === "Asistencia" ? selectedMonth : selectedIncidentsMonth;
    const currentBimestre =
      type === "Asistencia" ? selectedBimestre : selectedIncidentsBimestre;

    if (currentReportPeriod === "Día") {
      periodText = `DÍA: ${new Date(currentDate + "T12:00:00").toLocaleDateString("es-PE")}`;
    } else if (currentReportPeriod === "Semana") {
      const weekStart = getDateFromWeekString(currentWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      periodText = `SEMANA: ${weekStart.toLocaleDateString("es-PE")} - ${weekEnd.toLocaleDateString("es-PE")}`;
    } else if (currentReportPeriod === "Mes") {
      const monthLabel =
        MONTHS.find((m) => m.value === currentMonth)?.label || "";
      periodText = `MES: ${monthLabel.toUpperCase()}`;
    } else {
      periodText = `BIMESTRE: ${currentBimestre}°`;
    }

    doc.setFontSize(9);
    doc.text(`NIVEL: ${classroom.level.toUpperCase()}`, margin + 5, startY + 7);
    doc.text(
      `GRADO/SECCIÓN: ${classroom.grade.toUpperCase()} ${classroom.section.toUpperCase()}`,
      margin + 5,
      startY + 14,
    );
    doc.text(periodText, margin + 100, startY + 7);

    // Table Data
    let head = [];
    let tableData = [];

    if (type === "Asistencia") {
      head = [["N°", "ESTUDIANTE", "ASISTENCIA (%)", "TARDANZAS", "FALTAS"]];
      tableData = filteredStudents.map((s, index) => [
        (index + 1).toString(),
        s.name,
        `${Math.floor(Math.random() * 20 + 80)}%`, // Mock data 80-100%
        Math.floor(Math.random() * 5).toString(), // Mock data 0-4
        Math.floor(Math.random() * 3).toString(), // Mock data 0-2
      ]);
    } else {
      head = [["N°", "ESTUDIANTE", "INCIDENCIAS LEVES", "MODERADAS", "GRAVES"]];
      tableData = filteredStudents.map((s, index) => {
        const inc = studentIncidents[s.id];
        return [
          (index + 1).toString(),
          s.name,
          inc.leve.toString(),
          inc.mod.toString(),
          inc.grave.toString(),
        ];
      });
    }

    autoTable(doc, {
      startY: startY + 25,
      head: head,
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.2,
      },
      margin: { left: margin, right: margin },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const now = new Date();
      const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
      doc.text(`Generado el: ${dateStr}`, margin, footerY);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, footerY, {
        align: "right",
      });
    }

    let fileNameSuffix = "";
    if (currentReportPeriod === "Día") {
      fileNameSuffix = `Dia_${new Date(currentDate + "T12:00:00").toLocaleDateString("es-PE").replace(/\//g, "-")}`;
    } else if (currentReportPeriod === "Semana") {
      const weekStart = getDateFromWeekString(currentWeek);
      fileNameSuffix = `Semana_${weekStart.toLocaleDateString("es-PE").replace(/\//g, "-")}`;
    } else if (currentReportPeriod === "Mes") {
      const monthLabel =
        MONTHS.find((m) => m.value === currentMonth)?.label || "";
      fileNameSuffix = `Mes_${monthLabel}`;
    } else {
      fileNameSuffix = `Bimestre_${currentBimestre}`;
    }

    doc.save(
      `Reporte_${type}_${classroom.grade.replace("° Grado", "")}${classroom.section}_${fileNameSuffix}.pdf`,
    );
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
          <p className="font-bold text-slate-800 dark:text-white mb-2">
            {label || payload[0].name}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span className="text-slate-600 dark:text-slate-300">
                {entry.name}:
              </span>
              <span className="font-semibold text-slate-800 dark:text-white">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const tutor = useMemo(() => {
    return MOCK_USERS.find(
      (u) =>
        u.role === "Docente" &&
        u.level === classroom.level &&
        u.grade === classroom.grade &&
        u.section === classroom.section,
    );
  }, [classroom]);

  useEffect(() => {
    if (!showReportsHistory && !showCitationsPanel) {
      setHeaderData(null);
    }
  }, [showReportsHistory, showCitationsPanel, setHeaderData]);

  if (showReportsHistory) {
    return (
      <ClassroomReportsHistory
        classroom={classroom}
        globalDate={globalDate}
        onBack={() => {
          setShowReportsHistory(false);
          setHeaderData(null);
          onBack();
        }}
        setHeaderData={setHeaderData}
        onDownloadReport={(type, period, month, bimestre) => {
          if (type === "Incidencias") {
            setIncidentsReportPeriod(period);
            if (month !== undefined) setSelectedIncidentsMonth(month);
            if (bimestre !== undefined) setSelectedIncidentsBimestre(bimestre);
            setTimeout(() => handleDownloadReport("Incidencias"), 0);
          } else {
            setReportPeriod(period);
            if (month !== undefined) setSelectedMonth(month);
            if (bimestre !== undefined) setSelectedBimestre(bimestre);
            setTimeout(() => handleDownloadReport("Asistencia"), 0);
          }
        }}
      />
    );
  }

  if (showCitationsPanel) {
    return (
      <CitationsBoardPanel
        variant={COMUNICADOS_VARIANT}
        classroom={classroom}
        students={students}
        tutor={tutor}
        items={citationsList}
        setItems={setCitationsList}
        onBack={() => {
          setShowCitationsPanel(false);
          setHeaderData(null);
          onBack();
        }}
        setHeaderData={setHeaderData}
      />
    );
  }

  if (showIncidentsPanel) {
    return (
      <CitationsBoardPanel
        variant={INCIDENCIAS_VARIANT}
        classroom={classroom}
        students={students}
        tutor={tutor}
        items={incidentsList}
        setItems={setIncidentsList}
        onBack={() => {
          setShowIncidentsPanel(false);
          setHeaderData(null);
          onBack();
        }}
        setHeaderData={setHeaderData}
      />
    );
  }

  return null;
};
