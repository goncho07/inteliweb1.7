import React from 'react';
import { Bell, CheckCircle2, ChevronLeft, ChevronRight, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MONTHS } from '@/features/classrooms/constants';
import type { AttendanceCalendarDay } from '@/features/classrooms/types';

/** Tarjeta de asistencia mensual (mapa de calor) de `StudentDetail`. */
export const AttendanceHeatmapCard: React.FC<{
  selectedMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  calendarData: (AttendanceCalendarDay | null)[];
  onOpenNotifications: () => void;
  onDownloadAttendance: () => void;
  onDayClick: (record: AttendanceCalendarDay) => void;
  /** Justificar una falta/tardanza es una acción del docente: el apoderado solo consulta. */
  canJustify?: boolean;
}> = ({
  selectedMonth,
  onPrevMonth,
  onNextMonth,
  calendarData,
  onOpenNotifications,
  onDownloadAttendance,
  onDayClick,
  canJustify = true,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
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
          <TooltipProvider>
            <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onPrevMonth}
                    aria-label="Mes anterior"
                    className="h-10 w-10 rounded-lg text-slate-600 dark:text-slate-300 [&_svg]:size-4"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mes anterior</TooltipContent>
              </Tooltip>
              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 min-w-[60px] sm:min-w-[80px] text-center">
                {MONTHS.find((m) => m.value === selectedMonth)?.label}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onNextMonth}
                    aria-label="Mes siguiente"
                    className="h-10 w-10 rounded-lg text-slate-600 dark:text-slate-300 [&_svg]:size-4"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mes siguiente</TooltipContent>
              </Tooltip>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={onOpenNotifications}
                  aria-label="Ver notificaciones de asistencia"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm [&_svg]:size-4 sm:[&_svg]:size-5"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ver notificaciones de asistencia</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={onDownloadAttendance}
                  aria-label="Descargar asistencia"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm [&_svg]:size-4 sm:[&_svg]:size-5"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Descargar asistencia</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="p-4 sm:p-6 flex-1 bg-white dark:bg-slate-900">
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
            (day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"
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
                  canJustify && !record.isWeekend && onDayClick(record)
                }
                className={`relative aspect-square rounded-xl ${record.isWeekend ? "bg-slate-50/80 dark:bg-slate-800/50 text-slate-400 font-bold" : record.color} group ${canJustify && !record.isWeekend && (record.originalStatus === "Falta" || record.originalStatus === "Tardanza") ? "cursor-pointer hover:ring-2 hover:ring-blue-400" : "cursor-help"} transition-transform hover:scale-105 flex items-center justify-center`}
              >
                <span className="text-lg font-bold">
                  {record.dayNumber}
                </span>
                {!record.isWeekend && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-xl backdrop-blur-sm z-10">
                    <span className="text-white text-xs font-bold text-center leading-tight px-1">
                      {record.status}
                      {canJustify &&
                        (record.originalStatus === "Falta" ||
                          record.originalStatus === "Tardanza") &&
                        !record.status.includes("Justificada") && (
                          <span className="block text-xs text-blue-300 mt-1">
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
  );
};
