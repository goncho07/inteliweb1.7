import React from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SCHOOL_YEAR_END, SCHOOL_YEAR_START } from '@/data/calendar';
import { canStepMonth, getMonthLabel, isSameMonth } from '@/features/classrooms/overview.period';
import { cn } from '@/lib/utils';

/** Cada mes con clases del año escolar, para el salto directo del desplegable. */
const SCHOOL_MONTHS: Date[] = (() => {
  const months: Date[] = [];
  const cursor = new Date(SCHOOL_YEAR_START.getFullYear(), SCHOOL_YEAR_START.getMonth(), 1);
  const end = new Date(SCHOOL_YEAR_END.getFullYear(), SCHOOL_YEAR_END.getMonth(), 1);
  while (cursor <= end) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
})();

/**
 * Selector de mes único de la ficha de alumno: gobierna a la vez el
 * calendario de Asistencia y el historial de Incidencias, así que vive una
 * sola vez en la cabecera del panel en lugar de repetirse en cada tarjeta.
 *
 * El nombre del mes es también un desplegable ("Agosto 2026 ⌄") para saltar
 * a cualquier mes del año escolar en un clic, en vez de tener que pulsar la
 * flecha varias veces.
 */
export const MonthNavigator: React.FC<{
  cursor: Date;
  onStep: (direction: 1 | -1) => void;
  onJump: (month: Date) => void;
  className?: string;
}> = ({ cursor, onStep, onJump, className }) => {
  const canGoBack = canStepMonth(cursor, -1);
  const canGoForward = canStepMonth(cursor, 1);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          'flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 p-1 dark:border-slate-700',
          className,
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Mes anterior"
              onClick={() => onStep(-1)}
              disabled={!canGoBack}
              className="h-10 w-10 shrink-0 rounded-lg"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mes anterior</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              aria-label="Elegir mes"
              className="h-10 shrink-0 gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-bold text-slate-800 dark:text-white"
            >
              <CalendarDays size={18} strokeWidth={2} className="text-slate-500 dark:text-slate-400" />
              {getMonthLabel(cursor)}
              <ChevronDown size={16} strokeWidth={2} className="text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="max-h-72 w-48 overflow-y-auto rounded-xl">
            {SCHOOL_MONTHS.map((month) => (
              <DropdownMenuItem
                key={month.toISOString()}
                onClick={() => onJump(month)}
                className={cn(
                  'h-10 cursor-pointer rounded-lg text-sm',
                  isSameMonth(month, cursor) && 'bg-primary/10 font-semibold text-primary',
                )}
              >
                {getMonthLabel(month)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Mes siguiente"
              onClick={() => onStep(1)}
              disabled={!canGoForward}
              className="h-10 w-10 shrink-0 rounded-lg"
            >
              <ChevronRight size={20} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mes siguiente</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
