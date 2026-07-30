import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  Search,
  ChevronLeft,
  Users,
  PieChart as PieChartIcon,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  School,
  XCircle,
  Clock,
  Download,
  LayoutGrid,
  ShieldCheck,
  X,
  Check,
  CheckCheck,
  Info,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  Filter,
  ShieldAlert,
  Palette,
  BookOpen,
  FileText,
  FileDown,
  CalendarDays,
  CalendarRange,
  Layers,
  Folder,
  Eye,
  GraduationCap,
  ExternalLink,
  MessageCircle,
  Bell,
  ArrowLeft,
  UserCheck,
  MonitorPlay,
  Mail,
  Send,
  BookUser,
  Edit2,
  Archive,
  Megaphone,
  AlertCircle,
  SquarePen,
  Plus, MoreVertical,
  ListFilter,
  ArrowDown,
  Trophy,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  EDUCATIONAL_STRUCTURE,
  MOCK_USERS,
  INCIDENT_TYPES,
  APP_CONFIG,
  getStudentAvatarUrl
} from "../constants";
import { UserItem } from "../types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PageHeader, containerVariants } from "../components/UI";
import {
  CustomCalendar,
  getDateFromWeekString,
  getWeekString,
} from "../src/components/CustomCalendar";
import {
  ReportHistoryItem,
  getFolderStyle,
  ReportPreviewModal,
  ScrollableReportList,
} from "../components/ReportShared";
import { ClassroomLeaderboard } from "./ClassroomLeaderboard";
import { ReportCardItem } from "../src/components/ReportCardItem";
import {
  ComunicadosModal,
  COMMON_MODAL_CLASSES,
} from "../src/components/ComunicadosModal";
import { VirtualAttendanceModal } from "../src/components/VirtualAttendanceModal";

const COLORS = [
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
];

const TEACHER_GRADES = ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado"];
const TEACHER_SECTIONS: Record<string, string[]> = {
  "1° Grado": ["A", "B", "C"],
  "2° Grado": ["A", "B", "C"],
  "3° Grado": ["A", "B", "C", "D"],
  "4° Grado": ["A", "B"],
  "5° Grado": ["A", "B"],
};

