import React from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { canStepMonth, getMonthLabel, isSameMonth } from '@/features/classrooms/overview.period';

import { DownloadReportMenu } from './DownloadReportMenu';

/**
 * Fila inferior de la Vista General del Aula: navegador de mes (‹ Marzo 2026
 * ›), botón "Hoy" para volver al mes en curso, buscador de alumno y descarga.
 * No hay selector de periodo: los reportes del colegio siempre son mensuales.
 */
export const OverviewPeriodBar: React.FC<{
  cursor: Date;
  today: Date;
  onStep: (direction: 1 | -1) => void;
  onToday: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  downloadDisabled: boolean;
  onDownload: (format: 'pdf' | 'csv') => void;
}> = ({ cursor, today, onStep, onToday, search, onSearchChange, downloadDisabled, onDownload }) => {
  // Ya estando en el mes en curso, "Hoy" no tendría nada que hacer: se
  // deshabilita en vez de quedarse como un botón que no responde.
  const isCurrentMonth = isSameMonth(cursor, today);
  // El año escolar va de marzo a diciembre: en los extremos la flecha no lleva
  // a ningún sitio, así que se deshabilita en vez de no responder.
  const canGoBack = canStepMonth(cursor, -1);
  const canGoForward = canStepMonth(cursor, 1);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 dark:border-slate-800/60 dark:bg-slate-900 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 dark:border-slate-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Mes anterior"
                  onClick={() => onStep(-1)}
                  disabled={!canGoBack}
                  className="h-10 w-10 rounded-lg"
                >
                  <ChevronLeft size={20} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mes anterior</TooltipContent>
            </Tooltip>
            <span className="min-w-[130px] whitespace-nowrap px-2 text-center text-sm font-bold text-slate-800 dark:text-white">
              {getMonthLabel(cursor)}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Mes siguiente"
                  onClick={() => onStep(1)}
                  disabled={!canGoForward}
                  className="h-10 w-10 rounded-lg"
                >
                  <ChevronRight size={20} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mes siguiente</TooltipContent>
            </Tooltip>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onToday}
            disabled={isCurrentMonth}
            className="h-11 gap-2 rounded-xl px-4 text-sm font-semibold"
          >
            <CalendarCheck size={20} strokeWidth={2} /> Hoy
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar alumno por nombre…"
              aria-label="Buscar alumno por nombre"
              className="h-11 rounded-xl pl-10"
            />
          </div>

          <DownloadReportMenu disabled={downloadDisabled} onDownload={onDownload} />
        </div>
      </div>
    </TooltipProvider>
  );
};
