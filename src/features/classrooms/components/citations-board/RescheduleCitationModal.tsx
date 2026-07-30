import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Clock, Send, X } from 'lucide-react';

import { CustomCalendar } from '@/components/calendar/CustomCalendar';
import type { CitationsPanelVariant } from '@/features/classrooms/panelVariants';
import type { CitationItem } from '@/features/classrooms/types';
import { cn } from '@/lib/utils';

/** Modal de reprogramación de una citación pendiente. */
export const RescheduleCitationModal: React.FC<{
  isOpen: boolean;
  citation: CitationItem | null;
  variant: CitationsPanelVariant;
  reschedDate: string;
  onRescheduleDateChange: (value: string) => void;
  reschedDateError: string;
  reschedTime: string;
  setReschedTime: (value: string) => void;
  reschedReason: string;
  setReschedReason: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}> = ({
  isOpen,
  citation,
  variant,
  reschedDate,
  onRescheduleDateChange,
  reschedDateError,
  reschedTime,
  setReschedTime,
  reschedReason,
  setReschedReason,
  onClose,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
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
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div
                  className={cn('w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg', variant.avatarColorClass(citation?.avatarColor))}
                >
                  {citation?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight">
                    {citation?.name}
                  </p>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">
                    Motivo original:{" "}
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {citation?.reason}
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
                      onChange={onRescheduleDateChange}
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
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Guardar y Notificar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