const MONTHS = [
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

import { ModuleProps } from "../types";

const getAuxiliarForClassroom = (
  level: string,
  grade: string,
  section: string,
) => {
  if (level === "Secundaria") {
    if (grade === "1° Grado" || grade === "2° Grado") {
      return grade === "1° Grado" ? "Carlos Mendoza" : "Ana Rojas";
    } else if (grade === "3° Grado" || grade === "4° Grado") {
      return grade === "3° Grado" ? "Luis Ramirez" : "Carmen Vega";
    } else if (grade === "5° Grado") {
      return ["A", "B"].includes(section) ? "Jorge Silva" : "Rosa Paredes";
    }
  } else if (level === "Primaria") {
    return "María Fernandez";
  }
  return "Juana Perez";
};



const IncidenciasPanel: React.FC<{
  classroom: { level: string; grade: string; section: string };
  students: UserItem[];
  tutor?: UserItem;
  incidents: CitationItem[];
  setIncidents: React.Dispatch<React.SetStateAction<CitationItem[]>>;
  onBack: () => void;
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
  students,
  tutor,
  incidents,
  setIncidents,
  onBack,
  setHeaderData,
}) => {
  const [sidebarTab, setSidebarTab] = useState<
    "Pendientes" | "Confirmadas" | "Historial" | "Canceladas"
  >("Pendientes");
  const [showIncidentsFilter, setShowIncidentsFilter] = useState(false);
  const [selectedStudentToIncident, setSelectedStudentToCite] =
    useState<UserItem | null>(null);
  const [incidentReason, setIncidentReason] = useState<
    "Incidencias" | "Rendimiento Académico" | "Otros"
  >("Incidencias");
  const [customIncidentReason, setCustomIncidentReason] = useState("");

  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");

  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    citation: CitationItem | null;
  }>({ isOpen: false, citation: null });
  const [realizadoModal, setRealizadoModal] = useState<{
    isOpen: boolean;
    citationId: string | null;
  }>({ isOpen: false, citationId: null });
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const [reschedReason, setReschedReason] = useState("");
  const [reschedDateError, setReschedDateError] = useState("");
  const [expandedCitations, setExpandedCitations] = useState<string[]>([]);

  const toggleCitation = (id: string) => {
    setExpandedCitations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [filterGrade, setFilterGrade] = useState("Todos");
  const [filterMonth, setFilterMonth] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Confirmadas"); // For confirmed tab
  const [filterReasonList, setFilterReasonList] = useState<
    "Todos" | "Incidencias" | "Académico" | "Otros"
  >("Todos");

  const [composeStep, setComposeStep] = useState(1);
  const [selectedIncidentsForCitation, setSelectedIncidentsForCitation] =
    useState<string[]>([]);
  const dummyIncidentsList = useMemo(
    () => [
      {
        id: "inc-1",
        type: "No trajo el material escolar",
        date: "14/04/2026",
        time: "10:55 AM",
        reporter: "Auxiliar Juan Perez",
      },
      {
        id: "inc-2",
        type: "Falta de respeto a compañero",
        date: "12/04/2026",
        time: "10:42 AM",
        reporter: "Prof. Ana Gómez",
      },
      {
        id: "inc-3",
        type: "Interrupción constante",
        date: "14/04/2026",
        time: "10:40 AM",
        reporter: "Prof. Ana Gómez",
      },
      {
        id: "inc-4",
        type: "Uso inadecuado del celular",
        date: "13/04/2026",
        time: "10:56 AM",
        reporter: "Prof. Lorenzo Castillo",
      },
    ],
    [],
  );

  useEffect(() => {
    let title = "";
    let subtitle = "";
    let icon = MessageSquare;
    if (sidebarTab === "Pendientes") {
      title = "Citas Pendientes";
      subtitle = "Incidencias generadas a la espera de confirmación";
      icon = Inbox;
    } else if (sidebarTab === "Confirmadas") {
      title = "Citas Confirmadas";
      subtitle = "Reuniones programadas pendientes de realizarse";
      icon = CheckCircle2;
    } else if (sidebarTab === "Canceladas") {
      title = "Citas Canceladas";
      subtitle = "Reuniones que fueron canceladas o rechazadas";
      icon = XCircle;
    } else if (sidebarTab === "Historial") {
      title = "Historial de Citas";
      subtitle = "Registro de incidencias realizadas";
      icon = BookOpen;
    }

    if (setHeaderData) {
      setHeaderData({
        title,
        subtitle,
        icon,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        onBack,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarTab, setHeaderData]);

  const handleNextStep = () => {
    if (composeStep === 1) {
      if (incidentReason === "Incidencias") {
        setComposeStep(2);
      } else {
        setComposeStep(3); // skip incidents
      }
    } else if (composeStep === 2) {
      setComposeStep(3);
    }
  };

  const handlePrevStep = () => {
    if (composeStep === 3) {
      if (incidentReason === "Incidencias") {
        setComposeStep(2);
      } else {
        setComposeStep(1);
      }
    } else if (composeStep === 2) {
      setComposeStep(1);
    }
  };

  const toggleIncidentSelection = (id: string) => {
    setSelectedIncidentsForCitation((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  const toggleAllIncidents = () => {
    if (selectedIncidentsForCitation.length === dummyIncidentsList.length) {
      setSelectedIncidentsForCitation([]);
    } else {
      setSelectedIncidentsForCitation(dummyIncidentsList.map((i) => i.id));
    }
  };

  const handleRescheduleDateChange = (value: string) => {
    setReschedDate(value);
    setReschedDateError("");
    if (!value) return;
    const [y, m, d] = value.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const day = date.getDay();
    if (day === 0 || day === 6) {
      setReschedDateError(
        "Las citas solo pueden programarse de Lunes a Viernes.",
      );
      setReschedDate("");
    }
  };

  const handleReschedule = () => {
    if (rescheduleModal.citation) {
      setIncidents((prev) =>
        prev.map((c) =>
          c.id === rescheduleModal.citation!.id
            ? {
                ...c,
                status: "waiting",
                scheduledDate: `En proceso para el ${reschedDate} a las ${reschedTime}`,
                reason: reschedReason || c.reason,
              }
            : c,
        ),
      );
      setRescheduleModal({ isOpen: false, citation: null });
    }
  };

  const [currentCalendarDate, setCurrentCalendarDate] = useState(
    new Date(2026, 3, 1),
  );
  const nextCalendarMonth = () =>
    setCurrentCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  const prevCalendarMonth = () =>
    setCurrentCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );

  const calYear = currentCalendarDate.getFullYear();
  const calMonth = currentCalendarDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const monthName = currentCalendarDate.toLocaleString("es-PE", {
    month: "long",
    year: "numeric",
  });

  const getMonthFromName = (dateString: string | undefined) => {
    if (!dateString) return "";
    return dateString.toLowerCase().includes("abril")
      ? "Abril"
      : dateString.toLowerCase().includes("mayo")
        ? "Mayo"
        : dateString.toLowerCase().includes("junio")
          ? "Junio"
          : "";
  };

  const inProcess = incidents.filter((c) => {
    if (
      !(
        c.status === "waiting" ||
        c.status === "confirmed_by_parent" ||
        c.status === "pending"
      )
    )
      return false;
    if (
      filterMonth !== "Todos" &&
      getMonthFromName(c.scheduledDate) !== filterMonth
    )
      return false;
    if (filterReasonList !== "Todos") {
      if (
        filterReasonList === "Incidencias" &&
        !c.reason.toLowerCase().includes("incidencia")
      )
        return false;
      if (
        filterReasonList === "Académico" &&
        !c.reason.toLowerCase().includes("académico") &&
        !c.reason.toLowerCase().includes("academico") &&
        !c.reason.toLowerCase().includes("acad")
      )
        return false;
      if (
        filterReasonList === "Otros" &&
        !c.reason.toLowerCase().includes("otro")
      )
        return false;
    }
    // Assuming c doesn't have grade natively, we mock it via classroom if it matches but usually all belong to classroom
    return true;
  });

  const confirmed = incidents.filter((c) => {
    if (filterStatus === "Confirmadas" && c.status !== "closed") return false;
    if (filterStatus === "Rechazadas" && c.status !== "rejected") return false; // Assuming 'rejected' exists
    if (filterStatus === "Rechazadas" && c.status === "closed") return false;
    if (c.status !== "closed" && c.status !== "rejected") return false;

    if (
      filterMonth !== "Todos" &&
      getMonthFromName(c.scheduledDate) !== filterMonth
    )
      return false;

    if (filterReasonList !== "Todos") {
      if (
        filterReasonList === "Incidencias" &&
        !c.reason.toLowerCase().includes("incidencia")
      )
        return false;
      if (
        filterReasonList === "Académico" &&
        !c.reason.toLowerCase().includes("académico") &&
        !c.reason.toLowerCase().includes("academico") &&
        !c.reason.toLowerCase().includes("acad")
      )
        return false;
      if (
        filterReasonList === "Otros" &&
        !c.reason.toLowerCase().includes("otro")
      )
        return false;
    }
    return true;
  });

  const handleSendCitation = () => {
    if (!selectedStudentToIncident) return;
    const finalReason =
      incidentReason === "Otros"
        ? customIncidentReason || "Otros"
        : incidentReason === "Rendimiento Académico"
          ? "Rendimiento académico"
          : incidentReason === "Incidencias"
            ? "Acumulación de incidencias"
            : incidentReason;

    const newCitation: CitationItem = {
      id: `cite-${Date.now()}`,
      studentId: selectedStudentToIncident.id,
      name: selectedStudentToIncident.name,
      avatarColor: selectedStudentToIncident.avatarColor,
      avatarLetter: selectedStudentToIncident.name.charAt(0),
      reason: finalReason,
      status: "pending",
      theme: incidentReason.includes("Incidencias")
        ? "red"
        : incidentReason === "Otros"
          ? "yellow"
          : "orange",
      scheduledDate:
        schedDate && schedTime
          ? `En proceso para el ${schedDate} a las ${schedTime}`
          : "En proceso (Sin fecha)",
    };
    setIncidents((prev) => [newCitation, ...prev]);
    setIsComposeModalOpen(false);
    setSelectedStudentToCite(null);
    setSchedDate("");
    setSchedTime("");
  };

  const incidentCounts = useMemo(() => {
    const counts: Record<
      string,
      { leve: number; moderado: number; grave: number }
    > = {};
    students.forEach((s, idx) => {
      counts[s.id] = {
        leve: (idx * 3) % 4,
        moderado: (idx * 2) % 3,
        grave: idx % 2 === 0 ? 0 : 1,
      };
    });
    return counts;
  }, [students]);

  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
      <div className="flex flex-col overflow-hidden h-full relative animate-in fade-in slide-in-from-right-4 duration-500 bg-[#EFEAE2] dark:bg-[#0b141a]">
        <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20 gap-4">
          <button onClick={onBack} className="text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                <AlertTriangle className="w-4 h-4 text-slate-500 dark:text-slate-300" />
             </div>
             <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px] truncate">Incidencias</h2>
          </div>
          <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1] shrink-0">
             <button onClick={() => setIsComposeModalOpen(true)} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
               <Plus className="w-5 h-5" />
             </button>
             <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
             <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-w-0 min-h-0 bg-white dark:bg-slate-900">
          {/* Sidebar */}
          <div className="w-full md:w-[260px] border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-slate-800 shrink-0 py-4 sm:py-6 pr-4 overflow-y-auto">
            {/* Compose Button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setIsComposeModalOpen(true);
                  setComposeStep(1);
                  setSelectedStudentToCite(null);
                  setIncidentReason("Incidencias");
                  setSchedDate("");
                  setSchedTime("");
                  setSelectedIncidentsForCitation([]);
                }}
                className="flex items-center gap-3 px-6 py-4 bg-[#c2e7ff] text-[#041e49] hover:bg-[#b5dfff] hover:shadow-md transition-all rounded-r-full w-full shadow-sm shadow-blue-500/10 group"
              >
                <Edit2
                  className="w-5 h-5 fill-[#041e49] text-[#041e49]"
                  strokeWidth={2.5}
                />
                <span className="font-semibold text-[15px]">Redactar</span>
              </button>
            </div>

            <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible custom-scrollbar">
              {[
                {
                  id: "Pendientes",
                  label: "Citas Pendientes",
                  icon: Inbox,
                  count: inProcess.length,
                },
                {
                  id: "Confirmadas",
                  label: "Citas Confirmadas",
                  icon: CheckCircle2,
                  count: confirmed.length,
                },
                {
                  id: "Canceladas",
                  label: "Citas Canceladas",
                  icon: XCircle,
                  count: 0,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSidebarTab(tab.id as any);
                    setSelectedStudentToCite(null);
                  }}
                  className={`flex items-center justify-between px-6 py-3 rounded-r-full font-medium text-[15px] transition-colors w-full group ${sidebarTab === tab.id ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  <div className="flex items-center gap-4">
                    <tab.icon
                      className={`w-5 h-5 shrink-0 transition-colors ${sidebarTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`}
                    />
                    <span className="flex-1 text-left">{tab.label}</span>
                  </div>
                  {tab.count > 0 && (
                    <span
                      className={`text-[13px] font-bold ${sidebarTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content wrapper */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col min-w-0 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800/50">
            {/* Global Filters Bar */}
            <div className="px-6 sm:px-10 pt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                {/* Left side: Reason Tabs */}
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-full xl:max-w-md border border-slate-200 dark:border-slate-700 shadow-sm items-center h-[50px]">
                  <button
                    onClick={() => setFilterReasonList("Todos")}
                    className={`flex-1 h-full font-bold rounded-lg text-[15px] flex justify-center items-center gap-2 transition-colors ${filterReasonList === "Todos" ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow shadow-slate-200/50 dark:shadow-none" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterReasonList("Incidencias")}
                    className={`flex-1 h-full font-bold rounded-lg text-[15px] flex justify-center items-center gap-2 transition-colors ${filterReasonList === "Incidencias" ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow shadow-slate-200/50 dark:shadow-none" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
                  >
                    Incidencias
                  </button>
                  <button
                    onClick={() => setFilterReasonList("Académico")}
                    className={`flex-1 h-full font-bold rounded-lg text-[15px] flex justify-center items-center gap-2 transition-colors ${filterReasonList === "Académico" ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow shadow-slate-200/50 dark:shadow-none" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
                  >
                    Académico
                  </button>
                  <button
                    onClick={() => setFilterReasonList("Otros")}
                    className={`flex-1 h-full font-bold rounded-lg text-[15px] flex justify-center items-center gap-2 transition-colors ${filterReasonList === "Otros" ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow shadow-slate-200/50 dark:shadow-none" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
                  >
                    Otros
                  </button>
                </div>

                {/* Right side: Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <select
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                      className="appearance-none font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-5 pr-12 py-3 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer text-[15px] shadow-sm min-w-[140px]"
                    >
                      <option value="Todos">Todas las Aulas</option>
                      <option value="3°C">Secundaria - 3°C</option>
                      <option value="4°B">Secundaria - 4°B</option>
                      <option value="5°A">Secundaria - 5°A</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="appearance-none font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-5 pr-12 py-3 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer text-[15px] shadow-sm min-w-[140px]"
                    >
                      <option value="Todos">Todos los Meses</option>
                      <option value="Abril">Abril</option>
                      <option value="Mayo">Mayo</option>
                      <option value="Junio">Junio</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10 flex-1 flex flex-col w-full h-full">
              {/* En Proceso List */}
              {sidebarTab === "Pendientes" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-8 w-full pt-2">
                  <div className="flex flex-col gap-4 w-full">
                    {inProcess.map((c) => {
                      const isExpanded = expandedCitations.includes(c.id);
                      let timeStr = "10:00 hrs";
                      let dateStr = "15 Abr";
                      if (c.scheduledDate) {
                        const parts = c.scheduledDate
                          .replace("En proceso para el ", "")
                          .replace("Confirmada para el ", "")
                          .split("a las");
                        if (parts[0]) {
                          dateStr = parts[0].trim();
                          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const dDate = new Date(dateStr);
                            dateStr = `${dDate.getDate()} ${dDate.toLocaleString("es-PE", { month: "short" })}`;
                          } else {
                            dateStr = dateStr
                              .split(",")[0]
                              .replace(" de ", ", ");
                          }
                        }
                        if (parts[1]) timeStr = parts[1].trim() + " hrs";
                      }

                      let badge = null;
                      if (dateStr.includes("20")) {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
                            HOY
                          </span>
                        );
                      }

                      return (
                        <div
                          key={c.id}
                          className="bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700/80 rounded-xl flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all w-full overflow-hidden"
                        >
                          <button
                            onClick={() => toggleCitation(c.id)}
                            className="flex items-center justify-between p-4 sm:px-6 w-full text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${c.avatarColor}`}
                              >
                                {c.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-[#041e49] dark:text-white text-[15px]">
                                  {c.name}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-[12px] mt-0.5">
                                  {c.reason.replace(
                                    /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                    "",
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="hidden sm:flex flex-col items-end">
                                <div className="flex items-center gap-2 mb-0.5">
                                  {badge}
                                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">
                                    {dateStr.replace(/miercoles/i, "Míercoles")}
                                  </span>
                                </div>
                                <span className="text-slate-500 font-medium text-[12px]">
                                  {timeStr}
                                </span>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-6 pb-6 overflow-hidden"
                              >
                                <div className="flex flex-col gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                  <div className="w-full">
                                    <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[130px_1fr] gap-y-4 gap-x-4 items-center">
                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Motivo:
                                      </span>
                                      <div className="flex items-center">
                                        <span
                                          className={`text-[13px] w-fit px-3 py-1.5 rounded-lg font-bold tracking-wide ${c.theme === "yellow" || c.theme === "orange" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : c.theme === "blue" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"}`}
                                        >
                                          {c.reason
                                            .replace(
                                              /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                              "",
                                            )
                                            .charAt(0)
                                            .toUpperCase() +
                                            c.reason
                                              .replace(
                                                /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                                "",
                                              )
                                              .slice(1)}
                                        </span>
                                      </div>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Fecha:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px] whitespace-nowrap">
                                        {c.scheduledDate
                                          ? c.scheduledDate
                                              .replace(
                                                "En proceso para el ",
                                                "",
                                              )
                                              .replace(
                                                "Confirmada para el ",
                                                "",
                                              )
                                              .split(",")[0]
                                              .replace(" de ", ", ")
                                              .replace(
                                                /miercoles/i,
                                                "Míercoles",
                                              )
                                          : "Míercoles 15, Abril"}
                                      </span>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Hora:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">
                                        {c.scheduledDate
                                          ?.split(",")[1]
                                          ?.trim() || "10:00 AM"}
                                      </span>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Docente:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">
                                        Ana Gómez - Matemática
                                      </span>
                                    </div>

                                    {c.incidents && c.incidents.length > 0 && (
                                      <div className="mt-6">
                                        <h4 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                                          Incidencias Vinculadas (
                                          {c.incidents.length})
                                        </h4>
                                        <div className="flex flex-col gap-2">
                                          {c.incidents.map((inc, i) => (
                                            <div
                                              key={i}
                                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl gap-2"
                                            >
                                              <div className="flex flex-col">
                                                <span className="font-bold text-[14px] text-slate-800 dark:text-slate-200">
                                                  {inc.type}
                                                </span>
                                                <span className="text-[12px] text-slate-500 font-medium">
                                                  Reportado por: {inc.teacher}
                                                </span>
                                              </div>
                                              <div className="flex sm:flex-col items-end gap-2 sm:gap-0">
                                                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                                                  {inc.date}
                                                </span>
                                                <span className="text-[12px] text-slate-500">
                                                  {inc.time}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex w-full justify-end gap-3 pt-6 lg:pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                                    <button className="px-6 py-2.5 bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors font-bold text-[14px] flex items-center gap-2 whitespace-nowrap">
                                      Cancelar Cita
                                    </button>
                                    <button
                                      onClick={() => {
                                        setReschedDate("");
                                        setReschedTime("");
                                        setReschedReason("");
                                        setRescheduleModal({
                                          isOpen: true,
                                          citation: c,
                                        });
                                      }}
                                      className="px-6 py-2.5 justify-center bg-indigo-50 dark:bg-indigo-900/20 text-[#5c4ce1] dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-[1.5px] border-indigo-200 dark:border-indigo-800/50 shadow-sm transition-colors font-bold text-[14px] flex items-center gap-2 whitespace-nowrap"
                                    >
                                      Reprogramar
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                  {inProcess.length === 0 && (
                    <p className="text-center text-slate-500 py-12 font-medium">
                      No hay citas en este momento.
                    </p>
                  )}
                </div>
              )}

              {/* Confirmadas List */}
              {sidebarTab === "Confirmadas" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-8 w-full">
                  <div className="flex flex-col gap-4 w-full">
                    {confirmed.map((c) => {
                      const isExpanded = expandedCitations.includes(c.id);
                      let timeStr = "10:00 hrs";
                      let dateStr = "15 Abr";
                      if (c.scheduledDate) {
                        const parts = c.scheduledDate
                          .replace("En proceso para el ", "")
                          .replace("Confirmada para el ", "")
                          .split("a las");
                        if (parts[0]) {
                          dateStr = parts[0].trim();
                          // Format specifically if it's "2026-04-20"
                          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const dDate = new Date(dateStr);
                            dateStr = `${dDate.getDate()} ${dDate.toLocaleString("es-PE", { month: "short" })}`;
                          } else {
                            dateStr = dateStr
                              .split(",")[0]
                              .replace(" de ", ", ");
                          }
                        }
                        if (parts[1]) timeStr = parts[1].trim() + " hrs";
                      }

                      let badge = null;
                      if (dateStr.includes("20")) {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
                            HOY
                          </span>
                        );
                      }

                      return (
                        <div
                          key={c.id}
                          className="bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700/80 rounded-xl flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all w-full overflow-hidden"
                        >
                          <button
                            onClick={() => toggleCitation(c.id)}
                            className="flex items-center justify-between p-4 sm:px-6 w-full text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${c.avatarColor}`}
                              >
                                {c.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-[#041e49] dark:text-white text-[15px]">
                                  {c.name}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-[12px] mt-0.5">
                                  {c.reason.replace(
                                    /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                    "",
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="hidden sm:flex flex-col items-end">
                                <div className="flex items-center gap-2 mb-0.5">
                                  {badge}
                                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">
                                    {dateStr.replace(/miercoles/i, "Míercoles")}
                                  </span>
                                </div>
                                <span className="text-slate-500 font-medium text-[12px]">
                                  {timeStr}
                                </span>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-6 pb-6 overflow-hidden"
                              >
                                <div className="flex flex-col gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                  <div className="w-full">
                                    <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[130px_1fr] gap-y-4 gap-x-4 items-center">
                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Motivo:
                                      </span>
                                      <div className="flex items-center">
                                        <span
                                          className={`text-[13px] w-fit px-3 py-1.5 rounded-lg font-bold tracking-wide bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`}
                                        >
                                          {c.reason
                                            .replace(
                                              /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                              "",
                                            )
                                            .charAt(0)
                                            .toUpperCase() +
                                            c.reason
                                              .replace(
                                                /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                                "",
                                              )
                                              .slice(1)}
                                        </span>
                                      </div>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Fecha:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px] whitespace-nowrap">
                                        {c.scheduledDate
                                          ? c.scheduledDate
                                              .replace(
                                                "En proceso para el ",
                                                "",
                                              )
                                              .replace(
                                                "Confirmada para el ",
                                                "",
                                              )
                                              .split(",")[0]
                                              .replace(" de ", ", ")
                                              .replace(
                                                /miercoles/i,
                                                "Míercoles",
                                              )
                                          : "Míercoles 15, Abril"}
                                      </span>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Hora:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">
                                        {c.scheduledDate
                                          ?.split(",")[1]
                                          ?.trim() || "08:00 AM"}
                                      </span>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Docente:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">
                                        Ana Gómez - Matemática
                                      </span>
                                    </div>

                                    {c.incidents && c.incidents.length > 0 && (
                                      <div className="mt-6">
                                        <h4 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                                          Incidencias Vinculadas (
                                          {c.incidents.length})
                                        </h4>
                                        <div className="flex flex-col gap-2">
                                          {c.incidents.map((inc, i) => (
                                            <div
                                              key={i}
                                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl gap-2"
                                            >
                                              <div className="flex flex-col">
                                                <span className="font-bold text-[14px] text-slate-800 dark:text-slate-200">
                                                  {inc.type}
                                                </span>
                                                <span className="text-[12px] text-slate-500 font-medium">
                                                  Reportado por: {inc.teacher}
                                                </span>
                                              </div>
                                              <div className="flex sm:flex-col items-end gap-2 sm:gap-0">
                                                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                                                  {inc.date}
                                                </span>
                                                <span className="text-[12px] text-slate-500">
                                                  {inc.time}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex w-full justify-end gap-3 pt-6 lg:pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                                    <button
                                      onClick={() => {
                                        window.dispatchEvent(
                                          new CustomEvent("openCalendar", {
                                            detail: { date: c.scheduledDate },
                                          }),
                                        );
                                      }}
                                      className="px-6 py-2.5 bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors font-bold text-[14px] flex items-center gap-2 whitespace-nowrap"
                                    >
                                      <CalendarDays className="w-4 h-4" />{" "}
                                      Calendario
                                    </button>
                                    <button
                                      onClick={() =>
                                        setRealizadoModal({
                                          isOpen: true,
                                          citationId: c.id,
                                        })
                                      }
                                      className="px-6 py-2.5 justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-[1.5px] border-emerald-200 dark:border-emerald-800/50 shadow-sm transition-colors font-bold text-[14px] flex items-center gap-2 whitespace-nowrap"
                                    >
                                      <Check className="w-5 h-5" /> Realizado
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                  {confirmed.length === 0 && (
                    <p className="text-center text-slate-500 py-12 font-medium">
                      No hay citas confirmadas.
                    </p>
                  )}
                </div>
              )}

              {/* Canceladas List */}
              {sidebarTab === "Canceladas" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-8 w-full items-center justify-center pt-20">
                  <div className="bg-rose-50 dark:bg-rose-900/20 w-20 h-20 rounded-full flex items-center justify-center mb-4 border border-rose-100 dark:border-rose-900/50">
                    <XCircle className="w-10 h-10 text-rose-400" />
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-200">
                    No hay citas canceladas
                  </h3>
                  <p className="text-slate-500 font-medium max-w-sm text-center">
                    Las citas que hayan sido rechazadas o canceladas
                    definitivamente se mostrarán aquí.
                  </p>
                </div>
              )}

              {/* Reagendar Modal */}
              <AnimatePresence>
                {rescheduleModal.isOpen && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden w-full max-w-lg flex flex-col"
                    >
                      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-indigo-500" />{" "}
                          Reagendar Citación
                        </h3>
                        <button
                          onClick={() =>
                            setRescheduleModal({
                              isOpen: false,
                              citation: null,
                            })
                          }
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${rescheduleModal.citation?.avatarColor}`}
                          >
                            {rescheduleModal.citation?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight">
                              {rescheduleModal.citation?.name}
                            </p>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">
                              Motivo original:{" "}
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {rescheduleModal.citation?.reason}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                              <CalendarDays className="w-4 h-4 text-indigo-500" />{" "}
                              Nueva fecha
                            </label>
                            <div className="w-full relative z-[60]">
                              <CustomCalendar
                                mode="date"
                                value={reschedDate}
                                onChange={handleRescheduleDateChange}
                                placeholder="Seleccionar Fecha"
                              />
                            </div>
                            {reschedDateError && (
                              <p className="text-xs text-red-500 mt-1.5 font-bold">
                                {reschedDateError}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-indigo-500" />{" "}
                              Nueva hora
                            </label>
                            <div className="relative">
                              <input
                                type="time"
                                value={reschedTime}
                                onChange={(e) => setReschedTime(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm h-[42px]"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Nuevo motivo (Opcional)
                          </label>
                          <input
                            type="text"
                            value={reschedReason}
                            onChange={(e) => setReschedReason(e.target.value)}
                            placeholder="Ej. Cambio de horario a solicitud del padre"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>
                      <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                        <button
                          onClick={() =>
                            setRescheduleModal({
                              isOpen: false,
                              citation: null,
                            })
                          }
                          className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleReschedule}
                          className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-colors flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" /> Guardar y Notificar
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Compose Modal */}
              <AnimatePresence>
                {isComposeModalOpen && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden w-full max-w-[500px] flex flex-col max-h-[90vh]"
                    >
                      {/* Dynamic Header */}
                      <div
                        className={`p-6 border-b flex justify-between items-center ${composeStep === 2 ? "border-indigo-100 dark:border-indigo-800/50 bg-white dark:bg-slate-900 border-b-2" : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"}`}
                      >
                        <h3
                          className={`text-[19px] font-extrabold flex items-center gap-2 ${composeStep === 2 ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-white"}`}
                        >
                          {composeStep === 2 ? (
                            <>
                              <AlertTriangle className="w-5 h-5 text-indigo-600" />{" "}
                              Selección de Incidencias
                            </>
                          ) : (
                            <>
                              <Edit2 className="w-5 h-5 text-indigo-500" />{" "}
                              Generar Citación
                            </>
                          )}
                        </h3>
                        <button
                          onClick={() => {
                            setIsComposeModalOpen(false);
                            setSelectedStudentToCite(null);
                            setComposeStep(1);
                          }}
                          className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
                        >
                          <X className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Step 1: Estudiante y Motivo */}
                      {composeStep === 1 && (
                        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                              Estudiante
                            </label>
                            <div className="relative">
                              <select
                                value={selectedStudentToIncident?.id || ""}
                                onChange={(e) => {
                                  const st = students.find(
                                    (s) => s.id === e.target.value,
                                  );
                                  setSelectedStudentToCite(st || null);
                                }}
                                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                              >
                                <option value="" disabled>
                                  Seleccione un estudiante
                                </option>
                                {students.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[17px] font-extrabold text-slate-900 dark:text-slate-300 mb-4 pt-2">
                              Selecciona el motivo:
                            </label>
                            <div className="flex flex-col gap-3">
                              <button
                                onClick={() => {
                                  if (!selectedStudentToIncident) return;
                                  setIncidentReason("Incidencias");
                                  setComposeStep(2);
                                }}
                                disabled={!selectedStudentToIncident}
                                className="flex items-center justify-between p-4 rounded-[14px] bg-[#fff0f2] border border-[#ffe0e4] hover:bg-[#ffe4e8] transition-colors disabled:opacity-50"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-[#ffd4dd] flex items-center justify-center text-[#9f0f29]">
                                    <AlertTriangle
                                      className="w-[20px] h-[20px]"
                                      strokeWidth={2.5}
                                    />
                                  </div>
                                  <span className="font-extrabold text-[#7a061b] text-[17px]">
                                    Incidencias
                                  </span>
                                </div>
                                <ChevronRight
                                  className="w-5 h-5 text-[#f15e76]"
                                  strokeWidth={2.5}
                                />
                              </button>

                              <button
                                onClick={() => {
                                  if (!selectedStudentToIncident) return;
                                  setIncidentReason("Académico");
                                  setComposeStep(3);
                                }}
                                disabled={!selectedStudentToIncident}
                                className="flex items-center justify-between p-4 rounded-[14px] bg-[#eff9ff] border border-[#d9efff] hover:bg-[#e4f6ff] transition-colors disabled:opacity-50"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-[#cbe9ff] flex items-center justify-center text-[#064289]">
                                    <BookOpen
                                      className="w-[20px] h-[20px]"
                                      strokeWidth={2.5}
                                    />
                                  </div>
                                  <span className="font-extrabold text-[#033166] text-[17px]">
                                    Académico
                                  </span>
                                </div>
                                <ChevronRight
                                  className="w-5 h-5 text-[#62a2eb]"
                                  strokeWidth={2.5}
                                />
                              </button>

                              <button
                                onClick={() => {
                                  if (!selectedStudentToIncident) return;
                                  setIncidentReason("Otros");
                                  setComposeStep(3);
                                }}
                                disabled={!selectedStudentToIncident}
                                className="flex items-center justify-between p-4 rounded-[14px] bg-[#fffce8] border border-[#fff2ba] hover:bg-[#fff9d4] transition-colors disabled:opacity-50"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-[#ffe484] flex items-center justify-center text-[#6e4600]">
                                    <Info
                                      className="w-[20px] h-[20px]"
                                      strokeWidth={2.5}
                                    />
                                  </div>
                                  <span className="font-extrabold text-[#503100] text-[17px]">
                                    Otros
                                  </span>
                                </div>
                                <ChevronRight
                                  className="w-5 h-5 text-[#f4aa24]"
                                  strokeWidth={2.5}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Selección de Incidencias */}
                      {composeStep === 2 && selectedStudentToIncident && (
                        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900/50">
                          <div className="bg-[#f3f4fa] dark:bg-indigo-900/20 border border-transparent p-5 rounded-xl flex items-center gap-4 mb-6">
                            <div
                              className={`w-[52px] h-[52px] rounded-full flex items-center justify-center text-white font-extrabold text-2xl ${selectedStudentToIncident.avatarColor}`}
                            >
                              {selectedStudentToIncident.name.charAt(0)}
                            </div>
                            <div className="flex flex-col justify-center">
                              <p className="font-extrabold text-slate-900 dark:text-white text-[17px] leading-tight mb-0.5">
                                {selectedStudentToIncident.name}
                              </p>
                              <p className="text-[#5252d4] dark:text-indigo-300 font-semibold text-[14px]">
                                Motivo: {incidentReason}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4 px-1">
                            <p className="font-extrabold text-slate-900 dark:text-slate-100 text-[15px]">
                              Seleccionar incidencias a citar
                            </p>
                            <button
                              onClick={toggleAllIncidents}
                              className="text-[#5252d4] dark:text-indigo-400 font-extrabold text-[14px] hover:underline"
                            >
                              Seleccionar todo
                            </button>
                          </div>

                          <div className="flex flex-col gap-3">
                            {dummyIncidentsList.map((inc) => (
                              <label
                                key={inc.id}
                                className="flex items-start gap-4 p-4 border border-slate-200 dark:border-slate-700/50 rounded-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors bg-white dark:bg-slate-800 shadow-sm"
                              >
                                <div className="mt-0.5 relative flex items-center justify-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedIncidentsForCitation.includes(
                                      inc.id,
                                    )}
                                    onChange={() =>
                                      toggleIncidentSelection(inc.id)
                                    }
                                    className="appearance-none peer w-5 h-5 rounded-[4px] border-[1.5px] border-slate-400 checked:border-[#5252d4] checked:bg-[#5252d4] transition-all cursor-pointer hover:border-[#5252d4]"
                                  />
                                  <Check
                                    className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                                    strokeWidth={4}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start gap-3">
                                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-[15px] leading-snug flex-1 break-words">
                                      {inc.type}
                                    </span>
                                    <div className="flex flex-col items-end shrink-0">
                                      <span className="text-[13px] font-bold text-[#8694a3] dark:text-slate-400">
                                        {inc.date}
                                      </span>
                                      <span className="text-[13px] font-bold text-[#8694a3] dark:text-slate-400 mt-0.5">
                                        {inc.time}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-[14px] text-slate-600 dark:text-slate-400 mt-1.5 font-medium">
                                    Registrado por:{" "}
                                    {inc.reporter.replace("Prof. ", "Prof. ")}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Agendar (Fecha/Hora) */}
                      {composeStep === 3 && (
                        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-md ${selectedStudentToIncident?.avatarColor}`}
                              >
                                {selectedStudentToIncident?.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-white text-[15px]">
                                  {selectedStudentToIncident?.name}
                                </p>
                                <p className="text-indigo-600 dark:text-indigo-300 font-semibold text-xs leading-tight">
                                  {incidentReason}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-5 z-20 relative">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                <CalendarDays className="w-4 h-4 text-indigo-500" />{" "}
                                Fecha sugerida
                              </label>
                              <div className="w-full relative z-[60]">
                                <CustomCalendar
                                  mode="date"
                                  value={schedDate}
                                  onChange={setSchedDate}
                                  placeholder="Seleccionar"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-indigo-500" />{" "}
                                Hora sugerida
                              </label>
                              <div className="relative">
                                <input
                                  type="time"
                                  value={schedTime}
                                  onChange={(e) => setSchedTime(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[15px] font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm h-[44px]"
                                  style={{
                                    fontFamily: "'Poppins', sans-serif",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          {incidentReason === "Otros" && (
                            <div>
                              <label className="block text-[13px] font-extrabold text-slate-700 dark:text-slate-300 mb-2.5 mt-2">
                                Motivo de la citación
                              </label>
                              <textarea
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder:text-gray-400 resize-none min-h-[90px]"
                                placeholder="Escriba el detalle del motivo por el cual cita al estudiante..."
                                autoFocus
                                value={customIncidentReason}
                                onChange={(e) =>
                                  setCustomIncidentReason(e.target.value)
                                }
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`p-6 flex justify-[space-evenly] gap-3 bg-slate-50 border-t border-slate-100 dark:bg-slate-900 rounded-b-3xl ${composeStep === 2 && "bg-slate-50 dark:bg-slate-800"}`}
                      >
                        <div
                          className={`flex justify-center ${composeStep === 1 ? "w-full" : "flex-1 flex justify-center"}`}
                        >
                          {composeStep === 2 ? (
                            <button
                              onClick={() => {
                                setIsComposeModalOpen(false);
                                setSelectedStudentToCite(null);
                                setComposeStep(1);
                              }}
                              className="font-extrabold text-[#041e49] dark:text-slate-300 hover:opacity-70 transition-opacity"
                            >
                              Cancelar
                            </button>
                          ) : composeStep === 3 ? (
                            <button
                              onClick={handlePrevStep}
                              className="font-extrabold text-[#041e49] dark:text-slate-300 hover:opacity-70 transition-opacity"
                            >
                              Atrás
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setIsComposeModalOpen(false);
                                setSelectedStudentToCite(null);
                                setComposeStep(1);
                              }}
                              className="font-extrabold text-[#041e49] dark:text-slate-300 hover:opacity-70 transition-opacity"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>

                        {composeStep > 1 && (
                          <div className="flex justify-center flex-1">
                            {composeStep < 3 ? (
                              <button
                                onClick={handleNextStep}
                                disabled={
                                  composeStep === 1 && !selectedStudentToIncident
                                }
                                className="px-8 py-2.5 rounded-xl font-extrabold bg-[#acabf3] text-white hover:bg-indigo-400 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                              >
                                Continuar
                              </button>
                            ) : (
                              <button
                                onClick={handleSendCitation}
                                disabled={!schedDate || !schedTime}
                                className="px-6 py-2.5 rounded-xl font-extrabold bg-[#5c4ce1] text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center w-full"
                              >
                                <Send className="w-4 h-4" /> Enviar Citación
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Realizado Modal */}
              <AnimatePresence>
                {realizadoModal.isOpen && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden w-full max-w-[420px] flex flex-col items-center text-center p-8 pb-10"
                    >
                      <div className="w-[72px] h-[72px] rounded-full bg-[#dcfce7] flex items-center justify-center mb-5">
                        <div className="w-10 h-10 rounded-full border-[2.5px] border-[#0ea5e9] flex items-center justify-center border-emerald-600">
                          <Check
                            className="w-5 h-5 text-emerald-600"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                      <h3 className="text-[22px] font-extrabold text-[#041e49] dark:text-white mb-2 leading-tight">
                        ¿Marcar como realizado?
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-[15px] font-medium px-4 mb-8">
                        Esta acción archivará la citación en el historial
                        permanentemente.
                      </p>

                      <div className="flex gap-4 w-full px-2">
                        <button
                          onClick={() =>
                            setRealizadoModal({
                              isOpen: false,
                              citationId: null,
                            })
                          }
                          className="flex-1 py-3.5 rounded-xl font-extrabold text-[#041e49] dark:text-slate-300 bg-[#f4f6fa] dark:bg-slate-800 hover:bg-[#e2e8f0] transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            const updatedCitations = incidents.map((c) =>
                              c.id === realizadoModal.citationId
                                ? { ...c, status: "closed" as any }
                                : c,
                            );
                            setIncidents(updatedCitations);
                            setRealizadoModal({
                              isOpen: false,
                              citationId: null,
                            });
                          }}
                          className="flex-1 py-3.5 rounded-xl font-extrabold text-white bg-[#059669] hover:bg-emerald-700 shadow-sm transition-colors"
                        >
                          Confirmar
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const StudentsSidebar = ({
  classroom,
  selectedStudent,
  onSelectStudent,
  onBack,
  isLeaderboardOpen,
  onToggleLeaderboard
}: {
  classroom: { level: string; grade: string; section: string };
  selectedStudent: UserItem | null;
  onSelectStudent: (s: UserItem) => void;
  onBack: () => void;
  isLeaderboardOpen?: boolean;
  onToggleLeaderboard?: () => void;
}) => {
  const studentsWithStats = useMemo(() => {
    const base = MOCK_USERS.filter(
      (u) =>
        u.role === "Estudiante" &&
        u.level === classroom.level &&
        u.grade === classroom.grade &&
        u.section === classroom.section,
    );
    return base.map(s => {
       const hash1 = s.name.charCodeAt(0) || 0;
       const hash2 = s.name.charCodeAt(s.name.length - 1) || 0;
       const hash = hash1 + hash2 + (s.id ? parseInt(s.id.slice(-2), 16) || 0 : 0);
       return {
         ...s,
         incidentsCount: hash % 6,
         absencesCount: hash % 4,
         tardiesCount: hash % 5
       }
    })
  }, [classroom]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"name" | "incidents" | "absences" | "tardies">("name");

  const filteredStudents = useMemo(() => {
     let filtered = studentsWithStats.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
     if (sortMode === "name") {
        return filtered.sort((a,b) => a.name.localeCompare(b.name));
     } else if (sortMode === "incidents") {
        return filtered.sort((a,b) => b.incidentsCount - a.incidentsCount || a.name.localeCompare(b.name));
     } else if (sortMode === "absences") {
        return filtered.sort((a,b) => b.absencesCount - a.absencesCount || a.name.localeCompare(b.name));
     } else if (sortMode === "tardies") {
        return filtered.sort((a,b) => b.tardiesCount - a.tardiesCount || a.name.localeCompare(b.name));
     }
     return filtered;
  }, [studentsWithStats, searchQuery, sortMode]);

  useEffect(() => {
     if (!selectedStudent && filteredStudents.length > 0 && !isLeaderboardOpen) {
        onSelectStudent(filteredStudents[0]);
     }
  }, [selectedStudent, filteredStudents, onSelectStudent, isLeaderboardOpen]);

  return (
    <div className={`w-full sm:w-[350px] md:w-[400px] bg-white dark:bg-[#111b21] flex flex-col shrink-0 overflow-hidden border-r border-slate-200 dark:border-slate-800/60 z-10`}>
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-semibold text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-[15px]"
        >
          <ChevronLeft className="w-5 h-5" /> {classroom.grade} {classroom.section}
        </button>
      </div>
      <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-700/50 flex flex-col gap-3 bg-white dark:bg-[#111b21]">

        <div className="relative w-full border-b-[1.5px] border-slate-300 dark:border-slate-600 focus-within:border-slate-900 dark:focus-within:border-slate-300 transition-colors pb-1.5 flex items-center">
          <Search className="w-[18px] h-[18px] text-slate-700 dark:text-slate-300 mr-2" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Buscar alumno"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-[15px] font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-2 mt-1 py-1 overflow-x-auto hidden-scrollbar pb-1">
           <button onClick={() => setSortMode("name")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${sortMode === "name" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}>A-Z</button>
           <button onClick={() => setSortMode("incidents")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${sortMode === "incidents" ? "bg-rose-100 text-rose-700 border-2 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800" : "bg-white text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}><AlertTriangle className="w-3.5 h-3.5" /> Incidencias</button>
           <button onClick={() => setSortMode("absences")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${sortMode === "absences" ? "bg-rose-100 text-rose-700 border-2 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800" : "bg-white text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}><AlertTriangle className="w-3.5 h-3.5" /> Faltas</button>
           <button onClick={() => setSortMode("tardies")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${sortMode === "tardies" ? "bg-amber-100 text-amber-700 border-2 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800" : "bg-white text-slate-600 border border-slate-200 hover:bg-amber-50 hover:text-amber-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}><Clock className="w-3.5 h-3.5" /> Tardanzas</button>
        </div>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto hidden-scrollbar px-4 pt-2 pb-4 bg-white dark:bg-[#111b21] h-full">
         <button
            onClick={onToggleLeaderboard}
            className={`rounded-[20px] p-3 flex items-center gap-3 text-left transition-all group border-2 ${
               isLeaderboardOpen ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-700 ring-1 ring-amber-400/20" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-amber-300 shadow-sm"
            }`}
         >
           <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border transition-colors ${
               isLeaderboardOpen ? "bg-amber-100 border-amber-200 text-amber-600 dark:bg-amber-800/80 dark:border-amber-700 dark:text-amber-400" : "bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-amber-50 group-hover:border-amber-100 group-hover:text-amber-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400"
            }`}>
              <Trophy className="w-6 h-6" />
           </div>
           <div className="flex flex-col min-w-0 flex-1">
              <h4 className={`font-extrabold text-[14px] leading-snug truncate ${
                  isLeaderboardOpen ? "text-amber-700 dark:text-amber-400" : "text-slate-800 dark:text-slate-100 group-hover:text-amber-600"
               }`}>
                 Vista General
              </h4>
           </div>
         </button>
         {filteredStudents.map(student => {
             const isSelected = selectedStudent?.id === student.id && !isLeaderboardOpen;
             const avatar = getStudentAvatarUrl(student);
             return (
               <button
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className={`rounded-[20px] p-3 flex items-center gap-3 text-left transition-all group border-2 ${
                    isSelected ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/20" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-300 shadow-sm"
                  }`}
               >
                 <div className="w-12 h-12 rounded-[14px] bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-600">
                    <img src={avatar} alt={student.name} className="w-[90%] h-[90%] object-contain scale-[1.2]" />
                 </div>
                 <div className="flex flex-col min-w-0 flex-1">
                    <h4 className={`font-extrabold text-[14px] leading-snug truncate ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-slate-100 group-hover:text-blue-600"}`}>
                       {student.name}
                    </h4>
                    {sortMode !== "name" && (
                       <div className="mt-1 flex items-center gap-2">
                           {sortMode === "incidents" && student.incidentsCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full dark:bg-rose-900/30 dark:text-rose-400">
                                 {student.incidentsCount} incidencias
                              </span>
                           )}
                           {sortMode === "absences" && student.absencesCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full dark:bg-rose-900/30 dark:text-rose-400">
                                 {student.absencesCount} faltas
                              </span>
                           )}
                           {sortMode === "tardies" && student.tardiesCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                                 {student.tardiesCount} tardanzas
                              </span>
                           )}
                           {((sortMode === "incidents" && student.incidentsCount === 0) || (sortMode === "absences" && student.absencesCount === 0) || (sortMode === "tardies" && student.tardiesCount === 0)) && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
                                 Sin registro
                              </span>
                           )}
                       </div>
                    )}
                 </div>
                 {sortMode !== "name" && (
                    <div className="shrink-0 text-slate-300 dark:text-slate-600 font-bold text-lg opacity-50 px-1">
                       #{filteredStudents.findIndex(s => s.id === student.id) + 1}
                    </div>
                 )}
               </button>
             )
         })}
      </div>
    </div>
  )
}

export const ClassroomsModule: React.FC<ModuleProps> = ({
  onNavigate,
  onRegisterIncident,
  parentViewStudentId,
  globalDate,
}) => {
  const [selectedClassroom, setSelectedClassroom] = useState<{
    level: string;
    grade: string;
    section: string;
  } | null>(null);

  const [selectedLevel, setSelectedLevel] = useState<string>("Todos");
  const [selectedGrade, setSelectedGrade] = useState<string>("Todos");

  const [selectedStudent, setSelectedStudent] = useState<UserItem | null>(
    () => {
      if (parentViewStudentId) {
        return MOCK_USERS.find((u) => u.id === parentViewStudentId) || null;
      }
      return null;
    },
  );
  const [showHistoryDirectly, setShowHistoryDirectly] = useState(false);
  const [showCitationsDirectly, setShowCitationsDirectly] = useState(false);
  const [showIncidentsDirectly, setShowIncidentsDirectly] = useState(false);
  const [showLeaderboardDirectly, setShowLeaderboardDirectly] = useState(false);

  // Form states for comunicado
  const [isComunicadoModalOpen, setIsComunicadoModalOpen] = useState(false);
  const [comunicadoDestino, setComunicadoDestino] = useState("");
  const [comunicadoMotivo, setComunicadoMotivo] = useState<
    "Urgente" | "Informativo" | "Recordatorio" | ""
  >("");
  const [comunicadoMensaje, setComunicadoMensaje] = useState("");
  const [hideTeacherNameComunicado, setHideTeacherNameComunicado] =
    useState(false);
  const [headerData, setHeaderData] = useState<{
    title?: string;
    subtitle?: string;
    icon?: any;
    onBack?: () => void;
  } | null>(null);

  const handleOpenComunicado = (
    level: string,
    grade: string,
    section: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setComunicadoDestino(`${grade} ${section}`);
    setIsComunicadoModalOpen(true);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full w-full font-poppins overflow-hidden bg-[#EFEAE2] dark:bg-[#0b141a]"
    >
      {/* We make the main wrapper handle the scroll to match DashboardModule */}
      <div className="flex-1 overflow-hidden flex w-full">
        {!parentViewStudentId && null}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-1 w-full min-h-0 overflow-hidden h-full">
            {!headerData && (
              selectedClassroom ? (
                <StudentsSidebar
                    classroom={selectedClassroom}
                    selectedStudent={selectedStudent!}
                    onSelectStudent={(s) => {
                       setSelectedStudent(s);
                       setShowLeaderboardDirectly(false);
                    }}
                    onBack={() => {
                        setSelectedClassroom(null);
                        setSelectedStudent(null);
                        setShowHistoryDirectly(false);
                        setShowCitationsDirectly(false);
                        setShowIncidentsDirectly(false);
                        setShowLeaderboardDirectly(false);
                    }}
                    isLeaderboardOpen={showLeaderboardDirectly || showHistoryDirectly || showIncidentsDirectly || showCitationsDirectly}
                    onToggleLeaderboard={() => {
                       setShowLeaderboardDirectly(true);
                       setSelectedStudent(null);
                    }}
                />
              ) : (
                <ClassroomSidebar
                  selectedLevel={selectedLevel}
                  setSelectedLevel={setSelectedLevel}
                  selectedGrade={selectedGrade}
                  setSelectedGrade={setSelectedGrade}
                  selectedClassroom={selectedClassroom}
                  onSelectClassroom={(c) => {
                    setSelectedClassroom(c);
                    setShowHistoryDirectly(false);
                    setShowCitationsDirectly(false);
                    setShowIncidentsDirectly(false);
                    setShowLeaderboardDirectly(true);
                  }}
                  onActionReportes={() => setShowHistoryDirectly(true)}
                  onActionIncidencias={() => setShowIncidentsDirectly(true)}
                />
              )
            )}
            {(showHistoryDirectly || showIncidentsDirectly || showCitationsDirectly) && selectedClassroom ? (
                 <ClassroomDetail
                    classroom={selectedClassroom}
                    globalDate={globalDate}
                    onBack={() => {
                      setShowHistoryDirectly(false);
                      setShowIncidentsDirectly(false);
                      setShowCitationsDirectly(false);
                      setShowLeaderboardDirectly(true);
                    }}
                    onLevelClick={() => {
                      setSelectedClassroom(null);
                      setShowHistoryDirectly(false);
                      setShowIncidentsDirectly(false);
                      setSelectedGrade("Todos");
                      setSelectedLevel("Todos");
                    }}
                    onGradeClick={() => {
                      setSelectedClassroom(null);
                      setShowHistoryDirectly(false);
                      setShowIncidentsDirectly(false);
                      setShowCitationsDirectly(false);
                    }}
                    onSelectStudent={setSelectedStudent}
                    initialShowHistory={showHistoryDirectly}
                    initialShowCitations={showCitationsDirectly}
                    initialShowIncidents={showIncidentsDirectly}
                    setHeaderData={setHeaderData}
                 />
            ) : (
                <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] relative h-[650px] lg:h-auto z-0 overflow-hidden">
                  {showLeaderboardDirectly && selectedClassroom ? (
                     <ClassroomLeaderboard classroom={selectedClassroom} onReportClick={() => { setSelectedStudent(null); setShowLeaderboardDirectly(false); setShowHistoryDirectly(true); }} />
                  ) : (selectedStudent && selectedClassroom) ? (
                     <StudentDetail
                       student={selectedStudent}
                       onBack={() => {
                           setSelectedStudent(null);
                       }}
                       isParentView={!!parentViewStudentId}
                     />
                  ) : !selectedClassroom ? (
                 <div className="flex-1 flex flex-col overflow-hidden h-full w-full bg-slate-50 dark:bg-[#0b141a]">
                   <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                         <School className="w-4 h-4" />
                       </div>
                       <div>
                         <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Detalles del Aula</h2>
                         <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">Gestión de secciones e información del alumnado</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
                       <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                       <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                     </div>
                   </div>
                   <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                       <div className="bg-white dark:bg-[#111b21] rounded-2xl border border-slate-200/80 dark:border-slate-800/60 p-10 max-w-md w-full shadow-sm flex flex-col items-center">
                           <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5 shadow-sm">
                              <School className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
                              {selectedGrade === "Todos" ? "Selecciona un Grado" : "Selecciona una Sección"}
                           </h2>
                           <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                              {selectedGrade === "Todos"
                                  ? "Navega por los niveles educativos y elige una sección para ver los detalles."
                                 : "Elige una sección en el panel lateral para empezar a visualizar el detalle de los alumnos."}
                           </p>
                       </div>
                   </div>
                 </div>
              ) : (
                 <div className="flex-1 flex justify-center items-center h-full w-full opacity-60">
                   <p className="text-slate-500 font-bold">Cargando detalles...</p>
                 </div>
              )}
            </div>
          )}
          </div>
        </div>

        <AnimatePresence>
          {isComunicadoModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#f8fafd] dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-3 text-[#041e49] dark:text-white">
                    <Megaphone
                      size={24}
                      className="fill-current text-blue-500"
                    />
                    <h3 className="text-xl font-bold">Enviar Comunicado</h3>
                  </div>
                  <button
                    onClick={() => setIsComunicadoModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                  {/* Destinatario */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                    <label className="block text-[12px] font-black text-[#041e49] dark:text-blue-300 uppercase tracking-widest mb-4">
                      Destinatario
                    </label>
                    <div className="relative">
                      <select
                        value={comunicadoDestino}
                        onChange={(e) => setComunicadoDestino(e.target.value)}
                        className="w-full pl-5 pr-12 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 hover:border-orange-400 dark:focus:border-orange-500 rounded-xl text-[15px] font-bold text-slate-800 dark:text-slate-200 appearance-none focus:ring-0 outline-none transition-colors cursor-pointer"
                      >
                        <option value="" disabled>
                          Seleccione un aula...
                        </option>
                        <option value={comunicadoDestino}>
                          {comunicadoDestino}
                        </option>
                        <option value="Todas las Aulas">Todas las Aulas</option>
                        <option value="3° Grado">3° Grado</option>
                        <option value="4° Grado">4° Grado</option>
                        <option value="5° Grado">5° Grado</option>
                      </select>
                      <ChevronDown
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        size={20}
                      />
                    </div>
                  </div>

                  {/* Motivo */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col gap-4">
                    <label className="block text-[12px] font-black text-[#041e49] dark:text-blue-300 uppercase tracking-widest">
                      Motivo del Comunicado
                    </label>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setComunicadoMotivo("Urgente")}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${comunicadoMotivo === "Urgente" ? "border-rose-500/50 bg-rose-50/50 dark:bg-rose-900/10" : "border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-700/50 dark:bg-slate-800/30"}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${comunicadoMotivo === "Urgente" ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" : "bg-white border border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-600"}`}
                        >
                          <AlertTriangle size={20} />
                        </div>
                        <span className="font-bold text-[15px] text-slate-700 dark:text-slate-200">
                          Urgente
                        </span>
                      </button>

                      <button
                        onClick={() => setComunicadoMotivo("Informativo")}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${comunicadoMotivo === "Informativo" ? "border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/10" : "border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-700/50 dark:bg-slate-800/30"}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${comunicadoMotivo === "Informativo" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-white border border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-600"}`}
                        >
                          <Info size={20} />
                        </div>
                        <span className="font-bold text-[15px] text-slate-700 dark:text-slate-200">
                          Informativo
                        </span>
                      </button>

                      <button
                        onClick={() => setComunicadoMotivo("Recordatorio")}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${comunicadoMotivo === "Recordatorio" ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10" : "border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-700/50 dark:bg-slate-800/30"}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${comunicadoMotivo === "Recordatorio" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-white border border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-600"}`}
                        >
                          <Megaphone size={20} />
                        </div>
                        <span className="font-bold text-[15px] text-slate-700 dark:text-slate-200">
                          Recordatorio
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Cuerpo y Preview */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col gap-4">
                    <label className="block text-[12px] font-black text-[#041e49] dark:text-blue-300 uppercase tracking-widest">
                      Cuerpo del Mensaje
                    </label>
                    <textarea
                      value={comunicadoMensaje}
                      onChange={(e) => setComunicadoMensaje(e.target.value)}
                      placeholder="Estimados apoderados, les comunicamos que..."
                      className="w-full p-5 bg-[#f8fafd] dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[15px] font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none min-h-[140px]"
                    />

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          setHideTeacherNameComunicado(
                            !hideTeacherNameComunicado,
                          )
                        }
                        className={`w-11 h-6 rounded-full flex items-center transition-colors relative shrink-0 ${hideTeacherNameComunicado ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute ${hideTeacherNameComunicado ? "translate-x-6" : "translate-x-[4px]"}`}
                        />
                      </button>
                      <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                        Ocultar nombre del docente en el mensaje
                      </span>
                    </div>

                    <div className="w-full bg-[#efeae2] dark:bg-[#0b141a] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col shrink-0 relative overflow-hidden mt-6 shadow-sm">
                      <div className="bg-[#075e54] dark:bg-[#202c33] px-3 py-2 flex items-center gap-3 z-20 shrink-0 shadow-md">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-white/50">
                          <img
                            src={APP_CONFIG.schoolLogo}
                            alt="Logo"
                            className="w-full h-full object-cover scale-[1.7]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-semibold text-[14px] leading-tight flex items-center gap-1">
                            Asistencia Ricardo Palma Secundaria
                            <CheckCircle2
                              className="w-3.5 h-3.5 text-[#53bdeb] ml-0.5"
                              strokeWidth={3}
                            />
                          </span>
                          <span className="text-white/80 text-[11px] leading-tight mt-0.5">
                            Chatbot
                          </span>
                        </div>
                      </div>

                      <div
                        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.06] pointer-events-none mt-[54px] z-0"
                        style={{
                          backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                          backgroundSize: "400px",
                        }}
                      ></div>

                      <div className="p-4 flex flex-col gap-3 relative z-10 custom-scrollbar pb-6 max-h-[350px] overflow-y-auto w-full">
                        <div className="self-center bg-[#E1F3FB] dark:bg-[#182229] text-slate-500 dark:text-slate-400 text-[11px] font-medium px-3 py-1 rounded-md shadow-sm mb-2 uppercase tracking-wide">
                          Hoy
                        </div>

                        <div className="bg-white dark:bg-[#202c33] rounded-lg rounded-tl-none p-2 shadow-sm max-w-[92%] relative z-10 text-left self-start">
                          <svg
                            viewBox="0 0 8 13"
                            width="8"
                            height="13"
                            className="absolute -left-[8px] top-0 text-white dark:text-[#202c33]"
                          >
                            <path
                              fill="currentColor"
                              d="M1.533,3.568L8,12.193V1H2.812C1.042,1,0.474,2.156,1.533,3.568z"
                            ></path>
                          </svg>

                          <div className="text-[14px] leading-[1.35] whitespace-pre-wrap break-words text-[#111b21] dark:text-[#e9edef] p-1 pb-4 relative">
                            {comunicadoMotivo && (
                              <p className="font-bold flex items-center gap-2 mb-2">
                                {comunicadoMotivo === "Urgente"
                                  ? "⚠️"
                                  : comunicadoMotivo === "Informativo"
                                    ? "ℹ️"
                                    : "🔔"}{" "}
                                Comunicado {comunicadoMotivo}
                              </p>
                            )}
                            <p
                              className={`${comunicadoMensaje ? "text-[#111b21] dark:text-[#e9edef]" : "text-slate-400 dark:text-slate-500 italic"}`}
                            >
                              {comunicadoMensaje ||
                                "Redacte su mensaje en el campo superior..."}
                            </p>

                            {comunicadoMensaje && (
                              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/50 text-[13.5px]">
                                <p>Atentamente,</p>
                                {!hideTeacherNameComunicado && (
                                  <p className="font-bold mt-1">
                                    Carlos Mendoza
                                  </p>
                                )}
                                <p
                                  className={`${hideTeacherNameComunicado ? "font-bold mt-1" : "italic opacity-80 text-[12.5px]"}`}
                                >
                                  Docente del curso de DPCC
                                </p>
                              </div>
                            )}
                            <div className="absolute bottom-0 right-0 text-[11px] text-[#667781] dark:text-[#8696a0] font-medium mt-1.5 flex justify-end items-center gap-1 pb-0.5">
                              {new Date().toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
                  <button
                    onClick={() => setIsComunicadoModalOpen(false)}
                    className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    className={`flex items-center gap-2 font-bold px-8 py-3 rounded-xl transition-all ${comunicadoDestino && comunicadoMotivo && comunicadoMensaje ? "bg-[#c2e7ff] text-[#041e49] hover:bg-[#b5dfff] hover:shadow-md dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500" : "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"}`}
                    disabled={
                      !comunicadoDestino ||
                      !comunicadoMotivo ||
                      !comunicadoMensaje
                    }
                  >
                    <Send size={18} />
                    <span>Enviar</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const ClassroomSidebar: React.FC<{
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedClassroom: any;
  onSelectClassroom: (c: { level: string; grade: string; section: string } | null) => void;
  onActionReportes?: () => void;
  onActionIncidencias?: () => void;
  onActionComunicados?: () => void;
}> = ({ selectedLevel, setSelectedLevel, selectedGrade, setSelectedGrade, selectedClassroom, onSelectClassroom, onActionReportes, onActionIncidencias, onActionComunicados }) => {
  const [contextMenu, setContextMenu] = useState<{ section: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`w-full sm:w-[350px] md:w-[400px] bg-white dark:bg-[#111b21] flex flex-col shrink-0 overflow-hidden border-r border-slate-200 dark:border-slate-800/60 z-10 ${selectedClassroom ? 'hidden lg:flex' : 'flex'}`}>
      {selectedLevel === "Todos" ? (
        <>
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                <School className="w-5 h-5" />
              </div>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Niveles Educativos</h1>
            </div>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto hidden-scrollbar px-4 pt-4 pb-4 bg-white dark:bg-[#111b21] h-full">
            {/* Primaria (Proximamente) */}
            <button
               disabled
               className="bg-slate-100 dark:bg-slate-800/40 opacity-70 cursor-not-allowed rounded-[24px] border-2 border-slate-200 dark:border-slate-700/50 p-5 flex flex-row items-center gap-5 text-left shadow-sm transition-all group relative"
            >
               <div className="absolute top-3 right-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Próximamente
               </div>
               <div className="w-16 h-16 shrink-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[16px] grayscale">
                  <img
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Backpack.png"
                    alt="primaria"
                    className="w-[40px] h-[40px] object-contain drop-shadow-sm"
                  />
               </div>
               <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <h4 className="font-extrabold text-[#1A2642] dark:text-white text-[18px] mb-1">
                    Primaria
                  </h4>
                  
               </div>
            </button>
            {/* Secundaria */}
            <button
              onClick={() => setSelectedLevel("Secundaria")}
              className="bg-blue-50/80 dark:bg-blue-900/20 rounded-[24px] border-2 border-blue-100/50 dark:border-blue-800/30 p-5 flex flex-row items-center gap-5 text-left shadow-sm hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="w-16 h-16 shrink-0 transition-transform group-hover:scale-110 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[16px]">
                  <img
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Graduation%20Cap.png"
                    alt="secundaria"
                    className="w-[40px] h-[40px] object-contain drop-shadow-sm"
                  />
              </div>
              <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <h4 className="font-extrabold text-[#1A2642] dark:text-white text-[18px] mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Secundaria
                  </h4>
                  <div className="flex flex-col text-[14px] text-blue-600/80 dark:text-blue-400 font-bold leading-tight mt-0.5 space-y-0.5">
                    <span className="flex items-center">5 Grados</span>
                    <span className="flex items-center">34 Secciones</span>
                  </div>
              </div>
            </button>
          </div>
        </>
      ) : selectedGrade === "Todos" ? (
        <>
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60">
            <button
              onClick={() => setSelectedLevel("Todos")}
              className="flex items-center gap-2 font-semibold text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-[15px]"
            >
              <ChevronLeft className="w-5 h-5" /> Niveles Educativos
            </button>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto hidden-scrollbar px-4 pt-4 pb-4 bg-white dark:bg-[#111b21] h-full">
            {Object.keys(EDUCATIONAL_STRUCTURE[selectedLevel] || {}).map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className="bg-blue-50/80 dark:bg-blue-900/20 rounded-[24px] border-2 border-blue-100/50 dark:border-blue-800/30 p-5 flex flex-row items-center gap-5 text-left shadow-sm hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 shrink-0 transition-transform group-hover:scale-110 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[16px]">
                  <img
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Books.png"
                    alt="books"
                    className="w-[40px] h-[40px] object-contain drop-shadow-sm"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <h4 className="font-extrabold text-[#1A2642] dark:text-white text-[18px] mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {grade}
                  </h4>
                  <div className="flex flex-col text-[14px] text-blue-600/80 dark:text-blue-400 font-bold leading-tight mt-0.5 space-y-0.5">
                    <span className="flex items-center">Alumnos: {((EDUCATIONAL_STRUCTURE[selectedLevel][grade]?.length || 0) * 30)}</span>
                    <span className="flex items-center">Docentes: 7 • Aux: 2</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 border-b border-slate-200 dark:border-slate-700/50 -mx-4 -mt-4 mb-4 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedGrade("Todos");
                onSelectClassroom(null);
              }}
              className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-[15px]"
            >
              <ChevronLeft className="w-5 h-5" /> {selectedGrade}
            </button>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto hidden-scrollbar px-4 pt-4 pb-4 bg-white dark:bg-[#111b21] h-full">
            {Array.isArray(EDUCATIONAL_STRUCTURE[selectedLevel]?.[selectedGrade]) && EDUCATIONAL_STRUCTURE[selectedLevel][selectedGrade].map((section, idx) => {
              const isSelected =
                selectedClassroom?.section === section && selectedClassroom?.grade === selectedGrade && selectedClassroom?.level === selectedLevel;
              return (
                <div key={section} className="flex flex-col gap-2 relative">
                  <button
                    onClick={() =>
                      onSelectClassroom({ level: selectedLevel, grade: selectedGrade, section })
                    }
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ section, x: e.clientX, y: e.clientY });
                    }}
                    className={`rounded-[24px] border-2 p-5 flex flex-row items-center gap-5 text-left shadow-sm transition-all group ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/20"
                        : "bg-blue-50/80 dark:bg-blue-900/20 border-blue-100/50 dark:border-blue-800/30 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className={`w-16 h-16 shrink-0 transition-transform group-hover:scale-110 flex items-center justify-center rounded-[16px] bg-white/50 dark:bg-slate-900/50`}>
                      <img
                        src={`https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/${["Blue%20Book.png", "Green%20Book.png", "Orange%20Book.png", "Closed%20Book.png"][idx % 4]}`}
                        alt="book"
                        className="w-[40px] h-[40px] object-contain drop-shadow-sm"
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                      <h4
                        className={`font-extrabold text-[#1A2642] dark:text-white text-[18px] mb-1 transition-colors ${
                          isSelected ? "text-blue-700 dark:text-blue-400" : "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        }`}
                      >
                        {selectedGrade.replace("° Grado", "°")} {section}
                      </h4>
                      <div className="flex flex-col text-[14px] text-blue-600/80 dark:text-blue-400 font-bold leading-tight mt-0.5 space-y-0.5">
                        <span className="flex items-center w-full">Alumnos: 30</span>
                        <span className="flex items-center w-full truncate w-[100%] leading-tight text-[13px]">Tutor: Asignado</span>
                      </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {contextMenu?.section === section && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-[80%] left-10 z-50 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            onSelectClassroom({ level: selectedLevel, grade: selectedGrade, section });
                            if (onActionReportes) onActionReportes();
                            setContextMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/File%20Folder.png" alt="Reportes" className="w-[16px] h-[16px]" /> Reportes
                        </button>
                        <button
                          onClick={() => {
                            onSelectClassroom({ level: selectedLevel, grade: selectedGrade, section });
                            if (onActionIncidencias) onActionIncidencias();
                            setContextMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Open%20Mailbox%20with%20Raised%20Flag.png" alt="Incidencias" className="w-[16px] h-[16px]" /> Incidencias
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const getScopedReportsHistory = (
  classroom: {
    level: string;
    grade: string;
    section: string;
  },
  globalDate?: Date,
) => {
  const reports: ReportHistoryItem[] = [];
  let id = 1;
  const REPORT_TYPES = ["Diario", "Semanal", "Mensual", "Bimestral"];

  const realNow = new Date();
  const year = realNow.getFullYear();

  REPORT_TYPES.forEach((type) => {
    if (type === "Diario") {
      let curr = new Date(year, 2, 1);
      const endNode = new Date(year, 11, 31);
      while (curr <= endNode) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) {
          const currentDay = new Date(curr);
          const cYear = currentDay.getFullYear();
          const cMonth = currentDay.toLocaleDateString("es-ES", {
            month: "long",
          });
          const cCapMonth = cMonth.charAt(0).toUpperCase() + cMonth.slice(1);
          const cDayName = currentDay.toLocaleDateString("es-ES", {
            weekday: "long",
          });
          const cCapDayName =
            cDayName.charAt(0).toUpperCase() + cDayName.slice(1);
          const cDayDate = `${currentDay.getDate()} de ${cCapMonth} ${cYear}`;

          const isFuture =
            new Date(
              currentDay.getFullYear(),
              currentDay.getMonth(),
              currentDay.getDate(),
            ) >
            new Date(
              realNow.getFullYear(),
              realNow.getMonth(),
              realNow.getDate(),
            );

          reports.push({
            id: id++,
            type,
            title: `Reporte Diario - ${cCapDayName} ${currentDay.getDate()}`,
            date: cDayDate,
            level: classroom.level,
            grade: classroom.grade,
            section: classroom.section,
            size: isFuture ? "-" : `${(Math.random() * 1 + 0.5).toFixed(1)} MB`,
            progress: 100,
            status: isFuture ? "pending" : "generated",
            targetDate: currentDay,
          });
        }
        curr.setDate(curr.getDate() + 1);
      }
    } else if (type === "Semanal") {
      for (let m = 2; m <= 11; m++) {
        const d = new Date(year, m, 1);
        const monthNameStr = d.toLocaleDateString("es-ES", { month: "long" });
        const capMonth =
          monthNameStr.charAt(0).toUpperCase() + monthNameStr.slice(1);

        for (let i = 1; i <= 4; i++) {
          const startDay = (i - 1) * 7 + 1;
          const endDay = i * 7;
          const weekStartDate = new Date(year, m, startDay);
          const isFuture =
            new Date(
              weekStartDate.getFullYear(),
              weekStartDate.getMonth(),
              weekStartDate.getDate(),
            ) >
            new Date(
              realNow.getFullYear(),
              realNow.getMonth(),
              realNow.getDate(),
            );

          reports.push({
            id: id++,
            type,
            title: `Semana ${i} - ${capMonth}`,
            date: `${startDay} - ${endDay} de ${capMonth}`,
            level: classroom.level,
            grade: classroom.grade,
            section: classroom.section,
            size: isFuture ? "-" : `${(Math.random() * 2 + 1).toFixed(1)} MB`,
            progress: 100,
            status: isFuture ? "pending" : "generated",
            targetDate: weekStartDate,
          });
        }
      }
    } else if (type === "Mensual") {
      for (let m = 2; m <= 11; m++) {
        const d = new Date(year, m, 1);
        const monthNameStr = d.toLocaleDateString("es-ES", { month: "long" });
        const capMonth =
          monthNameStr.charAt(0).toUpperCase() + monthNameStr.slice(1);
        const isFuture =
          new Date(year, m, 1) >
          new Date(realNow.getFullYear(), realNow.getMonth(), 1);

        reports.push({
          id: id++,
          type,
          title: `Reporte Mensual - ${capMonth}`,
          date: `${capMonth} ${year}`,
          level: classroom.level,
          grade: classroom.grade,
          section: classroom.section,
          size: isFuture ? "-" : `${(Math.random() * 3 + 2).toFixed(1)} MB`,
          progress: 100,
          status: isFuture ? "pending" : "generated",
          targetDate: d,
        });
      }
    } else if (type === "Bimestral") {
      const bimesters = [
        { title: "I Bimestre (Marzo - Mayo)", month: 2 },
        { title: "II Bimestre (Mayo - Julio)", month: 4 },
        { title: "III Bimestre (Agosto - Octubre)", month: 7 },
        { title: "IV Bimestre (Octubre - Diciembre)", month: 9 },
      ];

      bimesters.forEach((b) => {
        const d = new Date(year, b.month, 1);
        const isFuture =
          new Date(year, b.month, 1) >
          new Date(realNow.getFullYear(), realNow.getMonth(), 1);
        reports.push({
          id: id++,
          type,
          title: b.title,
          date: `Bimestre ${year}`,
          level: classroom.level,
          grade: classroom.grade,
          section: classroom.section,
          size: isFuture ? "-" : `${(Math.random() * 5 + 3).toFixed(1)} MB`,
          progress: 100,
          status: isFuture ? "pending" : "generated",
          targetDate: d,
        });
      });
    }
  });
  return reports;
};

const ClassroomReportsHistory: React.FC<{
  classroom: { level: string; grade: string; section: string };
  globalDate?: Date;
  onBack: () => void;
  setHeaderData: React.Dispatch<
    React.SetStateAction<{
      title?: string;
      subtitle?: string;
      icon?: any;
      onBack?: () => void;
    } | null>
  >;
  onDownloadReport: (
    type: "Asistencia" | "Incidencias",
    period: "Día" | "Semana" | "Mes" | "Bimestre",
    month?: number,
    bimestre?: number,
  ) => void;
}> = ({ classroom, globalDate, onBack, setHeaderData, onDownloadReport }) => {
  const [historyPath, setHistoryPath] = useState<string[]>([]);
  const [previewReport, setPreviewReport] = useState<ReportHistoryItem | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const week = Math.ceil(
      Math.floor(
        (d.getTime() - new Date(year, 0, 1).getTime()) / (24 * 60 * 60 * 1000),
      ) / 7,
    );
    return `${year}-W${week.toString().padStart(2, "0")}`;
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedBimestre, setSelectedBimestre] = useState("1");

  const scopedReports = useMemo(
    () => getScopedReportsHistory(classroom, globalDate),
    [classroom, globalDate],
  );

  const currentFolderContent = useMemo(() => {
    if (historyPath.length === 0) {
      return {
        type: "folders",
        items: ["Diario", "Semanal", "Mensual", "Bimestral"],
      };
    }

    const currentFolder = historyPath[historyPath.length - 1];
    let filteredFiles = scopedReports.filter((r) => r.type === currentFolder);

    return {
      type: "files",
      items: filteredFiles,
    };
  }, [historyPath, scopedReports]);

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

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
    setHeaderData({
      title:
        historyPath.length > 0
          ? `Reportes ${
              historyPath[0] === "Diario"
                ? "Diarios"
                : historyPath[0] === "Semanales"
                  ? "Semanales"
                  : historyPath[0] === "Mensual"
                    ? "Mensuales"
                    : "Bimestrales"
            }`
          : "Historial de Reportes",
      subtitle:
        historyPath.length > 0
          ? historyPath.join(" / ")
          : "Registro completo de asistencia e incidencias del aula",
      // eslint-disable-next-line react-hooks/exhaustive-deps
      onBack: historyPath.length > 0 ? () => setHistoryPath([]) : onBack,
      icon: BookOpen,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPath, setHeaderData]);

  return (
    <>
      <div className={`w-full lg:w-[320px] xl:w-[340px] shrink-0 flex flex-col h-[600px] lg:h-full bg-white dark:bg-[#111b21] border-r border-slate-200 dark:border-slate-800/60 z-10 animate-in fade-in slide-in-from-left-4 duration-500`}>
         <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col hidden-scrollbar px-4 pt-4 pb-4">
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Reportes</h1>
            </div>
          </div>
         <div className="flex flex-col gap-3">
             {["Diario", "Semanal", "Mensual", "Bimestral"].map((folderName) => {
                 const style = getFolderStyle(folderName, false);
                 const isActive = historyPath[0] === folderName;
                 return (
                     <button
                         key={folderName}
                         onClick={() => setHistoryPath([folderName])}
                         className={`bg-orange-50/80 dark:bg-orange-900/20 rounded-[24px] border-2 p-5 flex flex-row items-center gap-5 text-left shadow-sm hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md transition-all group ${isActive ? "border-orange-400 dark:border-orange-500 ring-1 ring-orange-400/20" : "border-orange-100/50 dark:border-orange-800/30"}`}
                     >
                        <div className={`w-16 h-16 shrink-0 transition-transform flex items-center justify-center rounded-[16px] ${isActive ? "scale-110 bg-white/60 dark:bg-slate-900/60" : "group-hover:scale-110 bg-white/40 dark:bg-slate-900/40"}`}>
                           <img src={`https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/${isActive ? 'open-file-folder' : 'file-folder'}.svg`} alt="Folder" className="w-[40px] h-[40px] object-contain drop-shadow-sm" />
                        </div>
                        <div className="flex flex-col flex-1 w-full justify-center">
                             <h4 className={`font-extrabold text-[18px] mb-1.5 transition-colors ${isActive ? "text-orange-700 dark:text-orange-400" : "text-[#1A2642] dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400"}`}>{folderName}</h4>
                             <p className="text-[14px] text-orange-600/80 dark:text-orange-400 font-bold leading-tight truncate">{style.subtitle}</p>
                        </div>
                     </button>
                 )
             })}
         </div>
         </div>
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 relative h-[650px] lg:h-auto bg-[#EFEAE2] dark:bg-[#0b141a] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 shadow-sm z-20">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px]">Detalle de Reportes</h2>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
              <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </div>
        </div>
        <div className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto custom-scrollbar">
            {historyPath.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8">
                     <div className="w-32 h-32 mb-6 opacity-80 transition-transform hover:scale-105 duration-500">
                         <img src="https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/open-file-folder.svg" alt="Folder" className="w-full h-full object-contain filter drop-shadow-xl saturate-150" />
                     </div>
                     <h2 className="text-[24px] font-black text-slate-800 dark:text-white mb-3 tracking-tight">Selecciona una Carpeta</h2>
                     <p className="text-slate-500 dark:text-slate-400 text-[15px] font-medium max-w-md mx-auto leading-relaxed">Navega por las carpetas en la barra lateral para ver los reportes de asistencia e incidencias según el periodo deseado.</p>
                 </div>
            ) : (
              <div className="mt-1 h-full flex flex-col">
                {/* File List */}

                {currentFolderContent.items &&
                currentFolderContent.items.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800/40 rounded-[24px] p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <h3 className="text-[18px] font-black text-slate-800 dark:text-emerald-100 flex items-center gap-3 mb-5 tracking-tight">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg"
                            alt="Excel"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        Reportes de Asistencia
                      </h3>
                      <ScrollableReportList
                        items={currentFolderContent.items}
                        type="asistencia"
                        historyPath={historyPath}
                        onPreview={setPreviewReport}
                      />
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-800/40 rounded-[24px] p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <h3 className="text-[18px] font-black text-slate-800 dark:text-rose-100 flex items-center gap-3 mb-5 tracking-tight">
                        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center border border-rose-100 dark:border-rose-800/50">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg"
                            alt="Word"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        Reporte de Incidencias
                      </h3>
                      <ScrollableReportList
                        items={currentFolderContent.items}
                        type="incidencias"
                        historyPath={historyPath}
                        onPreview={() => {
                          alert("Vista previa del anexo de incidencias");
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px]">
                    <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700/50">
                      <FileText size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-[18px] font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                      No hay reportes
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[14px] max-w-sm">
                      No se encontraron reportes para la carpeta seleccionada en este salón.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {previewReport && (
              <ReportPreviewModal
                report={previewReport}
                onClose={() => setPreviewReport(null)}
              />
            )}
          </AnimatePresence>
      </div>
    </>
  );
};

export type CitationStatus =
  | "pending"
  | "waiting"
  | "confirmed_by_parent"
  | "closed";

export interface CitationItem {
  id: string;
  name: string;
  studentId?: string;
  avatarLetter: string;
  avatarColor: string;
  reason: string;
  theme: "yellow" | "orange" | "red" | "blue";
  status: CitationStatus;
  scheduledDate?: string;
  incidents?: { type: string; date: string; time: string; teacher: string }[];
}

export const INITIAL_CITATIONS: CitationItem[] = [
  {
    id: "c1",
    name: "Luciana Delgado Ramos",
    avatarLetter: "L",
    avatarColor: "bg-teal-600",
    reason: "Incidencias - Acumulación de 5 incidencias leves",
    theme: "yellow",
    status: "pending",
    scheduledDate: "En proceso para el 2026-04-20 a las 10:00",
    incidents: [
      {
        type: "Uso de joyas",
        date: "10/04/2026",
        time: "08:15",
        teacher: "Ana Rojas",
      },
      {
        type: "Uso de celular",
        date: "11/04/2026",
        time: "11:30",
        teacher: "Carlos Mendoza",
      },
      {
        type: "Uñas pintadas",
        date: "12/04/2026",
        time: "10:00",
        teacher: "Ana Rojas",
      },
      {
        type: "Falta de aseo personal",
        date: "14/04/2026",
        time: "09:45",
        teacher: "Luis Ramirez",
      },
      {
        type: "Uniforme incompleto",
        date: "15/04/2026",
        time: "12:20",
        teacher: "Ana Rojas",
      },
    ],
  },
  {
    id: "c2",
    name: "Nicolas Mendoza Sanchez",
    avatarLetter: "N",
    avatarColor: "bg-rose-500",
    reason: "Incidencias - Acumulación de 3 incidencias moderadas",
    theme: "orange",
    status: "waiting",
    scheduledDate: "En proceso para el 2026-04-20 a las 15:30",
  },
  {
    id: "c3",
    name: "Luana Gutierrez Ramos",
    avatarLetter: "L",
    avatarColor: "bg-rose-500",
    reason: "Incidencias - 4 incidencias leves reportadas (En límite)",
    theme: "orange",
    status: "confirmed_by_parent",
    scheduledDate: "Confirmada para el 2026-04-20 a las 15:30",
  },
  {
    id: "c4",
    name: "Catalina Chavez Paredes",
    avatarLetter: "C",
    avatarColor: "bg-purple-500",
    reason: "Incidencias - 1 incidencia grave reportada",
    theme: "red",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-20 a las 15:30",
  },
  {
    id: "c5",
    name: "Diego Ramos Vargas",
    avatarLetter: "D",
    avatarColor: "bg-blue-600",
    reason: "Incidencias - Conducta reiterativa",
    theme: "yellow",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-21 a las 09:00",
  },
  {
    id: "c6",
    name: "Valentina Ruiz",
    avatarLetter: "V",
    avatarColor: "bg-emerald-600",
    reason: "Académico - Bajo rendimiento académico",
    theme: "orange",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-22 a las 10:30",
  },
  {
    id: "c7",
    name: "Santiago Silva",
    avatarLetter: "S",
    avatarColor: "bg-indigo-600",
    reason: "Otros - Faltas injustificadas",
    theme: "red",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-24 a las 11:00",
  },
  {
    id: "c8",
    name: "María Fernanda Lopez",
    avatarLetter: "M",
    avatarColor: "bg-pink-600",
    reason: "Otros - Problemas de convivencia",
    theme: "red",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-05 a las 08:30",
  },
  {
    id: "c9",
    name: "Joaquin Perez Rey",
    avatarLetter: "J",
    avatarColor: "bg-sky-600",
    reason: "Incidencias - Uso inadecuado de tablet",
    theme: "orange",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-12 a las 10:00",
  },
  {
    id: "c10",
    name: "Valeria Gomez Torre",
    avatarLetter: "V",
    avatarColor: "bg-amber-600",
    reason: "Académico - Falta a clase virtual",
    theme: "blue",
    status: "pending",
    scheduledDate: "En proceso para el 2026-04-25 a las 16:00",
  },
  {
    id: "c11",
    name: "Sebastián Diaz",
    avatarLetter: "S",
    avatarColor: "bg-lime-600",
    reason: "Académico - Falta de tareas",
    theme: "blue",
    status: "waiting",
    scheduledDate: "En proceso para el 2026-04-26 a las 12:00",
  },
  {
    id: "c12",
    name: "Carla Pineda",
    avatarLetter: "C",
    avatarColor: "bg-cyan-600",
    reason: "Incidencias - Evasión de clases",
    theme: "red",
    status: "pending",
    scheduledDate: "En proceso para el 2026-04-22 a las 11:30",
    incidents: [
      {
        type: "Fuga de aula",
        date: "16/04/2026",
        time: "11:20",
        teacher: "Marta Díaz",
      },
    ],
  },
  {
    id: "c13",
    name: "Matias Cardenas",
    avatarLetter: "M",
    avatarColor: "bg-fuchsia-600",
    reason: "Académico - Falta de entrega de proyectos asignados",
    theme: "blue",
    status: "waiting",
    scheduledDate: "En proceso para el 2026-04-23 a las 09:15",
  },
];

const getFluentClassroomIcon = (section: string) => {
  const hash = section.charCodeAt(0) % 5;
  const icons = [
    "blue-book.svg",
    "green-book.svg",
    "orange-book.svg",
    "closed-book.svg",
    "open-book.svg",
  ];
  return icons[hash];
};

const ClassroomDetail: React.FC<{
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

  useEffect(() => {
    setShowReportsHistory(initialShowHistory);
    setShowCitationsPanel(initialShowCitations);
    setShowIncidentsPanel(initialShowIncidents);
  }, [initialShowHistory, initialShowCitations, initialShowIncidents]);

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
    let filtered = students.filter((s) =>
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
      <CitationsPanel
        classroom={classroom}
        students={students}
        tutor={tutor}
        citations={citationsList}
        setCitations={setCitationsList}
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
      <IncidenciasPanel
        classroom={classroom}
        students={students}
        tutor={tutor}
        incidents={incidentsList}
        setIncidents={setIncidentsList}
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





const StudentDetail: React.FC<{
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

  // Reset page when month changes
  useEffect(() => {
    setIncidentsPage(1);
  }, [selectedMonth]);

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
          `${student.lastName} ${student.firstName}`.toUpperCase(),
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

    doc.save(
      `Reporte_${reportType}_${student.firstName}_${student.lastName}.pdf`,
    );
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
                                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${incident.signatureStatus === "Confirmado por el padre" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                                    >
                                      {incident.signatureStatus ===
                                      "Confirmado por el padre" ? (
                                        <CheckCircle2 className="w-3 h-3" />
                                      ) : (
                                        <Clock className="w-3 h-3" />
                                      )}
                                      {incident.signatureStatus ===
                                      "Confirmado por el padre"
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
                                    "Confirmado por el padre" && (
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
                              ?.status === "Confirmado por el padre" ? (
                              <div className="flex items-center justify-center gap-2 py-2 text-[#075e54] font-medium text-sm">
                                <Check className="w-4 h-4" /> Confirmado por el
                                padre
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setShowWebhookSimulation(true);
                                  setTimeout(() => {
                                    setIncidentSignatures((prev) => ({
                                      ...prev,
                                      [parentViewIncident.id]: {
                                        status: "Confirmado por el padre",
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
                          "Confirmado por el padre" && (
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
                              <span className="text-blue-400">
                                {Math.floor(Date.now() / 1000)}
                              </span>
                            </p>
                            <p className="pl-4">{"}"}</p>
                            <p>{"}"}</p>

                            {incidentSignatures[parentViewIncident.id]
                              ?.status === "Confirmado por el padre" && (
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
                                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1 ${incident.signatureStatus === "Confirmado por el padre" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                                  >
                                    {incident.signatureStatus ===
                                    "Confirmado por el padre" ? (
                                      <CheckCircle2 className="w-3 h-3" />
                                    ) : (
                                      <Clock className="w-3 h-3" />
                                    )}
                                    {incident.signatureStatus ===
                                    "Confirmado por el padre"
                                      ? "Confirmado por el padre"
                                      : "Esperando confirmación"}
                                  </span>

                                  {incident.signatureStatus ===
                                  "Confirmado por el padre" ? (
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

const TEACHER_SCHEDULE: Record<
  string,
  {
    start: string;
    end: string;
    subject: string;
    section?: string;
    color: string;
  }[]
> = {
  Lunes: [
    {
      start: "8:00",
      end: "8:45",
      subject: "DPCC",
      section: "4°A",
      color:
        "bg-indigo-200 text-indigo-900 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
    },
    {
      start: "8:45",
      end: "9:30",
      subject: "DPCC",
      section: "4°A",
      color:
        "bg-indigo-200 text-indigo-900 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
    },
    {
      start: "9:30",
      end: "10:15",
      subject: "DPCC",
      section: "3°B",
      color:
        "bg-pink-200 text-pink-900 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800",
    },
    {
      start: "10:15",
      end: "11:00",
      subject: "DPCC",
      section: "3°B",
      color:
        "bg-pink-200 text-pink-900 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800",
    },
    {
      start: "11:00",
      end: "11:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "11:15",
      end: "12:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "12:00",
      end: "12:45",
      subject: "DPCC",
      section: "3°A",
      color:
        "bg-amber-400 text-amber-900 border-amber-500 dark:bg-amber-600/40 dark:text-amber-300 dark:border-amber-700",
    },
    {
      start: "12:45",
      end: "13:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "13:15",
      end: "14:00",
      subject: "DPCC",
      section: "3°A",
      color:
        "bg-amber-400 text-amber-900 border-amber-500 dark:bg-amber-600/40 dark:text-amber-300 dark:border-amber-700",
    },
    {
      start: "14:00",
      end: "14:45",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "14:45",
      end: "15:30",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
  ],
  Martes: [
    {
      start: "8:00",
      end: "8:45",
      subject: "DPCC",
      section: "3°C",
      color:
        "bg-yellow-300 text-yellow-900 border-yellow-400 dark:bg-yellow-600/40 dark:text-yellow-300 dark:border-yellow-700",
    },
    {
      start: "8:45",
      end: "9:30",
      subject: "DPCC",
      section: "3°C",
      color:
        "bg-yellow-300 text-yellow-900 border-yellow-400 dark:bg-yellow-600/40 dark:text-yellow-300 dark:border-yellow-700",
    },
    {
      start: "9:30",
      end: "10:15",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "10:15",
      end: "11:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "11:00",
      end: "11:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "11:15",
      end: "12:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "12:00",
      end: "12:45",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "12:45",
      end: "13:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "13:15",
      end: "14:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "14:00",
      end: "14:45",
      subject: "TUT",
      section: "3°C",
      color:
        "bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600/60 dark:text-emerald-100 dark:border-emerald-700",
    },
    {
      start: "14:45",
      end: "15:30",
      subject: "TUT",
      section: "3°C",
      color:
        "bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600/60 dark:text-emerald-100 dark:border-emerald-700",
    },
  ],
  Miércoles: [
    {
      start: "8:00",
      end: "8:45",
      subject: "DPCC",
      section: "3°D",
      color:
        "bg-sky-400 text-sky-900 border-sky-500 dark:bg-sky-600/40 dark:text-sky-200 dark:border-sky-700",
    },
    {
      start: "8:45",
      end: "9:30",
      subject: "DPCC",
      section: "3°D",
      color:
        "bg-sky-400 text-sky-900 border-sky-500 dark:bg-sky-600/40 dark:text-sky-200 dark:border-sky-700",
    },
    {
      start: "9:30",
      end: "10:15",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "10:15",
      end: "11:00",
      subject: "DPCC",
      section: "3°B",
      color:
        "bg-pink-200 text-pink-900 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800",
    },
    {
      start: "11:00",
      end: "11:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "11:15",
      end: "12:00",
      subject: "DPCC",
      section: "3°B",
      color:
        "bg-pink-200 text-pink-900 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800",
    },
    {
      start: "12:00",
      end: "12:45",
      subject: "REUNIÓN TUTORIAS",
      color: "bg-transparent text-slate-800 font-bold dark:text-slate-200",
    },
    {
      start: "12:45",
      end: "13:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "13:15",
      end: "14:00",
      subject: "REUNIÓN TUTORIAS",
      color: "bg-transparent text-slate-800 font-bold dark:text-slate-200",
    },
    {
      start: "14:00",
      end: "14:45",
      subject: "DPCC",
      section: "4°A",
      color:
        "bg-indigo-200 text-indigo-900 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
    },
    {
      start: "14:45",
      end: "15:30",
      subject: "DPCC",
      section: "4°A",
      color:
        "bg-indigo-200 text-indigo-900 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
    },
  ],
  Jueves: [
    {
      start: "8:00",
      end: "8:45",
      subject: "DPCC",
      section: "4°B",
      color:
        "bg-lime-300 text-lime-900 border-lime-400 dark:bg-lime-600/40 dark:text-lime-300 dark:border-lime-700",
    },
    {
      start: "8:45",
      end: "9:30",
      subject: "DPCC",
      section: "4°B",
      color:
        "bg-lime-300 text-lime-900 border-lime-400 dark:bg-lime-600/40 dark:text-lime-300 dark:border-lime-700",
    },
    {
      start: "9:30",
      end: "10:15",
      subject: "DPCC",
      section: "4°B",
      color:
        "bg-lime-300 text-lime-900 border-lime-400 dark:bg-lime-600/40 dark:text-lime-300 dark:border-lime-700",
    },
    {
      start: "10:15",
      end: "11:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "11:00",
      end: "11:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "11:15",
      end: "12:00",
      subject: "DPCC",
      section: "3°A",
      color:
        "bg-amber-400 text-amber-900 border-amber-500 dark:bg-amber-600/40 dark:text-amber-300 dark:border-amber-700",
    },
    {
      start: "12:00",
      end: "12:45",
      subject: "DPCC",
      section: "3°A",
      color:
        "bg-amber-400 text-amber-900 border-amber-500 dark:bg-amber-600/40 dark:text-amber-300 dark:border-amber-700",
    },
    {
      start: "12:45",
      end: "13:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "13:15",
      end: "14:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "14:00",
      end: "14:45",
      subject: "DPCC",
      section: "3°C",
      color:
        "bg-yellow-300 text-yellow-900 border-yellow-400 dark:bg-yellow-600/40 dark:text-yellow-300 dark:border-yellow-700",
    },
    {
      start: "14:45",
      end: "15:30",
      subject: "DPCC",
      section: "3°C",
      color:
        "bg-yellow-300 text-yellow-900 border-yellow-400 dark:bg-yellow-600/40 dark:text-yellow-300 dark:border-yellow-700",
    },
  ],
  Viernes: [
    {
      start: "8:00",
      end: "8:45",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "8:45",
      end: "9:30",
      subject: "REUNIÓN CORD DPCC",
      color: "bg-transparent text-slate-800 font-bold dark:text-slate-200",
    },
    {
      start: "9:30",
      end: "10:15",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "10:15",
      end: "11:00",
      subject: "DPCC",
      section: "4°B",
      color:
        "bg-lime-300 text-lime-900 border-lime-400 dark:bg-lime-600/40 dark:text-lime-300 dark:border-lime-700",
    },
    {
      start: "11:00",
      end: "11:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "11:15",
      end: "12:00",
      subject: "DPCC",
      section: "3°D",
      color:
        "bg-sky-400 text-sky-900 border-sky-500 dark:bg-sky-600/40 dark:text-sky-200 dark:border-sky-700",
    },
    {
      start: "12:00",
      end: "12:45",
      subject: "DPCC",
      section: "3°D",
      color:
        "bg-sky-400 text-sky-900 border-sky-500 dark:bg-sky-600/40 dark:text-sky-200 dark:border-sky-700",
    },
    {
      start: "12:45",
      end: "13:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "13:15",
      end: "14:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "14:00",
      end: "14:45",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "14:45",
      end: "15:30",
      subject: "REUNIÓN CORD EPT",
      color: "bg-transparent text-slate-800 font-bold dark:text-slate-200",
    },
  ],
};

const CitationsPanel: React.FC<{
  classroom: { level: string; grade: string; section: string };
  students: UserItem[];
  tutor?: UserItem;
  citations: CitationItem[];
  setCitations: React.Dispatch<React.SetStateAction<CitationItem[]>>;
  onBack: () => void;
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
  students,
  tutor,
  citations,
  setCitations,
  onBack,
  setHeaderData,
}) => {
  const [sidebarTab, setSidebarTab] = useState<
    "Pendientes" | "Confirmadas" | "Historial" | "Canceladas"
  >("Pendientes");
  const [showIncidentsFilter, setShowIncidentsFilter] = useState(false);
  const [selectedStudentToCite, setSelectedStudentToCite] =
    useState<UserItem | null>(null);
  const [citeReason, setCiteReason] = useState<
    "Incidencias" | "Rendimiento Académico" | "Otros"
  >("Incidencias");
  const [customCiteReason, setCustomCiteReason] = useState("");

  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");

  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    citation: CitationItem | null;
  }>({ isOpen: false, citation: null });
  const [realizadoModal, setRealizadoModal] = useState<{
    isOpen: boolean;
    citationId: string | null;
  }>({ isOpen: false, citationId: null });
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const [reschedReason, setReschedReason] = useState("");
  const [reschedDateError, setReschedDateError] = useState("");
  const [expandedCitations, setExpandedCitations] = useState<string[]>([]);

  const toggleCitation = (id: string) => {
    setExpandedCitations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [filterGrade, setFilterGrade] = useState("Todos");
  const [filterMonth, setFilterMonth] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Confirmadas"); // For confirmed tab
  const [filterReasonList, setFilterReasonList] = useState<
    "Todos" | "Incidencias" | "Académico" | "Otros"
  >("Todos");

  const [composeStep, setComposeStep] = useState(1);
  const [selectedIncidentsForCitation, setSelectedIncidentsForCitation] =
    useState<string[]>([]);
  const dummyIncidentsList = useMemo(
    () => [
      {
        id: "inc-1",
        type: "No trajo el material escolar",
        date: "14/04/2026",
        time: "10:55 AM",
        reporter: "Auxiliar Juan Perez",
      },
      {
        id: "inc-2",
        type: "Falta de respeto a compañero",
        date: "12/04/2026",
        time: "10:42 AM",
        reporter: "Prof. Ana Gómez",
      },
      {
        id: "inc-3",
        type: "Interrupción constante",
        date: "14/04/2026",
        time: "10:40 AM",
        reporter: "Prof. Ana Gómez",
      },
      {
        id: "inc-4",
        type: "Uso inadecuado del celular",
        date: "13/04/2026",
        time: "10:56 AM",
        reporter: "Prof. Lorenzo Castillo",
      },
    ],
    [],
  );

  useEffect(() => {
    let title = "";
    let subtitle = "";
    let icon = MessageSquare;
    if (sidebarTab === "Pendientes") {
      title = "Citas Pendientes";
      subtitle = "Comunicados generadas a la espera de confirmación";
      icon = Inbox;
    } else if (sidebarTab === "Confirmadas") {
      title = "Citas Confirmadas";
      subtitle = "Reuniones programadas pendientes de realizarse";
      icon = CheckCircle2;
    } else if (sidebarTab === "Canceladas") {
      title = "Citas Canceladas";
      subtitle = "Reuniones que fueron canceladas o rechazadas";
      icon = XCircle;
    } else if (sidebarTab === "Historial") {
      title = "Historial de Citas";
      subtitle = "Registro de comunicados realizadas";
      icon = BookOpen;
    }

    if (setHeaderData) {
      setHeaderData({
        title,
        subtitle,
        icon,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        onBack,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarTab, setHeaderData]);

  const handleNextStep = () => {
    if (composeStep === 1) {
      if (citeReason === "Incidencias") {
        setComposeStep(2);
      } else {
        setComposeStep(3); // skip incidents
      }
    } else if (composeStep === 2) {
      setComposeStep(3);
    }
  };

  const handlePrevStep = () => {
    if (composeStep === 3) {
      if (citeReason === "Incidencias") {
        setComposeStep(2);
      } else {
        setComposeStep(1);
      }
    } else if (composeStep === 2) {
      setComposeStep(1);
    }
  };

  const toggleIncidentSelection = (id: string) => {
    setSelectedIncidentsForCitation((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  const toggleAllIncidents = () => {
    if (selectedIncidentsForCitation.length === dummyIncidentsList.length) {
      setSelectedIncidentsForCitation([]);
    } else {
      setSelectedIncidentsForCitation(dummyIncidentsList.map((i) => i.id));
    }
  };

  const handleRescheduleDateChange = (value: string) => {
    setReschedDate(value);
    setReschedDateError("");
    if (!value) return;
    const [y, m, d] = value.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const day = date.getDay();
    if (day === 0 || day === 6) {
      setReschedDateError(
        "Las citas solo pueden programarse de Lunes a Viernes.",
      );
      setReschedDate("");
    }
  };

  const handleReschedule = () => {
    if (rescheduleModal.citation) {
      setCitations((prev) =>
        prev.map((c) =>
          c.id === rescheduleModal.citation!.id
            ? {
                ...c,
                status: "waiting",
                scheduledDate: `En proceso para el ${reschedDate} a las ${reschedTime}`,
                reason: reschedReason || c.reason,
              }
            : c,
        ),
      );
      setRescheduleModal({ isOpen: false, citation: null });
    }
  };

  const [currentCalendarDate, setCurrentCalendarDate] = useState(
    new Date(2026, 3, 1),
  );
  const nextCalendarMonth = () =>
    setCurrentCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  const prevCalendarMonth = () =>
    setCurrentCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );

  const calYear = currentCalendarDate.getFullYear();
  const calMonth = currentCalendarDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const monthName = currentCalendarDate.toLocaleString("es-PE", {
    month: "long",
    year: "numeric",
  });

  const getMonthFromName = (dateString: string | undefined) => {
    if (!dateString) return "";
    return dateString.toLowerCase().includes("abril")
      ? "Abril"
      : dateString.toLowerCase().includes("mayo")
        ? "Mayo"
        : dateString.toLowerCase().includes("junio")
          ? "Junio"
          : "";
  };

  const inProcess = citations.filter((c) => {
    if (
      !(
        c.status === "waiting" ||
        c.status === "confirmed_by_parent" ||
        c.status === "pending"
      )
    )
      return false;
    if (
      filterMonth !== "Todos" &&
      getMonthFromName(c.scheduledDate) !== filterMonth
    )
      return false;
    if (filterReasonList !== "Todos") {
      if (
        filterReasonList === "Incidencias" &&
        !c.reason.toLowerCase().includes("incidencia")
      )
        return false;
      if (
        filterReasonList === "Académico" &&
        !c.reason.toLowerCase().includes("académico") &&
        !c.reason.toLowerCase().includes("academico") &&
        !c.reason.toLowerCase().includes("acad")
      )
        return false;
      if (
        filterReasonList === "Otros" &&
        !c.reason.toLowerCase().includes("otro")
      )
        return false;
    }
    // Assuming c doesn't have grade natively, we mock it via classroom if it matches but usually all belong to classroom
    return true;
  });

  const confirmed = citations.filter((c) => {
    if (filterStatus === "Confirmadas" && c.status !== "closed") return false;
    if (filterStatus === "Rechazadas" && c.status !== "rejected") return false; // Assuming 'rejected' exists
    if (filterStatus === "Rechazadas" && c.status === "closed") return false;
    if (c.status !== "closed" && c.status !== "rejected") return false;

    if (
      filterMonth !== "Todos" &&
      getMonthFromName(c.scheduledDate) !== filterMonth
    )
      return false;

    if (filterReasonList !== "Todos") {
      if (
        filterReasonList === "Incidencias" &&
        !c.reason.toLowerCase().includes("incidencia")
      )
        return false;
      if (
        filterReasonList === "Académico" &&
        !c.reason.toLowerCase().includes("académico") &&
        !c.reason.toLowerCase().includes("academico") &&
        !c.reason.toLowerCase().includes("acad")
      )
        return false;
      if (
        filterReasonList === "Otros" &&
        !c.reason.toLowerCase().includes("otro")
      )
        return false;
    }
    return true;
  });

  const handleSendCitation = () => {
    if (!selectedStudentToCite) return;
    const finalReason =
      citeReason === "Otros"
        ? customCiteReason || "Otros"
        : citeReason === "Rendimiento Académico"
          ? "Rendimiento académico"
          : citeReason === "Incidencias"
            ? "Acumulación de incidencias"
            : citeReason;

    const newCitation: CitationItem = {
      id: `cite-${Date.now()}`,
      studentId: selectedStudentToCite.id,
      name: selectedStudentToCite.name,
      avatarColor: selectedStudentToCite.avatarColor,
      avatarLetter: selectedStudentToCite.name.charAt(0),
      reason: finalReason,
      status: "pending",
      theme: citeReason.includes("Incidencias")
        ? "red"
        : citeReason === "Otros"
          ? "yellow"
          : "orange",
      scheduledDate:
        schedDate && schedTime
          ? `En proceso para el ${schedDate} a las ${schedTime}`
          : "En proceso (Sin fecha)",
    };
    setCitations((prev) => [newCitation, ...prev]);
    setIsComposeModalOpen(false);
    setSelectedStudentToCite(null);
    setSchedDate("");
    setSchedTime("");
  };

  const incidentCounts = useMemo(() => {
    const counts: Record<
      string,
      { leve: number; moderado: number; grave: number }
    > = {};
    students.forEach((s, idx) => {
      counts[s.id] = {
        leve: (idx * 3) % 4,
        moderado: (idx * 2) % 3,
        grave: idx % 2 === 0 ? 0 : 1,
      };
    });
    return counts;
  }, [students]);

  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
      <div className="flex flex-col overflow-hidden h-full relative animate-in fade-in slide-in-from-right-4 duration-500 bg-[#EFEAE2] dark:bg-[#0b141a]">
        <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20 gap-4">
          <button onClick={onBack} className="text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                <Mail className="w-4 h-4 text-slate-500 dark:text-slate-300" />
             </div>
             <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px] truncate">Comunicados</h2>
          </div>
          <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1] shrink-0">
             <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
             <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-w-0 min-h-0 bg-white dark:bg-slate-900">
          {/* Sidebar */}
          <div className="w-full md:w-[260px] border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-slate-800 shrink-0 py-4 sm:py-6 pr-4 overflow-y-auto">
            {/* Compose Button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setIsComposeModalOpen(true);
                  setComposeStep(1);
                  setSelectedStudentToCite(null);
                  setCiteReason("Incidencias");
                  setSchedDate("");
                  setSchedTime("");
                  setSelectedIncidentsForCitation([]);
                }}
                className="flex items-center gap-3 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-md transition-all rounded-r-full w-full shadow-sm group"
              >
                <Edit2
                  className="w-5 h-5"
                  strokeWidth={2.5}
                />
                <span className="font-semibold text-[15px]">Redactar</span>
              </button>
            </div>

            <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible custom-scrollbar">
              {[
                {
                  id: "Pendientes",
                  label: "Citas Pendientes",
                  icon: Inbox,
                  count: inProcess.length,
                },
                {
                  id: "Confirmadas",
                  label: "Citas Confirmadas",
                  icon: CheckCircle2,
                  count: confirmed.length,
                },
                {
                  id: "Canceladas",
                  label: "Citas Canceladas",
                  icon: XCircle,
                  count: 0,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSidebarTab(tab.id as any);
                    setSelectedStudentToCite(null);
                  }}
                  className={`flex items-center justify-between px-6 py-3 rounded-r-full font-medium text-[15px] transition-colors w-full group ${sidebarTab === tab.id ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  <div className="flex items-center gap-4">
                    <tab.icon
                      className={`w-5 h-5 shrink-0 transition-colors ${sidebarTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`}
                    />
                    <span className="flex-1 text-left">{tab.label}</span>
                  </div>
                  {tab.count > 0 && (
                    <span
                      className={`text-[13px] font-bold ${sidebarTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content wrapper */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col min-w-0 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800/50">
            {/* Global Filters Bar */}
            <div className="px-6 sm:px-10 pt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                {/* Left side: Reason Tabs */}
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-full xl:max-w-md border border-slate-200 dark:border-slate-700 shadow-sm items-center h-[50px]">
                  <button
                    onClick={() => setFilterReasonList("Todos")}
                    className={`flex-1 h-full font-bold rounded-lg text-[15px] flex justify-center items-center gap-2 transition-colors ${filterReasonList === "Todos" ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow shadow-slate-200/50 dark:shadow-none" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterReasonList("Incidencias")}
                    className={`flex-1 h-full font-bold rounded-lg text-[15px] flex justify-center items-center gap-2 transition-colors ${filterReasonList === "Incidencias" ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow shadow-slate-200/50 dark:shadow-none" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
                  >
                    Incidencias
                  </button>
                  <button
                    onClick={() => setFilterReasonList("Académico")}
                    className={`flex-1 h-full font-bold rounded-lg text-[15px] flex justify-center items-center gap-2 transition-colors ${filterReasonList === "Académico" ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow shadow-slate-200/50 dark:shadow-none" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
                  >
                    Académico
                  </button>
                  <button
                    onClick={() => setFilterReasonList("Otros")}
                    className={`flex-1 h-full font-bold rounded-lg text-[15px] flex justify-center items-center gap-2 transition-colors ${filterReasonList === "Otros" ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow shadow-slate-200/50 dark:shadow-none" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
                  >
                    Otros
                  </button>
                </div>

                {/* Right side: Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <select
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                      className="appearance-none font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-5 pr-12 py-3 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer text-[15px] shadow-sm min-w-[140px]"
                    >
                      <option value="Todos">Todas las Aulas</option>
                      <option value="3°C">Secundaria - 3°C</option>
                      <option value="4°B">Secundaria - 4°B</option>
                      <option value="5°A">Secundaria - 5°A</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="appearance-none font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-5 pr-12 py-3 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer text-[15px] shadow-sm min-w-[140px]"
                    >
                      <option value="Todos">Todos los Meses</option>
                      <option value="Abril">Abril</option>
                      <option value="Mayo">Mayo</option>
                      <option value="Junio">Junio</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10 flex-1 flex flex-col w-full h-full">
              {/* En Proceso List */}
              {sidebarTab === "Pendientes" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-8 w-full pt-2">
                  <div className="flex flex-col gap-4 w-full">
                    {inProcess.map((c) => {
                      const isExpanded = expandedCitations.includes(c.id);
                      let timeStr = "10:00 hrs";
                      let dateStr = "15 Abr";
                      if (c.scheduledDate) {
                        const parts = c.scheduledDate
                          .replace("En proceso para el ", "")
                          .replace("Confirmada para el ", "")
                          .split("a las");
                        if (parts[0]) {
                          dateStr = parts[0].trim();
                          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const dDate = new Date(dateStr);
                            dateStr = `${dDate.getDate()} ${dDate.toLocaleString("es-PE", { month: "short" })}`;
                          } else {
                            dateStr = dateStr
                              .split(",")[0]
                              .replace(" de ", ", ");
                          }
                        }
                        if (parts[1]) timeStr = parts[1].trim() + " hrs";
                      }

                      let badge = null;
                      if (dateStr.includes("20")) {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                            HOY
                          </span>
                        );
                      }

                      return (
                        <div
                          key={c.id}
                          className="bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700/80 rounded-xl flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all w-full overflow-hidden"
                        >
                          <button
                            onClick={() => toggleCitation(c.id)}
                            className="flex items-center justify-between p-4 sm:px-6 w-full text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 bg-slate-100 border border-slate-200 font-bold text-lg dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                              >
                                {c.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-[#041e49] dark:text-white text-[15px]">
                                  {c.name}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-[12px] mt-0.5">
                                  {c.reason.replace(
                                    /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                    "",
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="hidden sm:flex flex-col items-end">
                                <div className="flex items-center gap-2 mb-0.5">
                                  {badge}
                                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">
                                    {dateStr.replace(/miercoles/i, "Míercoles")}
                                  </span>
                                </div>
                                <span className="text-slate-500 font-medium text-[12px]">
                                  {timeStr}
                                </span>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-6 pb-6 overflow-hidden"
                              >
                                <div className="flex flex-col gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                  <div className="w-full">
                                    <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[130px_1fr] gap-y-4 gap-x-4 items-center">
                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Motivo:
                                      </span>
                                      <div className="flex items-center">
                                        <span
                                          className="text-[13px] w-fit px-3 py-1.5 rounded-lg font-bold tracking-wide bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                        >
                                          {c.reason
                                            .replace(
                                              /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                              "",
                                            )
                                            .charAt(0)
                                            .toUpperCase() +
                                            c.reason
                                              .replace(
                                                /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                                "",
                                              )
                                              .slice(1)}
                                        </span>
                                      </div>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Fecha:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px] whitespace-nowrap">
                                        {c.scheduledDate
                                          ? c.scheduledDate
                                              .replace(
                                                "En proceso para el ",
                                                "",
                                              )
                                              .replace(
                                                "Confirmada para el ",
                                                "",
                                              )
                                              .split(",")[0]
                                              .replace(" de ", ", ")
                                              .replace(
                                                /miercoles/i,
                                                "Míercoles",
                                              )
                                          : "Míercoles 15, Abril"}
                                      </span>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Hora:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">
                                        {c.scheduledDate
                                          ?.split(",")[1]
                                          ?.trim() || "10:00 AM"}
                                      </span>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Docente:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">
                                        Ana Gómez - Matemática
                                      </span>
                                    </div>

                                    {c.incidents && c.incidents.length > 0 && (
                                      <div className="mt-6">
                                        <h4 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                                          Incidencias Vinculadas (
                                          {c.incidents.length})
                                        </h4>
                                        <div className="flex flex-col gap-2">
                                          {c.incidents.map((inc, i) => (
                                            <div
                                              key={i}
                                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl gap-2"
                                            >
                                              <div className="flex flex-col">
                                                <span className="font-bold text-[14px] text-slate-800 dark:text-slate-200">
                                                  {inc.type}
                                                </span>
                                                <span className="text-[12px] text-slate-500 font-medium">
                                                  Reportado por: {inc.teacher}
                                                </span>
                                              </div>
                                              <div className="flex sm:flex-col items-end gap-2 sm:gap-0">
                                                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                                                  {inc.date}
                                                </span>
                                                <span className="text-[12px] text-slate-500">
                                                  {inc.time}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex w-full justify-end gap-3 pt-6 lg:pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                                    <button className="px-6 py-2.5 bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors font-bold text-[14px] flex items-center gap-2 whitespace-nowrap">
                                      Cancelar Cita
                                    </button>
                                    <button
                                      onClick={() => {
                                        setReschedDate("");
                                        setReschedTime("");
                                        setReschedReason("");
                                        setRescheduleModal({
                                          isOpen: true,
                                          citation: c,
                                        });
                                      }}
                                      className="px-6 py-2.5 justify-center bg-indigo-50 dark:bg-indigo-900/20 text-[#5c4ce1] dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-[1.5px] border-indigo-200 dark:border-indigo-800/50 shadow-sm transition-colors font-bold text-[14px] flex items-center gap-2 whitespace-nowrap"
                                    >
                                      Reprogramar
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                  {inProcess.length === 0 && (
                    <p className="text-center text-slate-500 py-12 font-medium">
                      No hay citas en este momento.
                    </p>
                  )}
                </div>
              )}

              {/* Confirmadas List */}
              {sidebarTab === "Confirmadas" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-8 w-full">
                  <div className="flex flex-col gap-4 w-full">
                    {confirmed.map((c) => {
                      const isExpanded = expandedCitations.includes(c.id);
                      let timeStr = "10:00 hrs";
                      let dateStr = "15 Abr";
                      if (c.scheduledDate) {
                        const parts = c.scheduledDate
                          .replace("En proceso para el ", "")
                          .replace("Confirmada para el ", "")
                          .split("a las");
                        if (parts[0]) {
                          dateStr = parts[0].trim();
                          // Format specifically if it's "2026-04-20"
                          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const dDate = new Date(dateStr);
                            dateStr = `${dDate.getDate()} ${dDate.toLocaleString("es-PE", { month: "short" })}`;
                          } else {
                            dateStr = dateStr
                              .split(",")[0]
                              .replace(" de ", ", ");
                          }
                        }
                        if (parts[1]) timeStr = parts[1].trim() + " hrs";
                      }

                      let badge = null;
                      if (dateStr.includes("20")) {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                            HOY
                          </span>
                        );
                      }

                      return (
                        <div
                          key={c.id}
                          className="bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700/80 rounded-xl flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all w-full overflow-hidden"
                        >
                          <button
                            onClick={() => toggleCitation(c.id)}
                            className="flex items-center justify-between p-4 sm:px-6 w-full text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 bg-slate-100 border border-slate-200 font-bold text-lg dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                              >
                                {c.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-[#041e49] dark:text-white text-[15px]">
                                  {c.name}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-[12px] mt-0.5">
                                  {c.reason.replace(
                                    /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                    "",
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="hidden sm:flex flex-col items-end">
                                <div className="flex items-center gap-2 mb-0.5">
                                  {badge}
                                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">
                                    {dateStr.replace(/miercoles/i, "Míercoles")}
                                  </span>
                                </div>
                                <span className="text-slate-500 font-medium text-[12px]">
                                  {timeStr}
                                </span>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-6 pb-6 overflow-hidden"
                              >
                                <div className="flex flex-col gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                  <div className="w-full">
                                    <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[130px_1fr] gap-y-4 gap-x-4 items-center">
                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Motivo:
                                      </span>
                                      <div className="flex items-center">
                                        <span
                                          className={`text-[13px] w-fit px-3 py-1.5 rounded-lg font-bold tracking-wide bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`}
                                        >
                                          {c.reason
                                            .replace(
                                              /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                              "",
                                            )
                                            .charAt(0)
                                            .toUpperCase() +
                                            c.reason
                                              .replace(
                                                /^(Incidencias|Académico|Otros)\s*-\s*/i,
                                                "",
                                              )
                                              .slice(1)}
                                        </span>
                                      </div>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Fecha:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px] whitespace-nowrap">
                                        {c.scheduledDate
                                          ? c.scheduledDate
                                              .replace(
                                                "En proceso para el ",
                                                "",
                                              )
                                              .replace(
                                                "Confirmada para el ",
                                                "",
                                              )
                                              .split(",")[0]
                                              .replace(" de ", ", ")
                                              .replace(
                                                /miercoles/i,
                                                "Míercoles",
                                              )
                                          : "Míercoles 15, Abril"}
                                      </span>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Hora:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">
                                        {c.scheduledDate
                                          ?.split(",")[1]
                                          ?.trim() || "08:00 AM"}
                                      </span>

                                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-[14px]">
                                        Docente:
                                      </span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">
                                        Ana Gómez - Matemática
                                      </span>
                                    </div>

                                    {c.incidents && c.incidents.length > 0 && (
                                      <div className="mt-6">
                                        <h4 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                                          Incidencias Vinculadas (
                                          {c.incidents.length})
                                        </h4>
                                        <div className="flex flex-col gap-2">
                                          {c.incidents.map((inc, i) => (
                                            <div
                                              key={i}
                                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl gap-2"
                                            >
                                              <div className="flex flex-col">
                                                <span className="font-bold text-[14px] text-slate-800 dark:text-slate-200">
                                                  {inc.type}
                                                </span>
                                                <span className="text-[12px] text-slate-500 font-medium">
                                                  Reportado por: {inc.teacher}
                                                </span>
                                              </div>
                                              <div className="flex sm:flex-col items-end gap-2 sm:gap-0">
                                                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                                                  {inc.date}
                                                </span>
                                                <span className="text-[12px] text-slate-500">
                                                  {inc.time}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex w-full justify-end gap-3 pt-6 lg:pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                                    <button
                                      onClick={() => {
                                        window.dispatchEvent(
                                          new CustomEvent("openCalendar", {
                                            detail: { date: c.scheduledDate },
                                          }),
                                        );
                                      }}
                                      className="px-6 py-2.5 bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors font-bold text-[14px] flex items-center gap-2 whitespace-nowrap"
                                    >
                                      <CalendarDays className="w-4 h-4" />{" "}
                                      Calendario
                                    </button>
                                    <button
                                      onClick={() =>
                                        setRealizadoModal({
                                          isOpen: true,
                                          citationId: c.id,
                                        })
                                      }
                                      className="px-6 py-2.5 justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-[1.5px] border-emerald-200 dark:border-emerald-800/50 shadow-sm transition-colors font-bold text-[14px] flex items-center gap-2 whitespace-nowrap"
                                    >
                                      <Check className="w-5 h-5" /> Realizado
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                  {confirmed.length === 0 && (
                    <p className="text-center text-slate-500 py-12 font-medium">
                      No hay citas confirmadas.
                    </p>
                  )}
                </div>
              )}

              {/* Canceladas List */}
              {sidebarTab === "Canceladas" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-8 w-full items-center justify-center pt-20">
                  <div className="bg-rose-50 dark:bg-rose-900/20 w-20 h-20 rounded-full flex items-center justify-center mb-4 border border-rose-100 dark:border-rose-900/50">
                    <XCircle className="w-10 h-10 text-rose-400" />
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-200">
                    No hay citas canceladas
                  </h3>
                  <p className="text-slate-500 font-medium max-w-sm text-center">
                    Las citas que hayan sido rechazadas o canceladas
                    definitivamente se mostrarán aquí.
                  </p>
                </div>
              )}

              {/* Reagendar Modal */}
              <AnimatePresence>
                {rescheduleModal.isOpen && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden w-full max-w-lg flex flex-col"
                    >
                      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-indigo-500" />{" "}
                          Reagendar Citación
                        </h3>
                        <button
                          onClick={() =>
                            setRescheduleModal({
                              isOpen: false,
                              citation: null,
                            })
                          }
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-700 bg-slate-100 border border-slate-200 font-bold text-lg dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                          >
                            {rescheduleModal.citation?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight">
                              {rescheduleModal.citation?.name}
                            </p>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">
                              Motivo original:{" "}
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {rescheduleModal.citation?.reason}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                              <CalendarDays className="w-4 h-4 text-indigo-500" />{" "}
                              Nueva fecha
                            </label>
                            <div className="w-full relative z-[60]">
                              <CustomCalendar
                                mode="date"
                                value={reschedDate}
                                onChange={handleRescheduleDateChange}
                                placeholder="Seleccionar Fecha"
                              />
                            </div>
                            {reschedDateError && (
                              <p className="text-xs text-red-500 mt-1.5 font-bold">
                                {reschedDateError}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-indigo-500" />{" "}
                              Nueva hora
                            </label>
                            <div className="relative">
                              <input
                                type="time"
                                value={reschedTime}
                                onChange={(e) => setReschedTime(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm h-[42px]"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Nuevo motivo (Opcional)
                          </label>
                          <input
                            type="text"
                            value={reschedReason}
                            onChange={(e) => setReschedReason(e.target.value)}
                            placeholder="Ej. Cambio de horario a solicitud del padre"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>
                      <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                        <button
                          onClick={() =>
                            setRescheduleModal({
                              isOpen: false,
                              citation: null,
                            })
                          }
                          className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleReschedule}
                          className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-colors flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" /> Guardar y Notificar
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Compose Modal */}
              <AnimatePresence>
                {isComposeModalOpen && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden w-full max-w-[500px] flex flex-col max-h-[90vh]"
                    >
                      {/* Dynamic Header */}
                      <div
                        className={`p-6 border-b flex justify-between items-center ${composeStep === 2 ? "border-indigo-100 dark:border-indigo-800/50 bg-white dark:bg-slate-900 border-b-2" : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"}`}
                      >
                        <h3
                          className={`text-[19px] font-extrabold flex items-center gap-2 ${composeStep === 2 ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-white"}`}
                        >
                          {composeStep === 2 ? (
                            <>
                              <AlertTriangle className="w-5 h-5 text-indigo-600" />{" "}
                              Selección de Incidencias
                            </>
                          ) : (
                            <>
                              <Edit2 className="w-5 h-5 text-indigo-500" />{" "}
                              Generar Citación
                            </>
                          )}
                        </h3>
                        <button
                          onClick={() => {
                            setIsComposeModalOpen(false);
                            setSelectedStudentToCite(null);
                            setComposeStep(1);
                          }}
                          className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
                        >
                          <X className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Step 1: Estudiante y Motivo */}
                      {composeStep === 1 && (
                        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                              Estudiante
                            </label>
                            <div className="relative">
                              <select
                                value={selectedStudentToCite?.id || ""}
                                onChange={(e) => {
                                  const st = students.find(
                                    (s) => s.id === e.target.value,
                                  );
                                  setSelectedStudentToCite(st || null);
                                }}
                                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                              >
                                <option value="" disabled>
                                  Seleccione un estudiante
                                </option>
                                {students.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[17px] font-extrabold text-slate-900 dark:text-slate-300 mb-4 pt-2">
                              Selecciona el motivo:
                            </label>
                            <div className="flex flex-col gap-3">
                              <button
                                onClick={() => {
                                  if (!selectedStudentToCite) return;
                                  setCiteReason("Incidencias");
                                  setComposeStep(2);
                                }}
                                disabled={!selectedStudentToCite}
                                className="flex items-center justify-between p-4 rounded-[14px] bg-[#fff0f2] border border-[#ffe0e4] hover:bg-[#ffe4e8] transition-colors disabled:opacity-50"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-[#ffd4dd] flex items-center justify-center text-[#9f0f29]">
                                    <AlertTriangle
                                      className="w-[20px] h-[20px]"
                                      strokeWidth={2.5}
                                    />
                                  </div>
                                  <span className="font-extrabold text-[#7a061b] text-[17px]">
                                    Incidencias
                                  </span>
                                </div>
                                <ChevronRight
                                  className="w-5 h-5 text-[#f15e76]"
                                  strokeWidth={2.5}
                                />
                              </button>

                              <button
                                onClick={() => {
                                  if (!selectedStudentToCite) return;
                                  setCiteReason("Académico");
                                  setComposeStep(3);
                                }}
                                disabled={!selectedStudentToCite}
                                className="flex items-center justify-between p-4 rounded-[14px] bg-[#eff9ff] border border-[#d9efff] hover:bg-[#e4f6ff] transition-colors disabled:opacity-50"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-[#cbe9ff] flex items-center justify-center text-[#064289]">
                                    <BookOpen
                                      className="w-[20px] h-[20px]"
                                      strokeWidth={2.5}
                                    />
                                  </div>
                                  <span className="font-extrabold text-[#033166] text-[17px]">
                                    Académico
                                  </span>
                                </div>
                                <ChevronRight
                                  className="w-5 h-5 text-[#62a2eb]"
                                  strokeWidth={2.5}
                                />
                              </button>

                              <button
                                onClick={() => {
                                  if (!selectedStudentToCite) return;
                                  setCiteReason("Otros");
                                  setComposeStep(3);
                                }}
                                disabled={!selectedStudentToCite}
                                className="flex items-center justify-between p-4 rounded-[14px] bg-[#fffce8] border border-[#fff2ba] hover:bg-[#fff9d4] transition-colors disabled:opacity-50"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-[#ffe484] flex items-center justify-center text-[#6e4600]">
                                    <Info
                                      className="w-[20px] h-[20px]"
                                      strokeWidth={2.5}
                                    />
                                  </div>
                                  <span className="font-extrabold text-[#503100] text-[17px]">
                                    Otros
                                  </span>
                                </div>
                                <ChevronRight
                                  className="w-5 h-5 text-[#f4aa24]"
                                  strokeWidth={2.5}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Selección de Incidencias */}
                      {composeStep === 2 && selectedStudentToCite && (
                        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900/50">
                          <div className="bg-[#f3f4fa] dark:bg-indigo-900/20 border border-transparent p-5 rounded-xl flex items-center gap-4 mb-6">
                            <div
                              className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-slate-700 bg-slate-100 border border-slate-200 font-bold text-lg dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                            >
                              {selectedStudentToCite.name.charAt(0)}
                            </div>
                            <div className="flex flex-col justify-center">
                              <p className="font-extrabold text-slate-900 dark:text-white text-[17px] leading-tight mb-0.5">
                                {selectedStudentToCite.name}
                              </p>
                              <p className="text-[#5252d4] dark:text-indigo-300 font-semibold text-[14px]">
                                Motivo: {citeReason}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4 px-1">
                            <p className="font-extrabold text-slate-900 dark:text-slate-100 text-[15px]">
                              Seleccionar incidencias a citar
                            </p>
                            <button
                              onClick={toggleAllIncidents}
                              className="text-[#5252d4] dark:text-indigo-400 font-extrabold text-[14px] hover:underline"
                            >
                              Seleccionar todo
                            </button>
                          </div>

                          <div className="flex flex-col gap-3">
                            {dummyIncidentsList.map((inc) => (
                              <label
                                key={inc.id}
                                className="flex items-start gap-4 p-4 border border-slate-200 dark:border-slate-700/50 rounded-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors bg-white dark:bg-slate-800 shadow-sm"
                              >
                                <div className="mt-0.5 relative flex items-center justify-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedIncidentsForCitation.includes(
                                      inc.id,
                                    )}
                                    onChange={() =>
                                      toggleIncidentSelection(inc.id)
                                    }
                                    className="appearance-none peer w-5 h-5 rounded-[4px] border-[1.5px] border-slate-400 checked:border-[#5252d4] checked:bg-[#5252d4] transition-all cursor-pointer hover:border-[#5252d4]"
                                  />
                                  <Check
                                    className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                                    strokeWidth={4}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start gap-3">
                                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-[15px] leading-snug flex-1 break-words">
                                      {inc.type}
                                    </span>
                                    <div className="flex flex-col items-end shrink-0">
                                      <span className="text-[13px] font-bold text-[#8694a3] dark:text-slate-400">
                                        {inc.date}
                                      </span>
                                      <span className="text-[13px] font-bold text-[#8694a3] dark:text-slate-400 mt-0.5">
                                        {inc.time}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-[14px] text-slate-600 dark:text-slate-400 mt-1.5 font-medium">
                                    Registrado por:{" "}
                                    {inc.reporter.replace("Prof. ", "Prof. ")}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Agendar (Fecha/Hora) */}
                      {composeStep === 3 && (
                        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 bg-slate-100 border border-slate-200 font-bold text-lg dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                              >
                                {selectedStudentToCite?.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-white text-[15px]">
                                  {selectedStudentToCite?.name}
                                </p>
                                <p className="text-indigo-600 dark:text-indigo-300 font-semibold text-xs leading-tight">
                                  {citeReason}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-5 z-20 relative">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                <CalendarDays className="w-4 h-4 text-indigo-500" />{" "}
                                Fecha sugerida
                              </label>
                              <div className="w-full relative z-[60]">
                                <CustomCalendar
                                  mode="date"
                                  value={schedDate}
                                  onChange={setSchedDate}
                                  placeholder="Seleccionar"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-indigo-500" />{" "}
                                Hora sugerida
                              </label>
                              <div className="relative">
                                <input
                                  type="time"
                                  value={schedTime}
                                  onChange={(e) => setSchedTime(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[15px] font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm h-[44px]"
                                  style={{
                                    fontFamily: "'Poppins', sans-serif",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          {citeReason === "Otros" && (
                            <div>
                              <label className="block text-[13px] font-extrabold text-slate-700 dark:text-slate-300 mb-2.5 mt-2">
                                Motivo de la citación
                              </label>
                              <textarea
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder:text-gray-400 resize-none min-h-[90px]"
                                placeholder="Escriba el detalle del motivo por el cual cita al estudiante..."
                                autoFocus
                                value={customCiteReason}
                                onChange={(e) =>
                                  setCustomCiteReason(e.target.value)
                                }
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`p-6 flex justify-[space-evenly] gap-3 bg-slate-50 border-t border-slate-100 dark:bg-slate-900 rounded-b-3xl ${composeStep === 2 && "bg-slate-50 dark:bg-slate-800"}`}
                      >
                        <div
                          className={`flex justify-center ${composeStep === 1 ? "w-full" : "flex-1 flex justify-center"}`}
                        >
                          {composeStep === 2 ? (
                            <button
                              onClick={() => {
                                setIsComposeModalOpen(false);
                                setSelectedStudentToCite(null);
                                setComposeStep(1);
                              }}
                              className="font-extrabold text-[#041e49] dark:text-slate-300 hover:opacity-70 transition-opacity"
                            >
                              Cancelar
                            </button>
                          ) : composeStep === 3 ? (
                            <button
                              onClick={handlePrevStep}
                              className="font-extrabold text-[#041e49] dark:text-slate-300 hover:opacity-70 transition-opacity"
                            >
                              Atrás
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setIsComposeModalOpen(false);
                                setSelectedStudentToCite(null);
                                setComposeStep(1);
                              }}
                              className="font-extrabold text-[#041e49] dark:text-slate-300 hover:opacity-70 transition-opacity"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>

                        {composeStep > 1 && (
                          <div className="flex justify-center flex-1">
                            {composeStep < 3 ? (
                              <button
                                onClick={handleNextStep}
                                disabled={
                                  composeStep === 1 && !selectedStudentToCite
                                }
                                className="px-8 py-2.5 rounded-xl font-extrabold bg-[#acabf3] text-white hover:bg-indigo-400 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                              >
                                Continuar
                              </button>
                            ) : (
                              <button
                                onClick={handleSendCitation}
                                disabled={!schedDate || !schedTime}
                                className="px-6 py-2.5 rounded-xl font-extrabold bg-[#5c4ce1] text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center w-full"
                              >
                                <Send className="w-4 h-4" /> Enviar Citación
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Realizado Modal */}
              <AnimatePresence>
                {realizadoModal.isOpen && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden w-full max-w-[420px] flex flex-col items-center text-center p-8 pb-10"
                    >
                      <div className="w-[72px] h-[72px] rounded-full bg-[#dcfce7] flex items-center justify-center mb-5">
                        <div className="w-10 h-10 rounded-full border-[2.5px] border-[#0ea5e9] flex items-center justify-center border-emerald-600">
                          <Check
                            className="w-5 h-5 text-emerald-600"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                      <h3 className="text-[22px] font-extrabold text-[#041e49] dark:text-white mb-2 leading-tight">
                        ¿Marcar como realizado?
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-[15px] font-medium px-4 mb-8">
                        Esta acción archivará la citación en el historial
                        permanentemente.
                      </p>

                      <div className="flex gap-4 w-full px-2">
                        <button
                          onClick={() =>
                            setRealizadoModal({
                              isOpen: false,
                              citationId: null,
                            })
                          }
                          className="flex-1 py-3.5 rounded-xl font-extrabold text-[#041e49] dark:text-slate-300 bg-[#f4f6fa] dark:bg-slate-800 hover:bg-[#e2e8f0] transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            const updatedCitations = citations.map((c) =>
                              c.id === realizadoModal.citationId
                                ? { ...c, status: "closed" as any }
                                : c,
                            );
                            setCitations(updatedCitations);
                            setRealizadoModal({
                              isOpen: false,
                              citationId: null,
                            });
                          }}
                          className="flex-1 py-3.5 rounded-xl font-extrabold text-white bg-[#059669] hover:bg-emerald-700 shadow-sm transition-colors"
                        >
                          Confirmar
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


