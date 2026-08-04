import React from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DropdownFilterProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

/** Dropdown simple de selección única, usado en las columnas filtrables de la tabla de usuarios. */
export const DropdownFilter: React.FC<DropdownFilterProps> = ({
  label,
  options,
  value,
  onChange,
  isOpen,
  onToggle,
}) => {
  const hasValue = value !== 'Todos' && value !== '';

  return (
    <DropdownMenu open={isOpen} onOpenChange={onToggle}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-10 w-40 justify-between gap-1.5 rounded-xl px-3 text-xs font-bold uppercase tracking-wider shadow-sm [&_svg]:size-4',
            hasValue
              ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          )}
        >
          <span className="truncate">{hasValue ? value : label}</span>
          <ChevronDown size={16} className={cn('shrink-0 transition-transform', isOpen && 'rotate-180')} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 rounded-xl p-1">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onSelect={() => onChange(value === opt ? 'Todos' : opt)}
            className={cn(
              'h-10 cursor-pointer justify-between rounded-lg px-3 text-sm font-medium',
              value === opt
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300',
            )}
          >
            {opt}
            {value === opt && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
