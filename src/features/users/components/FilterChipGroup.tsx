import React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterChipOption {
  value: string;
  label: string;
  color?: string;
}

interface FilterChipGroupProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterChipOption[];
  disabled?: boolean;
  defaultColor?: string;
}

const getColorClasses = (colorName: string) => {
  switch (colorName) {
    case 'amber':
      return 'bg-amber-500 text-white shadow-md shadow-amber-500/20 hover:bg-amber-500';
    case 'indigo':
      return 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500';
    case 'pink':
      return 'bg-pink-500 text-white shadow-md shadow-pink-500/20 hover:bg-pink-500';
    case 'emerald':
      return 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500';
    case 'purple':
      return 'bg-purple-500 text-white shadow-md shadow-purple-500/20 hover:bg-purple-500';
    case 'blue':
    default:
      return 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-600';
  }
};

/** Grupo de chips seleccionables usado en el modal de generación de carnets por lote. */
export const FilterChipGroup: React.FC<FilterChipGroupProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  defaultColor = 'blue',
}) => {
  return (
    <div className={cn('flex flex-col gap-3', disabled && 'pointer-events-none opacity-50')}>
      {label && (
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const activeClass = getColorClasses(opt.color || defaultColor);
          return (
            <Button
              key={opt.value}
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              aria-pressed={isSelected}
              className={cn(
                'rounded-xl px-4 text-xs font-bold transition-all',
                isSelected
                  ? activeClass
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700',
              )}
            >
              {opt.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
