import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import type { CitationsPanelVariant } from '@/features/classrooms/panelVariants';
import type { CitationItem } from '@/features/classrooms/types';
import { formatCitationSchedule } from '@/features/classrooms/utils';
import { cn } from '@/lib/utils';

/**
 * Tarjeta expandible de una citación, compartida por las listas "Pendientes"
 * y "Confirmadas" de `CitationsBoardPanel`. Lo que difiere entre ambas listas
 * (clase del chip de motivo, valor de hora por defecto y acciones del pie) se
 * recibe por props para no alterar el comportamiento de cada pestaña.
 */
export const CitationCard: React.FC<{
  citation: CitationItem;
  variant: CitationsPanelVariant;
  isExpanded: boolean;
  onToggle: () => void;
  reasonChipClassName: string;
  defaultHora: string;
  footer: React.ReactNode;
}> = ({
  citation: c,
  variant,
  isExpanded,
  onToggle,
  reasonChipClassName,
  defaultHora,
  footer,
}) => {
  const { dateStr, timeStr } = formatCitationSchedule(c.scheduledDate);

  let badge = null;
  if (dateStr.includes("20")) {
    badge = (
      <span className={cn('px-2 py-0.5 rounded text-[10px] uppercase font-black', variant.badgeClass)}>
        HOY
      </span>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700/80 rounded-xl flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all w-full overflow-hidden">
      <button
        onClick={onToggle}
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
                    <span className={reasonChipClassName}>
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
                      ?.trim() || defaultHora}
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

              {footer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
