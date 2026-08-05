import React from 'react';
import { AlertTriangle, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PersonalIncidentEntry } from '@/features/classrooms/types';

/** Tarjeta de incidencias personales (con paginación) de `StudentDetail`. */
export const PersonalIncidentsCard: React.FC<{
  paginatedIncidents: PersonalIncidentEntry[];
  hasIncidents: boolean;
  incidentsPage: number;
  totalIncidentPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  faltasCount: number;
  tardanzasCount: number;
  onDownloadIncidents: () => void;
}> = ({
  paginatedIncidents,
  hasIncidents,
  incidentsPage,
  totalIncidentPages,
  onPrevPage,
  onNextPage,
  faltasCount,
  tardanzasCount,
  onDownloadIncidents,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
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
            {faltasCount}{" "}
            <span className="hidden md:inline">Faltas</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-bold border border-amber-200 dark:border-amber-800 shadow-sm">
            <Clock className="w-4 h-4" />
            {tardanzasCount}{" "}
            <span className="hidden md:inline">Tardanzas</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  onClick={onDownloadIncidents}
                  aria-label="Descargar incidencias"
                  className="h-10 w-10 rounded-xl shadow-sm"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Descargar incidencias</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="p-4 flex-1 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col">
        {hasIncidents ? (
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
                          className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${isSevere ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}
                        >
                          {incident.type.category}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                        {incident.description}
                      </p>
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
                    </div>
                  </div>
                );
              })}
            </div>
            {totalIncidentPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrevPage}
                  disabled={incidentsPage === 1}
                  className="h-10 gap-2 rounded-xl px-4 font-bold"
                >
                  <ChevronLeft size={20} /> Anterior
                </Button>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Página {incidentsPage} de {totalIncidentPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onNextPage}
                  disabled={incidentsPage === totalIncidentPages}
                  className="h-10 gap-2 rounded-xl px-4 font-bold"
                >
                  Siguiente <ChevronRight size={20} />
                </Button>
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
  );
};
