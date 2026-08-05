import React from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/** Un filtro puesto y cómo quitarlo. */
export interface AppliedFilterChip {
  key: string;
  label: string;
  value: string;
  clear: () => void;
}

/**
 * Los filtros aplicados, a la vista y quitables uno a uno, debajo del buscador.
 * Acompaña siempre a `FiltersPopover`: lo que se elige dentro del panel se lee
 * fuera, sin tener que volver a abrirlo para saber qué está filtrando.
 */
export const AppliedFilterChips: React.FC<{
  chips: AppliedFilterChip[];
  onClearAll: () => void;
}> = ({ chips, onClearAll }) => {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Tooltip key={chip.key}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={chip.clear}
              aria-label={`Quitar el filtro ${chip.label}: ${chip.value}`}
              className="h-10 gap-2 rounded-full bg-slate-100 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {chip.label}: {chip.value}
              <X size={16} aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Quitar este filtro</TooltipContent>
        </Tooltip>
      ))}
      <Button
        type="button"
        variant="ghost"
        onClick={onClearAll}
        className="h-10 rounded-xl px-3 text-sm font-semibold text-primary"
      >
        Limpiar todo
      </Button>
    </div>
  );
};
