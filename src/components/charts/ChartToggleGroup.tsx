import React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChartToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ChartToggleGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ChartToggleOption<T>[];
  ariaLabel: string;
}

/**
 * Selector de 2-3 vistas para la cabecera de una tarjeta del panel Inicio
 * (mismo patrón que el Mes/Semana/Día del Calendario, en tamaño reducido
 * para caber junto al icono y el título de la tarjeta).
 */
export function ChartToggleGroup<T extends string>({ value, onChange, options, ariaLabel }: ChartToggleGroupProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex shrink-0 flex-wrap items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            'h-auto rounded-lg px-2.5 py-1.5 text-sm font-bold transition-colors hover:bg-transparent',
            value === option.value
              ? 'bg-white text-blue-700 shadow-sm hover:bg-white dark:bg-slate-700 dark:text-blue-400 dark:hover:bg-slate-700'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
