import React, { useMemo } from 'react';
import { SlidersHorizontal, Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
  CATEGORY_OPTIONS,
  GRADE_OPTIONS,
  LEVEL_OPTIONS,
  SECTION_OPTIONS,
  STATUS_TABS,
} from '../citations.constants';
import type { CitationCategoryFilter, CitationStatusFilter } from '../types';

/** Búsqueda y filtros de la lista de citaciones, agrupados en un único botón "Filtros". */
export const CitationsFiltersBar: React.FC<{
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedStatusTab: CitationStatusFilter;
  onStatusTabChange: (value: CitationStatusFilter) => void;
  selectedLevel: string;
  onLevelChange: (value: string) => void;
  selectedGrade: string;
  onGradeChange: (value: string) => void;
  selectedSection: string;
  onSectionChange: (value: string) => void;
  selectedCategory: CitationCategoryFilter;
  onCategoryChange: (value: CitationCategoryFilter) => void;
}> = ({
  searchTerm,
  onSearchTermChange,
  selectedStatusTab,
  onStatusTabChange,
  selectedLevel,
  onLevelChange,
  selectedGrade,
  onGradeChange,
  selectedSection,
  onSectionChange,
  selectedCategory,
  onCategoryChange,
}) => {
  const dropdownTriggerClass = 'h-10 rounded-lg border-transparent bg-slate-100 text-sm dark:bg-slate-800';

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedLevel !== 'Todos') count++;
    if (selectedGrade !== 'Todos') count++;
    if (selectedSection !== 'Todos') count++;
    if (selectedCategory !== 'Todos') count++;
    return count;
  }, [selectedLevel, selectedGrade, selectedSection, selectedCategory]);

  const clearFilters = () => {
    onLevelChange('Todos');
    onGradeChange('Todos');
    onSectionChange('Todos');
    onCategoryChange('Todos');
  };

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-slate-100 bg-white p-3 dark:border-slate-800/60 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        {/* Búsqueda */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            type="text"
            placeholder="Buscar alumno o apoderado"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="h-10 rounded-xl border-transparent bg-slate-100 pl-9 text-sm dark:bg-slate-800"
          />
        </div>

        {/* Filtros agrupados */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 shrink-0 gap-2 rounded-xl border-transparent bg-slate-100 text-sm font-semibold dark:bg-slate-800"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge className="h-5 min-w-5 justify-center rounded-full bg-primary px-1 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Filtrar citaciones</h4>
              {activeFiltersCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-10 gap-1 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                >
                  <X className="w-4 h-4" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Nivel, grado, sección y motivo */}
            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedLevel} onValueChange={onLevelChange}>
                <SelectTrigger className={dropdownTriggerClass}>
                  <SelectValue>{selectedLevel === 'Todos' ? 'Nivel' : selectedLevel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {LEVEL_OPTIONS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedGrade} onValueChange={onGradeChange}>
                <SelectTrigger className={dropdownTriggerClass}>
                  <SelectValue>{selectedGrade === 'Todos' ? 'Grado' : selectedGrade}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {GRADE_OPTIONS.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSection} onValueChange={onSectionChange}>
                <SelectTrigger className={dropdownTriggerClass}>
                  <SelectValue>{selectedSection === 'Todos' ? 'Sección' : selectedSection}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {SECTION_OPTIONS.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedCategory}
                onValueChange={(value) => onCategoryChange(value as CitationCategoryFilter)}
              >
                <SelectTrigger className={dropdownTriggerClass}>
                  <SelectValue>{selectedCategory === 'Todos' ? 'Motivo' : selectedCategory}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Estado: fuera del popover, siempre visible bajo el buscador */}
      <div className="hidden-scrollbar flex gap-1.5 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            type="button"
            variant={selectedStatusTab === tab.value ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onStatusTabChange(tab.value)}
            className={cn(
              'h-10 shrink-0 rounded-xl px-3 text-xs font-semibold',
              selectedStatusTab !== tab.value &&
                'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
