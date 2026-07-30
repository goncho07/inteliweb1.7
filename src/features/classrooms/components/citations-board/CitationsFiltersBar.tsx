import React from 'react';
import { ChevronDown } from 'lucide-react';

type ReasonFilter = "Todos" | "Incidencias" | "Académico" | "Otros";

/** Barra de filtros superior del panel de citaciones: motivo, aula y mes. */
export const CitationsFiltersBar: React.FC<{
  filterReasonList: ReasonFilter;
  onReasonChange: (value: ReasonFilter) => void;
  filterGrade: string;
  onGradeChange: (value: string) => void;
  filterMonth: string;
  onMonthChange: (value: string) => void;
}> = ({
  filterReasonList,
  onReasonChange,
  filterGrade,
  onGradeChange,
  filterMonth,
  onMonthChange,
}) => {
  return (
    <div className="px-6 sm:px-10 pt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Left side: Reason Tabs */}
        <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-full xl:max-w-md border border-slate-200 dark:border-slate-700 shadow-sm items-center h-[50px]">
          <button
            onClick={() => onReasonChange("Todos")}
            className={`flex-1 h-full font-bold rounded-lg text-[15px] flex justify-center items-center gap-2 transition-colors ${filterReasonList === "Todos" ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow shadow-slate-200/50 dark:shadow-none" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
          >
            Todos
          </button>
          <button
            onClick={() => onReasonChange("Incidencias")}
            className={`flex-1 h-full font-bold rounded-lg text-[15px] flex justify-center items-center gap-2 transition-colors ${filterReasonList === "Incidencias" ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow shadow-slate-200/50 dark:shadow-none" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
          >
            Incidencias
          </button>
          <button
            onClick={() => onReasonChange("Académico")}
            className={`flex-1 h-full font-bold rounded-lg text-[15px] flex justify-center items-center gap-2 transition-colors ${filterReasonList === "Académico" ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow shadow-slate-200/50 dark:shadow-none" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
          >
            Académico
          </button>
          <button
            onClick={() => onReasonChange("Otros")}
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
              onChange={(e) => onGradeChange(e.target.value)}
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
              onChange={(e) => onMonthChange(e.target.value)}
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
  );
};
