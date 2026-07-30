import type { CalendarEvent } from '@/types';

/** Helpers de presentación y de fechas para el calendario. */

export const getEventColor = (type: CalendarEvent["type"]) => {
  switch (type) {
    case "feriado":
      return "bg-rose-500";
    case "incidencia":
      return "bg-rose-500";
    case "vacaciones":
      return "bg-amber-400";
    case "otros":
      return "bg-yellow-400";
    case "academico":
      return "bg-blue-600";
    case "gestion":
      return "bg-purple-500";
    default:
      return "bg-cyan-500"; // civico
  }
};

export const getEventBadgeStyles = (type: CalendarEvent["type"]) => {
  switch (type) {
    case "feriado":
      return "bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 text-slate-900 dark:text-slate-100";
    case "incidencia":
      return "bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 text-slate-900 dark:text-slate-100";
    case "vacaciones":
      return "bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 text-slate-900 dark:text-slate-100";
    case "otros":
      return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 text-slate-900 dark:text-slate-100";
    case "academico":
      return "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 text-slate-900 dark:text-slate-100";
    case "gestion":
      return "bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800 text-slate-900 dark:text-slate-100";
    default:
      return "bg-cyan-50 border-cyan-200 dark:bg-cyan-900/30 dark:border-cyan-800 text-slate-900 dark:text-slate-100"; // civico
  }
};

export const getDaysInMonth = (monthIndex: number, year: number) =>
  new Date(year, monthIndex + 1, 0).getDate();
export const getFirstDayOfMonth = (monthIndex: number, year: number) =>
  new Date(year, monthIndex, 1).getDay();
