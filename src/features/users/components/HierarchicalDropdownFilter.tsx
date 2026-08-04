import React from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface HierarchicalDropdownFilterProps {
  selectedLevel: string;
  setSelectedLevel: (value: string) => void;
  selectedGrade: string;
  setSelectedGrade: (value: string) => void;
  selectedSection: string;
  setSelectedSection: (value: string) => void;
  gradeOptions: string[];
  sectionOptions: string[];
  isOpen: boolean;
  onToggle: () => void;
}

const LEVEL_OPTIONS = ['Inicial', 'Primaria', 'Secundaria'];

/** Dropdown en cascada (Nivel → Grado → Sección) usado en la columna de aula de la tabla de usuarios. */
export const HierarchicalDropdownFilter: React.FC<HierarchicalDropdownFilterProps> = ({
  selectedLevel,
  setSelectedLevel,
  selectedGrade,
  setSelectedGrade,
  selectedSection,
  setSelectedSection,
  gradeOptions,
  sectionOptions,
  isOpen,
  onToggle,
}) => {
  let currentStep: 'level' | 'grade' | 'section' = 'level';
  if (selectedLevel !== 'Todos' && selectedGrade === 'Todos') currentStep = 'grade';
  if (selectedGrade !== 'Todos') currentStep = 'section';

  let buttonLabel = 'Nivel / Aula';
  if (selectedSection !== 'Todos') buttonLabel = `${selectedGrade.replace(' Grado', '')} ${selectedSection}`;
  else if (selectedGrade !== 'Todos') buttonLabel = selectedGrade.replace(' Grado', '');
  else if (selectedLevel !== 'Todos') buttonLabel = selectedLevel;

  return (
    <Popover open={isOpen} onOpenChange={onToggle}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-10 w-48 justify-between gap-1.5 rounded-xl px-3 text-xs font-bold uppercase tracking-wider shadow-sm [&_svg]:size-4',
            selectedLevel !== 'Todos'
              ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          )}
        >
          <span className="truncate">{buttonLabel}</span>
          <ChevronDown size={16} className={cn('shrink-0 transition-transform', isOpen && 'rotate-180')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 overflow-hidden rounded-xl p-1">
        {currentStep === 'grade' && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSelectedLevel('Todos')}
            className="mb-1 h-10 w-full justify-start gap-1 rounded-lg border-b border-slate-100 px-3 text-xs font-bold text-slate-500 hover:text-blue-600 dark:border-slate-700 [&_svg]:size-4"
          >
            <ChevronLeft size={16} /> Volver a Niveles
          </Button>
        )}
        {currentStep === 'section' && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSelectedGrade('Todos')}
            className="mb-1 h-10 w-full justify-start gap-1 rounded-lg border-b border-slate-100 px-3 text-xs font-bold text-slate-500 hover:text-blue-600 dark:border-slate-700 [&_svg]:size-4"
          >
            <ChevronLeft size={16} /> Volver a Grados
          </Button>
        )}

        <div className="max-h-60 overflow-y-auto">
          {currentStep === 'level' &&
            LEVEL_OPTIONS.map((opt) => (
              <Button
                key={opt}
                type="button"
                variant="ghost"
                onClick={() => setSelectedLevel(opt)}
                className="h-10 w-full justify-between rounded-lg px-3 text-sm font-medium text-slate-600 dark:text-slate-300 [&_svg]:size-4"
              >
                {opt}
                <ChevronRight size={16} className="text-slate-400" />
              </Button>
            ))}

          {currentStep === 'grade' &&
            gradeOptions.map((opt) => (
              <Button
                key={opt}
                type="button"
                variant="ghost"
                onClick={() => setSelectedGrade(opt)}
                className="h-10 w-full justify-between rounded-lg px-3 text-sm font-medium text-slate-600 dark:text-slate-300 [&_svg]:size-4"
              >
                {opt.replace(' Grado', '')}
                <ChevronRight size={16} className="text-slate-400" />
              </Button>
            ))}

          {currentStep === 'section' &&
            sectionOptions.map((opt) => (
              <Button
                key={opt}
                type="button"
                variant="ghost"
                onClick={() => {
                  setSelectedSection(selectedSection === opt ? 'Todos' : opt);
                  onToggle();
                }}
                className={cn(
                  'h-10 w-full justify-between rounded-lg px-3 text-sm font-medium [&_svg]:size-4',
                  selectedSection === opt
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300',
                )}
              >
                Sección {opt}
                {selectedSection === opt && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
              </Button>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
