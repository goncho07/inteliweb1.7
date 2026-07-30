import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, BookOpen, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, Clock, Edit2, Inbox, Info, MessageSquare, MoreVertical, Plus, Search, Send, X, XCircle } from 'lucide-react';

import { CustomCalendar } from '@/components/calendar/CustomCalendar';
import type { CitationsPanelVariant } from '@/features/classrooms/panelVariants';
import type { CitationItem } from '@/features/classrooms/types';
import { cn } from '@/lib/utils';
import { UserItem } from '@/types';

export const CitationsBoardPanel: React.FC<{
  classroom: { level: string; grade: string; section: string };
  students: UserItem[];
  tutor?: UserItem;
  items: CitationItem[];
  setItems: React.Dispatch<React.SetStateAction<CitationItem[]>>;
  variant: CitationsPanelVariant;
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
  items,
  setItems,
  variant,
  onBack,
  setHeaderData,
}) => {
  const [sidebarTab, setSidebarTab] = useState<
    "Pendientes" | "Confirmadas" | "Historial" | "Canceladas"
  >("Pendientes");
  const [showIncidentsFilter, setShowIncidentsFilter] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<UserItem | null>(null);
  const [composeReason, setComposeReason] = useState<
    "Incidencias" | "Rendimiento Académico" | "Otros"
  >("Incidencias");
  const [customComposeReason, setCustomComposeReason] = useState("");

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
      subtitle = `${variant.pluralLabel} generadas a la espera de confirmación`;
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
      subtitle = `Registro de ${variant.pluralLabel.toLowerCase()} realizadas`;
      icon = BookOpen;
    }

    if (setHeaderData) {
      setHeaderData({
        title,
        subtitle,
        icon,
         
        onBack,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarTab, setHeaderData]);

  const handleNextStep = () => {
    if (composeStep === 1) {
      if (composeReason === "Incidencias") {
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
      if (composeReason === "Incidencias") {
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
      setItems((prev) =>
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

  const inProcess = items.filter((c) => {
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

  const confirmed = items.filter((c) => {
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
    if (!selectedStudent) return;
    const finalReason =
      composeReason === "Otros"
        ? customComposeReason || "Otros"
        : composeReason === "Rendimiento Académico"
          ? "Rendimiento académico"
          : composeReason === "Incidencias"
            ? "Acumulación de incidencias"
            : composeReason;

    const newCitation: CitationItem = {
      id: `cite-${Date.now()}`,
      studentId: selectedStudent.id,
      name: selectedStudent.name,
      avatarColor: selectedStudent.avatarColor,
      avatarLetter: selectedStudent.name.charAt(0),
      reason: finalReason,
      status: "pending",
      theme: composeReason.includes("Incidencias")
        ? "red"
        : composeReason === "Otros"
          ? "yellow"
          : "orange",
      scheduledDate:
        schedDate && schedTime
          ? `En proceso para el ${schedDate} a las ${schedTime}`
          : "En proceso (Sin fecha)",
    };
    setItems((prev) => [newCitation, ...prev]);
    setIsComposeModalOpen(false);
    setSelectedStudent(null);
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
                <variant.icon className="w-4 h-4 text-slate-500 dark:text-slate-300" />
             </div>
             <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px] truncate">{variant.title}</h2>
          </div>
          <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1] shrink-0">
             {variant.showComposeShortcut && (
               <button onClick={() => setIsComposeModalOpen(true)} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                 <Plus className="w-5 h-5" />
               </button>
             )}
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
                  setSelectedStudent(null);
                  setComposeReason("Incidencias");
                  setSchedDate("");
                  setSchedTime("");
                  setSelectedIncidentsForCitation([]);
                }}
                className={cn(
                  'flex items-center gap-3 px-6 py-4 hover:shadow-md transition-all rounded-r-full w-full group',
                  variant.composeButtonClass,
                )}
              >
                <Edit2
                  className={cn('w-5 h-5', variant.composeIconClass)}
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
                    setSelectedStudent(null);
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
                          <span className={cn('px-2 py-0.5 rounded text-[10px] uppercase font-black', variant.badgeClass)}>
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
                                className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg', variant.avatarColorClass(c.avatarColor))}
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
                                          className={cn('text-[13px] w-fit px-3 py-1.5 rounded-lg font-bold tracking-wide', variant.reasonChipClass(c.theme))}
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
                          <span className={cn('px-2 py-0.5 rounded text-[10px] uppercase font-black', variant.badgeClass)}>
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
                                className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg', variant.avatarColorClass(c.avatarColor))}
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
                            className={cn('w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg', variant.avatarColorClass(rescheduleModal.citation?.avatarColor))}
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
                            setSelectedStudent(null);
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
                                value={selectedStudent?.id || ""}
                                onChange={(e) => {
                                  const st = students.find(
                                    (s) => s.id === e.target.value,
                                  );
                                  setSelectedStudent(st || null);
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
                                  if (!selectedStudent) return;
                                  setComposeReason("Incidencias");
                                  setComposeStep(2);
                                }}
                                disabled={!selectedStudent}
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
                                  if (!selectedStudent) return;
                                  setComposeReason("Rendimiento Académico");
                                  setComposeStep(3);
                                }}
                                disabled={!selectedStudent}
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
                                  if (!selectedStudent) return;
                                  setComposeReason("Otros");
                                  setComposeStep(3);
                                }}
                                disabled={!selectedStudent}
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
                      {composeStep === 2 && selectedStudent && (
                        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900/50">
                          <div className="bg-[#f3f4fa] dark:bg-indigo-900/20 border border-transparent p-5 rounded-xl flex items-center gap-4 mb-6">
                            <div
                              className={cn('w-[52px] h-[52px] rounded-full flex items-center justify-center font-extrabold text-2xl', variant.avatarColorClass(selectedStudent.avatarColor))}
                            >
                              {selectedStudent.name.charAt(0)}
                            </div>
                            <div className="flex flex-col justify-center">
                              <p className="font-extrabold text-slate-900 dark:text-white text-[17px] leading-tight mb-0.5">
                                {selectedStudent.name}
                              </p>
                              <p className="text-[#5252d4] dark:text-indigo-300 font-semibold text-[14px]">
                                Motivo: {composeReason}
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
                                className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold text-md', variant.avatarColorClass(selectedStudent?.avatarColor))}
                              >
                                {selectedStudent?.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-white text-[15px]">
                                  {selectedStudent?.name}
                                </p>
                                <p className="text-indigo-600 dark:text-indigo-300 font-semibold text-xs leading-tight">
                                  {composeReason}
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
                          {composeReason === "Otros" && (
                            <div>
                              <label className="block text-[13px] font-extrabold text-slate-700 dark:text-slate-300 mb-2.5 mt-2">
                                Motivo de la citación
                              </label>
                              <textarea
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder:text-gray-400 resize-none min-h-[90px]"
                                placeholder="Escriba el detalle del motivo por el cual cita al estudiante..."
                                autoFocus
                                value={customComposeReason}
                                onChange={(e) =>
                                  setCustomComposeReason(e.target.value)
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
                                setSelectedStudent(null);
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
                                setSelectedStudent(null);
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
                                  composeStep === 1 && !selectedStudent
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
                            const updatedCitations = items.map((c) =>
                              c.id === realizadoModal.citationId
                                ? { ...c, status: "closed" as any }
                                : c,
                            );
                            setItems(updatedCitations);
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
