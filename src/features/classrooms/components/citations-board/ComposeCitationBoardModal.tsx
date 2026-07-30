import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, BookOpen, CalendarDays, Check, ChevronDown, ChevronRight, Clock, Edit2, Info, Send, X } from 'lucide-react';

import { CustomCalendar } from '@/components/calendar/CustomCalendar';
import type { CITATION_COMPOSE_INCIDENTS } from '@/features/classrooms/data';
import type { CitationsPanelVariant } from '@/features/classrooms/panelVariants';
import { cn } from '@/lib/utils';
import { UserItem } from '@/types';

type ComposeReason = "Incidencias" | "Rendimiento Académico" | "Otros";

/**
 * Modal "Redactar" del panel de citaciones: wizard de 3 pasos (estudiante y
 * motivo, selección de incidencias, agendamiento).
 */
export const ComposeCitationBoardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  variant: CitationsPanelVariant;
  students: UserItem[];
  selectedStudent: UserItem | null;
  setSelectedStudent: (student: UserItem | null) => void;
  composeStep: number;
  setComposeStep: (step: number) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  composeReason: ComposeReason;
  setComposeReason: (reason: ComposeReason) => void;
  customComposeReason: string;
  setCustomComposeReason: (value: string) => void;
  schedDate: string;
  setSchedDate: (value: string) => void;
  schedTime: string;
  setSchedTime: (value: string) => void;
  dummyIncidentsList: typeof CITATION_COMPOSE_INCIDENTS;
  selectedIncidentsForCitation: string[];
  toggleIncidentSelection: (id: string) => void;
  toggleAllIncidents: () => void;
  onSend: () => void;
}> = ({
  isOpen,
  onClose,
  variant,
  students,
  selectedStudent,
  setSelectedStudent,
  composeStep,
  setComposeStep,
  onPrevStep,
  onNextStep,
  composeReason,
  setComposeReason,
  customComposeReason,
  setCustomComposeReason,
  schedDate,
  setSchedDate,
  schedTime,
  setSchedTime,
  dummyIncidentsList,
  selectedIncidentsForCitation,
  toggleIncidentSelection,
  toggleAllIncidents,
  onSend,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
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
                onClick={onClose}
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
                    onClick={onClose}
                    className="font-extrabold text-[#041e49] dark:text-slate-300 hover:opacity-70 transition-opacity"
                  >
                    Cancelar
                  </button>
                ) : composeStep === 3 ? (
                  <button
                    onClick={onPrevStep}
                    className="font-extrabold text-[#041e49] dark:text-slate-300 hover:opacity-70 transition-opacity"
                  >
                    Atrás
                  </button>
                ) : (
                  <button
                    onClick={onClose}
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
                      onClick={onNextStep}
                      disabled={
                        composeStep === 1 && !selectedStudent
                      }
                      className="px-8 py-2.5 rounded-xl font-extrabold bg-[#acabf3] text-white hover:bg-indigo-400 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                      Continuar
                    </button>
                  ) : (
                    <button
                      onClick={onSend}
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
  );
};
