import React, { useState } from 'react';
import { IdCard, Search, X } from 'lucide-react';

import type { AppliedFilterChip } from '@/components/common/AppliedFilterChips';
import { AppliedFilterChips } from '@/components/common/AppliedFilterChips';
import { FiltersPopover } from '@/components/common/FiltersPopover';
import { LabeledSelect } from '@/components/common/LabeledSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { UsersFilters } from '@/features/users/hooks/useUsersFilters';
import { gradesForLevel, sectionsForGrade } from '@/features/users/users.form';
import { ALL, LEVEL_OPTIONS, ROLE_META } from '@/features/users/users.constants';

/**
 * Barra de trabajo sobre la tabla: búsqueda, filtros y las acciones que
 * dependen de lo que se está listando. Es una barra fija — no entra en el
 * scroll de la tabla — para que los filtros sigan a la vista mientras se
 * recorre la lista.
 *
 * Los filtros viven aquí, junto al buscador, y no en la barra lateral: son la
 * misma tarea —acotar la lista que se tiene delante— y separarlos obligaba a
 * cruzar la pantalla para hacer una sola cosa. Son el mismo botón y el mismo
 * panel de Citaciones (`FiltersPopover`), no una fila propia de desplegables:
 * cuatro selects siempre abiertos ocupaban media pantalla y hacían que la
 * tabla empezara más abajo.
 */

/** Borrador del panel: lo elegido antes de pulsar «Aplicar filtros». */
interface FilterDraft {
  level: string;
  grade: string;
  section: string;
  status: string;
}

export const UsersToolbar: React.FC<{
  filters: UsersFilters;
  onDownloadCarnets: () => void;
}> = ({ filters, onDownloadCarnets }) => {
  const showClassroomFilters = ROLE_META[filters.role].hasClassroom;
  // El carnet QR es del estudiante: nadie más lo lleva, así que el botón solo
  // existe cuando la lista en pantalla es la de estudiantes.
  const showCarnets = filters.role === 'Estudiante';

  const applied: FilterDraft = {
    level: filters.level,
    grade: filters.grade,
    section: filters.section,
    status: filters.status,
  };

  const [draft, setDraft] = useState<FilterDraft>(applied);

  // Quitar un filtro del que dependen otros arrastra a los que quedarían
  // huérfanos: sin nivel no hay grado posible, y sin grado no hay sección.
  // `setLevel`/`setGrade` ya hacen esa cascada.
  const chips: AppliedFilterChip[] = [
    ...(showClassroomFilters
      ? [
          {
            key: 'level',
            label: 'Nivel',
            value: filters.level,
            clear: () => filters.setLevel(ALL),
          },
          {
            key: 'grade',
            label: 'Grado',
            value: filters.grade,
            clear: () => filters.setGrade(ALL),
          },
          {
            key: 'section',
            label: 'Sección',
            value: filters.section,
            clear: () => filters.setSection(ALL),
          },
        ]
      : []),
    {
      key: 'status',
      label: 'Estado',
      value: filters.status,
      clear: () => filters.setStatus(ALL),
    },
  ].filter((chip) => chip.value !== ALL);

  const clearAllApplied = () => {
    filters.setLevel(ALL);
    filters.setStatus(ALL);
  };

  const applyDraft = () => {
    filters.setLevel(draft.level);
    filters.setGrade(draft.grade);
    filters.setSection(draft.section);
    filters.setStatus(draft.status);
  };

  const draftCount = (
    showClassroomFilters
      ? [draft.level, draft.grade, draft.section, draft.status]
      : [draft.status]
  ).filter((value) => value !== ALL).length;

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
            aria-hidden
          />
          <Input
            type="search"
            value={filters.search}
            onChange={(event) => filters.setSearch(event.target.value)}
            placeholder="Buscar por nombre, DNI, código o correo…"
            aria-label="Buscar usuarios"
            className="h-12 rounded-xl pl-12 pr-12 text-base shadow-sm"
          />
          {filters.search !== '' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Borrar la búsqueda"
                  onClick={() => filters.setSearch('')}
                  className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 rounded-lg"
                >
                  <X size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Borrar la búsqueda</TooltipContent>
            </Tooltip>
          )}
        </div>

        <FiltersPopover
          title="Filtrar usuarios"
          appliedCount={chips.length}
          draftCount={draftCount}
          onOpen={() => setDraft(applied)}
          onClearDraft={() =>
            setDraft({ level: ALL, grade: ALL, section: ALL, status: ALL })
          }
          onApply={applyDraft}
        >
          {showClassroomFilters && (
            <>
              <LabeledSelect
                id="filtro-nivel"
                label="Nivel educativo"
                value={draft.level}
                options={LEVEL_OPTIONS}
                onChange={(level) => setDraft({ ...draft, level, grade: ALL, section: ALL })}
                allValue={ALL}
                allLabel="Todos"
              />
              <LabeledSelect
                id="filtro-grado"
                label="Grado"
                value={draft.grade}
                options={draft.level === ALL ? [] : gradesForLevel(draft.level)}
                onChange={(grade) => setDraft({ ...draft, grade, section: ALL })}
                disabled={draft.level === ALL}
                allValue={ALL}
                allLabel="Todos"
              />
              <LabeledSelect
                id="filtro-seccion"
                label="Sección"
                value={draft.section}
                options={
                  draft.level === ALL || draft.grade === ALL
                    ? []
                    : sectionsForGrade(draft.level, draft.grade)
                }
                onChange={(section) => setDraft({ ...draft, section })}
                disabled={draft.grade === ALL}
                allValue={ALL}
                allLabel="Todos"
              />
            </>
          )}

          <LabeledSelect
            id="filtro-estado"
            label="Estado"
            value={draft.status}
            options={filters.statusOptions}
            onChange={(status) => setDraft({ ...draft, status })}
            allValue={ALL}
            allLabel="Todos"
          />
        </FiltersPopover>

        {showCarnets && (
          <Button
            type="button"
            variant="outline"
            onClick={onDownloadCarnets}
            className="h-12 shrink-0 gap-2 rounded-xl px-5 text-base font-semibold shadow-sm"
          >
            <IdCard size={20} /> Descargar carnets QR
          </Button>
        )}
      </div>

      <AppliedFilterChips chips={chips} onClearAll={clearAllApplied} />
    </div>
  );
};
