import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, Layers, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FolderAccordionSection {
  key: string;
  label: string;
  count: number;
}

export interface FolderAccordionGroup {
  key: string;
  label: string;
  totalCount: number;
  sections: FolderAccordionSection[];
}

/**
 * Árbol de carpetas de dos niveles (grado → sección) para elegir un aula sin
 * pasos de navegación intermedios: cada grado es un acordeón que, al abrirse,
 * muestra sus secciones como filas seleccionables. Empieza siempre con todas
 * las carpetas cerradas — usado por Reportes y Aulas.
 */
export const FolderAccordion: React.FC<{
  groups: FolderAccordionGroup[];
  selectedKey: string | null;
  onSelectSection: (groupKey: string, sectionKey: string) => void;
  allSectionsRow?: { key: string; label: string };
  totalCountLabel?: (count: number) => string;
}> = ({ groups, selectedKey, onSelectSection, allSectionsRow, totalCountLabel = (n) => `${n} est.` }) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  const expandAll = () => setOpenGroups(Object.fromEntries(groups.map((g) => [g.key, true])));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Carpetas por grado
        </p>
        <Button
          type="button"
          variant="link"
          onClick={expandAll}
          className="h-10 px-2 text-xs font-semibold text-blue-700 dark:text-blue-400"
        >
          Ver todo
        </Button>
      </div>

      <div className="space-y-2">
        {groups.map((group) => {
          const isOpen = !!openGroups[group.key];
          return (
            <div key={group.key} className="rounded-xl border border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => toggleGroup(group.key)}
                aria-expanded={isOpen}
                className="h-11 w-full justify-between gap-2 rounded-xl px-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {isOpen ? (
                    <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-slate-400" />
                  )}
                  <span className="truncate text-sm font-bold text-slate-800 dark:text-white">{group.label}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {totalCountLabel(group.totalCount)}
                </span>
              </Button>

              {isOpen && (
                <div className="space-y-1 border-t border-slate-100 p-2 dark:border-slate-800">
                  {allSectionsRow && (
                    <FolderRow
                      icon={Layers}
                      label={allSectionsRow.label}
                      count={group.totalCount}
                      selected={selectedKey === `${group.key}-${allSectionsRow.key}`}
                      onClick={() => onSelectSection(group.key, allSectionsRow.key)}
                    />
                  )}
                  {group.sections.map((section) => (
                    <FolderRow
                      key={section.key}
                      icon={Folder}
                      label={section.label}
                      count={section.count}
                      selected={selectedKey === `${group.key}-${section.key}`}
                      onClick={() => onSelectSection(group.key, section.key)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FolderRow: React.FC<{
  icon: LucideIcon;
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, count, selected, onClick }) => (
  <Button
    type="button"
    variant="ghost"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      'h-10 w-full justify-between gap-2 rounded-lg px-3 text-left',
      selected
        ? 'bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50',
    )}
  >
    <span className="flex min-w-0 items-center gap-2">
      <Icon size={16} strokeWidth={2} className="shrink-0" />
      <span className={cn('truncate text-sm', selected ? 'font-semibold' : 'font-medium')}>{label}</span>
    </span>
    <span
      className={cn(
        'shrink-0 rounded-full px-2 py-0.5 text-xs font-bold',
        selected
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      )}
    >
      {count}
    </span>
  </Button>
);
