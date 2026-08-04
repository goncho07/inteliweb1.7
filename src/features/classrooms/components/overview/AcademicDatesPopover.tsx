import React from 'react';
import { CalendarDays } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EVENTS_2026, MONTH_NAMES, YEAR } from '@/data/calendar';

const ACADEMIC_DATES = Object.entries(EVENTS_2026)
  .flatMap(([key, events]) =>
    events
      .filter((event) => event.type === 'academico')
      .map((event) => {
        const [monthIndex, day] = key.split('-').map(Number);
        return { date: new Date(YEAR, monthIndex, day), label: event.label };
      }),
  )
  .sort((a, b) => a.date.getTime() - b.date.getTime());

/**
 * Botón "Fechas 2026": abre un resumen de los hitos académicos del año
 * (inicio/fin de bimestre) tomados de `EVENTS_2026`, la misma fuente que usa
 * el módulo Calendario — no es un botón decorativo.
 */
export const AcademicDatesPopover: React.FC = () => (
  <Popover>
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Ver fechas académicas ${YEAR}`}
              className="h-10 w-10 shrink-0 rounded-xl"
            >
              <CalendarDays size={20} strokeWidth={2} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Fechas académicas {YEAR}</TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <PopoverContent align="end" className="w-80 rounded-2xl p-4">
      <p className="text-sm font-bold text-slate-800 dark:text-white">Calendario académico {YEAR}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Inicio y fin de cada bimestre escolar.</p>

      <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
        {ACADEMIC_DATES.map((item, index) => (
          <li key={index} className="flex items-start gap-3 rounded-xl border border-slate-100 p-2 dark:border-slate-800">
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <span className="text-sm font-bold leading-none">{item.date.getDate()}</span>
              <span className="text-xs font-bold uppercase leading-none">{MONTH_NAMES[item.date.getMonth()].slice(0, 3)}</span>
            </div>
            <p className="pt-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</p>
          </li>
        ))}
      </ul>
    </PopoverContent>
  </Popover>
);
