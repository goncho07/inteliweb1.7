import React, { useState } from 'react';
import { Search } from 'lucide-react';

import type { AppliedFilterChip } from '@/components/common/AppliedFilterChips';
import { AppliedFilterChips } from '@/components/common/AppliedFilterChips';
import { FiltersPopover } from '@/components/common/FiltersPopover';
import { LabeledSelect } from '@/components/common/LabeledSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import {
  CATEGORY_OPTIONS,
  LEVEL_OPTIONS,
  STATUS_TABS,
  gradesForLevel,
  sectionsForGrade,
} from '../citations.constants';
import type { CitationCategoryFilter, CitationStatusFilter } from '../types';

/**
 * Búsqueda y filtros de la lista de citaciones.
 *
 * Los cuatro filtros viven en el panel flotante común (`FiltersPopover`), con
 * la cascada nivel → grado → sección aplicada de verdad. Antes los cuatro se
 * veían igual de activos y ofrecían combinaciones que no existen
 * («Secundaria» + «6°»), y la etiqueta hacía de valor, así que no se
 * distinguía un filtro puesto de uno vacío.
 */

/** Valor de un filtro sin usar. */
const ALL = 'Todos';

interface FilterDraft {
  level: string;
  grade: string;
  section: string;
  category: CitationCategoryFilter;
}

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
  const applied: FilterDraft = {
    level: selectedLevel,
    grade: selectedGrade,
    section: selectedSection,
    category: selectedCategory,
  };

  const [draft, setDraft] = useState<FilterDraft>(applied);

  // Quitar un filtro del que dependen otros arrastra a los que quedarían
  // huérfanos: sin nivel no hay grado posible, y sin grado no hay sección.
  const clearLevel = () => {
    onLevelChange(ALL);
    onGradeChange(ALL);
    onSectionChange(ALL);
  };

  const clearGrade = () => {
    onGradeChange(ALL);
    onSectionChange(ALL);
  };

  const clearAllApplied = () => {
    clearLevel();
    onCategoryChange(ALL);
  };

  // Las fichas de fuera del panel: un filtro aplicado, con cómo quitarlo.
  const appliedChips: AppliedFilterChip[] = [
    { key: 'level', label: 'Nivel', value: selectedLevel, clear: clearLevel },
    { key: 'grade', label: 'Grado', value: selectedGrade, clear: clearGrade },
    { key: 'section', label: 'Sección', value: selectedSection, clear: () => onSectionChange(ALL) },
    { key: 'category', label: 'Motivo', value: selectedCategory, clear: () => onCategoryChange(ALL) },
  ].filter((chip) => chip.value !== ALL);

  const applyDraft = () => {
    onLevelChange(draft.level);
    onGradeChange(draft.grade);
    onSectionChange(draft.section);
    onCategoryChange(draft.category);
  };

  const draftFiltersCount = Object.values(draft).filter((value) => value !== ALL).length;

  return (
    <div className="flex shrink-0 flex-col gap-3 border-b border-slate-100 bg-white p-3 dark:border-slate-800/60 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        {/* Búsqueda */}
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-400"
            aria-hidden
          />
          {/* El placeholder largo se cortaba en el sidebar de 340px ("Buscar
              alumno o apodera…"): va corto, y la frase completa queda en el
              `aria-label` para el lector de pantalla. */}
          <Input
            type="search"
            placeholder="Buscar citación"
            aria-label="Buscar por alumno o apoderado"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="h-11 rounded-xl pl-11 text-base shadow-sm"
          />
        </div>

        {/* Filtros agrupados: el mismo botón y panel que Usuarios */}
        <FiltersPopover
          title="Filtrar citaciones"
          appliedCount={appliedChips.length}
          draftCount={draftFiltersCount}
          onOpen={() => setDraft(applied)}
          onClearDraft={() => setDraft({ level: ALL, grade: ALL, section: ALL, category: ALL })}
          onApply={applyDraft}
          className="h-11"
        >
          <LabeledSelect
            id="citaciones-nivel"
            label="Nivel"
            value={draft.level}
            options={LEVEL_OPTIONS}
            onChange={(level) => setDraft({ ...draft, level, grade: ALL, section: ALL })}
            allValue={ALL}
            allLabel="Todos"
          />
          <LabeledSelect
            id="citaciones-grado"
            label="Grado"
            value={draft.grade}
            options={gradesForLevel(draft.level)}
            onChange={(grade) => setDraft({ ...draft, grade, section: ALL })}
            disabled={draft.level === ALL}
            allValue={ALL}
            allLabel="Todos"
          />
          <LabeledSelect
            id="citaciones-seccion"
            label="Sección"
            value={draft.section}
            options={sectionsForGrade(draft.level, draft.grade)}
            onChange={(section) => setDraft({ ...draft, section })}
            disabled={draft.grade === ALL}
            allValue={ALL}
            allLabel="Todos"
          />
          <LabeledSelect
            id="citaciones-motivo"
            label="Motivo"
            value={draft.category}
            options={CATEGORY_OPTIONS}
            onChange={(category) =>
              setDraft({ ...draft, category: category as CitationCategoryFilter })
            }
            allValue={ALL}
            allLabel="Todos"
          />
        </FiltersPopover>
      </div>

      <AppliedFilterChips chips={appliedChips} onClearAll={clearAllApplied} />

      {/*
        Estado: fuera del panel, siempre visible bajo el buscador. Se envuelve
        en varias filas en vez de desplazarse en horizontal: con
        `overflow-x-auto` y la barra oculta, las últimas pestañas quedaban
        cortadas contra el borde y no había ninguna señal visible de que se
        podía desplazar — descubrimiento por exploración, justo lo que la guía
        prohíbe.
      */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            type="button"
            variant={selectedStatusTab === tab.value ? 'default' : 'secondary'}
            onClick={() => onStatusTabChange(tab.value)}
            className={cn(
              'h-10 shrink-0 rounded-xl px-3 text-sm font-semibold',
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
