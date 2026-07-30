import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, BookOpen, CalendarDays, Check, CheckCircle2, Inbox, MessageSquare, MoreVertical, Plus, Search, XCircle } from 'lucide-react';

import { CitationCard } from '@/features/classrooms/components/citations-board/CitationCard';
import { CitationsFiltersBar } from '@/features/classrooms/components/citations-board/CitationsFiltersBar';
import { CitationsSidebarNav } from '@/features/classrooms/components/citations-board/CitationsSidebarNav';
import { ComposeCitationBoardModal } from '@/features/classrooms/components/citations-board/ComposeCitationBoardModal';
import { MarkCitationDoneModal } from '@/features/classrooms/components/citations-board/MarkCitationDoneModal';
import { RescheduleCitationModal } from '@/features/classrooms/components/citations-board/RescheduleCitationModal';
import { CITATION_COMPOSE_INCIDENTS } from '@/features/classrooms/data';
import type { CitationsPanelVariant } from '@/features/classrooms/panelVariants';
import type { CitationItem } from '@/features/classrooms/types';
import { getMonthFromName } from '@/features/classrooms/utils';
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
    if (selectedIncidentsForCitation.length === CITATION_COMPOSE_INCIDENTS.length) {
      setSelectedIncidentsForCitation([]);
    } else {
      setSelectedIncidentsForCitation(CITATION_COMPOSE_INCIDENTS.map((i) => i.id));
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

  const closeComposeModal = () => {
    setIsComposeModalOpen(false);
    setSelectedStudent(null);
    setComposeStep(1);
  };

  const openComposeModal = () => {
    setIsComposeModalOpen(true);
    setComposeStep(1);
    setSelectedStudent(null);
    setComposeReason("Incidencias");
    setSchedDate("");
    setSchedTime("");
    setSelectedIncidentsForCitation([]);
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
          <CitationsSidebarNav
            variant={variant}
            sidebarTab={sidebarTab}
            onTabChange={(tab) => {
              setSidebarTab(tab);
              setSelectedStudent(null);
            }}
            onCompose={openComposeModal}
            pendingCount={inProcess.length}
            confirmedCount={confirmed.length}
          />

          {/* Main Content wrapper */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col min-w-0 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800/50">
            {/* Global Filters Bar */}
            <CitationsFiltersBar
              filterReasonList={filterReasonList}
              onReasonChange={setFilterReasonList}
              filterGrade={filterGrade}
              onGradeChange={setFilterGrade}
              filterMonth={filterMonth}
              onMonthChange={setFilterMonth}
            />

            <div className="p-6 sm:p-10 flex-1 flex flex-col w-full h-full">
              {/* En Proceso List */}
              {sidebarTab === "Pendientes" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-8 w-full pt-2">
                  <div className="flex flex-col gap-4 w-full">
                    {inProcess.map((c) => (
                      <CitationCard
                        key={c.id}
                        citation={c}
                        variant={variant}
                        isExpanded={expandedCitations.includes(c.id)}
                        onToggle={() => toggleCitation(c.id)}
                        reasonChipClassName={cn(
                          'text-[13px] w-fit px-3 py-1.5 rounded-lg font-bold tracking-wide',
                          variant.reasonChipClass(c.theme),
                        )}
                        defaultHora="10:00 AM"
                        footer={
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
                        }
                      />
                    ))}
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
                    {confirmed.map((c) => (
                      <CitationCard
                        key={c.id}
                        citation={c}
                        variant={variant}
                        isExpanded={expandedCitations.includes(c.id)}
                        onToggle={() => toggleCitation(c.id)}
                        reasonChipClassName="text-[13px] w-fit px-3 py-1.5 rounded-lg font-bold tracking-wide bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        defaultHora="08:00 AM"
                        footer={
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
                        }
                      />
                    ))}
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
              <RescheduleCitationModal
                isOpen={rescheduleModal.isOpen}
                citation={rescheduleModal.citation}
                variant={variant}
                reschedDate={reschedDate}
                onRescheduleDateChange={handleRescheduleDateChange}
                reschedDateError={reschedDateError}
                reschedTime={reschedTime}
                setReschedTime={setReschedTime}
                reschedReason={reschedReason}
                setReschedReason={setReschedReason}
                onClose={() =>
                  setRescheduleModal({ isOpen: false, citation: null })
                }
                onConfirm={handleReschedule}
              />

              {/* Compose Modal */}
              <ComposeCitationBoardModal
                isOpen={isComposeModalOpen}
                onClose={closeComposeModal}
                variant={variant}
                students={students}
                selectedStudent={selectedStudent}
                setSelectedStudent={setSelectedStudent}
                composeStep={composeStep}
                setComposeStep={setComposeStep}
                onPrevStep={handlePrevStep}
                onNextStep={handleNextStep}
                composeReason={composeReason}
                setComposeReason={setComposeReason}
                customComposeReason={customComposeReason}
                setCustomComposeReason={setCustomComposeReason}
                schedDate={schedDate}
                setSchedDate={setSchedDate}
                schedTime={schedTime}
                setSchedTime={setSchedTime}
                dummyIncidentsList={CITATION_COMPOSE_INCIDENTS}
                selectedIncidentsForCitation={selectedIncidentsForCitation}
                toggleIncidentSelection={toggleIncidentSelection}
                toggleAllIncidents={toggleAllIncidents}
                onSend={handleSendCitation}
              />

              {/* Realizado Modal */}
              <MarkCitationDoneModal
                isOpen={realizadoModal.isOpen}
                onClose={() =>
                  setRealizadoModal({ isOpen: false, citationId: null })
                }
                onConfirm={() => {
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
