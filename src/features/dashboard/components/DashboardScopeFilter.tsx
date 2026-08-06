import React, { useState } from 'react';

import { FiltersPopover } from '@/components/common/FiltersPopover';
import { LabeledSelect } from '@/components/common/LabeledSelect';

import { ALL_SCOPE, FULL_SCHOOL_SCOPE, type DashboardScope, type ScopeStructure } from '../dashboard.constants';

/**
 * Filtro de ámbito del panel Inicio: nivel → grado → sección, en cascada. Es
 * el mismo botón y el mismo panel de Usuarios y Citaciones (`FiltersPopover`),
 * no un control propio del panel — acotar lo que se está viendo se hace igual
 * en toda la app. Vive en la cabecera del panel, junto a los gráficos que
 * cambia, y no en la barra lateral: ahí el bimestre es navegación (elegir un
 * periodo), y mezclarlo con un filtro los haría parecer lo mismo.
 *
 * Las opciones no son fijas: salen de `structure`, que un directivo recibe
 * completa y un docente recortada a sus propias aulas (`buildScopeStructure`).
 * El control es el mismo para los dos; lo que cambia es qué hay dentro.
 *
 * Se aplica al confirmar, no al vuelo: cuatro gráficos redibujándose con cada
 * clic dentro del panel es justo lo que `FiltersPopover` evita.
 */
export const DashboardScopeFilter: React.FC<{
  scope: DashboardScope;
  /** Niveles, grados y secciones que este usuario puede elegir. */
  structure: ScopeStructure;
  onApply: (scope: DashboardScope) => void;
}> = ({ scope, structure, onApply }) => {
  const [draft, setDraft] = useState<DashboardScope>(scope);

  const levels = Object.keys(structure);
  const grades = draft.level === ALL_SCOPE ? [] : Object.keys(structure[draft.level] ?? {});
  const sections =
    draft.level === ALL_SCOPE || draft.grade === ALL_SCOPE ? [] : (structure[draft.level]?.[draft.grade] ?? []);

  const draftCount = [draft.level, draft.grade, draft.section].filter((value) => value !== ALL_SCOPE).length;
  const appliedCount = [scope.level, scope.grade, scope.section].filter((value) => value !== ALL_SCOPE).length;

  return (
    <FiltersPopover
      title="Filtrar los gráficos por aula"
      appliedCount={appliedCount}
      draftCount={draftCount}
      onOpen={() => setDraft(scope)}
      onClearDraft={() => setDraft(FULL_SCHOOL_SCOPE)}
      onApply={() => onApply(draft)}
      className="h-10"
    >
      <LabeledSelect
        id="inicio-nivel"
        label="Nivel educativo"
        value={draft.level}
        options={levels}
        onChange={(level) => setDraft({ level, grade: ALL_SCOPE, section: ALL_SCOPE })}
        allValue={ALL_SCOPE}
        allLabel="Todos"
      />
      <LabeledSelect
        id="inicio-grado"
        label="Grado"
        value={draft.grade}
        options={grades}
        onChange={(grade) => setDraft({ ...draft, grade, section: ALL_SCOPE })}
        disabled={draft.level === ALL_SCOPE}
        hint="Elige primero un nivel."
        allValue={ALL_SCOPE}
        allLabel="Todos"
      />
      <LabeledSelect
        id="inicio-seccion"
        label="Sección"
        value={draft.section}
        options={sections}
        onChange={(section) => setDraft({ ...draft, section })}
        disabled={draft.grade === ALL_SCOPE}
        hint="Elige primero un grado."
        allValue={ALL_SCOPE}
        allLabel="Todos"
      />
    </FiltersPopover>
  );
};
