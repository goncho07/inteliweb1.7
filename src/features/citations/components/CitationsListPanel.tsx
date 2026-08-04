import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';

import { ModuleSidebar } from '@/components/layout/ModuleShell';

import { CitationListItem } from './CitationListItem';
import { CitationsFiltersBar } from './CitationsFiltersBar';
import type { Citation, CitationCategoryFilter, CitationStatusFilter } from '../types';

/** Columna izquierda del módulo de Citaciones: cabecera, filtros y lista seleccionable. */
export const CitationsListPanel: React.FC<{
  citations: Citation[];
  activeCitationId: number | null;
  onSelectCitation: (id: number) => void;
  getUnreadCount?: (id: number) => number;
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
}> = ({ citations, activeCitationId, onSelectCitation, getUnreadCount, ...filterProps }) => {
  return (
    // El panel de detalle ya no se apila debajo en móvil (se abre como bottom
    // sheet aparte), así que aquí la lista ocupa todo el alto disponible en
    // lugar de quedarse recortada al `max-h-[45vh]` pensado para módulos
    // con panel apilado.
    <ModuleSidebar title="Citaciones" icon={Mail} className="h-full max-h-none lg:h-auto">
      <CitationsFiltersBar {...filterProps} />

      {/* Lista */}
      <div className="hidden-scrollbar flex-1 overflow-y-auto">
        {citations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-slate-400 dark:text-slate-500">
            <MessageSquare className="h-8 w-8" strokeWidth={2} />
            <p className="text-sm font-semibold">No hay citaciones con estos filtros</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Prueba a cambiar el estado, el nivel o el motivo seleccionados.
            </p>
          </div>
        ) : (
          citations.map((c) => (
            <CitationListItem
              key={c.id}
              citation={c}
              isSelected={c.id === activeCitationId}
              unreadCount={getUnreadCount?.(c.id) ?? 0}
              onSelect={() => onSelectCitation(c.id)}
            />
          ))
        )}
      </div>
    </ModuleSidebar>
  );
};
