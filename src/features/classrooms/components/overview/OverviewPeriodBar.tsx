import React from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getPeriodLabel, PERIOD_TABS, periodHasNavigation, type PeriodId } from '@/features/classrooms/overview.period';
import { cn } from '@/lib/utils';

import { DownloadReportMenu } from './DownloadReportMenu';

/**
 * Fila inferior de la Vista General del Aula: navegador de periodo (‹ Marzo
 * 2026 ›), pestañas Hoy/Día/Semana/Mes/Bimestre, buscador de alumno y el
 * botón de descarga. El navegador desaparece en "Hoy": no hay nada que
 * mostrar como anterior/siguiente para un día fijo.
 */
export const OverviewPeriodBar: React.FC<{
  period: PeriodId;
  onPeriodChange: (period: PeriodId) => void;
  cursor: Date;
  today: Date;
  onStep: (direction: 1 | -1) => void;
  search: string;
  onSearchChange: (value: string) => void;
  downloadDisabled: boolean;
  onDownload: (format: 'pdf' | 'csv') => void;
}> = ({ period, onPeriodChange, cursor, today, onStep, search, onSearchChange, downloadDisabled, onDownload }) => (
  <TooltipProvider delayDuration={200}>
    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 dark:border-slate-800/60 dark:bg-slate-900 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 dark:border-slate-700">
          {periodHasNavigation(period) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Periodo anterior"
                  onClick={() => onStep(-1)}
                  className="h-10 w-10 rounded-lg"
                >
                  <ChevronLeft size={20} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Periodo anterior</TooltipContent>
            </Tooltip>
          )}
          <span className="whitespace-nowrap px-2 text-sm font-bold text-slate-800 dark:text-white">
            {getPeriodLabel(period, cursor, today)}
          </span>
          {periodHasNavigation(period) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Periodo siguiente"
                  onClick={() => onStep(1)}
                  className="h-10 w-10 rounded-lg"
                >
                  <ChevronRight size={20} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Periodo siguiente</TooltipContent>
            </Tooltip>
          )}
        </div>

        <Tabs value={period} onValueChange={(value) => onPeriodChange(value as PeriodId)}>
          <TabsList className="h-12 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {PERIOD_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  'h-10 rounded-lg px-3 text-sm font-semibold text-slate-600 shadow-none dark:text-slate-300',
                  'data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400',
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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
