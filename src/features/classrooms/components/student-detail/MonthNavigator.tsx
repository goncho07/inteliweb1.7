import React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { canStepMonth, getMonthLabel } from '@/features/classrooms/overview.period';
import { cn } from '@/lib/utils';

/**
 * Selector de mes único de la ficha de alumno: gobierna a la vez el
 * calendario de Asistencia y el historial de Incidencias, así que vive una
 * sola vez en la cabecera del panel en lugar de repetirse en cada tarjeta.
 *
 * Solo flechas: el mes se recorre de a uno, sin un desplegable para saltar
 * directo a cualquier mes del año escolar — un control de menos que aprender
 * en una pantalla que ya tiene el mes bien visible en el centro.
 */
export const MonthNavigator: React.FC<{
  cursor: Date;
  onStep: (direction: 1 | -1) => void;
  className?: string;
}> = ({ cursor, onStep, className }) => {
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

        <span className="flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-bold text-slate-800 dark:text-white">
          <CalendarDays size={18} strokeWidth={2} className="text-slate-500 dark:text-slate-400" />
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
